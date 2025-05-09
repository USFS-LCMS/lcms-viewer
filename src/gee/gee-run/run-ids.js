function runIDS() {
  const studyAreaName = "USFS LCMS 1984-2020";
  const idsColor = "0EE";
  ga(
    "send",
    "event",
    "lcms-gtac-ids-viewer-run",
    "year_range",
    `${idsMinYear}_${idsMaxYear}`
  );
  getLCMSVariables();
  let lcmsC = studyAreaDict[studyAreaName].final_collections;
  lcmsC = ee
    .ImageCollection(
      ee.FeatureCollection(lcmsC.map((f) => ee.ImageCollection(f))).flatten()
    )
    .select(["Change", "Change_Raw.*"]);

  const years = range(idsMinYear, idsMaxYear + 1);

  lcmsC = ee.List(years).map(function (yr) {
    const t = lcmsC.filter(ee.Filter.calendarRange(yr, yr, "year")).mosaic();
    return t.set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis());
  });
  lcmsC = ee.ImageCollection(lcmsC);
  // var years  = ee.List.sequence(2010,2013);
  // var idsFolder = 'projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/IDS';
  const idsFolder = "projects/lcms-292214/assets/CONUS-Ancillary-Data/IDS";
  let ids = ee.data
    .getList({
      id: idsFolder,
    })
    .map(function (t) {
      return t.id;
    });
  console.log(ids);
  ids = ids.map(function (id) {
    const idsT = ee.FeatureCollection(id);
    return idsT;
  });
  ids = ee.FeatureCollection(ids).flatten();
  // Map.addLayer(ids,{strokeColor:'0DD',strokeWeight:1,layerType:'geeVectorImage'},'IDS Polygons',false,null,null,'IDS Polygons');
  ids = ids.map(function (f) {
    return f.set("constant", 1);
  });
  const idsLCMS = ee.ImageCollection(
    years.map(function (yr) {
      yr = ee.Number(yr).int16();
      let idsT = ids.filter(ee.Filter.eq("SURVEY_YEA", yr));
      idsT = ee
        .Image()
        .paint(idsT, null, 1.5)
        .visualize({
          min: 1,
          max: 1,
          palette: idsColor,
        })
        .unmask(256);
      // Map.addLayer(idsT,{},'IDS ' +yr.getInfo().toString(),false)
      let lcmsT = lcmsC
        .filter(ee.Filter.calendarRange(yr, yr, "year"))
        .first()
        .select(["Change"]);

      lcmsT = lcmsT.updateMask(lcmsT.gte(2).and(lcmsT.lte(4)));
      lcmsT = lcmsT
        .visualize({
          min: 2,
          max: 4,
          palette: changePalette,
        })
        .unmask(256);
      let out = idsT.where(lcmsT.neq(256).and(idsT.eq(256)), lcmsT);
      out = ee.Image(out.updateMask(out.neq(256))).byte();

      return out
        .set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis())
        .float();
    })
  );

  const lcmsChangeClassesForArea = formatAreaChartCollection(
    lcmsC.select(["Change"]),
    [2, 3, 4],
    ["Slow Loss", "Fast Loss", "Gain"]
  );

  const idsLCMSTSForArea = ee.ImageCollection(
    years.map(function (yr) {
      let idsT = ids.filter(ee.Filter.eq("SURVEY_YEA", yr));
      //     // console.log(yr);
      //     // console.log(idsT.limit(100).size().getInfo())
      const lcmsT = ee.Image(
        lcmsChangeClassesForArea
          .filter(ee.Filter.calendarRange(yr, yr, "year"))
          .first()
      );
      idsT = idsT.reduceToImage(["constant"], ee.Reducer.first()).unmask(0);
      const out = lcmsT
        .addBands(idsT)
        .rename([
          "LCMS Slow Loss",
          "LCMS Fast Loss",
          "LCMS Gain",
          "IDS Polygon",
        ]);

      //     // out = out.visualize({min:1,max:2,palette:'FF0,0FF'})
      return out
        .set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis())
        .float();
    })
  );

  //   // Map.addLayer(idsLCMSTS)
  const classLegendDict = {};
  classLegendDict["Slow Loss"] = changePalette[0];
  classLegendDict["Fast Loss"] = changePalette[1];
  classLegendDict["Gain"] = changePalette[2];
  classLegendDict["IDS Polygons"] = idsColor;

  Map.addTimeLapse(
    idsLCMS,
    {
      years: years.getInfo(),
      addToClassLegend: true,
      classLegendDict: classLegendDict,
      min: 0,
      max: 255,
    },
    "LCMS Change and IDS Time Lapse",
    true
  );

  Map.addSelectLayer(
    ids,
    {
      strokeColor: "D0D",
    },
    "IDS Polygons",
    false,
    null,
    null,
    "IDS Select Polygons. Turn on layer and click on any area wanted to include in chart"
  );
  getSelectLayers();
  lcmsC = lcmsC.select(
    ["Change_Raw.*"],
    ["Slow Loss Prob", "Fast Loss Prob", "Gain Prob"]
  );
  let idsLCMSTS = years.map(function (yr) {
    const lcmsT = lcmsC
      .filter(ee.Filter.calendarRange(yr, yr, "year"))
      .first()
      .divide(100);
    let idsT = ids.filter(ee.Filter.eq("SURVEY_YEA", yr));
    idsT = idsT
      .reduceToImage(["constant"], ee.Reducer.first())
      .unmask(0)
      .rename(["IDS Polygon"]);
    return lcmsT
      .addBands(idsT)
      .float()
      .set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis())
      .float();
  });
  idsLCMSTS = ee.ImageCollection(idsLCMSTS);
  pixelChartCollections["test"] = {
    label: "LCMS and IDS Time Series",
    collection: idsLCMSTS,
    chartColors: ["f39268", "d54309", "00a398", idsColor],
    xAxisLabel: "Year",
    yAxisLabel: "LCMS Model Confidence or IDS Polygon",
  };

  areaChartCollections["test"] = {
    label: "LCMS and IDS Time Series",
    collection: idsLCMSTSForArea,
    stacked: false,
    steppedLine: false,
    tooltip: "Summarize loss IDS each year",
    colors: ["f39268", "d54309", "00a398", idsColor],
    xAxisLabel: "Year",
  };
  populatePixelChartDropdown();
  populateAreaChartDropdown();
  $("#LCMS-Change-and-IDS-Time-Lapse-1-name-span").click();
}
