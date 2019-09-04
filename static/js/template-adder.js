

// const studyAreaDropdownMenu = getDropdown('study-area-dropdown','test dropdown')
// $('#left-div').append(staticTemplates.topBanner);
// $('#left-div').append(studyAreaDropdownLabel);
// $('#left-div').append(studyAreaDropdownMenu);
// addDropdownItem('study-area-dropdown','a test','console.log("hello")')
// $('#left-div').append(`<div id = 'sidebar-left'></div>`);
// $('#sidebar-left').append(collapseTitleDiv);
// addCollapse('sidebar-left','parametersCollapseLabelDiv','parametersCollapseDiv2','Parameters','fa-sliders')
// addCollapse('sidebar-left','layersCollapseLabelDiv2','layersCollapseDiv2','LCMS Layers','fa-layer-group',true)
// addCollapse('sidebar-left','refLayersCollapseLabelDiv','refLayersCollapseDiv','Reference Layers','fa-bars')
// getDiv('layersCollapseDiv2','testDiv1','test1','testVar1',1);
// getDiv('layersCollapseDiv2','testDiv2','test2','testVar2',1)

// getToggle('layersCollapseDiv2','testToggle1','hello','world',1,2,'testVar1',true)
// getToggle('layersCollapseDiv2','testToggle2','hello','world',1,2,'testVar2',false)
// getToggle('layersCollapseDiv2','testToggle2','hello','world',1,2,'testVar3',true)
// var testVar;
// $('#layersCollapseDiv2').append(getRadio('test1','test','first','second','testVar','hello1','there1'));
// $('#layersCollapseDiv2').append(getRadio('test2','test2','first','second','testVar2','hello2','there2'));
// $('#layersCollapseDiv2').append(getRadio('test3','test3','first','second','testVar3','hello3','there3'));
// $('#layersCollapseDiv2').append(getRadio('test4','test4','first','second','testVar4','hello4','there4'));
// $('#layersCollapseDiv2').append(getRadio('test5','test5','first','second','testVar5','hello5','there5'));
$('#title-banner').fitText(1.2);
$('#studyAreaDropdownLabel').fitText(1.9);
// $('#study-area-label').fitText(1.3);


  // function 
 

addStudyAreaToDropdown('Bridger-Teton National Forest',"Bridger-Teton National Forest boundary buffered by 5km plus Star Valley");
addStudyAreaToDropdown('Flathead National Forest',"Flathead National Forest buffered along with Glacier National Park buffered by 1km");
addStudyAreaToDropdown('Manti-La Sal National Forest',"Manti-La Sal National Forest");
addStudyAreaToDropdown('Chugach National Forest - Kenai Peninsula',"Chugach National Forest - Kenai Peninsula");
addStudyAreaToDropdown('Science Team CONUS NAFD',"2018 LCMS Science Team CONUS-wide loss");


