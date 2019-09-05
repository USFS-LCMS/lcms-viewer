
$('#sidebar-left-header').append(`<h1 id = 'title-banner' data-toggle="tooltip" title="Hooray!" class = 'gray pl-4 pb-0 m-0 text-center' style="font-weight:100;font-family: 'Roboto';">LCMS<span class = 'gray' style="font-weight:1000;font-family: 'Roboto Black', sans-serif;"> DATA </span>EXPLORER </h1>
        <ul class = 'navbar-nav  px-5  m-0 text-center'   >
            <li   class="nav-item dropdown navbar-dark navbar-nav nav-link "  data-toggle="dropdown">
                <h5 href = '#' onclick = "$('#sidebar-left').show('fade')" class = 'teal p-0 caret nav-link dropdown-toggle ' id='study-area-label'  >Bridger-Teton National Forest</h5> 
                <div class="dropdown-menu col-12 p-0 " >
                    <study-area-list  class = 'px-4' id="study-area-list"></study-area-list>
                </div>
            </li>
        </ul>`)

$('#title-banner').fitText(1.2);
$('#studyAreaDropdownLabel').fitText(1.9);
// $('#study-area-label').fitText(1.3);


  // function 
 
$('#main-container').append(
			`<div class="modal fade "  id="introModal" tabindex="-1" role="dialog" >
                <div class="modal-dialog modal-md " role="document">
                    <div class="modal-content text-dark" style = 'background-color:rgba(230,230,230,0.95);'>
                        <button type="button" class="close p-2 ml-auto" data-dismiss="modal">&times;</button>
                        <div class = 'modal-header'>
                            <h3 class="mb-0 ">Welcome to the Landscape Change Monitoring System (LCMS) Data Explorer!</h3>
                        </div>

                        <div class="modal-body">
                            <p class="pb-3 ">LCMS is a landscape change detection program developed by the USDA Forest Service. This application is designed to provide a visualization of the Landscape Change products, related geospatial data, and provide a portal to download the data.</p>
                        </div>
                        <div class = 'modal-footer'>
                            <div class="form-check  mr-0">
                                <input type="checkbox" class="form-check-input" id="dontShowAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
                                <label class=" text-uppercase form-check-label " for="dontShowAgainCheckbox" >Don't show again</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`)
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

addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'toggleRadio("none")');

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
 var distanceDiv = `Click on map to measure distance<br><button class = ' bg-black' onclick=toggleDistanceAreaUnits()>Click to toggle metric or imperial units</button>`;
 var distanceTip = "Click to toggle metric or imperial.  Drag if needed.  Click on map to start measuring.  Press 'Delete' or 'd' button to clear for area measuring and double click for distance measuring.  Press 'u' to undo last vertex placement for area measuring.  Press 'None' radio button to stop measuring";

 var areaDiv = `Click on map to measure area<br><button class = ' bg-black' onclick=toggleDistanceAreaUnits()>Click to toggle metric or imperial units</button>`;
 var areaTip = "Click to toggle metric or imperial.  Drag if needed.  Click on map to start measuring.  Press 'Delete' or 'd' button to clear for area measuring and double click for distance measuring.  Press 'u' to undo last vertex placement for area measuring.  Press 'None' radio button to stop measuring";
 
 var queryDiv = "<div>Double click on map to query values of displayed layers at a location</div>";
 var queryTip = 'Double click on map to query values of displayed layers at a location';

 var pixelChartDiv = `<div>Double click on map to query LCMS data time series<br></div>`;
 var pixelChartTip = 'click here';

 var userDefinedAreaChartDiv = `<div  id="user-defined" >
                                    <br>
                                    <label>Provide name for area selected for charting:</label>
                                    <input type="user-defined-area-name" class="form-control" id="user-defined-area-name" placeholder="Give me a name!" style='width:80%;'>
                                    <br>
                                    <button  onclick='areaChartingTabSelect(whichAreaDrawingMethod);startUserDefinedAreaCharting()'  href="#" rel="txtTooltip" data-toggle="tooltip" data-placement="top" title="Click to clear chart and currently defined charting area, or if you messed up while defining your area to chart"><i class="fa fa-trash fa-2x" aria-hidden="true"></i>
                                    </button>
                        		</div>`

var userDefinedAreaChartTip = 'test';

var uploadAreaChartDiv = `<h8>Choose zipped shapefile<br>or geoJSON file to summarize across</h8>
                            <br>
                            <input class = 'file-input' type="file" id="areaUpload" name="upload" accept=".zip,.geojson,.json" style="display: inline-block;">
                            `;
var uploadAreaChartTip = 'test';

var selectAreaChartDiv = `<i rel="txtTooltip" data-toggle="tooltip"  title="Selecting pre-defined summary areas for chosen LCMS study area" id = "select-area-spinner" class="text-dark px-2"></i>
                        <select style = 'width:100%;'  id='forestBoundaries' onchange='chartChosenArea()'></select>`;
var selectAreaChartTip = 'test';




addAccordianContainer('tools-collapse-div','tools-accordian')

addAccordianCard('tools-accordian','measuring-tools-collapse-label','measuring-tools-collapse-div','Measuring Tools',``,false,'toggleRadio("none")');
addAccordianCard('tools-accordian','pixel-tools-collapse-label','pixel-tools-collapse-div','Pixel Tools',``,false,'toggleRadio("none")');
addAccordianCard('tools-accordian','area-tools-collapse-label','area-tools-collapse-div','Area Tools',``,false,'toggleRadio("none")');

addAccordianContainer('measuring-tools-collapse-div','measuring-tools-accordian');
addAccordianCard('measuring-tools-accordian','measure-distance-label','measure-distance-div','Distance Measuring',distanceDiv,false,`toggleRadio("none");toggleRadio("distance")`,distanceTip);
addAccordianCard('measuring-tools-accordian','measure-area-label','measure-area-div','Area Measuring',areaDiv,false,'toggleRadio("none");toggleRadio("area")',areaTip);

addAccordianContainer('pixel-tools-collapse-div','pixel-tools-accordian');
addAccordianCard('pixel-tools-accordian','query-label','query-div','Query Visible Map Layers',queryDiv,false,`toggleRadio("none");toggleRadio("query")`,queryTip);
addAccordianCard('pixel-tools-accordian','pixel-chart-label','pixel-chart-div','Query LCMS Time Series',pixelChartDiv,false,'toggleRadio("none");toggleRadio("charting")',pixelChartTip);

addAccordianContainer('area-tools-collapse-div','area-tools-accordian');
addAccordianCard('area-tools-accordian','user-defined-area-chart-label','user-defined-area-chart-div','User Defined Area Tool',userDefinedAreaChartDiv,false,`toggleRadio("none");startAreaCharting();areaChartingOn = true;areaChartingTabSelect("#user-defined")`,userDefinedAreaChartTip);
addAccordianCard('area-tools-accordian','upload-area-chart-label','upload-area-chart-div','Upload an Area',uploadAreaChartDiv,false,'toggleRadio("none");startAreaCharting();areaChartingOn = true;areaChartingTabSelect("#shp-defined")',uploadAreaChartTip);
addAccordianCard('area-tools-accordian','select-area-chart-label','select-area-chart-div','Select an Area',selectAreaChartDiv,false,'toggleRadio("none");startAreaCharting();areaChartingOn = true;areaChartingTabSelect("#pre-defined")',selectAreaChartTip);


