function getRAVGBurnPerimeterLayer(startYear, endYear) {
    let perimsRAVG = ee.FeatureCollection("projects/gtac-ravg/assets/RAVG_perimeters/RAVG_perims"); //ee.FeatureCollection('projects/USFS/DAS/MTBS/mtbs_perims_DD');

    const inRAVGFields = [
        "FIRE_NAME",
        "EVENT_ID",
        "FIRE_YEAR",
        "ACRES",
        "Pre-Image Year"
    ];

    const outRAVGFields = [
        "Fire Name",
        "RAVG Event ID",
        "Fire Year",
        "Acres",
        "Pre-Image Year"
    ];

    let label = "RAVG Burn Perimeters";
    let tooltip = "Delineated perimeters of each RAVG mapped fire from " +
        startYear.toString() +
        "-" +
        endYear.toString() +
        ". ";

    perimsRAVG = perimsRAVG.map(function (f) {
        const d = ee.Date(f.get("PREIMGYMD"));
        const formatted = d.format("YYYY-MM-dd");
        return f.set({
            Year: d.get("year"),
            "Pre-Image Year": formatted,
        });
    });

    perimsRAVG = perimsRAVG.select(inRAVGFields, outRAVGFields);
    perimsRAVG = perimsRAVG.set("bounds", clientBoundsDict.All);

    //add layer to map in RAVG DATA section
    Map.addLayer(
        perimsRAVG,
        {
            styleParams: {
                color: "00F",
                fillColor: "0000",
                width: 2,
                lineType: "dashed",
            },
        },
        label,
        true,
        null,
        null,
        tooltip + "Areas can have multiple mapped fires."
    );

    //add layer to map in TOOLS -> Select an Area on Map section
    Map.addSelectLayer(
        perimsRAVG,
        {
            strokeColor: "00F",
            selectLayerNameProperty: "FIRE_NAME",
        },
        label,
        false,
        null,
        null,
        tooltip + "Turn on layer and click on any fire wanted to include in chart"
    );
}

