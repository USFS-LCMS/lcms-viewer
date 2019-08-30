

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
 var pixelChartTip = 'click here'

 addTab('Distance Measuring','toolTabs','toolDivs','distance-tab','distance-div',`toggleRadio("none");toggleRadio("distance")`,distanceDiv,distanceTip,false)
 addTab('Area Measuring','toolTabs','toolDivs','area-tab','area-div','toggleRadio("none");toggleRadio("area")',areaDiv,areaTip,false)
 
 addTab('Query Visible Map Layers','toolTabs','toolDivs','query-tab','query-div','toggleRadio("none");toggleRadio("query")',queryDiv,queryTip,false)
 
 addTab('Query LCMS Time Series','toolTabs','toolDivs','pixel-chart-tab','pixel-chart-div','toggleRadio("none");toggleRadio("charting")',pixelChartDiv,pixelChartTip,false)
 


addStudyAreaToDropdown('Bridger-Teton National Forest',"Bridger-Teton National Forest boundary buffered by 5km plus Star Valley");
addStudyAreaToDropdown('Flathead National Forest',"Flathead National Forest buffered along with Glacier National Park buffered by 1km");
addStudyAreaToDropdown('Manti-La Sal National Forest',"Manti-La Sal National Forest");
addStudyAreaToDropdown('Chugach National Forest - Kenai Peninsula',"Chugach National Forest - Kenai Peninsula");
addStudyAreaToDropdown('Science Team CONUS NAFD',"2018 LCMS Science Team CONUS-wide loss");
