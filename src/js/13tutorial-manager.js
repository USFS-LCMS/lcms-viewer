const walkThroughKeysOrder = {
  MTBS: [
    "intro",
    "data-layers",
    "legend",
    "parameters-mtbs",
    "reference-layers-mtbs",
    "tools-overview",
    "measuring-tools-distance-measuring",
    "measuring-tools-area-measuring",
    "pixel-tools-query-visible-map-layers",
    "pixel-tools-query-time-series-mtbs",
    "area-tools-overview",
    "area-tools-user-defined-area",
    "area-tools-user-uploaded-area",
    "area-tools-user-selected-area",
    "finished",
  ],
  LCMS: [
    "intro",
    "data-layers",
    "legend",
    "parameters-lcms",
    "reference-layers-lcms",
    "tools-overview",
    "measuring-tools-distance-measuring",
    "measuring-tools-area-measuring",
    "pixel-tools-query-visible-map-layers",
    "pixel-tools-query-time-series",
    "area-tools-user-defined-area",
    "area-tools-user-uploaded-area",
    "area-tools-user-selected-area",
    "downloads",
    "finished",
  ],
};

walkThroughDict = {
  intro: {
    message: `<h5 class = 'list-group-title'>${mode} DATA Explorer Walk-Through</h5>
                                            <ul class="list-group list-group-flush">
                                                <li class="list-group-item">Welcome to the ${mode} Data Explorer walk-through. The walk-through will explain what features are available and how to use them. Click on the <i class="fa fa-chevron-right text-black"></i> button in the lower left corner to start.</li>
                                            </ul>`,
  },
  finished: {
    message: `<h5 class = 'list-group-title'>${mode} DATA Explorer Walk-Through Complete!</h5>
                                            <ul class="list-group list-group-flush">
                                                <li class="list-group-item">You have now ${mode} Data Explorer walk-through. Click on the <i class="fa fa-stop text-black"></i> button in the lower right corner to close.</li>
                                            </ul>`,
  },
  "data-layers": {
    divID: "layer-list-collapse-div",
    message: `<h5 class = 'list-group-title'>${mode} DATA</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">The layers in the ${mode} DATA menu in the left sidebar are the core ${mode} products.</li>
                                      <li class="list-group-item">All map layers can be turned on or off with the radio button on the left or with a single click on the name.</li>
                                      <li class="list-group-item">The slider on the right controls the opacity of the layer. This is useful for overlaying different layers to see how they relate.</li>
                                      <li class="list-group-item">If you do not see the layer when you turn it on, you can  double-click on the layer name to zoom to the extent of the layer.</li>
                                      <li class="list-group-item">All map layers are created on-the-fly within <span><a class = 'intro-modal-links' href="https://earthengine.google.com/" target="_blank">Google Earth Engine (GEE) </a></span>, which can cause a delay in the loading of the layers. The number of layers still being created within GEE can be viewed on the bottom bar under "Queue length for maps from GEE:". The number of layers that are currently being displayed can be seen under "Number of map layers loading tiles."</li>
                                      <li class="list-group-item">When a layer is turned on, if appropriate, an entry in the LEGEND on the bottom-right side (above this tutorial window) will appear.</li>  
                                    </ul>`,
  },
  legend: {
    divID: "legend-collapse-div",
    message: `<h5 class = 'list-group-title'>LEGEND</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">The LEGEND menu in the right sidebar (above this tutorial window) shows a key for enabled and visible layers in the ${mode} DATA layers and REFERENCE DATA submenus in the left sidebar.</li>
                                      <li class="list-group-item">LEGEND items are only displayed if the layer is enabled and has an appropriate legend entry.</li>
                                      <li class="list-group-item">Thematic data layers will have individual colors and names listed, while continuous data layers will have a color ramp with numeric values. Vector data layers will display the color of the outline.</li>
                                    </ul>`,
  },
  "reference-layers-lcms": {
    divID: "reference-layer-list-collapse-div",
    message: `<h5 class = 'list-group-title'>REFERENCE DATA</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">The REFERENCE DATA layers are related geospatial data that can help provide context for the ${mode} data products</li>
                                      <li class="list-group-item">They include the <a class="intro-modal-links" href = "https://earthenginepartners.appspot.com/science-2013-global-forest" target = '_blank'>Hansen Global Forest Change data</a>, 
                                                                <a class="intro-modal-links" href = "https://www.fs.fed.us/foresthealth/applied-sciences/mapping-reporting/detection-surveys.shtml" target = "_blank">US Forest Service Insect and Disease Survey (IDS) data</a>,
                                                                 <a class="intro-modal-links" href = "https://mtbs.gov/" target = '_blank'>Monitoring Trends in Burn Severity (MTBS)</a> data, along with related boundary data</li>
                                      <li class="list-group-item">Some study areas include additional data such as mid-level vegetation maps.</li>
                                      <li class="list-group-item">Turning these layers on/off and adjusting the opacity is the same as the ${mode} DATA.</li>
                                    </ul>`,
  },
  "reference-layers-mtbs": {
    divID: "reference-layer-list-collapse-div",
    message: `<h5 class = 'list-group-title'>REFERENCE DATA</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">The REFERENCE DATA layers are related geospatial data that can help provide context for the ${mode} data products.</li>
                                      <li class="list-group-item">They include <a class="intro-modal-links" href = "https://www.mrlc.gov/data" target = '_blank'>NLCD land cover data</a> and 
                                                                <a class="intro-modal-links" href = "https://naip-usdaonline.hub.arcgis.com/" target = '_blank'>NAIP data</a>.</li>
                                      <li class="list-group-item">Turning these layers on/off and adjusting the opacity is the same as for the ${mode} DATA layers.</li>
                                    </ul>`,
  },
  "tools-overview": {
    divID: "tools-collapse-div",
    message: `<h5 class = 'list-group-title'>TOOLS-Overview</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">A number of tools are provided in the left sidebar to explore both the ${mode} DATA as well as the REFERENCE DATA.</li>
                                      <li class="list-group-item">These include measuring tools for relating how small or large something you see on the map really is, single pixel query tools to explore a specific location, and area query tools to summarize data across an area.</li>
                                      <li class="list-group-item">Each tool can be turned on by clicking on the toggle slider to the left of the tool's title. Tools can be turned off either by clicking on the toggle slider again or clicking on another tool's toggle slider.</li>
                                      <li class="list-group-item">Any active tool will be listed on the bottom bar under the "Currently active tools."</li>
                                    </ul>`,
  },
  "measuring-tools-distance-measuring": {
    divID: "tools-collapse-div",
    message: `<h5 class = 'list-group-title'>TOOLS-Measuring Tools-Distance Measuring</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "Distance Measuring" tool.</li>
                                      <li class="list-group-item">Once activated, click on the map to draw a line to measure distance.</li>
                                      <li class="list-group-item">The drawn vertices can be moved by clicking and dragging. You can also adjust the midpoint of a drawn line by moving the faint grey point in the middle of a line.</li>
                                      <li class="list-group-item">Press <kbd>ctrl+z</kbd> to undo the most recent point. Double-click, press <kbd>Delete</kbd>, or press <kbd>Backspace</kbd> to clear the line and start over.</li>
                                      <li class="list-group-item">There are also buttons available under the tool in the left sidebar to undo and restart drawing.</li>
                                      <li class="list-group-item">Units can be toggled between imperial and metric using the toggle switch.</li>
                                      <li class="list-group-item">If the color of the line is hard to see, it can be changed with the color picker paintbrush under the tool in the left sidebar.</li>
                                    </ul>`,
  },
  "measuring-tools-area-measuring": {
    divID: "tools-collapse-div",
    message: `<h5 class = 'list-group-title'>TOOLS-Measuring Tools-Area Measuring</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "Area Measuring" tool</li>
                                      <li class="list-group-item">Once activated, click on the map to draw polygons to measure area.</li>
                                      <li class="list-group-item">Click on the map to measure an area, double-click to complete the polygon. <kbd>ctrl+z</kbd> will undo the most recently placed point, pressing <kbd>Delete</kbd> or <kbd>Backspace</kbd> will delete the entire polygon. The polygon can be adjusted by clicking and dragging mid-points and vertices.</li>
                                      <li class="list-group-item">Buttons are available under the tool in the left sidebar to undo and restart drawing as well.</li>
                                      <li class="list-group-item">Units can be toggled between imperial and metric using the toggle switch.</li>
                                      <li class="list-group-item">If the color of the line is hard to see, it can be changed with the color picker paintbrush under the tool in the left sidebar.</li>
                                      <li class="list-group-item">Multiple areas can be measured simultaneously by continuing to click after a polygon has been completed.</li>
                                    </ul>`,
  },
  "pixel-tools-query-visible-map-layers": {
    divID: "tools-collapse-div",
    message: `<h5 class = 'list-group-title'>TOOLS-Pixel Tools-Query Visible Map Layers</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "Query Visible Map Layers" tool.</li>
                                      <li class="list-group-item">Once activated, anywhere you double-click will query the value of any visible layer.</li>
                                      <li class="list-group-item">The values will appear in a popup on the map.</li>
                                      <li class="list-group-item">It can take some time to query all visible layers as the query is done on-the-fly within Google Earth Engine.</li>
                                      <li class="list-group-item">The popup window can be closed by clicking the <kbd>&times</kbd> in the upper right.</li>
                                      <li class="list-group-item">To query the map again, double-click once more.</li>
                                    </ul>`,
  },
  "pixel-tools-query-time-series": {
    divID: "tools-collapse-div",
    message: `<h5 class = 'list-group-title'>TOOLS-Pixel Tools-Query ${mode} Time Series</h5>
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
                                    </ul>`,
  },
  "pixel-tools-query-time-series-mtbs": {
    divID: "tools-collapse-div",
    message: `<h5 class = 'list-group-title'>TOOLS-Pixel Tools-Query ${mode} Time Series</h5>
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
                                    </ul>`,
  },
  "area-tools-overview": {
    divID: "tools-collapse-div",
    message: `<h5 class = 'list-group-title'>TOOLS-Area Tools-Overview</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Area tools allow ${mode} products to be summarized across areas.</li>
                                      <li class="list-group-item">Areas can be drawn on the map, provided as a zipped shapefile or .geojson, or selected from pre-defined sets of areas.</li>
                                      <li class="list-group-item">There are two parameters that can be changed using the Area Tools Parameters sub-menu.</li>
                                      <li class="list-group-item">The first is which ${mode} product will be summarized. The dropdown menu under "Choose which ${mode} product to summarize" can be changed to chart different ${mode} products.</li>
                                      <li class="list-group-item">The second parameter is a set of radio buttons under "Area Units." Areas can be summarized as a percentage of the area, acres, or hectares depending on your needs.</li>
                                      <li class="list-group-item">If any of these parameters are changed, the chart will need to be re-drawn to take effect.</li>
                                    </ul>`,
  },
  "area-tools-user-defined-area": {
    divID: "tools-collapse-div",
    message: `<h5 class = 'list-group-title'>TOOLS-Area Tools-User-Defined Area</h5>
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
                                    </ul>`,
  },
  "area-tools-user-uploaded-area": {
    divID: "tools-collapse-div",
    message: `<h5 class = 'list-group-title'>TOOLS-Area Tools-Upload an Area</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "Upload an Area" tool.</li>
                                      <li class="list-group-item">This tool allows you to upload a shapefile or geoJSON file and summarize ${mode} products across that area.</li>
                                      <li class="list-group-item">Once activated, click on the <kbd>Choose File</kbd> button to choose a file to upload.</li>
                                      <li class="list-group-item">A shapefile must have all of its associated files zipped into a .zip file.  Any file with a .geojson extension is also accepted.</li>
                                      <li class="list-group-item">Extremely large files will fail to upload and/or chart.</li>
                                      <li class="list-group-item">Large shapefiles (vectors > ~5000 vertices or file size > ~50 mb) will likely fail. If this occurs, try increasing the "Vertex Reduction Factor" (maintains every nth vertex. E.g. if set to 3, every third vertex will remain). If this still fails, please contact us to summarize across a large vector.</li>
                                      <li class="list-group-item">Once the file is selected, click on the <kbd>Chart across chosen file</kbd> button to ingest chosen file and create chart.</li>
                                      <li class="list-group-item">Sometimes it can take some time upload the chosen file and summarize the area as it is done on-demand within Google Earth Engine.</li>
                                      <li class="list-group-item">Selecting a very large area may not successfully run.</li>
                                      <li class="list-group-item">You can display the data on various types of graphs or a table using the "Chart Type" dropdown menu.</li>
                                      <li class="list-group-item">Within the graph, each category/line in the graph can be turned off by clicking on it in the graph legend.</li>
                                      <li class="list-group-item">You can download a CSV or PNG of the extracted data in the "Download" dropdown menu in the bottom of the chart window.</li>
                                      <li class="list-group-item">To summarize another area, close the chart and repeat this process.</li>
                                    </ul>`,
  },
  "area-tools-user-selected-area": {
    divID: "tools-collapse-div",
    message: `<h5 class = 'list-group-title'>TOOLS-Area Tools-Select an Area on Map</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">Activate the "Select an Area on Map" tool.</li>
                                      <li class="list-group-item">This tool allows the summarizaton of ${mode} products across a selection of pre-defined areas.</li>
                                      <li class="list-group-item">After activating the tool, select a layer and it will be displayed on the map interface.</li>
                                      <li class="list-group-item">After the layer is loaded and displayed, it can be selected by clicking on it on the map.</li>
                                      <li class="list-group-item">If the selected location intersects multiple polygons, multiple areas will be selected.</li>
                                      <li class="list-group-item">The name of selected areas will appear in a list below the layers under "Selected area names:".</li>
                                      <li class="list-group-item">Clicking on an area again or pressing the undo or trash button will deselect any selected areas.</li>
                                      <li class="list-group-item">Every time an area is selected, background processing is being performed. Clicking on many areas at once may slow down the tool.</li>
                                      <li class="list-group-item">A name for the selected area can be provided in the "Name your charting area" input box. If no name is provided, the tool will automatically generate one.</li>
                                      <li class="list-group-item">The "Simplify Area - Max Error" slider can be used to simplify areas that are selected by allowing for a specified maximum error in meters. This allows larger and/or more complicated areas to be summarized. This simplification is performed as an area is selected. The selected areas added to the map reflect the simplification. You will notice the differences are usually quite minimal. If an area failed to run, clear the current selection, increase the value on the slider, and reselect the area(s).</li>
                                      <li class="list-group-item">Once all areas you would like to include are selected, press the <kbd>Chart Selected Areas</kbd> button at the bottom of the tool to summarize those areas and create a chart.</li>
                                      <li class="list-group-item">Selecting a very large area may not successfully run.</li>
                                      <li class="list-group-item">You can display the data on various types of graphs or a table using the "Chart Type" dropdown menu.</li>
                                      <li class="list-group-item">Within the graph, each category/line in the graph can be turned off by clicking on it in the graph legend.</li>
                                      <li class="list-group-item">You can download a CSV or PNG of the extracted data with the "Download" dropdown menu at the bottom of the chart window.</li>
                                      <li class="list-group-item">To summarize another area, close the chart and repeat this process. You can continue selecting more areas, or clear your selected areas using the trash can button and start over.</li>
                                    </ul>`,
  },
  downloads: {
    divID: "download-collapse-div",
    message: `<h5 class = 'list-group-title'>DOWNLOADS</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">To download layers, click on dropdown and then click on the data package you would like to download.</li>
                                      <li class="list-group-item">The download should start shortly after.</li>
                                      <li class="list-group-item">Your browser may prompt you with where you would like to save the data.</li>
                                    </ul>`,
  },
  "parameters-lcms": {
    divID: "parameters-collapse-div",
    message: `<h5 class = 'list-group-title'>PARAMETERS</h5>
                                    <ul class="list-group list-group-flush">
                                      <li class="list-group-item">There are a number of parameters that can be changed</li>
                                      <li class="list-group-item">There are two modes to explore the data with. The standard mode provides the core ${mode} products, related data, and tools to explore ${mode} data.</li>
                                      <li class="list-group-item">The only parameter to change in standard mode is the range of years included in the analysis. Try selecting a different range of years and then hit submit. This will filter all products to only include those years.</li>
                                      <li class="list-group-item">When the analysis mode is changed to "Advanced" a number of additional parameters will appear.</li>
                                      <li class="list-group-item">The first parameters are the thresholds used to determine where loss and gain are. The default thresholds optimize the balanced-accuracy. Sometimes a more inclusive or exclusive depiction of loss or gain may be needed. Try changing these thresholds and then looking at the map.</li>
                                    </ul>`,
  },
  "parameters-mtbs": {
    divID: "parameters-collapse-div",
    message: `<h5 class = 'list-group-title'>PARAMETERS</h5>
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
                                    </ul>`,
  },
};

