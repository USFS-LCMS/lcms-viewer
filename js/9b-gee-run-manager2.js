

function runGTAC(){
  //Set up some params
  startYear = parseInt(urlParams.startYear);
  endYear = parseInt(urlParams.endYear);

  analysisMode = urlParams.analysisMode;
  queryClassDict = {};
  var years = range(startYear,endYear+1);
  summaryMethod = urlParams.summaryMethod.toTitle();
  getLCMSVariables();
  
  
  ga('send', 'event', 'lcms-gtac-viewer-run', 'year_range', `${startYear}_${endYear}`);
  ga('send', 'event', 'lcms-gtac-viewer-run', 'analysis_mode', analysisMode);
  ga('send', 'event', 'lcms-gtac-viewer-run', 'timelapse_on', urlParams.addLCMSTimeLapsesOn);
  ga('send', 'event', 'lcms-gtac-viewer-run', 'summary_method', summaryMethod);
  // setupDownloads(studyAreaName);
  var clientBoundary = clientBoundsDict.CONUS_SEAK;
  
  var lcmsRun = {};
  var lcmsRunFuns = {};


  //Set up some params
  startYear = parseInt(urlParams.startYear);
  endYear = parseInt(urlParams.endYear);

  analysisMode = urlParams.analysisMode;
  queryClassDict = {};
  var years = range(startYear,endYear+1);
  summaryMethod = urlParams.summaryMethod.toTitle();
  getLCMSVariables();

  lcmsRun.thematicChangeYearBuffer = 5
  lcmsRun.years = range(startYear,endYear+1);

  lcmsRun.summaryMethodDescriptionDict = {'Year':'of most recent','Prob' : 'of most probable'}
  lcmsRun.minGainProb = [studyAreaDict[studyAreaName].conusGainThresh,studyAreaDict[studyAreaName].akGainThresh].min();
  lcmsRun.minSlowLossProb = [studyAreaDict[studyAreaName].conusSlowLossThresh,studyAreaDict[studyAreaName].akSlowLossThresh].min();
  lcmsRun.minFastLossProb = [studyAreaDict[studyAreaName].conusFastLossThresh,studyAreaDict[studyAreaName].akFastLossThresh].min();
  lcmsRunFuns.getMaskedWYr = function(c, code){
    return c.map(function(img) {
      var yr = ee.Date(img.get('system:time_start')).get('year');
      var yrImg = ee.Image(yr).int16().rename(['Year']);
      return img.addBands(yrImg).updateMask(img.select([0]).eq(code))
        .copyProperties(img,['system:time_start']);
    });
  }

  lcmsRun.lcms = studyAreaDict[studyAreaName].final_collections
  lcmsRun.lcms = ee.ImageCollection(ee.FeatureCollection(lcmsRun.lcms.map(f => ee.ImageCollection(f))).flatten())
                .filter(ee.Filter.calendarRange(startYear,endYear,'year'));
  // console.log(lcmsRun.lcms.aggregate_histogram ('study_area').getInfo())
  lcmsRun.f = ee.Image(lcmsRun.lcms.first());

  lcmsRun.props = lcmsRun.f.getInfo().properties;
  
  //Mosaic all study areas
  lcmsRun.lcms = ee.List.sequence(startYear,endYear).map(function(yr){
    var t = lcmsRun.lcms.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic()
    return t.copyProperties(lcmsRun.f).set('system:time_start',ee.Date.fromYMD(yr,6,1).millis())
  });
  lcmsRun.lcms = ee.ImageCollection(lcmsRun.lcms)  
  


  
  
    //Bring in two periods of land cover and land use if advanced, otherwise just bring in a single mode
    if(analysisMode === 'advanced'){
    Map2.addLayer(lcmsRun.lcms.select(['Land_Use']).filter(ee.Filter.calendarRange(startYear,startYear + lcmsRun.thematicChangeYearBuffer,'year')).mode().copyProperties(lcmsRun.f).set('bounds',clientBoundary),{title: `Most common land use class from ${startYear} to ${startYear+lcmsRun.thematicChangeYearBuffer}.`,layerType : 'geeImage',autoViz:true},'Land Use Start',false);
    Map2.addLayer(lcmsRun.lcms.select(['Land_Use']).filter(ee.Filter.calendarRange(endYear-lcmsRun.thematicChangeYearBuffer,endYear,'year')).mode().copyProperties(lcmsRun.f).set('bounds',clientBoundary),{title: `Most common land use class from ${endYear-lcmsRun.thematicChangeYearBuffer} to ${endYear}.`,layerType : 'geeImage',autoViz:true},'Land Use End',false);

    Map2.addLayer(lcmsRun.lcms.select(['Land_Cover']).filter(ee.Filter.calendarRange(startYear,startYear + lcmsRun.thematicChangeYearBuffer,'year')).mode().copyProperties(lcmsRun.f).set('bounds',clientBoundary),{title: `Most common land cover class from ${startYear} to ${startYear+lcmsRun.thematicChangeYearBuffer}.`,layerType : 'geeImage',autoViz:true},'Land Cover Start',false);
    Map2.addLayer(lcmsRun.lcms.select(['Land_Cover']).filter(ee.Filter.calendarRange(endYear-lcmsRun.thematicChangeYearBuffer,endYear,'year')).mode().copyProperties(lcmsRun.f).set('bounds',clientBoundary),{title: `Most common land cover class from ${endYear-lcmsRun.thematicChangeYearBuffer} to ${endYear}.`,layerType : 'geeImage',autoViz:true},'Land Cover End',false);
    // Map2.addLayer(lcChangeObj.change.set('bounds',clientBoundary),lcChangeObj.viz,lcLayerName + ' Change' ,false);
    // Map2.addLayer(luChangeObj.change.set('bounds',clientBoundary),luChangeObj.viz,luLayerName + ' Change' ,false);
  }else{
    Map2.addLayer(lcmsRun.lcms.select(['Land_Cover']).mode().copyProperties(lcmsRun.f).set('bounds',clientBoundary),{title: `Most common land cover class from ${startYear} to ${endYear}.`,autoViz:true,layerType:'geeImage'},'Land Cover',false);
    Map2.addLayer(lcmsRun.lcms.select(['Land_Use']).mode().copyProperties(lcmsRun.f).set('bounds',clientBoundary),{title: `Most common land use class from ${startYear} to ${endYear}.`,autoViz:true,layerType:'geeImage'},'Land Use',false);


  }
  
  lcmsRun.slowLoss = lcmsRunFuns.getMaskedWYr(lcmsRun.lcms.select(['Change','Change_Raw_Probability_Slow_Loss'],['Change','Prob']),2);
  lcmsRun.slowLossCount = lcmsRun.slowLoss.select(['Year']).count();
  lcmsRun.slowLoss = lcmsRun.slowLoss.qualityMosaic(summaryMethod);

  lcmsRun.fastLoss = lcmsRunFuns.getMaskedWYr(lcmsRun.lcms.select(['Change','Change_Raw_Probability_Fast_Loss'],['Change','Prob']),3);
  lcmsRun.fastLossCount = lcmsRun.fastLoss.select(['Year']).count();
  lcmsRun.fastLoss = lcmsRun.fastLoss.qualityMosaic(summaryMethod);


  lcmsRun.gain = lcmsRunFuns.getMaskedWYr(lcmsRun.lcms.select(['Change','Change_Raw_Probability_Fast_Loss'],['Change','Prob']),4);
  lcmsRun.gainCount = lcmsRun.gain.select(['Year']).count();
  lcmsRun.gain = lcmsRun.gain.qualityMosaic(summaryMethod);
  
  Map2.addLayer(lcmsRun.fastLoss.select(['Year']).set('bounds',clientBoundary),{title: `Year ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} rapid vegetation cover loss from an external event such as fire/harvest, or change from water inundation/desiccation, etc. from ${startYear} to ${endYear}.`,min:startYear,max:endYear,palette:declineYearPalette,layerType:'geeImage'},'Fast Loss Year');

  if(analysisMode === 'advanced'){
    Map2.addLayer(lcmsRun.fastLoss.select(['Prob']).set('bounds',clientBoundary).divide(100),{title: `Model confidence ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} rapid vegetation cover loss from an external event such as fire/harvest, or change from water inundation/desiccation, etc. from ${startYear} to ${endYear}.`,min:lcmsRun.minFastLossProb,max:0.5,palette:declineProbPalette,layerType:'geeImage'},'Fast Loss Probability',false);
     Map2.addLayer(lcmsRun.fastLossCount.set('bounds',clientBoundary),{title: `Duration of rapid vegetation cover loss from an external event such as fire/harvest, or change from water inundation/desiccation, etc. from ${startYear} to ${endYear}.`,layerType : 'geeImage', min: 1, max: 5, palette: declineDurPalette,legendLabelLeft:'Year count =',legendLabelRight:'Year count >='},'Fast Loss Duration',false);
    }


  Map2.addLayer(lcmsRun.slowLoss.select(['Year']).set('bounds',clientBoundary),{title: `Year ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} vegetation cover loss from a long-term trend event such as drought, tree mortality from insects or disease, etc. from ${startYear} to ${endYear}.`,min:startYear,max:endYear,palette:declineYearPalette,layerType:'geeImage'},'Slow Loss Year');
  
  if(analysisMode === 'advanced'){
    Map2.addLayer(lcmsRun.slowLoss.select(['Prob']).divide(100).set('bounds',clientBoundary),{title: `Model confidence ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} vegetation cover loss from a long-term trend event such as drought, tree mortality from insects or disease, etc. from ${startYear} to ${endYear}.`,min:lcmsRun.minSlowLossProb,max:0.5,palette:declineProbPalette,layerType:'geeImage'},'Slow Loss Probability',false);
    Map2.addLayer(lcmsRun.slowLossCount.set('bounds',clientBoundary),{title: `Duration of vegetation cover loss from a long-term trend event such as drought, tree mortality from insects or disease, etc. from ${startYear} to ${endYear}.`,layerType : 'geeImage',min: 1, max: 5, palette: declineDurPalette,legendLabelLeft:'Year count =',legendLabelRight:'Year count >='},'Slow Loss Duration',false);
  }



  Map2.addLayer(lcmsRun.gain.select(['Year']).set('bounds',clientBoundary),{title: `Year ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} vegetation cover gain from ${startYear} to ${endYear}.`,layerType : 'geeImage',min: startYear, max: endYear, palette: gainYearPaletteA},'Gain Year',false);
  if(analysisMode === 'advanced'){
    Map2.addLayer(lcmsRun.gain.select(['Prob']).set('bounds',clientBoundary),{title: `Model confidence ${lcmsRun.summaryMethodDescriptionDict[summaryMethod]} vegetation cover gain from ${startYear} to ${endYear}.`,layerType : 'geeImage', min: lcmsRun.minGainProb, max: 0.8, palette: recoveryProbPalette},'Gain Probability',false);

    Map2.addLayer(lcmsRun.gainCount.set('bounds',clientBoundary),{title: `Vegetation cover gain duration from ${startYear} to ${endYear}.`,layerType : 'geeImage', min: 1, max: 5, palette: recoveryDurPalette,legendLabelLeft:'Year count =',legendLabelRight:'Year count >='},'Gain Duration',false);
  }
  

  //Bring in time lapses

  //Mask out stable and non processing area mask for change time lapse
  lcmsRun.tlChange = lcmsRun.lcms.select(['Change']).map(function(img){return img.updateMask(img.gte(2).and(img.lt(5))).copyProperties(img)});
  lcmsRun.tlLC = lcmsRun.lcms.select(['Land_Cover']);//.map(function(img){return img.updateMask(img.lt(15)).copyProperties(img)});
  lcmsRun.tlLU = lcmsRun.lcms.select(['Land_Use']);//.map(function(img){return img.updateMask(img.lt(7)).copyProperties(img)});
 
  if(urlParams.addLCMSTimeLapsesOn === 'yes'){
    Map2.addTimeLapse(lcmsRun.tlChange  ,{autoViz:true,years:lcmsRun.years},'LCMS Change Time Lapse',false)
    Map2.addTimeLapse(lcmsRun.tlLC  ,{autoViz:true,years:lcmsRun.years},'LCMS Land Cover Time Lapse',false)
    Map2.addTimeLapse(lcmsRun.tlLU  ,{autoViz:true,years:lcmsRun.years},'LCMS Land Use Time Lapse',false)
  }

  //Set up pixel charting change time series
  lcmsRun.whichIndex = 'NBR';


  //Bring in composites
  lcmsRun.composites = ee.ImageCollection(ee.FeatureCollection(studyAreaDict[studyAreaName].composite_collections.map(f => ee.ImageCollection(f))).flatten())

  lcmsRun.composites = ee.ImageCollection(ee.List.sequence(startYear,endYear,1).map(function(yr){
    return simpleAddIndices(lcmsRun.composites.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis()),1);
  }));
  
  //Set up CCDC
  lcmsRun.ccdcIndicesSelector = ['tStart','tEnd','tBreak','changeProb',lcmsRun.whichIndex+'_.*','NDVI_.*'];
  lcmsRun.ccdc = ee.ImageCollection(ee.FeatureCollection(studyAreaDict[studyAreaName].ccdc_collections.map(f => ee.ImageCollection(f).select(lcmsRun.ccdcIndicesSelector))).flatten());
                
  

  var f= ee.Image(lcmsRun.ccdc.first());
  var ccdcImg = ee.Image(lcmsRun.ccdc.mosaic().copyProperties(f));
  // printEE(ccdcImg.bandNames())
  var whichHarmonics = [1,2,3];
  var fillGaps = true;
  var fraction = 0.6657534246575343;
  var annualImages = simpleGetTimeImageCollection(ee.Number(startYear+fraction),ee.Number(endYear+1+fraction),1);
  lcmsRun.fittedCCDC = predictCCDC(ccdcImg,annualImages,fillGaps,whichHarmonics).select([lcmsRun.whichIndex+'_predicted'],['CCDC Fitted '+lcmsRun.whichIndex]).map(setSameDate);
  
  //Set up LANDTRENDR
  lcmsRun.lt = ee.ImageCollection(ee.FeatureCollection(studyAreaDict[studyAreaName].lt_collections.map(f => ee.ImageCollection(f).filter(ee.Filter.eq('band',lcmsRun.whichIndex)))).flatten()).mosaic();
