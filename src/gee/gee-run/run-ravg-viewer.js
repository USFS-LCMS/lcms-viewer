function setSeverityLayerPerRefLayerChart(layer, years, imgCollection, refLayerQueryClassDict, severityLayerMaxSeverity, severityLayerQueryClassDict, severityLayerClassDict, refType) {

    years.map(function (year) {
        const className = refType.toLowerCase() + "_" + year + "_" + layer + "_landcover_class";
        const evtT = imgCollection
            .filter(ee.Filter.calendarRange(Number(year), Number(year), "year"))
            .mosaic();
        let severityLayerByEVT = Object.keys(refLayerQueryClassDict).map(function (k) {
            const name = refLayerQueryClassDict[k];
            const out = severityLayerMaxSeverity
                .updateMask(evtT.eq(ee.Number.parse(k)))
                .set(className, name);
            return out;
        });
        severityLayerByEVT = ee.ImageCollection(severityLayerByEVT);
        let severityLayerByEVTStack = formatAreaChartCollection(
            severityLayerByEVT,
            Object.keys(severityLayerQueryClassDict),
            Object.values(severityLayerQueryClassDict),
            true
        );

        areaChartCollections["ravg" + layer + refType + year] = {
            collection: severityLayerByEVTStack,
            colors: Object.values(severityLayerClassDict),
            label: "RAVG " + layer + " Burn Severity by " + refType + " Class " + year,
            stacked: true,
            steppedLine: false,
            chartType: "bar",
            xAxisProperty: className,
            xAxisLabel: refType + " " + year + " Class",
            tooltip:
                "Chart RAVG " + layer + " burn severity by each " + refType + " " +
                year +
                " landcover class",
        };
    });

}


function getImageCollectionFromImages(images) {
    const imageList = ee.List(images);
    return ee.ImageCollection(imageList).sort("system:time_start");
}

/**
 * Loads EVT Veg Class Image asset layers and converts to Binary Tree/non-tree layer. 
 * Adds both versions to Map as both individual layers and as collections for TimeLapses.
 */
function getEVTLayers() {

    const evts = {
        2020: "RAVG_VegCode_LF2020_EVT220",
        2016: "RAVG_VegCode_LF2016_EVT200",
        2014: "RAVG_VegCode_LF2014_EVT140",
        2012: "RAVG_VegCode_LF2012_EVT130",
        2001: "RAVG_VegCode_LF2001_EVT105"
    }
    const placement = "reference-layer-list";
    const assetDirectory = "projects/gtac-ravg/assets/RAVG_veg_class/";

    let vegClassImages = [];
    let vegClassVisualParams;
    let vegClassDict;
    let binaryImages = [];
    let binaryVisualParams;
    let binaryClassDict;

    for (let year in evts) {

        let vcImage = ee.Image(assetDirectory + evts[year]).set("system:time_start", ee.Date.fromYMD(Number(year), 6, 1).millis());
        let vcObj = getEVTVegClassLayer(vcImage, year);
        let vcVisualParams = vcObj.visualParams;
        let vcLabel = vcObj.label;

        //add individual veg class evt layer
        Map.addLayer(vcImage, vcVisualParams, vcLabel, false, null, null, vcLabel, placement);

        if (vegClassVisualParams == undefined) {
            vegClassVisualParams = vcVisualParams;
            vegClassDict = vcObj.classDict;
            vegClassChartTableDict = vcObj;
        }

        let bObj = getEVTBinaryLayer(vcImage, year);
        let bImage = bObj.imageLayer;
        let bVisualParams = bObj.visualParams;
        let bLabel = bObj.label;

        //add individual binary evt layer
        Map.addLayer(bImage, bVisualParams, bLabel, false, null, null, bLabel, placement);

        if (binaryVisualParams == undefined) {
            binaryVisualParams = bVisualParams;
            binaryClassDict = bObj.classDict;
        }

        vegClassImages.push(vcImage);
        binaryImages.push(bImage);

    }

    //convert sets of images to ImageCollections for timelapses
    let vegClassCollection = getImageCollectionFromImages(vegClassImages).set("bounds", clientBoundsDict.All).set("chartTableDict", { "EVT Veg Class Landcover": vegClassVisualParams.queryDict });
    let binaryLayerCollection = getImageCollectionFromImages(binaryImages).set("bounds", clientBoundsDict.All).set("chartTableDict", { "EVT Binary Landcover": binaryVisualParams.queryDict });

    //set veg-class timelapse
    Map.addTimeLapse(
        vegClassCollection,
        vegClassVisualParams,
        "EVT Vegetation Class Land Cover Time Lapse",
        false,
        null,
        null,
        "EVT Vegetation Land Cover Classes",
        placement
    );

    //set binary timelapse
    Map.addTimeLapse(
        binaryLayerCollection,
        binaryVisualParams,
        "EVT Tree/Non-tree Land Cover Time Lapse",
        false,
        null,
        null,
        "EVT Tree/Non-tree Land Cover Classes",
        placement
    );

    return {
        vegClass: {
            collection: vegClassCollection,
            visualParams: vegClassVisualParams,
            classDict: vegClassDict,
            years: Object.keys(evts)
        },
        binary: {
            collection: binaryLayerCollection,
            visualParams: binaryVisualParams,
            classDict: binaryClassDict,
            years: Object.keys(evts)
        }
    }
}

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