function getRAVGBA7AndNLCD(studyAreaName, whichLayerList, showSeverity) {
    if (showSeverity === null || showSeverity === undefined) {
        showSeverity = false;
    }
    if (mtbsSummaryMethod === null || mtbsSummaryMethod === undefined) {
        mtbsSummaryMethod = "Highest-Severity";
    }

    const ravg_ba7_path = "projects/gtac-ravg/assets/RAVG_annual_mosaics/BA7_annual_mosaics";
    let ravgEndYear = endYear;
    const ravgYears = ee.List.sequence(2012, ravgEndYear);
    ravgBA7 = ee.ImageCollection(ravg_ba7_path);
    ravgBA7 = ravgYears.map(function (yr) {
        const ravgYr = ravgBA7
            .filter(ee.Filter.calendarRange(yr, yr, "year"))
            .mosaic();
        return ravgYr.set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis());
    });
    ravgBA7 = ee.ImageCollection.fromImages(ravgBA7);

    ravgBA7 = ravgBA7.filter(ee.Filter.calendarRange(startYear, ravgEndYear, "year"));

    ravgBA7 = ravgBA7.map(function (img) {
        return img.select([0], ["burnSeverity"]).byte();
    });

    ravgBA7 = ravgBA7.map(function (img) {
        const severityRemapped = img
            .remap([1, 2, 3, 4, 5, 6], [1, 3, 4, 5, 2, 1])
            .rename(["burnSeverityRemap"]);
        let burned = img
            .remap([1, 2, 3, 4, 5, 6], [0, 1, 1, 1, 0, 0])
            .rename(["burnedNotBurned"]);
        burned = burned.selfMask();
        const burnYear = ee
            .Image(ee.Date(img.get("system:time_start")).get("year"))
            .updateMask(severityRemapped.mask())
            .rename("burnYear");
        return img
            .addBands(severityRemapped)
            .addBands(burned)
            .addBands(burned.multiply(-1).rename(["burnYearNegative"]))
            .addBands(burnYear)
            .int16();
    });

    ravgBA7 = ee.ImageCollection(ravgBA7);

    const ravgBA7SummaryDict = {
        "Highest-Severity": "burnSeverityRemap",
        "Most-Recent": "burnYear",
        Oldest: "burnYearNegative",
    };
    const ravgBA7Summarized = ravgBA7.qualityMosaic(ravgBA7SummaryDict[mtbsSummaryMethod]);
    const ravgBA7Count = ravgBA7.select([2]).count();

    const ravgBA7ClassDict = {
        "Unburned to Low": "006400",
        Low: "7fffd4",
        Moderate: "ffff00",
        High: "ff0000",
        "Increased Greenness": "7fff00",
        "Non-Processing Area Mask": "ffffff"
    };

    let ravgBA7QueryClassDict = {};
    let keyI = 1;
    Object.keys(ravgBA7ClassDict).map(function (k) {
        ravgBA7QueryClassDict[keyI] = k;
        keyI++;
    });

    if (chartRAVG === true) {
        let mtbsStack = formatAreaChartCollection(
            ravgBA7.select([0]),
            Object.keys(ravgBA7QueryClassDict),
            Object.values(ravgBA7QueryClassDict),
            true
        );
        areaChartCollections["ravg_ba7"] = {
            collection: mtbsStack,
            colors: Object.values(ravgBA7ClassDict),
            label: "RAVG BA7 Burn Severity by Year",
            stacked: true,
            steppedLine: false,
            chartType: "bar",
            xAxisProperty: "year",
            tooltip: "Chart the RAVG BA7 burn severity by year",
        };
        areaChartCollections["ravg_ba7_burn_mosaic"] = {
            collection: ee.ImageCollection([
                ravgBA7
                    .select([2])
                    .mosaic()
                    .unmask(0)
                    .rename(["Burned"])
                    .set(
                        "Burned",
                        "All Mapped Burned Area (Total of Low, Moderate, and High Severity) " +
                        startYear.toString() +
                        "-" +
                        endYear.toString()
                    ),
            ]),
            colors: ["#CC5500"],
            label:
                "RAVG BA7 Burned Area Total " +
                startYear.toString() +
                "-" +
                endYear.toString(),
            stacked: true,
            steppedLine: false,
            chartType: "bar",
            xAxisProperty: "Burned",
            tooltip:
                "Chart the union of all burned areas (areas with low, moderate, or high severity) " +
                startYear.toString() +
                "-" +
                endYear.toString(),
        };
        areaChartCollections["ravg_burn_severity_ba7_mosaic"] = {
            collection: ee.ImageCollection([
                mtbsStack
                    .max()
                    .unmask(0)
                    .set(
                        "Burned",
                        "BA7 Burn Severity Total " +
                        startYear.toString() +
                        "-" +
                        endYear.toString()
                    ),
            ]),
            colors: Object.values(ravgBA7ClassDict),
            label:
                "RAVG BA7 Burn Severity Total " +
                startYear.toString() +
                "-" +
                endYear.toString(),
            stacked: true,
            steppedLine: false,
            chartType: "bar",
            xAxisProperty: "Burned",
            tooltip:
                "Chart the union of BA7 burn severity " +
                startYear.toString() +
                "-" +
                endYear.toString() +
                ". The maximum severity is used when fires overlap. ",
        };
    }
    let ravgBA7MaxSeverity = ravgBA7.select([0]).max();
    let nlcdObj;
    if (chartRAVGByNLCD) {
        nlcdObj = getNLCDObj();

        Map.addTimeLapse(
            nlcdObj.collection,
            {
                min: nlcdObj.min,
                max: nlcdObj.max,
                palette: Object.values(nlcdObj.vizDict),
                addToClassLegend: true,
                classLegendDict: nlcdObj.legendDictReverse,
                queryDict: nlcdObj.queryDict,
                years: nlcdObj.years,
            },
            "NLCD Land Cover Time Lapse",
            false,
            null,
            null,
            "NLCD landcover classes ",
            "reference-layer-list"
        );

        nlcdObj.years.map(function (nlcdYear) {
            const nlcdT = nlcdObj.collection
                .filter(ee.Filter.calendarRange(nlcdYear, nlcdYear, "year"))
                .mosaic();
            let mtbsByNLCD = Object.keys(nlcdObj.queryDict).map(function (k) {
                const name = nlcdObj.queryDict[k];
                const out = ravgBA7MaxSeverity
                    .updateMask(nlcdT.eq(ee.Number.parse(k)))
                    .set("nlcd_landcover_class", name);
                return out;
            });
            mtbsByNLCD = ee.ImageCollection(mtbsByNLCD);
            let mtbsByNLCDStack = formatAreaChartCollection(
                mtbsByNLCD,
                Object.keys(ravgBA7QueryClassDict),
                Object.values(ravgBA7QueryClassDict),
                true
            );

            areaChartCollections["ravgBA7NLCD" + nlcdYear.toString()] = {
                collection: mtbsByNLCDStack,
                colors: Object.values(ravgBA7ClassDict),
                label: "RAVG BA7 Burn Severity by NLCD Class " + nlcdYear.toString(),
                stacked: true,
                steppedLine: false,
                chartType: "bar",
                xAxisProperty: "nlcd_landcover_class",
                xAxisLabel: "NLCD " + nlcdYear.toString() + " Class",
                tooltip:
                    "Chart RAVG BA7 burn severity by each NLCD " +
                    nlcdYear.toString() +
                    " landcover class",
            };
            // }
        });
    }
    if (chartRAVGByAspect) {
        const aspectObj = getAspectObj();
        const aspectBinned = aspectObj.image;
        const aspectLookupDict = aspectObj.lookupDict.getInfo();
        let mtbsByAspect = Object.keys(aspectLookupDict).map(function (k) {
            const name = aspectLookupDict[k];
            const out = ravgBA7MaxSeverity
                .updateMask(aspectBinned.eq(ee.Number.parse(k)))
                .set("Aspect_Bin", name);
            return out;
        });
        mtbsByAspect = ee.ImageCollection(mtbsByAspect);
        const mtbsByAspectStack = formatAreaChartCollection(
            mtbsByAspect,
            Object.keys(ravgBA7QueryClassDict),
            Object.values(ravgBA7QueryClassDict),
            true
        );

        areaChartCollections["mtbsAspect"] = {
            collection: mtbsByAspectStack,
            colors: Object.values(ravgBA7ClassDict),
            label: "RAVG BA7 Burn Severity by Aspect",
            stacked: true,
            steppedLine: false,
            chartType: "bar",
            xAxisProperty: "Aspect_Bin",
            xAxisLabel: "Aspect Bin",
            tooltip: "Chart RAVG BA7 burn severity by aspect quadrants.",
        };
    }

    const severityViz = {
        queryDict: ravgBA7QueryClassDict,
        min: 1,
        max: 6,
        palette: "006400,7fffd4,ffff00,ff0000,7fff00,ffffff",
        addToClassLegend: true,
        classLegendDict: ravgBA7ClassDict,
    };
    Map.addLayer(
        ravgBA7Summarized.select([0]).set("bounds", clientBoundsDict.All),
        severityViz,
        "RAVG BA7 Burn Severity",
        showSeverity,
        null,
        null,
        "RAVG BA7 " +
        mtbsSummaryMethod +
        " burn severity mosaic from " +
        startYear.toString() +
        "-" +
        ravgEndYear.toString(),
        whichLayerList
    );
    Map.addLayer(
        ravgBA7Summarized.select([4]).set("bounds", clientBoundsDict.All),
        {
            min: startYear,
            max: endYear,
            palette: declineYearPalette,
        },
        "RAVG BA7 Burn Year",
        false,
        null,
        null,
        "RAVG BA7 " +
        mtbsSummaryMethod +
        " burn year from " +
        startYear.toString() +
        "-" +
        ravgEndYear.toString(),
        whichLayerList
    );
    Map.addLayer(
        ravgBA7Count.set("bounds", clientBoundsDict.All),
        {
            min: 1,
            max: 5,
            palette: declineDurPalette.split(",").reverse().join(","),
            legendLabelLeft: "Count =",
            legendLabelRight: "Count >=",
        },
        "RAVG BA7 Burn Count",
        false,
        null,
        null,
        "RAVG BA7 number of burns mapped for a given area from " +
        startYear.toString() +
        "-" +
        ravgEndYear.toString() +
        " with a burn severity class of low, moderate, or high",
        whichLayerList
    );

    const chartTableDict = {
        "Burn Severity - BA7": ravgBA7QueryClassDict,
    };
    return {
        NLCD: nlcdObj,
        RAVGBA7: {
            collection: ravgBA7
                .set("bounds", clientBoundsDict.All)
                .select([0], ["Burn Severity - BA7"])
                .set("chartTableDict", chartTableDict),
        },
        RAVGBA7SeverityViz: severityViz,
    };
}