//   var lt = conusLT.filter(ee.Filter.eq('band',whichIndex)).merge(akLT.filter(ee.Filter.eq('band',whichIndex))).mosaic();
  lcmsRun.fittedAsset = ltStackToFitted(lcmsRun.lt,1984,2020).filter(ee.Filter.calendarRange(startYear,endYear,'year')).select(['fit'],['LANDTRENDR Fitted '+ lcmsRun.whichIndex]);
  
  //Join raw time series to lt fitted and ccdc fitted
  lcmsRun.changePixelChartCollection = joinCollections(lcmsRun.composites.select([lcmsRun.whichIndex],['Raw '+lcmsRun.whichIndex]),lcmsRun.fittedAsset,false);
  lcmsRun.changePixelChartCollection = joinCollections(lcmsRun.changePixelChartCollection,lcmsRun.fittedCCDC,false);

  //Set up change prob outputs for pixel charting
  lcmsRun.probCollection = lcmsRun.lcms.select(['Change_Raw_Probability_.*'],['Slow Loss Probability','Fast Loss Probability','Gain Probability']).map(function(img){return img.divide(100).copyProperties(img,['system:time_start'])})

  lcmsRun.changePixelChartCollection = joinCollections(lcmsRun.changePixelChartCollection,lcmsRun.probCollection,false);
  
  pixelChartCollections['all-loss-gain-'+lcmsRun.whichIndex] = {'label':'LCMS Change Time Series',
                                  'collection':lcmsRun.changePixelChartCollection,//chartCollection.select(['Raw.*','LANDTRENDR.*','.*Loss Probability','Gain Probability']),
                                  'chartColors':chartColorsDict.allLossGain2,
                                  'tooltip':'Chart slow loss, fast loss, gain and the '+lcmsRun.whichIndex + ' vegetation index',
                                  'xAxisLabel':'Year',
                                  'yAxisLabel':'Model Confidence or Index Value',
                                  'fieldsHidden':[true,true,true,false,false,false]}
  lcmsRunFuns.addPixelChartClass = function(bn){
    var bnTitle = bn.replaceAll('_',' ')
    var chartC = lcmsRun.lcms.select([`${bn}_Raw_Probability_.*`]);
    var fromBns = chartC.first().bandNames();
    var toBns = fromBns.map(function(bn){
      bn = ee.String(bn).split('_');
      return bn.get(bn.length().subtract(1))});
    var colors = lcmsRun.props[`${bn}_class_palette`];
    chartC = chartC.select(fromBns, toBns)
    pixelChartCollections[bn] = {'label':`LCMS ${bnTitle} Time Series`,
                                    'collection':chartC,//chartCollection.select(['Raw.*','LANDTRENDR.*','.*Loss Probability','Gain Probability']),
                                    'chartColors':colors,
                                    'tooltip':`Chart ${bnTitle} model confidence for each individual class`,
                                    'xAxisLabel':'Year',
                                    'yAxisLabel':'Model Confidence'}
  }
  
  lcmsRunFuns.addPixelChartClass('Land_Cover');
  lcmsRunFuns.addPixelChartClass('Land_Use');


  //Populate area charting

  lcmsRun.changeForAreaCharting = formatAreaChartCollection(lcmsRun.lcms.select(['Change']).map(function(img){return img.unmask(0)}),[2,3,4,5],['Slow Loss','Fast Loss','Gain','Non-Processing Area Mask']);

  lcmsRunFuns.addAreaChartClass = function(bn){
    var c = lcmsRun.lcms.select([bn]);
   
    var names = lcmsRun.props[`${bn}_class_names`];
    var numbers = lcmsRun.props[`${bn}_class_values`];
    var colors = lcmsRun.props[`${bn}_class_palette`];
    names = names.map(nm => nm.replaceAll(' (SEAK Only)',''));
    var areaC = formatAreaChartCollection(c,numbers,names);

    var bnTitle = bn.replaceAll('_',' ')
    areaChartCollections[bn] = {'label':`LCMS ${bnTitle}`,
                                  'collection':areaC,
                                  'stacked':false,
                                  'steppedLine':false,
                                  'tooltip':`Summarize ${bnTitle} classes for each year`,
                                  'colors':colors,
                                  'xAxisLabel':'Year'};
  }
  
  lcmsRunFuns.addAreaChartClass('Change');
  lcmsRunFuns.addAreaChartClass('Land_Cover');
  lcmsRunFuns.addAreaChartClass('Land_Use');

  getSelectLayers(true);
  populatePixelChartDropdown();
  populateAreaChartDropdown();
  getHansen();
  getMTBSandIDS();
// $('#query-label').click()
$('#pixel-chart-label').click();
  }