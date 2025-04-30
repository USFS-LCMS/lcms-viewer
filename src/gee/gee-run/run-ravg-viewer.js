function ravgYearRange() {
    const startYear = 2012;
    const endYear = 2023;
    return startYear.toString() + "-" + endYear.toString();
}

function chartSeverityAcrossReference(severityLayer, refYears, refImageCollection, refLayerQueryClassDict, severityLayerMaxSeverity, severityLayerQueryClassDict, severityLayerClassDict, refType) {

    //puts all of the ref sub-layer into a single layer and charts based on that.
    let mergedCollection;
    const className = refType.toLowerCase() + "_" + severityLayer + "_landcover_class";
    const label = "RAVG " + severityLayer + " Burn Severity per " + refType + " Class";

    refYears.map(function (year) {
        const refT = refImageCollection
            .filter(ee.Filter.calendarRange(Number(year), Number(year), "year"))
            .mosaic();
        let severityLayerByEVT = Object.keys(refLayerQueryClassDict).map(function (k) {
            const name = refLayerQueryClassDict[k];
            const out = severityLayerMaxSeverity
                .updateMask(refT.eq(ee.Number.parse(k)))
                .set(className, name)
                .set("ref_year", year)
                .set("ref_type", refType);
            return out;
        });
        severityLayerByEVT = ee.ImageCollection(severityLayerByEVT);
        let severityLayerByEVTStack = formatAreaChartCollection(
            severityLayerByEVT,
            Object.keys(severityLayerQueryClassDict),
            Object.values(severityLayerQueryClassDict),
            true
        );

        if (mergedCollection === undefined) {
            mergedCollection = severityLayerByEVTStack;
        } else {
            mergedCollection = mergedCollection.merge(severityLayerByEVTStack);
        }
    });

    areaChartCollections["ravg" + severityLayer + refType] = {
        collection: mergedCollection,
        colors: Object.values(severityLayerClassDict),
        label: label,
        stacked: true,
        steppedLine: false,
        chartType: "bar",
        xAxisProperty: className,
        xAxisLabel: label,
        tooltip: "Chart RAVG " + severityLayer + " burn severity per " + refType + " landcover class",
    };

}

