function runGTAC() {
  if (urlParams.dynamic) {
    runDynamic();
  } else {
    defaultQueryDateFormat = "YYYY";
    //Set up some params
    startYear = parseInt(urlParams.startYear);
    endYear = parseInt(urlParams.endYear);

    analysisMode = urlParams.analysisMode;
    queryClassDict = {};
    var years = range(startYear, endYear + 1);
    summaryMethod = urlParams.summaryMethod.toTitle();
    getLCMSVariables();

    ga("send", "event", "lcms-gtac-viewer-run", "year_range", `${startYear}_${endYear}`);
    ga("send", "event", "lcms-gtac-viewer-run", "analysis_mode", analysisMode);
    ga("send", "event", "lcms-gtac-viewer-run", "timelapse_on", urlParams.addLCMSTimeLapsesOn);
    ga("send", "event", "lcms-gtac-viewer-run", "summary_method", summaryMethod);
    // setupDownloads(studyAreaName);
    var clientBoundary = clientBoundsDict.CONUS_SEAK;

    var lcmsRun = {};
    var lcmsRunFuns = {};

    //Bring in ref layers
    getHansen();

    var whp = ee.ImageCollection("projects/lcms-292214/assets/CONUS-Ancillary-Data/RMRS_Wildfire_Hazard_Potential").mosaic().rename(["whp"]);
    var names = ["Very Low", "Low", "Moderate", "High", "Very High", "Non-burnable", "Water"];
    var palette = ["38A800", "D1FF73", "FFFF00", "FFAA00", "FF0000", "B2B2B2", "0070FF"];
    var values = [1, 2, 3, 4, 5, 6, 7];
    whp = whp.set({
      whp_class_names: names,
      whp_class_palette: palette,
      whp_class_values: values,
    });

    Map.addLayer(
      whp,
      { autoViz: true, layerType: "geeImage" },
      "Wildfire Hazard Potential 2020",
      false,
      null,
      null,
      "The wildfire hazard potential (WHP) map is a raster geospatial product produced by the USDA Forest Service, Fire Modeling Institute that can help to inform evaluations of wildfire hazard or prioritization of fuels management needs across very large landscapes",
      "reference-layer-list"
    );
    try {
      getMTBSandIDS();
    } catch (err) {
      console.log(err);
    }

    //Set up some params
    startYear = parseInt(urlParams.startYear);
    endYear = parseInt(urlParams.endYear);

    analysisMode = urlParams.analysisMode;
    queryClassDict = {};
    var years = range(startYear, endYear + 1);
    summaryMethod = urlParams.summaryMethod.toTitle();
    getLCMSVariables();

    lcmsRun.thematicChangeYearBuffer = 5;
    lcmsRun.years = range(startYear, endYear + 1);

    lcmsRun.summaryMethodDescriptionDict = {
      Year: "of most recent",
      Prob: "of most probable",
    };
    lcmsRun.minGainProb = [studyAreaDict[studyAreaName].conusGainThresh, studyAreaDict[studyAreaName].akGainThresh].min();
    lcmsRun.minSlowLossProb = [studyAreaDict[studyAreaName].conusSlowLossThresh, studyAreaDict[studyAreaName].akSlowLossThresh].min();
    lcmsRun.minFastLossProb = [studyAreaDict[studyAreaName].conusFastLossThresh, studyAreaDict[studyAreaName].akFastLossThresh].min();
    lcmsRunFuns.getMaskedWYr = function (c, code) {
      return c.map(function (img) {
        var yr = ee.Date(img.get("system:time_start")).get("year");
        var yrImg = ee.Image(yr).int16().rename(["Year"]);
        return img
          .addBands(yrImg)
          .updateMask(img.select([0]).eq(code))
          .copyProperties(img, ["system:time_start"]);
      });
    };

    lcmsRun.lcms = studyAreaDict[studyAreaName].final_collections;
    lcmsRun.lcms = ee.ImageCollection(
      ee.FeatureCollection(lcmsRun.lcms.map((f) => ee.ImageCollection(f).select(["Change", "Land_Cover", "Land_Use", ".*Probability.*"]))).flatten()
    );

    //Get properties image
    lcmsRun.f = ee.Image(lcmsRun.lcms.filter(ee.Filter.notNull(["Change_class_names"])).first());
    lcmsRun.props = lcmsRun.f.toDictionary().getInfo();
    // console.log(lcmsRun.props)

    lcmsRun.lcms = lcmsRun.lcms.filter(ee.Filter.calendarRange(startYear, endYear, "year"));
    // console.log(lcmsRun.lcms.aggregate_histogram ('study_area').getInfo())

    //Mosaic all study areas
    lcmsRun.lcms = ee.List.sequence(startYear, endYear).map(function (yr) {
      var t = lcmsRun.lcms.filter(ee.Filter.calendarRange(yr, yr, "year")).mosaic();
      return t.copyProperties(lcmsRun.f).set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis());
    });
    lcmsRun.lcms = ee.ImageCollection(lcmsRun.lcms);

    //Bring in two periods of land cover and land use if advanced, otherwise just bring in a single mode
    if (analysisMode === "advanced") {
      Map.addLayer(
        lcmsRun.lcms.select(["Land_Use"]).filter(ee.Filter.calendarRange(startYear, startYear + lcmsRun.thematicChangeYearBuffer, "year")),
        {
          title: `Most common land use class from ${startYear} to ${startYear + lcmsRun.thematicChangeYearBuffer}.`,
          autoViz: true,
          layerType: "geeImageCollection",
          reducer: ee.Reducer.mode(),
          bounds: clientBoundary,
        },
        "Land Use Start",
        false
      );

      Map.addLayer(
        lcmsRun.lcms.select(["Land_Use"]).filter(ee.Filter.calendarRange(endYear - lcmsRun.thematicChangeYearBuffer, endYear, "year")),
        {
          title: `Most common land use class from ${endYear - lcmsRun.thematicChangeYearBuffer} to ${endYear}.`,
          autoViz: true,
          layerType: "geeImageCollection",
          reducer: ee.Reducer.mode(),
          bounds: clientBoundary,
        },
        "Land Use End",
        false
      );

      Map.addLayer(
        lcmsRun.lcms.select(["Land_Cover"]).filter(ee.Filter.calendarRange(startYear, startYear + lcmsRun.thematicChangeYearBuffer, "year")),
        {
          title: `Most common land cover class from ${startYear} to ${startYear + lcmsRun.thematicChangeYearBuffer}.`,
          autoViz: true,
          reducer: ee.Reducer.mode(),
          bounds: clientBoundary,
        },
        "Land Cover Start",
        false
      );
      Map.addLayer(
        lcmsRun.lcms.select(["Land_Cover"]).filter(ee.Filter.calendarRange(endYear - lcmsRun.thematicChangeYearBuffer, endYear, "year")),
        {
          title: `Most common land cover class from ${endYear - lcmsRun.thematicChangeYearBuffer} to ${endYear}.`,
          autoViz: true,
          layerType: "geeImageCollection",
          reducer: ee.Reducer.mode(),
          bounds: clientBoundary,
        },
        "Land Cover End",
        false
      );
      // Map.addLayer(lcChangeObj.change.set('bounds',clientBoundary),lcChangeObj.viz,lcLayerName + ' Change' ,false);
      // Map.addLayer(luChangeObj.change.set('bounds',clientBoundary),luChangeObj.viz,luLayerName + ' Change' ,false);
    } else {
      Map.addLayer(
        lcmsRun.lcms.select(["Land_Cover"]),
        {
          title: `Most common land cover class from ${startYear} to ${endYear}.`,
          autoViz: true,
          layerType: "geeImageCollection",
          reducer: ee.Reducer.mode(),
          bounds: clientBoundary,
        },
        "Land Cover",
        false
      );

      Map.addLayer(
        lcmsRun.lcms.select(["Land_Use"]),
        {
          title: `Most common land use class from ${startYear} to ${endYear}.`,
          autoViz: true,
          layerType: "geeImageCollection",
          reducer: ee.Reducer.mode(),
          bounds: clientBoundary,
        },
        "Land Use",
        false
      );
    }

    lcmsRun.slowLoss = lcmsRunFuns.getMaskedWYr(lcmsRun.lcms.select(["Change", "Change_Raw_Probability_Slow_Loss"], ["Change", "Prob"]), 2);
    lcmsRun.slowLossCount = lcmsRun.slowLoss.select(["Year"]).count();
    lcmsRun.slowLoss = lcmsRun.slowLoss.qualityMosaic(summaryMethod);

    lcmsRun.fastLoss = lcmsRunFuns.getMaskedWYr(lcmsRun.lcms.select(["Change", "Change_Raw_Probability_Fast_Loss"], ["Change", "Prob"]), 3);
    lcmsRun.fastLossCount = lcmsRun.fastLoss.select(["Year"]).count();
    lcmsRun.fastLoss = lcmsRun.fastLoss.qualityMosaic(summaryMethod);

    lcmsRun.gain = lcmsRunFuns.getMaskedWYr(lcmsRun.lcms.select(["Change", "Change_Raw_Probability_Fast_Loss"], ["Change", "Prob"]), 4);
    lcmsRun.gainCount = lcmsRun.gain.select(["Year"]).count();
    lcmsRun.gain = lcmsRun.gain.qualityMosaic(summaryMethod);

    Map.addLayer(
      lcmsRun.fastLoss.select(["Year"]).set("bounds", clientBoundary),
      {
        title: `Year ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} rapid vegetation cover loss from an external event such as fire/harvest, or change from water inundation/desiccation, etc. from ${startYear} to ${endYear}.`,
        min: startYear,
        max: endYear,
        palette: declineYearPalette,
        layerType: "geeImage",
      },
      "Fast Loss Year"
    );

    if (analysisMode === "advanced") {
      Map.addLayer(
        lcmsRun.fastLoss.select(["Prob"]).set("bounds", clientBoundary).divide(100),
        {
          title: `Model confidence ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} rapid vegetation cover loss from an external event such as fire/harvest, or change from water inundation/desiccation, etc. from ${startYear} to ${endYear}.`,
          min: lcmsRun.minFastLossProb,
          max: 0.5,
          palette: declineProbPalette,
          layerType: "geeImage",
        },
        "Fast Loss Probability",
        false
      );
      Map.addLayer(
        lcmsRun.fastLossCount.set("bounds", clientBoundary),
        {
          title: `Duration of rapid vegetation cover loss from an external event such as fire/harvest, or change from water inundation/desiccation, etc. from ${startYear} to ${endYear}.`,
          layerType: "geeImage",
          min: 1,
          max: 5,
          palette: declineDurPalette,
          legendLabelLeft: "Year count =",
          legendLabelRight: "Year count >=",
        },
        "Fast Loss Duration",
        false
      );
    }

    Map.addLayer(
      lcmsRun.slowLoss.select(["Year"]).set("bounds", clientBoundary),
      {
        title: `Year ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} vegetation cover loss from a long-term trend event such as drought, tree mortality from insects or disease, etc. from ${startYear} to ${endYear}.`,
        min: startYear,
        max: endYear,
        palette: declineYearPalette,
        layerType: "geeImage",
      },
      "Slow Loss Year"
    );

    if (analysisMode === "advanced") {
      Map.addLayer(
        lcmsRun.slowLoss.select(["Prob"]).divide(100).set("bounds", clientBoundary),
        {
          title: `Model confidence ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} vegetation cover loss from a long-term trend event such as drought, tree mortality from insects or disease, etc. from ${startYear} to ${endYear}.`,
          min: lcmsRun.minSlowLossProb,
          max: 0.5,
          palette: declineProbPalette,
          layerType: "geeImage",
        },
        "Slow Loss Probability",
        false
      );
      Map.addLayer(
        lcmsRun.slowLossCount.set("bounds", clientBoundary),
        {
          title: `Duration of vegetation cover loss from a long-term trend event such as drought, tree mortality from insects or disease, etc. from ${startYear} to ${endYear}.`,
          layerType: "geeImage",
          min: 1,
          max: 5,
          palette: declineDurPalette,
          legendLabelLeft: "Year count =",
          legendLabelRight: "Year count >=",
        },
        "Slow Loss Duration",
        false
      );
    }

    Map.addLayer(
      lcmsRun.gain.select(["Year"]).set("bounds", clientBoundary),
      {
        title: `Year ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} vegetation cover gain from ${startYear} to ${endYear}.`,
        layerType: "geeImage",
        min: startYear,
        max: endYear,
        palette: gainYearPaletteA,
      },
      "Gain Year",
      false
    );
    if (analysisMode === "advanced") {
      Map.addLayer(
        lcmsRun.gain.select(["Prob"]).set("bounds", clientBoundary),
        {
          title: `Model confidence ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} vegetation cover gain from ${startYear} to ${endYear}.`,
          layerType: "geeImage",
          min: lcmsRun.minGainProb,
          max: 0.8,
          palette: recoveryProbPalette,
        },
        "Gain Probability",
        false
      );

      Map.addLayer(
        lcmsRun.gainCount.set("bounds", clientBoundary),
        {
          title: `Vegetation cover gain duration from ${startYear} to ${endYear}.`,
          layerType: "geeImage",
          min: 1,
          max: 5,
          palette: recoveryDurPalette,
          legendLabelLeft: "Year count =",
          legendLabelRight: "Year count >=",
        },
        "Gain Duration",
        false
      );
    }

    if (urlParams.addTCC2021 === true || urlParams.beta === true) {
      var nlcdTCC2021 = ee.ImageCollection("projects/nlcd-tcc/assets/CONUS-TCC/Final-products/2021-4").select([0]);
      var lcms = ee.ImageCollection(studyAreaDict[studyAreaName].final_collections[0]).filter('study_area=="CONUS"');
      var props = lcms.first().toDictionary().getInfo();
      var change = lcms.select(["Change"]);
      var changeNames = props["Change_class_names"];
      var changeValues = props["Change_class_values"];
      var changeDict = Object.fromEntries(zip(changeValues, changeNames));
      var lcmsTCC = joinCollections(change, nlcdTCC2021);
      var nlcdTCCYrs = lcmsTCC
        .aggregate_histogram("year")
        .keys()
        .getInfo()
        .map((n) => parseInt(n));

      var tccDiff = [];
      for (var i = 0; i < nlcdTCCYrs.length - 1; i++) {
        var yr1 = nlcdTCCYrs[i];
        var yr2 = nlcdTCCYrs[i + 1];
        var nlcdTCC2021Pre = ee.Image(lcmsTCC.filter(ee.Filter.calendarRange(yr1, yr1, "year")).first());
        var nlcdTCC2021Post = ee.Image(lcmsTCC.filter(ee.Filter.calendarRange(yr2, yr2, "year")).first());
        var diff = nlcdTCC2021Post
          .select(["Science_Percent_Tree_Canopy_Cover"])
          .subtract(nlcdTCC2021Pre.select(["Science_Percent_Tree_Canopy_Cover"]))
          .int16();
        var diffStack = ee
          .ImageCollection(
            changeValues.slice(1, 4).map((cv) => {
              var cb = nlcdTCC2021Post.select(["Change"]).eq(cv);
              return diff.updateMask(cb);
            })
          )
          .toBands()
          .rename(Object.values(changeDict).slice(1, 4));
        tccDiff.push(diffStack);
      }
      tccDiff = ee.ImageCollection(tccDiff);
      var tccGain = tccDiff.map((img) => img.updateMask(img.gte(0))).sum();
      var tccLoss = tccDiff.map((img) => img.updateMask(img.lte(0))).sum();

      Map.addLayer(
        tccLoss.select(["Slow Loss"]),
        {
          min: -50,
          max: -5,
          palette: "D00,F5DEB3",
          layerType: "geeImage",
          legendLabelLeftAfter: "% TCC",
          legendLabelRightAfter: "% TCC",
        },
        "TCC Slow Loss Mag",
        false
      );

      Map.addLayer(
        tccLoss.select(["Fast Loss"]),
        {
          min: -50,
          max: -5,
          layerType: "geeImage",
          palette: "D00,F5DEB3",
          legendLabelLeftAfter: "% TCC",
          legendLabelRightAfter: "% TCC",
        },
        "TCC Fast Loss Mag",
        false
      );
      Map.addLayer(
        tccGain.select(["Gain"]),
        {
          min: 0,
          max: 50,
          palette: "F5DEB3,006400",
          legendLabelLeftAfter: "% TCC",
          legendLabelRightAfter: "% TCC",
        },
        "TCC Gain Mag",
        false
      );

      var lcmsAttr = ee
        .ImageCollection("projects/lcms-292214/assets/CONUS-LCMS/Landcover-Landuse-Change/v2022-8/v2022-8-Change_Attribution")
        .filter(ee.Filter.calendarRange(startYear, endYear, "year"));
      // var lcmsAttr_AK = ee.ImageCollection('projects/lcms-292214/assets/R10/AK/Landcover-Landuse-Change/v2022-8-Change_Attribution').filter(ee.Filter.calendarRange(startYear,endYear,'year'));

      // lcmsAttr_merged = lcmsAttr.merge(lcmsAttr_AK)
      lcmsAttr_merged = lcmsAttr;

      var stack = [];
      ee.List.sequence(startYear, endYear)
        .getInfo()
        .map(function (year) {
          var imgYr = lcmsAttr_merged.filter(ee.Filter.calendarRange(year, year, "year"));
          imgYr = imgYr.mosaic().copyProperties(ee.Image(imgYr.first())).copyProperties(ee.Image(imgYr.first()), ["system:time_start"]);
          stack.push(imgYr);
        });

      lcmsAttr_stack = ee.ImageCollection(stack);

      var attrVals = JSON.parse(lcmsAttr_stack.first().toDictionary().getInfo().changeAttributionVals);
      // console.log('attrVals',attrVals)

      var palette = "3d4551,d54309,AD3100,FFFF00,C6C600,DAA520,FFB6C1,FF8397,897044,9EAAD7,898944,D8D898,D46C40,F39268,00A398,1B1716".split(",");

      var attrClassLegendDict = Object.fromEntries(zip(Object.keys(attrVals), palette).map(([k, v]) => [k, v]));
      var attrQueryDict = Object.fromEntries(zip(range(1, Object.keys(attrVals).length + 1), Object.keys(attrVals)).map(([k, v]) => [k, v]));
      // console.log('attrClassLegendDict',attrClassLegendDict)
      // console.log('attrQueryDict',attrQueryDict)
      // console.log(lcmsAttr.size().getInfo())

      Map.addTimeLapse(
        lcmsAttr_stack.map((img) => img.updateMask(img.gt(1).and(img.lt(16)))),
        {
          min: 1,
          max: 16,
          palette: palette,
          classLegendDict: attrClassLegendDict,
          queryDict: attrQueryDict,
        },
        "LCMS Change Attributes",
        false
      );
      // Map.addLayer(lcmsRun.lcms.select([0]),{autoViz:true},'Change')
      //Map.addTimeLapse(lcmsAttr_stack,{min:1,max:16,palette:palette,classLegendDict:attrClassLegendDict,queryDict:attrQueryDict},'LCMS Change Attributes',false)
    }

    //Bring in time lapses

    //Mask out stable and non processing area mask for change time lapse
    lcmsRun.tlChange = lcmsRun.lcms.select(["Change"]).map(function (img) {
      return img.updateMask(img.gte(2).and(img.lt(5))).copyProperties(img);
    });
    lcmsRun.tlLC = lcmsRun.lcms.select(["Land_Cover"]); //.map(function(img){return img.updateMask(img.lt(15)).copyProperties(img)});
    lcmsRun.tlLU = lcmsRun.lcms.select(["Land_Use"]); //.map(function(img){return img.updateMask(img.lt(7)).copyProperties(img)});

    if (urlParams.addLCMSTimeLapsesOn === "yes") {
      Map.addTimeLapse(lcmsRun.tlChange, { autoViz: true, years: lcmsRun.years }, "LCMS Change Time Lapse", false);
      Map.addTimeLapse(lcmsRun.tlLC, { autoViz: true, years: lcmsRun.years }, "LCMS Land Cover Time Lapse", false);
      Map.addTimeLapse(lcmsRun.tlLU, { autoViz: true, years: lcmsRun.years }, "LCMS Land Use Time Lapse", false);
    }

    //Set up pixel charting change time series
    lcmsRun.whichIndex = "NBR";

    //Bring in composites
    lcmsRun.composites = ee.ImageCollection(
      ee.FeatureCollection(studyAreaDict[studyAreaName].composite_collections.map((f) => ee.ImageCollection(f))).flatten()
    );

    lcmsRun.composites = ee.ImageCollection(
      ee.List.sequence(startYear, endYear, 1).map(function (yr) {
        return getImagesLib.simpleAddIndices(
          lcmsRun.composites.filter(ee.Filter.calendarRange(yr, yr, "year")).mosaic().set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis()),
          1
        );
      })
    );
    // Map.addTimeLapse(lcmsRun.composites.limit(5),{min:500,max:5000,bands:'swir1,nir,red'},'Composite Time Lapse');

    //Set up CCDC
    lcmsRun.ccdcIndicesSelector = ["tStart", "tEnd", "tBreak", "changeProb", lcmsRun.whichIndex + "_.*", "NDVI_.*"];
    lcmsRun.ccdc = ee.ImageCollection(
      ee
        .FeatureCollection(studyAreaDict[studyAreaName].ccdc_collections.map((f) => ee.ImageCollection(f).select(lcmsRun.ccdcIndicesSelector)))
        .flatten()
    );

    var f = ee.Image(lcmsRun.ccdc.first());
    var ccdcImg = ee.Image(lcmsRun.ccdc.mosaic().copyProperties(f));
    // printEE(ccdcImg.bandNames())
    var whichHarmonics = [1, 2, 3];
    var fillGaps = true;
    var fraction = 0.6657534246575343;
    var annualImages = changeDetectionLib.simpleGetTimeImageCollection(ee.Number(startYear + fraction), ee.Number(endYear + 1 + fraction), 1);
    lcmsRun.fittedCCDC = changeDetectionLib
      .predictCCDC(ccdcImg, annualImages, fillGaps, whichHarmonics)
      .select([lcmsRun.whichIndex + "_CCDC_fitted"], ["CCDC Fitted " + lcmsRun.whichIndex])
      .map(setSameDate);
    // console.log(lcmsRun.fittedCCDC.getInfo());
    //Set up LANDTRENDR
    lcmsRun.lt = ee
      .ImageCollection(ee.FeatureCollection(studyAreaDict[studyAreaName].lt_collections.map((f) => ee.ImageCollection(f))).flatten())
      .filter(ee.Filter.eq("band", lcmsRun.whichIndex))
      .select([0])
      .max();
    // Map.addLayer(lcmsRun.lt,{},'raw lt')
    lcmsRun.fittedAsset = changeDetectionLib
      .simpleLTFit(lcmsRun.lt, 1984, 2023, lcmsRun.whichIndex, true, 9)
      .select([`${lcmsRun.whichIndex}_LT_fitted`], ["LANDTRENDR Fitted " + lcmsRun.whichIndex])
      .map((i) => {
        return i.divide(10000).float().copyProperties(i, ["system:time_start"]);
      });
    // Map.addLayer(lcmsRun.fittedAsset,{},'lt fitted')
    //Join raw time series to lt fitted and ccdc fitted
    lcmsRun.changePixelChartCollection = joinCollections(
      lcmsRun.composites.select([lcmsRun.whichIndex], ["Raw " + lcmsRun.whichIndex]),
      lcmsRun.fittedAsset,
      false
    );
    lcmsRun.changePixelChartCollection = joinCollections(lcmsRun.changePixelChartCollection, lcmsRun.fittedCCDC, false);
    // console.log(lcmsRun.changePixelChartCollection.getInfo())
    //Set up change prob outputs for pixel charting
    lcmsRun.probCollection = lcmsRun.lcms
      .select(["Change_Raw_Probability_.*"], ["Slow Loss Probability", "Fast Loss Probability", "Gain Probability"])
      .map(function (img) {
        return img.divide(100).copyProperties(img, ["system:time_start"]);
      });

    lcmsRun.changePixelChartCollection = joinCollections(lcmsRun.changePixelChartCollection, lcmsRun.probCollection, false);

    pixelChartCollections["all-loss-gain-" + lcmsRun.whichIndex] = {
      label: "LCMS Change Time Series",
      collection: lcmsRun.changePixelChartCollection, //chartCollection.select(['Raw.*','LANDTRENDR.*','.*Loss Probability','Gain Probability']),
      chartColors: chartColorsDict.allLossGain2,
      tooltip: "Chart slow loss, fast loss, gain and the " + lcmsRun.whichIndex + " vegetation index",
      xAxisLabel: "Year",
      yAxisLabel: "Model Confidence or Index Value",
      fieldsHidden: [true, true, true, false, false, false],
    };
    lcmsRunFuns.addPixelChartClass = function (bn) {
      var bnTitle = bn.replaceAll("_", " ");
      var chartC = lcmsRun.lcms.select([`${bn}_Raw_Probability_.*`]);
      var fromBns = chartC.first().bandNames();
      var toBns = fromBns.map(function (bn) {
        bn = ee.String(bn).split("_");
        return bn.get(bn.length().subtract(1));
      });
      var colors = lcmsRun.props[`${bn}_class_palette`];
      chartC = chartC.select(fromBns, toBns);
      pixelChartCollections[bn] = {
        label: `LCMS ${bnTitle} Time Series`,
        collection: chartC, //chartCollection.select(['Raw.*','LANDTRENDR.*','.*Loss Probability','Gain Probability']),
        chartColors: colors,
        tooltip: `Chart ${bnTitle} model confidence for each individual class`,
        xAxisLabel: "Year",
        yAxisLabel: "Model Confidence",
      };
    };

    lcmsRunFuns.addPixelChartClass("Land_Cover");
    lcmsRunFuns.addPixelChartClass("Land_Use");

    //Populate area charting

    lcmsRun.changeForAreaCharting = formatAreaChartCollection(
      lcmsRun.lcms.select(["Change"]).map(function (img) {
        return img.unmask(0);
      }),
      [2, 3, 4, 5],
      ["Slow Loss", "Fast Loss", "Gain", "Non-Processing Area Mask"]
    );

    lcmsRunFuns.addAreaChartClass = function (bn) {
      var c = lcmsRun.lcms.select([bn]);

      var names = lcmsRun.props[`${bn}_class_names`];
      var numbers = lcmsRun.props[`${bn}_class_values`];
      var colors = lcmsRun.props[`${bn}_class_palette`];
      names = names.map((nm) => nm.replaceAll(" (SEAK Only)", ""));
      var areaC = formatAreaChartCollection(c, numbers, names);
      // console.log(areaC.first().bandNames().getInfo());
      var bnTitle = bn.replaceAll("_", " ");
      var fieldsHidden;
      if (bn === "Change") {
        fieldsHidden = [true, false, false, false, true];
      }

      // convertToStack(areaC, (xAxisProperty = "year"), (dateFormat = "YYYY"));
      areaChartCollections[bn] = {
        label: `LCMS ${bnTitle} Annual`,
        collection: areaC,
        stacked: false,
        steppedLine: false,
        tooltip: `Summarize ${bnTitle} classes for each year`,
        class_names: names,
        class_numbers: numbers,
        colors: colors,
        zonalReducer: ee.Reducer.frequencyHistogram(),
        xAxisLabel: "Year",
        fieldsHidden: fieldsHidden,
        dateFormat: "YYYY",
      };
    };

    var lcmsBnsForCharting = ["Change", "Land_Cover", "Land_Use"];
    lcmsBnsForCharting.map((bn) => {
      lcmsRunFuns.addAreaChartClass(bn);
    });
    if (endYear - startYear >= 5) {
      //&& urlParams.sankey==='true' || urlParams.beta ==='true' ){
      activeStartYear = startYear;
      activeEndYear = endYear;
      // $('#transition-year-interval-slider-container').show();
      setupTransitionPeriodUI();
      // $('#transition-periods-container').show();
      // updateSankeyPeriods(transitionChartYearInterval);

      lcmsBnsForCharting.map((bn) => {
        addSankey(lcmsRun, bn);
      });
    } else if (endYear - startYear < 5) {
      //&&(urlParams.sankey==='true' || urlParams.beta ==='true') ){
      // $('#transition-year-interval-slider-container').hide();
      $("#transition-periods-container").hide();
    }
    // $("#user-defined-area-chart-label").click();
    getSelectLayers(true);
    populatePixelChartDropdown();
    populateAreaChartDropdown();

    // $('#query-label').click()
    // $('#pixel-chart-label').click();
  }
}

