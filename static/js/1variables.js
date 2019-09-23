//Load global variables
var lowerThresholdDecline = 0.3;
var upperThresholdDecline = 1.0;
var lowerThresholdRecovery = 0.3;
var upperThresholdRecovery = 1.0;
var studyAreaName = 'BTNF';
var startYear = 1985;
var endYear = 2017;

var fc;//Feature collection container for drawing on map and submitting tasks with user-defined vectors
var toExport;
var taskCount = 0;//Keeping track of the number of export tasks each session submitted
var canAddToMap = true;//Set whether addToMap function can add to the map
var canExport = false;//Set whether exports are allowed
var colorRampIndex = 1;
var NEXT_LAYER_ID = 1;var layerChildID = 0;
var layerCount = 0;var refreshNumber = 0;
var uri;var uriName;var csvName;var dataTable;var chartOptions;var infowindow
var outputURL;
var chartType = 'LineChart';//Options LineChart, BarChart, ScatterChart, Histogram, AreaChart, Table
var chartTypes = ['LineChart','Table'];//Options LineChart, BarChart, ScatterChart, Histogram, AreaChart, Table
var tableConverter = null;
var groundOverlayOn = false;

var chartIncludeDate = true;var chartCollection;var areaChartCollection;var queryClassDict = {};var exportImage;var exportVizParams;var eeBoundsPoly;var shapesMap;
var mouseLat;var mouseLng;var distancePolyline; var area = 0;var distance = 0;var areaPolygon; var markerList = [];var distancePolylineT;var clickCoords;var distanceUpdater;
var updateArea;var updateDistance;var areaPolygonObj = {};var mapHammer;


var plotDictID = 1;
var exportID = 1;

// var metricOrImperial = 'metric';
var unitMultiplierDict = {imperial:
{area:[10.7639,0.000247105],distance:[3.28084,0.000621371]},
metric:
{area:[1,0.0001],distance:[1,0.001]}};

var unitNameDict = {imperial:
{area:['ft<sup>2</sup>','acres'],distance:['ft','miles']},
metric:
{area:['m<sup>2</sup>','hectares'],distance:['m','km']}};


//Chart variables
var plotRadius = 15;
var plotScale = 30;
var areaGeoJson;
var areaChartingCount = 0;
var center;var globalChartValues;

var chartTextColor = '#FFF';
var cssClassNames = {
'headerRow': 'googleChartTable',
'tableRow': 'googleChartTable',
'oddTableRow': 'googleChartTable',
'selectedTableRow': 'googleChartTable',
'hoverTableRow': 'googleChartTable',
'headerCell': 'googleChartTable',
'tableCell': 'googleChartTable',
'rowNumberCell': 'googleChartTable'};

var expandedWidth = $(window).width()/3;
var expandedHeight = $(window).height()/2;
var chartOptions = {
  title: uriName,
  titleTextStyle: {
	color: chartTextColor
},
  pointSize: 3,
  legend: { position: 'bottom',textStyle:{color: chartTextColor,fontSize:'12'} },
  dataOpacity: 1,
 hAxis:{title:'Year',
 				titleTextStyle:{color: chartTextColor},
				textStyle:{color: chartTextColor}
			},
	vAxis:{textStyle:{color: chartTextColor},titleTextStyle:{color: chartTextColor}},
	legend: {
        textStyle: {
            color: chartTextColor
        }
    },

   // width: 800, 
   height:250,
   bar: {groupWidth: "100%"},
   explorer: {  actions: [] },
    chartArea: {left:'5%',top:'10%',width:'75%',height:'70%'},
    legendArea:{width:'20%'},
   backgroundColor: { fill: "#1B1716" }

};
var tableOptions = {
	// width: 800, 
   // height:350,
    'allowHtml': true,
    'cssClassNames': cssClassNames};

// function updateProgress(pct) {
//     var elem = document.getElementById("Bar"); 
//     elem.style.width = pct + '%'; 
        
// }






var mapOptions = {
	  center: null,
	  zoom: null,
	  minZoom: 2,
    // gestureHandling: 'greedy',
    disableDoubleClickZoom: true,
      // maxZoom: 15,
      mapTypeId: google.maps.MapTypeId.HYBRID,
	  streetViewControl: true,
    fullscreenControl: false,
    mapTypeControlOptions :{position: google.maps.ControlPosition.TOP_RIGHT},
    // fullscreenControlOptions:{position: google.maps.ControlPosition.RIGHT_TOP},
    streetViewControlOptions:{position: google.maps.ControlPosition.RIGHT_TOP},

    zoomControlOptions:{position: google.maps.ControlPosition.RIGHT_TOP},
    tilt:0,
    controlSize: 25,

    // mapTypeId: "OSM",
    // mapTypeControlOptions: {
    //                 mapTypeIds: mapTypeIds,
    //                 // style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
    //                 // position: google.maps.ControlPosition.TOP_CENTER
    //             },
                scaleControl: true,
                clickableIcons:false

	};

var authProxyAPIURL = "https://rcr-ee-proxy.herokuapp.com/api";
var geeAPIURL = "https://earthengine.googleapis.com/map";
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