function getRAVGBA7Layer() {
    const ravgBA7AndNLCD = getRAVGBA7AndNLCD("anc", "layer-list", true);
    const nlcdLCObj = ravgBA7AndNLCD.NLCD;
    const ravgBA7Collection = ravgBA7AndNLCD.RAVGBA7.collection;
    const yearsCli = range(startYear, endYear + 1);
    const chartTableDict = ee.Dictionary(nlcdLCObj.collection.get("chartTableDict"))
        .combine(ravgBA7Collection.get("chartTableDict"))
        .getInfo();
    const nlcdLCFilled = batchFillCollection(nlcdLCObj.collection, yearsCli).map(setSameDate);
    const forCharting = joinCollections(ravgBA7Collection, nlcdLCFilled, false);
    const timeLapseSeverityViz = JSON.parse(JSON.stringify(ravgBA7AndNLCD.RAVGBA7SeverityViz));
    timeLapseSeverityViz.years = yearsCli;

    Map.addTimeLapse(
        ravgBA7Collection,
        timeLapseSeverityViz,
        "RAVG BA7 Burn Severity Time Lapse",
        false
    );

    pixelChartCollections["ravg_ba7"] = {
        label: "RAVG BA7 Time Series",
        collection: forCharting,
        chartTableDict: chartTableDict,
        legends: chartTableDict,
    };
}

function runRAVG() {

    startYear = 2012
    endYear = 2023;

    chartRAVG = true;
    chartRAVGByNLCD = true;
    chartRAVGByAspect = true;

    /*
    shutting this down for now...
    ga("send", "event", "mtbs-viewer-run", "year_range", `${startYear}_${endYear}`);
    */

    //initializes a bunch of global variables.
    getLCMSVariables();

    //adds NAIP Time Lapse layer under REFERENCE DATA
    getNAIP(null, true);

    Map.turnOffLayersWhenTimeLapseIsOn = false;

    getRAVGBA7Layer();
    populateAreaChartDropdown(); //enables the charting panel to pop-up when the Chart Selected Areas is selected.
    populatePixelChartDropdown();
    getSelectLayers(); //enables Tools -> Select and Area on Map 
    getRAVGBurnPerimeterLayer(startYear, endYear);
}