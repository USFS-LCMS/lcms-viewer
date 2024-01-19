function runLT() {
  // startYear = parseInt(urlParams.startYear);
  // endYear = parseInt(urlParams.endYear);
  // startJulian = parseInt(urlParams.startJulian);
  // endJulian = parseInt(urlParams.endJulian);
  // yearBuffer = parseInt(urlParams.yearBuffer);
  // minObs = parseInt(urlParams.minObs);
  // LTSortBy = urlParams.LTSortBy;
  // lossMagThresh = parseFloat(urlParams.lossMagThresh);
  // lossSlopeThresh = parseFloat(urlParams.lossSlopeThresh);
  // gainMagThresh = parseFloat(urlParams.gainMagThresh);
  // gainSlopeThresh = parseFloat(urlParams.gainSlopeThresh);
  // howManyToPull = parseInt(urlParams.howManyToPull);
  // maxSegments = parseInt(urlParams.maxSegments);

  // var weight = 1;
  // var weights = weight.repeat(urlParams.yearBuffer+1)

  // var allImages = getImagesLib.getLandsatWrapper({
  //   'studyArea':eeBoundsPoly,
  //   'startYear':urlParams.startYear,
  //   'endYear':urlParams.endYear,
  //   'startJulian':urlParams.startJulian,
  //   'endJulian':urlParams.endJulian,
  //   'timebuffer':urlParams.yearBuffer,
  //   'weights':weights,
  //   'compositingMethod':urlParams.compMethod,
  //   'toaOrSR':'SR',
  //   'includeSLCOffL7':urlParams.whichPlatforms['L7-SLC-Off'],
  //   'defringeL5':true,
  //   'applyCloudScore':urlParams.whichCloudMasks['cloudScore'],
  //   'applyFmaskCloudMask':urlParams.whichCloudMasks['fMask-Cloud'],
  //   'applyTDOM':urlParams.whichCloudMasks['TDOM'],
  //   'applyFmaskCloudShadowMask':urlParams.whichCloudMasks['fMask-Cloud-Shadow'],
  //   'applyFmaskSnowMask':urlParams.whichCloudMasks['fMask-Snow'],
  //   'cloudScoreThresh':10,
  //   'performCloudScoreOffset':true,
  //   'cloudScorePctl':10,
  //   'zScoreThresh':-1,
  //   'shadowSumThresh':0.35,
  //   'contractPixels':1.5,
  //   'dilatePixels':3.5,
  //   'correctIllumination':false,
  //   'correctScale':250,
  //   'exportComposites':false,
  //   'outputName':'Landsat-Composite',
  //   'exportPathRoot':'users/ianhousman/test',
  //   'crs':'EPSG:5070',
  //   'transform':[30,0,-2361915.0,0,-30,3177735.0],
  //   'scale':null,
  //   'resampleMethod':'near',
  //   'harmonizeOLI': false,
  //   'preComputedCloudScoreOffset':null,
  //   'preComputedTDOMIRMean':null,
  //   'preComputedTDOMIRStdDev':null,
  //   'landsatCollectionVersion':'C2'
  //   })
  // var images = allImages.processedScenes;
  // var composites = allImages.processedComposites;
  // Map.addLayer(composites.limit(5),getImagesLib.vizParamsFalse,'Composite Time Lapse Wrapper')
  // var allImages = getImagesLib.getProcessedLandsatScenes({
  //   'studyArea':eeBoundsPoly,
  //   'startYear':urlParams.startYear,
  //   'endYear':urlParams.endYear,
  //   'startJulian':urlParams.startJulian,
  //   'endJulian':urlParams.endJulian})
  // var composites = range(urlParams.startYear,urlParams.endYear+1).map(yr=>{
  //   var t = allImages.filter(ee.Filter.calendarRange(yr,yr,'year')).median();
  //   t = t.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
  //   return t

  // });
  // composites = ee.ImageCollection(composites);
  // Map.addLayer(composites.limit(5),getImagesLib.vizParamsFalse,'Composite Time Lapse Basic')
  // Map.turnOnInspector();
  // composites = composites.map(img=>img.updateMask(img.select(['compositeObsCount']).gte(urlParams.minObs)));
  // range(urlParams.startYear,urlParams.endYear+1).map(year=>{
  //   var img = composites.filter(ee.Filter.calendarRange(year,year,'year')).first();
  //   var nameEnd = (year-urlParams.yearBuffer).toString() + '-'+ (year+urlParams.yearBuffer).toString();
  //   Map.addExport(img.select(['blue','green','red','nir','swir1','swir2']).multiply(10000).int16(),'Landsat_Composite_'+ nameEnd,30,false,{});
  // })

  // LTSortBy = urlParams.LTSortBy;
  // lossMagThresh = parseFloat(urlParams.lossMagThresh);
  // lossSlopeThresh = parseFloat(urlParams.lossSlopeThresh);
  // gainMagThresh = parseFloat(urlParams.gainMagThresh);
  // gainSlopeThresh = parseFloat(urlParams.gainSlopeThresh);
  // howManyToPull = parseInt(urlParams.howManyToPull);
  // maxSegments = parseInt(urlParams.maxSegments);

  //Run LT and get output stack
  // var indexList = [];
  // Object.keys(urlParams.whichIndices).map(function(index){if(urlParams.whichIndices[index]){indexList.push(index)}})
  // console.log(indexList)
  // indexList.map(indexName=>{
  //   var ltOutputs = simpleLANDTRENDR(composites,urlParams.startYear,urlParams.endYear,indexName,null,
  //     urlParams.lossMagThresh,urlParams.lossMagThresh,urlParams.gainMagThresh,urlParams.gainMagThresh,3,
  //     urlParams.LTSortBy,urlParams.LTSortBy,true,urlParams.howManyToPull,10000);
  // })

  // if(exportLTLossGain){
  // var lossGainStack = ltOutputs[1];
  // // Export  stack
  // var exportName = outputName + '_LT_LossGain_Stack_'+indexName+'_'+startYear.toString()+'_'+endYear.toString()
  //     +'_'+startJulian.toString()+'_'+endJulian.toString();

  // var exportPath = exportPathRoot + '/'+ exportName;

  // var lossGainStack = lossGainStack.set({'startYear':startYear,
  //                           'endYear':endYear,
  //                           'startJulian':startJulian,
  //                           'endJulian':endJulian,
  //                           'band':indexName});
  // lossGainStack =lossGainStack.set(run_params);

  // //Set up proper resampling for each band
  // //Be sure to change if the band names for the exported image change
  // var pyrObj = {'_yr_':'mode','_dur_':'mode','_mag_':'mean','_slope_':'mean'};
  // var possible = ['loss','gain'];
  // var outObj = {};
  // possible.map(function(p){
  // Object.keys(pyrObj).map(function(key){
  // ee.List.sequence(1,howManyToPull).getInfo().map(function(i){
  // var kt = indexName + '_LT_'+p + key+i.toString();
  // outObj[kt]= pyrObj[key];
  // });
  // });
  // });
  // print(outObj)
  // Export output
  // gil.exportToAssetWrapper(lossGainStack,exportName,exportPath,outObj,studyArea,scale,crs,transform);
  // }

  // // Export raw LandTrendr array image
  // if(exportLTVertexArray){
  // var rawLTForExport = ltOutputs[0];
  // Map.addLayer(rawLTForExport,{},'Raw LT For Export '+indexName,false);

  // rawLTForExport = rawLTForExport.set({'startYear':startYear,
  //                           'endYear':endYear,
  //                           'startJulian':startJulian,
  //                           'endJulian':endJulian,
  //                           'band':indexName});
  // rawLTForExport =rawLTForExport.set(run_params);
  // exportName = outputName+'_LT_Raw_'+indexName+'_'+startYear.toString()+'_'+endYear.toString();
  //     +'_'+startJulian.toString()+'_'+endJulian.toString();
  // exportPath = exportPathRoot + '/'+ exportName;
  // gil.exportToAssetWrapper(rawLTForExport,exportName,exportPath,{'.default':'sample'},studyArea,scale,crs,transform);
  // // Reverse for modeling
  // var decompressedC = cdl.simpleLTFit(rawLTForExport,startYear,endYear,indexName,true,run_params['maxSegments']);
  // Map.addLayer(decompressedC,{},'Decompressed LT Output '+indexName,false);
  // }
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

  //   Object.keys(urlParams.whichPlatforms).map(function(k){
  //     // console.log(k);console.log(whichPlatforms[k]);console.log(platformObj[k].getInfo())
  //     if(urlParams.whichPlatforms[k] || urlParams.whichPlatforms[k] === 'true'){
  //       if(imgs === undefined){imgs = platformObj[k];
  //       }else{imgs = imgs.merge(platformObj[k])
  //       }
  //     }
  //   })

  //   imgs = imgs.map(function(img){return applyScaleFactors(img,'C2')
  //   });

  //   Object.keys(whichCloudMasks).map(function(k){
  //     if(whichCloudMasks[k]){
  //       if(k  === 'cloudScore'){
  //         console.log('applying cloudScore');
  //         imgs = imgs.map(applyLandsatCloudScore);
  //       }
  //       else if(k  === 'fMask-Cloud'){
  //         console.log('applying Fmask cloud');
  //         imgs = imgs.map(function(img){return applyBitMask(img,3)});
  //       }
  //       else if(k  === 'fMask-Cloud-Shadow'){
  //         console.log('applying Fmask cloud shadow');
  //         imgs = imgs.map(function(img){return applyBitMask(img,4)});
  //       }
  //       else if(k  === 'fMask-Snow'){
  //         console.log('applying Fmask snow');

  //         imgs = imgs.map(function(img){return applyBitMask(img,5)});
  //       }
  //       else if(k  === 'TDOM'){
  //         console.log('applying TDOM');
  //         imgs = simpleTDOM2(imgs);
  //       }

  //     }
  //   })

  //   imgs = imgs.map(simpleAddIndices).map(simpleGetTasseledCap).map(simpleAddTCAngles)

  var imgs = getImagesLib.getProcessedLandsatScenes({
    studyArea: eeBoundsPoly,
    startYear: urlParams.startYear,
    endYear: urlParams.endYear,
    startJulian: urlParams.startJulian,
    endJulian: urlParams.endJulian,
  });
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
    // var tempCollection = ee.ImageCollection([img]);

    // if(year == startYear) {
    //   var srCollection = tempCollection;
    // } else {
    //   srCollection = srCollection.merge(tempCollection);
    // }
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
  // console.log(indexList);
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
      10000
    );
    var lossGainStack = ltOutputs[1];
    var rawLTForExport = ltOutputs[0];
    var decompressedC = changeDetectionLib.simpleLTFit(rawLTForExport, urlParams.startYear, urlParams.endYear, indexName, true, changeDetectionLib.default_lt_run_params["maxSegments"]);
    Map.addLayer(decompressedC, { layerType: "geeImageCollection" }, "Decompressed LT Output " + indexName, false);
  });

  // srCollection = srCollection.map(addYearBand);

  // // print(ee.Image(srCollection.first()).bandNames().getInfo())
  // var indexList = [];
  // Object.keys(whichIndices).map(function(index){if(whichIndices[index]){indexList.push(index)}})

  // var chartCollectionT;
  // indexList.map(function(indexName){
  //   var LTStack = simpleLANDTRENDR(srCollection,startYear,endYear,indexName);
  //   if(chartCollectionT === undefined){
  //     chartCollectionT = LTStack[2];
  //   }else{chartCollectionT = joinCollections(chartCollectionT,LTStack[2],false)}
  // });
  // // Map.addTimeLapse(srCollection,{min:0.05,max:0.5,bands:'swir1,nir,red'},'Composite Time Lapse');
  // // chartCollection = chartCollectionT;
  // pixelChartCollections['landsat'] = {'label':'landsat','collection':chartCollectionT};
  // populatePixelChartDropdown();
  // Reverse for modeling
}
