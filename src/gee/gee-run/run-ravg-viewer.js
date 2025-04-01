let ravgCollection;

function runRAVG() {
    console.log("starting runRAVG");

    startYear = parseInt(urlParams.startYear); 
    endYear = parseInt(urlParams.endYear);
    chartMTBS = true;
    chartMTBSByNLCD = true;
    chartMTBSByAspect = true;

    //shared gee function
    getLCMSVariables();

    /* 
    shutting this down for now...
    ga("send", "event", "mtbs-viewer-run", "year_range", `${startYear}_${endYear}`);
    */

    //shared gee function
    getNAIP(null, true);
    Map.turnOffLayersWhenTimeLapseIsOn = false;

    //shared gee function, probably need something similar for RAVG assets. This references ImageCollections in EE
    const mtbsAndNLCD = getMTBSAndNLCD("anc", "layer-list", true);

    const nlcdLCObj = mtbsAndNLCD.NLCD;
    ravgCollection = mtbsAndNLCD.MTBS.collection;

    const yearsCli = range(startYear, endYear + 1);

    //feature collection from EE
    let perims = ee.FeatureCollection("USFS/GTAC/MTBS/burned_area_boundaries/v1"); //ee.FeatureCollection('projects/USFS/DAS/MTBS/mtbs_perims_DD');

    const inFields = [
    "Incid_Name",
    "Incid_Type",
    "Event_ID",
    "irwinID",
    "Ignition Date",
    "BurnBndAc",
    "Asmnt_Type",
    ];

    const outFields = [
    "Incident Name",
    "Incident Type",
    "MTBS Event ID",
    "IRWIN ID",
    "Ignition Date",
    "Acres",
    "Assessment Type",
    ];

    perims = perims.map(function (f) {
        const d = ee.Date(f.get("Ig_Date"));
        const formatted = d.format("YYYY-MM-dd");
        return f.set({
            Year: d.get("year"),
            "Ignition Date": formatted,
        });
    });

    perims = perims.filter(ee.Filter.gte("Year", startYear));
    perims = perims.filter(ee.Filter.lte("Year", endYear));
    perims = perims.select(inFields, outFields);
    perims = perims.set("bounds", clientBoundsDict.All);

    Map.addLayer(
        perims,
        {
            styleParams: {
            color: "00F",
            fillColor: "0000",
            width: 2,
            lineType: "dashed",
            },
        },
        "MTBS Burn Perimeters",
        true,
        null,
        null,
        "Delineated perimeters of each MTBS mapped fire from " +
            startYear.toString() +
            "-" +
            endYear.toString() +
            ". Areas can have multiple mapped fires."
    );

    const chartTableDict = ee.Dictionary(nlcdLCObj.collection.get("chartTableDict"))
                             .combine(ravgCollection.get("chartTableDict"))
                             .getInfo();
    const nlcdLCFilled = batchFillCollection(nlcdLCObj.collection, yearsCli).map(setSameDate);
    const forCharting = joinCollections(ravgCollection, nlcdLCFilled, false);
    const timeLapseSeverityViz = JSON.parse(JSON.stringify(mtbsAndNLCD.MTBSSeverityViz));

    timeLapseSeverityViz.years = yearsCli;

    Map.addTimeLapse(
        ravgCollection,
        timeLapseSeverityViz,
        "MTBS Burn Severity Time Lapse",
        false
    );

    pixelChartCollections["mtbs"] = {
        label: "MTBS Time Series",
        collection: forCharting,
        chartTableDict: chartTableDict,
        legends: chartTableDict,
    };

    populateAreaChartDropdown(); //enables the charting panel to pop-up when the Chart Selected Areas is selected.
    populatePixelChartDropdown();
    getSelectLayers();

}