function getQueryClassDict(ref) {
    let out = {};
    let keyI = 1;
    Object.keys(ref).map(function (k) {
        out[keyI] = k;
        keyI++;
    });
    return out;
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

function dateFromIG_DATE(timsetamp) {
    let timestampNumber = ee.Number.parse(timsetamp);
    let dateObj = ee.Date(timestampNumber);
    return dateObj.format('YYYY-MM-dd', 'UTC');
}

function yearSlice(str) {
    return str.slice(-8, -4);
}

function yearFromPRE_ID(id) {
    if (id.index("_") !== -1) {
        let split = ee.String(id.split("_").get(0));
        return yearSlice(split);
    } else {
        return yearSlice(id);
    }
}

function getRAVGBurnPerimeterLayer() {

    let perimeterLayer = ee.FeatureCollection("projects/gtac-ravg/assets/RAVG_perimeters/RAVG_perims");

    const inRAVGFields = [
        "INCID_NAME",
        "EVENT_ID",
        "IG_DATE",
        "Fire Year",
        "BURNBNDAC",
        "PRE_ID", ,
        "ASMNT_TYPE"
    ];

    const outRAVGFields = [
        "Fire Name",
        "RAVG Event ID",
        "Ignition Date",
        "Fire Year",
        "Acres",
        "Pre-Image Year",
        "Assessment Type"
    ];

    perimeterLayer = perimeterLayer.map(function (f) {
        const preImageYear = yearFromPRE_ID(ee.String(f.get("PRE_ID")));
        const igDate = dateFromIG_DATE(ee.String(f.get("IG_DATE")));
        const igYear = igDate.slice(0, 4);
        return f.set({
            "PRE_ID": preImageYear,
            "IG_DATE": igDate,
            "Fire Year": igYear
        });
    });

    perimeterLayer = perimeterLayer.select(inRAVGFields, outRAVGFields);
    perimeterLayer = perimeterLayer.set("bounds", clientBoundsDict.All);

    return perimeterLayer;
}


function setRAVGBurnPerimeterLayer() {
    
    let perimsRAVG = getRAVGBurnPerimeterLayer();
    let label = "RAVG Burn Perimeters";
    let tooltip = "Delineated perimeters of each RAVG mapped fire from " + ravgYearRange() + ". ";

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

    Map.addSelectLayer(
        perimsRAVG,
        {
            strokeColor: "00F",
            selectLayerNameProperty: "Fire Name",
            selectLayerIgnitionYearProperty: "Fire Year"
        },
        label,
        false,
        null,
        null,
        tooltip + "Turn on layer and click on any fire wanted to include in chart"
    );
}

function setSeverityLayerCharts(layer, severityLayer, severityLayerQueryClassDict, severityLayerClassDict, startYear, endYear) {
    let severityLayerStack = formatAreaChartCollection(
        severityLayer.select([0]),
        Object.keys(severityLayerQueryClassDict),
        Object.values(severityLayerQueryClassDict),
        true
    );

    areaChartCollections["ravg_" + layer.toLowerCase()] = {
        collection: severityLayerStack,
        colors: Object.values(severityLayerClassDict),
        label: "RAVG " + layer + " Burn Severity",
        stacked: true,
        steppedLine: false,
        chartType: "bar",
        xAxisProperty: "year",
        tooltip: "Chart the RAVG " + layer + " burn severity"
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
                    "All Mapped Burned Area (Total of Low, Moderate, and High Severity) " + ravgYearRange()
                ),
        ]),
        colors: ["#CC5500"],
        label:
            "RAVG " + layer + " Burned Area Total " + ravgYearRange(),
        stacked: true,
        steppedLine: false,
        chartType: "bar",
        xAxisProperty: "Burned",
        tooltip: "Chart the union of all burned areas (areas with low, moderate, or high severity) " + ravgYearRange()
    };

    areaChartCollections["ravg_burn_severity_" + layer.toLowerCase() + "_mosaic"] = {
        collection: ee.ImageCollection([
            severityLayerStack
                .max()
                .unmask(0)
                .set(
                    "Burned",
                    layer + " Burn Severity Total " + ravgYearRange()
                ),
        ]),
        colors: Object.values(severityLayerClassDict),
        label:
            "RAVG " + layer + " Burn Severity Total " + ravgYearRange(),
        stacked: true,
        steppedLine: false,
        chartType: "bar",
        xAxisProperty: "Burned",
        tooltip: "Chart the union of " + layer + " burn severity " + ravgYearRange() + ". The maximum severity is used when fires overlap. "
    };
}

function setAspectChart(layer, severityLayerMaxSeverity, severityLayerQueryClassDict, severityLayerClassDict) {

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
        label: "RAVG " + layer + " Burn Severity per Aspect",
        stacked: true,
        steppedLine: false,
        chartType: "bar",
        xAxisProperty: "Aspect_Bin",
        xAxisLabel: "Aspect Bin",
        tooltip: "Chart RAVG " + layer + " burn severity per aspect quadrants.",
    };
}

