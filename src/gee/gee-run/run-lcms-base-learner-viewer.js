function runBaseLearner() {
  var studyAreaName = "USFS LCMS 1984-2020";
  var startYear = urlParams.startYear;
  var endYear = urlParams.endYear;
  var bandPropertyName = "band";
  var arrayMode = true;
  var bandNames;
  var cdl = changeDetectionLib;
  var gil = getImagesLib;

  var whichIndices = Object.keys(whichIndices2).filter((k) => whichIndices2[k] == true);

  var composites = ee.ImageCollection(ee.FeatureCollection(studyAreaDict[studyAreaName].composite_collections.map((f) => ee.ImageCollection(f))).flatten());

  composites = ee.ImageCollection(
    ee.List.sequence(startYear, endYear, 1).map(function (yr) {
      return simpleAddIndices(
        composites
          .filter(ee.Filter.calendarRange(yr, yr, "year"))
          .mosaic()
          .select(["blue", "green", "red", "nir", "swir1", "swir2"])
          .divide(10000)
          .set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis())
      );
    })
  );
  let compViz = copyObj(gil.vizParamsFalse);
  compViz.reducer = ee.Reducer.median();
  Map.addLayer(composites, compViz, "Raw Composites", false);

  var lt = ee.ImageCollection(ee.FeatureCollection(studyAreaDict[studyAreaName].lt_collections.map((f) => ee.ImageCollection(f))).flatten());
  // Map.addLayer(lt.filter(ee.Filter.eq("band", "NBR")).max().select([0]), {}, "Raw LandTrendr");
  var lt_props = lt.first().toDictionary().getInfo();

  // Convert stacked outputs into collection of fitted, magnitude, slope, duration, etc values for each year
  // Divide by 10000 (0.0001) so values are back to original values (0-1 or -1-1)
  var lt_fit = cdl.batchSimpleLTFit(lt, startYear, endYear, bandNames, bandPropertyName, arrayMode, lt_props["maxSegments"], 0.0001);
  lt_fit = lt_fit.select([".*_fitted"]);
  var ltSynthViz = copyObj(getImagesLib.vizParamsFalse);
  ltSynthViz.bands = getImagesLib.vizParamsFalse.bands.split(",").map((bn) => `${bn}_LT_fitted`);
  ltSynthViz.reducer = ee.Reducer.median();
  // Vizualize image collection for charting (opacity set to 0 so it will chart but not be visible)
  // Map.addLayer(lt_fit.select(["NBR_LT_fitted"]), {}, "LT Fit TS", false);

  // Visualize fitted landTrendr composite
  // var fitted_bns = lt_fit.select([".*_fitted"]).first().bandNames();
  var final_lt_bns = whichIndices.map((bn) => `${bn}_LT_fitted`);
  var final_ccdc_bns = whichIndices.map((bn) => `${bn}_CCDC_fitted`);

  // var out_bns = fitted_bns.map((bn) => ee.String(bn).split("_").get(0));

  // var lt_synth = lt_fit.select(fitted_bns, out_bns);
  // .filter(ee.Filter.calendarRange(endYear - 1, endYear - 1, "year"))
  // .first();

  // Visualize as you would a composite
  Map.addLayer(lt_fit, ltSynthViz, "LT Synthetic Composite", false);

  // Iterate across each band to look for areas of change
  if (bandNames === null || bandNames === undefined) {
    bandNames = whichIndices;
  }
  bandNames.map(function (bandName) {
    // Do basic change detection with raw LT output
    var ltt = lt.filter(ee.Filter.eq(bandPropertyName, bandName)).mosaic();
    ltt = cdl.multLT(ltt, gil.changeDirDict[bandName] * 0.0001);

    var lossMagThresh = urlParams.lossMagThresh;
    var lossSlopeThresh = urlParams.lossMagThresh;
    var gainMagThresh = urlParams.gainMagThresh;
    var gainSlopeThresh = urlParams.gainMagThresh;
    var slowLossDurationThresh = 3;
    var chooseWhichLoss = "largest";
    var chooseWhichGain = "largest";
    var howManyToPull = 1;
    var lossGainDict = cdl.convertToLossGain(
      ltt,
      "arrayLandTrendr",
      lossMagThresh,
      lossSlopeThresh,
      gainMagThresh,
      gainSlopeThresh,
      slowLossDurationThresh,
      chooseWhichLoss,
      chooseWhichGain,
      howManyToPull
    );
    var lossGainStack = cdl.LTLossGainExportPrep(lossGainDict, bandName, 1);
    cdl.addLossGainToMap(lossGainStack, startYear, endYear, lossMagThresh - 0.7, lossMagThresh, gainMagThresh, gainMagThresh + 0.7);
  });

  // Map.addLayer(lt);

  // ////////////////////////////////////////////////////////////////////////////////////////

  var ccdcIndices = Object.keys(whichIndices2).filter((i) => whichIndices2[i]);
  var ccdcOriginalIndices = Object.keys(whichIndices2).filter((i) => whichIndices2[i]);
  if (ccdcIndices.indexOf("NDVI") == -1) {
    ccdcIndices.push("NDVI");
  }

  var ccdcAnnualBnsFrom = ccdcOriginalIndices.map(function (bn) {
    return bn + "_predicted";
  });
  var ccdcAnnualBnsTo = ccdcOriginalIndices.map(function (bn) {
    return bn + "_CCDC_fitted";
  });

  var ccdcIndicesSelector = ["tStart", "tEnd", "tBreak", "changeProb"].concat(
    ccdcIndices.map(function (i) {
      return i + "_.*";
    })
  );
  // var ccdcIndicesSelectorPrediction = ["tStart", "tEnd", "tBreak", "changeProb"].concat(
  //   ccdcOriginalIndices.map(function (i) {
  //     return i + "_.*";
  //   })
  // );
  // // console.log(ccdcIndicesSelector)

  var fraction = 0.6657534246575343;
  // var tEndExtrapolationPeriod = 1; //Period in years to extrapolate if needed

  var ccdcImg = ee
    .ImageCollection(ee.FeatureCollection(studyAreaDict[studyAreaName].ccdc_collections.map((f) => ee.ImageCollection(f))).flatten())
    .select(["tStart", "tEnd", "tBreak", "changeProb", "red.*", "nir.*", "swir1.*", "swir2.*", "NDVI.*", "NBR.*"]);
  var f = ee.Image(ccdcImg.first());
  ccdcImg = ee.Image(ccdcImg.mosaic().copyProperties(f)); //;

  // #Specify which harmonics to use when predicting the CCDC model
  // #CCDC exports the first 3 harmonics (1 cycle/yr, 2 cycles/yr, and 3 cycles/yr)
  // #If you only want to see yearly patterns, specify [1]
  // #If you would like a tighter fit in the predicted value, include the second or third harmonic as well [1,2,3]
  var whichHarmonics = [1, 2, 3];

  // Whether to fill gaps between segments' end year and the subsequent start year to the break date
  var fillGaps = false;

  // #Specify which band to use for loss and gain.
  // #This is most important for the loss and gain magnitude since the year of change will be the same for all years
  var changeDetectionBandName = "NDVI";

  // # Choose whether to show the most recent ('mostRecent') or highest magnitude ('highestMag') CCDC break
  var sortingMethod = "mostRecent";
  // ####################################################################################################
  // #Pull out some info about the ccdc image
  var startJulian = 1;
  var endJulian = 365;

  // #Add the raw array image
  Map.addLayer(ccdcImg, { opacity: 0 }, "Raw CCDC Output", false);

  // #Apply the CCDC harmonic model across a time series
  // #First get a time series of time images
  var yearImages = changeDetectionLib.getTimeImageCollection(startYear, endYear, startJulian, endJulian, 0.1);

  // #Then predict the CCDC models
  var ccdcFitted = changeDetectionLib.predictCCDC(ccdcImg, yearImages, fillGaps, whichHarmonics);
  var ccdcSynthViz = copyObj(getImagesLib.vizParamsFalse);
  ccdcSynthViz.bands = getImagesLib.vizParamsFalse.bands.split(",").map((bn) => `${bn}_CCDC_fitted`);
  ccdcSynthViz.reducer = ee.Reducer.median();

  var annualImages = changeDetectionLib.getTimeImageCollection(startYear, endYear + 1, startJulian, endJulian, 1);
  annualImages = annualImages.map((img) => setSameDate(img.add(fraction).copyProperties(img, ["system:time_start"]))); //.map(setSameDate);
  // #Then predict the CCDC models
  var annualPredictedCCDC = changeDetectionLib.predictCCDC(ccdcImg, annualImages, fillGaps, whichHarmonics);
  Map.addLayer(annualPredictedCCDC.select([".*_fitted"]), ccdcSynthViz, `CCDC Synthetic Composite`, false);

  // #Extract the change years and magnitude
  changeObj = changeDetectionLib.ccdcChangeDetection(ccdcImg, changeDetectionBandName);

  Map.addLayer(changeObj[sortingMethod]["loss"]["year"], { min: startYear, max: endYear, palette: changeDetectionLib.lossYearPalette }, "CCDC Loss Year");
  Map.addLayer(changeObj[sortingMethod]["loss"]["mag"], { min: -0.5, max: -0.1, palette: changeDetectionLib.lossMagPalette }, "CCDC Loss Mag", false);
  Map.addLayer(changeObj[sortingMethod]["gain"]["year"], { min: startYear, max: endYear, palette: changeDetectionLib.gainYearPalette }, "CCDC Gain Year", false);
  Map.addLayer(changeObj[sortingMethod]["gain"]["mag"], { min: 0.05, max: 0.2, palette: changeDetectionLib.gainMagPalette }, "CCDC Gain Mag", false);
  // Map.addLayer(fitted.filter(ee.Filter.calendarRange(1990, 1990, "year")).select([".*_fitted"]), ccdcSynthViz, "Fitted CCDC 1990", true);
  // console.log(fitted.first().bandNames().getInfo());

  // # Synthetic composites visualizing
  // # Take common false color composite bands and visualize them for the next to the last year

  // # First get the bands of predicted bands and then split off the name
  // fittedBns = fitted.select(['.*_fitted']).first().bandNames()
  // bns = fittedBns.map(lambda bn: ee.String(bn).split('_').get(0))

  // # Filter down to the next to the last year and a summer date range
  // compositeYear = endYear-1
  // syntheticComposites = fitted.select(fittedBns,bns)\
  // .filter(ee.Filter.calendarRange(compositeYear,compositeYear,'year'))
  // # .filter(ee.Filter.calendarRange(190,250)).first()

  // # Visualize output as you would a composite
  // getImagesLib.vizParamsFalse['dateFormat']='YYMMdd'
  // getImagesLib.vizParamsFalse['advanceInterval']='day'
  // Map.addTimeLapse(syntheticComposites,getImagesLib.vizParamsFalse,f'Synthetic Composite Time Lapse {compositeYear}')
  // ####################################################################################################
  // #Load the study region
  // studyArea = ccdcImg.geometry()
  // Map.addLayer(studyArea, {'strokeColor': '0000FF'}, "Study Area", False)

  // //Fix end date issue
  // var finalTEnd = ccdcImg.select("tEnd");
  // finalTEnd = finalTEnd.arraySlice(0, -1, null).rename("tEnd").arrayGet(0).add(tEndExtrapolationPeriod).toArray(0);
  // var tEnds = ccdcImg.select("tEnd");
  // tEnds = tEnds.arraySlice(0, 0, -1).arrayCat(finalTEnd, 0).rename("tEnd");
  // var keepBands = ccdcImg.bandNames().remove("tEnd");
  // ccdcImg = ccdcImg.select(keepBands).addBands(tEnds);
  // //Specify which harmonics to use when predicting the CCDC model
  // //CCDC exports the first 3 harmonics (1 cycle/yr, 2 cycles/yr, and 3 cycles/yr)
  // //If you only want to see yearly patterns, specify [1]
  // //If you would like a tighter fit in the predicted value, include the second or third harmonic as well [1,2,3]
  // var whichHarmonics = [1, 2, 3];

  // //Whether to fill gaps between segments' end year and the subsequent start year to the break date
  // var fillGaps = true;

  // //Specify which band to use for loss and gain.
  // //This is most important for the loss and gain magnitude since the year of change will be the same for all years
  // var changeDetectionBandName = "NDVI"; //ccdcIndices[0];
  // //////////////////////////////////////////////////////////////////////
  // //Pull out some info about the ccdc image
  // var startJulian = ccdcImg.get("startJulian").getInfo();
  // var endJulian = ccdcImg.get("endJulian").getInfo();
  // // var startYear = ccdcImg.get('startYear').getInfo();
  // // var endYear = ccdcImg.get('endYear').getInfo();

  // var changeObj = ccdcChangeDetection(ccdcImg, changeDetectionBandName);
  // changeObj.highestMag.loss.year = changeObj.highestMag.loss.year.mask(changeObj.highestMag.loss.year.gte(startYear).and(changeObj.highestMag.loss.year.lte(endYear)).selfMask());
  // changeObj.highestMag.loss.mag = changeObj.highestMag.loss.mag.mask(changeObj.highestMag.loss.year.gte(startYear).and(changeObj.highestMag.loss.year.lte(endYear)).selfMask());
  // changeObj.highestMag.gain.year = changeObj.highestMag.gain.year.mask(changeObj.highestMag.gain.year.gte(startYear).and(changeObj.highestMag.gain.year.lte(endYear)).selfMask());
  // changeObj.highestMag.gain.mag = changeObj.highestMag.gain.mag.mask(changeObj.highestMag.gain.year.gte(startYear).and(changeObj.highestMag.gain.year.lte(endYear)).selfMask());

  // Map.addLayer(
  //   changeObj.highestMag.loss.year,
  //   {
  //     min: startYear,
  //     max: endYear,
  //     palette: lossYearPalette,
  //     layerType: "geeImage",
  //   },
  //   "CCDC Loss Year"
  // );
  // Map.addLayer(
  //   changeObj.highestMag.loss.mag,
  //   {
  //     min: -0.5,
  //     max: -0.1,
  //     palette: lossMagPalette,
  //     layerType: "geeImage",
  //   },
  //   "CCDC Loss Mag",
  //   false
  // );
  // Map.addLayer(
  //   changeObj.highestMag.gain.year,
  //   {
  //     min: startYear,
  //     max: endYear,
  //     palette: gainYearPalette,
  //     layerType: "geeImage",
  //   },
  //   "CCDC Gain Year",
  //   false
  // );
  // Map.addLayer(
  //   changeObj.highestMag.gain.mag,
  //   {
  //     min: 0.05,
  //     max: 0.2,
  //     palette: gainMagPalette,
  //     layerType: "geeImage",
  //   },
  //   "CCDC Gain Mag",
  //   false
  // );

  // var yearImages = simpleGetTimeImageCollection(ee.Number(startYear), ee.Number(endYear + 1), 1 / 24);
  // var predicted = predictCCDC(ccdcImg, yearImages, fillGaps, whichHarmonics).select(ccdcAnnualBnsFrom, ccdcAnnualBnsTo);

  // var annualImages = simpleGetTimeImageCollection(ee.Number(startYear + fraction), ee.Number(endYear + 1 + fraction), 1);

  // console.log(annualPredictedCCDC.first().getInfo());
  // // console.log(ccdcIndicesSelectorPrediction)
  // var annualPredicted = predictCCDC(ccdcImg, annualImages, fillGaps, whichHarmonics)
  //   .select(ccdcAnnualBnsFrom, ccdcAnnualBnsTo)
  //   .map(function (img) {
  //     return ee.Image(multBands(img, 1, 10000)).int16();
  //   });
  // // Map.addLayer(ee.Image(annualPredicted.filter(ee.Filter.calendarRange(2020,2020,'year')).first()),{},'ccdc 2020')
  // // Map.addLayer(ccdcImg,{opacity:0},'CCDC Img')
  // // var recent = ccdcImg.select('tEnd');
  // // recent = recent.arraySlice(0,-1,null).rename('tEnd').arrayGet(0)
  // // var missing2020 = recent.lte(2020+fraction).and(recent.gte(2020));
  // // Map.addLayer(missing2020,{min:0,max:1},'missing2020');
  // // var missing2019 = recent.lte(2019+fraction).and(recent.gte(2019));
  // // Map.addLayer(missing2019,{min:0,max:1},'missing2019');
  // // var missing2018 = recent.lte(2018+fraction).and(recent.gte(2018));
  // // Map.addLayer(missing2018,{min:0,max:1},'missing2018');
  // // Map.addLayer(annualPredicted,{opacity:0},'annual predicted')
  // var lossGainLT = ee.Image(getLossGainLT(lt.filter(ee.Filter.eq("band", indexName)).mosaic(), 1984, 2021, 1, 6, "yrs_vert_", "fit_vert_", -1, lossThresh, gainThresh));
  // var lossGainLTEndYear = lossGainLT.select(["loss_year", "gain_year"]).rename(["LT_loss_endYear", "LT_gain_endYear"]);
  // var lossGainLTStartYear = lossGainLT
  //   .select(["loss_year", "gain_year"])
  //   .subtract(lossGainLT.select(["loss_dur", "gain_dur"]))
  //   .rename(["LT_loss_startYear", "LT_gain_startYear"]);

  // var ccdcStartYear = ee.Image.cat([changeObj.highestMag.loss.year, changeObj.highestMag.gain.year]).subtract(1).rename(["CCDC_loss_startYear", "CCDC_gain_startYear"]);
  // var ccdcEndYear = ee.Image.cat([changeObj.highestMag.loss.year, changeObj.highestMag.gain.year]).rename(["CCDC_loss_endYear", "CCDC_gain_endYear"]);

  // var areaImage = ee.Image.cat([lossGainLTStartYear, ccdcStartYear, lossGainLTEndYear, ccdcEndYear]).unmask(0).int16();
  // // console.log(areaImage.getInfo());
  // var scenarios = {
  //   "LT & CCDC Loss": [1, 0, 1, 0],
  //   "LT Loss": [1, 0, 0, 0],
  //   "CCDC Loss": [0, 0, 1, 0],
  //   "LT & CCDC Gain": [0, 1, 0, 1],
  //   // 'LT Loss & CCDC Gain': [1,0,0,1],
  //   // 'LT Gain & CCDC Loss':[0,1,1,0],

  //   "LT Gain": [0, 1, 0, 0],

  //   "CCDC Gain": [0, 0, 0, 1],
  // };
  // function getCondYrMsk(yr) {
  //   var yrConstImg = ee.Image.constant(yr).int16();
  //   var t = areaImage
  //     .select([0, 1, 2, 3])
  //     .lt(yrConstImg)
  //     .and(areaImage.select([4, 5, 6, 7]).gte(yrConstImg));
  //   return t;
  // }
  // // var t = getCondYrMsk(2016);
  // // Map.addLayer(t,{},'t const')
  // var areaC = ee.ImageCollection(
  //   ee.List.sequence(startYear, endYear).map(function (yr) {
  //     yr = ee.Number(yr).int16();
  //     var yrCondImg = getCondYrMsk(yr);
  //     var yrImg = ee
  //       .ImageCollection(
  //         Object.keys(scenarios).map(function (k) {
  //           var t = yrCondImg.eq(ee.Image.constant(scenarios[k]).byte()).reduce(ee.Reducer.min());
  //           return t;
  //         })
  //       )
  //       .toBands()
  //       .byte();
  //     yrImg = yrImg.rename(Object.keys(scenarios)).set("system:time_start", ee.Date.fromYMD(yr, 6, 1).millis());
  //     return yrImg;
  //   })
  // );

  // // Map.addLayer(ee.Image(areaImage),{'opacity':0},'area image')
  // // Map.addLayer(areaC,{'opacity':0},'area collection');
  // // $('#query-label').click();

  // areaChartCollections["lg-" + indexName] = {
  //   label: "LandTrendr and CCDC Loss/Gain",
  //   collection: areaC,
  //   stacked: false,
  //   steppedLine: false,
  //   tooltip: "Summarize loss and gain for each year from LandTrendr and CCDC",
  //   colors: palettes.colorbrewer.RdBu[6],
  //   xAxisLabel: "Year",
  //   dateFormat: "YYYY",
  // };

  // var fraction = ee.Number(ee.Date.fromYMD(1900, 9, 1).getFraction("year"));
  // var outBns = ee
  //   .Image(predicted.first())
  //   .bandNames()
  //   .map(function (bn) {
  //     return ee.String(bn).cat("_Annualized");
  //   });
  // predicted = predicted.map(function (img) {
  //   var f = ee.Number(ee.Date(img.get("system:time_start")).getFraction("year"));
  //   var m = ee.Image(fraction.subtract(f).abs().lt(0.01));
  //   var masked = img.updateMask(m).rename(outBns);

  //   return masked.addBands(img).copyProperties(img, ["system:time_start"]);
  // });
  // // Map.addLayer(maskedPredicted.select(['.*_Annualized']),{opacity:0},'CCDC Time Series');

  // fittedLTCCDCTS = joinCollections(fittedTS, annualPredicted.map(setSameDate), false);
  fittedTS = getImagesLib.joinCollections(
    composites.select(
      whichIndices,
      whichIndices.map(function (nm) {
        return "Raw_" + nm;
      })
    ),
    lt_fit.select(final_lt_bns),
    false
  );
  fittedTS = getImagesLib.joinCollections(fittedTS, annualPredictedCCDC.select(final_ccdc_bns), false);

  // console.log(fittedTS.first().getInfo());
  // Map.addLayer(fittedTS, {}, "Raw and LT Fitted");
  var ltPalette = palettes.niccoli.isol[7].reverse();
  var ltFitColors = ee.List.sequence(0, 6, 7 / whichIndices.length)
    .getInfo()
    .map(function (i) {
      i = Math.floor(i);
      return ltPalette[i % 7];
    });
  ltFitColors.map(function (c) {
    ltFitColors.push(invertColor(c));
  });
  // // console.log(ltFitColors)
  // pixelChartCollections["LT_Fit"] = {
  //   label: "LANDTRENDR Fitted Time Series",
  //   collection: fittedTS,
  //   xAxisLabel: "Year",
  //   tooltip: "Query LANDTRENDR fitted value for each year",
  //   // chartColors: ltFitColors,
  // };
  let indicesUsed = whichIndices;
  var ltCCDCPalette = palettes.niccoli.isol[7].reverse();
  var ltCCDCFitColors = ee.List.sequence(0, 6, 7 / indicesUsed.length)
    .getInfo()
    .map(function (i) {
      i = Math.floor(i);
      return ltPalette[i % 7];
    });

  var ltCCDCFitColorsFull = ltCCDCFitColors;
  // console.log(ltCCDCFitColorsFull)
  var opposites = ltCCDCFitColors.map(invertColor);
  var offsetOpposites = opposites.map(function (hex) {
    return offsetColor(hex, 25);
  });
  ltCCDCFitColorsFull = ltCCDCFitColorsFull.concat(opposites);
  ltCCDCFitColorsFull = ltCCDCFitColorsFull.concat(offsetOpposites);
  ltCCDCFitColorsFull = ltCCDCFitColorsFull.concat(
    ltCCDCFitColors.map(function (hex) {
      return offsetColor(hex, 10);
    })
  );
  // console.log(ltCCDCFitColorsFull);
  ltCCDCFitColorsFull = ltCCDCFitColorsFull.concat(
    ltCCDCFitColors.map(function (hex) {
      return offsetColor(hex, 20);
    })
  );
  // console.log(ltCCDCFitColorsFull);
  ltCCDCFitColors.map(function (c) {
    ltCCDCFitColors.push(invertColor(c));
  });
  // printEE(fittedLTCCDCTS.limit(2));
  var colorsN = indicesUsed.length;
  if (colorsN === 1) {
    colorsN = 3;
  }
  pixelChartCollections["LT_CCDC_Fit"] = {
    label: "Raw Composite, LandTrendr, and CCDC Fitted Time Series",
    collection: fittedTS,
    xAxisLabel: "Year",
    tooltip: "Query Raw Composite, LandTrendr, and CCDC fitted value for each year",
    chartColors: palettes.colorbrewer.Set1[9],
  };

  var ccdcFitColors = ee.List.sequence(0, 6, 7 / 2)
    .getInfo()
    .map(function (i) {
      i = Math.floor(i);
      return ltPalette[i % 7];
    });
  ccdcFitColors.map(function (c) {
    ccdcFitColors.push(invertColor(c));
  });
  pixelChartCollections["ccdcTS"] = {
    label: "CCDC Fitted Time Series",
    collection: ccdcFitted.select(final_ccdc_bns),
    xAxisLabel: "Date",
    tooltip: "Query CCDC time series",
    chartColors: ccdcFitColors,
    semiSimpleDate: true,
  };

  // // function simpleGetTimeImageCollection(startYear,endYear,step){
  // // var CCDCchange = getCCDCChange2(ccdc,'B4',-1,'_tBreak','_MAG','_changeProb',ccdcChangeProbThresh,365.25,startYear,endYear);
  // // Map.addExport(CCDCchange.lossYears.reduce(ee.Reducer.max()).addBands(CCDCchange.lossMags.reduce(ee.Reducer.max())).addBands(CCDCchange.gainYears.reduce(ee.Reducer.max())).addBands(CCDCchange.gainMags.reduce(ee.Reducer.max())).int16().unmask(-32768,false),'CCDC Loss Gain Stack '+ startYear.toString() + ' '+ endYear.toString() ,30,false,{})
  // // Map.addLayer(CCDCchange.lossYears.reduce(ee.Reducer.max()),{min:startYear,max:endYear,palette:lossYearPalette},'CCDC Loss Year',false);
  // // Map.addLayer(CCDCchange.lossMags.reduce(ee.Reducer.max()).multiply(-1),{min:200,max:600,palette:lossMagPalette},'CCDC Loss Mag',false);

  // // Map.addLayer(CCDCchange.gainYears.reduce(ee.Reducer.max()),{min:startYear,max:endYear,palette:gainYearPalette},'CCDC Gain Year',false);
  // // Map.addLayer(CCDCchange.gainMags.reduce(ee.Reducer.max()),{min:1000,max:3000,palette:gainMagPalette},'CCDC Gain Mag',false);

  // // Map.addTimeLapse(composites,{min:500,max:[4500,6500,4500],gamma:1.6,bands:'swir1,nir,red',years:ee.List.sequence(startYear,endYear).getInfo()},'Composite Time Lapse');
  // Map.addTimeLapse(
  //   composites,
  //   {
  //     bands: "red,green,blue",
  //     max: [0.2 * 10000, 0.2 * 10000, 0.2 * 10000],
  //     min: 0,
  //     years: ee.List.sequence(startYear, endYear).getInfo(),
  //   },
  //   "Composite Time Lapse"
  // );

  // // function getTerraPulseTileFunction(url){
  // //   return function(coord, zoom) {
  // //                     var tilesPerGlobe = 1 << zoom;
  // //                     var x = coord.x % tilesPerGlobe;
  // //                     if (x < 0) {
  // //                         x = tilesPerGlobe+x;
  // //                     }
  // //                     return url+ zoom + "/" + x + "/-" + coord.y +".png";
  // //                     }
  // // }
  // // Map.addLayer(getTerraPulseTileFunction('https://tpts01.terrapulse.com:8090/map/tcc_83_global_2015/'),{layerType:'tileMapService'},'Terra Pulse Tree Cover',true)
  // // Map.addLayer(getTerraPulseTileFunction('https://tpts01.terrapulse.com:8090/map/loss_2010_2015_30p/'),{layerType:'tileMapService',addToClassLegend:true,classLegendDict:{'Loss':'F00'}},'Terra Pulse Loss',true)
  // // var hansen = ee.Image("UMD/hansen/global_forest_change_2019_v1_7").select([0])
  // // Map.addLayer(hansen,{min:1,max:90,palette:palettes.crameri.bamako[50].reverse()},'Hansen 2000 Global Tree Cover')

  // pixelChartCollections["composites"] = {
  //   label: "Composite Time Series",
  //   collection: composites.select(["blue", "green", "red", "nir", "swir1", "swir2"]),
  // };
  populatePixelChartDropdown();
  // populateAreaChartDropdown();
  // getLCMSVariables();
  // getSelectLayers(true);
  Map.turnOnTimeSeriesCharting();
}