function toggleWalkThroughCollapse() {
  if (walkThroughAdded) {
    removeWalkThroughCollapse();
  } else addWalkThroughCollapse();
}
function addWalkThroughCollapse() {
  $("#introModal").hide();
  $(".modal-backdrop").remove();
  $("#legendDiv").removeClass("col-xl-2");
  $("#legendDiv").removeClass("col-lg-3");
  ga("send", "event", mode, "walk-through-run", "walk-through-run");
  const collapseContainer = getWalkThroughCollapseContainerID();
  addCollapse(
    collapseContainer,
    "walk-through-collapse-label",
    "walk-through-collapse-div",
    "TUTORIAL",
    '<i class="fa fa-book  mx-1" aria-hidden="true"></i>',
    true,
    ``,
    "Walk through the features of the " + mode + " Data Explorer"
  );
  $("#walk-through-collapse-div").append(staticTemplates.walkThroughPopup);
  showWalkThroughI();
  walkThroughAdded = true;
}
function removeWalkThroughCollapse() {
  $("#legendDiv").addClass("col-xl-2");
  $("#legendDiv").addClass("col-lg-3");
  $("#walk-through-collapse-label").remove();
  $("#walk-through-collapse-div").remove();
  walkThroughAdded = false;
}

function closeWalkThroughPopup() {
  $("#walk-through-popup").hide("fade");
}