function getRAVGSeverityLayerAndRefLayers(layer, whichLayerList, showSeverity) {

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

    let severityLayerClassDict;
    let maxVal;

    if (layer == "BA7") {
        severityLayerClassDict = {
            "0%": "008080",
            "< 10%": "20A8A8",
            "< 25%": "52CCCC",
            "< 50%": "FFE820",
            "< 75%": "FF8020",
            "< 90%": "FF2020",
            "<= 100%": "A80000",
            "Masked/Unmappable": "FFFFFF"
        };
        maxVal = 8;
    } else if (layer == "CC5") {
        severityLayerClassDict = {
            "0%": "008080",
            "< 25%": "52CCCC",
            "< 50%": "FFE820",
            "< 75%": "FF8020",
            "<= 100%": "A80000",
            "Masked/Unmappable": "FFFFFF"
        };
        maxVal = 6;
    } else if (layer == "CBI4") {
        severityLayerClassDict = {
            "Unchanged": "008080",
            "Low Severity": "52CCCC",
            "Moderate Severity": "FFE820",
            "High Severity": "A80000",
            "Masked/Unmappable": "FFFFFF"
        };
        maxVal = 5;
    }

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

        setSeverityLayerPerRefLayerChart(
            layer,
            nlcdObj.years,
            nlcdObj.collection,
            nlcdObj.queryDict,
            severityLayerMaxSeverity,
            severityLayerQueryClassDict,
            severityLayerClassDict,
            "NLCD"
        );
    }

    if (chartRAVGByAspect) {
        const aspectObj = getAspectObj();
        const aspectBinned = aspectObj.image;
        const aspectLookupDict = aspectObj.lookupDict.getInfo();
        let ravgByAspect = Object.keys(aspectLookupDict).map(function (k) {
            const name = aspectLookupDict[k];
            const out = severityLayerMaxSeverity
                .updateMask(aspectBinned.eq(ee.Number.parse(k)))
                .set("Aspect_Bin", name);
            return out;
        });
        ravgByAspect = ee.ImageCollection(ravgByAspect);
        const ravgByAspectStack = formatAreaChartCollection(
            ravgByAspect,
            Object.keys(severityLayerQueryClassDict),
            Object.values(severityLayerQueryClassDict),
            true
        );

        areaChartCollections["ravg" + layer + "Aspect"] = {
            collection: ravgByAspectStack,
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
        //max: 6,
        max: maxVal,
        palette: Object.values(severityLayerClassDict),
        addToClassLegend: true,
        classLegendDict: severityLayerClassDict,
    };

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
        severityViz: severityViz
    };
}

function getRAVGSeverityLayer(layer, evtCollections) {

    const ravgSeverityLayerAndRefLayers = getRAVGSeverityLayerAndRefLayers(layer, "layer-list", false);
    const nlcdLCObj = ravgSeverityLayerAndRefLayers.NLCD;
    const ravgSeverityLayerCollection = ravgSeverityLayerAndRefLayers.severityLayer.collection;
    const yearsCli = range(startYear, endYear + 1);
    const chartTableDict = ee.Dictionary(nlcdLCObj.collection.get("chartTableDict"))
        .combine(ravgSeverityLayerCollection.get("chartTableDict"))
        .getInfo();
    const nlcdLCFilled = batchFillCollection(nlcdLCObj.collection, yearsCli).map(setSameDate);
    const forCharting = joinCollections(ravgSeverityLayerCollection, nlcdLCFilled, false);
    const timeLapseSeverityViz = JSON.parse(JSON.stringify(ravgSeverityLayerAndRefLayers.severityViz));
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

    let maxSeverity = ravgSeverityLayerAndRefLayers.severityLayer.collection.select([0]).max();
    let severityLayerQueryDict = ravgSeverityLayerAndRefLayers.severityViz.queryDict;
    let severityLayerLegendDict = ravgSeverityLayerAndRefLayers.severityViz.classLegendDict;

    setSeverityLayerPerRefLayerChart(
        layer,
        evtCollections.vegClass.years,
        evtCollections.vegClass.collection,
        evtCollections.vegClass.visualParams.queryDict,
        maxSeverity,
        severityLayerQueryDict,
        severityLayerLegendDict,
        "EVT-Vegetation"
    );

    setSeverityLayerPerRefLayerChart(
        layer,
        evtCollections.binary.years,
        evtCollections.binary.collection,
        evtCollections.binary.visualParams.queryDict,
        maxSeverity,
        severityLayerQueryDict,
        severityLayerLegendDict,
        "EVT-Binary"
    );
}