function getRAVGSeverityLayerAndRefLayers(layer, whichLayerList, showSeverity) {

    if (showSeverity === null || showSeverity === undefined) {
        showSeverity = false;
    }
    if (mtbsSummaryMethod === null || mtbsSummaryMethod === undefined) {
        mtbsSummaryMethod = "Highest-Severity";
    }

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
        let severityRemapped;
        let burned;

        if (layer == "BA7") {
            severityRemapped = img
                .remap([1, 2, 3, 4, 5, 6, 7, 9], [1, 2, 3, 4, 5, 6, 7, 9])
                .rename(["burnSeverityRemap"]);
            burned = img
                .remap([1, 2, 3, 4, 5, 6, 7, 9], [1, 1, 1, 1, 1, 1, 1, 1])
                .rename(["burnedNotBurned"]);
        } else if (layer == "CC5") {
            severityRemapped = img
                .remap([1, 2, 3, 4, 5, 9], [1, 2, 3, 4, 5, 9])
                .rename(["burnSeverityRemap"]);
            burned = img
                .remap([1, 2, 3, 4, 5, 9], [1, 1, 1, 1, 1, 1])
                .rename(["burnedNotBurned"]);
        } else if (layer == "CBI4") {
            severityRemapped = img
                .remap([1, 2, 3, 4, 9], [1, 2, 3, 4, 9])
                .rename(["burnSeverityRemap"]);
            burned = img
                .remap([1, 2, 3, 4, 9], [1, 1, 1, 1, 1])
                .rename(["burnedNotBurned"]);
        }

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

    let severityLayerClassDict;
    let maxVal;

    if (layer == "BA7") {
        severityLayerClassDict = {
            "0%": "008080",
            "0-10%": "20A8A8",
            "10-<25%": "52CCCC",
            "25-<50%": "FFE820",
            "50-<75%": "FF8020",
            "75-<90%": "FF2020",
            "90-100%": "A80000",
            "Masked/Unmappable": "FFFFFF"
        };
        maxVal = 8;
    } else if (layer == "CC5") {
        severityLayerClassDict = {
            "0%": "008080",
            "0-<25%": "52CCCC",
            "25-<50%": "FFE820",
            "50-<75%": "FF8020",
            "75-100%": "A80000",
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

    const severityLayerQueryClassDict = getQueryClassDict(severityLayerClassDict);

    setSeverityLayerCharts(layer, severityLayer, severityLayerQueryClassDict, severityLayerClassDict, startYear, endYear);

    let severityLayerMaxSeverity = severityLayer.select([0]).max();
    let nlcdObj = getNLCDObj();

    chartSeverityAcrossReference(
        layer,
        nlcdObj.years,
        nlcdObj.collection,
        nlcdObj.queryDict,
        severityLayerMaxSeverity,
        severityLayerQueryClassDict,
        severityLayerClassDict,
        "NLCD"
    );

    setAspectChart(layer, severityLayerMaxSeverity, severityLayerQueryClassDict, severityLayerClassDict);

    const severityViz = {
        queryDict: severityLayerQueryClassDict,
        min: 1,
        max: maxVal,
        palette: Object.values(severityLayerClassDict),
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
        "RAVG " + layer + " " + mtbsSummaryMethod + " burn severity mosaic from " + ravgYearRange(),
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
            summarized: severityLayerSummarized,
            originalCollection: severityLayer
        },
        severityViz: severityViz
    };
}

function getRAVGSeverityLayer(severityLayer, evtCollections) {

    const ravgSeverityLayerAndRefLayers = getRAVGSeverityLayerAndRefLayers(severityLayer, "layer-list", (severityLayer == "BA7") ? true : false);
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
        "RAVG " + severityLayer + " Burn Severity Time Lapse",
        false
    );

    pixelChartCollections["ravg_" + severityLayer.toLowerCase()] = {
        label: "RAVG " + severityLayer + " Time Series",
        collection: forCharting,
        chartTableDict: chartTableDict,
        legends: chartTableDict,
    };

    let maxSeverity = ravgSeverityLayerAndRefLayers.severityLayer.collection.select([0]).max();
    let severityLayerQueryDict = ravgSeverityLayerAndRefLayers.severityViz.queryDict;
    let severityLayerLegendDict = ravgSeverityLayerAndRefLayers.severityViz.classLegendDict;

    chartSeverityAcrossReference(
        severityLayer,
        evtCollections.vegClass.years,
        evtCollections.vegClass.collection,
        evtCollections.vegClass.visualParams.queryDict,
        maxSeverity,
        severityLayerQueryDict,
        severityLayerLegendDict,
        "EVT-Vegetation"
    );

    chartSeverityAcrossReference(
        severityLayer,
        evtCollections.binary.years,
        evtCollections.binary.collection,
        evtCollections.binary.visualParams.queryDict,
        maxSeverity,
        severityLayerQueryDict,
        severityLayerLegendDict,
        "EVT-Tree/Non-Tree"
    );

    return {
        summarized: ravgSeverityLayerAndRefLayers.severityLayer.summarized,
        originalCollection: ravgSeverityLayerAndRefLayers.severityLayer.originalCollection
    }
}