function showWalkThroughPopupMessage(message) {
  $("#walk-through-popup-content").empty();
  $("#walk-through-popup-content").append(message);
  $("#walk-through-popup").show("fade");
}

let walkThroughKeyI;
if (walkThroughKeysOrder[mode] === undefined) {
  walkThroughKeyI = 100;
} else {
  walkThroughKeyI = walkThroughKeysOrder[mode].length * 10;
}
function nextWalkThrough() {
  walkThroughKeyI++;
  showWalkThroughI();
}
function previousWalkThrough() {
  walkThroughKeyI--;
  if (walkThroughKeyI === -1) {
    walkThroughKeyI = walkThroughKeysOrder[mode].length * 10;
  }
  showWalkThroughI();
}
function showWalkThroughI() {
  ga("send", "event", mode, "walk-through-slide-show", walkThroughKeyI);
  $("#legendDiv").scrollTop(0);

  $(".sub-sub-panel-title").addClass("collapsed");
  stopAllTools();
  const tI = walkThroughKeyI % walkThroughKeysOrder[mode].length;
  const dict = walkThroughDict[walkThroughKeysOrder[mode][tI]];

  if (dict === undefined) {
    showWalkThroughPopupMessage(`All features have been shown`);
  } else {
    $(".panel-collapse").removeClass("show");
    $("#" + dict.divID).addClass("show");
    $("#walk-through-collapse-div").addClass("show");
    showWalkThroughPopupMessage(dict.message);
    $("#walk-through-popup-progress").empty();
    $("#walk-through-popup-progress").append(
      (tI + 1).toString() + "/" + walkThroughKeysOrder[mode].length.toString()
    );
  }
}
if (
  mode === "lcms-dashboard" ||
  mode === "Bloom-Mapper" ||
  mode === "TreeMap" ||
  mode === "sequoia-view" ||
  mode === "HiForm-BMP"
) {
  // https://shepherdjs.dev/docs/tutorial-02-usage.html
  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true,
        confirmCancel: true,
      },

      classes: "class-1 class-2",
      scrollTo: true,
    },
  });

  function getTourButtons(buttonIs = [0, 1], stepN = 1, totalSteps = 10) {
    let tourButtons = [
      {
        action() {
          return tour.back();
        },
        text: `<i class="fa fa-chevron-left teal " title="Previous tour slide"></i>`,
      },
      {
        action() {
          return tour.next();
        },
        text: `<i class="fa fa-chevron-right teal " title="Next tour slide"></i>`,
      },
    ];
    return tourButtons.slice(buttonIs[0], buttonIs[1]);
  }
  // Click function adapted from: https://github.com/shipshapecode/shepherd/issues/119
  const createDelayedClick = function (selector) {
    const wrapper = function () {
      return (function (sel) {
        if ($(sel).hasClass("collapsed")) {
          $(sel).click();
        }
      })(selector);
    };

    return function () {
      setTimeout(wrapper, 500);
    };
  };
  let stepN = 1;
  function addStep(step, totalSteps) {
    let title = `${step[0]}`;
    let txt = `${step[1]}<br><p style='font-size:0.75rem;'>(${stepN}/${totalSteps})</p>`;
    let buttons = getTourButtons(step[4], stepN, totalSteps);
    $(step[2]).mousedown(function (event) {
      if (event.ctrlKey) {
        console.log("Right or ctrl mouse clicked");
        console.log(step[2]);
        ga(
          "send",
          "event",
          `${mode}-shepherd-tour-started`,
          "ctrl-click",
          step[2]
        );
        tour.show(step[5]);
      }
    });

    stepN++;
    let obj = {
      title: title,
      text: txt,
      attachTo: {
        element: step[2],
        on: step[3], //Possible string values: 'top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'right', 'right-start', 'right-end', 'left', 'left-start', 'left-end'
      },
      buttons: buttons,
      id: step[5],
    };
    if (step[6] !== undefined) {
      obj.when = {
        show: createDelayedClick(step[6]),
      };
    }
    tour.addStep(obj);
  }
  function startTour() {
    $(".modal").modal("hide");
    $(".modal-backdrop").remove();
    if (!tour.isActive()) {
      tour.start();
      console.log("here");
      ga("send", "event", `${mode}-shepherd-tour-started`, "splash-screen");
    }
  }
  if (mode === "lcms-dashboard") {
    let dashboardTourSteps = [
      [
        "Welcome to the LCMS Dashboard tour",
        `This tour will walk you through how to use the LCMS dashboard. <br>(If you'd like to learn how to use individual elements, ctrl+click to see the tour slide for a specific element.)`,
        "#title-banner",
        "right",
        [1, 2],
        "intro-tour-modal",
      ],

      [
        "Locate, Share, Search, Navigate",
        `<ul>
                            <li>Clicking the <i class="fa fa-map-marker"></i> icon will show your current location on the map if possible.</li>
                            <li>Clicking the <i class="fa fa-share-alt teal "></i> icon will create a unique link that contains your current view extent and parameter choices for easy sharing.</li>
                            <li>You can search for locations in the search window.</li>
                            <li>Clicking the <i class="fa fa-chevron-left teal "></i> <i class="fa fa-chevron-right teal "></i> will take you back or forward a view extent.</li>
                            </ul>`,
        "#search-share-div",
        "right",
        [0, 2],
        "search-tour-modal",
      ],
      [
        "Loading Progress",
        `By default, summary areas are downloaded as you move the map based on your view extent. As these areas are downloaded, the progressbar will be updated.`,
        "#highlights-progressbar",
        "right",
        [0, 2],
        "progress-tour-modal",
      ],
      [
        "Clear Everything",
        `You can clear all selected areas by clicking this button`,
        "#erase-all-dashboard-selected",
        "right",
        [0, 2],
        "erase-all-tour-modal",
      ],
      [
        "Adjusting the parameters",
        `There are many parameters that can be adjusted. Each of these parameters will automatically update the summaries you see in the bottom and right panes. Clicking the <i class="fa fa-share-alt teal "></i> icon above will create a unique link that contains your current view extent and parameter choices for easy sharing.`,
        "#parameters-collapse-label",
        "right",
        [0, 2],
        "params-tour-modal",
        "#parameters-collapse-label-label",
      ],
      [
        "Change how areas are selected",
        `By default, all active summary areas within the map view (View-Extent) are included in the table and charts. You can also manually select individual areas by clicking on them (Click) or selecting all areas within a box (Drag-Box).`,
        "#summary-area-selection-radio",
        "right-end",
        [0, 2],
        "select-method-tour-modal",
        "#parameters-collapse-label-label",
      ],
      [
        "Choose what to learn about",
        `We provide several common aspects of landscape change you may be interested in learning more about. You can choose from any of these or create your own. By selecting what to learn about, the relevant Change, Land Cover, and Land Use classes are automatically selected witin the check box selection menus below in the <i>Advanced Parameters</i> checkboxes`,
        "#questions-dashboard-dropdown",
        "right-end",
        [0, 2],
        "question-tour-modal",
        "#parameters-collapse-label-label",
      ],
      [
        "Selecting Years",
        `You can select the range of years to be included with this slider. Notice as you change the years, the table on the right and charts below are updated.`,
        "#analysis-year-slider-container",
        "right",
        [0, 2],
        "year-slider-tour-modal",
        "#parameters-collapse-label-label",
      ],

      [
        "Advanced Parameters",
        `There are many parameters you can change to ask specific questions of LCMS data. This can include changing which LCMS classes are in the charts and tables, what kind of charts to show, and what level of significance testing you'd like to use. `,
        "#advanced-dashboard-params-label",
        "right-end",
        [0, 2],
        "advanced-prams-tour-modal",
        "#advanced-dashboard-params-label>h5",
      ],
      [
        "What Units",
        `Choose to show areas as proportions of the entire summary area or in acres or hectares. When this is changed, all charts and tables are automatically updated`,
        "#which-units-radio",
        "right-end",
        [0, 2],
        "annual-change-method-tour-modal",
        "#advanced-dashboard-params-label>h5",
      ],

      [
        "How to chart",
        `You can switch between showing the amount of a land cover or land use class was mapped for a given year (Annual) or the difference between that year and the previous year (Annual-Change). Annual-Change can be useful to visualizing whether change for a given class has been positive or negative.`,
        "#summary-pairwise-diff-radio",
        "right-end",
        [0, 2],
        "annual-change-method-tour-modal",
        "#parameters-collapse-label-label",
      ],
      [
        "Which Chart Types",
        `Choose which chart types to show. Annual shows a line graph of the values for each selected class (using the checkboxes below) for each year for the selected years from the year slider above. Transition will show a Sankey Chart that depicts the transition between all classes for a pre-defined set of year periods. Transition (Sankey) charts do not update as you select different years and classes.`,
        "#annual-transition-radio",
        "right-end",
        [0, 2],
        "annual-transition-checkbox-tour-modal",
        "#parameters-collapse-label-label",
      ],
      [
        "Which Change Classes",
        `Choose which LCMS Change classes to show in the charts (bottom) and highlights table (right). Any selected class will automatically be turned on in the charts (bottom) and have a tab added to the right pane containing the respective summary table.`,
        "#change-highlights-radio",
        "right-end",
        [0, 2],
        "which-change-classes-tour-modal",
        "#parameters-collapse-label-label",
      ],

      [
        "Which Land Cover Classes",
        `Choose which LCMS Land Cover classes to show in the charts (bottom) and highlights table (right). Any selected class will automatically be turned on in the charts (bottom) and have a tab added to the right pane containing the respective summary table.`,
        "#lc-highlights-radio",
        "right-end",
        [0, 2],
        "which-lc-classes-tour-modal",
        "#parameters-collapse-label-label",
      ],
      [
        "Which Land Use Classes",
        `Choose which LCMS Land Use clases to show in the charts (bottom) and highlights table (right). Any selected class will automatically be turned on in the charts (bottom) and have a tab added to the right pane containing the respective summary table.`,
        "#lu-highlights-radio",
        "right-end",
        [0, 2],
        "which-lu-classes-tour-modal",
        "#parameters-collapse-label-label",
      ],
      [
        "Significance Test",
        `Choose what level of confidence to use to detect significant change. A higher level of confidence will yield fewer significant changes detected.`,
        "#ci-level-radio",
        "right-end",
        [0, 2],
        "ci-level-classes-tour-modal",
        "#parameters-collapse-label-label",
      ],
      [
        "Summary Area Selection",
        `Turn on summary layers to include them in the generated tables and graphs. Turn them off to exclude them.`,
        "#layer-list-collapse-label",
        "right-end",
        [0, 2],
        "layer-tour-modal",
        "#layer-list-collapse-label-label",
      ],
      [
        "LCMS Layer Viewing",
        `Turn on and off LCMS data layers to help bring spatial context to the summary areas you are viewing. These layers are turned on and off in the same fashion as the summary areas above.`,
        "#reference-layer-list-collapse-label",
        "right-end",
        [0, 2],
        "lcms-raster-layer-tour-modal",
        "#reference-layer-list-collapse-label-label",
      ],

      [
        "Results: Charts and Tables Report Download",
        `All tables and charts can be downloaded in a single pdf report. It can take a bit for the report to be generated if a large number of areas is selected - please be patient.`,
        "#dashboard-download-button-container",
        "left",
        [0, 2],
        "report-download-tour-modal",
        "#dashboard-results-sidebar-toggler",
      ],
      [
        "Results: Charts",
        `As selected summary areas are downloaded, they are all totaled for each summary area type and a chart is created here. Classes can be turned off and on in the checkboxes within the <i>Advanced Parameters</i> collapse menu or within the chart or by clicking on them in the legend at the bottom.`,
        "#charts-collapse-label",
        "left",
        [0, 2],
        "chart-tour-modal",
        "#charts-collapse-label-label",
      ],
      [
        "Results: Highlights Tables Tabs",
        `All tables for each selected class can be accessed with its tab. You can switch between different summary areas and classes by selecting its respective tab.`,
        "#highlights-table-tabs",
        "left",
        [0, 2],
        "highlights-tabs-tour-modal",
      ],
      [
        "Results: Change Highlights Tables",
        `Selected summary areas will be included in a table here highlighting the difference for a given class between the first and last years. View a given table by clicking on the tab above. These tables are automatically updated as selected areas, years, classes, etc are changed. Tables can be sorted by any column and downloaded in various formats.`,
        "#highlights-table-divs",
        "left",
        [0, 1],
        "highlights-tables-tour-modal",
      ],
    ];

    dashboardTourSteps.map((s) => addStep(s, dashboardTourSteps.length));
  } else if (mode === "Bloom-Mapper") {
    let algalTourSteps = [
      [
        `Welcome to the ${mode} tour`,
        `This tour will walk you through how to use the ${mode}. <br>(If you'd like to learn how to use individual elements, ctrl+click to see the tour slide for a specific element.)`,
        "#title-banner",
        "right",
        [1, 2],
        "intro-tour-modal",
      ],

      [
        "Locate, Share, Search, Navigate",
        `<ul>
                            <li>Clicking the <i class="fa fa-map-marker"></i> icon will show your current location on the map if possible.</li>
                            <li>Clicking the <i class="fa fa-share-alt teal "></i> icon will create a unique link that contains your current view extent and parameter choices for easy sharing.</li>
                            <li>You can search for locations in the search window.</li>
                            <li>Clicking the <i class="fa fa-chevron-left teal "></i> <i class="fa fa-chevron-right teal "></i> will take you back or forward a view extent.</li>
                            </ul>`,
        "#search-share-div",
        "right",
        [0, 2],
        "search-tour-modal",
      ],
      [
        "Adjusting the parameters",
        `There are parameters that can be adjusted. After changing these parameters, click the <kbd>Submit</kbd> button to refresh the map layers. Clicking the <i class="fa fa-share-alt teal "></i> icon above will create a unique link that contains your current view extent and parameter choices for easy sharing.`,
        "#parameters-collapse-label",
        "right",
        [0, 2],
        "params-tour-modal",
        "#parameters-collapse-label-label",
      ],
      [
        "Selecting Years",
        `You can select the range of years of ${mode} data to be included with this slider.`,
        "#analysis-year-slider-container",
        "right",
        [0, 2],
        "year-slider-tour-modal",
        "#parameters-collapse-label-label",
      ],
      [
        "Updating Map",
        `Click this button to update the maps to reflect your chosen parameters`,
        "#reRun-button",
        "right",
        [0, 2],
        "rerun-button-tour-modal",
        "#parameters-collapse-label-label",
      ],
      [
        `${mode} Timelapse Layers`,
        `Turn on and off ${mode} timelapse layers using the radio buttons on the left side of each layer. Timelapse controls allow for the viewing and annimation of the time series of outputs. All dates shown in each time lapse are the date of the end of the compositing period for that frame. The input data include the cloud / cloud shadow free median value from that date to 4 weeks prior.`,
        "#layer-list-collapse-label",
        "right-end",
        [0, 2],
        "layer-list-tour-modal",
        "#layer-list-collapse-label-label",
      ],
      [
        `Exploration Tools`,
        `Tools are available to measure and chart map layers. The <i>Query Visible Map Layers</i> tool allows for any visible timelapse layer to be double-clicked to view the entire time series for the pixel you clicked on. This tool is turned on by default when this page loads. All dates shown in the graph are the date of the end of the compositing period for that point in the graph. The input data include the cloud / cloud shadow free median value from that date to 4 weeks prior.`,
        "#tools-collapse-label",
        "right-end",
        [0, 2],
        "tools-tour-modal",
        "#tools-collapse-label-label",
      ],
      [
        `${mode} help`,
        `Various resources are available to help you use this tool, cite its use, and reach out to us to provide feedback or ask any questions.`,
        "#support-collapse-label",
        "right-end",
        [0, 1],
        "support-tour-modal",
        "#support-collapse-label-label",
      ],
    ];

    algalTourSteps.map((s) => addStep(s, algalTourSteps.length));
  } else if (mode === "TreeMap") {
    let treemapTourSteps = [
      [
        `Welcome to the ${mode} tour`,
        `This tour will walk you through how to use the ${mode}. <br>(If you'd like to learn how to use individual elements, ctrl+click to see the tour slide for a specific element.)`,
        "#title-banner",
        "right",
        [1, 2],
        "intro-tour-modal",
      ],

      [
        "Locate, Share, Search, Navigate",
        `<ul>
                            <li>Clicking the <i class="fa fa-map-marker"></i> icon will show your current location on the map if possible.</li>
                            <li>Clicking the <i class="fa fa-share-alt teal "></i> icon will create a unique link that contains your current view extent and parameter choices for easy sharing.</li>
                            <li>You can search for locations in the search window.</li>
                            <li>Clicking the <i class="fa fa-chevron-left teal "></i> <i class="fa fa-chevron-right teal "></i> will take you back or forward a view extent.</li>
                            </ul>`,
        "#search-share-div",
        "right",
        [0, 2],
        "search-tour-modal",
      ],

      [
        `${mode} Layers`,
        `Each TreeMap attribute is available for individual viewing. The <i>TreeMap ID</i> output is also available to provide a depiction of how model predictions tend to clump. Turn on and off ${mode} layers using the radio buttons on the left side of each layer. Opacity (transparency) can be adjusted with the slider on the right.`,
        "#layer-list-collapse-label",
        "right-end",
        [0, 2],
        "layer-list-tour-modal",
        "#layer-list-collapse-label-label",
      ],
      [
        `Exploration Tools`,
        `Tools are available to measure and chart map layers. The <i>Query Visible Map Layers</i> tool allows for any visible layer to be double-clicked to view the value of the pixel you clicked on. This tool is turned on by default when this page loads. Querying the <i>Raw TreeMap</i> layer will return all available attributes for that pixel.`,
        "#tools-collapse-label",
        "right-end",
        [0, 2],
        "tools-tour-modal",
        "#tools-collapse-label-label",
      ],
      [
        `TOOLS -> Measuring Tools -> Distance Measuring`,
        `<ul>
          <li>Activate the "Distance Measuring" tool.</li>
          <li>Once activated, click on the map to draw a line to measure distance.</li>
          <li>The drawn vertices can be moved by clicking and dragging. You can also adjust the midpoint of a drawn line by moving the faint grey point in the middle of a line.</li>
          <li>Press <kbd>ctrl+z</kbd> to undo the most recent point. Double-click, press <kbd>Delete</kbd>, or press <kbd>Backspace</kbd> to clear the line and start over.</li>
          <li>There are also buttons available under the tool in the left sidebar to undo and restart drawing.</li>
          <li>Units can be toggled between imperial and metric using the toggle switch.</li>
          <li>If the color of the line is hard to see, it can be changed with the color picker paintbrush under the tool in the left sidebar.</li>
        </ul>`,
        "#measure-distance-label",
        "right",
        [0, 2],
        "distance-measuring-tool-tour-modal",
        "#tools-collapse-label-label",
      ],

      [
        `TOOLS -> Measuring Tools -> Area Measuring`,
        `<ul>
          <li>Activate the "Area Measuring" tool</li>
          <li>Once activated, click on the map to draw polygons to measure area.</li>
          <li>Click on the map to measure an area, double-click to complete the polygon. <kbd>ctrl+z</kbd> will undo the most recently placed point, pressing <kbd>Delete</kbd> or <kbd>Backspace</kbd> will delete the entire polygon. The polygon can be adjusted by clicking and dragging mid-points and vertices.</li>
          <li>Buttons are available under the tool in the left sidebar to undo and restart drawing as well.</li>
          <li>Units can be toggled between imperial and metric using the toggle switch.</li>
          <li>If the color of the line is hard to see, it can be changed with the color picker paintbrush under the tool in the left sidebar.</li>
          <li>Multiple areas can be measured simultaneously by continuing to click after a polygon has been completed.</li>
        </ul>`,
        "#measure-area-label",
        "right",
        [0, 2],
        "area-measuring-tool-tour-modal",
        "#tools-collapse-label-label",
      ],
      [
        `TOOLS -> Pixel Tools -> Query Visible Map Layers`,
        `<ul>
          <li>Activate the "Query Visible Map Layers" tool.</li>
          <li>Once activated, anywhere you double-click will query the value of any visible layer.</li>
          <li>The values will appear in the <i>QUERY OUTPUTS</i> panel on the right.</li>
          <li>It can take some time to query all visible layers as the query is done on-the-fly within Google Earth Engine.</li>
          <li>To query the map again, double-click once more.</li>
        </ul>`,
        "#query-label",
        "right",
        [0, 2],
        "pixel-query-tool-tour-modal",
        "#query-label",
      ],

      [
        `TOOLS -> Area Tools`,
        `<ul>
      
          <li>You can summarize various layers using the <i>Area Tools</i>.</li>
          <li>Methods include summarizing by current map extent, a custom drawn area of interest, uploaded shapefile, kml, kmz, or geojson, or a pre-defined set of areas selected on the map.</li>
          <li>Any layer available for charting will then be charted.</li>
          
        </ul>`,
        "#area-tools-title",
        "right",
        [0, 2],
        "area-tool-tour-modal",
        "#tools-collapse-label-label",
      ],
      [
        `TOOLS -> Area Tools -> Area Tools Parameters`,
        `<ul>
          <li>Under this menu, you can select which layers to chart and the area units to use for any thematic (variables with discrete classes) variables.</li>
          <li>Any change in selected layers and/or units will automatically update charts.</li>
        </ul>`,
        "#area-chart-params-label>h5",
        "right",
        [0, 2],
        "area-tool-params-tour-modal",
        "#area-chart-params-label>h5",
      ],

      [
        `TOOLS -> Area Tools -> Map Extent Area`,
        `<ul>
      
          <li>Activate the "Map Extent Area" tool.</li>
          <li>Once activated, any time you move and/or change the zoom level on the map, that extent will be summarized for any of the selected layers above.</li>
          <li>The charts will appear in the <i>QUERY OUTPUTS</i> panel on the right.</li>
          <li>It can take some time to summarize all selected layers as the zonal summary is done on-the-fly within Google Earth Engine.</li>
       
        </ul>`,
        "#map-defined-area-chart-label",
        "right",
        [0, 2],
        "area-map-extent-tool-tour-modal",
        "#map-defined-area-chart-label",
      ],
      [
        `TOOLS -> Area Tools -> User-Defined Area`,
        `<ul>
      
          <li>Activate the "User-Defined Area" tool.</li>
          <li>Once activated, you can draw a custom area on the map, and optionally provide a name for your area.</li>
          <li>When finished drawing an area, click on the <button class="btn" style="margin-bottom: 0.5em!important;" title="Click to summarize across drawn polygons">Chart Selected Areas</button> button</li>
          <li>The charts will then appear in the <i>QUERY OUTPUTS</i> panel on the right.</li>
          <li>It can take some time to summarize all selected layers, as the zonal summary is done on-the-fly within Google Earth Engine.</li>
       
        </ul>`,
        "#user-defined-area-chart-label",
        "right",
        [0, 2],
        "area-user-defined-tool-tour-modal",
        "#user-defined-area-chart-label",
      ],
      [
        `TOOLS -> Area Tools -> Upload an Area`,
        `<ul>
          <li>Activate the "Upload an Area" tool.</li>
          <li>Once activated, click on the <kbd>Choose File</kbd> button to choose a file (zipped shapefile, geojson, kml, or kmz) to upload.</li>
          <li>A shapefile must have all of its associated files zipped into a .zip file.  Any file with a .geojson, .kml, or .kmz extension is also accepted.</li>
          <li>Extremely large files will fail to upload and/or chart.</li>
          <li>Large shapefiles (vectors > ~5000 vertices or file size > ~50 mb) will likely fail. If this occurs, try increasing the "Vertex Reduction Factor" (maintains every nth vertex. E.g. if set to 3, every third vertex will remain). If this still fails, please contact us to summarize across a large vector.</li>
          <li>Once the file is selected, click on the <button class="btn" style="margin-bottom: 0.5em!important;"  title="Click to summarize across chosen .zip shapefile, .kmz, .kml, or .geojson.">Chart across chosen file</button> button to ingest chosen file and create chart.</li>
          <li>Sometimes it can take some time upload the chosen file and summarize the area as it is done on-demand within Google Earth Engine.</li>
          <li>Selecting a very large area may not successfully run.</li>
        </ul>`,
        "#upload-area-chart-label",
        "right",
        [0, 2],
        "area-upload-area-tool-tour-modal",
        "#upload-area-chart-label",
      ],
      [
        `TOOLS -> Area Tools -> Select an Area on Map`,
        `<ul>
          <li>Activate the "Select an Area on Map" tool.</li>
          <li>This tool allows the summarizaton of ${mode} products across a selection of pre-defined areas.</li>
          <li>After activating the tool, select a layer and it will be displayed on the map interface.</li>
          <li>After the layer is loaded and displayed, it can be selected by clicking on it on the map.</li>
          <li>If the selected location intersects multiple polygons, multiple areas will be selected.</li>
          <li>The name of selected areas will appear in a list below the layers under "Selected area names:".</li>
          <li>Clicking on an area again or pressing the undo or trash button will deselect any selected areas.</li>
          <li>Every time an area is selected, background processing is being performed. Clicking on many areas at once may slow down the tool.</li>
          <li>A name for the selected area can be provided in the <input title="Provide a name for your chart. A default one will be provided if left blank." type="user-defined-area-name" class="form-control my-1" placeholder="Name your charting area" style="width:80%;"> input box. If no name is provided, the tool will automatically generate one.</li>
          <li>The "Simplify Area - Max Error" slider can be used to simplify areas that are selected by allowing for a specified maximum error in meters. This allows larger and/or more complicated areas to be summarized. This simplification is performed as an area is selected. The selected areas added to the map reflect the simplification. You will notice the differences are usually quite minimal. If an area failed to run, clear the current selection, increase the value on the slider, and reselect the area(s).</li>
          <li>Once all areas you would like to include are selected, press the <kbd>Chart Selected Areas</kbd> button at the bottom of the tool to summarize those areas and create a chart.</li>
          <li>Selecting a very large area may not successfully run.</li>
          <li>It can take some time to summarize all selected layers, as the zonal summary is done on-the-fly within Google Earth Engine.</li>
          
        </ul>`,
        "#select-area-interactive-chart-label",
        "right",
        [0, 2],
        "area-select-on-map-tool-tour-modal",
        "#select-area-interactive-chart-label",
      ],
      [
        `Query Outputs`,
        `When any of the <i>Pixel Tools or Area Tools</i> are on (on by default when the page is loaded), the outputs will be shown here.`,
        "#chart-collapse-label",
        "right-end",
        [0, 2],
        "chart-tour-modal",
        "#chart-collapse-label-label",
      ],
      [
        `Visible layer legends`,
        `Any visible layer will have a legend shown here. `,
        "#legend-collapse-label",
        "right-end",
        [0, 2],
        "legend-tour-modal",
        "#legend-collapse-label-label",
      ],
      [
        `Download CONUS-Wide TreeMap Data`,
        `You can download individual TreeMap attribute images or the original Research Dataset (RDS) here for your own analysis for all CONUS. You can select one or many individual attributes at a time using <kbd>ctrl</kbd> or <kbd>shift</kbd> to select more than one item at a time.`,
        "#treemap-conus-download-header",
        "right-end",
        [0, 2],
        "download-tour-modal",
        "#download-collapse-label-label",
      ],

      [
        `Clip and Download Data`,
        `<ul>
          <li>You can also download individual TreeMap attribute images or the original Research Dataset (TreeMap_ID) over an area of your choosing. This avoids downloading all CONUS for a given attribute, but data do not have full metadata or colors/symbolizing.</li>
        </ul>`,
        "#data-clipping-header",
        "right",
        [0, 2],
        "download-intro-tour-modal",
        "#download-collapse-label-label",
      ],
      [
        `Choose What to Export`,
        `<ul>
          <li>You can opt to download any attribute or the original dataset (TreeMap_ID).</li>
          <li>You can select or de-select any layer for exporting by clicking on the round button on the left of each layer</li>
          <li>Each layer is given a default name. You can change this name to any name you'd like.</li>
          
        </ul>`,
        "#export-list-container>h5",
        "right",
        [0, 2],
        "download-layer-selection-tour-modal",
        "#download-collapse-label-label",
      ],
      [
        `Select Area to Download`,
        `<ul>
          <li>You must select and area to download using the  <button class="btn"><i class="pr-1 fa fa-pencil" ></i>Draw area to Download</button> button.</li>
          <li>After pressing this button, draw a polygon on the map</li>
          <li>You can remove vertices using the <i class="pr-1 fa fa-undo" ></i> button or delete your current polygon using the <i class="pr-1 fa fa-trash" ></i> button</li>
        </ul>`,
        "#export-area-drawing-div",
        "right",
        [0, 2],
        "download-start-button-tour-modal",
        "#download-collapse-label-label",
      ],
      [
        `Start and Cancel Exports`,
        `<ul>
          <li>You can start any selected export layer (above) using the <button class="btn"><i class="pr-1 fa fa-cloud-download" ></i>Export</button> button.</li>
          <li>You can cancel all active exports (shown below) using the <button class="btn"><i class="pr-1 fa fa-close" ></i>Cancel All Exports</button> button.</li>
          <li>Once your exports are successfully started, a popup will be shown outlining what exports were started. Shortly after, the task list below will reflect the recently started exports and their status.</li>
        </ul>`,
        "#export-button-div",
        "right",
        [0, 2],
        "download-start-button-tour-modal",
        "#download-collapse-label-label",
      ],
      [
        `Track Exports`,
        `<ul>
          <li>All previous and current exports are shown here.</li>
          <li>From left to right, each export's name, total run time, type, and download button is provided.</li>
          <li>Any successfully completed export within the past 10 days, from your instance of the <i>TreeMap Data Explorer</i>, is provided here. You can re-download the output using the <i class="fa fa-cloud-download teal"></i> button on the right of each task.</li>
          <li>Currently active exports are shown with a pulsing teal color.</li>
          <li>You can cancel an individual export task by clicking the <i class="fa fa-close teal"></i> icon on the right of the active export.</li>
          <li>Once the active export successfully finishes, you will be prompted to download all files. For shapefiles, this will be a total of 6 files, while other formats and image exports will be a single download.</li>
          <li>If you have a popup blocker, a message box is also provided with links to download all completed exports.</li>
          <li>Sometimes very large image exports are broken into tiles. In this instance, multiple image downloads will be provided.</li>
          <li>If your instance of <i>TreeMap Data Explorer</i> restarts before an export successfully finishes, that export will be tracked the next time you open <i>TreeMap Data Explorer</i> in the same browser. It will then be tracked and you will be prompted upon its successful completion.</li>
        </ul>`,
        "#export-tracking-rows",
        "right",
        [0, 2],
        "download-start-button-tour-modal",
        "#download-collapse-label-label",
      ],
      [
        `Other resources`,
        `Here you will find additional TreeMap documentation, credits/acknowledgments, and how to cite this page.`,
        "#support-collapse-label",
        "right-end",
        [0, 1],
        "support-tour-modal",
        "#support-collapse-label-label",
      ],
    ];

    treemapTourSteps.map((s) => addStep(s, treemapTourSteps.length));
  } else if (mode === "sequoia-view") {
    let sequoiaTourSteps = [
      [
        `Welcome to the Giant Sequoia Viewer tour`,
        `This tour will walk you through how to use the Giant Sequoia Viewer. <br>(If you'd like to learn how to use individual elements or revisit an element after exiting the tour, you can ctrl+click on an element to see its tour slide.)`,
        "#title-banner",
        "right",
        [1, 2],
        "intro-tour-modal",
      ],

      [
        "Locate, Share, Search, Navigate",
        `<ul>
                            <li>Clicking the <i class="fa fa-map-marker"></i> icon will show your current location on the map if possible.</li>
                            <li>Clicking the <i class="fa fa-share-alt teal "></i> icon will create a unique link that contains your current view extent and parameter choices for easy sharing.</li>
                            <li>You can search for locations in the search window.</li>
                            <li>Clicking the <i class="fa fa-chevron-left teal "></i> <i class="fa fa-chevron-right teal "></i> will take you back or forward a view extent.</li>
                            </ul>`,
        "#search-share-div",
        "right",
        [0, 2],
        "search-tour-modal",
      ],
      [
        "Adjusting the parameters",
        `Date parameters can be adjusted to select different baseline years, target year, and the window of days within those years to include Sentinel-2 data from. Clicking the <i class="fa fa-share-alt teal "></i> icon above will create a unique link that contains your current view extent and all parameter choices for easy sharing.`,
        "#parameters-collapse-label",
        "right",
        [0, 2],
        "params-tour-modal",
        "#parameters-collapse-label-label",
      ],
      [
        "Advanced Parameters",
        `Several advanced parameters are available to adjust to help with change detection and data visualization. These parameters are retained in the unique link that is created when you click the <i class="fa fa-share-alt teal "></i> icon above.`,
        "#advanced-params-label",
        "right",
        [0, 2],
        "advanced-params-tour-modal",
        "#advanced-params-label>h5",
      ],
      [
        `MAP LAYERS`,
        `Monitoring site locations, image composites used to flag potentially declining sites, the change/not-change layers, and LCMS tree mask are available for viewing. After submitting date parameters for an analysis, any monitoring site locations that may be flagged for potential decline during that period will appear in a separate layer. Additionally, any monitoring site locations that may be flagged for potential decline during that period will populate a density (of flagged trees in proximity to one another) heatmap layer. Turn on and off layers using the radio buttons on the left side of each layer. Opacity (transparency) can be adjusted with the slider on the right.`,
        "#layer-list-collapse-label",
        "right-end",
        [0, 2],
        "layer-list-tour-modal",
        "#layer-list-collapse-label-label",
      ],
      [
        "REFERENCE DATA",
        `Several layers of Giant Sequoia tree data are available to add context to the analysis. Turning layers on/off and adjusting opacity are the same as for the main <i>MAP LAYERS</i>.`,
        "#reference-layer-list-collapse-label",
        "right-end",
        [0, 2],
        "reference-layer-list-tour-modal",
        "#reference-layer-list-collapse-label-label",
      ],
      [
        `MONITORING SITES`,
        `Named Giant Sequoias are flagged if they are found to display signs of potential mortality. Using this table and the accompanying imagery data in the <i>MAP LAYERS</i> in the left sidebar can help determine whether a tree merits further investigation.<br>Double-clicking a row in this table will zoom to that tree location on the map, and hovering on a row will highlight that tree. <br><br>After running an analysis period that flags trees for potential loss, the flagged monitoring sites will be sorted to the top of this table. While the table is scrollable, for easiest viewing of all parameters in the table, you can copy or download the entire table. `,
        "#table-collapse-label",
        "right-end",
        [0, 2],
        "table-tour-modal",
        "#table-collapse-label-label",
      ],
      [
        `Exploration Tools`,
        `Tools are available to measure, query, and add your own map layers. The <i>Query Visible Map Layers</i> tool allows for any visible layer to be double-clicked to view the value of the pixel you clicked on. This tool is turned on by default when this page loads. The <i>Upload an Area</i> tool allows you to add your own small zipped shapefile (large shapefiles will likely fail), .kmz, .kml, or geoJSON file to the viewer. Your added layer(s) will be added to the Reference Data layers list.`,
        "#tools-collapse-label",
        "right-end",
        [0, 1],
        "tools-tour-modal",
        "#tools-collapse-label-label",
      ],
    ];

    sequoiaTourSteps.map((s) => addStep(s, sequoiaTourSteps.length));
  } else if (mode === "HiForm-BMP") {
    let hiformTourSteps = [
      [
        `Welcome to the HiForm Timber Harvest BMP Viewer`,
        `This tour will walk you through how to use the Timber Harvest mapping application. See the Tutorial for more detailed information.`,
        "#title-banner",
        "right",
        [1, 2],
        "intro-tour-modal",
      ],

      [
        "Share, Search, Navigate",
        `<ul>
                            <li>Clicking the <i class="fa fa-share-alt teal "></i> icon will create a unique link that contains your current view extent, selected area, dates, and parameter choices for easy sharing.</li>
                            <li>You can search and navigate to a location or county using the ‘Search Places’ control window.</li>
                            <li>Clicking the <i class="fa fa-chevron-left teal "></i> <i class="fa fa-chevron-right teal "></i> will take you back or forward a view extent.</li>
                            </ul>`,
        "#search-share-div",
        "right",
        [0, 2],
        "search-tour-modal",
      ],
      [
        "Selecting an Area",
        `<ul>
          <li>Choose a county to run <b>HiForm-BMP</b> over using dropdown selection menus or by clicking on the map.</li>
          <li>When clicking on the map, there will be a small delay between when you click and when the county draws on the map.</li>
          <li>Currently, only one county can be selected at a time. Selecting a county after one is already selected with replace the selected county with the newly selected county.</li>
        </ul>`,
        "#select-aoi-label",
        "right",
        [0, 2],
        "aoi-params-tour-modal",
        "#select-aoi-label-label",
      ],
      [
        "Adjusting the date parameters",
        `<ul>
          <li>Date parameters can be adjusted to select dates for pre and post depending on the specific change you are targeting.</li>
          <li>For example, a popular way to quickly get a quality 1-year change product, is to use a time period starting a month prior to the current date, ending near the current date.</li>
          <li>When you select the post date, a corresponding date either 28 days from the selected date or two days prior to the present date will automatically be selected</li>
          <li>Then choose <kbd>1 Year</kbd> (default) to automatically choose a year prior for the <kbd>Pre Date Range</kbd></li>
          <li>You can also choose to provide a <kbd>Custom</kbd> date range for the <kbd>Pre Date Range</kbd>. When you select this option, another set of date menus will appear.</li>
          <li>If either the pre or post dates are too cloudy (will be shown as holes in the resulting maps), expand the date range(s).</li>
          <li><b>WARNING</b> - Pre and post dates cannot overlap. While you can select overlapping dates, when you click the <kbd>Process HiForm BMP</kbd> button, it will present a warning message and the process will not run.
        </ul>`,
        "#pre-post-dates-label",
        "right",
        [0, 2],
        "date-params-tour-modal",
        "#pre-post-dates-label-label",
      ],
      [
        "Advanced Parameters",
        `<ul>
            <li>Choose the image atmospheric correction method</li>
            <li>“TOA” (Top-of-Atmosphere) uses Sentinel-2 Level 1C top of atmosphere reflectance data. This can result in artifacts due to haze, but avoids terrain-correction related artifacts.</li>
            <li>“SR” (Surface Reflectance) uses Sentinel-2 Level 2A surface reflectance data. These data can minimize the impact of haze and terain shadows. Selecting this correction type can over-correct some terrain as well as non-terrestrial surfaces (e.g. snow/ice and water) </li>
          </ul>`,
        "#advanced-params-label",
        "right",
        [0, 2],
        "advanced-params-tour-modal",
        "#advanced-params-label>h5",
      ],
      [
        "Run HiForm BMP",
        `<ul>
            <li>Once you have selected a county and valid dates, this button will be activated.</li>
            <li>You can then run the <i>HiForm BMP</i> process by clicking on the <kbd>Process HiForm BMP</kbd> button</li>
            <li>Often you will get results you feel can be improved. You can change any parameter (county, dates, etc) and re-click this button to rerun the entire process</li>
          </ul>`,
        "#process-button-div",
        "right-end",
        [0, 2],
        "run-hiform-button-tour-modal",
        "#pre-post-dates-label-label",
      ],
      [
        `View  <i>HiForm</i>  BMP Results `,
        `<ul>
            <li>Starting at the bottom are the ‘Pre natural color’ image composite (baseline) and the ‘Post natural color’ image composite (view both for the presence of clouds).</li>
            <li>Next are the NDVI continuous-change rasters in both an ‘all-lands’ and ‘forest-only’ version using 2021 NLCD.</li>
            <li>Lastly are two polygons layers representing potential silvicultural activities, they are defined by the intensity of their negative NDVI decline.</li>
            <li>Layers can be turned on/off by the radio buttons on the left, and their transparency/opacity adjusted by the sliders on the right.</li>
            <li>Selecting the “Reset HiForm Results” control reconfigures the application to be run again.</li>
          </ul>
        `,
        "#layer-list-collapse-label",
        "right",
        [0, 2],
        "layer-list-tour-modal",
        "#layer-list-collapse-label-label",
      ],
      [
        "BMP Related Data Layers",
        `<ul>
          <li>These layers are to be used by themselves or in conjunction with the output polygon results to identify local topographic and hydrologic conditions. This can help assess a sites potential water related issues.
          </li>
        </ul>`,
        "#related-layers-label",
        "right",
        [0, 2],
        "reference-layer-list-tour-modal",
        "#related-layers-label-label",
      ],
      [
        `Exploration Tools`,
        `<ul>
          <li>Tools are available to measure and query map layers.</li>
          <li>These tools can be useful for gaining further insights about the data presented.</li>
        </ul>`,
        "#tools-collapse-label",
        "right",
        [0, 2],
        "tools-tour-modal",
        "#tools-collapse-label-label",
      ],
      [
        `TOOLS -> Measuring Tools -> Distance Measuring`,
        `<ul>
          <li>Activate the "Distance Measuring" tool.</li>
          <li>Once activated, click on the map to draw a line to measure distance.</li>
          <li>The drawn vertices can be moved by clicking and dragging. You can also adjust the midpoint of a drawn line by moving the faint grey point in the middle of a line.</li>
          <li>Press <kbd>ctrl+z</kbd> to undo the most recent point. Double-click, press <kbd>Delete</kbd>, or press <kbd>Backspace</kbd> to clear the line and start over.</li>
          <li>There are also buttons available under the tool in the left sidebar to undo and restart drawing.</li>
          <li>Units can be toggled between imperial and metric using the toggle switch.</li>
          <li>If the color of the line is hard to see, it can be changed with the color picker paintbrush under the tool in the left sidebar.</li>
        </ul>`,
        "#measure-distance-label",
        "right",
        [0, 2],
        "distance-measuring-tool-tour-modal",
        "#tools-collapse-label-label",
      ],

      [
        `TOOLS -> Measuring Tools -> Area Measuring`,
        `<ul>
          <li>Activate the "Area Measuring" tool</li>
          <li>Once activated, click on the map to draw polygons to measure area.</li>
          <li>Click on the map to measure an area, double-click to complete the polygon. <kbd>ctrl+z</kbd> will undo the most recently placed point, pressing <kbd>Delete</kbd> or <kbd>Backspace</kbd> will delete the entire polygon. The polygon can be adjusted by clicking and dragging mid-points and vertices.</li>
          <li>Buttons are available under the tool in the left sidebar to undo and restart drawing as well.</li>
          <li>Units can be toggled between imperial and metric using the toggle switch.</li>
          <li>If the color of the line is hard to see, it can be changed with the color picker paintbrush under the tool in the left sidebar.</li>
          <li>Multiple areas can be measured simultaneously by continuing to click after a polygon has been completed.</li>
        </ul>`,
        "#measure-area-label",
        "right",
        [0, 2],
        "area-measuring-tool-tour-modal",
        "#tools-collapse-label-label",
      ],
      [
        `TOOLS -> Pixel Tools -> Query Visible Map Layers`,
        `<ul>
          <li>This tool will automatically be turned on when the <kbd>Process HiForm BMP</kbd> button is clicked</li>
          <li>Activate the "Query Visible Map Layers" tool.</li>
          <li>Once activated, anywhere you double-click will query the value of any visible layer.</li>
          <li>The values will appear in the <i>QUERY OUTPUTS</i> panel on the right.</li>
          <li>It can take some time to query all visible layers as the query is done on-the-fly within Google Earth Engine.</li>
          <li>To query the map again, double-click once more.</li>
        </ul>`,
        "#query-label",
        "right",
        [0, 2],
        "pixel-query-tool-tour-modal",
        "#tools-collapse-label-label",
      ],
      [
        `Download Data`,
        `<ul>
          <li>After you press the <kbd>Process HiForm BMP</kbd> button and run the HiForm process, the resulting change data will be available for downloading.</li>
        </ul>`,
        "#download-collapse-label",
        "right",
        [0, 2],
        "download-intro-tour-modal",
        "#download-collapse-label-label",
      ],
      [
        `Choose What to Export`,
        `<ul>
          <li>You can opt to download results pertaining to (1) the Severe NDVI Change polygons as an ESRI shapefile (or any other vector format of choice) which are indicative of timber harvest sites, (2) the Moderate NDVI Change polygons, which can be indicative of less severe thinning operations, or (3) the post-disturbance Sentinel-2 natural color composite.</li>
          <li>You can select or de-select any layer for exporting by clicking on the round button on the left of each layer</li>
          <li>Each layer is given a default name. You can change this name to any name you'd like.</li>
          <li>On the right of each image export layer is a number. This is the spatial resolution in meters for that image export. You can change it if you'd like</li>
          <li>On the right of each vector export layer is a dropdown. This is the format the vector will be exported in. You can change it to any of these options.</li>
        </ul>`,
        "#export-list-container>h5",
        "right",
        [0, 2],
        "download-layer-selection-tour-modal",
        "#download-collapse-label-label",
      ],
      [
        `Start and Cancel Exports`,
        `<ul>
          <li>You can start any selected export layer (above) using the <button class="btn"><i class="pr-1 fa fa-cloud-download" ></i>Export</button> button.</li>
          <li>You can cancel all active exports (shown below) using the <button class="btn"><i class="pr-1 fa fa-close" ></i>Cancel All Exports</button> button.</li>
          <li>Once your exports are successfully started, a popup will be shown outlining what exports were started. Shortly after, the task list below will reflect the recently started exports and their status.</li>
        </ul>`,
        "#export-button-div",
        "right",
        [0, 2],
        "download-start-button-tour-modal",
        "#download-collapse-label-label",
      ],
      [
        `Track Exports`,
        `<ul>
          <li>All previous and current exports are shown here (possibly hidden if no exports are available).</li>
          <li>From left to right, each export's name, total run time, type, and download button is provided.</li>
          <li>Any successfully completed export within the past 10 days, from your instance of HiForm-BMP, is provided here. You can re-download the output using the <i class="fa fa-cloud-download teal"></i> button on the right of each task.</li>
          <li>Currently active exports are shown with a pulsing teal color.</li>
          <li>You can cancel an individual export task by clicking the <i class="fa fa-close teal"></i> icon on the right of the active export.</li>
          <li>Once the active export successfully finishes, you will be prompted to download all files. For shapefiles, this will be a total of 6 files, while other formats and image exports will be a single download.</li>
          <li>If you have a popup blocker, a message box is also provided with links to download all completed exports.</li>
          <li>Sometimes very large image exports are broken into tiles. In this instance, multiple image downloads will be provided.</li>
          <li>If your instance of HiForm-BMP restarts before an export successfully finishes, that export will be tracked the next time you open HiForm-BMP in the same browser. It will then be tracked and you will be prompted upon its successful completion.</li>
        </ul>`,
        "#export-tracking-rows",
        "right",
        [0, 2],
        "download-start-button-tour-modal",
        "#download-collapse-label-label",
      ],
      [
        `Other resources`,
        `Here you will find additional HiForm BMP documentation, credits/acknowledgments, contacts, and how to cite this page.`,
        "#support-collapse-label",
        "right-end",
        [0, 1],
        "support-tour-modal",
        "#support-collapse-label-label",
      ],
    ];

    hiformTourSteps.map((s) => addStep(s, hiformTourSteps.length));
  }
}
