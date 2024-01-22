function runLT() {
  var sensorLookup = { L4: "LANDSAT_4", L5: "LANDSAT_5", "L7-SLC-On": "LANDSAT_7", "L7-SLC-Off": "LANDSAT_7", L8: "LANDSAT_8", L9: "LANDSAT_9" };
  var whichSensors = [];
  Object.keys(urlParams.whichPlatforms).map((k) => {
    if (urlParams.whichPlatforms[k] == true) {
      whichSensors.push(sensorLookup[k]);
    }
  });

  // console.log(whichSensors);
  //////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////
  var hansen = ee.Image("UMD/hansen/global_forest_change_2021_v1_9").select(["lossyear"]).selfMask().add(2000);
  Map.addLayer(
    hansen,
    {
      min: startYear,
      max: endYear,
      palette: "ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02",
    },
    "Hansen Loss Year",
    false
  );

  var imgs = getImagesLib.getProcessedLandsatScenes({
    studyArea: eeBoundsPoly,
    startYear: urlParams.startYear,
    endYear: urlParams.endYear,
    startJulian: urlParams.startJulian,
    endJulian: urlParams.endJulian,
    applyCloudScore: urlParams.whichCloudMasks["cloudScore"],
    applyFmaskCloudMask: urlParams.whichCloudMasks["fMask-Cloud"],
    applyTDOM: urlParams.whichCloudMasks["TDOM"],
    applyFmaskCloudShadowMask: urlParams.whichCloudMasks["fMask-Cloud-Shadow"],
    applyFmaskSnowMask: urlParams.whichCloudMasks["fMask-Snow"],
    includeSLCOffL7: urlParams.whichPlatforms["L7-SLC-Off"],
  });

  imgs = imgs.filter(ee.Filter.inList("SPACECRAFT_ID", whichSensors));
  // console.log(imgs.aggregate_histogram("SPACECRAFT_ID").getInfo());
  var dummyImage = ee.Image(imgs.first());
  //Build an image collection that includes only one image per year, subset to a single band or index (you can include other bands - the first will be segmented, the others will be fit to the vertices). Note that we are using a mock function to reduce annual image collections to a single image - this can be accomplished many ways using various best-pixel-compositing methods.
  var years = [];
  var c = [];
  for (var year = urlParams.startYear; year <= urlParams.endYear; year++) {
    var imgsT = imgs.filter(ee.Filter.calendarRange(year - urlParams.yearBuffer, year + urlParams.yearBuffer, "year"));
    imgsT = getImagesLib.fillEmptyCollections(imgsT, dummyImage);
    var count = imgsT.select([0]).count();
    var img;
    if (urlParams.compMethod === "Median") {
      img = imgsT.median();
    } else {
      img = getImagesLib.medoidMosaicMSD(imgsT, ["nir", "swir1", "swir2"]);
    }

    img = img.updateMask(count.gte(urlParams.minObs)).set("system:time_start", ee.Date.fromYMD(year, 6, 1).millis());
    var nameEnd = (year - urlParams.yearBuffer).toString() + "-" + (year + urlParams.yearBuffer).toString();
    // print(year);
    // if(year%5 ==0 || year === startYear || year === endYear){
    //   Map.addLayer(img,{min:0.1,max:[0.4,0.6,0.4],bands:'swir2,nir,red'},'Composite '+nameEnd,false);
    // }
    Map.addExport(img.select(["blue", "green", "red", "nir", "swir1", "swir2"]).multiply(10000).int16(), "Landsat_Composite_" + nameEnd, 30, false, {});

    c.push(img);
    years.push(year);
  }
  var srCollection = ee.ImageCollection(c);
  // // console.log(srCollection.getInfo());
  // // Map.addLayer(srCollection.select(['NDVI','NBR']),{min:0.2,max:0.6,opacity:0},'Landsat Time Series',false);
  if (urlParams.maskWater === "Yes") {
    var jrcWater = ee.Image("JRC/GSW1_1/GlobalSurfaceWater").select([4]).gt(50);

    jrcWater = jrcWater.updateMask(jrcWater.neq(0)).reproject("EPSG:4326", null, 30);

    Map.addLayer(
      jrcWater,
      {
        min: 0,
        max: 1,
        palette: "000,00F",
        addToClassLegend: true,
        classLegendDict: {
          "Water 50% time or more 1984-2018": "00F",
        },
        queryDict: {
          1: "Water 50% time or more 1984-2018",
        },
        layerType: "geeImage",
      },
      "JRC Water",
      false
    );
    srCollection = srCollection.map((img) => img.updateMask(jrcWater.mask().not()));
  }

  // Run LT and get output stack
  var indexList = [];
  Object.keys(urlParams.whichIndices).map(function (index) {
    if (urlParams.whichIndices[index]) {
      indexList.push(index);
    }
  });
  var chartCollectionT = srCollection.select(indexList);
  var multBy = 1000;
  indexList.map((indexName) => {
    var ltOutputs = changeDetectionLib.simpleLANDTRENDR(
      srCollection,
      urlParams.startYear,
      urlParams.endYear,
      indexName,
      null,
      urlParams.lossMagThresh,
      urlParams.lossMagThresh,
      urlParams.gainMagThresh,
      urlParams.gainMagThresh,
      3,
      urlParams.LTSortBy,
      urlParams.LTSortBy,
      true,
      urlParams.howManyToPull,
      multBy
    );
    var lossGainStack = ltOutputs[1].int16();
    var rawLTForExport = ltOutputs[0];
    var lossStack = lossGainStack.select([".*_LT_loss_.*"]);
    var gainStack = lossGainStack.select([".*_LT_gain_.*"]);
    var nameEnd = `${urlParams.startYear}_${urlParams.endYear}_${urlParams.startJulian}_${urlParams.endJulian}}`;
    var lossName = `LandTrendr_${indexName}_${urlParams.LTSortBy}_Loss_Stack_` + nameEnd;
    var gainName = `LandTrendr_${indexName}_${urlParams.LTSortBy}_Gain_Stack_` + nameEnd;
    // Map.addLayer(lossStack, {}, "LossStack");
    Map.addExport(lossStack, lossName, 30, true, {}, -32768);
    Map.addExport(gainStack, gainName, 30, true, {}, -32768);

    var decompressedC = changeDetectionLib
      .simpleLTFit(rawLTForExport, urlParams.startYear, urlParams.endYear, indexName, true, changeDetectionLib.default_lt_run_params["maxSegments"], 1 / multBy)
      .select([".*_LT_fitted"]);
    // Map.addLayer(decompressedC, { layerType: "geeImageCollection" }, "Decompressed LT Output " + indexName, false);

    chartCollectionT = joinCollections(chartCollectionT, decompressedC, false);
  });

  pixelChartCollections["landsat"] = { label: "landsat", collection: chartCollectionT };
  populatePixelChartDropdown();
}
