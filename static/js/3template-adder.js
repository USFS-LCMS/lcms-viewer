



$('body').append(staticTemplates.map);
$('body').append(staticTemplates.mainContainer);
$('body').append(staticTemplates.sidebarLeftContainer);
$('body').append(staticTemplates.geeSpinner);
$('body').append(staticTemplates.bottomBar);

$('#sidebar-left-header').append(staticTemplates.topBanner)
$('#title-banner').fitText(1.2);
$('#studyAreaDropdownLabel').fitText(1.9);

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
$('#study-area-label').fitText(1.3);


function toggleAdvancedOn(){
    $("#threshold-container").slideDown();
    $("#advanced-radio-container").slideDown();  
}
function toggleAdvancedOff(){
    $("#threshold-container").slideUp();
    $("#advanced-radio-container").slideUp();  
}

        
addCollapse('sidebar-left','parameters-collapse-label','parameters-collapse-div','PARAMETERS','<i class="fa fa-sliders mr-1" aria-hidden="true"></i>',false,null,'Adjust PARAMETERS used to filter and sort LCMS products');
addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div','LCMS DATA',`<img style = 'width:20px;' class='image-icon mr-1' src="images/layer_icon.png">`,true,null,'LCMS DATA layers to view on map');
addCollapse('sidebar-left','reference-layer-list-collapse-label','reference-layer-list-collapse-div','REFERENCE DATA',`<img style = 'width:20px;' class='image-icon mr-1' src="images/layer_icon.png">`,false,null,'Additional relevant layers to view on map intended to provide context for LCMS DATA');

addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'toggleRadio("none")','Tools to measure and chart data provided on the map');

addCollapse('sidebar-left','download-collapse-label','download-collapse-div','DOWNLOAD DATA',`<i class="fa fa-cloud-download mr-1" aria-hidden="true"></i>`,false,``,'Download LCMS products for further analysis');
addCollapse('sidebar-left','support-collapse-label','support-collapse-div','SUPPORT',`<i class="fa fa-question-circle mr-1" aria-hidden="true"></i>`,false,``,'If you have questions or comments');

$('#parameters-collapse-div').append(staticTemplates.paramsDiv);
$('#layer-list-collapse-div').append(`<layer-list id="layers"></layer-list>`);
$('#reference-layer-list-collapse-div').append(`<reference-layer-list id="reference-layers"></reference-layer-list>`);


$('#download-collapse-div').append(staticTemplates.downloadDiv);
$('#support-collapse-div').append(staticTemplates.supportDiv);


setUpRangeSlider('startYear', 'endYear', 1985, 2018, startYear, endYear, 1, 'slider1', 'date-range-value1', 'null');
setUpRangeSlider('lowerThresholdDecline', 'upperThresholdDecline', 0, 1, lowerThresholdDecline, upperThresholdDecline, 0.05, 'slider2', 'declineThreshold', 'null');

setUpRangeSlider('lowerThresholdRecovery', 'upperThresholdRecovery', 0, 1, lowerThresholdRecovery, upperThresholdRecovery, 0.05, 'slider3', 'recoveryThreshold', 'null');

$('body').append(`<div class = 'legendDiv flexcroll' id = 'legendDiv'></div>`);
// $('body').append(`<span style = 'position:absolute;right:20%;bottom:50%;z-index:10;cursor:pointer;' class = 'p-2 bg-black' id = 'tool-message-box'></span>`);
// $('#tool-message-box').draggable();
// $('#tool-message-box').hide();
addCollapse('legendDiv','legend-collapse-label','legend-collapse-div','LEGEND','<i class="fa fa-location-arrow fa-rotate-45 mx-1" aria-hidden="true"></i>',true,``,'LEGEND of the layers displayed on the map')
$('#legend-collapse-div').append(`<legend-list   id="legend"></legend-list>`)

//Add tool tabs
 

addAccordianContainer('tools-collapse-div','tools-accordian')

addAccordianCard('tools-accordian','measuring-tools-collapse-label','measuring-tools-collapse-div','Measuring Tools',``,false,'toggleRadio("none")');
addAccordianCard('tools-accordian','pixel-tools-collapse-label','pixel-tools-collapse-div','Pixel Tools',``,false,'toggleRadio("none")');
addAccordianCard('tools-accordian','area-tools-collapse-label','area-tools-collapse-div','Area Tools',``,false,'toggleRadio("none")');

addAccordianContainer('measuring-tools-collapse-div','measuring-tools-accordian');
addAccordianCard('measuring-tools-accordian','measure-distance-label','measure-distance-div','Distance Measuring',staticTemplates.distanceDiv,false,`toggleRadio("none");toggleRadio("distance");`,staticTemplates.distanceTip);
addAccordianCard('measuring-tools-accordian','measure-area-label','measure-area-div','Area Measuring',staticTemplates.areaDiv,false,'toggleRadio("none");toggleRadio("area");',staticTemplates.areaTip);

addAccordianContainer('pixel-tools-collapse-div','pixel-tools-accordian');
addAccordianCard('pixel-tools-accordian','query-label','query-div','Query Visible Map Layers',staticTemplates.queryDiv,false,`toggleRadio("none");toggleRadio("query");`,staticTemplates.queryTip);
addAccordianCard('pixel-tools-accordian','pixel-chart-label','pixel-chart-div','Query LCMS Time Series',staticTemplates.pixelChartDiv,false,'toggleRadio("none");toggleRadio("charting")',staticTemplates.pixelChartTip);

addAccordianContainer('area-tools-collapse-div','area-tools-accordian');
addAccordianCard('area-tools-accordian','user-defined-area-chart-label','user-defined-area-chart-div','User Defined Area Tool',staticTemplates.userDefinedAreaChartDiv,false,`toggleRadio("none");startAreaCharting();areaChartingOn = true;areaChartingTabSelect("#user-defined")`,staticTemplates.userDefinedAreaChartTip);
addAccordianCard('area-tools-accordian','upload-area-chart-label','upload-area-chart-div','Upload an Area',staticTemplates.uploadAreaChartDiv,false,'toggleRadio("none");startAreaCharting();areaChartingOn = true;areaChartingTabSelect("#shp-defined")',staticTemplates.uploadAreaChartTip);
addAccordianCard('area-tools-accordian','select-area-chart-label','select-area-chart-div','Select an Area',staticTemplates.selectAreaChartDiv,false,'toggleRadio("none");startAreaCharting();areaChartingOn = true;areaChartingTabSelect("#pre-defined")',staticTemplates.selectAreaChartTip);



