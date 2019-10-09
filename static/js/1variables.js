//Load global variables
var lowerThresholdDecline = 0.3;
var upperThresholdDecline = 1.0;
var lowerThresholdRecovery = 0.3;
var upperThresholdRecovery = 1.0;
var studyAreaName = 'BTNF';
var startYear = 1985;
var endYear = 2018;
// var applyTreeMask = true;
// var summaryMethod = 'recent';
var whichIndex = 'NBR';
// var viewBeta = false;
// var fc;//Feature collection container for drawing on map and submitting tasks with user-defined vectors
var toExport;
var exportArea;
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

var chartIncludeDate = true;var chartCollection;var areaChartCollections = {};var whichAreaChartCollection;var queryClassDict = {};var exportImage;var exportVizParams;var eeBoundsPoly;var shapesMap;
var mouseLat;var mouseLng; var area = 0;var distance = 0;var areaPolygon; var markerList = [];var distancePolylineT;var clickCoords;var distanceUpdater;
var updateArea;var updateDistance;var areaPolygonObj = {};var mapHammer;var chartMTBS;

var distancePolyline;
var distancePolylineOptions = {
              strokeColor: '#FF0',
              icons: [{
                icon:  {
              path: 'M 0,-1 0,1',
              strokeOpacity: 1,
              scale: 4
            },
                offset: '0',
                repeat: '20px'
              }],
              strokeOpacity: 0,
              strokeWeight: 3,
              draggable: true,
              editable: true,
              geodesic:true
            };

var polyNumber = 1;
var polyOn = false;


var areaPolygonOptions = {
              strokeColor:'#FF0',
                fillOpacity:0.2,
              strokeOpacity: 1,
              strokeWeight: 3,
              draggable: true,
              editable: true,
              geodesic:true,
              polyNumber: polyNumber
            
            };

var userDefinedI = 1;

var udpOptions = {
          strokeColor:'#FF0',
            fillOpacity:0.2,
          strokeOpacity: 1,
          strokeWeight: 3,
          draggable: true,
          editable: true,
          geodesic:true,
          polyNumber: 1
        };
var exportAreaPolylineOptions = {
          strokeColor:'#FF0',
            fillOpacity:0.2,
          strokeOpacity: 1,
          strokeWeight: 3,
          draggable: true,
          editable: true,
          geodesic:true,
          polyNumber: 1
        };
var exportAreaPolygonOptions = {
          strokeColor:'#FF0',
            fillOpacity:0.2,
          strokeOpacity: 1,
          strokeWeight: 3,
          draggable: false,
          editable: false,
          geodesic:true,
          polyNumber: 1
        };
var exportImageDict = {};
var canExport = true;
var featureObj = {};var geeRunID;var outstandingGEERequests = 0;

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

/////////////////////////////////////////////////////
//Taken from: https://stackoverflow.com/questions/1669190/find-the-min-max-element-of-an-array-in-javascript
Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};
/////////////////////////////////////////////////////
//Taken from: https://stackoverflow.com/questions/2116558/fastest-method-to-replace-all-instances-of-a-character-in-a-string
String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 