function getEVTVegClassLayer(imgLayer, year) {

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

    const vegClassLayerQueryClassDict = getQueryClassDict(vegClassLayerClassDict);

    const vegClassVisualParams = {
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

    const evtYears = [2001, 2012, 2014, 2016, 2020];
    const binaryLabel = "EVT " + year + " Tree/Non-tree";
    const evtBinaryLayerClassDict = {
        "Non-tree": "#f7f1c6",
        "Tree": "#285e81",
    };

    const maskedBinaryImage = convertVegClassesToBinary(imgLayer, year)
    const evtBinaryLayerQueryClassDict = getQueryClassDict(evtBinaryLayerClassDict);

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

function setRAVGSelectionLayers() {
   
    Map.addSelectLayer(
        ee.FeatureCollection("projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/bia_bounds_2017"),
        { strokeColor: "0F0" },
        "BIA Boundaries",
        false,
        null,
        null,
        "BIA boundaries. Turn on layer and click on any area wanted to include in chart"
    );

    Map.addSelectLayer(
        ee.FeatureCollection("USGS/WBD/2017/HUC12"),
        { strokeColor: "00F" },
        "HUC 12",
        false,
        null,
        null,
        "HUC 12 watershed boundaries. Turn on layer and click on any HUC 12 wanted to include in chart"
    );

    Map.addSelectLayer(
        ee.FeatureCollection("projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/Baileys_Ecoregions").select(["SECTION"], ["NAME"]),
        { strokeColor: "8F8" },
        "Baileys Ecoregions Sections",
        false,
        null,
        null,
        "Baileys ecoregion sections. Turn on layer and click on any ecoregion wanted to include in chart"
    );

    Map.addSelectLayer(
        ee.FeatureCollection("projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/Baileys_Ecoregions_Subsections").select(["MAP_UNIT_N"],["NAME"],true),
        { strokeColor: "8F0" },
        "Baileys Ecoregions Subsections",
        false,
        null,
        null,
        "Baileys ecoregions subsections. Turn on layer and click on any ecoregion wanted to include in chart"
    );
    Map.addSelectLayer(
        ee.FeatureCollection("EPA/Ecoregions/2013/L3"),
        { strokeColor: "8F8" },
        "Level 3 EPA Ecoregions",
        false,
        null,
        null,
        "Omernik and Griffith 2014 Level 3 EPA Ecoregions. Turn on layer and click on any ecoregion wanted to include in chart"
    );
    Map.addSelectLayer(
        ee.FeatureCollection("EPA/Ecoregions/2013/L4"),
        { strokeColor: "8FD" },
        "Level 4 EPA Ecoregions",
        false,
        null,
        null,
        "Omernik and Griffith 2014 Level 4 EPA Ecoregions. Turn on layer and click on any ecoregion wanted to include in chart"
    );

    Map.addSelectLayer(
        otherLands,
        { strokeColor: "DD0" },
        "Other Designated Lands",
        false,
        null,
        null,
        "A boundary within which National Forest System land parcels have managment or use limits placed on them by legal authority. Examples are: National Recreation Area, National Monument, and National Game Refuge. Turn on layer and click on any Park wanted to include in chart"
    );

    Map.addSelectLayer(
        ee.FeatureCollection("TIGER/2018/States"),
        { strokeColor: "AD0" },
        "US States and Territories",
        false,
        null,
        null,
        "2018 TIGER state and territory boundaries for the United States. Turn on layer and click on any state/territory wanted to include in chart"
    );
    
    Map.addSelectLayer(
        ee.FeatureCollection("TIGER/2018/Counties"),
        { strokeColor: "08F", selectLayerNameProperty: "NAME" },
        "US Counties",
        false,
        null,
        null,
        "US Counties from 2018 TIGER data. Turn on layer and click on any county wanted to include in chart"
    );

    Map.addSelectLayer(
        ee.FeatureCollection("projects/lcms-292214/assets/CONUS-Ancillary-Data/TIGER_Urban_Areas_2018"),
        { strokeColor: "88F", selectLayerNameProperty: "NAME10" },
        "US Census Urban Areas",
        false,
        null,
        null,
        "TIGER, 2018, U.S. Urban Areas (https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_us_ua10_500k.zip). Turn on layer and click on any county wanted to include in chart"
    );

    Map.addSelectLayer(
        nps,
        { strokeColor: "F0F", selectLayerNameProperty: "PARKNAME" },
        "National Parks",
        false,
        null,
        null,
        "National Park boundaries. Turn on layer and click on any Park wanted to include in chart"
    );

    Map.addSelectLayer(
        b,
        { strokeColor: "00F", selectLayerNameProperty: "FORESTNAME" },
        "National Forests",
        false,
        null,
        null,
        "National Forest boundaries. Turn on layer and click on any Forest wanted to include in chart"
    );

    Map.addSelectLayer(
        ee.FeatureCollection("projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_District_Boundaries").select(["DISTRICTNA"], ["name"]),
        { strokeColor: "80F", selectLayerNameProperty: "name" },
        "National Forest Districts",
        false,
        null,
        null,
        "National Forest District boundaries. Turn on layer and click on any Forest wanted to include in chart"
    );
}

function setRAVGBurnCountLayer(cbi4, cc5, ba7) {

    //counts based on the 'burnedNotBurned' band ()
    let cbi4Count = cbi4.select("burnedNotBurned").count().rename("cbi4_count");
    let cc5Count = cc5.select("burnedNotBurned").count().rename("cc5_count");
    let ba7Count = ba7.select("burnedNotBurned").count().rename("ba7_count");
    let combinedCount = cbi4Count.addBands(cc5Count).addBands(ba7Count);
    let maxReduced = combinedCount.reduce(ee.Reducer.max()).rename("max_values");

    const countDict = {
        1: "#ffcbd1",
        2: "#ee6b6e",
        3: "#ff2c2c",
        4: "#c30010",
        "5 +": "#530000"
    };

    const layerQueryClassDict = getQueryClassDict(countDict);

    Map.addLayer(
        maxReduced.set("bounds", clientBoundsDict.All),
        {
            bands: ["max_values"],
            min: 1,
            max: 5,
            palette: Object.values(countDict),
            classLegendDict: countDict,
            queryDict: layerQueryClassDict
        },
        "RAVG Burn Count",
        false,
        null,
        null,
        "RAVG number of burns mapped for a given area from " + ravgYearRange(),
        "layer-list"
    );

}

function setRAVGBurnYearLayer() {

    let perimsRAVG = getRAVGBurnPerimeterLayer();
    let perimsRAVGYears = perimsRAVG.map(function (f) {
        let yearStr = ee.String(f.get("Fire Year"));
        let yearNum = ee.Number.parse(yearStr);
        return f.set("FIRE_YEAR_NUM", yearNum);
    });
    let tooltip = "Delineated perimeters of each RAVG mapped fire from " + ravgYearRange() + ". ";
    let emptyImg = ee.Image().byte();
    let yearImg = emptyImg.paint({
        featureCollection: perimsRAVGYears,
        color: "FIRE_YEAR_NUM"
    });

    const yearDict = {
        2012: "#fddbc7",
        2013: "#f0f9c1",
        2014: "#e1f2ac",
        2015: "#ccebc5",
        2016: "#a8ddb5",
        2017: "#7fcbbb",
        2018: "#5baec1",
        2019: "#41b6c4",
        2020: "#2c9ec2",
        2021: "#1d85c0",
        2022: "#225ea8",
        2023: "#081d58",
    };

    const queryClassDict = getQueryClassDict(yearDict);

    const burnYearViz = {
        min: 2012,
        max: 2023,
        palette: Object.values(yearDict),
        queryDict: queryClassDict,
        addToClassLegend: true,
        classLegendDict: yearDict,
    };

    Map.addLayer(
        yearImg,
        burnYearViz,
        "RAVG Burn Year",
        false, 
        null,
        null,
        tooltip
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
    let cbi4 = getRAVGSeverityLayer("CBI4", evtCollections);
    let cc5 = getRAVGSeverityLayer("CC5", evtCollections);
    let ba7 = getRAVGSeverityLayer("BA7", evtCollections);
    setRAVGBurnCountLayer(cbi4.originalCollection, cc5.originalCollection, ba7.originalCollection);
    setRAVGBurnYearLayer(cbi4.summarized, cc5.summarized, ba7.summarized);
    populateAreaChartDropdown(); //enables the charting panel to pop-up when the Chart Selected Areas is selected.
    populatePixelChartDropdown();
    setRAVGSelectionLayers();
    setRAVGBurnPerimeterLayer();
}

if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = {
        getQueryClassDict,
        yearSlice,
        getEVTVegClassLayer
    }
}
