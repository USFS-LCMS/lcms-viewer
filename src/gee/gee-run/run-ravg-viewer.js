//let ravgCollection;

//I think I want to just have the gee functionality for retreiving the RAVG layers here,
//rather than in the shared - gee - functions since it's not clear they would be relevant anywhere else.



function getRAVGBurnPerimeters(startYear, endYear) {
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

    //perimsRAVG = perimsRAVG.filter(ee.Filter.gte("Year", startYear)); //these don't work
    //perimsRAVG = perimsRAVG.filter(ee.Filter.lte("Year", endYear)); //these don't work
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

function runRAVG() {

    startYear = parseInt(urlParams.startYear); 
    endYear = parseInt(urlParams.endYear);
    chartMTBS = true;
    chartMTBSByNLCD = true;
    chartMTBSByAspect = true;

    /*
    shutting this down for now...
    ga("send", "event", "mtbs-viewer-run", "year_range", `${startYear}_${endYear}`);
    */

    //initializes a bunch of global variables.
    getLCMSVariables();

    //adds NAIP Time Lapse layer under REFERENCE DATA
    getNAIP(null, true);

    Map.turnOffLayersWhenTimeLapseIsOn = false;

    const mtbsAndNLCD = getMTBSAndNLCD("anc", "layer-list", true);
    const nlcdLCObj = mtbsAndNLCD.NLCD;
    const ravgCollection = mtbsAndNLCD.MTBS.collection;
    const yearsCli = range(startYear, endYear + 1);
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
    getSelectLayers(); //enables Tools -> Select and Area on Map 
    getRAVGBurnPerimeters(startYear, endYear);
}