let mtbsC;
function runMTBSOld() {
  startYear = parseInt(urlParams.startYear);
  endYear = parseInt(urlParams.endYear);
  chartMTBS = true;
  chartMTBSByNLCD = true;
  chartMTBSByAspect = true;
  getLCMSVariables();

  ga(
    "send",
    "event",
    "mtbs-viewer-run",
    "year_range",
    `${startYear}_${endYear}`
  );
  getNAIP(null, true);
  Map.turnOffLayersWhenTimeLapseIsOn = false;
  const mtbsAndNLCD = getMTBSAndNLCD("anc", "layer-list", true);

  const nlcdLCObj = mtbsAndNLCD.NLCD;
  mtbsC = mtbsAndNLCD.MTBS.collection;

  const yearsCli = range(startYear, endYear + 1);

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
  // console.log(perims.size().getInfo());
  // perims = perims.map(function(f){
  //   f = ee.Feature(f);
  //   var d = ee.Number(f.get('StartDay')).format('%02d');
  //   var m = ee.Number(f.get('StartMonth')).format('%02d');
  //   var y = ee.Number(f.get('Year')).format();
  //   var out = y.cat('-').cat(m).cat('-').cat(d);
  //   return f.select(['Fire_Name','Fire_ID','Fire_Type','Acres'],['1_Fire_Name','2_Fire_ID','3_Fire_Type','4_Acres']).set('5_Start_Date',out);
  // });
  // perims = ee.FeatureCollection(perims);
  perims = perims.set("bounds", clientBoundsDict.All);
  // console.log(perims.get('bounds').getInfo())

  // var perimYear = perims.reduceToImage(['Year'], ee.Reducer.first())
  // var perims = ee.Image().paint(perims,null,2);
  // Map.addLayer(perimYear,{min:1984,max:2018,palette:'FF0,F00'},'perims year')
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

  // var years = ee.List.sequence(startYear,mtbs)

  const chartTableDict = ee
    .Dictionary(nlcdLCObj.collection.get("chartTableDict"))
    .combine(mtbsC.get("chartTableDict"))
    .getInfo();

  const nlcdLCFilled = batchFillCollection(nlcdLCObj.collection, yearsCli).map(
    setSameDate
  );
  const forCharting = joinCollections(mtbsC, nlcdLCFilled, false);
  const timeLapseSeverityViz = JSON.parse(
    JSON.stringify(mtbsAndNLCD.MTBSSeverityViz)
  );
  timeLapseSeverityViz.years = yearsCli;
  Map.addTimeLapse(
    mtbsC,
    timeLapseSeverityViz,
    "MTBS Burn Severity Time Lapse",
    false
  );
  // forCharting = forCharting.set('chartTableDict',chartTableDict);
  // forCharting = forCharting.set('legends',chartTableDict)
  // nlcdLC = batchFillCollection(nlcdLCObj.collection,years).map(setSameDate);
  // chartCollection =forCharting;
  pixelChartCollections["mtbs"] = {
    label: "MTBS Time Series",
    collection: forCharting,
    chartTableDict: chartTableDict,
    legends: chartTableDict,
  };
  populateAreaChartDropdown();
  populatePixelChartDropdown();

  getSelectLayers();

  // toggleCumulativeMode();
  // Map.addSelectLayer(resolveEcoRegions,{strokeColor:'0F0'},'Select Which EcoRegion',false,null,null,'Ecoregion selection');
  // Map.addSelectLayer(huc4,{strokeColor:'00F'},'Select Which HUC 4',false,null,null,'HUC 4 selection');
  // $('#select-area-interactive-chart-label').click();
  // $('#tools-collapse-label-label').click();
}
function setupMTBS() {
  getLCMSVariables();

  getNAIP(null, true);
  getAnnualNLCD();
  getMTBS();

  getSelectLayers();
  areaChart.populateChartLayerSelect();
  areaChart.setupTransitionPeriodUI();
  // Map.turnOnAutoAreaCharting();
}
function runMTBS() {
  Map.turnOffLayersWhenTimeLapseIsOn = false; // Makes it so time lapses are shown with other layers
  let wayback = new esri_wayback();

  wayback.addWaybackUIContainer("#reference-layer-list-collapse-div");
  wayback.initialize(setupMTBS);
}
