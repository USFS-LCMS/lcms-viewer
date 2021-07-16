

var walkThroughKeysOrder = {'MTBS':["intro", "data-layers","legend","parameters-mtbs", "reference-layers-mtbs", "tools-overview", "measuring-tools-distance-measuring", "measuring-tools-area-measuring", "pixel-tools-query-visible-map-layers", "pixel-tools-query-time-series-mtbs", "area-tools-overview","area-tools-user-defined-area", "area-tools-user-uploaded-area", "area-tools-user-selected-area",'finished'],
                      'LCMS':["intro", "data-layers","legend","parameters-lcms", "reference-layers-lcms", "tools-overview", "measuring-tools-distance-measuring", "measuring-tools-area-measuring", "pixel-tools-query-visible-map-layers", "pixel-tools-query-time-series", "area-tools-user-defined-area", "area-tools-user-uploaded-area", "area-tools-user-selected-area",'downloads','finished']}


walkThroughDict = {     'intro':{message:`<h5 class = 'list-group-title'>${mode} DATA Explorer Walk-Through</h5>
                                            <ul class="list-group list-group-flush">
                                                <li class="list-group-item">Welcome to the ${mode} Data Explorer walk-through. The walk-through will explain what features are available and how to use them. Click on the <i class="fa fa-chevron-right text-black"></i> button in the lower left corner to start.</li>
                                            </ul>`

                        },
                        'finished':{message:`<h5 class = 'list-group-title'>${mode} DATA Explorer Walk-Through Complete!</h5>
                                            <ul class="list-group list-group-flush">
                                                <li class="list-group-item">You have now ${mode} Data Explorer walk-through. Click on the <i class="fa fa-stop text-black"></i> button in the lower right corner to close.</li>
                                            </ul>`

                        },
                        'data-layers':{
                            divID: 'layer-list-collapse-div',
                            message:`<h5 class = 'list-group-title'>${mode} DATA</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">The layers in the ${mode} DATA menu in the left sidebar are the core ${mode} products.</li>
                                      <li class="list-group-item">All map layers can be turned on or off with the radio button on the left or with a single click on the name.</li>
                                      <li class="list-group-item">The slider on the right controls the opacity of the layer. This is useful for overlaying different layers to see how they relate.</li>
                                      <li class="list-group-item">If you do not see the layer when you turn it on, you can  double-click on the layer name to zoom to the extent of the layer.</li>
                                      <li class="list-group-item">All map layers are created on-the-fly within <span><a href="https://earthengine.google.com/" target="_blank">Google Earth Engine (GEE) </a></span>, which can cause a delay in the loading of the layers. The number of layers still being created within GEE can be viewed on the bottom bar under "Queue length for maps from GEE:". The number of layers that are currently being displayed can be seen under "Number of map layers loading tiles."</li>
                                      <li class="list-group-item">When a layer is turned on, if appropriate, an entry in the LEGEND on the bottom-right side (above this tutorial window) will appear.</li>  
                                    </ul>`
                        },
                        'legend':{
                            divID: 'legend-collapse-div',
                            message:`<h5 class = 'list-group-title'>LEGEND</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">The LEGEND menu in the right sidebar (above this tutorial window) shows a key for enabled and visible layers in the ${mode} DATA layers and REFERENCE DATA submenus in the left sidebar.</li>
                                      <li class="list-group-item">LEGEND items are only displayed if the layer is enabled and has an appropriate legend entry.</li>
                                      <li class="list-group-item">Thematic data layers will have individual colors and names listed, while continuous data layers will have a color ramp with numeric values. Vector data layers will display the color of the outline.</li>
                                    </ul>`
                        },
                        'reference-layers-lcms':{
                            divID: 'reference-layer-list-collapse-div',
                            message:`<h5 class = 'list-group-title'>REFERENCE DATA</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">The REFERENCE DATA layers are related geospatial data that can help provide context for the ${mode} data products</li>
                                      <li class="list-group-item">They include the <a href = "https://earthenginepartners.appspot.com/science-2013-global-forest" target = '_blank'>Hansen Global Forest Change data</a>, 
                                                                <a href = "https://www.fs.fed.us/foresthealth/applied-sciences/mapping-reporting/detection-surveys.shtml" target = "_blank">US Forest Service Insect and Disease Survey (IDS) data</a>,
                                                                 <a href = "https://mtbs.gov/" target = '_blank'>Monitoring Trends in Burn Severity (MTBS)</a> data, along with related boundary data</li>
                                      <li class="list-group-item">Some study areas include additional data such as mid-level vegetation maps.</li>
                                      <li class="list-group-item">Turning these layers on/off and adjusting the opacity is the same as the ${mode} DATA.</li>
                                    </ul>`
                        },
                        'reference-layers-mtbs':{
                            divID: 'reference-layer-list-collapse-div',
                            message:`<h5 class = 'list-group-title'>REFERENCE DATA</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">The REFERENCE DATA layers are related geospatial data that can help provide context for the ${mode} data products.</li>
                                      <li class="list-group-item">They include <a href = "https://www.mrlc.gov/data" target = '_blank'>NLCD land cover data</a> and 
                                                                <a href = "https://www.fsa.usda.gov/programs-and-services/aerial-photography/imagery-programs/naip-imagery/" target = '_blank'>NAIP data</a>.</li>
                                      <li class="list-group-item">Turning these layers on/off and adjusting the opacity is the same as for the ${mode} DATA layers.</li>
                                    </ul>`
                        },
                        'tools-overview':{
                            divID: 'tools-collapse-div',
                            message:`<h5 class = 'list-group-title'>TOOLS-Overview</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">A number of tools are provided in the left sidebar to explore both the ${mode} DATA as well as the REFERENCE DATA.</li>
                                      <li class="list-group-item">These include measuring tools for relating how small or large something you see on the map really is, single pixel query tools to explore a specific location, and area query tools to summarize data across an area.</li>
                                      <li class="list-group-item">Each tool can be turned on by clicking on the toggle slider to the left of the tool's title. Tools can be turned off either by clicking on the toggle slider again or clicking on another tool's toggle slider.</li>
                                      <li class="list-group-item">Any active tool will be listed on the bottom bar under the "Currently active tools."</li>
                                    </ul>`
                        },
                        'measuring-tools-distance-measuring':{
                            divID: 'tools-collapse-div',
                            message:`<h5 class = 'list-group-title'>TOOLS-Measuring Tools-Distance Measuring</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "Distance Measuring" tool.</li>
                                      <li class="list-group-item">Once activated, click on the map to draw a line to measure distance.</li>
                                      <li class="list-group-item">The drawn vertices can be moved by clicking and dragging. You can also adjust the midpoint of a drawn line by moving the faint grey point in the middle of a line.</li>
                                      <li class="list-group-item">Press <kbd>ctrl+z</kbd> to undo the most recent point. Double-click, press <kbd>Delete</kbd>, or press <kbd>Backspace</kbd> to clear the line and start over.</li>
                                      <li class="list-group-item">There are also buttons available under the tool in the left sidebar to undo and restart drawing.</li>
                                      <li class="list-group-item">Units can be toggled between imperial and metric using the toggle switch.</li>
                                      <li class="list-group-item">If the color of the line is hard to see, it can be changed with the color picker paintbrush under the tool in the left sidebar.</li>
                                    </ul>`
                        },
                        'measuring-tools-area-measuring':{
                            divID: 'tools-collapse-div',
                            message:`<h5 class = 'list-group-title'>TOOLS-Measuring Tools-Area Measuring</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "Area Measuring" tool</li>
                                      <li class="list-group-item">Once activated, click on the map to draw polygons to measure area.</li>
                                      <li class="list-group-item">Click on the map to measure an area, double-click to complete the polygon. <kbd>ctrl+z</kbd> will undo the most recently placed point, pressing <kbd>Delete</kbd> or <kbd>Backspace</kbd> will delete the entire polygon. The polygon can be adjusted by clicking and dragging mid-points and vertices.</li>
                                      <li class="list-group-item">Buttons are available under the tool in the left sidebar to undo and restart drawing as well.</li>
                                      <li class="list-group-item">Units can be toggled between imperial and metric using the toggle switch.</li>
                                      <li class="list-group-item">If the color of the line is hard to see, it can be changed with the color picker paintbrush under the tool in the left sidebar.</li>
                                      <li class="list-group-item">Multiple areas can be measured simultaneously by continuing to click after a polygon has been completed.</li>
                                    </ul>`
                        },
                        'pixel-tools-query-visible-map-layers':{
                            divID: 'tools-collapse-div',
                            message:`<h5 class = 'list-group-title'>TOOLS-Pixel Tools-Query Visible Map Layers</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "Query Visible Map Layers" tool.</li>
                                      <li class="list-group-item">Once activated, anywhere you double-click will query the value of any visible layer.</li>
                                      <li class="list-group-item">The values will appear in a popup on the map.</li>
                                      <li class="list-group-item">It can take some time to query all visible layers as the query is done on-the-fly within Google Earth Engine.</li>
                                      <li class="list-group-item">The popup window can be closed by clicking the <kbd>&times</kbd> in the upper right.</li>
                                      <li class="list-group-item">To query the map again, double-click once more.</li>
                                    </ul>`
                        },
                        'pixel-tools-query-time-series':{
                            divID: 'tools-collapse-div',
                            message:`<h5 class = 'list-group-title'>TOOLS-Pixel Tools-Query ${mode} Time Series</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "Query ${mode} Time Series" tool.</li>
                                      <li class="list-group-item">This tool allows you to query a single pixel from the ${mode} time series in conjunction with NLCD land cover data.</li>
                                      <li class="list-group-item">This is helpful to understand what happened in a smaller area and to understand the suite of products available from ${mode}.</li>
                                      <li class="list-group-item">Once activated, anywhere you double-click will query the ${mode} time series.</li>
                                      <li class="list-group-item">It can take some time to query the ${mode} time series as the query is done on-the-fly within Google Earth Engine.</li>
                                      <li class="list-group-item">Once this is complete, a chart will appear.</li>
                                      <li class="list-group-item">You can display the tabular data in various graphical configurations by changing the "Chart Type" from the dropdown menu in the bottom right of the pop-up chart.</li>
                                      <li class="list-group-item">Within the graph, each category/line in the graph can be turned off by clicking on it in the graph legend.</li>
                                      <li class="list-group-item">You can download a CSV or PNG of the extracted data from the "Download" dropdown menu in the bottom of the chart window.</li>
                                      <li class="list-group-item">To query another area, close the chart using the <kbd>&times</kbd> button in the upper right or by clicking off the chart window. Then repeat the process by double-clicking anywhere on the map.</li>
                                    </ul>`
                        },'pixel-tools-query-time-series-mtbs':{
                            divID: 'tools-collapse-div',
                            message:`<h5 class = 'list-group-title'>TOOLS-Pixel Tools-Query ${mode} Time Series</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "Query ${mode} Time Series" tool</li>
                                      <li class="list-group-item">This tool allows you to query a single pixel from the ${mode} time series as well as NLCD land cover.</li>
                                      <li class="list-group-item">This is helpful to understand what happened in a smaller area and to understand the suite of products available from ${mode} in the context of NLCD land cover.</li>
                                      <li class="list-group-item">Once activated, anywhere you double-click will query the ${mode} and NLCD time series.</li>
                                      <li class="list-group-item">It can take some time to query the ${mode} and NLCD time series as the query is done on-the-fly within Google Earth Engine.</li>
                                      <li class="list-group-item">Once this is complete, a chart will appear.</li>
                                      <li class="list-group-item">You can display the data on various types of graphs or a table using the "Chart Type" dropdown menu.</li>
                                      <li class="list-group-item">Within the graph, each category/line in the graph can be turned off by clicking on it in the graph legend.</li>
                                      <li class="list-group-item">You can download a CSV or PNG of the extracted data with the "Download" dropdown menu in the bottom of the chart window.</li>
                                      <li class="list-group-item">To query another area, close the chart using the <kbd>&times</kbd> button in the upper right or by clicking off the chart window. Then repeat the process by double-clicking anywhere on the map.</li>
                                    </ul>`
                        },'area-tools-overview':{
                            divID: 'tools-collapse-div',
                            message:`<h5 class = 'list-group-title'>TOOLS-Area Tools-Overview</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Area tools allow ${mode} products to be summarized across areas.</li>
                                      <li class="list-group-item">Areas can be drawn on the map, provided as a zipped shapefile or .geojson, or selected from pre-defined sets of areas.</li>
                                      <li class="list-group-item">There are two parameters that can be changed using the Area Tools Parameters sub-menu.</li>
                                      <li class="list-group-item">The first is which ${mode} product will be summarized. The dropdown menu under "Choose which ${mode} product to summarize" can be changed to chart different ${mode} products.</li>
                                      <li class="list-group-item">The second parameter is a set of radio buttons under "Area Units." Areas can be summarized as a percentage of the area, acres, or hectares depending on your needs.</li>
                                      <li class="list-group-item">If any of these parameters are changed, the chart will need to be re-drawn to take effect.</li>
                                    </ul>`
                        },
                        'area-tools-user-defined-area':{
                            divID: 'tools-collapse-div',
                            message:`<h5 class = 'list-group-title'>TOOLS-Area Tools-User-Defined Area</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "User-Defined Area" tool.</li>
                                      <li class="list-group-item">This tool allows you to draw a polygon on the map and summarize ${mode} products across that area.</li>
                                      <li class="list-group-item">Once activated, click on map to draw a polygon. Double-click to complete polygon, press <kbd>ctrl+z</kbd> to undo most recent point, press <kbd>Delete</kbd> or <kbd>Backspace</kbd> to start over.</li>
                                      <li class="list-group-item">Buttons are available under the tool in the left sidebar to undo and restart drawing.</li>
                                      <li class="list-group-item">If the color of the line is hard to see, it can be changed with the color picker paintbrush under the tool in the left sidebar.</li>
                                      <li class="list-group-item">Once a polygon is completed, another can be drawn by clicking on the map.</li>
                                      <li class="list-group-item">You can provide a name if you would like.  Otherwise one will be automatically generated.</li>
                                      <li class="list-group-item">Once drawing is finished, click on the <kbd>Chart Selected Areas</kbd> button to create the chart.</li>
                                      <li class="list-group-item">It can take some time to summarize the area as it is done on-the-fly within Google Earth Engine.</li>
                                      <li class="list-group-item">The selected area is tabulated and provided under the “Total area selected” header. The charting of very large drawn areas (>10,000,000 Acres) or extremely large file/area uploads may not succesfully run or produce a chart.</li>
                                      <li class="list-group-item">You can display the data on various types of graphs or a table using the "Chart Type" dropdown menu.</li>
                                      <li class="list-group-item">Within the graph, each category/line in the graph can be turned off by clicking on it in the graph legend.</li>
                                      <li class="list-group-item">You can download a CSV or PNG of the extracted data with the "Download" dropdown menu in the bottom of the chart window.</li>
                                      <li class="list-group-item">To summarize another area, close the chart and draw another polygon.</li>
                                    </ul>`
                        },
                        "area-tools-user-uploaded-area":{
                            divID: 'tools-collapse-div',
                            message:`<h5 class = 'list-group-title'>TOOLS-Area Tools-Upload an Area</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "Upload an Area" tool.</li>
                                      <li class="list-group-item">This tool allows you to upload a shapefile or geoJSON file and summarize ${mode} products across that area.</li>
                                      <li class="list-group-item">Once activated, click on the <kbd>Choose File</kbd> button to choose a file to upload.</li>
                                      <li class="list-group-item">A shapefile must have all of its associated files zipped into a .zip file.  Any file with a .geojson extension is also accepted.</li>
                                      <li class="list-group-item">Extremely large files will fail to upload and/or chart.</li>
                                      <li class="list-group-item">Once the file is selected, click on the <kbd>Chart across chosen file</kbd> button to ingest chosen file and create chart.</li>
                                      <li class="list-group-item">Sometimes it can take some time upload the chosen file and summarize the area as it is done on-demand within Google Earth Engine.</li>
                                      <li class="list-group-item">Selecting a very large area may not successfully run.</li>
                                      <li class="list-group-item">You can display the data on various types of graphs or a table using the "Chart Type" dropdown menu.</li>
                                      <li class="list-group-item">Within the graph, each category/line in the graph can be turned off by clicking on it in the graph legend.</li>
                                      <li class="list-group-item">You can download a CSV or PNG of the extracted data in the "Download" dropdown menu in the bottom of the chart window.</li>
                                      <li class="list-group-item">To summarize another area, close the chart and repeat this process.</li>
                                    </ul>`
                        }, 
                        "area-tools-user-selected-area":{
                            divID: 'tools-collapse-div',
                            message:`<h5 class = 'list-group-title'>TOOLS-Area Tools-Select an Area on Map</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "Select an Area on Map" tool.</li>
                                      <li class="list-group-item">This tool allows the summarizaton of ${mode} products across a selection of pre-defined areas.</li>
                                      <li class="list-group-item">After activating the tool, select a layer and it will be displayed on the map interface.</li>
                                      <li class="list-group-item">After the layer is loaded and displayed, it can be selected by clicking on it on the map.</li>
                                      <li class="list-group-item">If the selected location intersects multiple polygons, multiple areas will be selected.</li>
                                      <li class="list-group-item">The name of selected areas will appear in a list below the layers under "Selected area names:".</li>
                                      <li class="list-group-item">Clicking on an area again or pressing the undo or trash button will deselect any selected areas.</li>
                                      <li class="list-group-item">Every time an area is selected, background processing is being performed. Clicking on many areas at once may slow down the tool.</li>
                                      <li class="list-group-item">A name for the selected area can be provided in the "Name your charting area!" input box. If no name is provided, the tool will automatically generate one.</li>
                                      <li class="list-group-item">Once all areas you would like to include are selected, press the <kbd>Chart Selected Areas</kbd> button at the bottom of the tool to summarize those areas and create a chart.</li>
                                      <li class="list-group-item">Selecting a very large area may not successfully run.</li>
                                      <li class="list-group-item">You can display the data on various types of graphs or a table using the "Chart Type" dropdown menu.</li>
                                      <li class="list-group-item">Within the graph, each category/line in the graph can be turned off by clicking on it in the graph legend.</li>
                                      <li class="list-group-item">You can download a CSV or PNG of the extracted data with the "Download" dropdown menu at the bottom of the chart window.</li>
                                      <li class="list-group-item">To summarize another area, close the chart and repeat this process. You can continue selecting more areas, or clear your selected areas using the trash can button and start over.</li>
                                    </ul>`
                        }, 
                        'downloads':{
                            divID : 'download-collapse-div',
                            message:`<h5 class = 'list-group-title'>DOWNLOADS</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">To download layers, click on dropdown and then click on the data package you would like to download.</li>
                                      <li class="list-group-item">The download should start shortly after.</li>
                                      <li class="list-group-item">Your browser may prompt you with where you would like to save the data.</li>
                                    </ul>`
                        },
                        'parameters-lcms':{
                            divID:'parameters-collapse-div',
                            message:`<h5 class = 'list-group-title'>PARAMETERS</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">There are a number of parameters that can be changed</li>
                                      <li class="list-group-item">There are two modes to explore the data with. The standard mode provides the core ${mode} products, related data, and tools to explore ${mode} data.</li>
                                      <li class="list-group-item">The only parameter to change in standard mode is the range of years included in the analysis. Try selecting a different range of years and then hit submit. This will filter all products to only include those years.</li>
                                      <li class="list-group-item">When the analysis mode is changed to "Advanced" a number of additional parameters will appear.</li>
                                      <li class="list-group-item">The first parameters are the thresholds used to determine where loss and gain are. The default thresholds optimize the balanced-accuracy. Sometimes a more inclusive or exclusive depiction of loss or gain may be needed. Try changing these thresholds and then looking at the map.</li>
                                    </ul>`
                        },
                        'parameters-mtbs':{
                            divID:'parameters-collapse-div',
                            message:`<h5 class = 'list-group-title'>PARAMETERS</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">There are a number of parameters that can be modified to enhance the utility of data in the MTBS Data Explorer.</li>
                                      <li class="list-group-item">The first is a set of radio buttons that enable zooming to different areas where ${mode} products are available. Click on any area radio button to zoom to it's extent.</li>
                                      <li class="list-group-item">The second parameter is the analysis year range. ${mode} data can be filtered by adjusting the dual slider to the desired date range.</li>
                                      <li class="list-group-item">The third parameter is how the MTBS raster data are summarized.</li>
                                      <li class="list-group-item">The "MTBS Burn Severity" and "MTBS Burn Year" layers can only display a single severity value and year respectively. This parameter provides a method for choosing which value to show when multiple fires overlap.</li>
                                      <li class="list-group-item">The "Highest-Severity" method will display the severity and year corresponding to the area with the highest severity.</li>
                                      <li class="list-group-item">The "Most-Recent" method will choose the severity and year corresponding to the most recently mapped fire.</li>
                                      <li class="list-group-item">The "Oldest" method will choose the severity and year corresponding to the oldest mapped fire.</li>
                                      <li class="list-group-item">Once the parameters are adjusted, press the <kbd>Submit</kbd> button to update the map layers.</li>
                                    </ul>`
                        }

                        
                        

                    
                    }

