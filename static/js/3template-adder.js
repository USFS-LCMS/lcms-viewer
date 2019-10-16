


$('body').append(staticTemplates.map);
$('body').append(staticTemplates.mainContainer);
$('body').append(staticTemplates.sidebarLeftContainer);
$('body').append(staticTemplates.geeSpinner);
$('body').append(staticTemplates.bottomBar);
$('#main-container').append(staticTemplates.sidebarLeftToggler)

$('#sidebar-left-header').append(staticTemplates.topBanner)
// $('#title-banner').fitText(1.2);
// $('#studyAreaDropdownLabel').fitText(0.5);

$('#main-container').append(staticTemplates.introModal)

if(localStorage.showIntroModal == undefined){
  localStorage.showIntroModal = 'true';
  }
if(localStorage.showIntroModal === 'true'){
  $('#introModal').modal().show();
}
$('#dontShowAgainCheckbox').change(function(){
  console.log(this.checked)
  localStorage.showIntroModal  = !this.checked;
});

addStudyAreaToDropdown('Bridger-Teton National Forest',"Bridger-Teton National Forest boundary buffered by 5km plus Star Valley");
addStudyAreaToDropdown('Flathead National Forest',"Flathead National Forest buffered along with Glacier National Park buffered by 1km");
addStudyAreaToDropdown('Manti-La Sal National Forest',"Manti-La Sal National Forest");
addStudyAreaToDropdown('Chugach National Forest - Kenai Peninsula',"Chugach National Forest - Kenai Peninsula");
addStudyAreaToDropdown('Science Team CONUS',"2018 LCMS Science Team CONUS-wide loss");
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

        
addCollapse('sidebar-left','parameters-collapse-label','parameters-collapse-div','PARAMETERS','<i class="fa fa-sliders mr-1" aria-hidden="true"></i>',false,null,'Adjust parameters used to filter and sort LCMS products');
addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div','LCMS DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' src="images/layer_icon.png">`,true,null,'LCMS DATA layers to view on map');
addCollapse('sidebar-left','reference-layer-list-collapse-label','reference-layer-list-collapse-div','REFERENCE DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' src="images/layer_icon.png">`,false,null,'Additional relevant layers to view on map intended to provide context for LCMS DATA');

addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');

addCollapse('sidebar-left','download-collapse-label','download-collapse-div','DOWNLOAD DATA',`<i class="fa fa-cloud-download mr-1" aria-hidden="true"></i>`,false,``,'Download LCMS products for further analysis');
addCollapse('sidebar-left','support-collapse-label','support-collapse-div','SUPPORT',`<i class="fa fa-question-circle mr-1" aria-hidden="true"></i>`,false,``,'If you need any help');

// $('#parameters-collapse-div').append(staticTemplates.paramsDiv);

//Construct parameters form
addRadio('parameters-collapse-div','analysis-mode-radio','Choose which mode:','Standard','Advanced','analysisMode','standard','advanced','toggleAdvancedOff()','toggleAdvancedOn()','Standard mode provides the core LCMS products based on carefully selected parameters. Advanced mode provides additional LCMS products and parameter options')
$('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
addDualRangeSlider('parameters-collapse-div','Choose analysis year range:','startYear','endYear',startYear, endYear, startYear, endYear, 1,'analysis-year-slider','null','Years of LCMS data to include for land cover, land use, loss, and gain')

$('#parameters-collapse-div').append(`<div class="dropdown-divider"></div>
                                        <div id='threshold-container' style="display:none;width:100%"></div>
                                        <div id='advanced-radio-container' style="display: none;"></div>`)
addDualRangeSlider('threshold-container','Choose loss threshold:','lowerThresholdDecline','upperThresholdDecline',0, 1, lowerThresholdDecline, upperThresholdDecline, 0.05,'decline-threshold-slider','null',"Threshold window for detecting loss.  Any loss probability within the specified window will be flagged as loss ")
$('#threshold-container').append(`<div class="dropdown-divider" ></div>`);
addDualRangeSlider('threshold-container','Choose gain threshold:','lowerThresholdRecovery','upperThresholdRecovery',0, 1, lowerThresholdRecovery, upperThresholdRecovery, 0.05,'recovery-threshold-slider','null',"Threshold window for detecting gain.  Any gain probability within the specified window will be flagged as gain ")
$('#advanced-radio-container').append(`<div class="dropdown-divider" ></div>`);

addRadio('advanced-radio-container','treemask-radio','Constrain analysis to areas with trees:','Yes','No','applyTreeMask','yes','no','','','Whether to constrain LCMS products to only treed areas. Any area LCMS classified as tree cover 2 or more years will be considered tree. Will reduce commission errors typical in agricultural and water areas, but may also reduce changes of interest in these areas.')
$('#advanced-radio-container').append(`<div class="dropdown-divider" ></div>`);
addRadio('advanced-radio-container','viewBeta-radio','View beta outputs:','No','Yes','viewBeta','no','yes','','','Whether to view products that are currently in beta development')
$('#advanced-radio-container').append(`<div class="dropdown-divider" ></div>`);
addRadio('advanced-radio-container','summaryMethod-radio','Summary method:','Most recent year','Highest probability','summaryMethod','year','prob','','','How to choose which value for loss and gain to display/export.  Choose the value with the highest probability or from the most recent year above the specified threshold')
$('#advanced-radio-container').append(`<div class="dropdown-divider" ></div>`);
addRadio('advanced-radio-container','whichIndex-radio','Index for charting:','NDVI','NBR','whichIndex','NDVI','NBR','','','The vegetation index that will be displayed in the "Query LCMS Time Series" tool')
$('#advanced-radio-container').append(`<div class="dropdown-divider" ></div>`);
$('#parameters-collapse-div').append(staticTemplates.reRunButton);

//Set up layer lists
$('#layer-list-collapse-div').append(`<div id="layer-list"></div>`);
$('#reference-layer-list-collapse-div').append(`<div id="reference-layer-list"></div>`);


$('#download-collapse-div').append(staticTemplates.downloadDiv);
$('#support-collapse-div').append(staticTemplates.supportDiv);

// setUpRangeSlider('startYear', 'endYear', 1985, 2018, startYear, endYear, 1, 'slider1', 'date-range-value1', 'null');
// setUpRangeSlider('lowerThresholdDecline', 'upperThresholdDecline', 0, 1, lowerThresholdDecline, upperThresholdDecline, 0.05, 'slider2', 'declineThreshold', 'null');

// setUpRangeSlider('lowerThresholdRecovery', 'upperThresholdRecovery', 0, 1, lowerThresholdRecovery, upperThresholdRecovery, 0.05, 'slider3', 'recoveryThreshold', 'null');

$('body').append(`<div class = 'legendDiv flexcroll col-sm-6 col-md-4 col-lg-3 col-xl-2 p-0 m-0' id = 'legendDiv'></div>`);
// $('body').append(`<span style = 'position:absolute;right:20%;bottom:50%;z-index:10;cursor:pointer;' class = 'p-2 bg-black' id = 'tool-message-box'></span>`);
// $('#tool-message-box').draggable();
// $('#tool-message-box').hide();

// addToggle('layer-list-collapse-div','test-toggle','Toggle metric or imperial', 'Imperial','Metric','checked','mi','imperial','metric');
addCollapse('legendDiv','legend-collapse-label','legend-collapse-div','LEGEND','<i class="fa fa-location-arrow fa-rotate-45 mx-1" aria-hidden="true"></i>',true,``,'LEGEND of the layers displayed on the map')
// $('#legend-collapse-div').append(`<legend-list   id="legend"></legend-list>`)
$('#legend-collapse-div').append(`<div id="legend-layer-list"></div>`);
$('#legend-collapse-div').append(`<div id="legend-reference-layer-list"></div>`)
//Add tool tabs
 

addAccordianContainer('tools-collapse-div','tools-accordian')

// addAccordianCard('tools-accordian','measuring-tools-collapse-label','measuring-tools-collapse-div','Measuring Tools',``,false,'');
// addAccordianCard('tools-accordian','pixel-tools-collapse-label','pixel-tools-collapse-div','Pixel Tools',``,false,'');
// addAccordianCard('tools-accordian','area-tools-collapse-label','area-tools-collapse-div','Area Tools',``,false,'');

// addAccordianContainer('measuring-tools-collapse-div','measuring-tools-accordian');


$('#tools-accordian').append(`<h5 class = 'pt-2' style = 'border-top: 0.1em solid black;'>Measuring Tools</h5>`);
// $('#tools-accordian').append(staticTemplates.imperialMetricToggle);
addSubAccordianCard('tools-accordian','measure-distance-label','measure-distance-div','Distance Measuring',staticTemplates.distanceDiv,false,`toggleTool(toolFunctions.measuring.distance)`,staticTemplates.distanceTip);
addRadio('measure-distance-div','metricOrImperialDistance-radio','','Imperial','Metric','metricOrImperialDistance','imperial','metric','updateDistance()','updateDistance()','Toggle between imperial or metric units')

// <variable-radio onclick1 = 'updateDistance()' onclick2 = 'updateDistance()'var='metricOrImperialDistance' title2='' name2='Metric' name1='Imperial' value2='metric' value1='imperial' type='string' href="#" rel="txtTooltip" data-toggle="tooltip" data-placement="top" title='Toggle between imperial or metric units'></variable-radio>
addSubAccordianCard('tools-accordian','measure-area-label','measure-area-div','Area Measuring',staticTemplates.areaDiv,false,`toggleTool(toolFunctions.measuring.area)`,staticTemplates.areaTip);
addRadio('measure-area-div','metricOrImperialArea-radio','','Imperial','Metric','metricOrImperialArea','imperial','metric','updateArea()','updateArea()','Toggle between imperial or metric units')

addShapeEditToolbar('measure-distance-div', 'measure-distance-div-icon-bar','undoDistanceMeasuring()','resetPolyline()')
addColorPicker('measure-distance-div-icon-bar','distance-color-picker','updateDistanceColor',distancePolylineOptions.strokeColor);

addShapeEditToolbar('measure-area-div', 'measure-area-div-icon-bar','undoAreaMeasuring()','resetPolys()')
addColorPicker('measure-area-div-icon-bar','area-color-picker','updateAreaColor',areaPolygonOptions.strokeColor);

// addAccordianContainer('pixel-tools-collapse-div','pixel-tools-accordian');
$('#tools-accordian').append(`<h5 class = 'pt-2' style = 'border-top: 0.1em solid black;'>Pixel Tools</h5>`);
addSubAccordianCard('tools-accordian','query-label','query-div','Query Visible Map Layers',staticTemplates.queryDiv,false,`toggleTool(toolFunctions.pixel.query)`,staticTemplates.queryTip);
addSubAccordianCard('tools-accordian','pixel-chart-label','pixel-chart-div','Query LCMS Time Series',staticTemplates.pixelChartDiv,false,`toggleTool(toolFunctions.pixel.chart)`,staticTemplates.pixelChartTip);

// addAccordianContainer('area-tools-collapse-div','area-tools-accordian');



$('#tools-accordian').append(`<h5 class = 'pt-2' style = 'border-top: 0.1em solid black;'>Area Tools</h5>`);
addDropdown('tools-accordian','area-collection-dropdown','Choose which LCMS product to summarize','whichAreaChartCollection','Choose which LCMS time series to summarize. Loss/Gain will chart the proportion of both loss and gain over a selected area while Landcover will chart the proportion of each landcover class over a selected area.');
addSubAccordianCard('tools-accordian','user-defined-area-chart-label','user-defined-area-chart-div','User Defined Area Tool',staticTemplates.userDefinedAreaChartDiv,false,`toggleTool(toolFunctions.area.userDefined)`,staticTemplates.userDefinedAreaChartTip);
addSubAccordianCard('tools-accordian','upload-area-chart-label','upload-area-chart-div','Upload an Area',staticTemplates.uploadAreaChartDiv,false,'toggleTool(toolFunctions.area.shpDefined)',staticTemplates.uploadAreaChartTip);
addSubAccordianCard('tools-accordian','select-area-chart-label','select-area-chart-div','Select an Area',staticTemplates.selectAreaChartDiv,false,'toggleTool(toolFunctions.area.select)',staticTemplates.selectAreaChartTip);

addShapeEditToolbar('user-defined', 'user-defined-area-icon-bar','undoUserDefinedAreaCharting()','restartUserDefinedAreaCarting()')
addColorPicker('user-defined-area-icon-bar','user-defined-color-picker','updateUDPColor',udpOptions.strokeColor);


$('#user-defined-area-chart-div').append(staticTemplates.showChartButton);
$('#upload-area-chart-div').append(staticTemplates.showChartButton);
$('#select-area-chart-div').append(staticTemplates.showChartButton);


if(canExport){
   $('#download-collapse-div').append(staticTemplates.exportContainer);
}

// addToggle('measure-distance-div','toggler-distance-units','Toggle imperial or metric units: ',"Imperial",'Metric','true','metricOrImperialDistance','imperial','metric','updateDistance()');
// addToggle('measure-area-div','toggler-area-units','Toggle imperial or metric units: ',"Imperial",'Metric','true','metricOrImperialArea','imperial','metric','updateArea()');


// $('#sidebar-left').append(`<button onclick="getLocation()">Try It</button><p id="demo"></p>`)
// var x = document.getElementById("demo");

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else { 
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  x.innerHTML = "Latitude: " + position.coords.latitude + 
  "<br>Longitude: " + position.coords.longitude;
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      x.innerHTML = "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerHTML = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      x.innerHTML = "The request to get user location timed out."
      break;
    case error.UNKNOWN_ERROR:
      x.innerHTML = "An unknown error occurred."
      break;
  }
}
function walkThrough(){
    walkThroughDict = {'Parameters':{
                            title: 'Parameters',
                            divID:'parameters-collapse-div',
                            message:`<li>
                                    <ul>There are a number of parameters </ul>
                                    </li>`
                        },
                        'lcms-layers':{
                            title: 'lcms layers',
                            divID: 'layer-list-collapse-div',
                            message:`<li>
                                <ul>There are a number of parameters </ul>
                                </li>`
                        }

                    
                    }
    Object.keys(walkThroughDict).map(function(k){
        console.log(walkThroughDict[k].divID)
        $('#'+walkThroughDict[k].divID).collapse('hide')
    })
    // showTip('lcms data explorer walk-through','We will walk through some of the features of the LCMS Data Explorer ');
    // $('#tip-modal').on('hidden.bs.modal',function(){
    //     $('#parameters-collapse-div').collapse('show')
    //     showTip('Parameters',`<li>
    //                             <ul>There are a number of parameters </ul>
    //                             </li>`)
    // })

    // while($('#tip-modal').is(':visible')){}
}
// walkThrough();