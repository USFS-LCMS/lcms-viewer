/*This script constructs the page depending on the chosen mode*/
/*Put main elements on body*/
$('body').append(staticTemplates.map);

$('body').append(staticTemplates.mainContainer);
$('body').append(staticTemplates.sidebarLeftContainer);

$('body').append(staticTemplates.geeSpinner);
$('body').append(staticTemplates.bottomBar);

$('#summary-spinner').show();

$('#main-container').append(staticTemplates.sidebarLeftToggler);

$('#sidebar-left-header').append(staticTemplates.topBanner);

$('#main-container').append(staticTemplates.introModal[mode]);
/////////////////////////////////////////////////////////////////////
/*Check to see if modals should be shown*/
if(localStorage.showIntroModal == undefined){
  localStorage.showIntroModal = 'true';
  }

$('#dontShowAgainCheckbox').change(function(){
  console.log(this.checked)
  localStorage.showIntroModal  = !this.checked;
});
/////////////////////////////////////////////////////////////////////
/*Add study area dropdown if LCMS*/
if(mode === 'LCMS'){
  $('#title-banner').append(staticTemplates.studyAreaDropdown);
  if(studyAreaSpecificPage){
    $('#study-area-label').removeClass('dropdown-toggle');
  }else{
    Object.keys(studyAreaDict).map(function(k){addStudyAreaToDropdown(k,studyAreaDict[k].popOver);});
  }

}

$('#title-banner').append(staticTemplates.placesSearchDiv);
$('#title-banner').fitText(1.2);
$('#study-area-label').fitText(1.8);