// function runGTAC() {
//   let lcmsRun = {};
//   lcmsRun.lcms = studyAreaDict[studyAreaName].final_collections;
//   lcmsRun.lcms = ee.ImageCollection(ee.FeatureCollection(lcmsRun.lcms.map((f) => ee.ImageCollection(f).select(["Change", "Land_Cover", "Land_Use", ".*Probability.*"]))).flatten());
//   lcmsRun.lcms = lcmsRun.lcms.filter(ee.Filter.eq("study_area", "CONUS"));
//   lcmsRun.props = lcmsRun.lcms.first().toDictionary().getInfo();
//   console.log(lcmsRun.lcms.getInfo());

//   var lcmsRun = {};
//   lcmsRun.lcms = studyAreaDict[studyAreaName].final_collections;
//   lcmsRun.lcms = ee.ImageCollection(ee.FeatureCollection(lcmsRun.lcms.map((f) => ee.ImageCollection(f).select(["Change", "Land_Cover", "Land_Use", ".*Probability.*"]))).flatten());
//   // Map.addLayer(ee.Image(1))
//   Map.addFeatureView(
//     "USGS/WBD/2017/HUC08_FeatureView",
//     {
//       color: "808080",
//       lineWidth: 1,
//     },
//     "Feature View Test"
//   );
//   console.log(ee.Image(1).getInfo());
//   // Map.addLayer(lcmsRun.lcms.select([0,1,2]),{qusdaseryDateFormat:'YYYY-MM-dd-HH'});

