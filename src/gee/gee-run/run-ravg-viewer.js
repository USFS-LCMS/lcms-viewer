function getRAVGBurnPerimeterLayer(startYear, endYear) {
    let perimsRAVG = ee.FeatureCollection("projects/gtac-ravg/assets/RAVG_perimeters/RAVG_perims");

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

function getRAVGSeverityLayerAndNLCD(layer, whichLayerList, showSeverity) {

    if (showSeverity === null || showSeverity === undefined) {
        showSeverity = false;
    }
    if (mtbsSummaryMethod === null || mtbsSummaryMethod === undefined) {
        mtbsSummaryMethod = "Highest-Severity";
    }

    const chartRAVG = true;
    const chartRAVGByNLCD = true;
    const chartRAVGByAspect = true;
    const ravgAsset = "projects/gtac-ravg/assets/RAVG_annual_mosaics/" + layer + "_annual_mosaics";
    const ravgEndYear = endYear;
    const ravgYears = ee.List.sequence(2012, ravgEndYear);

    let severityLayer = ee.ImageCollection(ravgAsset);

    severityLayer = ravgYears.map(function (yr) {
        const ravgYr = severityLayer
            .filter(ee.Filter.calendarRange(yr, yr, "year"))
            .mosaic();
        return ravgYr.set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis());
    });
    severityLayer = ee.ImageCollection.fromImages(severityLayer);
    severityLayer = severityLayer.filter(ee.Filter.calendarRange(startYear, ravgEndYear, "year"));
    severityLayer = severityLayer.map(function (img) {
        return img.select([0], ["burnSeverity"]).byte();
    });
    severityLayer = severityLayer.map(function (img) {
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
    severityLayer = ee.ImageCollection(severityLayer);

    const severityLayerSummaryDict = {
        "Highest-Severity": "burnSeverityRemap",
        "Most-Recent": "burnYear",
        Oldest: "burnYearNegative",
    };
    const severityLayerSummarized = severityLayer.qualityMosaic(severityLayerSummaryDict[mtbsSummaryMethod]);
    const severityLayerCount = severityLayer.select([2]).count();
    const severityLayerClassDict = {
        "Unburned to Low": "006400",
        Low: "7fffd4",
        Moderate: "ffff00",
        High: "ff0000",
        "Increased Greenness": "7fff00",
        "Non-Processing Area Mask": "ffffff"
    };

    let severityLayerQueryClassDict = {};
    let keyI = 1;
    Object.keys(severityLayerClassDict).map(function (k) {
        severityLayerQueryClassDict[keyI] = k;
        keyI++;
    });

    if (chartRAVG === true) {
        let severityLayerStack = formatAreaChartCollection(
            severityLayer.select([0]),
            Object.keys(severityLayerQueryClassDict),
            Object.values(severityLayerQueryClassDict),
            true
        );
        areaChartCollections["ravg_" + layer.toLowerCase()] = {
            collection: severityLayerStack,
            colors: Object.values(severityLayerClassDict),
            label: "RAVG " + layer + " Burn Severity by Year",
            stacked: true,
            steppedLine: false,
            chartType: "bar",
            xAxisProperty: "year",
            tooltip: "Chart the RAVG " + layer + " burn severity by year",
        };
        areaChartCollections["ravg_" + layer.toLowerCase() + "_burn_mosaic"] = {
            collection: ee.ImageCollection([
                severityLayer
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
                "RAVG " + layer + " Burned Area Total " +
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
        areaChartCollections["ravg_burn_severity_" + layer.toLowerCase() + "_mosaic"] = {
            collection: ee.ImageCollection([
                severityLayerStack
                    .max()
                    .unmask(0)
                    .set(
                        "Burned",
                        layer + " Burn Severity Total " +
                        startYear.toString() +
                        "-" +
                        endYear.toString()
                    ),
            ]),
            colors: Object.values(severityLayerClassDict),
            label:
                "RAVG " + layer + " Burn Severity Total " +
                startYear.toString() +
                "-" +
                endYear.toString(),
            stacked: true,
            steppedLine: false,
            chartType: "bar",
            xAxisProperty: "Burned",
            tooltip:
                "Chart the union of " + layer + " burn severity " +
                startYear.toString() +
                "-" +
                endYear.toString() +
                ". The maximum severity is used when fires overlap. ",
        };
    }
    let severityLayerMaxSeverity = severityLayer.select([0]).max();
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
            "NLCD " + layer + " Land Cover Time Lapse",
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
            let severityLayerByNLCD = Object.keys(nlcdObj.queryDict).map(function (k) {
                const name = nlcdObj.queryDict[k];
                const out = severityLayerMaxSeverity
                    .updateMask(nlcdT.eq(ee.Number.parse(k)))
                    .set("nlcd_" + layer + "_landcover_class", name);
                return out;
            });
            severityLayerByNLCD = ee.ImageCollection(severityLayerByNLCD);
            let severityLayerByNLCDStack = formatAreaChartCollection(
                severityLayerByNLCD,
                Object.keys(severityLayerQueryClassDict),
                Object.values(severityLayerQueryClassDict),
                true
            );

            areaChartCollections["ravg" + layer + "NLCD" + nlcdYear.toString()] = {
                collection: severityLayerByNLCDStack,
                colors: Object.values(severityLayerClassDict),
                label: "RAVG " + layer + " Burn Severity by NLCD Class " + nlcdYear.toString(),
                stacked: true,
                steppedLine: false,
                chartType: "bar",
                xAxisProperty: "nlcd_" + layer + "_landcover_class",
                xAxisLabel: "NLCD " + nlcdYear.toString() + " Class",
                tooltip:
                    "Chart RAVG " + layer + " burn severity by each NLCD " +
                    nlcdYear.toString() +
                    " landcover class",
            };
        });
    }
    if (chartRAVGByAspect) {
        const aspectObj = getAspectObj();
        const aspectBinned = aspectObj.image;
        const aspectLookupDict = aspectObj.lookupDict.getInfo();
        let mtbsByAspect = Object.keys(aspectLookupDict).map(function (k) {
            const name = aspectLookupDict[k];
            const out = severityLayerMaxSeverity
                .updateMask(aspectBinned.eq(ee.Number.parse(k)))
                .set("Aspect_Bin", name);
            return out;
        });
        mtbsByAspect = ee.ImageCollection(mtbsByAspect);
        const mtbsByAspectStack = formatAreaChartCollection(
            mtbsByAspect,
            Object.keys(severityLayerQueryClassDict),
            Object.values(severityLayerQueryClassDict),
            true
        );

        areaChartCollections["ravg" + layer + "Aspect"] = {
            collection: mtbsByAspectStack,
            colors: Object.values(severityLayerClassDict),
            label: "RAVG " + layer + " Burn Severity by Aspect",
            stacked: true,
            steppedLine: false,
            chartType: "bar",
            xAxisProperty: "Aspect_Bin",
            xAxisLabel: "Aspect Bin",
            tooltip: "Chart RAVG " + layer + " burn severity by aspect quadrants.",
        };
    }

    const severityViz = {
        queryDict: severityLayerQueryClassDict,
        min: 1,
        max: 6,
        palette: "006400,7fffd4,ffff00,ff0000,7fff00,ffffff",
        addToClassLegend: true,
        classLegendDict: severityLayerClassDict,
    };
    Map.addLayer(
        severityLayerSummarized.select([0]).set("bounds", clientBoundsDict.All),
        severityViz,
        "RAVG " + layer + " Burn Severity",
        showSeverity,
        null,
        null,
        "RAVG " + layer + " " +
        mtbsSummaryMethod +
        " burn severity mosaic from " +
        startYear.toString() +
        "-" +
        ravgEndYear.toString(),
        whichLayerList
    );
    Map.addLayer(
        severityLayerSummarized.select([4]).set("bounds", clientBoundsDict.All),
        {
            min: startYear,
            max: endYear,
            palette: declineYearPalette,
        },
        "RAVG " + layer + " Burn Year",
        false,
        null,
        null,
        "RAVG " + layer + " " +
        mtbsSummaryMethod +
        " burn year from " +
        startYear.toString() +
        "-" +
        ravgEndYear.toString(),
        whichLayerList
    );
    Map.addLayer(
        severityLayerCount.set("bounds", clientBoundsDict.All),
        {
            min: 1,
            max: 5,
            palette: declineDurPalette.split(",").reverse().join(","),
            legendLabelLeft: "Count =",
            legendLabelRight: "Count >=",
        },
        "RAVG " + layer + " Burn Count",
        false,
        null,
        null,
        "RAVG " + layer + " number of burns mapped for a given area from " +
        startYear.toString() +
        "-" +
        ravgEndYear.toString() +
        " with a burn severity class of low, moderate, or high",
        whichLayerList
    );

    const chartTableDict = {
        "Burn Severity": severityLayerQueryClassDict,
    };
    return {
        NLCD: nlcdObj,
        severityLayer: {
            collection: severityLayer
                .set("bounds", clientBoundsDict.All)
                .select([0], [layer + " Burn Severity"])
                .set("chartTableDict", chartTableDict),
        },
        severityViz: severityViz,
    };
}

function getRAVGSeverityLayer(layer) {
    const ravgSeverityLayerAndNLCD = getRAVGSeverityLayerAndNLCD(layer, "layer-list", false);
    const nlcdLCObj = ravgSeverityLayerAndNLCD.NLCD;
    const ravgSeverityLayerCollection = ravgSeverityLayerAndNLCD.severityLayer.collection;
    const yearsCli = range(startYear, endYear + 1);
    const chartTableDict = ee.Dictionary(nlcdLCObj.collection.get("chartTableDict"))
        .combine(ravgSeverityLayerCollection.get("chartTableDict"))
        .getInfo();
    const nlcdLCFilled = batchFillCollection(nlcdLCObj.collection, yearsCli).map(setSameDate);
    const forCharting = joinCollections(ravgSeverityLayerCollection, nlcdLCFilled, false);
    const timeLapseSeverityViz = JSON.parse(JSON.stringify(ravgSeverityLayerAndNLCD.severityViz));
    timeLapseSeverityViz.years = yearsCli;

    Map.addTimeLapse(
        ravgSeverityLayerCollection,
        timeLapseSeverityViz,
        "RAVG " + layer + " Burn Severity Time Lapse",
        false
    );

    pixelChartCollections["ravg_" + layer.toLowerCase()] = {
        label: "RAVG " + layer + " Time Series",
        collection: forCharting,
        chartTableDict: chartTableDict,
        legends: chartTableDict,
    };
}


function buildEVTBinaryLayer(imageLayer, year) {

    let imageBand = imageLayer.select("b1");
    let binaryImage = imageBand.expression('(b(0) == 1) ? 0 : 1', { 'b': imageBand });
    let imageMask = imageBand.mask();
    let maskedBinaryImage = binaryImage.updateMask(imageMask);
    let evtBinaryLayerQueryClassDict = {};
    let keyI = 1;

    const evtBinaryLayerClassDict = {
        "Non - tree (Grassland / Shrubland / Agricultural / Non - vegetation)": "#f7f1c6",
        "Tree": "#285e81",
    };

    Object.keys(evtBinaryLayerClassDict).map(function (k) {
        evtBinaryLayerQueryClassDict[keyI] = k;
        keyI++;
    });

    const evtBinaryViz = {
        queryDict: evtBinaryLayerQueryClassDict,
        min: 0,
        max: 1,
        palette: "#f7f1c6,#285e81",
        addToClassLegend: true,
        classLegendDict: evtBinaryLayerClassDict,
    };

    Map.addLayer(
        maskedBinaryImage, evtBinaryViz, "EVT " + year + " Tree/Non-tree", false, null, null, "EVT " + year + " Tree/Non-tree", "reference-layer-list"
    );

}

function getEVTRefLayer(layer, year) {

    let evtLayer = ee.Image("projects/gtac-ravg/assets/RAVG_veg_class/" + layer);
    let evtLayerQueryClassDict = {};
    let keyI = 1;

    const evtLayerClassDict = {
        "Non - tree (Grassland / Shrubland / Agricultural / Non - vegetation)": "#f7f1c6",
        "Pinyon - Juniper Woodland": "#b3d1c8",
        "Deciduous Open Tree Canopy": "#75b4c5",
        "Evergreen Closed Tree Canopy" : "#3597c2",
        "Evergreen Open Tree Canopy" : "#2e7ba1",
        "Mixed Evergreen - Deciduous Open Tree Canopy" : "#285e81",
        "Deciduous Closed Tree Canopy" : "#233e66",
        "Mixed Evergreen - Deciduous Closed Tree Canopy" : "#1e1950",
    };

    Object.keys(evtLayerClassDict).map(function (k) {
        evtLayerQueryClassDict[keyI] = k;
        keyI++;
    });

    const evtViz = {
        queryDict: evtLayerQueryClassDict,
        min: 1,
        max: 8,
        palette: "#f7f1c6,#b3d1c8,#75b4c5,#3597c2,#2e7ba1,#285e81,#233e66,#1e1950",
        addToClassLegend: true,
        classLegendDict: evtLayerClassDict,
    };

    Map.addLayer(
        evtLayer, evtViz, "EVT " + year + " Vegetation Classes", false, null, null, "EVT " + year + " Vegetation Classes", "reference-layer-list"
    );

    buildEVTBinaryLayer(evtLayer, year);
}

function getEVTRefLayers() {
    getEVTRefLayer("RAVG_VegCode_LF2020_EVT220", "2020");
    getEVTRefLayer("RAVG_VegCode_LF2016_EVT200", "2016");
    getEVTRefLayer("RAVG_VegCode_LF2014_EVT140", "2014");
    getEVTRefLayer("RAVG_VegCode_LF2012_EVT130", "2012");
    getEVTRefLayer("RAVG_VegCode_LF2001_EVT105", "2001");
}

function runRAVG() {

    startYear = 2012
    endYear = 2023;

    Map.turnOffLayersWhenTimeLapseIsOn = false;

    /*
    shutting this down for now...
    ga("send", "event", "mtbs-viewer-run", "year_range", `${startYear}_${endYear}`);
    */

    getLCMSVariables();
    getNAIP(null, true);
    getRAVGSeverityLayer("CBI4");
    getRAVGSeverityLayer("CC5");
    getRAVGSeverityLayer("BA7");
    getEVTRefLayers();
    populateAreaChartDropdown(); //enables the charting panel to pop-up when the Chart Selected Areas is selected.
    populatePixelChartDropdown();
    getSelectLayers(); //enables Tools -> Select and Area on Map 
    getRAVGBurnPerimeterLayer(startYear, endYear);
}