function toggleAdvancedOn(){
    $("#threshold-container").slideDown();
    $("#advanced-radio-container").slideDown();  
}
function toggleAdvancedOff(){
    $("#threshold-container").slideUp();
    $("#advanced-radio-container").slideUp();  
}
/////////////////////////////////////////////////////////////////////
/*Start adding elements to page based on chosen mode*/
if(mode === 'LCMS'){
  var minYear = startYear;var maxYear = endYear;
  // console.log(urlParams)  
  if(urlParams.startYear == null || urlParams.startYear == undefined){
      urlParams.startYear = startYear;
  }
  if(urlParams.endYear == null || urlParams.endYear == undefined){
     urlParams.endYear = endYear;
  }
  // console.log(urlParams)
 
  /*Construct panes in left sidebar*/
  addCollapse('sidebar-left','parameters-collapse-label','parameters-collapse-div','PARAMETERS','<i class="fa fa-sliders mr-1" aria-hidden="true"></i>',false,null,'Adjust parameters used to filter and sort LCMS products');
  addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div','LCMS DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' src="images/layer_icon.png">`,true,null,'LCMS DATA layers to view on map');
  // $('#layer-list-collapse-label').append(`<button class = 'btn' title = 'Refresh layers if tiles failed to load' id = 'refresh-tiles-button' onclick = 'jitterZoom()'><i class="fa fa-refresh"></i></button>`)
  addCollapse('sidebar-left','reference-layer-list-collapse-label','reference-layer-list-collapse-div','REFERENCE DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' src="images/layer_icon.png">`,false,null,'Additional relevant layers to view on map intended to provide context for LCMS DATA');
  
  addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');

  addCollapse('sidebar-left','download-collapse-label','download-collapse-div','DOWNLOAD DATA',`<i class="fa fa-cloud-download mr-1" aria-hidden="true"></i>`,false,``,'Download LCMS products for further analysis');
  addCollapse('sidebar-left','support-collapse-label','support-collapse-div','SUPPORT',`<i class="fa fa-question-circle mr-1" aria-hidden="true"></i>`,false,``,'If you need any help');

  // $('#parameters-collapse-div').append(staticTemplates.paramsDiv);

  //Construct parameters form
 
  if(['standard','advanced'].indexOf(urlParams.analysisMode) === -1){
    urlParams.analysisMode = 'standard'
  }
  var tAnalysisMode = urlParams.analysisMode;
  addRadio('parameters-collapse-div','analysis-mode-radio','Choose which mode:','Standard','Advanced','urlParams.analysisMode','standard','advanced','toggleAdvancedOff()','toggleAdvancedOn()','Standard mode provides the core LCMS products based on carefully selected parameters. Advanced mode provides additional LCMS products and parameter options')

  urlParams.analysisMode = tAnalysisMode ;
  $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);

  addDualRangeSlider('parameters-collapse-div','Choose analysis year range:','urlParams.startYear','urlParams.endYear',minYear, maxYear, urlParams.startYear, urlParams.endYear, 1,'analysis-year-slider','null','Years of LCMS data to include for land cover, land use, loss, and gain')

  $('#parameters-collapse-div').append(`<div class="dropdown-divider"></div>
                                          <div id='threshold-container' style="display:none;width:100%"></div>
                                          <div id='advanced-radio-container' style="display: none;"></div>`)
  // console.log('here')
  // addRangeSlider('threshold-container','Choose loss threshold:','lowerThresholdDecline',0,1,lowerThresholdRecovery,0.05,'decline-threshold-slider','','The CCDC probabibility threshold to detect change.  Any probability for a given break greater than this threshold will be flagged as change') 
  
  // addRangeSlider('threshold-container','Choose loss threshold:','lowerThresholdDecline',0,1,lowerThresholdDecline,0.05,'decline-threshold-slider','null',"Threshold window for detecting loss.  Any loss probability greater than the specified threshold will be flagged as loss ") 
  // containerDivID,title,variable,min,max,defaultValue,step,sliderID,mode,tooltip
  addRangeSlider('threshold-container','Choose loss threshold:','lowerThresholdDecline',0, 1, lowerThresholdDecline, 0.05,'decline-threshold-slider','null',"Threshold window for detecting loss.  Any loss probability greater than or equal to this value will be flagged as loss ")
  $('#threshold-container').append(`<div class="dropdown-divider" ></div>`);
  addRangeSlider('threshold-container','Choose gain threshold:','lowerThresholdRecovery',0, 1, lowerThresholdRecovery, 0.05,'recovery-threshold-slider','null',"Threshold window for detecting gain.  Any gain probability greater than or equal to this value will be flagged as gain ")
  $('#advanced-radio-container').append(`<div class="dropdown-divider" ></div>`);
  $('#advanced-radio-container').append(`<div id = 'fast-slow-threshold-container' ></div>`);
  addRangeSlider('fast-slow-threshold-container','Choose slow loss threshold:','lowerThresholdSlowLoss',0, 1, lowerThresholdSlowLoss , 0.05,'slow-loss-threshold-slider','null',"Threshold window for detecting loss.  Any loss probability greater than or equal to this value will be flagged as loss ")
  $('#fast-slow-threshold-container').append(`<div class="dropdown-divider" ></div>`);
  addRangeSlider('fast-slow-threshold-container','Choose fast loss threshold:','lowerThresholdFastLoss',0, 1, lowerThresholdFastLoss, 0.05,'fast-loss-threshold-slider','null',"Threshold window for detecting loss.  Any loss probability greater than or equal to this value will be flagged as loss ")
  $('#advanced-radio-container').append(`<div class="dropdown-divider" ></div>`);
  addRadio('advanced-radio-container','treemask-radio','Constrain analysis to areas with trees:','Yes','No','applyTreeMask','yes','no','','','Whether to constrain LCMS products to only treed areas. Any area LCMS classified as tree cover 2 or more years will be considered tree. Will reduce commission errors typical in agricultural and water areas, but may also reduce changes of interest in these areas.')
  $('#advanced-radio-container').append(`<div class="dropdown-divider" ></div>`);
 
  
  addRadio('advanced-radio-container','summaryMethod-radio','Summary method:','Most recent year','Highest probability','summaryMethod','year','prob','','','How to choose which value for loss and gain to display/export.  Choose the value with the highest probability or from the most recent year above the specified threshold')
  $('#advanced-radio-container').append(`<div class="dropdown-divider" ></div>`);
  // addRadio('advanced-radio-container','whichIndex-radio','Index for charting:','NDVI','NBR','whichIndex','NDVI','NBR','','','The vegetation index that will be displayed in the "Query LCMS Time Series" tool')
  // $('#advanced-radio-container').append(`<div class="dropdown-divider" ></div>`);
  $('#parameters-collapse-div').append(staticTemplates.reRunButton);

  //Set up layer lists
  $('#layer-list-collapse-div').append(`<div id="layer-list"></div>`);
  $('#reference-layer-list-collapse-div').append(`<div id="reference-layer-list"></div>`);


  $('#download-collapse-div').append(staticTemplates.downloadDiv);
  $('#support-collapse-div').append(staticTemplates.supportDiv);

  if(tAnalysisMode === 'advanced'){
    $('#analysis-mode-radio-second_toggle_label').click();
  }

}else if(mode === 'lcms-base-learner'){
  canExport = true;
  startYear = 1984;endYear = 2020;
  var minYear = startYear;var maxYear = endYear;
  if(urlParams.startYear == null || urlParams.startYear == undefined){
      urlParams.startYear = startYear;// = parseInt(urlParams.startYear);
  }
  if(urlParams.endYear == null || urlParams.endYear == undefined){
     urlParams.endYear = endYear;// = parseInt(urlParams.endYear);
  }
  if(urlParams.lossMagThresh == null || urlParams.lossMagThresh == undefined){
     urlParams.lossMagThresh = -0.2;// = parseInt(urlParams.endYear);
  }
  if(urlParams.gainMagThresh == null || urlParams.gainMagThresh == undefined){
     urlParams.gainMagThresh = 0.1;// = parseInt(urlParams.endYear);
  }
  
  addCollapse('sidebar-left','parameters-collapse-label','parameters-collapse-div','PARAMETERS','<i class="fa fa-sliders mr-1" aria-hidden="true"></i>',false,null,'Adjust parameters used to filter and sort LCMS products');
  addDualRangeSlider('parameters-collapse-div','Choose analysis year range:','urlParams.startYear','urlParams.endYear',minYear, maxYear, urlParams.startYear, urlParams.endYear, 1,'analysis-year-slider','null','Years of LCMS data to include for land cover, land use, loss, and gain')

  addSubCollapse('parameters-collapse-div','lt-params-label','lt-params-div','LANDTRENDR Params', '',false,'')
  addSubCollapse('parameters-collapse-div','ccdc-params-label','ccdc-params-div','CCDC Params', '',false,'')
  
  addRangeSlider('lt-params-div','Loss Magnitude Threshold','urlParams.lossMagThresh',-0.8,-0.05,urlParams.lossMagThresh,0.05,'loss-mag-thresh-slider','','The threshold to detect loss for each LANDTRENDR segment.  Any difference for a given segement less than this threshold will be flagged as loss') 
  addRangeSlider('lt-params-div','Gain Magnitude Threshold','urlParams.gainMagThresh',0.05,0.8,urlParams.gainMagThresh,0.05,'gain-mag-thresh-slider','','The threshold to detect gain for each LANDTRENDR segment.  Any difference for a given segement greater than this threshold will be flagged as gain') 
  addCheckboxes('lt-params-div','index-choice-checkboxes','Choose which indices to analyze','whichIndices2',{'blue':false,'green':false,'red':false,'nir':false,'swir1':false,'swir2':false,'NBR':true,'NDVI':false,'NDMI':false,'brightness':false,'greenness':false,'wetness':false,'tcAngleBG':false})
  
  addRangeSlider('ccdc-params-div','Change Probability Threshold','ccdcChangeProbThresh',0,1,0.8,0.1,'ccdc-change-prob-thresh-slider','','The CCDC probabibility threshold to detect change.  Any probability for a given break greater than this threshold will be flagged as change') 
  
  // $('#lt-params-div').append(`<div class="dropdown-divider" ></div>`);
  $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  $('#parameters-collapse-div').append(staticTemplates.reRunButton);

  addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div','LCMS BASE LEARNER DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' src="images/layer_icon.png">`,true,null,'LCMS DATA layers to view on map');
  $('#layer-list-collapse-div').append(`<div id="layer-list"></div>`);
  addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');
  addCollapse('sidebar-left','download-collapse-label','download-collapse-div','DOWNLOAD DATA',`<i class="fa fa-cloud-download mr-1" aria-hidden="true"></i>`,false,``,'Download '+mode+' products for further analysis');
  
}else if(mode === 'LT'){
  canExport = true;
  startYear = 1984;endYear = 2020;startJulian = 152;endJulian = 273;

  var minYear = startYear;var maxYear = endYear;
  if(urlParams.startYear == null || urlParams.startYear == undefined){
      urlParams.startYear = startYear;// = parseInt(urlParams.startYear);
  }
  if(urlParams.endYear == null || urlParams.endYear == undefined){
     urlParams.endYear = endYear;// = parseInt(urlParams.endYear);
  }
  if(urlParams.startJulian == null || urlParams.startJulian == undefined){
      urlParams.startJulian = startJulian;// = parseInt(urlParams.startYear);
  }
  if(urlParams.endJulian == null || urlParams.endJulian == undefined){
     urlParams.endJulian = endJulian;// = parseInt(urlParams.endYear);
  }
  addCollapse('sidebar-left','parameters-collapse-label','parameters-collapse-div','PARAMETERS','<i class="fa fa-sliders mr-1" aria-hidden="true"></i>',false,null,'Adjust parameters used to filter and sort '+mode+' products');
  
  addSubCollapse('parameters-collapse-div','comp-params-label','comp-params-div','Landsat Composite Params', '',false,'');
  $('#comp-params-div').append(`<div class="dropdown-divider" ></div>`);
  addDualRangeSlider('comp-params-div','Choose analysis year range:','urlParams.startYear','urlParams.endYear',minYear, maxYear, urlParams.startYear, urlParams.endYear, 1,'analysis-year-slider2','null','Years of '+mode+' data to include.')
  
  addDualRangeSlider('comp-params-div','Choose analysis date range:','urlParams.startJulian','urlParams.endJulian',1, 365, urlParams.startJulian, urlParams.endJulian, 1,'julian-day-slider','julian','Days of year of '+mode+' data to include for land cover, land use, loss, and gain')
    $('#comp-params-div').append(`<div class="dropdown-divider" ></div>`);
    addCheckboxes('comp-params-div','which-sensor-method-radio','Choose which Landsat platforms to include','whichPlatforms',{"L5":true,"L7-SLC-On":true,'L7-SLC-Off':false,'L8':true});
    $('#comp-params-div').append(`<div class="dropdown-divider" ></div>`);
    addRangeSlider('comp-params-div','Composite Year Buffer','yearBuffer',0,2,0,1,'year-buffer-slider','','The number of adjacent years to include in a given year composite. (E.g. a value of 1 would mean the 2015 composite would have imagery from 2015 +- 1 year - 2014 to 2016)') 
   $('#comp-params-div').append(`<div class="dropdown-divider" ></div>`);
   addRangeSlider('comp-params-div','Minimum Number of Observations','minObs',0,5,3,1,'min-obs-slider','','Minimum number of observations needed for a pixel to be included. This helps reduce noise in composites. Any number less than 3 can result in poor composite quality') 
    $('#comp-params-div').append(`<div class="dropdown-divider" ></div>`);
  addMultiRadio('comp-params-div','comp-method-radio','Compositing method','compMethod',{"Median":false,"Medoid":true})
   $('#comp-params-div').append(`<div class="dropdown-divider" ></div>`);
  addCheckboxes('comp-params-div','cloud-masking-checkboxes','Choose which cloud masking methods to use','whichCloudMasks',{'fMask-Snow':true,'cloudScore':false,'fMask-Cloud':true,'TDOM':false,'fMask-Cloud-Shadow':true})
   $('#comp-params-div').append(`<div class="dropdown-divider" ></div>`);
  addMultiRadio('comp-params-div','water-mask-radio','Mask out water','maskWater',{"No":false,"Yes":true})
  
  // $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  // addRadio('parameters-collapse-div','cloudScore-cloud-radio','Apply CloudScore','No','Yes','applyCloudScore','no','yes','','',"Whether to apply Google's Landsat CloudScore algorithm")
  // $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  // addRadio('parameters-collapse-div','fmask-cloud-radio','Apply Fmask cloud mask','Yes','No','applyFmaskCloud','yes','no','','','Whether to apply Fmask cloud mask')
  // $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  // addRadio('parameters-collapse-div','fmask-cloud-shadow-radio','Apply Fmask cloud shadow mask','Yes','No','applyFmaskCloudShadow','yes','no','','','Whether to apply Fmask cloud shadow mask')
  
 
  
  addSubCollapse('parameters-collapse-div','lt-params-label','lt-params-div','LANDTRENDR Params', '',false,'')
    
  addCheckboxes('lt-params-div','index-choice-checkboxes','Choose which indices to analyze','whichIndices',{'NBR':true,'NDVI':false,'NDMI':false,'NDSI':false,'brightness':false,'greenness':false,'wetness':false,'tcAngleBG':false})
  $('#lt-params-div').append(`<div class="dropdown-divider" ></div>`);
  addMultiRadio('lt-params-div','lt-sort-radio','Choose method to summarize LANDTRENDR change','LTSortBy',{"largest":true,"steepest":false,"newest":false, "oldest":false,  "shortest":false, "longest":false})
   
  addRangeSlider('lt-params-div','Loss Magnitude Threshold','lossMagThresh',-0.8,0,-0.15,0.01,'loss-mag-thresh-slider','','The threshold to detect loss for each LANDTRENDR segment.  Any difference between start and end values for a given segement less than this threshold will be flagged as loss') 
  addRangeSlider('lt-params-div','Loss Slope Threshold','lossSlopeThresh',-0.8,0,-0.10,0.01,'loss-slope-thresh-slider','','The threshold to detect loss for each LANDTRENDR segment.  Any slope of a given segement less than this threshold will be flagged as loss') 
  
  addRangeSlider('lt-params-div','Gain Magnitude Threshold','gainMagThresh',0.01,0.8,0.1,0.01,'gain-mag-thresh-slider','','The threshold to detect gain for each LANDTRENDR segment.  Any difference between start and end values for a given segement greater than this threshold will be flagged as gain') 
  addRangeSlider('lt-params-div','Gain Slope Threshold','gainSlopeThresh',0.01,0.8,0.1,0.01,'gain-slope-thresh-slider','','The threshold to detect gain for each LANDTRENDR segment.  Any slope of a given segement greater than this threshold will be flagged as gain') 
  
  addRangeSlider('lt-params-div','How Many','howManyToPull',1,3,2,1,'how-many-slider','','The number of gains and losses to show. Typically an area only experiences a single loss/gain event, but in the cases where there are multiple above the specified thresholds, they can be shown.') 
  addRangeSlider('lt-params-div','Max LANDTRENDR Segments','maxSegments',1,8,6,1,'max-segments-slider','','The max number of segments LANDTRENDR can break time series into.  Generally 3-6 works well. Use a smaller number of characterizing long-term trends is the primary focus and a larger number if characterizing every little change is the primary focus.') 
  
  $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  $('#parameters-collapse-div').append(staticTemplates.reRunButton);
  addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div','MAP DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' src="images/layer_icon.png">`,true,null,mode+' DATA layers to view on map');
  $('#layer-list-collapse-div').append(`<div id="layer-list"></div>`);

  addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');
  addCollapse('sidebar-left','download-collapse-label','download-collapse-div','DOWNLOAD DATA',`<i class="fa fa-cloud-download mr-1" aria-hidden="true"></i>`,false,``,'Download '+mode+' products for further analysis');
  
}else if(mode === 'MTBS'){
  startYear = 1984;
  endYear = 2017;
  
  
  addCollapse('sidebar-left','parameters-collapse-label','parameters-collapse-div','PARAMETERS','<i class="fa fa-sliders mr-1" aria-hidden="true"></i>',false,null,'Adjust parameters used to filter and sort MTBS products');
  
  var mtbsZoomToDict ={"All":true,"CONUS":false,"Alaska":false,"Hawaii":false,"Puerto-Rico":false};

  addMultiRadio('parameters-collapse-div','mtbs-zoom-to-radio','Zoom to MTBS Mapping Area','mtbsMappingArea',mtbsZoomToDict)
  $('#mtbs-zoom-to-radio').prop('title','Zoom to MTBS region')
  $( "#mtbs-zoom-to-radio" ).change(function() {
    console.log(mtbsMappingArea);
    synchronousCenterObject(clientBoundsDict[mtbsMappingArea])
  });
  $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  
  addDualRangeSlider('parameters-collapse-div','Choose analysis year range:','startYear','endYear',startYear, endYear, startYear, endYear, 1,'analysis-year-slider','null','Years of MTBS data to include')
  addMultiRadio('parameters-collapse-div','mtbs-summary-method-radio','How to summarize MTBS data','mtbsSummaryMethod',{"Highest-Severity":true,"Most-Recent":false,"Oldest":false})

  $('#mtbs-summary-method-radio').prop('title','Select how to summarize MTBS raster data in areas with multiple fires.  Each summary method is applied on a pixel basis. "Highest-Severity" will show the severity and fire year corresponding to the highest severity. "Most-Recent" will show the severity and fire year corresponding to the most recently mapped fire. "Oldest" will show the severity and fire year corresponding to the oldest mapped fire.')
  $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  $('#parameters-collapse-div').append(staticTemplates.reRunButton);

  addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div',mode+' DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' src="images/layer_icon.png">`,true,null,mode+' DATA layers to view on map');
  addCollapse('sidebar-left','reference-layer-list-collapse-label','reference-layer-list-collapse-div','REFERENCE DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' src="images/layer_icon.png">`,false,null,'Additional relevant layers to view on map intended to provide context for '+mode+' DATA');
  
  addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');
  addCollapse('sidebar-left','support-collapse-label','support-collapse-div','SUPPORT',`<i class="fa fa-question-circle mr-1" aria-hidden="true"></i>`,false,``,'If you need any help');

  $('#layer-list-collapse-div').append(`<div id="layer-list"></div>`);
  $('#reference-layer-list-collapse-div').append(`<div id="reference-layer-list"></div>`);
  
  $('#support-collapse-div').append(staticTemplates.walkThroughButton);
  $('#support-collapse-div').append(`<div class="dropdown-divider"</div>`);
  $('#support-collapse-div').append(`<a href="https://www.mtbs.gov/contact" target="_blank" title = 'If you have any questions or comments, feel free to contact us'>Contact Us</a>`)
  $('#support-collapse-div').append(`<div class="dropdown-divider mb-2"</div>`);
  $('#introModal-body').append(staticTemplates.walkThroughButton);
}else if(mode === 'TEST' || mode === 'FHP'){
  addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div',mode+' DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' src="images/layer_icon.png">`,true,null,mode+' DATA layers to view on map');
  $('#layer-list-collapse-div').append(`<div id="layer-list"></div>`);

  addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');

}else if(mode === 'geeViz'){
  addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div',mode+' DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' src="images/layer_icon.png">`,true,null,mode+' DATA layers to view on map');
  $('#layer-list-collapse-div').append(`<div id="layer-list"></div>`);
  addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');
  
}
else if(mode === 'STORM'){
  canExport = true;
  var rows = [{"lon": -86.6, "lat": 18.0, "wspd": 30.0, "date": "Oct 6:21:00 GMT", "pres": 1006.0, "FO": "O"}, {"lon": -86.6, "lat": 18.1, "wspd": 30.0, "date": "Oct 6:22:00 GMT", "pres": 1005.0, "FO": "O"}, {"lon": -86.6, "lat": 18.2, "wspd": 30.0, "date": "Oct 6:23:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.6, "lat": 18.3, "wspd": 30.0, "date": "Oct 7:00:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.6, "lat": 18.47, "wspd": 30.0, "date": "Oct 7:01:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.6, "lat": 18.63, "wspd": 30.0, "date": "Oct 7:02:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.6, "lat": 18.8, "wspd": 30.0, "date": "Oct 7:03:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.77, "lat": 18.67, "wspd": 31.0, "date": "Oct 7:04:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.93, "lat": 18.53, "wspd": 33.0, "date": "Oct 7:05:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -87.1, "lat": 18.4, "wspd": 35.0, "date": "Oct 7:06:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -87.03, "lat": 18.47, "wspd": 35.0, "date": "Oct 7:07:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.97, "lat": 18.53, "wspd": 35.0, "date": "Oct 7:08:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 18.6, "wspd": 35.0, "date": "Oct 7:09:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.87, "lat": 18.7, "wspd": 35.0, "date": "Oct 7:10:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.83, "lat": 18.8, "wspd": 35.0, "date": "Oct 7:11:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.8, "lat": 18.9, "wspd": 35.0, "date": "Oct 7:12:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.83, "lat": 19.0, "wspd": 35.0, "date": "Oct 7:13:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.87, "lat": 19.1, "wspd": 35.0, "date": "Oct 7:14:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 35.0, "date": "Oct 7:15:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 36.0, "date": "Oct 7:15:38 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 38.0, "date": "Oct 7:16:16 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 39.0, "date": "Oct 7:16:54 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 40.0, "date": "Oct 7:16:55 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 40.0, "date": "Oct 7:17:16 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 40.0, "date": "Oct 7:17:37 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 40.0, "date": "Oct 7:17:58 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.9, "lat": 19.2, "wspd": 40.0, "date": "Oct 7:18:00 GMT", "pres": 1004.0, "FO": "O"}, {"lon": -86.43, "lat": 19.2, "wspd": 43.0, "date": "Oct 7:19:00 GMT", "pres": 1002.0, "FO": "O"}, {"lon": -85.97, "lat": 19.2, "wspd": 46.0, "date": "Oct 7:20:00 GMT", "pres": 1000.0, "FO": "O"}, {"lon": -85.5, "lat": 19.2, "wspd": 50.0, "date": "Oct 7:21:00 GMT", "pres": 999.0, "FO": "O"}, {"lon": -85.47, "lat": 19.43, "wspd": 53.0, "date": "Oct 7:22:00 GMT", "pres": 998.0, "FO": "O"}, {"lon": -85.43, "lat": 19.67, "wspd": 56.0, "date": "Oct 7:23:00 GMT", "pres": 997.0, "FO": "O"}, {"lon": -85.4, "lat": 19.9, "wspd": 60.0, "date": "Oct 8:00:00 GMT", "pres": 997.0, "FO": "O"}, {"lon": -85.4, "lat": 19.93, "wspd": 60.0, "date": "Oct 8:01:00 GMT", "pres": 997.0, "FO": "O"}, {"lon": -85.4, "lat": 19.97, "wspd": 60.0, "date": "Oct 8:02:00 GMT", "pres": 997.0, "FO": "O"}, {"lon": -85.4, "lat": 20.0, "wspd": 60.0, "date": "Oct 8:03:00 GMT", "pres": 997.0, "FO": "O"}, {"lon": -85.43, "lat": 20.03, "wspd": 60.0, "date": "Oct 8:04:00 GMT", "pres": 996.0, "FO": "O"}, {"lon": -85.47, "lat": 20.07, "wspd": 60.0, "date": "Oct 8:05:00 GMT", "pres": 995.0, "FO": "O"}, {"lon": -85.5, "lat": 20.1, "wspd": 60.0, "date": "Oct 8:06:00 GMT", "pres": 994.0, "FO": "O"}, {"lon": -85.5, "lat": 20.27, "wspd": 63.0, "date": "Oct 8:07:00 GMT", "pres": 990.0, "FO": "O"}, {"lon": -85.5, "lat": 20.43, "wspd": 66.0, "date": "Oct 8:08:00 GMT", "pres": 986.0, "FO": "O"}, {"lon": -85.5, "lat": 20.6, "wspd": 70.0, "date": "Oct 8:09:00 GMT", "pres": 983.0, "FO": "O"}, {"lon": -85.37, "lat": 20.7, "wspd": 70.0, "date": "Oct 8:10:00 GMT", "pres": 982.0, "FO": "O"}, {"lon": -85.23, "lat": 20.8, "wspd": 70.0, "date": "Oct 8:11:00 GMT", "pres": 982.0, "FO": "O"}, {"lon": -85.1, "lat": 20.9, "wspd": 70.0, "date": "Oct 8:12:00 GMT", "pres": 982.0, "FO": "O"}, {"lon": -85.03, "lat": 21.0, "wspd": 71.0, "date": "Oct 8:13:00 GMT", "pres": 982.0, "FO": "O"}, {"lon": -84.97, "lat": 21.1, "wspd": 73.0, "date": "Oct 8:14:00 GMT", "pres": 982.0, "FO": "O"}, {"lon": -84.9, "lat": 21.2, "wspd": 75.0, "date": "Oct 8:15:00 GMT", "pres": 982.0, "FO": "O"}, {"lon": -84.97, "lat": 21.37, "wspd": 75.0, "date": "Oct 8:16:00 GMT", "pres": 980.0, "FO": "O"}, {"lon": -85.03, "lat": 21.53, "wspd": 75.0, "date": "Oct 8:17:00 GMT", "pres": 979.0, "FO": "O"}, {"lon": -85.1, "lat": 21.7, "wspd": 75.0, "date": "Oct 8:18:00 GMT", "pres": 978.0, "FO": "O"}, {"lon": -85.13, "lat": 21.87, "wspd": 76.0, "date": "Oct 8:19:00 GMT", "pres": 978.0, "FO": "O"}, {"lon": -85.17, "lat": 22.03, "wspd": 78.0, "date": "Oct 8:20:00 GMT", "pres": 978.0, "FO": "O"}, {"lon": -85.2, "lat": 22.2, "wspd": 80.0, "date": "Oct 8:21:00 GMT", "pres": 978.0, "FO": "O"}, {"lon": -85.2, "lat": 22.37, "wspd": 81.0, "date": "Oct 8:22:00 GMT", "pres": 975.0, "FO": "O"}, {"lon": -85.2, "lat": 22.53, "wspd": 83.0, "date": "Oct 8:23:00 GMT", "pres": 972.0, "FO": "O"}, {"lon": -85.2, "lat": 22.7, "wspd": 85.0, "date": "Oct 9:00:00 GMT", "pres": 970.0, "FO": "O"}, {"lon": -85.23, "lat": 22.87, "wspd": 86.0, "date": "Oct 9:01:00 GMT", "pres": 970.0, "FO": "O"}, {"lon": -85.27, "lat": 23.03, "wspd": 88.0, "date": "Oct 9:02:00 GMT", "pres": 970.0, "FO": "O"}, {"lon": -85.3, "lat": 23.2, "wspd": 90.0, "date": "Oct 9:03:00 GMT", "pres": 970.0, "FO": "O"}, {"lon": -85.43, "lat": 23.33, "wspd": 90.0, "date": "Oct 9:04:00 GMT", "pres": 971.0, "FO": "O"}, {"lon": -85.57, "lat": 23.47, "wspd": 90.0, "date": "Oct 9:05:00 GMT", "pres": 972.0, "FO": "O"}, {"lon": -85.7, "lat": 23.6, "wspd": 90.0, "date": "Oct 9:06:00 GMT", "pres": 973.0, "FO": "O"}, {"lon": -85.77, "lat": 23.77, "wspd": 90.0, "date": "Oct 9:07:00 GMT", "pres": 973.0, "FO": "O"}, {"lon": -85.83, "lat": 23.93, "wspd": 90.0, "date": "Oct 9:08:00 GMT", "pres": 973.0, "FO": "O"}, {"lon": -85.9, "lat": 24.1, "wspd": 90.0, "date": "Oct 9:09:00 GMT", "pres": 973.0, "FO": "O"}, {"lon": -85.97, "lat": 24.23, "wspd": 93.0, "date": "Oct 9:10:00 GMT", "pres": 971.0, "FO": "O"}, {"lon": -86.03, "lat": 24.37, "wspd": 96.0, "date": "Oct 9:11:00 GMT", "pres": 969.0, "FO": "O"}, {"lon": -86.1, "lat": 24.5, "wspd": 100.0, "date": "Oct 9:12:00 GMT", "pres": 968.0, "FO": "O"}, {"lon": -86.13, "lat": 24.67, "wspd": 103.0, "date": "Oct 9:13:00 GMT", "pres": 967.0, "FO": "O"}, {"lon": -86.17, "lat": 24.83, "wspd": 106.0, "date": "Oct 9:14:00 GMT", "pres": 966.0, "FO": "O"}, {"lon": -86.2, "lat": 25.0, "wspd": 110.0, "date": "Oct 9:15:00 GMT", "pres": 965.0, "FO": "O"}, {"lon": -86.27, "lat": 25.13, "wspd": 110.0, "date": "Oct 9:16:00 GMT", "pres": 965.0, "FO": "O"}, {"lon": -86.33, "lat": 25.27, "wspd": 110.0, "date": "Oct 9:17:00 GMT", "pres": 965.0, "FO": "O"}, {"lon": -86.4, "lat": 25.4, "wspd": 110.0, "date": "Oct 9:18:00 GMT", "pres": 965.0, "FO": "O"}, {"lon": -86.4, "lat": 25.6, "wspd": 113.0, "date": "Oct 9:19:00 GMT", "pres": 962.0, "FO": "O"}, {"lon": -86.4, "lat": 25.8, "wspd": 116.0, "date": "Oct 9:20:00 GMT", "pres": 959.0, "FO": "O"}, {"lon": -86.4, "lat": 26.0, "wspd": 120.0, "date": "Oct 9:21:00 GMT", "pres": 957.0, "FO": "O"}, {"lon": -86.43, "lat": 26.2, "wspd": 120.0, "date": "Oct 9:22:00 GMT", "pres": 955.0, "FO": "O"}, {"lon": -86.47, "lat": 26.4, "wspd": 120.0, "date": "Oct 9:23:00 GMT", "pres": 954.0, "FO": "O"}, {"lon": -86.5, "lat": 26.6, "wspd": 120.0, "date": "Oct 10:00:00 GMT", "pres": 953.0, "FO": "O"}, {"lon": -86.5, "lat": 26.77, "wspd": 121.0, "date": "Oct 10:01:00 GMT", "pres": 951.0, "FO": "O"}, {"lon": -86.5, "lat": 26.93, "wspd": 123.0, "date": "Oct 10:02:00 GMT", "pres": 949.0, "FO": "O"}, {"lon": -86.5, "lat": 27.1, "wspd": 125.0, "date": "Oct 10:03:00 GMT", "pres": 947.0, "FO": "O"}, {"lon": -86.53, "lat": 27.3, "wspd": 126.0, "date": "Oct 10:04:00 GMT", "pres": 946.0, "FO": "O"}, {"lon": -86.57, "lat": 27.5, "wspd": 128.0, "date": "Oct 10:05:00 GMT", "pres": 945.0, "FO": "O"}, {"lon": -86.6, "lat": 27.7, "wspd": 130.0, "date": "Oct 10:06:00 GMT", "pres": 945.0, "FO": "O"}, {"lon": -86.57, "lat": 27.9, "wspd": 133.0, "date": "Oct 10:07:00 GMT", "pres": 944.0, "FO": "O"}, {"lon": -86.53, "lat": 28.1, "wspd": 136.0, "date": "Oct 10:08:00 GMT", "pres": 943.0, "FO": "O"}, {"lon": -86.5, "lat": 28.3, "wspd": 140.0, "date": "Oct 10:09:00 GMT", "pres": 943.0, "FO": "O"}, {"lon": -86.47, "lat": 28.4, "wspd": 140.0, "date": "Oct 10:09:20 GMT", "pres": 941.0, "FO": "O"}, {"lon": -86.43, "lat": 28.5, "wspd": 140.0, "date": "Oct 10:09:40 GMT", "pres": 939.0, "FO": "O"}, {"lon": -86.4, "lat": 28.6, "wspd": 140.0, "date": "Oct 10:10:00 GMT", "pres": 937.0, "FO": "O"}, {"lon": -86.37, "lat": 28.67, "wspd": 140.0, "date": "Oct 10:10:20 GMT", "pres": 937.0, "FO": "O"}, {"lon": -86.33, "lat": 28.73, "wspd": 140.0, "date": "Oct 10:10:40 GMT", "pres": 937.0, "FO": "O"}, {"lon": -86.3, "lat": 28.8, "wspd": 140.0, "date": "Oct 10:11:00 GMT", "pres": 937.0, "FO": "O"}, {"lon": -86.3, "lat": 28.87, "wspd": 141.0, "date": "Oct 10:11:20 GMT", "pres": 935.0, "FO": "O"}, {"lon": -86.3, "lat": 28.93, "wspd": 143.0, "date": "Oct 10:11:40 GMT", "pres": 934.0, "FO": "O"}, {"lon": -86.3, "lat": 29.0, "wspd": 145.0, "date": "Oct 10:12:00 GMT", "pres": 933.0, "FO": "O"}, {"lon": -86.27, "lat": 29.03, "wspd": 145.0, "date": "Oct 10:12:20 GMT", "pres": 933.0, "FO": "O"}, {"lon": -86.23, "lat": 29.07, "wspd": 145.0, "date": "Oct 10:12:40 GMT", "pres": 933.0, "FO": "O"}, {"lon": -86.2, "lat": 29.1, "wspd": 145.0, "date": "Oct 10:13:00 GMT", "pres": 933.0, "FO": "O"}, {"lon": -86.17, "lat": 29.17, "wspd": 145.0, "date": "Oct 10:13:20 GMT", "pres": 932.0, "FO": "O"}, {"lon": -86.13, "lat": 29.23, "wspd": 145.0, "date": "Oct 10:13:40 GMT", "pres": 931.0, "FO": "O"}, {"lon": -86.1, "lat": 29.3, "wspd": 145.0, "date": "Oct 10:14:00 GMT", "pres": 931.0, "FO": "O"}, {"lon": -86.07, "lat": 29.33, "wspd": 145.0, "date": "Oct 10:14:20 GMT", "pres": 930.0, "FO": "O"}, {"lon": -86.03, "lat": 29.37, "wspd": 145.0, "date": "Oct 10:14:40 GMT", "pres": 929.0, "FO": "O"}, {"lon": -86.0, "lat": 29.4, "wspd": 145.0, "date": "Oct 10:15:00 GMT", "pres": 928.0, "FO": "O"}, {"lon": -85.97, "lat": 29.43, "wspd": 146.0, "date": "Oct 10:15:10 GMT", "pres": 926.0, "FO": "O"}, {"lon": -85.93, "lat": 29.47, "wspd": 148.0, "date": "Oct 10:15:20 GMT", "pres": 924.0, "FO": "O"}, {"lon": -85.9, "lat": 29.5, "wspd": 150.0, "date": "Oct 10:15:30 GMT", "pres": 923.0, "FO": "O"}, {"lon": -85.87, "lat": 29.53, "wspd": 150.0, "date": "Oct 10:15:40 GMT", "pres": 923.0, "FO": "O"}, {"lon": -85.83, "lat": 29.57, "wspd": 150.0, "date": "Oct 10:15:50 GMT", "pres": 923.0, "FO": "O"}, {"lon": -85.8, "lat": 29.6, "wspd": 150.0, "date": "Oct 10:16:00 GMT", "pres": 923.0, "FO": "O"}, {"lon": -85.77, "lat": 29.7, "wspd": 150.0, "date": "Oct 10:16:20 GMT", "pres": 921.0, "FO": "O"}, {"lon": -85.73, "lat": 29.8, "wspd": 150.0, "date": "Oct 10:16:40 GMT", "pres": 920.0, "FO": "O"}, {"lon": -85.7, "lat": 29.9, "wspd": 150.0, "date": "Oct 10:17:00 GMT", "pres": 919.0, "FO": "O"}, {"lon": -85.63, "lat": 29.93, "wspd": 153.0, "date": "Oct 10:17:10 GMT", "pres": 919.0, "FO": "O"}, {"lon": -85.57, "lat": 29.97, "wspd": 156.0, "date": "Oct 10:17:20 GMT", "pres": 919.0, "FO": "O"}, {"lon": -85.5, "lat": 30.0, "wspd": 160.0, "date": "Oct 10:17:30 GMT", "pres": 919.0, "FO": "O"}, {"lon": -85.47, "lat": 30.07, "wspd": 158.0, "date": "Oct 10:17:40 GMT", "pres": 919.0, "FO": "O"}, {"lon": -85.43, "lat": 30.13, "wspd": 156.0, "date": "Oct 10:17:50 GMT", "pres": 919.0, "FO": "O"}, {"lon": -85.4, "lat": 30.2, "wspd": 155.0, "date": "Oct 10:18:00 GMT", "pres": 920.0, "FO": "O"}, {"lon": -85.37, "lat": 30.27, "wspd": 153.0, "date": "Oct 10:18:20 GMT", "pres": 920.0, "FO": "O"}, {"lon": -85.33, "lat": 30.33, "wspd": 151.0, "date": "Oct 10:18:40 GMT", "pres": 921.0, "FO": "O"}, {"lon": -85.3, "lat": 30.4, "wspd": 150.0, "date": "Oct 10:19:00 GMT", "pres": 922.0, "FO": "O"}, {"lon": -85.27, "lat": 30.47, "wspd": 146.0, "date": "Oct 10:19:20 GMT", "pres": 923.0, "FO": "O"}, {"lon": -85.23, "lat": 30.53, "wspd": 143.0, "date": "Oct 10:19:40 GMT", "pres": 925.0, "FO": "O"}, {"lon": -85.2, "lat": 30.6, "wspd": 140.0, "date": "Oct 10:20:00 GMT", "pres": 927.0, "FO": "O"}, {"lon": -85.17, "lat": 30.7, "wspd": 135.0, "date": "Oct 10:20:20 GMT", "pres": 928.0, "FO": "O"}, {"lon": -85.13, "lat": 30.8, "wspd": 130.0, "date": "Oct 10:20:40 GMT", "pres": 930.0, "FO": "O"}, {"lon": -85.1, "lat": 30.9, "wspd": 125.0, "date": "Oct 10:21:00 GMT", "pres": 932.0, "FO": "O"}, {"lon": -85.03, "lat": 30.97, "wspd": 121.0, "date": "Oct 10:21:20 GMT", "pres": 934.0, "FO": "O"}, {"lon": -84.97, "lat": 31.03, "wspd": 118.0, "date": "Oct 10:21:40 GMT", "pres": 937.0, "FO": "O"}, {"lon": -84.9, "lat": 31.1, "wspd": 115.0, "date": "Oct 10:22:00 GMT", "pres": 940.0, "FO": "O"}, {"lon": -84.9, "lat": 31.1, "wspd": 110.0, "date": "Oct 10:22:20 GMT", "pres": 943.0, "FO": "O"}, {"lon": -84.9, "lat": 31.1, "wspd": 105.0, "date": "Oct 10:22:40 GMT", "pres": 946.0, "FO": "O"}, {"lon": -84.9, "lat": 31.1, "wspd": 100.0, "date": "Oct 10:23:00 GMT", "pres": 950.0, "FO": "O"}, {"lon": -84.77, "lat": 31.23, "wspd": 96.0, "date": "Oct 10:23:20 GMT", "pres": 951.0, "FO": "O"}, {"lon": -84.63, "lat": 31.37, "wspd": 93.0, "date": "Oct 10:23:40 GMT", "pres": 953.0, "FO": "O"}, {"lon": -84.5, "lat": 31.5, "wspd": 90.0, "date": "Oct 11:00:00 GMT", "pres": 955.0, "FO": "O"}, {"lon": -84.47, "lat": 31.57, "wspd": 88.0, "date": "Oct 11:00:20 GMT", "pres": 956.0, "FO": "O"}, {"lon": -84.43, "lat": 31.63, "wspd": 86.0, "date": "Oct 11:00:40 GMT", "pres": 958.0, "FO": "O"}, {"lon": -84.4, "lat": 31.7, "wspd": 85.0, "date": "Oct 11:01:00 GMT", "pres": 960.0, "FO": "O"}, {"lon": -84.3, "lat": 31.77, "wspd": 83.0, "date": "Oct 11:01:20 GMT", "pres": 961.0, "FO": "O"}, {"lon": -84.2, "lat": 31.83, "wspd": 81.0, "date": "Oct 11:01:40 GMT", "pres": 963.0, "FO": "O"}, {"lon": -84.1, "lat": 31.9, "wspd": 80.0, "date": "Oct 11:02:00 GMT", "pres": 965.0, "FO": "O"}, {"lon": -84.0, "lat": 31.97, "wspd": 78.0, "date": "Oct 11:02:20 GMT", "pres": 966.0, "FO": "O"}, {"lon": -83.9, "lat": 32.03, "wspd": 76.0, "date": "Oct 11:02:40 GMT", "pres": 968.0, "FO": "O"}, {"lon": -83.8, "lat": 32.1, "wspd": 75.0, "date": "Oct 11:03:00 GMT", "pres": 970.0, "FO": "O"}, {"lon": -83.73, "lat": 32.17, "wspd": 73.0, "date": "Oct 11:03:20 GMT", "pres": 971.0, "FO": "O"}, {"lon": -83.67, "lat": 32.23, "wspd": 71.0, "date": "Oct 11:03:40 GMT", "pres": 973.0, "FO": "O"}, {"lon": -83.6, "lat": 32.3, "wspd": 70.0, "date": "Oct 11:04:00 GMT", "pres": 975.0, "FO": "O"}, {"lon": -83.47, "lat": 32.43, "wspd": 66.0, "date": "Oct 11:04:40 GMT", "pres": 976.0, "FO": "O"}, {"lon": -83.33, "lat": 32.57, "wspd": 63.0, "date": "Oct 11:05:20 GMT", "pres": 977.0, "FO": "O"}, {"lon": -83.2, "lat": 32.7, "wspd": 60.0, "date": "Oct 11:06:00 GMT", "pres": 979.0, "FO": "O"}, {"lon": -82.97, "lat": 32.97, "wspd": 56.0, "date": "Oct 11:07:00 GMT", "pres": 980.0, "FO": "O"}, {"lon": -82.73, "lat": 33.23, "wspd": 53.0, "date": "Oct 11:08:00 GMT", "pres": 981.0, "FO": "O"}, {"lon": -82.5, "lat": 33.5, "wspd": 50.0, "date": "Oct 11:09:00 GMT", "pres": 983.0, "FO": "O"}, {"lon": -82.27, "lat": 33.7, "wspd": 50.0, "date": "Oct 11:10:00 GMT", "pres": 984.0, "FO": "O"}, {"lon": -82.03, "lat": 33.9, "wspd": 50.0, "date": "Oct 11:11:00 GMT", "pres": 985.0, "FO": "O"}, {"lon": -81.8, "lat": 34.1, "wspd": 50.0, "date": "Oct 11:12:00 GMT", "pres": 986.0, "FO": "O"}, {"lon": -81.47, "lat": 34.3, "wspd": 50.0, "date": "Oct 11:13:00 GMT", "pres": 987.0, "FO": "O"}, {"lon": -81.13, "lat": 34.5, "wspd": 50.0, "date": "Oct 11:14:00 GMT", "pres": 988.0, "FO": "O"}, {"lon": -80.8, "lat": 34.7, "wspd": 50.0, "date": "Oct 11:15:00 GMT", "pres": 990.0, "FO": "O"}, {"lon": -80.53, "lat": 35.03, "wspd": 50.0, "date": "Oct 11:16:00 GMT", "pres": 990.0, "FO": "O"}, {"lon": -80.27, "lat": 35.37, "wspd": 50.0, "date": "Oct 11:17:00 GMT", "pres": 990.0, "FO": "O"}, {"lon": -80.0, "lat": 35.7, "wspd": 50.0, "date": "Oct 11:18:00 GMT", "pres": 991.0, "FO": "O"}, {"lon": -79.6, "lat": 35.83, "wspd": 50.0, "date": "Oct 11:19:00 GMT", "pres": 990.0, "FO": "O"}, {"lon": -79.2, "lat": 35.97, "wspd": 50.0, "date": "Oct 11:20:00 GMT", "pres": 990.0, "FO": "O"}, {"lon": -78.8, "lat": 36.1, "wspd": 50.0, "date": "Oct 11:21:00 GMT", "pres": 990.0, "FO": "O"}, {"lon": -78.47, "lat": 36.23, "wspd": 50.0, "date": "Oct 11:22:00 GMT", "pres": 989.0, "FO": "O"}, {"lon": -78.13, "lat": 36.37, "wspd": 50.0, "date": "Oct 11:23:00 GMT", "pres": 989.0, "FO": "O"}, {"lon": -77.8, "lat": 36.5, "wspd": 50.0, "date": "Oct 12:00:00 GMT", "pres": 989.0, "FO": "O"}, {"lon": -77.23, "lat": 36.7, "wspd": 50.0, "date": "Oct 12:01:00 GMT", "pres": 988.0, "FO": "O"}, {"lon": -76.67, "lat": 36.9, "wspd": 50.0, "date": "Oct 12:02:00 GMT", "pres": 988.0, "FO": "O"}, {"lon": -76.1, "lat": 37.1, "wspd": 50.0, "date": "Oct 12:03:00 GMT", "pres": 988.0, "FO": "O"}, {"lon": -75.77, "lat": 37.17, "wspd": 53.0, "date": "Oct 12:04:00 GMT", "pres": 987.0, "FO": "O"}, {"lon": -75.43, "lat": 37.23, "wspd": 56.0, "date": "Oct 12:05:00 GMT", "pres": 986.0, "FO": "O"}, {"lon": -75.1, "lat": 37.3, "wspd": 60.0, "date": "Oct 12:06:00 GMT", "pres": 985.0, "FO": "O"}, {"lon": -74.43, "lat": 37.53, "wspd": 61.0, "date": "Oct 12:07:00 GMT", "pres": 984.0, "FO": "O"}, {"lon": -73.77, "lat": 37.77, "wspd": 63.0, "date": "Oct 12:08:00 GMT", "pres": 983.0, "FO": "O"}]
  rows = rows.slice(108,160);
  addCollapse('sidebar-left','parameters-collapse-label','parameters-collapse-div','PARAMETERS','<i class="fa fa-sliders mr-1" aria-hidden="true"></i>',false,null,'Adjust parameters used to filter and sort MTBS products');
  $('#parameters-collapse-div').append(`<label>Provide storm track geoJSON:</label>
                                        <input rel="txtTooltip" title = 'Provide storm track geoJSON'  type="user-selected-area-name" class="form-control" value = '${JSON.stringify(rows)}' id="storm-track" placeholder="Provide storm track geoJSON" style='width:80%;'>`)
  
  $('#parameters-collapse-div').append(`<label>Provide name for storm (optional):</label>
                                        <input rel="txtTooltip" title = 'Provide a name for the storm. A default one will be provided if left blank.'  type="user-selected-area-name" class="form-control" id="storm-name" value = 'Michael' placeholder="Name your storm!" style='width:80%;'>`)
  addRangeSlider('parameters-collapse-div','Choose storm year','stormYear',1980, 2030, 2018, 1,'storm-year-slider','null',"Specify year of storm")
  $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  $('#parameters-collapse-div').append(staticTemplates.reRunButton);
  addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div',mode+' DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' src="images/layer_icon.png">`,true,null,mode+' DATA layers to view on map');
  $('#layer-list-collapse-div').append(`<div id="layer-list"></div>`);
  addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');
  addCollapse('sidebar-left','download-collapse-label','download-collapse-div','DOWNLOAD DATA',`<i class="fa fa-cloud-download mr-1" aria-hidden="true"></i>`,false,``,'Download '+mode+' products for further analysis');
  
}else{
  addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div','ANCILLARY DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' src="images/layer_icon.png">`,true,null,mode+' DATA layers to view on map');
  addCollapse('sidebar-left','reference-layer-list-collapse-label','reference-layer-list-collapse-div','PLOT DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' src="images/layer_icon.png">`,false,null,'Additional relevant layers to view on map intended to provide context for '+mode+' DATA');
  
  addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');

  $('#layer-list-collapse-div').append(`<div id="layer-list"></div>`);
  $('#reference-layer-list-collapse-div').append(`<div id="reference-layer-list"></div>`);
  plotsOn = true;
}

$('body').append(`<div class = 'legendDiv flexcroll col-sm-5 col-md-4 col-lg-3 col-xl-2 p-0 m-0' id = 'legendDiv'></div>`);
$('.legendDiv').css('bottom',$('.bottombar').height());
$('.sidebar').css('max-height',$('body').height()-$('.bottombar').height());
addLegendCollapse();
/////////////////////////////////////////////////////////////////
//Construct tool options for different modes
 

addAccordianContainer('tools-collapse-div','tools-accordian')
$('#tools-accordian').append(`<h5 class = 'pt-2' style = 'border-top: 0.1em solid black;'>Measuring Tools</h5>`);
// $('#tools-accordian').append(staticTemplates.imperialMetricToggle);
addSubAccordianCard('tools-accordian','measure-distance-label','measure-distance-div','Distance Measuring',staticTemplates.distanceDiv,false,`toggleTool(toolFunctions.measuring.distance)`,staticTemplates.distanceTipHover);

// <variable-radio onclick1 = 'updateDistance()' onclick2 = 'updateDistance()'var='metricOrImperialDistance' title2='' name2='Metric' name1='Imperial' value2='metric' value1='imperial' type='string' href="#" rel="txtTooltip" data-toggle="tooltip" data-placement="top" title='Toggle between imperial or metric units'></variable-radio>
addSubAccordianCard('tools-accordian','measure-area-label','measure-area-div','Area Measuring',staticTemplates.areaDiv,false,`toggleTool(toolFunctions.measuring.area)`,staticTemplates.areaTipHover);
addRadio('measure-distance-div','metricOrImperialDistance-radio','','Imperial','Metric','metricOrImperialDistance','imperial','metric','updateDistance()','updateDistance()','Toggle between imperial or metric units')

addRadio('measure-area-div','metricOrImperialArea-radio','','Imperial','Metric','metricOrImperialArea','imperial','metric','updateArea()','updateArea()','Toggle between imperial or metric units')

addShapeEditToolbar('measure-distance-div', 'measure-distance-div-icon-bar','undoDistanceMeasuring()','resetPolyline()')
addColorPicker('measure-distance-div-icon-bar','distance-color-picker','updateDistanceColor',distancePolylineOptions.strokeColor);

addShapeEditToolbar('measure-area-div', 'measure-area-div-icon-bar','undoAreaMeasuring()','resetPolys()')
addColorPicker('measure-area-div-icon-bar','area-color-picker','updateAreaColor',areaPolygonOptions.strokeColor);

// addAccordianContainer('pixel-tools-collapse-div','pixel-tools-accordian');
$('#tools-accordian').append(`<h5 class = 'pt-2' style = 'border-top: 0.1em solid black;'>Pixel Tools</h5>`);
addSubAccordianCard('tools-accordian','query-label','query-div','Query Visible Map Layers',staticTemplates.queryDiv,false,`toggleTool(toolFunctions.pixel.query)`,staticTemplates.queryTipHover);
// if(mode !== 'STORM'){
  addSubAccordianCard('tools-accordian','pixel-chart-label','pixel-chart-div','Query '+mode+' Time Series',staticTemplates.pixelChartDiv,false,`toggleTool(toolFunctions.pixel.chart)`,staticTemplates.pixelChartTipHover);
  addDropdown('pixel-chart-div','pixel-collection-dropdown','Choose which '+mode+' time series to chart','whichPixelChartCollection','Choose which '+mode+' time series to chart.');
 
// }
// $('#pixel-chart-div').append(staticTemplates.showChartButton);
// addAccordianContainer('area-tools-collapse-div','area-tools-accordian');
if(mode === 'geeViz'){
  $('#pixel-chart-label').remove();
  $('#share-button').remove();
}

if(mode === 'LCMS' || mode === 'MTBS'|| mode === 'TEST' || mode === 'lcms-base-learner' || mode === 'FHP'){
  $('#tools-accordian').append(`<h5 class = 'pt-2' style = 'border-top: 0.1em solid black;'>Area Tools</h5>`);
  addSubCollapse('tools-accordian','area-chart-params-label','area-chart-params-div','Area Tools Params', '',false,'')
  
  // $('#tools-accordian').append(`<div class="dropdown-divider" ></div>`);
  addDropdown('area-chart-params-div','area-collection-dropdown','Choose which '+mode+' product to summarize','whichAreaChartCollection','Choose which '+mode+' time series to summarize.');
  // $('#area-chart-params-div').append(`<div class="dropdown-divider" ></div>`);
  $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  addMultiRadio('area-chart-params-div','area-summary-format','Area Units','areaChartFormat',{"Percentage":true,"Acres":false,"Hectares":false})
  $('#area-summary-format').prop('title','Choose how to summarize area- as a percentage of the area, acres, or hectares.')
  addSubAccordianCard('tools-accordian','user-defined-area-chart-label','user-defined-area-chart-div','User-Defined Area',staticTemplates.userDefinedAreaChartDiv,false,`toggleTool(toolFunctions.area.userDefined)`,staticTemplates.userDefinedAreaChartTipHover);
  addSubAccordianCard('tools-accordian','upload-area-chart-label','upload-area-chart-div','Upload an Area',staticTemplates.uploadAreaChartDiv,false,'toggleTool(toolFunctions.area.shpDefined)',staticTemplates.uploadAreaChartTipHover);
  // addSubAccordianCard('tools-accordian','select-area-dropdown-chart-label','select-area-dropdown-chart-div','Select an Area from Dropdown',staticTemplates.selectAreaDropdownChartDiv,false,'toggleTool(toolFunctions.area.selectDropdown)',staticTemplates.selectAreaDropdownChartTipHover);
  addSubAccordianCard('tools-accordian','select-area-interactive-chart-label','select-area-interactive-chart-div','Select an Area on Map',staticTemplates.selectAreaInteractiveChartDiv,false,'toggleTool(toolFunctions.area.selectInteractive)',staticTemplates.selectAreaInteractiveChartTipHover);

  addShapeEditToolbar('user-defined-edit-toolbar', 'user-defined-area-icon-bar','undoUserDefinedAreaCharting()','restartUserDefinedAreaCarting()')
  addColorPicker('user-defined-area-icon-bar','user-defined-color-picker','updateUDPColor',udpOptions.strokeColor);

  addShapeEditToolbar('select-features-edit-toolbar', 'select-area-interactive-chart-icon-bar','removeLastSelectArea()','clearSelectedAreas()','Click to unselect most recently selected polyogn','Click to clear all selected polygons');
}
//Add some logos for different modes
if(mode === 'MTBS' || mode === 'Ancillary'){
  $('#contributor-logos').prepend(`<a href="https://www.usgs.gov/" target="_blank" >
                                    <img src="images/usgslogo.png" class = 'image-icon-bar'  href="#"  rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Click to learn more about the US Geological Survey">
                                  </a>`)
  $('#contributor-logos').prepend(`<a href="https://www.mtbs.gov/" target="_blank" >
                                    <img src="images/mtbs-logo.png" class = 'image-icon-bar'  href="#"  rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Click to learn more about the US Geological Survey">
                                  </a>`)
}
//Handle exporting if chosen
if(canExport){
  // console.log('here')
   $('#download-collapse-div').append(staticTemplates.exportContainer);
   if(localStorage.export_crs !== undefined && localStorage.export_crs !== null && localStorage.export_crs.indexOf('EPSG') > -1){
    $('#export-crs').val(localStorage.export_crs)
  }else{localStorage.export_crs = $('#export-crs').val()};
   function cacheCRS(){
    localStorage.export_crs = $('#export-crs').val();
   }
}

if(urlParams.showSidebar === undefined || urlParams.showSidebar === null){
  urlParams.showSidebar = 'true'
}

function toggleSidebar(){
  $('#sidebar-left').toggle('collapse');
  if(urlParams.showSidebar === 'false'){
    urlParams.showSidebar = 'true'
  }else{
    urlParams.showSidebar = 'false'
  }
};
if(urlParams.showSidebar === 'false'){
  $('#sidebar-left').hide();
}