//   // pixelChartCollections['test'] = {'label':'test',
//   //                                 'collection':lcmsRun.lcms,//chartCollection.select(['Raw.*','LANDTRENDR.*','.*Loss Probability','Gain Probability']),
//   //                                 'xAxisLabel':'Year',
//   //                                 'yAxisLabel':'Model Confidence or Index Value'}

//   // populatePixelChartDropdown();
//   // $('#query-label').click();
// }
// var tArea = ee.FeatureCollection([
//   ee.Feature(
//     ee.Geometry.Polygon(
//       [
//         [
//           [-111.45760650206141, 40.648752837173106],
//           [-111.45760650206141, 40.58933585265644],
//           [-111.36078948545985, 40.58933585265644],
//           [-111.36078948545985, 40.648752837173106],
//         ],
//       ],
//       null,
//       false
//     ),
//     {
//       "system:index": "0",
//     }
//   ),
// ]);

function runDynamic() {
  areaChart.clearLayers();
  let lcmsRun = {};
  let lcmap_dict = {
    LC_class_values: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    LC_class_names: ["Developed", "Cropland", "Grass/Shrub", "Tree Cover", "Water", "Wetlands", "Ice/Snow", "Barren", "Class Change"],
    LC_class_palette: ["E60000", "A87000", "E3E3C2", "1D6330", "476BA1", "BAD9EB", "FFFFFF", "B3B0A3", "A201FF"],
  };
  let lcpri = ee.ImageCollection("projects/sat-io/open-datasets/LCMAP/LCPRI").select(["b1"], ["LC"]);
  lcpri = lcpri.map((img) => img.set(lcmap_dict));
  // Map.addLayer(lcpri, { autoViz: true, canAreaChart: true, areaChartParams: { line: true, sankey: true } }, "LCMAP LC", true);
  // areaChart.addLayer(lcpri, { sankey: false }, "LCMAP LC Annual", false);
  // areaChart.addLayer(lcpri, { sankey: true }, "LCMAP LC Transition", false);
  lcmsRun.lcms = ee
    // .ImageCollection("projects/lcms-292214/assets/Final_Outputs/2022-8/HAWAII")
    .ImageCollection(studyAreaDict[studyAreaName].final_collections[0])
    .select(["Change", "Land_Cover", "Land_Use", ".*Probability.*"]);

  // .filter('study_area=="CONUS"');

  //Get properties image
  lcmsRun.f = ee.Image(lcmsRun.lcms.filter(ee.Filter.notNull(["Change_class_names"])).first());
  lcmsRun.props = lcmsRun.f.toDictionary().getInfo();
  // console.log(lcmsRun.props)
  // lcmsRun.lcms = ee
  //   .ImageCollection("projects/lcms-292214/assets/Final_Outputs/2022-8/HAWAII")
  //   // .ImageCollection(studyAreaDict[studyAreaName].final_collections[0])
  //   .select(["Change", "Land_Cover", "Land_Use", ".*Probability.*"])
  //   .filter(ee.Filter.calendarRange(1990, 2022, "year"));
  // .filter('study_area=="CONUS"');
  lcmsRun.lcms = lcmsRun.lcms.filter(ee.Filter.calendarRange(startYear, endYear, "year"));
  // lcmsRun.lcms = lcmsRun.lcms.map((img) => img.set(lcmsRun.props));
  // console.log(lcmsRun.lcms.aggregate_histogram ('study_area').getInfo())

  //Mosaic all study areas

  var tcc = ee.ImageCollection("USGS/NLCD_RELEASES/2021_REL/TCC/v2021-4").select([0, 2]); //.filter(ee.Filter.eq("study_area", "CONUS"));
  // Map.addLayer(
  //   lcmsRun.lcms.select(["Land_Cover"]), //(), //.set(lcmsRun.props),
  //   {
  //     // bands: "Land_Use",
  //     // mosaic: true,
  //     // dateFormat: "YYYY",
  //     // advanceInterval: "day",
  //     autoViz: true,
  //     canAreaChart: true,
  //     areaChartParams: { line: true, sankey: true },
  //   },
  //   "LCMS Land Cover",
  //   true
  // );
  let changeVisibility = [false, true, true, true, false];
  Map.addTimeLapse(
    lcmsRun.lcms.select(["Change"]).limit(10), //(), //.set(lcmsRun.props),
    {
      autoViz: true,
      canAreaChart: true,
      areaChartParams: {
        line: false,
        sankey: true,
        visible: changeVisibility,
        // sankeyTransitionPeriods: [
        //   [1990, 1991],
        //   [2000, 2005],
        // ],
      },
    },
    "LCMS Change",
    true
  );

  // Map.addLayer(
  //   lcmsRun.lcms.select(["Land_Cover"]).mode().set(lcmsRun.props),
  //   { autoViz: true, canAreaChart: true, areaChartParams: { line: true, sankey: false } },
  //   "LCMS Land Cover",
  //   true
  // );
  let raw = lcmsRun.lcms.select(["Land_Cover_Raw.*"]);
  let bns = raw.first().bandNames();
  let bnsOut = bns.map((bn) => ee.String(bn).split("Land_Cover_Raw_Probability_").get(1));

  // console.log(bns.getInfo());
  // console.log(bnsOut.getInfo());
  raw = raw.select(bns, bnsOut);
  // Map.addLayer(
  //   raw,
  //   {
  //     queryParams: { palette: lcmsRun.props.Land_Cover_class_palette },
  //     areaChartParams: { palette: lcmsRun.props.Land_Cover_class_palette },
  //     canAreaChart: true,
  //     bands: "Barren-or-Impervious,Trees,Water",
  //     min: 0,
  //     max: 30,
  //     reducer: ee.Reducer.stdDev(),
  //   },
  //   "LCMS Land Cover Raw ",
  //   true
  // );
  // Map.addLayer(lcms.select([2]), { autoViz: true, canAreaChart: true, line: true, sankey: true }, "LCMS Land Use", false);
  // console.log(tcc.first().toDictionary().getInfo());

  // lcmsRun.lcms = lcmsRun.lcms.map((img) => img.set("Change_class_visibility", changeVisibility));
  // console.log(lcmsRun.lcms.first().bandNames().getInfo());
  let allLossYearPalette = [
    "#ffffe5",
    "#fffddf",
    "#fffcd9",
    "#fffbd3",
    "#fffacd",
    "#fff9c7",
    "#fff7bc",
    "#fef4b5",
    "#fef1af",
    "#feeea9",
    "#feeba3",
    "#fee597",
    "#fee391",
    "#fede87",
    "#feda7e",
    "#fed574",
    "#fecc61",
    "#fec858",
    "#fec44f",
    "#febd49",
    "#feb744",
    "#feab39",
    "#fea533",
    "#fe9f2e",
    "#fe9929",
    "#fb9326",
    "#f68720",
    "#f3811d",
    "#f17b1a",
    "#ee7517",
    "#ec7014",
    "#e76a11",
    "#e2650e",
    "#de600c",
    "#d95b09",
    "#d55607",
    "#d05104",
    "#cc4c02",
  ];
  let changeClassDict = {
    // "Fast Loss": { code: 3, visible: true, palette: allLossYearPalette },
    // "Slow Loss": { code: 2, visible: true, palette: allLossYearPalette },
    // Gain: { code: 4, visible: false, palette: "c5ee93,00a398" },
  };

  Object.keys(changeClassDict).map((k) => {
    let changeYear = lcmsRun.lcms
      .select([0])
      .map((img) => ee.Image(img.date().get("year")).int16().rename(["year"]).updateMask(img.eq(changeClassDict[k].code)))
      .max();
    Map.addLayer(
      changeYear,
      {
        min: urlParams.startYear,
        max: urlParams.endYear,
        palette: changeClassDict[k].palette,
        canAreaChart: true,
        layerType: "geeImage",
        areaChartParams: { reducer: ee.Reducer.frequencyHistogram(), palette: changeClassDict[k].palette, rangeSlider: true },
      },
      k,
      changeClassDict[k].visible
    );
  });

  // Map.addLayer(lcms.select([0]), { autoViz: true, reducer: ee.Reducer.max() }, "LCMS Change", true);

  // areaChart.addLayer(lcms.select([0]), {}, "LCMS Change Annual");
  // areaChart.addLayer(lcms.select([1]), {}, "LCMS Land Cover Annual");
  // areaChart.addLayer(lcms.select([2]), {}, "LCMS Land Use Annual");
  // areaChart.addLayer(lcms.select([0, 1, 2]), { sankey: true }, "LCMS Transition", true);

  // areaChart.addLayer(lcms.select([0, 1, 2]), {}, "LCMS Annual");
  // areaChart.addLayer(lcms.select([1]), {}, "LCMS Cover", true);
  // areaChart.addLayer(lcms.select([2]), {}, "LCMS Use", false);
  // areaChart.addLayer(lcms.select([0, 1, 2]), {}, "LCMS All");
  // areaChart.addLayer(lcms.select([2]), { autoViz: true }, "test");

  // console.log(lcpri.first().bandNames().getInfo());
  // var f = ee.Geometry.Polygon(
  //   [
  //     [
  //       [-105.91375135016187, 40.242613115226675],
  //       [-105.91375135016187, 40.2352749347849],
  //       [-105.86637281012281, 40.2352749347849],
  //       [-105.86637281012281, 40.242613115226675],
  //     ],
  //   ],
  //   null,
  //   false
  // );

  // areaChart.chartArea(f, "test charting");
  var nlcd = ee.ImageCollection("USGS/NLCD_RELEASES/2019_REL/NLCD");
  // console.log(nlcd.first().bandNames().getInfo());
  nlcd = nlcd.select([0]);
  var nlcd_class_names = ee.List(nlcd.first().toDictionary().get("landcover_class_names"));
  nlcd_class_names = nlcd_class_names.map((nm) => {
    return ee.String(nm).split(": ").get(0);
  });

  // nlcd = nlcd.map((img) => img.set("landcover_class_names", nlcd_class_names));
  // console.log(nlcd_class_names.getInfo());
  // Map.addLayer(nlcd, { sankey: true }, "NLCD");
  // areaChart.sankeyTransitionPeriods = [
  //   [2001, 2004],
  //   [2019, 2019],
  // ];
  // areaChart.addLayer(
  //   nlcd,
  //   {
  //     sankey: true,
  //     sankeyTransitionPeriods: [
  //       [2001, 2004],
  //       [2019, 2019],
  //     ],
  //   },
  //   "NLCD"
  // );
  // areaChart.addLayer(nlcd, { sankey: true }, "NLCD Annual");
  // Map.addLayer(
  //   tcc,
  //   {
  //     canAreaChart: true,
  //     reducer: ee.Reducer.stdDev(),
  //     bands: "NLCD_Percent_Tree_Canopy_Cover",
  //     min: 0,
  //     max: 10,
  //     palette: "DDD,080",
  //     // areaChartParams: { palette: "080,0D0" },
  //   },
  //   "NLCD TCC",
  //   true
  // );
  // areaChart.addLayer(tcc, { visible: [true, true], palette: ["080", "0D0"] }, "NLCD TCC");
  // areaChart.addLayer(tcc, { reducer: ee.Reducer.median() }, "NLCD TCC Median");
  // areaChart.populateChartDropdown();

  // areaChart.sankeyTransitionPeriods = [
  //   [1995, 1997],
  //   [2010, 2014],
  //   [2019, 2019],
  // ];

  // getLCMSVariables();
  let mtbsBoundaries = ee.FeatureCollection("USFS/GTAC/MTBS/burned_area_boundaries/v1");
  mtbsBoundaries = mtbsBoundaries.map(function (f) {
    var d = ee.Date(f.get("Ig_Date")).millis();

    return f.set("system:time_start", f.get("Ig_Date"));
  });
  // // perims = ee.FeatureCollection(perims.copyProperties(mtbs,['bounds']));
  // // console.log(perims.get('bounds').getInfo())

  mtbsBoundaries = mtbsBoundaries.filterDate(ee.Date.fromYMD(urlParams.startYear, 1, 1), ee.Date.fromYMD(urlParams.endYear, 12, 31));
  i = ee.Image([1, 2]);
  // print(i.bandNames().getInfo());
  // Map.addLayer(i, {});

  lcms = ee.ImageCollection("USFS/GTAC/LCMS/v2022-8").filter('study_area=="CONUS"'); //.select([".*Raw.*"]);

  lcms = lcms.map((img) => img.set("Change_class_visibility", [false, true, true, true, false]));
  // lcms = lcms.map((img) => img.set("Land_Cover_class_palette", newPalette));
  // console.log(lcms.getInfo());
  // Map.addLayer(lcms.select([1]), {
  //   canAreaChart: true,
  //   areaChartParams: { reducer: ee.Reducer.frequencyHistogram(), sankey: true, showGrid: true, line: true },
  // });
  // console.log("starting");
  // console.log(ee.Algorithms.ObjectType(mtbsBoundaries).getInfo());
  // Map.addLayer(mtbsBoundaries);

  // Map.addSelectLayer(
  //   mtbsBoundaries,
  //   { strokeColor: "00F", layerType: "geeVectorImage", selectLayerNameProperty: "Incid_Name" },
  //   "MTBS Fire Boundaries",
  //   false,
  //   null,
  //   null,
  //   "MTBS Fire Boundaries"
  // );
  // ["Change", "Land_Cover", "Land_Use"].map((c) => {
  //   Map.addLayer(lcmsRun.lcms.select([c]), { canAreaChart: true, areaChartParams: { line: true, sankey: true } }, c);
  // });

  // areaChart.startAutoCharting();

  // Map.turnOnInspector();
  // chartUserDefinedArea = areaChart.chartUserDefinedArea;
  // Map.turnOnUserDefinedAreaCharting();
  // Map.turnOnSelectionAreaCharting();

  // getSelectLayers(true);
  // Map.turnOnInspector();
  // Map.addLayer(lcms);
  // Map.turnOnInspector();
  // Map.addLayer(f, {}, "area");
  // Map.centerObject(f);
  // areaChart.addLayer(lcmsRun.lcms);

  // areaChart.populateChartLayerSelect();
  Map.turnOnAutoAreaCharting();
  //   // console.log(lcms.first().select([".*_Raw_Prob.*"]).bandNames().getInfo());
  //   //   // const mapId = lcms.getMap({ min: 0, max: 60 });
  //   //   // const tileSource = new ee.layers.EarthEngineTileSource(mapId);

  //   //   // .map(img=>img.updateMask(img.gt(1)));
  //   Map.addLayer(
  //     lcms.select([0]),
  //     {
  //       //     layerType: "geeImageCollection",
  //       autoViz: true,
  //     },
  //     "Change"
  //   );
  //   Map.addLayer(
  //     lcms.select([1]),
  //     {
  //       //     layerType: "geeImageCollection",
  //       autoViz: true,
  //     },
  //     "Land Cover"
  //   );
  //   Map.addTimeLapse(
  //     lcms.select([2]).limit(3),
  //     {
  //       //     layerType: "geeImageCollection",
  //       autoViz: true,
  //     },
  //     "Land Use"
  //   );

  //   Map.addLayer(ee.Image(1), {}, "blank img");
  //   // console.log(lcms.mosaic().getMap())
  //   var monitoring_sites = ee.FeatureCollection("projects/gtac-lamda/assets/giant-sequoia-monitoring/Inputs/Trees_of_Special_Interest");
  //   Map.addLayer(
  //     monitoring_sites.map((f) => {
  //       return ee.Feature(f).buffer(300 / 2);
  //     }),
  //     {
  //       strokeColor: "FF0",
  //       fillColor: "0FF",
  //       fillOpacity: 1,
  //       layerType: "geeVector",
  //     },
  //     "Monitoring Sites 150",
  //     true,
  //     null,
  //     null,
  //     "Trees of special interest 150"
  //   );
  //   Map.addLayer(
  //     monitoring_sites.map((f) => {
  //       return ee.Feature(f).buffer(50);
  //     }),
  //     {
  //       strokeColor: "F0F",
  //       fillColor: "0F0",
  //       fillOpacity: 1,
  //       layerType: "geeVector",
  //     },
  //     "Monitoring Sites 50",
  //     true,
  //     null,
  //     null,
  //     "Trees of special interest 50"
  //   );
  //   Map.addLayer(
  //     lcms.select([".*_Raw_Prob.*"]),
  //     {
  //       //     layerType: "geeImageCollection",
  //       // autoViz: true,
  //     },
  //     "Probs"
  //   );
  //   // Map.addLayer(ee.FeatureCollection("projects/lcms-292214/assets/R8/PR_USVI/Ancillary/prusvi_boundary_buff2mile"), {}, "prusvi");

  //   Map.turnOnInspector();
  // var c = [];
  // range(0,1000).map(n=>c.push(ee.Image([n,n+1,n+2]).divide(1000).float()));
  // c = ee.ImageCollection(c);
  // console.log(c.size().getInfo())
  // Map.addLayer(c,{},'test')
  // Map.addLayer(lcms.select(['Land_Cover_Raw_Probability_Trees']),{'min':20,'max':80,'palette':['Ffff00','BlUe','green','green']},'lcms')
  //   var comps = ee.ImageCollection('projects/lcms-tcc-shared/assets/CONUS/Composites/Composite-Collection-yesL7')
  //   .select(['swir2','nir','red'])
  //   Map.addTimeLapse(comps.filter(ee.Filter.calendarRange(2000,2005,'year')),{mosaic:true,'queryDateFormat':'YYYY-MM-dd HH:mm'})//,{min:500,max:3500,bands:'swir2,nir,red'});
  //   Map.addLayer(comps.filter(ee.Filter.calendarRange(2021,2021,'year')).mosaic().divide(10000),{min:500,max:3500,bands:'swir2,nir,red'});
  //   Map.addLayer(comps.filter(ee.Filter.calendarRange(2021,2021,'year')),{min:500,max:3500,bands:'swir2,nir,red'});
  //   var ls = getImagesLib.getProcessedLandsatScenes(geometry,2015,2019,190,250).select(['swir2','red','NBR','NDVI','nir']);
  //   Map.addLayer(ls.sort('system:time_start',false),getImagesLib.vizParamsFalse,'LS')
  // Map.addLayer(ee.Image(1).multiply(0.001111111111111111111111),{palette:'lightblue',min:0,max:1,classLegendDict:{'test1':'lightblue'}})
  // Map.turnOnInspector();
  // Map.setTitle('test');
  // Map.setQueryCRS('EPSG:32611')
  // Map.setQueryTransform( [60, 0, -2361915, 0, -60, 3177735]);
  // Map.setQueryPrecision(4,0.01)
  // Map.setQueryDateFormat('YYYY-MM-dd HH:mm');
  // Map.setQueryBoxColor('#F00')

  //   // Map.addLayer(ee.Image([1,2,3]).toArray().addBands(ee.Image(1)));
  //   // Map.addLayer(ee.Image([1,2,3]).toArray());
  //   // Map.addLayer(ee.Image(1));
  //   // Map.addLayer(ee.Image([1,2,4]).float(),{queryDict:{1:'there',2:'hi',3:'you'}});
  //   // Map.addLayer(ee.Image('projects/rcr-gee/assets/lcms-training/lcms-training_module-3_landTrendr/LT_Raw_NDVI_yrs1984-2022_jds152-151'))
  // Map.addLayer(ee.ImageCollection('projects/rcr-gee/assets/lcms-training/lcms-training_module-3_CCDC').mosaic().multiply(10000).float())
  //   // var sa = ee.FeatureCollection('projects/lcms-292214/assets/R8/PR_USVI/Ancillary/prusvi_boundary');
  //   // Map.addLayer(sa)
  //   var props = ee.ImageCollection("USFS/GTAC/LCMS/v2022-8").first().toDictionary().getInfo();
  //   var tLcms = ee.ImageCollection('projects/rcr-gee/assets/lcms-training/lcms-training_module-6_assembledLCMSOutputs')
  //   tLcms = tLcms.map(img=> img.set(props))
  //   Map.addTimeLapse(tLcms.select(['Change']).limit(2),{autoViz:true})
  //   Map.addTimeLapse(tLcms.select(['Land_Cover']).limit(2),{autoViz:true})
  //   Map.addLayer(tLcms.select(['Land_Use']),{autoViz:true})

  //   var dataset = ee.ImageCollection('USGS/NLCD_RELEASES/2021_REL/NLCD');

  //   Map.addLayer(dataset.select([0]),{'autoViz':true},'NLCD')

  //   var lcms = ee.ImageCollection(studyAreaDict[studyAreaName].final_collections[0]).filter('study_area=="CONUS"');
  //   Map.addTimeLapse(lcms.select(['.*Probability.*']),{reducer:ee.Reducer.max(),min:0,max:30,classLegendDict:{'Non-Tree No Change':'000','Tree No Change':'0E0','Non-Tree Fast Loss':'E00','Tree Gain':'0FF','Tree Fast Loss':'FF0','Tree Fast Loss + Gain':'FFF'},bands:'Change_Raw_Probability_Fast_Loss,Land_Cover_Raw_Probability_Trees,Change_Raw_Probability_Gain'},'LCMS Change Composite')
  //   Map.addLayer(lcms.select(['Land_Cover']),{'autoViz':true,reducer:ee.Reducer.mode()},'LCMS',false)
  //   setTimeout(()=>{$('#query-label').click()},1000)
  //  s2s = getImagesLib.getProcessedSentinel2Scenes(geometry,2022,2022,190,250);
  //  console.log(s2s.size().getInfo())
  //  var lt = ee.ImageCollection(ee.FeatureCollection(studyAreaDict[studyAreaName].lt_collections.map(f => ee.ImageCollection(f))).flatten()).select([0]);
  //  Map.addLayer(lt.filter(ee.Filter.eq('band','NBR')).max())
  //  var ltStack = cdl.batchSimpleLTFit(lt,urlParams.startYear+20,urlParams.endYear,null,'band',true,6)
  //  print(ltStack.first().getInfo())
  //  Map.addTimeLapse(ltStack.limit(2),{min:getImagesLib.vizParamsFalse10k.min,max:getImagesLib.vizParamsFalse10k.max,bands:'swir1_LT_fitted,nir_LT_fitted,red_LT_fitted',gamma:getImagesLib.vizParamsFalse10k.gamma})
  //  Map.addLayer(s2s.median(),getImagesLib.vizParamsFalse,'test')
  //  Map.centerObject(geometry)
}