function getEVTVegClassLayer(imgLayer, year) {

    //order of timelapse
    const evtYears = [2001, 2012, 2014, 2016, 2020];
    const vegClassLabel = "EVT " + year.toString()  + " Vegetation Classes";
    const vegClassLayerClassDict = {
        "Non - tree": "#f7f1c6",
        "Pinyon - Juniper Woodland": "#b3d1c8",
        "Deciduous Open Tree Canopy (OTC)": "#75b4c5",
        "Evergreen Closed Tree Canopy (CTC)": "#3597c2",
        "Evergreen Open Tree Canopy": "#2e7ba1",
        "Mixed Evergreen - Deciduous OTC": "#285e81",
        "Deciduous Closed Tree Canopy": "#233e66",
        "Mixed Evergreen - Deciduous CTC": "#1e1950",
    };

    let vegClassLayerQueryClassDict = {};
    let keyI = 1;

    Object.keys(vegClassLayerClassDict).map(function (k) {
        vegClassLayerQueryClassDict[keyI] = k;
        keyI++;
    });

    let vegClassVisualParams = {
        bands: ["b1"],
        min: 1,
        max: 8,
        palette: Object.values(vegClassLayerClassDict),
        addToClassLegend: true,
        classLegendDict: vegClassLayerClassDict,
        queryDict: vegClassLayerQueryClassDict,
        years: evtYears
    };

    return {
        imageLayer: imgLayer,
        visualParams: vegClassVisualParams,
        classDict: vegClassLayerClassDict,
        label: vegClassLabel
    }
}

function convertVegClassesToBinary(imgLayer, year) {

    let imageBand = imgLayer.select("b1");
    let binaryImage = imageBand.expression('(b(0) == 1) ? 1 : 2', { 'b': imageBand });
    let imageMask = imageBand.mask();

    return binaryImage.updateMask(imageMask).set("system:time_start", ee.Date.fromYMD(Number(year), 6, 1).millis());;
}

function getEVTBinaryLayer(imgLayer, year) {

    //order of timelapse
    const evtYears = [2001, 2012, 2014, 2016, 2020];
    const binaryLabel = "EVT " + year + " Tree/Non-tree";
    const evtBinaryLayerClassDict = {
        "Non-tree": "#f7f1c6",
        "Tree": "#285e81",
    };

    let maskedBinaryImage = convertVegClassesToBinary(imgLayer, year)
    let evtBinaryLayerQueryClassDict = {};
    let keyI = 1;

    Object.keys(evtBinaryLayerClassDict).map(function (k) {
        evtBinaryLayerQueryClassDict[keyI] = k;
        keyI++;
    });

    const evtBinaryViz = {
        queryDict: evtBinaryLayerQueryClassDict,
        min: 1,
        max: 2,
        palette: Object.values(evtBinaryLayerClassDict),
        addToClassLegend: true,
        classLegendDict: evtBinaryLayerClassDict,
        years: evtYears
    };

    return {
        imageLayer: maskedBinaryImage,
        visualParams: evtBinaryViz,
        classDict: evtBinaryLayerClassDict,
        label: binaryLabel
    }
}
function getNLCDRefLayer() {
    let nlcdObj = getNLCDObj();
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
    getNLCDRefLayer();
    let evtCollections = getEVTLayers();
    getRAVGSeverityLayer("CBI4", evtCollections);
    getRAVGSeverityLayer("CC5", evtCollections);
    getRAVGSeverityLayer("BA7", evtCollections);
    populateAreaChartDropdown(); //enables the charting panel to pop-up when the Chart Selected Areas is selected.
    populatePixelChartDropdown();
    getSelectLayers(); //enables Tools -> Select and Area on Map 
    getRAVGBurnPerimeterLayer(startYear, endYear);
}