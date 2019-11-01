var walkThroughKeyI = 0;
walkThroughDict = {     'intro':{message:`<h5 class = 'list-group-title'>LCMS DATA Explorer Walk-Through</h5>
                                            <ul class="list-group list-group-flush">
                                                <li class="list-group-item">Welcome to the LCMS Data Explorer walk-through. The walk-through will explain what features are available and how to use them. Click on the <i class="fa fa-chevron-right text-black"></i> button in the lower left corner to start</li>
                                            </ul>`

                        },
                        'lcms-layers':{
                            divID: 'layer-list-collapse-div',
                            message:`<h5 class = 'list-group-title'>LCMS DATA</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">The LCMS DATA layers are the core LCMS products</li>
                                      <li class="list-group-item">All map layers can be turned on or off with the circle checkbox on the left or with a single click on the name</li>
                                      <li class="list-group-item">The slider on the right controls the opacity of the layer. This is useful for overlaying different layers to see how they relate</li>
                                      <li class="list-group-item">If you do not see the layer when you turn it on, you can  double-click on the layer name to zoom to the extent of the layer</li>
                                      <li class="list-group-item">Since all of map layers are being created on-the-fly within <span><a href="https://earthengine.google.com/" target="_blank">Google Earth Engine (GEE) </a></span>, there can be a delay. The number of layers still being created within GEE can be viewed on the bottom bar under "Queue length for maps from GEE," while the number of layers tiles are still being downloaded for appears under "Number of map layers loading tiles."</li>
                                      <li class="list-group-item">When appropriate, when a layer is turned on, an entry in the LEGEND on the bottom-right side will appear.</li>  
                                    </ul>`
                        },
                        'reference-layers':{
                            divID: 'reference-layer-list-collapse-div',
                            message:`<h5 class = 'list-group-title'>REFERENCE DATA</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">The REFERENCE DATA layers are related geospatial data that can help provide context for the LCMS data products</li>
                                      <li class="list-group-item">They include the <a href = "https://earthenginepartners.appspot.com/science-2013-global-forest" target = '_blank'>Hansen Global Forest Change data</a>, 
                                                                <a href = "https://www.fs.fed.us/foresthealth/applied-sciences/mapping-reporting/detection-surveys.shtml" target = "_blank">US Forest Service Insect and Disease Survey (IDS) data</a>,
                                                                 <a href = "https://mtbs.gov/" target = '_blank'>Monitoring Trends in Burn Severity (MTBS)</a> data, along with related boundary data</li>
                                      <li class="list-group-item">Some study areas include additional data such as mid-level vegetation maps.</li>
                                      <li class="list-group-item">The functionality of these layers is the same as the LCMS DATA.</li>
                                    </ul>`
                        },
                        'TOOLS':{
                            divID: 'tools-collapse-div',
                            message:`<h5 class = 'list-group-title'>TOOLS-Overview</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">A number of tools are provided to explore both the LCMS DATA as well as the REFERENCE DATA</li>
                                      <li class="list-group-item">These include measuring tools for relating to how small or large something you see on the map really is, single pixel query tools to explore a single location, and area query tools to summarize across an area</li>
                                      <li class="list-group-item">Each tool can be turned on by clicking on the toggle slider to the left of the tool's title. They can be turned off either by clicking on the toggle slider again or clicking on another tool's toggle slider</li>
                                      <li class="list-group-item">Any active tool will be listed on the bottom bar under the "Currently active tools"</li>
                                    </ul>`
                        },
                        'measuring-tools-distance-measuring':{
                            divID: 'tools-collapse-div',
                            message:`<h5 class = 'list-group-title'>TOOLS-Measuring Tools-Distance Measuring</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "Distance Measuring" tool</li>
                                      <li class="list-group-item">Once activated, click on map to draw line to measure distance</li>
                                      <li class="list-group-item">Press <kbd>ctrl+z</kbd> to undo most recent point. Double-click, press <kbd>Delete</kbd>, or press <kbd>Backspace</kbd> to clear measurment and start over.</li>
                                      <li class="list-group-item">Buttons are available under the tool in the left sidebar to undo and restart drawing</li>
                                      <li class="list-group-item">If the color of the line is hard to see, it can be changed with the color picker under the tool in the left sidebar</li>
                                    </ul>`
                        },
                        'measuring-tools-area-measuring':{
                            divID: 'tools-collapse-div',
                            message:`<h5 class = 'list-group-title'>TOOLS-Measuring Tools-Area Measuring</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "Area Measuring" tool</li>
                                      <li class="list-group-item">Once activated, click on map to draw polygons to measure area</li>
                                      <li class="list-group-item">Click on map to measure area. Double-click to complete polygon, press <kbd>ctrl+z</kbd> to undo most recent point, press <kbd>Delete</kbd> or <kbd>Backspace</kbd> to start over.</li>
                                      <li class="list-group-item">Buttons are available under the tool in the left sidebar to undo and restart drawing</li>
                                      <li class="list-group-item">If the color of the line is hard to see, it can be changed with the color picker under the tool in the left sidebar</li>
                                    </ul>`
                        },
                        'pixel-tools-query-visible-map-layers':{
                            divID: 'tools-collapse-div',
                            message:`<h5 class = 'list-group-title'>TOOLS-Pixel Tools-Query Visible Map Layers</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "Query Visible Map Layers" tool</li>
                                      <li class="list-group-item">Once activated, anywhere you double-click will query the value of any visible layer.</li>
                                      <li class="list-group-item">The values will appear in a popup on the map.</li>
                                      <li class="list-group-item">Sometimes it can take some time to query all visible layers as the query is done on-the-fly within Google Earth Engine</li>
                                      <li class="list-group-item">The popup window can be closed by clicking the <kbd>&times</kbd> in the upper right or by clickin on the map</li>
                                      <li class="list-group-item">To query the map again, double-click once more</li>
                                    </ul>`
                        },
                        'pixel-tools-query-visible-lcms-time-series':{
                            divID: 'tools-collapse-div',
                            message:`<h5 class = 'list-group-title'>TOOLS-Pixel Tools-Query Visible LCMS Time Series</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "Query LCMS Time Series" tool</li>
                                      <li class="list-group-item">This tool allows you to query a single pixel from the LCMS time series</li>
                                      <li class="list-group-item">This is helpful to understand what happened in a smaller area and to understand the suite of products available from LCMS</li>
                                      <li class="list-group-item">Once activated, anywhere you double-click will query the LCMS time series.</li>
                                      <li class="list-group-item">Sometimes it can take some time to query the LCMS time series as the query is done on-the-fly within Google Earth Engine</li>
                                      <li class="list-group-item">Once this is complete, a chart will apear</li>
                                      <li class="list-group-item">Each line in the chart can be turned off by clicking on it in the chart legend.</li>
                                      <li class="list-group-item">You can download a CSV or PNG of the extracted data in the dropdown menu in the bottom of the chart window</li>
                                      <li class="list-group-item">To query another area, close the chart and double-click on the map</li>
                                    </ul>`
                        },
                        'area-tools-user-defined-area':{
                            divID: 'tools-collapse-div',
                            message:`<h5 class = 'list-group-title'>TOOLS-Area Tools-User-Defined Area</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "User-Defined Area" tool</li>
                                      <li class="list-group-item">This tool allows you to draw a polygon on the map and summarize LCMS products across that area</li>
                                      <li class="list-group-item">Once activated, click on map to draw a polygon. Double-click to complete polygon, press <kbd>ctrl+z</kbd> to undo most recent point, press <kbd>Delete</kbd> or <kbd>Backspace</kbd> to start over.</li>
                                      <li class="list-group-item">Buttons are available under the tool in the left sidebar to undo and restart drawing</li>
                                      <li class="list-group-item">If the color of the line is hard to see, it can be changed with the color picker under the tool in the left sidebar</li>
                                      <li class="list-group-item">Once polygon is completed, the area will be summarized.  Once this is complete, a chart will apear</li>
                                      <li class="list-group-item">Sometimes it can take some time to summarize the area as it is done on-the-fly within Google Earth Engine</li>
                                      <li class="list-group-item">Selecting a very large area may not successfully run</li>
                                      <li class="list-group-item">Each line in the chart can be turned off by clicking on it in the chart legend.</li>
                                      <li class="list-group-item">You can download a CSV, PNG, or geoJSON of the extracted data in the dropdown menu in the bottom of the chart window</li>
                                      <li class="list-group-item">To summarize another area, close the chart and draw another polygon</li>
                                    </ul>`
                        },
                        'downloads':{
                            divID : 'download-collapse-div',
                            message:`<h5 class = 'list-group-title'>DOWNLOADS</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">to dow</li>
                                      <li class="list-group-item">There are two modes to explore the data with. The standard mode provides the core LCMS products, related data, and tools to explore LCMS data</li>
                                      <li class="list-group-item">The only parameter to change in standard mode is the range of years included in the analysis. Try selecting a different range of years and then hit submit. This will filter all products to only include those years.</li>
                                      <li class="list-group-item">When the analysis mode is changed to "Advanced" a number of additional parameters will appear</li>
                                      <li class="list-group-item">The first parameters are the thresholds used to determine where loss and gain are. The default thresholds optimize the balanced-accuracy. Sometimes a more inclusive or exclusive depiction of loss or gain may be needed. Try changing these thresholds and then looking at the map</li>
                                    </ul>`
                        },
                        'Parameters':{
                            divID:'parameters-collapse-div',
                            message:`<h5 class = 'list-group-title'>PARAMETERS</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">There are a number of parameters that can be changed</li>
                                      <li class="list-group-item">There are two modes to explore the data with. The standard mode provides the core LCMS products, related data, and tools to explore LCMS data</li>
                                      <li class="list-group-item">The only parameter to change in standard mode is the range of years included in the analysis. Try selecting a different range of years and then hit submit. This will filter all products to only include those years.</li>
                                      <li class="list-group-item">When the analysis mode is changed to "Advanced" a number of additional parameters will appear</li>
                                      <li class="list-group-item">The first parameters are the thresholds used to determine where loss and gain are. The default thresholds optimize the balanced-accuracy. Sometimes a more inclusive or exclusive depiction of loss or gain may be needed. Try changing these thresholds and then looking at the map</li>
                                    </ul>`
                        }
                        
                        

                    
                    }