var walkThroughAdded = false;

$(window).resize(function(){
    
    moveCollapse('legend-collapse');
    $('.legendDiv').css('bottom',$('.bottombar').height());
    $('.sidebar').css('max-height',$('body').height()-$('.bottombar').height());
    // moveCollapse('plot-collapse');
    if(walkThroughAdded){
        moveCollapse('walk-through-collapse');
    }
    // addLegendCollapse();


})
function toggleWalkThroughCollapse(){
    if(walkThroughAdded){
        removeWalkThroughCollapse();
    }else(addWalkThroughCollapse());
}
function addWalkThroughCollapse(){
    $('#introModal').hide();
    $('.modal-backdrop').remove();
    $('#legendDiv').removeClass('col-xl-2');
    $('#legendDiv').removeClass('col-lg-3');
    ga('send', 'event', mode , 'walk-through-run', 'walk-through-run');
    var collapseContainer =getWalkThroughCollapseContainerID(); 
    addCollapse(collapseContainer,'walk-through-collapse-label','walk-through-collapse-div','TUTORIAL','<i class="fa fa-book  mx-1" aria-hidden="true"></i>',true,``,'Walk through the features of the '+mode+' Data Explorer')
    $('#walk-through-collapse-div').append(staticTemplates.walkThroughPopup);
    showWalkThroughI();
    walkThroughAdded = true;
}
function removeWalkThroughCollapse(){
    $('#legendDiv').addClass('col-xl-2');
    $('#legendDiv').addClass('col-lg-3');
    $('#walk-through-collapse-label').remove();
    $('#walk-through-collapse-div').remove();
    walkThroughAdded = false;
}


