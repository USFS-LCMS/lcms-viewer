var widgetsOn = true;
var layersOn = true;
var legendOn = true;
var chartingOn = false;
var distanceOn = false;
var areaOn = false;
var drawing = false;
var plotsOn = true;
var helpOn = false;
var queryOn = false;
var areaChartingOn = false;
var studyAreaName = 'BTNF'
function toggleHelp(){
  if (helpOn) {
    $("#help-window").slideUp();
    

    helpOn = false;
  } else {
    $("#help-window").slideDown();
   

    helpOn = true;
  }
}
function toggleWidgets() {
  if (widgetsOn) {
    $("#tool-area").slideUp();
    $("#shape-edit-container").slideUp();
    $("#export-container").slideUp();
    // $("#parameters-tools-layers").css('min-width','25%');

    widgetsOn = false;
  } else {
    $("#tool-area").slideDown();
    $("#shape-edit-container").slideDown();
    $("#export-container").slideDown();
    // $("#parameters-tools-layers").css('min-width','35%');

    widgetsOn = true;
  }
}

  function toggleLayers() {
  if (layersOn) {
    $("#layers-container").slideUp();
    

    layersOn = false;
  } else {
    $("#layers-container").slideDown();

    layersOn = true;
  }
}
function togglePlotList() {
  if (plotsOn) {
    $("#plot-container").slideUp();
    

    plotsOn = false;
  } else {
    $("#plot-container").slideDown();

    plotsOn = true;
  }
}

function toggleLegend() {
  if (legendOn) {

    $("#legend").slideUp();
    legendOn = false;
  } else {
    $("#legend").slideDown();

    legendOn = true;
  }
}

function toggleCharting() {
  if (chartingOn) {
    stopCharting();
    chartingOn = false;
  } else {
    startPixelChartCollection();
    chartingOn = true;
  }
}

function toggleDistance() {
  if (distanceOn) {
    stopDistance();
    distanceOn = false;
  } else {
    startDistance();
    distanceOn = true;
  }
}

function toggleArea() {
  if (areaOn) {
    stopArea();
    map.setOptions({draggableCursor:'hand'});
    areaOn = false;
  } else {
    startArea();
    areaOn = true;
  }
}
function toggleQuery(){
  if(queryOn){
    queryOn = false;
    stopQuery();
  }else{
    queryOn = true;
    startQuery();
  }
}
function toggleAreaCharting(){
  console.log('toggling area charting')
  if(areaChartingOn){
    areaChartingOn = false;
    stopAreaCharting();
  }else{
    areaChartingOn = true;

    startAreaCharting();
  }
}
function toggleDrawing() {
  if (drawing) {
    // shapesMap = undefined;
    drawingManager.setMap(null);
    drawing = false;
  } else {
    console.log('shapesmap');
    console.log(shapesMap)
    if (shapesMap != undefined) {
      drawingManager.setMap(map);
    } else {
      shapesMap = new ShapesMap(
        map,
        document.getElementById("delete-button"),
        document.getElementById("clear-button"),
        document.getElementById("process-button"),
        document.getElementById("export-button"),
        document.getElementById("toggle-drawing-button"),
        document.getElementById("console"));
    }
    drawing = true;
  }
}


function toggleRadio(thisValue) {
 
  if (thisValue == 'charting') {
    // turnOnSidebar('left')
    if (distanceOn) {
      toggleDistance()
    };
    if (areaOn) {
      toggleArea()
    };
    if (drawing) {
      toggleDrawing()
    };
    if (queryOn) {
      toggleQuery()
    };
    if (areaChartingOn) {
      toggleAreaCharting()
    };
    if (!chartingOn) {
      toggleCharting()
    };
  } else if (thisValue == 'distance') {
    // turnOnSidebar('left')
    if (areaOn) {
      toggleArea()
    };
    if (chartingOn) {
      toggleCharting()
    };
    if (drawing) {
      toggleDrawing()
    };
    if (queryOn) {
      toggleQuery()
    };
    if (areaChartingOn) {
      toggleAreaCharting()
    };
    if (!distanceOn) {
      toggleDistance()
    };
  } 
  else if (thisValue == 'query') {
    // turnOnSidebar('left')
    if (areaOn) {
      toggleArea()
    };
    if (chartingOn) {
      toggleCharting()
    };
    if (drawing) {
      toggleDrawing()
    };
    if (distanceOn) {
      toggleDistance()
    };
    if (areaChartingOn) {
      toggleAreaCharting()
    };
    if (!queryOn) {
      toggleQuery()
    };
  }else if (thisValue == 'drawing') {
    if (areaOn) {
      toggleArea()
    };
    if (chartingOn) {
      toggleCharting()
    };
    if (distanceOn) {
      toggleDistance()
    };
    if (queryOn) {
      toggleQuery()
    };
    if (areaChartingOn) {
      toggleAreaCharting()
    };
    if (!drawing) {
      toggleDrawing()
    };
  } else if (thisValue == 'area') {
    // turnOnSidebar('left')
    if (drawing) {
      toggleDrawing()
    };
    if (chartingOn) {
      toggleCharting()
    };
    if (distanceOn) {
      toggleDistance()
    };
    if (queryOn) {
      toggleQuery()
    };
    if (areaChartingOn) {
      toggleAreaCharting()
    };
    if (!areaOn) {
      toggleArea()
    };
  } else if (thisValue == 'areaCharting') {
    // turnOnSidebar('left')
    if (drawing) {
      toggleDrawing()
    };
    if (chartingOn) {
      toggleCharting()
    };
    if (distanceOn) {
      toggleDistance()
    };
    if (queryOn) {
      toggleQuery()
    };
    if (areaOn) {
      toggleArea()
    };
    if (!areaChartingOn) {
      toggleAreaCharting()
    };
    
  } else if (thisValue == 'none') {
    // turnOffSidebar('right')
    if (areaOn) {
      toggleArea()
    };
    if (chartingOn) {
      toggleCharting()
    };
    if (drawing) {
      toggleDrawing()
    };
    if (queryOn) {
      toggleQuery()
    };
    if (areaChartingOn) {
      toggleAreaCharting()
    };
    if (distanceOn) {
      toggleDistance()
    };
    stopCharting();
  }
}


        

       


var dontShowAgain;
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
$('#title-banner').fitText(1.2);
$('#study-area-label').fitText(1.3);