var walkThroughAdded = false;

$(window).resize(function(){
    
    moveCollapse('legend-collapse');
    moveCollapse('plot-collapse');
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
    $('#legendDiv').removeClass('col-xl-2');
    $('#legendDiv').removeClass('col-lg-3');

    var collapseContainer =getWalkThroughCollapseContainerID(); 
    addCollapse(collapseContainer,'walk-through-collapse-label','walk-through-collapse-div','TUTORIAL','<i class="fa fa-book  mx-1" aria-hidden="true"></i>',true,``,'Walk through the features of the LCMS Data Explorer')
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

function nextWalkThrough(){
    walkThroughKeyI++;
    showWalkThroughI();
}
function previousWalkThrough(){
    walkThroughKeyI--;
    showWalkThroughI();
}
function showWalkThroughI(){
    $('#legendDiv').scrollTop(0);
    var dict = walkThroughDict[Object.keys(walkThroughDict)[walkThroughKeyI]];
  
    if(dict === undefined){
        showWalkThroughPopupMessage(`All features have been shown`);
    }else{
        $('.panel-collapse').removeClass('show')
        
        $('#'+dict.divID).addClass('show');
         $('#walk-through-collapse-div').addClass('show');
        showWalkThroughPopupMessage(dict.message);
       
    };
    
    
}