var paramsDiv =`<a >

    <variable-radio var='analysisMode' title2='Choose which mode' name2='Advanced' name1='Standard' value2='advanced' value1='easy' type='string' href="#" rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Advanced mode provides additional layers and functionality"></variable-radio>
  </a>
  
 
  <div class="dropdown-divider"></div>
  <div >Choose Year Range</div>
  <a  >
      <div  class='dual-range-slider-container' rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Years of LCMS data to include for land cover, land use,loss, and gain">
        <div class='dual-range-slider-name m-2'>Analysis Years:</div>
        <div id="slider1" class='dual-range-slider-slider' href = '#'></div>
        <div id='date-range-value1' class='dual-range-slider-value m-2'></div>
    </div>
    
  </a>

  <div class="dropdown-divider"></div>
  <div id='threshold-container' style="display: none;">
  <div  >Choose Thresholds</div>
    <a >
        <div  class='dual-range-slider-container' rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Threshold window for detecting loss.  Any loss probability within the specified window will be flagged as loss ">
            <div class='dual-range-slider-name m-2'>Loss Threshold:</div>
            <div id="slider2" class='dual-range-slider-slider'></div>
            <div id='declineThreshold' class='dual-range-slider-value  m-2'></div>
        </div>
    </a>
    <a >
    <br>
    <div  class='dual-range-slider-container' rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Threshold window for detecting gain.  Any gain probability within the specified window will be flagged as gain ">
        <div class='dual-range-slider-name  m-2'>Gain Threshold:</div>
        <div id="slider3" class='dual-range-slider-slider'></div>
        <div id='recoveryThreshold' class='dual-range-slider-value  m-2'></div>
    </div>
  
    
    </a>
    </div>

    
  <div id='advanced-radio-container' style="display: none;">
    <div class="dropdown-divider"></div>
  <div  >Additional Features</div>
   
       <variable-radio var='viewBeta' title2='View Beta Outputs:' name2='Yes' name1='No' value2='yes' value1='no' type='string' href="#" rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Whether to view products that are currently in beta development"></variable-radio>

    <br>
    <variable-radio var='summaryMethod' title2='Summary method:' name2='Highest probability' name1='Most recent year' value2='prob' value1='year' type='string' href="#" rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="How to choose which value for loss and gain to display/export.  Choose the value with the highest probability or from the most recent year above the specified threshold"></variable-radio>
       <br>
       <variable-radio  id = 'whichIndexRadio' var='whichIndex' title2='Index for charting:' name2='NBR' name1='NDVI' value2='NBR' value1='NDVI' type='string' href='#' ></variable-radio>
        <div class="dropdown-divider"></div>
    </div>




<button onclick = 'reRun()' class = 'ml-1 submit-button hover-teal' href="#" rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Once finished changing parameters, press this button to refresh maps">Submit</button>`

        
        
addCollapse('sidebar-left','parameters-collapse-label','parameters-collapse-div','PARAMETERS','<i class="fa fa-sliders mr-1" aria-hidden="true"></i>')
addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div','LCMS DATA',`<img style = 'width:20px;' class='image-icon mr-1' src="images/layer_icon.png">`,true);
addCollapse('sidebar-left','reference-layer-list-collapse-label','reference-layer-list-collapse-div','REFERENCE DATA',`<img style = 'width:20px;' class='image-icon mr-1' src="images/layer_icon.png">`,false);

addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i class="fa fa-gear mr-1" aria-hidden="true"></i>`,true,'toggleRadio("none")');

$('#parameters-collapse-div').append(paramsDiv);
$('#layer-list-collapse-div').append(`<layer-list id="layers"></layer-list>`);
$('#reference-layer-list-collapse-div').append(`<reference-layer-list id="reference-layers"></reference-layer-list>`);




var startYear = 1985;
var endYear = 2017;
setUpRangeSlider('startYear', 'endYear', 1985, 2018, startYear, endYear, 1, 'slider1', 'date-range-value1', 'null');
setUpRangeSlider('lowerThresholdDecline', 'upperThresholdDecline', 0, 1, lowerThresholdDecline, upperThresholdDecline, 0.05, 'slider2', 'declineThreshold', 'null');

setUpRangeSlider('lowerThresholdRecovery', 'upperThresholdRecovery', 0, 1, lowerThresholdRecovery, upperThresholdRecovery, 0.05, 'slider3', 'recoveryThreshold', 'null');

$('body').append(`<div class = 'legendDiv flexcroll' id = 'legendDiv'></div>`);
addCollapse('legendDiv','legend-collapse-label','legend-collapse-div','Legend','<i class="fa fa-location-arrow fa-rotate-45 mx-1" aria-hidden="true"></i>',true)
$('#legend-collapse-div').append(`<legend-list   id="legend"></legend-list>`)

//Add tool tabs
 var distanceDiv = '<div  id="distance-measurement"  onclick=toggleDistanceAreaUnits(this.value)></div>';
 var distanceTip = "Click to toggle metric or imperial.  Drag if needed.  Click on map to start measuring.  Press 'Delete' or 'd' button to clear for area measuring and double click for distance measuring.  Press 'u' to undo last vertex placement for area measuring.  Press 'None' radio button to stop measuring";

 var areaDiv = '<div  id="area-measurement"  onclick=toggleDistanceAreaUnits(this.value)></div>'
 var areaTip = "Click to toggle metric or imperial.  Drag if needed.  Click on map to start measuring.  Press 'Delete' or 'd' button to clear for area measuring and double click for distance measuring.  Press 'u' to undo last vertex placement for area measuring.  Press 'None' radio button to stop measuring";
 
 var queryDiv = "<div  id='query-container' >Double click on map to query values of displayed layers at a location</div>";
 var queryTip = 'Double click on map to query values of displayed layers at a location';

 var pixelChartDiv = "<div  id='charting-container' >\
                    Double click on map to query LCMS data time series<br>\
                    \
                    </div>";
 var pixelChartTip = 'click here';

 var userDefinedAreaChartDiv = `<div  id="user-defined" >
                                    <br>
                                    <label>Provide name for area selected for charting:</label>
                                    <input type="user-defined-area-name" class="form-control" id="user-defined-area-name" placeholder="Give me a name!" style='width:80%;'>
                                    <br>
                                    <button  onclick='areaChartingTabSelect(whichAreaDrawingMethod);startUserDefinedAreaCharting()'  href="#" rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Click to clear chart and currently defined charting area, or if you messed up while defining your area to chart"><i class="fa fa-trash fa-2x" aria-hidden="true"></i>
                                    </button>
                        		</div>`
 var userDefinedAreaChartDiv = `<br>
                                    <label>Provide name for area selected for charting:</label>
                                    <input type="user-defined-area-name" class="form-control" id="user-defined-area-name" placeholder="Give me a name!" style='width:80%;'>
                                    <br>
                                    <button  class = 'bg-dark' onclick='startUserDefinedAreaCharting();'  href="#" rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Click to clear chart and currently defined charting area, or if you messed up while defining your area to chart"><i class="fa fa-trash fa-2x" aria-hidden="true"></i>
                                    </button>`
var userDefinedAreaChartTip = 'test';

var uploadAreaChartDiv = `test`
var uploadAreaChartTip = 'test';

addSubCollapse('tools-collapse-div','measuring-tools-collapse-label','measuring-tools-collapse-div','Measuring Tools',``,false,'toggleRadio("none")');
addSubCollapse('tools-collapse-div','pixel-tools-collapse-label','pixel-tools-collapse-div','Pixel Tools',``,false,'toggleRadio("none")');
addSubCollapse('tools-collapse-div','area-tools-collapse-label','area-tools-collapse-div','Area Tools',``,true,'toggleRadio("none")');

addTabContainer('measuring-tools-collapse-div','measuringToolTabs','measuringToolDivs')
addTabContainer('pixel-tools-collapse-div','pixelToolTabs','pixelToolDivs');
addTabContainer('area-tools-collapse-div','areaToolTabs','areaToolDivs');

addTab('Distance Measuring','measuringToolTabs','measuring-tools-collapse-div','distance-tab','distance-div',`toggleRadio("none");toggleRadio("distance")`,distanceDiv,distanceTip,false)
addTab('Area Measuring','measuringToolTabs','measuring-tools-collapse-div','area-tab','area-div','toggleRadio("none");toggleRadio("area")',areaDiv,areaTip,false)
 
addTab('Query Visible Map Layers','pixelToolTabs','pixel-tools-collapse-div','query-tab','query-div','toggleRadio("none");toggleRadio("query")',queryDiv,queryTip,false)
addTab('Query LCMS Time Series','pixelToolTabs','pixel-tools-collapse-div','pixel-chart-tab','pixel-chart-div','toggleRadio("none");toggleRadio("charting")',pixelChartDiv,pixelChartTip,false)
 

addTab('User Defined Area Tool','areaToolTabs','area-tools-collapse-div','user-defined-area-chart-tab','user-defined-area-chart-div','toggleRadio("none");startAreaCharting();areaChartingOn = true;areaChartingTabSelect("#user-defined")',userDefinedAreaChartDiv,userDefinedAreaChartTip,false)
addTab('Upload an Area','areaToolTabs','area-tools-collapse-div','upload-area-chart-tab','upload-area-chart-div','toggleRadio("none");startAreaCharting();areaChartingOn = true;areaChartingTabSelect("#shp-defined")',uploadAreaChartDiv,uploadAreaChartTip,false)