function closeWalkThroughPopup(){
    $("#walk-through-popup").hide('fade');
}

function showWalkThroughPopupMessage(message){
    $('#walk-through-popup-content').empty();
    $('#walk-through-popup-content').append(message);
    $('#walk-through-popup').show('fade');
}

var walkThroughKeyI;
if(walkThroughKeysOrder[mode] === undefined){
  walkThroughKeyI= 100
}else{walkThroughKeyI= walkThroughKeysOrder[mode].length*10};
function nextWalkThrough(){
    walkThroughKeyI++;
    showWalkThroughI();
}
function previousWalkThrough(){
    walkThroughKeyI--;
    if(walkThroughKeyI ===-1){walkThroughKeyI = walkThroughKeysOrder[mode].length*10};
    showWalkThroughI();
}
function showWalkThroughI(){
    ga('send', 'event', mode , 'walk-through-slide-show', walkThroughKeyI);
    $('#legendDiv').scrollTop(0);
    
    $('.sub-sub-panel-title').addClass('collapsed');
    stopAllTools();
    var tI = walkThroughKeyI%walkThroughKeysOrder[mode].length;
    var dict = walkThroughDict[walkThroughKeysOrder[mode][tI]];
  
    if(dict === undefined){
        showWalkThroughPopupMessage(`All features have been shown`);
    }else{
        $('.panel-collapse').removeClass('show')
        $('#'+dict.divID).addClass('show');
         $('#walk-through-collapse-div').addClass('show');
        showWalkThroughPopupMessage(dict.message);
        $('#walk-through-popup-progress').empty();
        $('#walk-through-popup-progress').append((tI+1).toString() + '/'+walkThroughKeysOrder[mode].length.toString());
    };
    
    
}