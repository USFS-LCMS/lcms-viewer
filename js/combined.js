/*List global variables in this script for use throughout the viewers*/
var urlParamsObj = {};
var pageUrl = document.URL;
var tinyURL = '';
var urlParams = {};

function setUrl(url){
  var obj = { Title: 'test', Url: url };
  history.pushState(obj, obj.Title, obj.Url);
}
function baseUrl(){
  return window.location.protocol + "//" + window.location.host  + window.location.pathname
}
function eliminateSearchUrl(){
  setUrl(baseUrl())
}
function updatePageUrl(){
  pageUrl = window.location.protocol + "//" + window.location.host  + window.location.pathname + constructUrlSearch();
}
// new Proxy(urlParamsObj, {
//   set: function (target, key, value) {
//       // console.log(`${key} set to ${value}`);
//       //
//       target[key] = value;
//       // console.log(urlParams);
//        // var deepLink = [window.location.pathname,constructUrlSearch()].join('');
//        pageUrl = window.location.protocol + "//" + window.location.host  + window.location.pathname + constructUrlSearch()
//             // console.log(deepLink)
//             // var obj = { Title: 'test', Url: deepLink };
//             // history.pushState(obj, obj.Title, obj.Url);
//             // pageUrl = document.URL;
//             // console.log(pageUrl)
//       return true;
//   }
// }); 
function TweetThis(preURL,postURL,openInNewTab,showMessageBox){
    updatePageUrl();
    if(openInNewTab === undefined || openInNewTab === null){
        openInNewTab = false;
    };
    if(showMessageBox === undefined || showMessageBox === null){
        showMessageBox = true;
    };
    if(preURL === undefined || preURL === null){
        preURL = '';
    };
    if(postURL === undefined || postURL === null){
        postURL = '';
    }

    $.get(
        "https://tinyurl.com/api-create.php",
        {url: pageUrl},
        function(tinyURL){
            var key = tinyURL.split('https://tinyurl.com/')[1];
            var shareURL = pageUrl.split('?')[0] + '?id='+key;
            var fullURL = preURL+shareURL+postURL ;
            // console.log(fullURL);
            ga('send', 'event', mode + '-share', pageUrl, shareURL);
            console.log('shared')
            if(openInNewTab){
               var win = window.open(fullURL, '_blank');
               win.focus(); 
            }else if(showMessageBox){
                var message = `<div class="input-group-prepend" id = 'shareLinkMessageBox'>
                                <button onclick = 'copyText("shareLinkText","copiedMessageBox")'' title = 'Click to copy link to clipboard' class="py-0  fa fa-copy btn input-group-text bg-white"></button>
                                <input type="text" value="${fullURL}" id="shareLinkText" style = "max-width:70%;" class = "form-control mx-1">
                                
                                
                               </div>
                               <div id = 'copiedMessageBox' class = 'pl-4'</div>
                               `
               showMessage('Share link',message); 
               if(mode !== 'geeViz'){
                $('#shareLinkMessageBox').append(staticTemplates.shareButtons);

                }
               

            }
            if(openInNewTab === false){
              setUrl(fullURL);
            }
            
            
        }
    );
}

function copyText(element,messageBoxId) {
    var $temp = $("<input>");
    $("body").append($temp);
    var text = $('#'+element).text();
    if(text === ''){text = $('#'+element).val()}
    $temp.val(text).select();
    // $temp.setSelectionRange(0, 99999); /*For mobile devices*/
    document.execCommand("copy");
    $temp.remove();
     /* Alert the copied text */
    if(messageBoxId !== null && messageBoxId !== undefined){
      $('#'+messageBoxId).html("Copied text to clipboard")
    }
}
function parseUrlSearch(){
  // console.log(window.location.search == '')
    var urlParamsStr = window.location.search;
      console.log(urlParamsStr)
    if(urlParamsStr !== ''){
      urlParamsStr = urlParamsStr.split('?')[1].split('&');
    
    urlParamsStr.map(function(str){

      if(str.indexOf('OBJECT---')>-1){
        var strT = str.split('---');
        if(urlParams[strT[1]] === undefined){
          urlParams[strT[1]] = {};
        }
        urlParams[strT[1]][strT[2].split('=')[0]] = strT[2].split('=')[1];
        
      }else{
        urlParams[str.split('=')[0]] = str.split('=')[1]
      }
    })}
    if(urlParams.id !== undefined){
      
      window.open("https://tinyurl.com/"+urlParams.id,"_self");
       if(typeof(Storage) !== "undefined"){
        localStorage.setItem("cachedID",urlParams.id);
      }
    }
    else{
      // TweetThis(null,null,false,false);
      if(typeof(Storage) !== "undefined"){
        var id = localStorage.getItem("cachedID");
        if(id !== null && id !== undefined && id !== 'null'){
          setUrl(baseUrl() + '?id='+id);
          localStorage.setItem("cachedID",null)
        }
        
      }
    }
   
}
function constructUrlSearch(){
  var outURL = '?';
  Object.keys(urlParams).map(function(p){
    if(typeof(urlParams[p]) == 'object'){
      var tObj = {};
      Object.keys(urlParams[p]).map(k => tObj['OBJECT---'+p+'---'+k] = urlParams[p][k]);
      outURL += new URLSearchParams(tObj).toString() + '&';
    }else{
      outURL += p+'='+urlParams[p] + '&';
    }
    
  })
  outURL = outURL.slice(0,outURL.length-1)
  return outURL
}
/*Load global variables*/
var cachedSettingskey = 'settings';
var startYear = 1985;
var endYear = 2021;
var startJulian = 153;//190;
var endJulian = 274;//250;
var layerObj = null;
var crs = 'EPSG:5070';
var transform = null;
var scale = 30;
var queryObj = {};var timeLapseObj = {};
var addLCMSTimeLapsesOn;
parseUrlSearch()
var initialCenter = [37.5334105816903,-105.6787109375];
var initialZoomLevel = 5;
var studyAreaSpecificPage = false;
var studyAreaDict = {
                 
                    'USFS LCMS 1984-2020':{
                      isPilot: false,
                      name:'USFS LCMS 1984-2020',
                      center:[37.5334105816903,-105.6787109375,5],
                      crs:'EPSG:5070',
                      startYear:1985,
                      endYear:2021,

                      conusSA : 'projects/lcms-292214/assets/CONUS-Ancillary-Data/conus',
                      


                      conusLossThresh : 0.23,
                      conusFastLossThresh : 0.29,
                      conusSlowLossThresh : 0.18,
                      conusGainThresh : 0.29,

                     
                      akSA :  'projects/lcms-292214/assets/R10/CoastalAK/TCC_Boundary',//'projects/lcms-292214/assets/R10/CoastalAK/CoastalAK_Simple_StudyArea',
                      
                      akLossThresh : 0.26,
                      akFastLossThresh : 0.34,
                      akSlowLossThresh : 0.17,
                      akGainThresh : 0.24,


                      lcClassDict :{1: {'modelName': 'TREES','legendName': 'Trees','color': '005e00'},
                                  2: {'modelName': 'TS-TREES','legendName': 'Tall Shrubs & Trees Mix','color': '008000'},
                                  3: {'modelName': 'SHRUBS-TRE','legendName': 'Shrubs & Trees Mix','color': '00cc00'},
                                  4: {'modelName': 'GRASS-TREE','legendName': 'Grass/Forb/Herb & Trees Mix','color': 'b3ff1a'},
                                  5: {'modelName': 'BARREN-TRE','legendName': 'Barren & Trees Mix','color': '99ff99'},
                                  6: {'modelName': 'TS','legendName': 'Tall Shrubs','color': 'b30088'},//'b30000'},
                                  7: {'modelName': 'SHRUBS','legendName': 'Shrubs','color': 'e68a00'},
                                  8: {'modelName': 'GRASS-SHRU','legendName': 'Grass/Forb/Herb & Shrubs Mix','color': 'ffad33'},
                                  9: {'modelName': 'BARREN-SHR','legendName': 'Barren & Shrubs Mix','color': 'ffe0b3'},
                                  10: {'modelName': 'GRASS','legendName': 'Grass/Forb/Herb','color': 'ffff00'},
                                  11: {'modelName': 'BARREN-GRA','legendName': 'Barren & Grass/Forb/Herb Mix','color': 'AA7700'},
                                  12: {'modelName': 'BARREN-IMP','legendName': 'Barren or Impervious','color': 'd3bf9b'},
                                  13: {'modelName': 'SNOW','legendName': 'Snow or Ice','color': 'ffffff'},
                                  14: {'modelName': 'WATER','legendName': 'Water','color': '4780f3'}},

                      luClassDict :{1: {'modelName': 'Agriculture','legendName': 'Agriculture','color': 'efff6b'},
                                2: {'modelName': 'Developed','legendName': 'Developed','color': 'ff2ff8'},
                                3: {'modelName': 'Forest','legendName': 'Forest','color': '1b9d0c'},
                                4: {'modelName': 'Non_Forest_Wetland','legendName': 'Non-Forest Wetland','color': '97ffff'},
                                5: {'modelName': 'Other','legendName': 'Other','color': 'a1a1a1'},
                                6: {'modelName': 'Rangeland','legendName': 'Rangeland or Pasture','color': 'c2b34a'}},
                 
                      final_collections  : ['USFS/GTAC/LCMS/v2020-6','USFS/GTAC/LCMS/v2021-7'],
                      composite_collections : ['projects/lcms-292214/assets/R10/CoastalAK/Composites/Composite-Collection', 'projects/lcms-tcc-shared/assets/Composites/Composite-Collection-yesL7-1984-2020','projects/lcms-292214/assets/R8/PR_USVI/Composites/Composite-Collection-1984-2020'],
                      lt_collections: ['projects/lcms-292214/assets/R10/CoastalAK/Base-Learners/LANDTRENDR-Collection','projects/lcms-tcc-shared/assets/LandTrendr/LandTrendr-Collection-yesL7-1984-2020','projects/lcms-292214/assets/R8/PR_USVI/Base-Learners/LandTrendr-Collection-1984-2020'],
                      ccdc_collections:['projects/lcms-292214/assets/R10/CoastalAK/Base-Learners/CCDC-Collection','projects/lcms-292214/assets/CONUS-LCMS/Base-Learners/CCDC-Collection-1984-2021','projects/lcms-292214/assets/R8/PR_USVI/Base-Learners/CCDC-Landsat-1984-2020']
                    }                        
                };

////////////////////////////////////////////////////////////////////////////////
/*Initialize parameters for loading study area when none is chosen or chached*/
var defaultStudyArea = 'USFS LCMS 1984-2020';
var studyAreaName = studyAreaDict[defaultStudyArea].name;
var longStudyAreaName = defaultStudyArea;
var cachedStudyAreaName = null;
var viewBeta = 'yes';

var lowerThresholdDecline = studyAreaDict[defaultStudyArea].lossThresh;
var upperThresholdDecline = 1.0;
var lowerThresholdRecovery = studyAreaDict[defaultStudyArea].gainThresh;
var upperThresholdRecovery = 1.0;

var lowerThresholdSlowLoss = studyAreaDict[defaultStudyArea].lossSlowThresh;
var upperThresholdSlowLoss = 1.0;
var lowerThresholdFastLoss = studyAreaDict[defaultStudyArea].lossFastThresh;
var upperThresholdFastLoss = 1.0;
if(lowerThresholdSlowLoss === undefined){lowerThresholdSlowLoss = lowerThresholdDecline}
if(lowerThresholdFastLoss === undefined){lowerThresholdFastLoss = lowerThresholdDecline} 

 
/*Set up some boundaries of different areas to zoom to*/
var clientBoundsDict = {'All':{"geodesic": false,"type": "Polygon","coordinates": [[[-169.215141654273, 71.75307977193499],
        [-169.215141654273, 15.643479915898974],
        [-63.043266654273, 15.643479915898974],
        [-63.043266654273, 71.75307977193499]]]},
                    'CONUS':{"geodesic": false,"type": "Polygon","coordinates": [[[-148.04139715349993,30.214881196707502],[-63.66639715349993,30.214881196707502],[-63.66639715349993,47.18482008797388],[-148.04139715349993,47.18482008797388],[-148.04139715349993,30.214881196707502]]]},
                    'Alaska':{"geodesic": false,"type": "Polygon","coordinates": [[[-168.91542059099993, 71.62680009186087],
        [-168.91542059099993, 52.67867842404269],
        [-129.54042059099993, 52.67867842404269],
        [-129.54042059099993, 71.62680009186087]]]},
                    'CONUS_SEAK':{"type":"Polygon","coordinates":[[[171.00872335506813,59.78242951494817],[171.00872335506813,26.87020622017523],[-53.99127664493189,26.87020622017523],[-53.99127664493189,59.78242951494817],[171.00872335506813,59.78242951494817]]]},
                    'Hawaii':{"geodesic": false,"type": "Polygon","coordinates": [[[-162.7925163471209,18.935659110261664],[-152.2511345111834,18.935659110261664],[-152.2511345111834,22.134763696750557],[-162.7925163471209,22.134763696750557],[-162.7925163471209,18.935659110261664]]]},
                    'Puerto-Rico':{"geodesic": false,"type": "Polygon","coordinates": [[[-67.98169635150003,17.751237971831113],[-65.34635089251566,17.751237971831113],[-65.34635089251566,18.532938160084615],[-67.98169635150003,18.532938160084615],[-67.98169635150003,17.751237971831113]]]},
                    'R4':{
  "geodesic": false,
  "type": "Polygon",
  "coordinates": [
    [
      [
        -120.14785145677105,
        35.00187373433839
      ],
      [
        -108.8802160007048,
        35.00187373433839
      ],
      [
        -108.8802160007048,
        45.70613418897154
      ],
      [
        -120.14785145677105,
        45.70613418897154
      ],
      [
        -120.14785145677105,
        35.00187373433839
      ]
    ]
  ]
}
         }
/*Initialize a bunch of variables*/
var toExport;
var exportArea;
var taskCount = 0;//Keeping track of the number of export tasks each session submitted
var canAddToMap = true;//Set whether addToMap function can add to the map
var canExport = false;//Set whether exports are allowed
var colorRampIndex = 1;
var NEXT_LAYER_ID = 1;var layerChildID = 0;
var layerCount = 0;var refreshNumber = 0;
var uri;var uriName;var csvName;var dataTable;var chartOptions;var infowindow;var queryGeoJSON;var marker;var mtbsSummaryMethod;


var selectedFeaturesJSON = {};
var selectionTracker = {};

var selectionUNID = 1;

var updateViewList = true;
var viewList = [];
var viewIndex = 0;

var outputURL;
var tableConverter = null;
var groundOverlayOn = false;

var chartIncludeDate = true;var chartCollection;var pixelChartCollections = {};var whichPixelChartCollection;var areaChartCollections = {};var whichAreaChartCollection;var queryClassDict = {};var exportImage;var exportVizParams;var eeBoundsPoly;var shapesMap;
var mouseLat;var mouseLng; var area = 0;var distance = 0;var areaPolygon; var markerList = [];var distancePolylineT;var clickCoords;var distanceUpdater;
var updateArea;var updateDistance;var areaPolygonObj = {};var udpPolygonObj = {};var udpPolygonNumber = 1;var mapHammer;var chartMTBS;var chartMTBSByNLCD;var chartMTBSByAspect;
var walkThroughAdded = false;
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
var canExport = false;
var featureObj = {};var geeRunID;var outstandingGEERequests = 0;var geeTileLayersDownloading = 0;

var plotDictID = 1;
var exportID = 1;


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
var areaChartFormat = 'Percentage';
var areaChartFormatDict = {'Percentage': {'mult':100,'label':'% Area'}, 'Acres': {'mult':0.000247105,'label':'Acres'}, 'Hectares': {'mult':0.0001,'label':'Hectares'}};

var areaGeoJson;
var areaChartingCount = 0;
var center;var globalChartValues;



//Chart color properties
var chartColorI = 0;
var chartColorsDict = {
  'standard':['#050','#0A0','#e6194B','#14d4f4'],
  'advanced':['#050','#0A0','#9A6324','#6f6f6f','#e6194B','#14d4f4'],
  'advancedBeta':['#050','#0A0','#9A6324','#6f6f6f','#e6194B','#14d4f4','#808','#f58231'],
  'coreLossGain':['#050','#0A0','#e6194B','#14d4f4'],
  'allLossGain':['#050','#0A0','#e6194B','#808','#f58231','#14d4f4'],
  'allLossGain2':['#050','#0A0','#0E0','f39268','d54309','00a398'],
  'allLossGain2Area':['f39268','d54309','00a398','ffbe2e'],
  'test':['#9A6324','#6f6f6f','#e6194B','#14d4f4','#880088','#f58231'],
  'testArea':['#e6194B','#14d4f4','#880088','#f58231'],
  'ancillary':['#cc0066','#660033','#9933ff','#330080','#ff3300','#47d147','#00cc99','#ff9966','#b37700']
  }

var chartColors = chartColorsDict.standard;


//Dictionary of zoom level map scales
var zoomDict = {20 : '1,128.49',
                19 : '2,256.99',
                18 : '4,513.98',
                17 : '9,027.97',
                16 : '18,055.95',
                15 : '36,111.91',
                14 : '72,223.82',
                13 : '144,447.64',
                12 : '288,895.28',
                11 : '577,790.57',
                10 : '1,155,581.15',
                9  : '2,311,162.30',
                8  : '4,622,324.61',
                7  : '9,244,649.22',
                6  : '18,489,298.45',
                5  : '36,978,596.91',
                4  : '73,957,193.82',
                3  : '147,914,387.60',
                2  : '295,828,775.30',
                1  : '591,657,550.50'}


var authProxyAPIURL = "https://rcr-ee-proxy-2.herokuapp.com";
// var geeAPIURL = "https://earthengine.googleapis.com/map";
// var geeAPIURL = "https://earthengine.googleapis.com/map";
var geeAPIURL = "https://earthengine.googleapis.com";
// var geeAPIURL = "https://earthengine-highvolume.googleapis.com";

// https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/maps/
// var widgetsOn = true;
// var layersOn = true;
// var legendOn = true;
// var chartingOn = false;
// var distanceOn = false;
// var areaOn = false;
// var drawing = false;
var plotsOn = false;
// var helpOn = false;
// var queryOn = false;
// var areaChartingOn = false;
// var studyAreaName = 'BTNF'

/////////////////////////////////////////////////////
//Taken from: https://stackoverflow.com/questions/1669190/find-the-min-max-element-of-an-array-in-javascript
Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};
/////////////////////////////////////////////////////
//Taken from: https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript/6475125
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};
/////////////////////////////////////////////////////
//Taken from: https://stackoverflow.com/questions/2116558/fastest-method-to-replace-all-instances-of-a-character-in-a-string
String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

Number.prototype.formatNumber = function(n){
  if(n === undefined || n === null){n = 2}
  return this.toFixed(n).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}
//Taken from: https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript 
String.prototype.toTitle = function() {
  return this.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase() });
}

//Function to produce monthDayNumber monthName year format date string
Date.prototype.toStringFormat = function(){
  var  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var yr = this.getFullYear();
  var month = months[this.getMonth()];
  var day = this.getDate();
  return `${day} ${month} ${yr}`
}
//
//Taken from: https://stackoverflow.com/questions/22015684/how-do-i-zip-two-arrays-in-javascript
const zip = (a, b) => a.map((k, i) => [k, b[i]]);

//Taken from: https://stackoverflow.com/questions/11688692/how-to-create-a-list-of-unique-items-in-javascript
function unique(arr) {
    var u = {}, a = [];
    for(var i = 0, l = arr.length; i < l; ++i){
        if(!u.hasOwnProperty(arr[i])) {
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return a;
}
function auto_grow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
}/*Templates for elements and various functions to create more pre-defined elements*/
/////////////////////////////////////////////////////////////////////
/*Provide titles to be shown for each mode*/
var  titles = {
	'LCMS-pilot': {
		    leftWords: 'LCMS',
		    centerWords: 'DATA',
		    rightWords:'Explorer',
		    title:'LCMS Data Explorer'
			},
    'LCMS': {
            leftWords: `<img style = 'width:1.0em;height:0.9em;margin-top:-0.2em;margin-left:0.2em' class='image-icon mr-1' alt="LCMS icon" src="images/lcms-icon.png">LCMS`,
            centerWords: 'DATA',
            rightWords:'Explorer',
            title:'LCMS Data Explorer'
            },
    'lcms-base-learner': {
            leftWords: `<img style = 'width:1.0em;height:0.9em;margin-top:-0.2em;margin-left:0.4em' class='image-icon mr-1' alt="LCMS icon" src="images/lcms-icon.png">LCMS`,
            centerWords: 'Base-Learner',
            rightWords:'Explorer',
            title:'LCMS Base Learner Explorer'
            },
	'Ancillary': {
		    leftWords: 'Ancillary',
		    centerWords: 'DATA',
		    rightWords:'Viewer',
		    title:'TimeSync Ancillary Data Viewer'
			},
    'LT': {
            leftWords: `<img style = 'width:1.0em;height:0.9em;margin-top:-0.2em;margin-left:0.2em' class='image-icon mr-1' alt="LCMS icon" src="images/lcms-icon.png">LandTrendr`,
            centerWords: 'DATA',
            rightWords:'Explorer',
            title:'LandTrendr Data Explorer'
            },
    'MTBS': {
            leftWords: `<img style = 'width:1.0em;height:0.9em;margin-top:-0.2em;margin-left:0.2em' class='image-icon mr-1' alt="MTBS icon" src="images/mtbs-logo.png">MTBS`,
            centerWords: 'DATA',
            rightWords:'Explorer',
            title:'MTBS Data Explorer'
            },
    'TEST': {
            leftWords: 'TEST',
            centerWords: 'DATA',
            rightWords:'Explorer',
            title:'TEST Data Viewer'
            },
    'IDS' : {
            leftWords: 'IDS',
            centerWords: 'DATA',
            rightWords:'Explorer',
            title:'Insect and Disease Detection Survey Data Viewer'
            },
    'geeViz': {
            leftWords: 'geeViz',
            centerWords: 'DATA',
            rightWords:'Viewer',
            title:'geeViz Data Viewer'
            },
    'STORM': {
            leftWords: 'Storm',
            centerWords: 'Damage',
            rightWords:'Viewer',
            title:'Storm Damage Viewer'
            },
    'LAMDA': {
            leftWords: 'LAMDA',
            centerWords: 'DATA',
            rightWords:'Explorer',
            title:'LAMDA Data Explorer'
            }     
}
//////////////////////////////////////////////////////////////////////
/*Add anything to head not already there*/
$('head').append(`<title>${titles[mode].title}</title>`);
$('head').append(`<script type="text/javascript" src="./js/gena-gee-palettes.js"></script>`);
var topBannerParams = titles[mode];
var  studyAreaDropdownLabel = `<h5 class = 'teal p-0 caret nav-link dropdown-toggle ' id = 'studyAreaDropdownLabel'>Bridger-Teton National Forest</h5> `;
/////////////////////////////////////////////////////////////////////
//Provide a bunch of templates to use for various elements
var staticTemplates = {
	map:`<section aria-label="Map where all map outputs are displayed" onclick = "$('#study-area-list').hide();" class = 'map' id = 'map'> </section>`,

	mainContainer: `<main aria-label="Main container to contain all elements" class = 'container main-container' id = 'main-container'></main>`,
	sidebarLeftToggler:`<button href="#" class="fa fa-bars  p-1 mt-1  sidebar-toggler"  onclick = 'toggleSidebar()' title = 'Click to toggle sidebar visibility'></buttom>`,

    sidebarLeftContainer: `
						<nav onclick = "$('#study-area-list').hide();" class = 'col-sm-7 col-md-4 col-lg-4 col-xl-3 sidebar  p-0 m-0 flexcroll  ' id = 'sidebar-left-container'>
					        <header id = 'sidebar-left-header'></header>
                            
					        <div role="list" id = 'sidebar-left'></div>
					    </nav>`,

	geeSpinner : `<div id='summary-spinner' style='position:absolute;right:40%; bottom:40%;width:8rem;height:8rem;z-index:10000000;display:none;'><img  alt= "Google Earth Engine logo spinner" title="Background processing is occurring in Google Earth Engine" class="fa fa-spin" src="images/GEE_logo_transparent.png"  style='width:100%;height:100%'><span id = 'summary-spinner-message'></span></div>`,


	exportContainer:`<div class = 'dropdown-divider'></div>
                    <div class = 'py-2' id = 'export-list-container'>
                        <h5>Choose which images to export:</h5>
                        <div class = 'py-2' id="export-list"></div>
                        <div class = 'dropdown-divider'></div>
                        <div class = 'pl-3'>
                            <form class="form-inline" title = 'Provide projection. Web mercator: "EPSG:4326", USGS Albers: "EPSG:5070", WGS 84 UTM Northern Hemisphere: "EPSG:326" + zone number (e.g. zone 17 would be EPSG:32617), NAD 83 UTM Northern Hemisphere: "EPSG:269" + zone number (e.g. zone 17 would be EPSG:26917) '>
                              <label for="export-crs">Projection: </label>
                              <div class="form-group pl-1">
                                <input type="text" id="export-crs" oninput = 'cacheCRS()' name="rg-from" value="EPSG:4326" class="form-control">
                              </div> 
                              
                            </form>
                            <div class = 'py-2' id = 'export-area-drawing-div'>
                                <button class = 'btn' onclick = 'selectExportArea()' title = 'Draw polygon by clicking on map. Double-click to complete polygon, press ctrl+z to undo most recent point, press Delete or Backspace to start over.'><i class="pr-1 fa fa-pencil" aria-hidden="true"></i> Draw area to download</button>
                                <a href="#" onclick = 'undoExportArea()' title = 'Click to undo last drawn point (ctrl z)'><i class="btn fa fa-undo"></i></a>
                                <a href="#" onclick = 'deleteExportArea()' title = 'Click to clear current drawing'><i class="btn fa fa-trash"></i></a>
                            </div>
                            <div class = 'dropdown-divider'></div>  
                            <div class = 'pt-1 pb-3' >
                                <div id = 'export-button-div'>
                                    <button class = 'btn' onclick = 'exportImages()' title = 'Click to export selected images across selected area'><i class="pr-1 fa fa-cloud-download" aria-hidden="true"></i>Export Images</button>
                                    <button class = 'btn' onclick = 'cancelAllTasks()' title = 'Click to cancel all active exports'></i>Cancel All Exports</button>
                                </div>
                                <div class = 'dropdown-divider'></div>
                                <span style = 'display:none;' class="fa-stack fa-2x py-0" id='export-spinner' title="">
						    		<img alt= "Google Earth Engine logo spinner" class="fa fa-spin fa-stack-2x" src="images/GEE_logo_transparent.png" alt="" style='width:2em;height:2em;'>
						   			<strong id = 'export-count'  class="fa-stack-1x" style = 'padding-left: 0.2em;padding-top: 0.1em;cursor:pointer;'></strong>
								</span>
                                <div id = 'export-count-div'></div>
                            </div>
                            
                        </div>
                        
                    </div>`,

	topBanner:`<h1 id = 'title-banner' title="" class = 'gray pl-4 pb-0 m-0 text-center' style="font-weight:100;font-family: 'Roboto';">${topBannerParams.leftWords}<span class = 'gray' style="font-weight:1000;font-family: 'Roboto Black', sans-serif;"> ${topBannerParams.centerWords} </span>${topBannerParams.rightWords} </h1>
		        
		        `,
	studyAreaDropdown:`<li   id = 'study-area-dropdown' class="nav-item dropdown navbar-dark navbar-nav nav-link p-0 col-12  "  data-toggle="dropdown">
		                <h5 href = '#' onclick = "$('#sidebar-left').show('fade');$('#study-area-list').toggle();" class = 'teal-study-area-label p-0 caret nav-link dropdown-toggle ' id='study-area-label'  ></h5> 
		                <div class="dropdown-menu" id="study-area-list"  >  
		                </div>
		            </li>
			    `,
	placesSearchDiv:`<section id = 'search-share-div' class="input-group px-4 pb-2 text-center"">
			            <div role='list' class="input-group-prepend">


                            <button onclick = 'getLocation()' title = 'Click to center map at your location' class=" btn input-group-text bg-white search-box pr-1 pl-2" id="get-location-button"><i class="fa fa-map-marker text-black "></i></button>
	    					<button onclick = 'TweetThis()' title = 'Click to share your current view' class=" btn input-group-text bg-white search-box pr-1 pl-2" id="share-button"><i class="fa fa-share-alt teal "></i></button>
                            
                            <buttom class="input-group-text bg-white search-box" id="search-icon"><i class="fa fa-search text-black "></i></buttom>
                            
	  					</div>

			            <input id = 'pac-input' class="form-control bg-white search-box" title = 'Search for places on the map' type="text" placeholder="Search Places">
                        <div class="input-group-prepend">
                            <button onclick = 'backView()' title = 'Click to go back a view' class=" btn input-group-text bg-white search-box pr-1 pl-2" id="back-view-button"><i class="fa fa-arrow-left teal "></i></button>
                            <button onclick = 'forwardView()' title = 'Click to go forward a view' style = 'border-radius: 0px 3px 3px 0px' class=" btn input-group-text bg-white search-box pr-1 pl-2" id="forward-view-button"><i class="fa fa-arrow-right teal "></i></button>
                        </div>
                    </section>
                    <p class = 'mt-0 mb-1' style = 'display:none;font-size:0.8em;font-weight:bold' id = 'time-lapse-year-label'></p>`,
	introModal:{'LCMS':`<div class="modal fade "  id="introModal" tabindex="-1" role="dialog" >
                <div class="modal-dialog modal-md " role="document">
                    <div class="modal-content text-dark" style = 'background-color:rgba(230,230,230,0.95);'>
                        <button type="button" class="close p-2 ml-auto text-dark" data-dismiss="modal">&times;</button>
                        <div class = 'modal-header'>
                            <h3 class="mb-0 ">Welcome to the Landscape Change Monitoring System (LCMS) Data Explorer!</h3>
                        </div>

                        <div class="modal-body" id = 'introModal-body'>
                            <p class="pb-3 ">LCMS is a landscape change detection program developed by the USDA Forest Service. This application is designed to provide a visualization of the Landscape Change products, related geospatial data, and provide a portal to download the data.</p>
                        	<button class = 'btn' onclick = 'downloadTutorial()' title="Click to launch tutorial that explains how to utilize the Data Explorer">Launch Tutorial</button>

                        </div>
                        <div class = 'modal-footer' id = 'introModal-footer'>
                            <div class = ' ml-0' id = 'intro-modal-loading-div'>
                                <p>
                                  <img style="width:1.8em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="images/GEE_logo_transparent.png">
                                    Creating map services within Google Earth Engine. 
                                 </p>
                            </div>
                            <hr>
    						<div class="form-check  mr-0">

                                <input role="option" type="checkbox" class="form-check-input" id="dontShowAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
                                <label class=" text-uppercase form-check-label " for="dontShowAgainCheckbox" >Don't show again</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`,
            'lcms-base-learner':`<div class="modal fade "  id="introModal" tabindex="-1" role="dialog" >
                <div class="modal-dialog modal-md " role="document">
                    <div class="modal-content text-dark" style = 'background-color:rgba(230,230,230,0.95);'>
                        <button type="button" class="close p-2 ml-auto text-dark" data-dismiss="modal">&times;</button>
                        <div class = 'modal-header'>
                            <h3 class="mb-0 ">Welcome to the Landscape Change Monitoring System (LCMS) Base-Learner Explorer!</h3>
                        </div>

                        <div class="modal-body" id = 'introModal-body'>
                            <p>LCMS is a landscape change detection program developed by the USDA Forest Service. This application is designed to provide a visualization of the change detection algorithm outputs that are used to produce LCMS products.</p>
                            <hr>
                            <p>In addition to the map layers, LandTrendr and CCDC outputs can be compared through charting under the <kbd>Tools</kbd> -> <kbd>Pixel Tools</kbd> and <kbd>Area Tools</kbd>
                            </p>
                            <hr>
                            <p>Please review this <a class = 'support-text' onclick = 'downloadMethods("v2021-7")' title = 'Open in-depth LCMS v2021.7 methods documentation'>methods document</a> for more information about how these datasets are used to create LCMS products.   
                            </p>
                            <hr>
                            <p>Please contact the LCMS help desk
                                <a class = 'support-text' href = "mailto: sm.fs.lcms@usda.gov">(sm.fs.lcms@usda.gov)</a> if you have questions/comments about LCMS or have feedback on the LCMS Base-Learner Explorer.</p>
                            

                        </div>
                        <div class = 'modal-footer' id = 'introModal-footer'>
                        <div class = ' ml-0' id = 'intro-modal-loading-div'>
                            <p>
                              <img style="width:1.8em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="images/GEE_logo_transparent.png">
                                Creating map services within Google Earth Engine. 
                             </p>
                        </div>
                        <hr>
                        <div class="form-check  mr-0">

                                <input role="option" type="checkbox" class="form-check-input" id="dontShowAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
                                <label class=" text-uppercase form-check-label " for="dontShowAgainCheckbox" >Don't show again</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`,
            'IDS':`<div class="modal fade "  id="introModal" tabindex="-1" role="dialog" >
                <div class="modal-dialog modal-md " role="document">
                    <div class="modal-content text-dark" style = 'background-color:rgba(230,230,230,0.95);'>
                        <button type="button" class="close p-2 ml-auto text-dark" data-dismiss="modal">&times;</button>
                        <div class = 'modal-header'>
                            <h3 class="mb-0 ">Welcome to the Landscape Change Monitoring System (LCMS) Insect and Disease Detection Survey (IDS) Explorer!</h3>
                        </div>

                        <div class="modal-body" id = 'introModal-body'>
                            <p>LCMS is a landscape change detection program developed by the USDA Forest Service. This application is designed to provide a visualization of the LCMS outputs alongside outputs from the USFS Forest Health Protection's <a class = 'support-text' href='https://www.fs.fed.us/foresthealth/applied-sciences/mapping-reporting/detection-surveys.shtml' title = 'IDS homepage' target="_blank">Insect and Disease Detection Survey (IDS)</a> outputs.</p>
                            <hr>
                            <p>LCMS Change and IDS polygon data can be viewed simultaneously for each coincident year. These data can also be compared through charting under the <kbd>Tools</kbd> -> <kbd>Pixel Tools</kbd> and <kbd>Area Tools</kbd>
                            </p>
                            <hr>
                            <p>Please review this <a class = 'support-text' onclick = 'downloadMethods("v2021-7")' title = 'Open in-depth LCMS v2021.7 methods documentation'>methods document</a> for more information about how LCMS products are created.   
                            </p>
                            <hr>
                            <p>Please contact the LCMS help desk
                                <a class = 'support-text' href = "mailto: sm.fs.lcms@usda.gov">(sm.fs.lcms@usda.gov)</a> if you have questions/comments about LCMS or have feedback on the LCMS IDS Explorer.</p>
                            

                        </div>
                        <div class = 'modal-footer' id = 'introModal-footer'>
                        <div class = ' ml-0' id = 'intro-modal-loading-div'>
                            <p>
                              <img style="width:1.8em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="images/GEE_logo_transparent.png">
                                Creating map services within Google Earth Engine. 
                             </p>
                        </div>
                        <hr>
                        <div class="form-check  mr-0">

                                <input role="option" type="checkbox" class="form-check-input" id="dontShowAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
                                <label class=" text-uppercase form-check-label " for="dontShowAgainCheckbox" >Don't show again</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`,
            'Ancillary':`<div class="modal fade "  id="introModal" tabindex="-1" role="dialog" >
                <div class="modal-dialog modal-md " role="document">
                    <div class="modal-content text-dark" style = 'background-color:rgba(230,230,230,0.95);'>
                        <button type="button" class="close p-2 ml-auto text-dark" data-dismiss="modal">&times;</button>
                        <div class = 'modal-header'>
                            <h3 class="mb-0 ">Welcome to the TimeSync Ancillary Data Viewer!</h3>
                        </div>

                        <div class="modal-body" id = 'introModal-body'>
                            <p class="pb-2 ">This viewer is intended to provide an efficient way of looking at ancillary data to help with responses for the TimeSync tool.</p>
                        	
                        </div>
                        <div class = 'modal-footer' id = 'introModal-footer'>
                        <div class = ' ml-0' id = 'intro-modal-loading-div'>
                            <p>
                              <img style="width:1.8em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="images/GEE_logo_transparent.png">
                                Creating map services within Google Earth Engine. 
                             </p>
                        </div>
						<div class="form-check  mr-0">
                                <input role="option" type="checkbox" class="form-check-input" id="dontShowAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
                                <label class=" text-uppercase form-check-label " for="dontShowAgainCheckbox" >Don't show again</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`,
            'LT':`<div class="modal fade "  id="introModal" tabindex="-1" role="dialog" >
                <div class="modal-dialog modal-md " role="document">
                    <div class="modal-content text-dark" style = 'background-color:rgba(230,230,230,0.95);'>
                        <button type="button" class="close p-2 ml-auto text-dark" data-dismiss="modal">&times;</button>
                        <div class = 'modal-header'>
                            <h3 class="mb-0 ">Welcome to the LandTrendr Data Explorer!</h3>
                        </div>

                        <div class="modal-body" id = 'introModal-body' >
                            <li>
                                <p class="pb-2 ">This tool allows for quick exploration of significant changes visible in the Landsat time series using the <a href="https://emapr.github.io/LT-GEE/" target="_blank">LandTrendr temporal segmentation algorithm</a>. While this tool can run across any area on earth, the quality of the output will be related to the availability of cloud-free Landsat observations.</p>
                            </li>
                            <li>
                                <p class="pb-2 ">LandTrendr will run across the entire extent of the map when it is loaded. If you would like to map a different area, move to the view extent you would like to map, and then press the <kbd>Submit</kbd> button at the bottom of the <kbd>PARAMETERS</kbd> collapse menu.</p>
                            </li>
                             <li>
                                <p class="pb-2 ">All Landsat image processing and LandTrendr algorithm application is being performed on-the-fly. This can take some time to run. If you try to run this tool across a very large extent (zoom level < 9), it may not run.</p>
                            </li>

                            
                        </div>
                        <div class = 'modal-footer' id = 'introModal-footer'>
                        <div class = ' ml-0' id = 'intro-modal-loading-div'>
                            <p>
                              <img style="width:1.8em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="images/GEE_logo_transparent.png">
                                Creating map services within Google Earth Engine. 
                             </p>
                        </div>
                        <div class="form-check  mr-0">
                                <input role="option" type="checkbox" class="form-check-input" id="dontShowAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
                                <label class=" text-uppercase form-check-label " for="dontShowAgainCheckbox" >Don't show again</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`,
            'MTBS':`<div class="modal fade "  id="introModal" tabindex="-1" role="dialog" >
                <div class="modal-dialog modal-md " role="document">
                    <div class="modal-content text-dark" style = 'background-color:rgba(230,230,230,0.95);'>
                        <button type="button" class="close p-2 ml-auto text-dark" data-dismiss="modal">&times;</button>
                        <div class = 'modal-header'>
                            <h3 class="mb-0 ">Welcome to the MTBS Data Explorer!</h3>
                        </div>

                        <div class="modal-body" id = 'introModal-body'>
                            <p class="pb-2 ">This tool is intended to allow for interactive exploration of the Monitoring Trends in Burn Severity (MTBS) data record.</p>
                            
                        </div>
                        <div class = 'modal-footer' id = 'introModal-footer'>
                        <div class = ' ml-0' id = 'intro-modal-loading-div'>
                            <p>
                              <img style="width:1.8em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="images/GEE_logo_transparent.png">
                                Creating map services within Google Earth Engine. 
                             </p>
                        </div>
                        <div class="form-check  mr-0">
                                <input role="option" type="checkbox" class="form-check-input" id="dontShowAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
                                <label class=" text-uppercase form-check-label " for="dontShowAgainCheckbox" >Don't show again</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`,
            'LAMDA':`<div class="modal fade "  id="introModal" tabindex="-1" role="dialog" >
                <div class="modal-dialog modal-md " role="document">
                    <div class="modal-content text-dark" style = 'background-color:rgba(230,230,230,0.95);'>
                        <button type="button" class="close p-2 ml-auto text-dark" data-dismiss="modal">&times;</button>
                        <div class = 'modal-header'>
                            <h3 class="mb-0 ">Welcome to the Landscape Automated Monitoring and Detection Algorithm (LAMDA) Data Explorer!</h3>
                        </div>

                        <div class="modal-body" id = 'introModal-body'>
                            <p>LAMDA is a near real-time landscape-scale change detection program developed by the USDA Forest Service to serve as a 'hot spot' indicator for areas where finer resolution data may be used for further investigation and to serve as an indicator of severe changes over forested regions. This application is designed to provide a visualization of LAMDA outputs.</p>
                            
                            

                        </div>
                        <div class = 'modal-footer' id = 'introModal-footer'>
                        <div class = ' ml-0' id = 'intro-modal-loading-div'>
                            <p>
                              <img style="width:1.8em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="images/GEE_logo_transparent.png">
                                Creating map services within Google Earth Engine. 
                             </p>
                        </div>
                        <hr>
                        <div class="form-check  mr-0">

                                <input role="option" type="checkbox" class="form-check-input" id="dontShowAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
                                <label class=" text-uppercase form-check-label " for="dontShowAgainCheckbox" >Don't show again</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
        },
    loadingModal:`<p>
                  <img style="width:2.1em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="images/GEE_logo_transparent.png">
                    Creating map services within Google Earth Engine. 
                  <br>
                   <img style="width:2.1em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="images/GEE_logo_transparent.png">
                    This can take some time. Thank you for your patience!
                   <div id = 'loading-number-box'></div>
                 </p>
                  `,
	bottomBar:`<footer class = 'bottombar'  id = 'bottombar' >
                   
        			<span class = 'px-2'  id='current-tool-selection' title="Any tool that is currently active is shown here."></span>
        			<span class = 'px-2' title="All map layers are dynamically requested from Google Earth Engine.  The number of outstanding requests is shown here.">Queue length for maps from GEE: <span id='outstanding-gee-requests'>0</span></span>
                    <span class = 'px-2' title="The number of outstanding map layers currently loading tiles.">Number of map layers loading tiles: <span id='number-gee-tiles-downloading'>0</span></span>
                    <span title="Current location and elevation of mouse pointer and map zoom level and respective map scale" class = 'px-2'  id='current-mouse-position'  ></span>
                    <span id = 'contributor-logos' > 
                        <a href="https://earthengine.google.com/" target="_blank">
                            <img src="images/GEE.png"   class = 'image-icon-bar' alt="Powered by Google Earth Engine"  href="#" title="Click to learn more about Google Earth Engine">
                        </a>
                        
                       
                        <a href="http://www.fs.fed.us//" target="_blank">
                            <img src="images/usfslogo.png" class = 'image-icon-bar'  href="#"  alt= "USDA Forest Service logo" title="Click to learn more about the US Forest Service">
                        </a>
                        <a href="http://www.usda.gov" target="_blank">
                            <img src="images/usdalogo.png" class = 'image-icon-bar'  href="#"   alt= "USDA logo" title="Click to learn more about the USDA">
                        </a>
                    </span>

                    
                 
                    
            </footer>`,
        walkThroughPopup:`
                    
                    	<div class = 'walk-through-popup'>
                          
                            <div id = 'walk-through-popup-content' class = 'walk-through-popup-content'></div>
	                       		<div class = 'dropdown-divider'></div>
		                        <div class="icon-bar py-1 ">
								  <a onclick = 'previousWalkThrough()' title = 'Previous tutorial slide'><i class="fa fa-chevron-left text-black"></i></a>
								  <a onclick = 'nextWalkThrough()'  title = 'Next tutorial slide'><i class="fa fa-chevron-right text-black"></i></a>
								  <a id = 'walk-through-popup-progress'></a>
                                  <a onclick = 'removeWalkThroughCollapse()' style = 'float:right;'  title = 'Turn off Walk-Through'><i class="fa fa-stop text-black" aria-hidden="true"></i></a>
                                  
                                </div>
						</div>
	                       
                    	`,
        studyAreaDropdownButtonEnabledTooltip:`Choose your study area`,
        studyAreaDropdownButtonDisabledTooltip:`Still waiting on previous map layer requests. Can change study area once the previous requests are finished.`,
        reRunButtonEnabledTooltip:`Once finished changing parameters, press this button to refresh map layers`,
        reRunButtonDisabledTooltip:`Still waiting on previous map layer requests. Can re-submit once the previous requests are finished.`,
        reRunButton:`<button id = 'reRun-button' onclick = 'reRun()' class = 'mb-1 ml-1 btn ' title="">Submit</button>`,
        addTimelapsesButton:`<button id = 'addTimelapses-button' onclick = 'addLCMSTimeLapses()' class = 'mb-1 ml-1 btn ' title="Add interactive time lapse of LCMS Change and Land Cover products. This will slow down the map loading">Add LCMS Time Lapses To Map</button>`,
        downloadDiv :`<div class = 'py-2'>
                        <a id = 'product-descriptions' target = '_blank'>Detailed Product Description</a>
        				<div class = 'dropdown-divider'></div>
                        <label  title = 'Choose from dropdown below to download LCMS products. There can be a small delay before a download will begin, especially over slower networks.' for="downloadDropdown">Select product to download:</label>
    					<select class="form-control" id = "downloadDropdown" onchange = "downloadSelectedArea()""></select>
    				 </div>`,
        lcmsProductionDownloadDiv:`<ul id="downloadTree" class = 'pl-0 mb-0' title = 'Click through available LCMS products. Select which outputs to download, and then click the download button. Hold ctrl key to select multiples or shift to select blocks.'>
                                          <li class = 'pl-0'><span class="caret caret-down">Conterminous United States (v2021.7)</span>
                                            <ul class="nested active">
                                              <li><span class="caret">Change</span>
                                                <ul class="nested">
                                                  <li><span class="caret" title = 'Single layer summaries of what year change was mapped by LCMS serve as the foundational LCMS product that is easiest to work with in your local GIS. These are the same as the Slow Loss, Fast Loss, and Gain Year layers in the viewer.'>Summary</span>
                                                    <ul class="nested" id = 'CONUS-change-summary-downloads'></ul>
                                                  </li>
                                                  <li><span class="caret" title = 'Annual change layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the change time lapse.'>Annual</span>
                                                    <ul class="nested" id = 'CONUS-change-annual-downloads'></ul>
                                                  </li>
                                                </ul>
                                              </li>
                                              <li><span class="caret" title = 'Annual land cover layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the land cover time lapse.'>Land Cover</span>
                                                <ul class="nested" id = 'CONUS-land_cover-annual-downloads'></ul>
                                              </li>
                                              <li><span class="caret" title = 'Annual land use layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the land use time lapse.'>Land Use</span>
                                                <ul class="nested" id = 'CONUS-land_use-annual-downloads'></ul>
                                              </li>
                                              <li><span class="caret" title = 'Annual QA-bits depict ancillary information about the origin of the data used to produce LCMS products.'>QA Bits</span>
                                                <ul class="nested" id = 'CONUS-qa_bits-annual-downloads'></ul>
                                              </li>
                                            </ul>
                                          </li>
                                          <li><span class="caret caret-down">Southeastern Alaska (v2021.7)</span>
                                            <ul class="nested active">
                                              <li><span class="caret">Change</span>
                                                <ul class="nested">
                                                  <li><span class="caret" title = 'Single layer summaries of what year change was mapped by LCMS serve as the foundational LCMS product that is easiest to work with in your local GIS. These are the same as the Slow Loss, Fast Loss, and Gain Year layers in the viewer.'>Summary</span>
                                                    <ul class="nested" id = 'SEAK-change-summary-downloads'></ul>
                                                  </li>
                                                  <li><span class="caret" title = 'Annual change layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the change time lapse.'>Annual</span>
                                                    <ul class="nested" id = 'SEAK-change-annual-downloads'></ul>
                                                  </li>
                                                </ul>
                                              </li>
                                              <li><span class="caret" title = 'Annual land cover layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the land cover time lapse.'>Land Cover</span>
                                                <ul class="nested" id = 'SEAK-land_cover-annual-downloads'></ul>
                                              </li>
                                              <li><span class="caret" title = 'Annual land use layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the land use time lapse.'>Land Use</span>
                                                <ul class="nested" id = 'SEAK-land_use-annual-downloads'></ul>
                                              </li>
                                              <li><span class="caret" title = 'Annual QA-bits depict ancillary information about the origin of the data used to produce LCMS products.'>QA Bits</span>
                                                <ul class="nested" id = 'SEAK-qa_bits-annual-downloads'></ul>
                                              </li>
                                            </ul>
                                          </li>
                                          <li><span class="caret caret-down">Puerto Rico - US Virgin Islands (v2020.6)</span>
                                            <ul class="nested active">
                                              <li><span class="caret">Change</span>
                                                <ul class="nested">
                                                  <li><span class="caret" title = 'Single layer summaries of what year change was mapped by LCMS serve as the foundational LCMS product that is easiest to work with in your local GIS. These are the same as the Fast Loss, and Gain Year layers in the viewer.'>Summary</span>
                                                    <ul class="nested" id = 'PRUSVI-change-summary-downloads'></ul>
                                                  </li>
                                                  <li><span class="caret" title = 'Annual change layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the change time lapse.'>Annual</span>
                                                    <ul class="nested" id = 'PRUSVI-change-annual-downloads'></ul>
                                                  </li>
                                                </ul>
                                              </li>
                                              <li><span class="caret" title = 'Annual land cover layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the land cover time lapse.'>Land Cover</span>
                                                <ul class="nested" id = 'PRUSVI-land_cover-annual-downloads'></ul>
                                              </li>
                                              <li><span class="caret" title = 'Annual land use layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the land use time lapse.'>Land Use</span>
                                                <ul class="nested" id = 'PRUSVI-land_use-annual-downloads'></ul>
                                              </li>
                                            </ul>
                                          </li>
                                        </ul>`,
        supportDiv :`<div  class = 'py-2 pl-3 pr-1'>
                        <header class = 'row ' title = 'Open LCMS Data Explorer tutorial'>
                            <h3 class = ' text-capitalize'>Tutorial</h3>
                        </header>
                        <div class = 'row ' title = 'Open LCMS Data Explorer tutorial'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <img class = 'support-icons' alt = 'Information icon' src = './images/information--v2.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                                <a class = 'support-text' onclick = 'downloadTutorial()'>
                                Click to launch a tutorial that explains how to utilize the Data Explorer</a>
                            </div>
                        </div>
                        <hr>
                         <header class = 'row ' title = 'Open in-depth LCMS methods documentation'>
                            <h3 class = ' text-capitalize'>LCMS Methods</h3>
                        </header>
                        <div class = 'row ' title = 'Open in-depth LCMS methods documentation'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <img class = 'support-icons' alt = 'Methods icon' src = './images/methods-icon.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                                Click to open in-depth methods document:
                                <li>
                                    <a class = 'support-text' onclick = 'downloadMethods("v2021-7")' title = 'Open in-depth LCMS v2021.7 methods documentation'>Version 2021.7 (CONUS and SEAK)</a>
                                </li>
                                <li>
                                    <a class = 'support-text' onclick = 'downloadMethods("v2020-6")' title = 'Open in-depth LCMS v2020.6 methods documentation'>Version 2020.6 (PRUSVI)</a>
                                </li>   
                            </div>
                        </div>
                        <hr>
                        
                        
                    
                        <header class = 'row'>
                            <h3 class = ' text-capitalize' title = "In addition to this viewer, there are viewers to help visualize and explore other aspects of the LCMS data flow">Other LCMS Viewers</h3>
                        </header>
                   
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a title = "In addition to this viewer, there are viewers to help visualize and explore other aspects of the LCMS data flow" ><img class = 'support-icons' alt = 'Email icon' src = './images/lcms-icon.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                                <a class = 'support-text' title = "Visualize and explore time series datasets used to create the LCMS map outputs" href = "lcms-base-learner.html" target="_blank">LCMS Base Learner Explorer</a>
                                <hr>
                                <a class = 'support-text' title = "Visualize pre-made gifs illustrating patterns of change across USFS Forests and Districts" href = "lcms-in-motion.html" target="_blank">LCMS-in-Motion</a>
                            </div>
                            
                        </section>
                        <hr>
                        <header class = 'row'>
                            <h3 class = ' text-capitalize'>Acknowledgements</h3>
                        </header>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://www.fs.fed.us/gstc/" target="_blank">
                                <img src="./images/GTAC_Logo.png" class = 'support-icons' alt="GTAC Logo"  href="#" alt = "Geospatial Technology and Applications Center logo" title="Click to learn more about the Geospatial Technology and Applications Center (GTAC)">
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://www.fs.fed.us/gstc/" target="_blank">
                                    <p class = 'support-text'>The Geospatial Technology and Applications Center (GTAC) provides leadership in geospatial science implementation in the USDA Forest Service by delivering vital services, data products, tools, training, and innovation to solve today’s land and resource management challenges. All operational LCMS production and support takes place at GTAC.</p>
                                </a>
                            </div>
                        </section>
                        
                        <hr>
                        
                        <section class = 'row '>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://www.redcastleresources.com/" target="_blank">
                                    <img src="images/RCR-logo.jpg"  class = 'support-icons' alt="RedCastle Inc. Logo"  href="#"   title="Click to learn more about RedCastle Resources Inc.">
                                    
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://www.redcastleresources.com/" target="_blank">
                                    <p class = 'support-text'>RedCastle Resources Inc. is the on-site contractor that has provided the technical expertise for LCMS' operational production, documentation, and delivery at GTAC.</p>
                                </a>
                            </div>
                        </section>
                        <hr>
                        <section class = 'row '>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://www.fs.usda.gov/rmrs/tools/landscape-change-monitoring-system-lcms" target="_blank">
                                <img src="./images/usfslogo.png" class = 'support-icons' alt="USFS Logo"  href="#"  title="Click to learn more about the Rocky Mountain Research Station (RMRS)">
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://www.fs.usda.gov/rmrs/tools/landscape-change-monitoring-system-lcms" target="_blank">
                                    <p class = 'support-text'>The Rocky Mountain Research Station provides the scientific foundation LCMS is built upon. They have been instrumental in developing and publishing the original LCMS methodology and continue to provide ongoing research and development to further improve LCMS methods.</p>
                                </a>
                            </div>
                        </section>
                        
                        <hr>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://earthengine.google.com/" target="_blank">
                                    <img src="images/GEE_logo_transparent.png"  class = 'support-icons' alt="Google Earth Engine Logo"  href="#"   title="Click to learn more about Google Earth Engine">
                                    
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://earthengine.google.com/" target="_blank">
                                    <p class = 'support-text'>LCMS utilizes Google Earth Engine for most of its data acqusition, processing, and visualization, through an enterprise agreement between the USDA Forest Service and Google. In its current form, LCMS would not be possible without Google Earth Engine.</p>
                                </a>
                            </div>
                        </section>
                        <hr>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <h2>"..."</h2>
                            </div>
                            <div class = 'col-lg-10  support-text'>
                              
                                    Suggested citation: 
                                    <p class = 'support-text' onclick = 'copyText("suggested-citation-text","copiedCitationMessageBox")' id = 'suggested-citation-text'>Forest Service, U.S. Department of Agriculture (2022). Landscape Change Monitoring System Data Explorer [Online]. Available at: https://apps.fs.usda.gov/lcms-viewer (Accessed: ${new Date().toStringFormat()}).
                                    </p>
                                    <span>
                                        <button onclick = 'copyText("suggested-citation-text","copiedCitationMessageBox")'' title = 'Click to copy suggested citation to clipboard' class="py-0 pr-1 fa fa-copy btn input-group-text bg-white" >
                                        </button>
                                        <p id = 'copiedCitationMessageBox'></p>
                                    </span>
                            </div>
                        </section>
                       
                        <hr>
                    
                        <header class = 'row'>
                            <h3 class = ' text-capitalize'>Contact</h3>
                        </header>
                        <section class = 'row '>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov"><img class = 'support-icons' alt = 'Email icon' src = './images/email.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                                <a class = 'support-text' title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov">
                                Please contact the LCMS help desk <span href = "mailto: sm.fs.lcms@usda.gov">(sm.fs.lcms@usda.gov)</span> if you have questions/comments about LCMS or have feedback on the LCMS Data Explorer.</a>
                            </div>
                        </section>
        				
        			
                       
        			</div>`,
                    tooltipToggle:` <label class = 'mt-2'>If you turned off tool tips, but want them back:</label>
                        <button  class = 'btn  bg-black' onclick = 'showToolTipsAgain()'>Show tooltips</button>`,
        walkThroughButton:`<div >
                            <label class = 'mt-2'>Run a walk-through of the ${mode} Data Explorer's features</label>
                            <button  class = 'btn  bg-black' onclick = 'toggleWalkThroughCollapse()' title = 'Run interactive walk-through of the features of the ${mode} Data Explorer'>Run Walk-Through</button>
                          </div>`,
        distanceDiv : `Click on map to measure distance`,
        distanceTip : "Click on map to measure distance. Press <kbd>ctrl+z</kbd> to undo most recent point. Double-click, press <kbd>Delete</kbd>, or press <kbd>Backspace</kbd> to clear measurment and start over.",
        areaDiv : `Click on map to measure area<variable-radio onclick1 = 'updateArea()' onclick2 = 'updateArea()' var='metricOrImperialArea' title2='' name2='Metric' name1='Imperial' value2='metric' value1='imperial' type='string' title='Toggle between imperial or metric units'></variable-radio>
       `,
        areaTip : "Click on map to measure area. Double-click to complete polygon, press <kbd>ctrl+z</kbd> to undo most recent point, press <kbd>Delete</kbd> or <kbd>Backspace</kbd> to start over. Any number of polygons can be defined by repeating this process.",
        queryDiv : "<div>Double-click on map to query values of displayed layers at that location</div>",
        queryTip : 'Double-click on map to query the values of the visible layers.  Only layers that are turned on will be queried.',
        pixelChartDiv : `<div>Double-click on map to query ${mode} data time series<br></div>`,
        pixelChartTip : 'Double-click on map to look at the full time series of '+mode+' outputs for a pixel.',
        userDefinedAreaChartDiv : `<div  id="user-defined" >
                                            
                                            <label>Provide name for area selected for charting (optional):</label>
                                            <input title = 'Provide a name for your chart. A default one will be provided if left blank.'  type="user-defined-area-name" class="form-control my-1" id="user-defined-area-name" placeholder="Name your charting area!" style='width:80%;'>
                                            <div class = 'dropdown-divider'></div>
                                            <div>Total area selected: <i id = "user-defined-area-spinner" style = 'display:none;' class="fa fa-spinner fa-spin text-dark pl-1"></i></div>
                                            <div id = 'user-defined-features-area' class = 'select-layer-name'>0 hectares / 0 acres</div>
                                            <div id = 'user-defined-edit-toolbar'></div>
                                            <button class = 'btn' style = 'margin-bottom: 0.5em!important;' onclick = 'chartUserDefinedArea()' title = 'Click to summarize across drawn polygons'>Chart Selected Areas</button>
                                
        		            			</div>
                                	</div>`,
        showChartButton:`<div class = 'py-2'>
                                <button onclick = "$('#chart-modal').modal()" class = 'btn bg-black' title = "If you turned off the chart, but want to show it again" >Turn on Chart</button>
                                </div>`,
        userDefinedAreaChartTip : 'Click on map to select an area to summarize '+mode+' products across. Press <kbd>ctrl+z</kbd> to undo most recent point.  Press <kbd>Delete</kbd>, or press <kbd>Backspace</kbd> to start over. Double-click to finish polygon. Any number of polygons can be defined by repeating this process. Once finished defining areas, click on the <kbd>Chart Selected Areas</kbd> button to create chart.',

        uploadAreaChartDiv : `<div class = 'dropdown-divider'></div>
                                <label title = 'Powered by: https://ogre.adc4gis.com/'>Choose a zipped shapefile, kml, kmz, or geoJSON file to summarize across. Then hit "Chart across chosen file" button below to produce chart.</label>
                                <input class = 'file-input my-1' type="file" id="areaUpload" name="upload" accept=".zip,.geojson,.json,.kmz,.kml" style="display: inline-block;">
                                <div class = 'dropdown-divider'></div>
                                <div id = 'upload-reduction-factor-container'></div>
                                <div class = 'dropdown-divider'></div>
                                <div>Uploaded areas:</div>
                                <div id="area-charting-shp-layer-list"></div>
                                <div class = 'dropdown-divider'></div>
                                <button class = 'btn' style = 'margin-bottom: 0.5em!important;' onclick = 'runShpDefinedCharting()' title = 'Click to summarize across chosen .zip shapefile, .kmz, .kml, or .geojson.'>Chart across chosen file</button>
                                `,
        uploadAreaChartTip : 'Select zipped shapefile (zip into .zip all files related to the shapefile) or a single .kmz, .kml (If the .kmz or .kml has embedded pngs or any other non vector data, the conversion will likely fail.), or .geojson file to summarize products across.',
        selectAreaDropdownChartDiv : `<i title="Selecting pre-defined summary areas for chosen study area" id = "select-area-spinner" class="text-dark px-2 fa fa-spin fa-spinner"></i>
                            <select class = 'form-control' style = 'width:100%;'  id='forestBoundaries' onchange='chartChosenArea()'></select>
                            <div class = 'dropdown-divider'></div>`,
        selectAreaDropdownChartTip : 'Select from pre-defined areas to summarize products across.',
        selectAreaInteractiveChartDiv : `<div>Choose from layers below and click on map to select areas to include in chart</div>
                                        <div class = 'dropdown-divider'></div>
                                        <label>Provide name for area selected for charting (optional):</label>
                                        <input title = 'Provide a name for your chart. A default one will be provided if left blank.'  type="user-selected-area-name" class="form-control" id="user-selected-area-name" placeholder="Name your charting area!" style='width:80%;'>
                                        <div class = 'dropdown-divider'></div>
                                        <div id = 'simplify-error-range-container'></div>
                                        <div class = 'dropdown-divider'></div>
                                        <div id="area-charting-select-layer-list"></div>
                                        <div class = 'dropdown-divider'></div>
                                        <div>Selected areas:</div>
                                        <i id = "select-features-list-spinner" style = 'display:none;' class="fa fa-spinner fa-spin text-dark"></i>
                                        <li class = 'selected-features-list' id = 'selected-features-list'></li>
                                        <div id="area-charting-selected-layer-list"></div>
                                        <div class = 'dropdown-divider'></div>
                                        <div>Total area selected: <i id = "select-features-area-spinner" style = 'display:none;' class="fa fa-spinner fa-spin text-dark pl-1"></i></div>
                                        <div id = 'selected-features-area' class = 'select-layer-name'>0 hectares / 0 acres</div>
                                        <div id = 'select-features-edit-toolbar'></div>
                                        <button class = 'btn' onclick = 'chartSelectedAreas()'>Chart Selected Areas</button>
                                        <div class = 'dropdown-divider'></div>`,
        selectAreaInteractiveChartTip : 'Select from pre-defined areas on map to summarize products across.',
        shareButtons : `    
                        
                        <!-- Email -->
                        <a title = 'Share via E-mail' onclick = 'TweetThis("mailto:?Subject=USDA Forest Service Landscape Change Monitoring System&amp;Body=I%20saw%20this%20and%20thought%20you%20might%20be%20interested.%20 ","",true)'>
                            <img class = 'image-icon-bar' src="./images/email.png" alt="Email" />
                        </a>

                        <!-- Reddit -->
                        <a title = 'Share on Reddit' onclick = 'TweetThis("http://reddit.com/submit?url=","&amp;title=USDA Forest Service Landscape Change Monitoring System",true)' >
                            <img class = 'image-icon-bar' src="./images/reddit.png" alt="Reddit" />
                        </a>

                         <!-- Twitter -->
                        <a title = 'Share on Twitter' onclick = 'TweetThis("https://twitter.com/share?url=","&amp;text=USDA Forest Service Landscape Change Monitoring System&amp;hashtags=USFSLCMS",true)' >
                            <img class = 'image-icon-bar' src="./images/twitter.png" alt="Twitter" />
                        </a>

                        <!-- Facebook -->
                        <a  title = 'Share on Facebook' onclick = 'TweetThis("http://www.facebook.com/sharer.php?u=","",true)' >
                            <img class = 'image-icon-bar' src="./images/facebook.png" alt="Facebook" />
                        </a>
                            
                        
                        `



        
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Go through each tip and remove kbd tag for shoing in hover titles
Object.keys(staticTemplates).filter(word => word.indexOf('Tip') > -1).map(function(t){
	var tip = staticTemplates[t].replaceAll(`<kbd>`,``);
	tip = tip.replaceAll(`</kbd>`,``);
	staticTemplates[t+'Hover'] = tip
})
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//Start functions that add/remove and control elements
//////////////////////////////////////////////////////////////////////////////////////////////
//Center map on user's location
//Adapted from https://www.w3schools.com/html/html5_geolocation.asp
function getLocation() {
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showLocationError);
    
  } else { 
    showMessage('Cannot acquire location','Geolocation is not supported by this browser.');
    ga('send', 'event', mode + '-getLocation', 'failure', 'failure');
  }
}
function showPosition(position) {
    var pt = {lng:position.coords.longitude,lat:position.coords.latitude};
    ga('send', 'event', mode + '-getLocation', 'success', JSON.stringify(pt));
    var locationMarker  = new google.maps.Marker({
              map: map,
              position: pt,
              icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 5,
                  strokeColor: '#FF0',
                  map: map
                }
            });
    map.setCenter(pt);
    map.setZoom(10);
    showMessage('Acquired location',"Latitude: " + position.coords.latitude + 
  "<br>Longitude: " + position.coords.longitude)
  
}
function showLocationError(error) {
    switch(error.code) {
    case error.PERMISSION_DENIED:
        showMessage('Cannot acquire location','User denied the request for Geolocation.');
        break;
    case error.POSITION_UNAVAILABLE:
        showMessage('Cannot acquire location','Location information is unavailable.');
        break;
    case error.TIMEOUT:
        showMessage('Cannot acquire location','The request to get user location timed out.');
        break;
    case error.UNKNOWN_ERROR:
        showMessage('Cannot acquire location','An unknown error occurred.');
        break;
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to add a Bootstrap dropdown
function addDropdown(containerID,dropdownID,dropdownLabel,variable,tooltip){
	if(tooltip === undefined || tooltip === null){tooltip = ''}
	$('#' + containerID).append(`<div id="${dropdownID}-container" class="form-group" title="${tooltip}">
								  <label for="${dropdownID}">${dropdownLabel}:</label>
								  <select class="form-control" id="${dropdownID}"></select>
								</div>`)
	
	  $("select#"+dropdownID).on("change", function(value) {
	  	eval(`window.${variable} = $(this).val()`);
	  });
	
}
//Function to add an item to a dropdown
function addDropdownItem(dropdownID,label,value,tooltip){
    if(tooltip === undefined || tooltip === null){tooltip = ''};
	$('#'+dropdownID).append(`<option title = '${tooltip}' value = "${value}">${label}</option>`)
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to add a standard shape editor toolbar
function addShapeEditToolbar(containerID, toolbarID,undoFunction,restartFunction,undoTip,deleteTip){
    if(undoTip === undefined || undoTip === null){undoTip = 'Click to undo last drawn point (ctrl z)'};
    if(deleteTip === undefined || deleteTip === null){deleteTip = 'Click to clear current drawing and start a new one (Delete, or Backspace)'};
	$('#'+containerID).append(`<div class = 'dropdown-divider'></div>
								    <div id = '${toolbarID}' class="icon-bar ">
								    	<a href="#" onclick = '${undoFunction}' title = '${undoTip}''><i class="btn fa fa-undo"></i></a>
									  	<a href="#" onclick = '${restartFunction}' title = '${deleteTip}'><i class="btn fa fa-trash"></i></a>
									</div>
									<div class = 'dropdown-divider'></div>`);
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to set up a custom toggle radio
const setRadioValue =function(variable,value){
	console.log(value)
	window[variable] = value;
	};
function getRadio(id,label,name1,name2,variable,value1,value2){
	return `<div class = 'container'><div id = '${id}-row' class = 'row'>
		<label class="col-sm-4">${label}</label>
		<div class = 'col-sm-8'>
		<div  id = '${id}' class="toggle_radio">

	  	
	    <input type="radio" checked class="toggle_option first_toggle" id="first_toggle${id}" name="toggle_option" onclick="setRadioValue('${variable}','${value1}')"  >
	    <input type="radio"  class="toggle_option second_toggle" id="second_toggle${id}" name="toggle_option" onclick="setRadioValue('${variable}','${value2}')"  >
	    
	    <label for="first_toggle${id}"><p>${name1}</p></label>
	    <label for="second_toggle${id}"><p>${name2}</p></label>
	    
	    <div class="toggle_option_slider">
	    </div>
	    </div>
 
	</div>
	</div>
	</div>`
	}
//////////////////////////////////////////////////////////////////////////////////////////////
function getDiv(containerID,divID,label,variable,value){
	eval(`var ${variable} = ${value}`);
	console.log(eval(variable));
	var div = `<div id = "${divID}">${label}</div>`;
	$('#'+containerID).append(div);
	$('#'+ divID).click(function(){eval(`${variable}++`);console.log(eval(variable));$('#'+divID).append(eval(variable));})
}
//////////////////////////////////////////////////////////////////////////////////////////////
function getToggle(containerID,toggleID,onLabel,offLabel,onValue,offValue,variable,checked){
	if(checked === undefined || checked === null || checked === 'true' || checked === 'checked'){
		checked = true;
	}
	else if(checked === 'false' || checked === ''){
		checked = false;
	}

	var valueDict = {true:onValue,false:offValue};

	eval(`window.${variable} = valueDict[checked]`)
	var toggle = `<input role="option" id = "${toggleID}" class = 'p-0 m-0' type="checkbox"  data-toggle="toggle" data-on="${onLabel}" data-off="${offLabel}" data-onstyle="toggle-on" data-offstyle="toggle-off"><br>`;
	$('#'+containerID).append(toggle);
	if(checked){
		$('#'+toggleID).bootstrapToggle('on')
	}
	$('#'+containerID).click(function(){
		var value = $('#'+toggleID).prop('checked');
		console.log(value);
		eval(`window.${variable} = valueDict[${value}]`)

	})
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Provide color picker and allow updating of drawn polygons
function updateDistanceColor(jscolor) {
    distancePolylineOptions.strokeColor = '#' + jscolor;
    if(distancePolyline !== undefined){
        distancePolyline.setOptions(distancePolylineOptions);
    }
}
function updateUDPColor(jscolor) {
    udpOptions.strokeColor = '#' + jscolor;
    Object.keys(udpPolygonObj).map(function(k){
        udpPolygonObj[k].setOptions(udpOptions) ;       
    })
}
function updateAreaColor(jscolor) {
    areaPolygonOptions.strokeColor = '#' + jscolor;

    Object.keys(areaPolygonObj).map(function(k){
    	areaPolygonObj[k].setOptions(areaPolygonOptions) ;

    	console.log(areaPolygonObj[k])
    })
}
function addColorPicker(containerID,pickerID,updateFunction,value){
	if(value === undefined	|| value === null){value = 'FFFF00'}
	$('#'+containerID).append(`<button id = '${pickerID}' data-toggle="tooltip" title="If needed, change the color of shape you are drawing"
							    class=" fa fa-paint-brush text-dark color-button jscolor {valueElement:null,value:'${value}',onFineChange:'${updateFunction}(this)'} "
							    ></button>`);
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Functions to add and change content of BS modals
function addModal(containerID,modalID,bodyOnly){
	if(bodyOnly === null || bodyOnly === undefined){bodyOnly = false};
	if(containerID === null || containerID === undefined){containerID = 'main-container'};
	if(modalID === null || modalID === undefined){modalID = 'modal-id'};
	$('#'+modalID).remove();
	if(bodyOnly){
	$('#'+ containerID).append(`<div id = "${modalID}" class="modal fade " role="dialog">
            	<div class="modal-dialog modal-md ">
            		<div class="modal-content bg-white">
            			
	            		<div style = ' border-bottom: 0 none;'class="modal-header pb-0" id ="${modalID}-header">
	            			<button style = 'float:right;' id = 'close-modal-button' type="button" class="close text-dark" data-dismiss="modal">&times;</button>
	            		</div>
	      				<div id ="${modalID}-body" class="modal-body bg-white " ></div>
			          	
        			</div>
        		</div> 
        	</div>`
        	)
	}else{
	$('#'+ containerID).append(`
            <div id = "${modalID}" class="modal fade " role="dialog">
            	<div class="modal-dialog modal-lg ">
            		<div class="modal-content bg-black">
            		<button type="button" class="close p-2 ml-auto" data-dismiss="modal">&times;</button>
	            		<div class="modal-header py-0" id ="${modalID}-header"></div>
	      				<div id ="${modalID}-body" class="modal-body " style = 'background:#DDD;' ></div>
			          	<div class="modal-footer" id ="${modalID}-footer"></div>
        			</div>
        		</div> 
        	</div>`
        	)
	}
}
function addModalTitle(modalID,title){
	if(modalID === null || modalID === undefined){modalID = 'modal-id'};
	// $('#'+modalID+' .modal-title').html('');
	$('#'+modalID+' .modal-header').prepend(`<h4 class="modal-title" id = '${modalID}-title'>${title}</h4>`);

}

function clearModal(modalID){
	if(modalID === null || modalID === undefined){modalID = 'modal-id'};
	// $('#'+modalID).empty();

	$('#'+modalID+'-title .modal-title').html('')
	$('#'+modalID+'-header').html('');
	$('#'+modalID+'-body').html('');
	$('#'+modalID+'-footer').html('');
	$('.modal').modal('hide');
	$('.modal-backdrop').remove()
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to plae a message in a BS modal and show it
function showMessage(title,message,modalID,show){
	if(title === undefined || title === null){title = ''}
	if(message === undefined || message === null){message = ''}
	if(show === undefined || show === null){show = true}
	if(modalID === undefined || modalID === null){modalID = 'error-modal'}
	
	clearModal(modalID);
	addModal('main-container',modalID,true);
	addModalTitle(modalID,title);
	$('#'+modalID+'-body').append(message);
	if(show){$('#'+modalID).modal();}

};

//////////////////////////////////////////////////////////////////////////////////////////////
//Show a basic tip BS modal
function showTip(title,message){
	showMessage('','<span class = "font-weight-bold text-uppercase" >'+ title +' </span><span>' +message + '</span>','tip-modal',false)

	$('#tip-modal-body').append(`<form class="form-inline pt-3 pb-0">
								  
								  <div class="form-check  mr-0">
                                	<input role="option" type="checkbox" class="form-check-input" id="dontShowTipAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
                                	<label class=" text-uppercase form-check-label " for="dontShowTipAgainCheckbox" >Turn off tips</label>
                            		</div>
								    
								  
								</form>`);
	if(localStorage.showToolTipModal == undefined || localStorage.showToolTipModal == "undefined"){
	  localStorage.showToolTipModal = 'true';
	  }
	if(localStorage.showToolTipModal === 'true' && walkThroughAdded == false){
	  $('#tip-modal').modal().show();
	}
	$('#dontShowTipAgainCheckbox').change(function(){
    console.log(this.checked)
    localStorage.showToolTipModal  = !this.checked;
    if(localStorage.showToolTipModal === 'false'){$('#tooltip-radio-second_toggle_label').click();}
    else if(localStorage.showToolTipModal === 'true'){$('#tooltip-radio-first_toggle_label').click();};
    });

}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to add a given study area to the study area dropdown
function addStudyAreaToDropdown(name,toolTip){
	var id = name.replaceAll(' ','-');
	$('#study-area-list').append(`<a id = '${id}' name = '${name}' class="dropdown-item "   data-toggle="tooltip" title="${toolTip}">${name}</a>`)
  	$('#'+id).on('click',function(){
  		// $('#summary-spinner').show();
  		$('#study-area-list').hide();
        longStudyAreaName = this.name;
    	dropdownUpdateStudyArea(this.name);
    }) 
 }
 //////////////////////////////////////////////////////////////////////////////////////////////
 function addToggle(containerDivID,toggleID,title,onLabel,offLabel,on,variable,valueOn,valueOff,onChangeFunction,tooltip){
    var valueDict = {true:valueOn,false:valueOff};
    var checked;
    if(tooltip === undefined || tooltip === null){tooltip = ''}
    if(on === null || on === undefined || on === 'checked' || on === 'true'){on = true;checked = 'checked';}
    else {on = false;checked = ''};
    // console.log('on');console.log(on);console.log(valueDict[on]);
    eval(`window.${variable} = valueDict[on];`);
    // try{
    // 	eval(`${onChangeFunction}`);
    // }catch(err){
    // 	console.log('Adding toggle error: ' + err);
    // }
    
    $('#'+containerDivID).append(`<div title="${tooltip}" >${title}<input  id = "${toggleID}" data-onstyle="dark" data-offstyle="light" data-style="border" role="option" type="checkbox" data-on="${onLabel}" data-off="${offLabel}"  ${checked} data-toggle="toggle" data-width="100" data-onstyle="dark" data-offstyle="light" data-style="border" data-size="small" ></div>`)
    $('#'+toggleID).change(function(){
        var value = valueDict[$('#'+toggleID).prop('checked')];
        eval(`window.${variable} = value;`);
        eval(`${onChangeFunction}`); 
    })
}
//////////////////////////////////////////////////////////////////////////////////////////////
function addRadio(containerDivID,radioID,title,onLabel,offLabel,variable,valueOn,valueOff,onFunction,offFunction,tooltip){
	// var valueDict = {true:valueOn,false:valueOff};
	eval(`window.${variable} = '${valueOn}';`);
	// console.log(valueDict);
	
	$('#'+containerDivID).append(`<row class = 'row' id = '${radioID}-container' title="${tooltip}">
		<h3 class="col-12 pb-0 h3">${title} </h3>
		<div class = 'col-12 pt-0'>
    		<div  id = '#${radioID}'  class="toggle_radio p-0">
                <input type="radio" class = "first_toggle" checked class="toggle_option" id="${radioID}-first_toggle" name="${radioID}-toggle_option"  value="1" >
    	       <input type="radio" class="toggle_option second_toggle" id="${radioID}-second_toggle" name="${radioID}-toggle_option"  value="2" >
    	    
    	       <label for="${radioID}-first_toggle" id = '${radioID}-first_toggle_label'><p>${onLabel}</p></label>
    	       <label for="${radioID}-second_toggle"  id = '${radioID}-second_toggle_label'><p>${offLabel}</p></label>
    	    
    	       <div class="toggle_option_slider">
    	    </div>
	    </div>
 
	</div>
	</row>`)

	$('#'+radioID + '-first_toggle').change(function(){
		// console.log('first');
		eval(`window.${variable} = '${valueOn}';`);
		eval(`${onFunction}`);
	})
	$('#'+radioID + '-second_toggle').change(function(){
		// console.log('second');
		eval(`window.${variable} = '${valueOff}';`);
		eval(`${offFunction}`);
	})
	
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to set up a checkbox list
//Will set up an object under the variable name with the optionList that is updated
//Option list is formatted as {'Label 1': true, 'Label 2':false...etc}
function addCheckboxes(containerID,checkboxID,title,variable,optionList){
    $('#'+containerID).append(`<form  id = '${checkboxID}'>${title}<br></form>`);
    eval(`if(window.${variable} === undefined){window.${variable} = []}`);
    Object.keys(optionList).map(function(k){
      // console.log(k)
      var checkboxCheckboxID = variable+k + '-checkbox';
      var checkboxLabelID = variable+checkboxCheckboxID + '-label'
      if(optionList[k] === 'true'){optionList[k] = true}
      else  if(optionList[k] === 'false'){optionList[k] = false}
      var checked = optionList[k];
      optionList[k] = checked;
      if(checked){checked = 'checked';}
        else{checked = ''};
        eval(`window.${variable} = optionList`)
      $('#'+checkboxID).append(`
                                 <input  role="option" id="${checkboxCheckboxID}" type="checkbox" ${checked} value = '${k}' />
                                 <label  id="${checkboxLabelID}" style = 'margin-bottom:0px;'  for="${checkboxCheckboxID}" >${k}</label>
                               `)

      $('#'+checkboxCheckboxID).change( function() {
                                      var v = $(this).val();

                                      var checked = $(this)[0].checked;
                                      optionList[v] = checked;
                                      eval(`window.${variable} = optionList`)
                                      console.log('Checkbox change');console.log(optionList);
                                    });
    })
  }
//////////////////////////////////////////////////////////////////////////////////////////////
//Similar to the addCheckboxes only with radio buttons
//The variable assumes the value of the key of the object that is selected instead of the entire optionList object
//e.g. if optionList = {'hello':true,'there':false} then the variable = 'hello'
function addMultiRadio(containerID,radioID,title,variable,optionList){
    $('#'+containerID).append(`<form  class = 'py-2' id = '${radioID}'>${title}<br></form>`);

    eval(`if(window.${variable} === undefined){window.${variable} = ''};`);
    Object.keys(optionList).map(function(k){
      var radioCheckboxID = k + '-checkbox';
      var radioLabelID = radioCheckboxID + '-label';
      var checked = optionList[k];
      if(checked){
        checked = 'checked';
        eval(`window.${variable} = "${k}"`)
      }else{checked = ''};
      
      $('#'+radioID).append(`<div class="form-check form-check-inline">
                              <input role="option" class="form-check-input" type="radio" name="inlineRadioOptions" id="${radioCheckboxID}" ${checked} value="${k}">
                              <label class="form-check-label" for="${radioCheckboxID}">${k}</label>
                            </div>`);
      $('#'+radioCheckboxID).change( function() {
                                      var v = $(this).val();
                                      eval(`window.${variable} = "${v}"`)
                                    });
})
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Some basic formatting functions
function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}
function formatDT(__dt) {
    var year = __dt.getFullYear();
    var month = zeroPad(__dt.getMonth()+1, 2);
    var date = zeroPad(__dt.getDate(), 2);
    // var hours = zeroPad(__dt.getHours(), 2);
    // var minutes = zeroPad(__dt.getMinutes(), 2);
    // var seconds = zeroPad(__dt.getSeconds(), 2);
    return   month + '/'+ date + '/'+ year.toString().slice(2,4) //+ ' ' + hours + ':' + minutes + ':' + seconds;
};
function formatDTJulian(__dt) {
    // var year = __dt.getFullYear();
    var month = zeroPad(__dt.getMonth()+1, 2);
    var date = zeroPad(__dt.getDate(), 2);
    // var hours = zeroPad(__dt.getHours(), 2);
    // var minutes = zeroPad(__dt.getMinutes(), 2);
    // var seconds = zeroPad(__dt.getSeconds(), 2);
    return  month + '/' + date ;//+ ' ' + hours + ':' + minutes + ':' + seconds;
};

Date.fromDayofYear= function(n, y){
    if(!y) y= new Date().getFullYear();
    var d= new Date(y, 0, 1);
    return new Date(d.setMonth(0, n));
}
Date.prototype.dayofYear= function(){
    var d= new Date(this.getFullYear(), 0, 0);
    return Math.floor((this-d)/8.64e+7);
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Create a dual range slider
//Possible modes are : 'date','julian',or null
//Default mode is 'date', must specify mode as null to use vanilla numbers
function setUpDualRangeSlider(var1,var2,min,max,defaultMin,defaultMax,step,sliderID,updateID,mode){
    // var dt_from = "2000/11/01";
  // var dt_to = "2015/11/24";
// $("#"+updateID +" .ui-slider .ui-slider-handle").css( {"width": '3px'} );
  if(mode === undefined  || mode === null){mode = 'date'};
  if(defaultMin === undefined  || defaultMin   === null){defaultMin  = min};
  if(defaultMax === undefined  || defaultMax   === null){defaultMax  = max};
  // if(step === undefined  || step === null){step = 1};

  if(mode === 'date'){
    min = new Date(min);
    max = new Date(max);
    step = step *24*60*60;
    defaultMin   = new Date(defaultMin);
    defaultMax   = new Date(defaultMax);
    // step = step*60*60*24
    $( "#"+updateID).html(formatDT(defaultMin)+ ' - ' + formatDT(defaultMax));
  }
  else if(mode === 'julian'){
    min = Date.fromDayofYear(min);
    max = Date.fromDayofYear(max);
    step = step *24*60*60;
    defaultMin = Date.fromDayofYear(defaultMin);
    defaultMax = Date.fromDayofYear(defaultMax);
    $( "#"+updateID).html(formatDTJulian(defaultMin)+ ' - ' + formatDTJulian(defaultMax));
  }
  else{$( "#"+updateID).html(defaultMin.toString()+ ' - ' + defaultMax.toString());}
  
  if(mode === 'date' || mode === 'julian'){
  var minVal = Date.parse(min)/1000;
  var maxVal = Date.parse(max)/1000;
  var minDefault = Date.parse(defaultMin)/1000;
  var maxDefault = Date.parse(defaultMax)/1000;
  }
  else{
    var minVal = min;
    var maxVal = max;
    var minDefault = defaultMin;
    var maxDefault = defaultMax;
  }

      $("#"+sliderID).slider({
        range:true,
         min: minVal,
    max: maxVal,
    step: step,
    values: [minDefault, maxDefault],

    slide: function(e,ui){

      if(mode === 'date'){
      var value1 = ui.values[0]*1000;
      var value2 = ui.values[1]*1000;

      var value1Show  = formatDT(new Date(value1));
      var value2Show  = formatDT(new Date(value2));

      // value1 = new Date(value1);
      // value2 = new Date(value2);
      $( "#"+updateID ).html(value1Show.toString() + ' - ' + value2Show.toString());
      
      eval(var1 + '= new Date('+ value1.toString()+')');
      eval(var2 + '= new Date('+ value2.toString()+')');
        }
      else if(mode === 'julian'){
      var value1 = new Date(ui.values[0]*1000);
      var value2 = new Date(ui.values[1]*1000);

      var value1Show  = formatDTJulian(value1);
      var value2Show  = formatDTJulian(value2);
      value1 =value1.dayofYear();
      value2 = value2.dayofYear();
      
    $( "#"+updateID ).html(value1Show.toString() + ' - ' + value2Show.toString());
          
          eval(var1 + '= '+ value1.toString());
          eval(var2 + '= '+ value2.toString());
            }
          else{
          var value1 = ui.values[0];
          var value2 = ui.values[1];

          var value1Show  = value1;
          var value2Show  = value2;

          $( "#"+updateID ).html(value1Show.toString() + ' - ' + value2Show.toString());
          
          eval(var1 + '= '+ value1.toString());
          eval(var2 + '= '+ value2.toString());
          }
        }
          }); 
  }
//Wrapper function to add a dual range slider
function addDualRangeSlider(containerDivID,title,var1,var2,min,max,defaultMin,defaultMax,step,sliderID,mode,tooltip){
	if(tooltip === null || tooltip === undefined){tooltip = ''};
	
	// setUpRangeSlider('startYear', 'endYear', 1985, 2018, startYear, endYear, 1, 'slider1', 'date-range-value1', 'null');
	$('#'+containerDivID).append(`<div  id="${sliderID}-container"class='dual-range-slider-container px-1' title="${tooltip}">
							        <div class='dual-range-slider-name pt-2 pb-3'>${title}</div>
							        <div id="${sliderID}" class='dual-range-slider-slider' href = '#'></div>
							        <div id='${sliderID}-update' class='dual-range-slider-value p-2'></div>
							    </div>`);
	setUpDualRangeSlider(var1,var2,min,max,defaultMin,defaultMax,step,sliderID,sliderID+ '-update',mode)

}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to add single range slider
function setUpRangeSlider(variable,min,max,defaultValue,step,sliderID,mode){
    eval(`window.${variable} = ${defaultValue};`);
    $('#'+sliderID + '-update').html(defaultValue);
    $("#"+sliderID).slider({
        min: min,
        max:max,
        step: step,
        value: defaultValue,
        slide: function(e,ui){
            eval(`window.${variable} = ${ui.value};`);
            $('#'+sliderID + '-update').empty();
            $('#'+sliderID + '-update').html(ui.value);
        }
    })
}
//Wrapper for single range slider
function addRangeSlider(containerDivID,title,variable,min,max,defaultValue,step,sliderID,mode,tooltip){
    $('#'+containerDivID).append(`<div  class='dual-range-slider-container px-1' title="${tooltip}">
                                    <div class='dual-range-slider-name pt-2 pb-3'>${title}</div>
                                    <div id="${sliderID}" class='dual-range-slider-slider' href = '#'></div>
                                    <div id='${sliderID}-update' class='dual-range-slider-value p-2'></div>
                                </div>`);
    setUpRangeSlider(variable,min,max,defaultValue,step,sliderID,mode);
}
 //////////////////////////////////////////////////////////////////////////////////////////////
//More Bootstrap element creators
//Function to add tab to list
function addTab(tabTitle,tabListID, divListID,tabID, divID,tabOnClick,divHTML,tabToolTip,selected){  
  if(!tabToolTip){tabToolTip = ''};
  var show;
  if(selected || selected === 'true'){show = 'active show'}else{show = ''};

  $("#" + tabListID ).append(`<li class="nav-item"><a onclick = '${tabOnClick}' class="nav-link text-left text-dark tab-nav-link ${show}" id="'+tabID+'" data-toggle="tab" href="#${divID}" role="tab" aria-controls="${divID}" aria-selected="false" title="${tabToolTip}">${tabTitle}</a></li>`);

  $('#'+divListID).append($(`<div class="tab-pane fade ${show}" id="${divID}" role="tabpanel" aria-labelledby="${tabID}" title="${tabToolTip}"></div>`).append(divHTML))

    };
/////////////////////////////////////////////////////////////////////////////////////////////
function addTabContainer(containerID,tabListID,divListID){
	$('#'+ containerID).append(`<ul class="pb-1 nav nav-tabs flex-column nav-justified md-tabs" id="${tabListID}" role="tablist">  
    </ul>
    <div class = 'tab-content card' id = '${divListID}'>
    </div>`);
}
// function addAccordianContainer(containerID,tabListID,divListID){
// 	$('#'+ containerID).append(`<ul class="pb-1 nav nav-tabs flex-column nav-justified md-tabs" id="${tabListID}" role="tablist">  
//     </ul>
//     <div class = 'tab-content card' id = '${divListID}'>
//     </div>`);
// }
//////////////////////////////////////////////////////////////////////////////////////////////
function addCollapse(containerID,collapseLabelID,collapseID,collapseLabel, collapseLabelIcon,show,onclick,toolTip){
	var collapsed;
	if(toolTip === undefined || toolTip === null){toolTip = ''}
	if(show === true || show === 'true' || show === 'show'){show = 'show';collapsed = ''; }else{show = '';collapsed='collapsed'}
	var collapseTitleDiv = `<header title="${toolTip}" class="panel-heading px-3 py-2 " role="tab" id="${collapseLabelID}" onclick = '${onclick}'>
	<h2 class="p-0 m-0 panel-title  ${collapsed}" data-toggle="collapse"  href="#${collapseID}" id="${collapseLabelID}-label" aria-expanded="${show}" aria-controls="${collapseID}"> <a class = 'collapse-title' role='img'>
	${collapseLabelIcon} ${collapseLabel} </a></h2><span id="${collapseLabelID}-message"</span></header>`;

	var collapseDiv =`<section id="${collapseID}" class="panel-collapse collapse panel-body ${show} px-5 py-0" role="tabpanel" aria-labelledby="${collapseLabelID}"></section>`;
    $('#'+containerID).append(`<div role="listitem" id="${collapseLabelID}-${collapseID}"></div>`)
	$(`#${collapseLabelID}-${collapseID}`).append(collapseTitleDiv);
	$(`#${collapseLabelID}-${collapseID}`).append(collapseDiv);
}
//////////////////////////////////////////////////////////////////////////////////////////////
function addSubCollapse(containerID,collapseLabelID,collapseID,collapseLabel, collapseLabelIcon,show,onclick){
	var collapsed;
	if(show === true || show === 'true' || show === 'show'){show = 'show';collapsed = ''; }else{show = '';collapsed='collapsed'}


	var collapseTitleDiv = `<div >
                                <div   class="panel-heading px-0 py-2 " role="tab" id="${collapseLabelID}" onclick = '${onclick}'>
	                           <h5 class="sub-panel-title ${collapsed}" data-toggle="collapse"  href="#${collapseID}" aria-expanded="false" aria-controls="${collapseID}" > <a class = 'collapse-title' >${collapseLabelIcon} ${collapseLabel} </a></h5>
                                </div>
                            </div`;

	var collapseDiv =`<div id="${collapseID}" class="panel-collapse collapse panel-body ${show} px-1 py-0" role="tabpanel" aria-labelledby="${collapseLabelID}"></div>`;
	$('#'+containerID).append(collapseTitleDiv);
	$('#'+containerID).append(collapseDiv);
}
//////////////////////////////////////////////////////////////////////////////////////////////
function addAccordianContainer(parentContainerID,accordianContainerID){
  $('#' + parentContainerID).append(`<div class="accordion" id="${accordianContainerID}"></div>`);
    
}
//////////////////////////////////////////////////////////////////////////////////////////////
var panelCollapseI = 1;
function addAccordianCard(accordianContainerID,accordianCardHeaderID, accordianCardBodyID,accordianCardHeaderContent,accordianCardBodyContent,show,onclick,toolTip){
  var collapsed;
  if(toolTip === undefined || toolTip === null){toolTip = '';}
  if(show === true || show === 'true' || show === 'show'){show = 'show';collapsed = ''; }else{show = '';collapsed='collapsed'}
  $('#' + accordianContainerID).append(`
    <div>
      <div class=" px-0 py-2 sub-panel-title ${collapsed}" id="${accordianCardHeaderID}" data-toggle="collapse" data-target="#${accordianCardBodyID}"
        aria-expanded="false" aria-controls="${accordianCardBodyID}" onclick = '${onclick}'>
      <a class = 'collapse-title' title="${toolTip}"  >
        ${accordianCardHeaderContent} </a>
      </div>
      <div id="${accordianCardBodyID}" class="panel-collapse-${panelCollapseI} super-panel-collapse panel-collapse collapse panel-body pl-3 py-0  ${show} bg-black" aria-labelledby="${accordianCardHeaderID}"
        data-parent="#${accordianContainerID}">
        <div title="${toolTip}">${accordianCardBodyContent}</div>
      </div>
    </div>`)
  // $('#'+accordianCardBodyID+'.super-panel-collapse').on('hidden.bs.collapse', function () {
  	// find the children and close them
  	// $(!this).find('.show').collapse('hide');
  	// console.log('hello')
  	// $('.panel-collapse.show.collapse.toggle-collapse').collapse('hide');
  	// stopAllTools();
	// });
  panelCollapseI++;
}
//////////////////////////////////////////////////////////////////////////////////////////////
function addSubAccordianCard(accordianContainerID,accordianCardHeaderID, accordianCardBodyID,accordianCardHeaderContent,accordianCardBodyContent,show,onclick,toolTip){
  var collapsed;
  if(toolTip === undefined || toolTip === null){toolTip = '';}
  if(show === true || show === 'true' || show === 'show'){show = 'show';collapsed = ''; }else{show = '';collapsed='collapsed'}
  $('#' + accordianContainerID).append(`
    <div>
      <div class=" px-0 py-2 sub-sub-panel-title ${collapsed}" id="${accordianCardHeaderID}" data-toggle="collapse" data-target="#${accordianCardBodyID}"
        aria-expanded="false" aria-controls="${accordianCardBodyID}" onclick = '${onclick}'>
      <a class = 'collapse-title' title="${toolTip}"  >
        ${accordianCardHeaderContent} </a>
      </div>
      <div id="${accordianCardBodyID}" class="panel-collapse-${panelCollapseI} toggle-collapse panel-collapse collapse panel-body pl-3 py-0  ${show} bg-black" aria-labelledby="${accordianCardHeaderID}"
        data-parent="#${accordianContainerID}">
        <div title="${toolTip}">${accordianCardBodyContent}</div>
      </div>
    </div>`)
 //  $('.panel-collapse.toggle-collapse').on('hidden.bs.collapse', function () {
 //  	console.log('hello')
 //  	// find the children and close them
 //  	$(this).find('.show').collapse('hide');
 //  	// $('.panel-collapse.show.collapse.toggle-collapse').collapse('hide');
	// });
  
  panelCollapseI++;
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Functions to run the walk through
function getWalkThroughCollapseContainerID(){
    var collapseContainer;
    if($(window).width() < 576){collapseContainer = 'sidebar-left' }
    else{collapseContainer = 'legendDiv';}
    return collapseContainer
}
function moveCollapse(baseID){
    var collapseContainer =getWalkThroughCollapseContainerID();
    $('#'+baseID+'-label').detach().appendTo('#'+collapseContainer);
    $('#'+baseID+'-div').detach().appendTo('#'+collapseContainer);
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Legend functions
function addLegendCollapse(){
    var collapseContainer =getWalkThroughCollapseContainerID(); 
    addCollapse(collapseContainer,'legend-collapse-label','legend-collapse-div','LEGEND','<i class="fa fa-location-arrow fa-rotate-45 mx-1" aria-hidden="true"></i>',true,``,'LEGEND of the layers displayed on the map')
    // $('#legend-collapse-div').append(`<legend-list   id="legend"></legend-list>`)
    $('#legend-collapse-div').append(`<div role="list" id="legend-layer-list"></div>`);
    $('#legend-collapse-div').append(`<div role="list" id="legend-reference-layer-list"></div>`);
    $('#legend-collapse-div').append(`<div role="list" id="legend-fhp-div"></div>`);
    $('#legend-collapse-div').append(`<div role="list" id="time-lapse-legend-list"></div>`);
    $('#legend-collapse-div').append(`<div role="list" id="legend-area-charting-select-layer-list"></div>`);
}
function addLegendContainer(legendContainerID,containerID,show,toolTip){
	if(containerID === undefined || containerID === null){containerID = 'legend-collapse-div'}
	if(show === undefined || show === null){show = true}
	if(show){show = 'block'}
	else{show = 'none'}
	$('#' + containerID).prepend(`<div class = 'py-2 row' title= '${toolTip}' style = 'display:${show};' id = '${legendContainerID}'>
								</div>`);
}

function addClassLegendContainer(classLegendContainerID,legendContainerID,classLegendTitle){
	$('#'+legendContainerID).append(`<div class='my-legend'>
										<div class = 'legend-title'>${classLegendTitle}</div>
										<div class='legend-scale'>
									  		<ul class='legend-labels' id = '${classLegendContainerID}'></ul>
										</div>
									</div>`)
}
function addClassLegendEntry(classLegendContainerID,obj){
	$('#'+classLegendContainerID).append(`<li><span style='border: ${obj.classStrokeWeight}px solid #${obj.classStrokeColor};background:#${obj.classColor};'></span>${obj.className}</li>`)
}

function addColorRampLegendEntry(legendContainerID,obj){
	$('#'+legendContainerID).append(`<li class = 'legend-colorRamp' title= '${obj.helpBoxMessage}'>
							            <div class = 'legend-title'>${obj.name}</div>
							            <div class = 'colorRamp'style='${obj.colorRamp};'></div>
							            <div>
							                <span class = 'leftLabel'>${obj.min}</span>
							                <span class = 'rightLabel'>${obj.max}</span>
							            </div>
							            
							        </li> `)
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to disable rerun button when there are still outstanding GEE requests
function regulateReRunButton(){
	if(outstandingGEERequests > 0){
		$('#reRun-button').prop('disabled',true);
		$('#reRun-button').prop('title',staticTemplates.reRunButtonDisabledTooltip);
	}
	else{
		$('#reRun-button').prop('disabled',false);
		$('#reRun-button').prop('title',staticTemplates.reRunButtonEnabledTooltip);
	}
} 
//Function to help keep track of GEE requests
function updateOutstandingGEERequests(){
    // $('#loading-number-box').html(outstandingGEERequests)
	$('#outstanding-gee-requests').html(outstandingGEERequests);
	regulateReRunButton();
}
function updateGEETileLayersLoading(){
	$('#number-gee-tiles-downloading').html(geeTileLayersDownloading);
}
function incrementOutstandingGEERequests(){
	outstandingGEERequests ++;updateOutstandingGEERequests();
}
function decrementOutstandingGEERequests(){
	outstandingGEERequests --;updateOutstandingGEERequests();
}

function incrementGEETileLayersLoading(){
	geeTileLayersDownloading++;updateGEETileLayersLoading();
}
function decrementGEETileLayersLoading(){
	geeTileLayersDownloading--;updateGEETileLayersLoading();
}
function updateGEETileLayersDownloading(){
    geeTileLayersDownloading = Object.values(layerObj).filter(function(v){return v.loading}).length;
    updateGEETileLayersLoading();
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function for adding map layers of various sorts to the map
//Map layers can be ee objects, geojson, dynamic map services, and tile map services

function addLayer(layer){

    //Initialize a bunch of variables
    layer.loadError = false;
	var id = layer.legendDivID;
    layer.id = id;
    var queryID = id + '-'+layer.ID;
	var containerID = id + '-container-'+layer.ID;
	var opacityID = id + '-opacity-'+layer.ID;
	var visibleID = id + '-visible-'+layer.ID;
	var spanID = id + '-span-'+layer.ID;
	var visibleLabelID = visibleID + '-label-'+layer.ID;
	var spinnerID = id + '-spinner-'+layer.ID;
    var selectionID = id + '-selection-list-'+layer.ID;
	var checked = '';
    layerObj[id] = layer;
    layer.wasJittered = false;
    layer.loading = false;
    layer.refreshNumber = refreshNumber;
	if(layer.visible){checked = 'checked'}
    
    if(layer.viz.isTimeLapse){
        // console.log(timeLapseObj[layer.viz.timeLapseID]);
        timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.push(id);
        timeLapseObj[layer.viz.timeLapseID].sliders.push(opacityID);
        timeLapseObj[layer.viz.timeLapseID].layerVisibleIDs.push(visibleID);

    }

    //Set up layer control container
	$('#'+ layer.whichLayerList).prepend(`<li id = '${containerID}' aria-label="Map layer controls container for ${layer.name}" class = 'layer-container'  title= '${layer.helpBoxMessage}'>
								           <div id="${opacityID}" aria-labelledby="${containerID}" Opacity range slider for ${layer.name}" class = 'simple-layer-opacity-range'></div>
								           <input  role="option" id="${visibleID}" aria-label="Layer visibility toggle checkbox for ${layer.name}" type="checkbox" ${checked}  />
								            <label class = 'layer-checkbox' id="${visibleLabelID}" aria-label="Layer visibility toggle checkbox for ${layer.name}" style = 'margin-bottom:0px;display:none;'  for="${visibleID}"></label>
								            <i id = "${spinnerID}" class="fa fa-spinner fa-spin layer-spinner" title='Waiting for layer service from Google Earth Engine'></i>
								            <i id = "${spinnerID}2" style = 'display:none;' class="fa fa-cog fa-spin layer-spinner" title='Waiting for map tiles from Google Earth Engine'></i>
								            <i id = "${spinnerID}3" style = 'display:none;' class="fa fa-cog fa-spin layer-spinner" title='Waiting for map tiles from Google Earth Engine'></i>
                                            
								            <span id = '${spanID}' aria-labelledby="${containerID}" class = 'layer-span'>${layer.name}</span>
								       </li>`);
    //Set up opacity slider
	$("#"+opacityID).slider({
        min: 0,
        max: 100,
        step: 1,
        value: layer.opacity*100,
    	slide: function(e,ui){
    		layer.opacity = ui.value/100;
    		// console.log(layer.opacity);
    		 if(layer.layerType !== 'geeVector' && layer.layerType !== 'geoJSONVector'){
                layer.layer.setOpacity(layer.opacity);
                
                
              }else{
    	            var style = layer.layer.getStyle();
    	            style.strokeOpacity = layer.opacity;
    	            style.fillOpacity = layer.opacity/layer.viz.opacityRatio;
    	            layer.layer.setStyle(style);
    	            if(layer.visible){layer.range}
                    }
            if(layer.visible){
            	layer.rangeOpacity = layer.opacity;
            }     
            layerObj[id].visible = layer.visible;
            layerObj[id].opacity = layer.opacity;
    		setRangeSliderThumbOpacity();
    		}
	})
	function setRangeSliderThumbOpacity(){
		$('#'+opacityID).css("background-color", 'rgba(55, 46, 44,'+layer.rangeOpacity+')')
	}
    //Progress bar controller
	function updateProgress(){
		var pct = layer.percent;
        if(pct === 100 && (layer.layerType === 'geeImage' || layer.layerType === 'geeVectorImage' || layer.layerType === 'geeImageCollection')){jitterZoom()}
		$('#'+containerID).css('background',`-webkit-linear-gradient(left, #FFF, #FFF ${pct}%, transparent ${pct}%, transparent 100%)`)
	}
	//Function for zooming to object
	function zoomFunction(){

		if(layer.layerType === 'geeVector' ){
			centerObject(layer.item)
		}else if(layer.layerType === 'geoJSONVector'){
			// centerObject(ee.FeatureCollection(layer.item.features.map(function(t){return ee.Feature(t).dissolve(100,ee.Projection('EPSG:4326'))})).geometry().bounds())
			// synchronousCenterObject(layer.item.features[0].geometry)
		}else{
          
			if(layer.item.args !== undefined && layer.item.args.value !== null && layer.item.args.value !== undefined){
				synchronousCenterObject(layer.item.args.value)
			}
            else if(layer.item.args !== undefined &&layer.item.args.featureCollection !== undefined &&layer.item.args.featureCollection.args !== undefined && layer.item.args.featureCollection.args.value !== undefined && layer.item.args.featureCollection.args.value !== undefined){
                synchronousCenterObject(layer.item.args.featureCollection.args.value);
            };
		}
	}
    //Try to handle load failures
    function loadFailure(failure){
        layer.loadError = true;
        console.log('GEE Tile Service request failed for '+layer.name);
        console.log(containerID)
        $('#'+containerID).css('background','red');
        $('#'+containerID).attr('title','Layer failed to load. Error message: "'+failure + '"')
        // getGEEMapService();
    }
    //Function to handle turning off of different types of layers
    function turnOff(){
        ga('send', 'event', 'layer-off', layer.layerType,layer.name);
        if(layer.layerType === 'dynamicMapService'){
            layer.layer.setMap(null);
            layer.visible = false;
            layer.percent = 0;
            layer.rangeOpacity = 0;
            setRangeSliderThumbOpacity();
            updateProgress();
            $('#'+layer.legendDivID).hide();
        } else if(layer.layerType !== 'geeVector' && layer.layerType !== 'geoJSONVector'){
            layer.visible = false;
            layer.map.overlayMapTypes.setAt(layer.layerId,null);
            layer.percent = 0;
            updateProgress();
            $('#'+layer.legendDivID).hide();
            layer.rangeOpacity = 0;
            if(layer.layerType !== 'tileMapService' && layer.layerType !== 'dynamicMapService' && layer.canQuery){
             queryObj[queryID].visible = layer.visible;
            }
        }else{
            layer.visible = false;
            
            layer.percent = 0;
            updateProgress();
            $('#'+layer.legendDivID).hide();
            layer.layer.setMap(null);
            layer.rangeOpacity = 0;
            $('#' + spinnerID+'2').hide();
            // geeTileLayersDownloading = 0;
            // updateGEETileLayersLoading();
            if(layer.layerType === 'geeVector' && layer.canQuery){
                queryObj[queryID].visible = layer.visible;
            }
            
        }
        layer.loading = false;
        updateGEETileLayersDownloading();
            
        $('#'+spinnerID + '2').hide();
        $('#'+spinnerID + '3').hide();
        vizToggleCleanup();
    }
    //Function to handle turning on different layer types
    function turnOn(){
        ga('send', 'event', 'layer-on', layer.layerType,layer.name);
        if(!layer.viz.isTimeLapse){
            turnOffTimeLapseCheckboxes();
        }
        if(layer.layerType === 'dynamicMapService'){
            layer.layer.setMap(map);
            layer.visible = true;
            layer.percent = 100;
            layer.rangeOpacity = layer.opacity;
            setRangeSliderThumbOpacity();
            updateProgress();
            $('#'+layer.legendDivID).show();
        } else if(layer.layerType !== 'geeVector' && layer.layerType !== 'geoJSONVector'){
            layer.visible = true;
            layer.map.overlayMapTypes.setAt(layer.layerId,layer.layer);
            $('#'+layer.legendDivID).show();
            layer.rangeOpacity = layer.opacity;
            if(layer.isTileMapService){layer.percent = 100;updateProgress();}
            layer.layer.setOpacity(layer.opacity); 
            if(layer.layerType !== 'tileMapService' && layer.layerType !== 'dynamicMapService' && layer.canQuery){
             queryObj[queryID].visible = layer.visible;
            }
        }else{

           layer.visible = true;
            layer.percent = 100;
            updateProgress();
            $('#'+layer.legendDivID).show();
            layer.layer.setMap(layer.map);
            layer.rangeOpacity = layer.opacity;
            if(layer.layerType === 'geeVector' && layer.canQuery){
                queryObj[queryID].visible = layer.visible;
            }
        }
        vizToggleCleanup();
    }
    //Some functions to keep layers tidy
    function vizToggleCleanup(){
        setRangeSliderThumbOpacity();
        layerObj[id].visible = layer.visible;
        layerObj[id].opacity = layer.opacity;
    }
	function checkFunction(){
        if(!layer.loadError){
            if(layer.visible){
                turnOff();
            }else{turnOn()}  
        }
            
	}
    function turnOffAll(){  
        if(layer.visible){
            $('#'+visibleID).click();
        }
    }
    function turnOnAll(){
        if(!layer.visible){
            $('#'+visibleID).click();
        }
    }
	$("#"+ opacityID).val(layer.opacity * 100);

    //Handle double clicking
	var prevent = false;
	var delay = 200;
	$('#'+ spanID).click(function(){
		setTimeout(function(){
			if(!prevent){
				$('#'+visibleID).click();
			}
		},delay)
		
	});
    $('#'+ spinnerID + '2').click(function(){$('#'+visibleID).click();});
    //Try to zoom to layer if double clicked
	$('#'+ spanID).dblclick(function(){
            zoomFunction();
			prevent = true;
			zoomFunction();
			if(!layer.visible){$('#'+visibleID).click();}
			setTimeout(function(){prevent = false},delay)
		})

	//If checkbox is toggled
	$('#'+visibleID).change( function() {checkFunction();});
   

	layerObj[id].visible = layer.visible;
    layerObj[id].opacity = layer.opacity;
	
    //Handle different scenarios where all layers need turned off or on
    if(!layer.viz.isTimeLapse){
        $('.layer-checkbox').on('turnOffAll',function(){turnOffAll()});
    }
    if(layer.layerType === 'geeVector' || layer.layerType === 'geeVectorImage' || layer.layerType === 'geoJSONVector'){
        $('#'+visibleLabelID).addClass('vector-layer-checkbox');
        $('.vector-layer-checkbox').on('turnOffAll',function(){turnOffAll()});
        $('.vector-layer-checkbox').on('turnOnAll',function(){turnOnAll()});
        $('.vector-layer-checkbox').on('turnOffAllVectors',function(){turnOffAll()});
        $('.vector-layer-checkbox').on('turnOnAllVectors',function(){turnOnAll()});

        if(layer.viz.isUploadedLayer){
            $('#'+visibleLabelID).addClass('uploaded-layer-checkbox');
            selectionTracker.uploadedLayerIndices.push(layer.layerId)
            $('.vector-layer-checkbox').on('turnOffAllUploadedLayers',function(){turnOffAll()});
            $('.vector-layer-checkbox').on('turnOnAllUploadedLayers',function(){turnOnAll()});
        }
    }

    //Handle different object types
	if(layer.layerType === 'geeImage' || layer.layerType === 'geeVectorImage' || layer.layerType === 'geeImageCollection'){
        //Handle image colletions
        if(layer.layerType === 'geeImageCollection'){
            // layer.item = ee.ImageCollection(layer.item);
            layer.imageCollection = layer.item;

            if(layer.viz.reducer === null || layer.viz.reducer === undefined){
                layer.viz.reducer = ee.Reducer.lastNonNull();
            }
            var bandNames = ee.Image(layer.item.first()).bandNames();
            layer.item = ee.ImageCollection(layer.item).reduce(layer.viz.reducer).rename(bandNames).copyProperties(layer.imageCollection.first());
            
        //Handle vectors
        } else if(layer.layerType === 'geeVectorImage' || layer.layerType === 'geeVector'){

            if(layer.viz.isSelectLayer){
                
                selectedFeaturesJSON[layer.name] = {'layerName':layer.name,'filterList':[],'geoJSON':new google.maps.Data(),'id':layer.id,'rawGeoJSON':{},'selection':ee.FeatureCollection([])}
                // selectedFeaturesJSON[layer.name].geoJSON.setMap(layer.map);

                // layer.infoWindow = getInfoWindow(infoWindowXOffset);
                // infoWindowXOffset += 30;
                // selectedFeaturesJSON[layer.name].geoJSON.setStyle({strokeColor:invertColor(layer.viz.strokeColor)});
                // layer.queryVector = layer.item;  
                $('#'+visibleLabelID).addClass('select-layer-checkbox');
                $('.vector-layer-checkbox').on('turnOffAllSelectLayers',function(){turnOffAll()});
                $('.vector-layer-checkbox').on('turnOnAllSelectLayers',function(){turnOnAll()});
                $('.vector-layer-checkbox').on('turnOffAll',function(){turnOffAll()});
                $('.vector-layer-checkbox').on('turnOnAll',function(){turnOnAll()});
            }
            layer.queryItem = layer.item;
            if(layer.layerType === 'geeVectorImage'){
                layer.item = ee.Image().paint(layer.item,null,layer.viz.strokeWeight);
                layer.viz.palette = layer.viz.strokeColor;
            }
            //Add functionality for select layers to be clicked and selected
            if(layer.viz.isSelectLayer){
                var name;
                layer.queryItem.first().propertyNames().evaluate(function(propertyNames,failure){
                    if(failure !== undefined){showMessage('Error',failure)}
                    else{
                        propertyNames.map(function(p){
                            if(p.toLowerCase().indexOf('name') !== -1){name = p}
                        })
                        if(name === undefined){name = 'system:index'}
                        }
                    selectedFeaturesJSON[layer.name].fieldName = name
                    selectedFeaturesJSON[layer.name].eeObject = layer.queryItem.select([name],['name'])
                })
                
            }
            if(layer.viz.isSelectedLayer){
                $('#'+visibleLabelID).addClass('selected-layer-checkbox');
                $('.vector-layer-checkbox').on('turnOffAllSelectLayers',function(){turnOffAll()});
                $('.vector-layer-checkbox').on('turnOnAllSelectLayers',function(){turnOnAll()});
                $('.vector-layer-checkbox').on('turnOffAllSelectedLayers',function(){turnOffAll()});
                $('.vector-layer-checkbox').on('turnOnAllSelectedLayers',function(){turnOnAll()});
                selectionTracker.seletedFeatureLayerIndices.push(layer.layerId)
            }
            
          
        };
        //Add layer to query object if it can be queried
        if(layer.canQuery){
          queryObj[queryID] = {'visible':layer.visible,'queryItem':layer.queryItem,'queryDict':layer.viz.queryDict,'type':layer.layerType,'name':layer.name,'queryDateFormat':layer.viz.queryDateFormat};  
        }
		incrementOutstandingGEERequests();

		//Handle creating GEE map services
		function getGEEMapServiceCallback(eeLayer){
            decrementOutstandingGEERequests();
            $('#' + spinnerID).hide();
            if(layer.viz.isTimeLapse){
                timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs = timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.filter(timeLapseLayerID => timeLapseLayerID !== id)
                var prop = parseInt((1-timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length /timeLapseObj[layer.viz.timeLapseID].nFrames)*100);
                // $('#'+layer.viz.timeLapseID+'-loading-progress').css('width', prop+'%').attr('aria-valuenow', prop).html(prop+'% frames loaded');   
                $('#'+layer.viz.timeLapseID+ '-collapse-label').css('background',`-webkit-linear-gradient(left, #FFF, #FFF ${prop}%, transparent ${prop}%, transparent 100%)`)
                            
                // $('#'+layer.viz.timeLapseID+'-loading-count').html(`${timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length}/${timeLapseObj[layer.viz.timeLapseID].nFrames} layers to load`)
                if(timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length === 0){
                    $('#'+layer.viz.timeLapseID+'-loading-spinner').hide();
                    $('#'+layer.viz.timeLapseID+'-year-label').hide();
                    // $('#'+layer.viz.timeLapseID+'-loading-progress-container').hide();
                    $('#'+layer.viz.timeLapseID+ '-collapse-label').css('background',`-webkit-linear-gradient(left, #FFF, #FFF ${0}%, transparent ${0}%, transparent 100%)`)
                            
                    // $('#'+layer.viz.timeLapseID+'-icon-bar').show();
                    // $('#'+layer.viz.timeLapseID+'-time-lapse-layer-range-container').show();
                    $('#'+layer.viz.timeLapseID+'-toggle-checkbox-label').show();
                    
                    
                    timeLapseObj[layer.viz.timeLapseID].isReady = true;
                };
            }
            $('#' + visibleLabelID).show();
            
            if(layer.currentGEERunID === geeRunID){
                if(eeLayer === undefined){
                    loadFailure();
                }
                else{
                    //Set up GEE map service
                    var MAPID = eeLayer.mapid;
                    var TOKEN = eeLayer.token;
                    layer.highWaterMark = 0;
                    var tileIncremented = false;
                    var eeTileSource = new ee.layers.EarthEngineTileSource(eeLayer);
                    // console.log(eeTileSource)
                    layer.layer = new ee.layers.ImageOverlay(eeTileSource)
                    var overlay = layer.layer;
                    //Set up callback to keep track of tile downloading
                    layer.layer.addTileCallback(function(event){

                        event.count = event.loadingTileCount;
                        if(event.count > layer.highWaterMark){
                            layer.highWaterMark = event.count;
                        }

                        layer.percent = 100-((event.count / layer.highWaterMark) * 100);
                        if(event.count ===0 && layer.highWaterMark !== 0){layer.highWaterMark = 0}

                        if(layer.percent !== 100){
                            layer.loading = true;
                            $('#' + spinnerID+'2').show();
                            if(!tileIncremented){
                                incrementGEETileLayersLoading();
                                tileIncremented = true;
                                if(layer.viz.isTimeLapse){
                                    timeLapseObj[layer.viz.timeLapseID].loadingTilesLayerIDs.push(id);

                                }
                            }
                        }else{
                            layer.loading = false;
                            $('#' + spinnerID+'2').hide();
                            decrementGEETileLayersLoading();
                            if(layer.viz.isTimeLapse){
                                    timeLapseObj[layer.viz.timeLapseID].loadingTilesLayerIDs = timeLapseObj[layer.viz.timeLapseID].loadingTilesLayerIDs.filter(timeLapseLayerID => timeLapseLayerID !== id)
                
                                }
                            tileIncremented = false;
                        }
                        //Handle the setup of layers within a time lapse
                        if(layer.viz.isTimeLapse){
                            var loadingTimelapseLayers = Object.values(layerObj).filter(function(v){return v.loading && v.viz.isTimeLapse && v.whichLayerList === layer.whichLayerList});
                            var loadingTimelapseLayersYears = loadingTimelapseLayers.map(function(f){return [f.viz.year,f.percent].join(':')}).join(', ');
                            var notLoadingTimelapseLayers = Object.values(layerObj).filter(function(v){return !v.loading && v.viz.isTimeLapse && v.whichLayerList === layer.whichLayerList});
                            var notLoadingTimelapseLayersYears = notLoadingTimelapseLayers.map(function(f){return [f.viz.year,f.percent].join(':')}).join(', ');
                            $('#'+layer.viz.timeLapseID + '-message-div').html('Loading:<br>'+loadingTimelapseLayersYears+'<hr>Not Loading:<br>'+notLoadingTimelapseLayersYears);
                            var propTiles = parseInt((1-(timeLapseObj[layer.viz.timeLapseID].loadingTilesLayerIDs.length/timeLapseObj[layer.viz.timeLapseID].nFrames))*100);
                            // $('#'+layer.viz.timeLapseID+'-loading-progress').css('width', propTiles+'%').attr('aria-valuenow', propTiles).html(propTiles+'% tiles loaded');
                            $('#'+layer.viz.timeLapseID+ '-loading-gear').show();
                            
                            $('#'+layer.viz.timeLapseID+ '-collapse-label').css('background',`-webkit-linear-gradient(90deg, #FFF, #FFF ${propTiles}%, transparent ${propTiles}%, transparent 100%)`)
                            if(propTiles < 100){
                                // console.log(propTiles)
                                // if(timeLapseObj[layer.viz.timeLapseID] === 'play'){
                                // pauseButtonFunction();  
                                // }
                            }else{
                                $('#'+layer.viz.timeLapseID+ '-loading-gear').hide();
                            }
                        }

                        // var loadingLayers = Object.values(layerObj).filter(function(v){return v.loading});
                        // console.log(loadingLayers);
                        updateProgress();
                        // console.log(event.count);
                        // console.log(inst.highWaterMark);
                        // console.log(event.count / inst.highWaterMark);
                        // console.log(layer.percent)
                    });
                    if(layer.visible){
                            layer.map.overlayMapTypes.setAt(layer.layerId, layer.layer);
                            $('#'+layer.legendDivID).show();
                            layer.rangeOpacity = layer.opacity; 
                            
                            layer.layer.setOpacity(layer.opacity); 
                        }else{
                          $('#'+layer.legendDivID).hide();
                          layer.rangeOpacity = 0;
                          
                        }
                        setRangeSliderThumbOpacity(); 
                }
                
            }
        }
        function updateTimeLapseLoadingProgress(){
            var loadingTimelapseLayers = Object.values(layerObj).filter(function(v){return v.loading && v.viz.isTimeLapse && v.whichLayerList === layer.whichLayerList}).length;
            var notLoadingTimelapseLayers = Object.values(layerObj).filter(function(v){return !v.loading && v.viz.isTimeLapse && v.whichLayerList === layer.whichLayerList}).length;
            var total = loadingTimelapseLayers+notLoadingTimelapseLayers
            var propTiles = (1-(loadingTimelapseLayers/timeLapseObj[layer.viz.timeLapseID].nFrames))*100
            
            $('#'+layer.viz.timeLapseID+ '-collapse-label').css('background',`-webkit-linear-gradient(0deg, #FFF, #FFF ${propTiles}%, transparent ${propTiles}%, transparent 100%)`)
            if(propTiles < 100){
                $('#'+layer.viz.timeLapseID+ '-loading-gear').show();
                // console.log(propTiles)
                // if(timeLapseObj[layer.viz.timeLapseID] === 'play'){
                // pauseButtonFunction();  
                // }
            }else{
                $('#'+layer.viz.timeLapseID+ '-loading-gear').hide();
            }
            }
        //Handle alternative GEE tile service format
        function geeAltService(eeLayer,failure){
            decrementOutstandingGEERequests();
            $('#' + spinnerID).hide();
            if(layer.viz.isTimeLapse){
                timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs = timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.filter(timeLapseLayerID => timeLapseLayerID !== id)
                var prop = parseInt((1-timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length /timeLapseObj[layer.viz.timeLapseID].nFrames)*100);
                // $('#'+layer.viz.timeLapseID+'-loading-progress').css('width', prop+'%').attr('aria-valuenow', prop).html(prop+'% frames loaded');   
                $('#'+layer.viz.timeLapseID+ '-collapse-label').css('background',`-webkit-linear-gradient(left, #FFF, #FFF ${prop}%, transparent ${prop}%, transparent 100%)`)
                            
                // $('#'+layer.viz.timeLapseID+'-loading-count').html(`${timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length}/${timeLapseObj[layer.viz.timeLapseID].nFrames} layers to load`)
                if(timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length === 0){
                    $('#'+layer.viz.timeLapseID+'-loading-spinner').hide();
                    $('#'+layer.viz.timeLapseID+'-year-label').hide();
                    // $('#'+layer.viz.timeLapseID+'-loading-progress-container').hide();
                    $('#'+layer.viz.timeLapseID+ '-collapse-label').css('background',`-webkit-linear-gradient(left, #FFF, #FFF ${0}%, transparent ${0}%, transparent 100%)`)
                            
                    // $('#'+layer.viz.timeLapseID+'-icon-bar').show();
                    // $('#'+layer.viz.timeLapseID+'-time-lapse-layer-range-container').show();
                    $('#'+layer.viz.timeLapseID+'-toggle-checkbox-label').show();
                    
                    
                    timeLapseObj[layer.viz.timeLapseID].isReady = true;
                };
            }
            $('#' + visibleLabelID).show();
            
            if(layer.currentGEERunID === geeRunID){
                if(eeLayer === undefined || failure !== undefined){
                    loadFailure(failure);
                }
                else{
                    const tilesUrl = eeLayer.urlFormat;
                    
                    var getTileUrlFun = function(coord, zoom) {
                        var t = [coord,zoom];
                        
                        
                    let url = tilesUrl
                                .replace('{x}', coord.x)
                                .replace('{y}', coord.y)
                                .replace('{z}', zoom);
                    if(!layer.loading){
                        layer.loading = true;
                        layer.percent = 10;
                        $('#' + spinnerID+'2').show();
                        updateGEETileLayersDownloading();
                        updateProgress();
                        if(layer.viz.isTimeLapse){
                            updateTimeLapseLoadingProgress();  
                        }
                    }
                    
                    return url
                }
                    layer.layer = new google.maps.ImageMapType({
                            getTileUrl:getTileUrlFun
                        })

                    layer.layer.addListener('tilesloaded',function(){
                        layer.percent = 100;
                        layer.loading = false;
                        
                        
                        $('#' + spinnerID+'2').hide();
                        updateGEETileLayersDownloading();
                        updateProgress();
                        if(layer.viz.isTimeLapse){
                            updateTimeLapseLoadingProgress();  
                        }
                    })
                    
                    
                    if(layer.visible){
                        layer.map.overlayMapTypes.setAt(layer.layerId, layer.layer);
                        layer.rangeOpacity = layer.opacity; 
                        layer.layer.setOpacity(layer.opacity);
                        $('#'+layer.legendDivID).show();
                         }else{layer.rangeOpacity = 0;}
                         $('#' + spinnerID).hide();
                        $('#' + visibleLabelID).show();

                        setRangeSliderThumbOpacity();
                }
            }
        }
        //Asynchronous wrapper function to get GEE map service
        layer.mapServiceTryNumber = 0;
        function getGEEMapService(){
            // layer.item.getMap(layer.viz,function(eeLayer){getGEEMapServiceCallback(eeLayer)});
            
            //Handle embeded visualization params if available
            var vizKeys = Object.keys(layer.viz);
            var possibleVizKeys = ['bands','min','max','gain','bias','gamma','palette'];
            var vizFound = false;
            possibleVizKeys.map(function(k){
                var i = vizKeys.indexOf(k) > -1;
                if(i){vizFound = true}
            });
           
            if(vizFound == false){layer.usedViz = {}}
                else{layer.usedViz = layer.viz}
            // console.log(layer.usedViz);
            ee.Image(layer.item).getMap(layer.usedViz,function(eeLayer,failure){
                if(eeLayer === undefined && layer.mapServiceTryNumber <=1){
                    queryObj[queryID].queryItem = layer.item;
                    layer.item = layer.item.visualize();
                    getGEEMapService();
                }else{
                    geeAltService(eeLayer,failure);
                }  
            });

            // layer.item.getMap(layer.viz,function(eeLayer){
                // console.log(eeLayer)
                // console.log(ee.data.getTileUrl(eeLayer))
            // })
            layer.mapServiceTryNumber++;
        };
        getGEEMapService();

    //Handle different vector formats
	}else if(layer.layerType === 'geeVector' || layer.layerType === 'geoJSONVector'){
        if(layer.canQuery){
          queryObj[queryID] = {'visible':layer.visible,'queryItem':layer.queryItem,'queryDict':layer.viz.queryDict,'type':layer.layerType,'name':layer.name};  
        }
		incrementOutstandingGEERequests();
        //Handle adding geoJSON to map
		function addGeoJsonToMap(v){
			$('#' + spinnerID).hide();
			$('#' + visibleLabelID).show();

			if(layer.currentGEERunID === geeRunID){
                if(v === undefined){loadFailure()}
				layer.layer = new google.maps.Data();
               //  layer.viz.icon = {
               //    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
               //    scale: 5,
               //    strokeWeight:2,
               //    strokeColor:"#B40404"
               // }
		        layer.layer.setStyle(layer.viz);
		      
		      	layer.layer.addGeoJson(v);
                if(layer.viz.clickQuery){
                    map.addListener('click',function(){
                        infowindow.setMap(null);
                    })
                    layer.layer.addListener('click', function(event) {
                        console.log(event);
                        infowindow.setPosition(event.latLng);
                        var infoContent = `<table class="table table-hover bg-white">
                            <tbody>`
                        var info = event.feature.h;
                        Object.keys(info).map(function(name){
                            var value = info[name];
                            infoContent +=`<tr><th>${name}</th><td>${value}</td></tr>`;
                        });
                        infoContent +=`</tbody></table>`;
                        infowindow.setContent(infoContent);
                        infowindow.open(map);
                    })  
                }
		      	featureObj[layer.name] = layer.layer
		      	// console.log(this.viz);
		      
		      	if(layer.visible){
		        	layer.layer.setMap(layer.map);
		        	layer.rangeOpacity = layer.viz.strokeOpacity;
		        	layer.percent = 100;
		        	updateProgress();
		        	$('#'+layer.legendDivID).show();
		      	}else{
		        	layer.rangeOpacity = 0;
		        	layer.percent = 0;
		        	$('#'+layer.legendDivID).hide();
		      		}
		      	setRangeSliderThumbOpacity();
		      	}
  		}
  		if(layer.layerType === 'geeVector'){
            decrementOutstandingGEERequests();
  			layer.item.evaluate(function(v){addGeoJsonToMap(v)})
  		}else{decrementOutstandingGEERequests();addGeoJsonToMap(layer.item)}
	//Handle non GEE tile services	
	}else if(layer.layerType === 'tileMapService'){
		layer.layer = new google.maps.ImageMapType({
                getTileUrl: layer.item,
                tileSize: new google.maps.Size(256, 256),
                // tileSize: new google.maps.Size($('#map').width(),$('#map').height()),
                maxZoom: 15
            
            })
		if(layer.visible){
        	
        	layer.map.overlayMapTypes.setAt(layer.layerId, layer.layer);
        	layer.rangeOpacity = layer.opacity; 
        	layer.layer.setOpacity(layer.opacity); 
             }else{layer.rangeOpacity = 0;}
             $('#' + spinnerID).hide();
			$('#' + visibleLabelID).show();
			setRangeSliderThumbOpacity();
                
	//Handle dynamic map services
	}else if(layer.layerType === 'dynamicMapService'){
		function groundOverlayWrapper(){
	      if(map.getZoom() > layer.item[1].minZoom){
	        return getGroundOverlay(layer.item[1].baseURL,layer.item[1].minZoom,layer.item[1].ending)
	      }
	      else{
	        return getGroundOverlay(layer.item[0].baseURL,layer.item[0].minZoom,layer.item[0].ending)
	      }
	      };
	      function updateGroundOverlay(){
                if(layer.layer !== null && layer.layer !== undefined){
                    layer.layer.setMap(null);
                }
                
                layer.layer =groundOverlayWrapper();
                if(layer.visible){
                	layer.layer.setMap(map);
                	layer.percent = 100;
					updateProgress();
                	groundOverlayOn = true
              		$('#'+layer.legendDivID).show();
                	layer.layer.setOpacity(layer.opacity);
                	layer.rangeOpacity = layer.opacity;
                	
                }else{layer.rangeOpacity = 0};
                   setRangeSliderThumbOpacity();          

            };
            updateGroundOverlay();
            // if(layer.visible){layer.opacity = 1}
                // else{this.opacity = 0}
            google.maps.event.addListener(map,'zoom_changed',function(){updateGroundOverlay()});

            google.maps.event.addListener(map,'dragend',function(){updateGroundOverlay()});
             $('#' + spinnerID).hide();
			$('#' + visibleLabelID).show();
			setRangeSliderThumbOpacity();
	}
}


 /*This script constructs the page depending on the chosen mode*/
/*Put main elements on body*/
$('body').append(staticTemplates.map);

$('body').append(staticTemplates.mainContainer);
$('body').append(staticTemplates.sidebarLeftContainer);

$('body').append(staticTemplates.geeSpinner);
$('body').append(staticTemplates.bottomBar);

// $('#summary-spinner').show();

$('#main-container').append(staticTemplates.sidebarLeftToggler);

$('#sidebar-left-header').append(staticTemplates.topBanner);

$('#main-container').append(staticTemplates.introModal[mode]);
/////////////////////////////////////////////////////////////////////
/*Check to see if modals should be shown*/
if(localStorage['showIntroModal-'+mode] == undefined){
  localStorage['showIntroModal-'+mode] = 'true';
  }

$('#dontShowAgainCheckbox').change(function(){
  console.log(this.checked)
  localStorage['showIntroModal-'+mode]  = !this.checked;
});

/////////////////////////////////////////////////////////////////////
/*Add study area dropdown if LCMS*/
if(mode === 'LCMS-pilot' ){
  $('#title-banner').append(staticTemplates.studyAreaDropdown);
  if(studyAreaSpecificPage){
    $('#study-area-label').removeClass('dropdown-toggle');
  }else{
    Object.keys(studyAreaDict).map(function(k){addStudyAreaToDropdown(k,studyAreaDict[k].popOver);});
  }

}

$('#title-banner').append(staticTemplates.placesSearchDiv);
$('#title-banner').fitText(1.2);
$('#study-area-label').fitText(1.8);


function toggleAdvancedOn(){
    $("#threshold-container").slideDown();
    $("#advanced-radio-container").slideDown();  
}
function toggleAdvancedOff(){
    $("#threshold-container").slideUp();
    $("#advanced-radio-container").slideUp();  
}
/////////////////////////////////////////////////////////////////////
/*Start adding elements to page based on chosen mode*/
if(mode === 'LCMS-pilot' || mode === 'LCMS'){
  var minYear = startYear;var maxYear = endYear;
  // console.log(urlParams)  
  if(urlParams.startYear == null || urlParams.startYear == undefined){
      urlParams.startYear = startYear;
  }
  if(urlParams.endYear == null || urlParams.endYear == undefined){
     urlParams.endYear = endYear;
  }
  if(urlParams.addLCMSTimeLapsesOn == null || urlParams.addLCMSTimeLapsesOn == undefined){
     urlParams.addLCMSTimeLapsesOn = 'no';
  }

  
  // console.log(urlParams)
 
  /*Construct panes in left sidebar*/
  addCollapse('sidebar-left','parameters-collapse-label','parameters-collapse-div','PARAMETERS','<i role="img" class="fa fa-sliders mr-1" aria-hidden="true"></i>',false,null,'Adjust parameters used to filter and sort LCMS products');
  addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div','LCMS DATA',`<img style = 'width:1.2em;height:1.1em;margin-top:-0.2em;margin-left:-0.1em' class='image-icon mr-1' alt="LCMS icon" src="images/lcms-icon.png">`,true,null,'LCMS DATA layers to view on map');
  // $('#layer-list-collapse-label').append(`<button class = 'btn' title = 'Refresh layers if tiles failed to load' id = 'refresh-tiles-button' onclick = 'jitterZoom()'><i class="fa fa-refresh"></i></button>`)
  addCollapse('sidebar-left','reference-layer-list-collapse-label','reference-layer-list-collapse-div','REFERENCE DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="images/layer_icon.png">`,false,null,'Additional relevant layers to view on map intended to provide context for LCMS DATA');
  
  addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');

  addCollapse('sidebar-left','download-collapse-label','download-collapse-div','DOWNLOAD DATA',`<i role="img" class="fa fa-cloud-download mr-1" aria-hidden="true"></i>`,false,``,'Download LCMS products for further analysis');
  addCollapse('sidebar-left','support-collapse-label','support-collapse-div','SUPPORT',`<i role="img" class="fa fa-question-circle mr-1" aria-hidden="true"></i>`,false,``,'If you need any help');

  // $('#parameters-collapse-div').append(staticTemplates.paramsDiv);

  //Construct parameters form
 
  if(['standard','advanced'].indexOf(urlParams.analysisMode) === -1){
    urlParams.analysisMode = 'standard'
  }
  if(['year','prob'].indexOf(urlParams.summaryMethod) === -1){
    urlParams.summaryMethod = 'year'
  }

  var tAnalysisMode = urlParams.analysisMode;
  var tAddLCMSTimeLapsesOn = urlParams.addLCMSTimeLapsesOn;
  if(mode === 'LCMS'){
    // $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
    // $('#parameters-collapse-div').append(`<p>Additional Functionality:</p>`);
  // $('#parameters-collapse-div').append(staticTemplates.addTimelapsesButton);
  addRadio('parameters-collapse-div','addTimeLapses-radio','Add LCMS Time Lapses:','No','Yes','urlParams.addLCMSTimeLapsesOn','no','yes','','','Add interactive time lapse of LCMS Change, Land Cover, and Land Use products. This will slow down the map loading');
  $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  if(tAddLCMSTimeLapsesOn === 'yes'){
    $('#addTimeLapses-radio-second_toggle_label').click();
  }
  }
  addRadio('parameters-collapse-div','analysis-mode-radio','Choose which mode:','Standard','Advanced','urlParams.analysisMode','standard','advanced','toggleAdvancedOff()','toggleAdvancedOn()','Standard mode provides the core LCMS products based on carefully selected parameters. Advanced mode provides additional LCMS products and parameter options')

  urlParams.analysisMode = tAnalysisMode ;
  $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);

  addDualRangeSlider('parameters-collapse-div','Choose analysis year range:','urlParams.startYear','urlParams.endYear',minYear, maxYear, urlParams.startYear, urlParams.endYear, 1,'analysis-year-slider','null','Years of LCMS data to include for land cover, land use, loss, and gain')
  

  $('#parameters-collapse-div').append(`<div class="dropdown-divider"></div>
                                          <div id='threshold-container' style="display:none;width:100%"></div>
                                          <div id='advanced-radio-container' style="display: none;"></div>`)

  if( mode === 'LCMS-pilot' ){
  addRangeSlider('threshold-container','Choose loss threshold:','lowerThresholdDecline',0, 1, lowerThresholdDecline, 0.05,'decline-threshold-slider','null',"Threshold window for detecting loss.  Any loss probability greater than or equal to this value will be flagged as loss ")
  $('#threshold-container').append(`<div class="dropdown-divider" ></div>`);
  addRangeSlider('threshold-container','Choose gain threshold:','lowerThresholdRecovery',0, 1, lowerThresholdRecovery, 0.05,'recovery-threshold-slider','null',"Threshold window for detecting gain.  Any gain probability greater than or equal to this value will be flagged as gain ")
  $('#advanced-radio-container').append(`<div class="dropdown-divider" ></div>`);
  $('#advanced-radio-container').append(`<div id = 'fast-slow-threshold-container' ></div>`);
  addRangeSlider('fast-slow-threshold-container','Choose slow loss threshold:','lowerThresholdSlowLoss',0, 1, lowerThresholdSlowLoss , 0.05,'slow-loss-threshold-slider','null',"Threshold window for detecting loss.  Any loss probability greater than or equal to this value will be flagged as loss ")
  $('#fast-slow-threshold-container').append(`<div class="dropdown-divider" ></div>`);
  addRangeSlider('fast-slow-threshold-container','Choose fast loss threshold:','lowerThresholdFastLoss',0, 1, lowerThresholdFastLoss, 0.05,'fast-loss-threshold-slider','null',"Threshold window for detecting loss.  Any loss probability greater than or equal to this value will be flagged as loss ")
  $('#advanced-radio-container').append(`<div class="dropdown-divider" ></div>`);

  addRadio('advanced-radio-container','treemask-radio','Constrain analysis to areas with trees:','Yes','No','applyTreeMask','yes','no','','','Whether to constrain LCMS products to only treed areas. Any area LCMS classified as tree cover 2 or more years will be considered tree. Will reduce commission errors typical in agricultural and water areas, but may also reduce changes of interest in these areas.')
  $('#advanced-radio-container').append(`<div class="dropdown-divider" ></div>`);
 }
  var tSummaryMethod = urlParams.summaryMethod;
  addRadio('advanced-radio-container','summaryMethod-radio','Summary method:','Most recent year','Highest prob','urlParams.summaryMethod','year','prob','','','How to choose which value for disturbance and growth to display.  Choose the value with the highest model confidence or from the most recent year above the threshold.');
  urlParams.summaryMethod = tSummaryMethod;

  $('#advanced-radio-container').append(`<div class="dropdown-divider" ></div>`);
  // addRadio('advanced-radio-container','whichIndex-radio','Index for charting:','NDVI','NBR','whichIndex','NDVI','NBR','','','The vegetation index that will be displayed in the "Query LCMS Time Series" tool')
  // $('#advanced-radio-container').append(`<div class="dropdown-divider" ></div>`);
  $('#parameters-collapse-div').append(staticTemplates.reRunButton);


  //Set up layer lists
  $('#layer-list-collapse-div').append(`<ul id="layer-list" class = "layer-list"></ul>`);
  $('#reference-layer-list-collapse-div').append(`<ul id="reference-layer-list" class = "layer-list"></ul>`);


  

  if(mode === 'LCMS'){
    function populateLCMSDownloads(){
      var toggler = document.getElementsByClassName("caret");
    var i;

    for (i = 0; i < toggler.length; i++) {
      toggler[i].addEventListener("click", function() {
        // console.log(this)
        this.parentElement.querySelector(".nested").classList.toggle("active");
        // this.parentElement.querySelector(".nested").classList.toggle("treeOff");
        this.classList.toggle("caret-down");
        // this.classList.toggle("treeOff");
      });
    }
    }
    $('#download-collapse-div').append(staticTemplates.lcmsProductionDownloadDiv);
    


  }else{
    $('#download-collapse-div').append(staticTemplates.downloadDiv);
  }
  $('#support-collapse-div').append(staticTemplates.supportDiv);

 
  if(tAnalysisMode === 'advanced'){
    $('#analysis-mode-radio-second_toggle_label').click();
  }
  if(tSummaryMethod === 'prob'){
    $('#summaryMethod-radio-second_toggle_label').click();
  }

}else if(mode === 'lcms-base-learner'){
  canExport = false;
  startYear = 1984;endYear = 2021;
  var minYear = startYear;var maxYear = endYear;
  if(urlParams.startYear == null || urlParams.startYear == undefined){
      urlParams.startYear = startYear;// = parseInt(urlParams.startYear);
  }
  if(urlParams.endYear == null || urlParams.endYear == undefined){
     urlParams.endYear = endYear;// = parseInt(urlParams.endYear);
  }
  if(urlParams.lossMagThresh == null || urlParams.lossMagThresh == undefined){
     urlParams.lossMagThresh = -0.15;// = parseInt(urlParams.endYear);
  }
  if(urlParams.gainMagThresh == null || urlParams.gainMagThresh == undefined){
     urlParams.gainMagThresh = 0.1;// = parseInt(urlParams.endYear);
  }

  if(urlParams.whichIndices2 == null || urlParams.whichIndices2 == undefined){
     urlParams.whichIndices2 = {'nir':false,'swir1':false,'swir2':false,'NBR':true,'NDVI':false};
  }
  
  addCollapse('sidebar-left','parameters-collapse-label','parameters-collapse-div','PARAMETERS','<i role="img" class="fa fa-sliders mr-1" aria-hidden="true"></i>',false,null,'Adjust parameters used to filter and sort LCMS products');

  addDualRangeSlider('parameters-collapse-div','Choose analysis year range:','urlParams.startYear','urlParams.endYear',minYear, maxYear, urlParams.startYear, urlParams.endYear, 1,'analysis-year-slider','null','Years of LCMS data to include for land cover, land use, loss, and gain')
addCheckboxes('parameters-collapse-div','index-choice-checkboxes','Choose which indices to analyze','whichIndices2',urlParams.whichIndices2)
  
  addSubCollapse('parameters-collapse-div','lt-params-label','lt-params-div','LANDTRENDR Params', '',false,'')
  // addSubCollapse('parameters-collapse-div','ccdc-params-label','ccdc-params-div','CCDC Params', '',false,'')
  
  addRangeSlider('lt-params-div','Loss Magnitude Threshold','urlParams.lossMagThresh',-0.8,-0.05,urlParams.lossMagThresh,0.05,'loss-mag-thresh-slider','','The threshold to detect loss for each LANDTRENDR segment.  Any difference for a given segement less than this threshold will be flagged as loss') 
  addRangeSlider('lt-params-div','Gain Magnitude Threshold','urlParams.gainMagThresh',0.05,0.8,urlParams.gainMagThresh,0.05,'gain-mag-thresh-slider','','The threshold to detect gain for each LANDTRENDR segment.  Any difference for a given segement greater than this threshold will be flagged as gain') 
  
  // addCheckboxes('ccdc-params-div','ccdc-index-choice-checkboxes','Choose which indices to include in CCDC fitted charts','whichIndices3',{'blue':false,'green':false,'red':false,'nir':false,'swir1':false,'swir2':false,'NBR':true,'NDVI':true,'NDMI':false,'wetness':false})
  // addRangeSlider('ccdc-params-div','Change Probability Threshold','ccdcChangeProbThresh',0,1,0.8,0.1,'ccdc-change-prob-thresh-slider','','The CCDC probabibility threshold to detect change.  Any probability for a given break greater than this threshold will be flagged as change') 
  
  // $('#lt-params-div').append(`<div class="dropdown-divider" ></div>`);
  $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  $('#parameters-collapse-div').append(staticTemplates.reRunButton);

  addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div','LCMS BASE LEARNER DATA',`<img style = 'width:1.2em;height:1.1em;margin-top:-0.2em;margin-left:-0.1em' class='image-icon mr-1' alt="LCMS icon" src="images/lcms-icon.png">`,true,null,'LCMS DATA layers to view on map');
  $('#layer-list-collapse-div').append(`<ul id="layer-list" class = "layer-list"></ul>`);
  addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');
  if(canExport){
    addCollapse('sidebar-left','download-collapse-label','download-collapse-div','DOWNLOAD DATA',`<i role="img" class="fa fa-cloud-download mr-1" aria-hidden="true"></i>`,false,``,'Download '+mode+' products for further analysis');
  }
  
}else if(mode === 'LT'){
  canExport = true;
  startYear = 1984;endYear = new Date().getYear()+1900;startJulian = 152;endJulian = 273;
  initialZoomLevel = 9;
  initialCenter = [37.64109979850402,-107.6917775643849];
  var minYear = startYear;var maxYear = endYear;
  if(urlParams.startYear == null || urlParams.startYear == undefined){
      urlParams.startYear = startYear;// = parseInt(urlParams.startYear);
  }
  if(urlParams.endYear == null || urlParams.endYear == undefined){
     urlParams.endYear = endYear;// = parseInt(urlParams.endYear);
  }
  if(urlParams.startJulian == null || urlParams.startJulian == undefined){
      urlParams.startJulian = startJulian;// = parseInt(urlParams.startYear);
  }
  if(urlParams.endJulian == null || urlParams.endJulian == undefined){
     urlParams.endJulian = endJulian;// = parseInt(urlParams.endYear);
  }

  addCollapse('sidebar-left','parameters-collapse-label','parameters-collapse-div','PARAMETERS','<i role="img" class="fa fa-sliders mr-1" aria-hidden="true"></i>',false,null,'Adjust parameters used to filter and sort '+mode+' products');
  
  addSubCollapse('parameters-collapse-div','comp-params-label','comp-params-div','Landsat Composite Params', '',false,'');
  $('#comp-params-div').append(`<div class="dropdown-divider" ></div>`);


  addDualRangeSlider('comp-params-div','Choose analysis year range:','urlParams.startYear','urlParams.endYear',minYear, maxYear, urlParams.startYear, urlParams.endYear, 1,'analysis-year-slider2','null','Years of '+mode+' data to include.')
  
  addDualRangeSlider('comp-params-div','Choose analysis date range:','urlParams.startJulian','urlParams.endJulian',1, 365, urlParams.startJulian, urlParams.endJulian, 1,'julian-day-slider','julian','Days of year of '+mode+' data to include for land cover, land use, loss, and gain')
    $('#comp-params-div').append(`<div class="dropdown-divider" ></div>`);

  if(urlParams.whichPlatforms === null || urlParams.whichPlatforms === undefined){
    urlParams.whichPlatforms = {"L5": true,"L7-SLC-On": true,"L7-SLC-Off": false,"L8": true}
  }
  addCheckboxes('comp-params-div','which-sensor-method-radio','Choose which Landsat platforms to include','whichPlatforms',urlParams.whichPlatforms);
  
    $('#comp-params-div').append(`<div class="dropdown-divider" ></div>`);

    if(urlParams.yearBuffer === null || urlParams.yearBuffer === undefined){
      urlParams.yearBuffer = 0
    }
    addRangeSlider('comp-params-div','Composite Year Buffer','urlParams.yearBuffer',0,2,urlParams.yearBuffer,1,'year-buffer-slider','','The number of adjacent years to include in a given year composite. (E.g. a value of 1 would mean the 2015 composite would have imagery from 2015 +- 1 year - 2014 to 2016)') 
   $('#comp-params-div').append(`<div class="dropdown-divider" ></div>`);

   if(urlParams.minObs === null || urlParams.minObs === undefined){
      urlParams.minObs = 3
    }
   addRangeSlider('comp-params-div','Minimum Number of Observations','urlParams.minObs',1,5,urlParams.minObs,1,'min-obs-slider','','Minimum number of observations needed for a pixel to be included. This helps reduce noise in composites. Any number less than 3 can result in poor composite quality') 
    $('#comp-params-div').append(`<div class="dropdown-divider" ></div>`);

  var compMethodDict = {"Median":false,"Medoid":true};
  if(urlParams.compMethod !== null && urlParams.compMethod !== undefined){
    Object.keys(compMethodDict).map(k => compMethodDict[k] = false);
    compMethodDict[urlParams.compMethod] = true;

  }
  addMultiRadio('comp-params-div','comp-method-radio','Compositing method','urlParams.compMethod',compMethodDict)
   $('#comp-params-div').append(`<div class="dropdown-divider" ></div>`);


  if(urlParams.whichCloudMasks === null || urlParams.whichCloudMasks === undefined){
    urlParams.whichCloudMasks = {'fMask-Snow':true,'cloudScore':false,'fMask-Cloud':true,'TDOM':false,'fMask-Cloud-Shadow':true};
  }
  addCheckboxes('comp-params-div','cloud-masking-checkboxes','Choose which cloud masking methods to use','whichCloudMasks',urlParams.whichCloudMasks)
   $('#comp-params-div').append(`<div class="dropdown-divider" ></div>`);

  var maskWaterDict = {"No":false,"Yes":true};
  if(urlParams.maskWater !== null && urlParams.maskWater !== undefined){
    Object.keys(maskWaterDict).map(k => maskWaterDict[k] = false);
    maskWaterDict[urlParams.maskWater] = true;

  }
  addMultiRadio('comp-params-div','water-mask-radio','Mask out water','urlParams.maskWater',maskWaterDict)
  
  // $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  // addRadio('parameters-collapse-div','cloudScore-cloud-radio','Apply CloudScore','No','Yes','applyCloudScore','no','yes','','',"Whether to apply Google's Landsat CloudScore algorithm")
  // $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  // addRadio('parameters-collapse-div','fmask-cloud-radio','Apply Fmask cloud mask','Yes','No','applyFmaskCloud','yes','no','','','Whether to apply Fmask cloud mask')
  // $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  // addRadio('parameters-collapse-div','fmask-cloud-shadow-radio','Apply Fmask cloud shadow mask','Yes','No','applyFmaskCloudShadow','yes','no','','','Whether to apply Fmask cloud shadow mask')
  
 
  
  addSubCollapse('parameters-collapse-div','lt-params-label','lt-params-div','LANDTRENDR Params', '',false,'')
  
  if(urlParams.whichIndices === null || urlParams.whichIndices === undefined){
    urlParams.whichIndices = {'NBR':true,'NDVI':false,'NDMI':false,'NDSI':false,'brightness':false,'greenness':false,'wetness':false,'tcAngleBG':false};
  }
  addCheckboxes('lt-params-div','index-choice-checkboxes','Choose which indices to analyze','whichIndices',urlParams.whichIndices)
  $('#lt-params-div').append(`<div class="dropdown-divider" ></div>`);

  var LTSortByDict = {"largest":true,"steepest":false,"newest":false, "oldest":false,  "shortest":false, "longest":false};
  if(urlParams.LTSortBy !== null && urlParams.LTSortBy !== undefined){
    Object.keys(LTSortByDict).map(k => LTSortByDict[k] = false);
    LTSortByDict[urlParams.LTSortBy] = true;

  }
  addMultiRadio('lt-params-div','lt-sort-radio','Choose method to summarize LANDTRENDR change','urlParams.LTSortBy',LTSortByDict)
  

  if(urlParams.lossMagThresh === null || urlParams.lossMagThresh === undefined){
      urlParams.lossMagThresh = -0.15;
    }
  addRangeSlider('lt-params-div','Loss Magnitude Threshold','urlParams.lossMagThresh',-0.8,0,urlParams.lossMagThresh,0.01,'loss-mag-thresh-slider','','The threshold to detect loss for each LANDTRENDR segment.  Any difference between start and end values for a given segement less than this threshold will be flagged as loss') 

  if(urlParams.lossSlopeThresh === null || urlParams.lossSlopeThresh === undefined){
      urlParams.lossSlopeThresh = -0.10;
    }
  addRangeSlider('lt-params-div','Loss Slope Threshold','urlParams.lossSlopeThresh',-0.8,0,urlParams.lossSlopeThresh,0.01,'loss-slope-thresh-slider','','The threshold to detect loss for each LANDTRENDR segment.  Any slope of a given segement less than this threshold will be flagged as loss') 
  
  if(urlParams.gainMagThresh === null || urlParams.gainMagThresh === undefined){
      urlParams.gainMagThresh = 0.10;
    }
  addRangeSlider('lt-params-div','Gain Magnitude Threshold','urlParams.gainMagThresh',0.01,0.8,urlParams.gainMagThresh,0.01,'gain-mag-thresh-slider','','The threshold to detect gain for each LANDTRENDR segment.  Any difference between start and end values for a given segement greater than this threshold will be flagged as gain');

  if(urlParams.gainSlopeThresh === null || urlParams.gainSlopeThresh === undefined){
      urlParams.gainSlopeThresh = 0.10;
    }
  addRangeSlider('lt-params-div','Gain Slope Threshold','urlParams.gainSlopeThresh',0.01,0.8,urlParams.gainSlopeThresh,0.01,'gain-slope-thresh-slider','','The threshold to detect gain for each LANDTRENDR segment.  Any slope of a given segement greater than this threshold will be flagged as gain') 
  
  if(urlParams.howManyToPull === null || urlParams.howManyToPull === undefined){
      urlParams.howManyToPull = 1;
    }
  addRangeSlider('lt-params-div','How Many','urlParams.howManyToPull',1,3,urlParams.howManyToPull,1,'how-many-slider','','The number of gains and losses to show. Typically an area only experiences a single loss/gain event, but in the cases where there are multiple above the specified thresholds, they can be shown.');

  if(urlParams.maxSegments === null || urlParams.maxSegments === undefined){
      urlParams.maxSegments = 6;
    }
  addRangeSlider('lt-params-div','Max LANDTRENDR Segments','urlParams.maxSegments',1,8,urlParams.maxSegments,1,'max-segments-slider','','The max number of segments LANDTRENDR can break time series into.  Generally 3-6 works well. Use a smaller number of characterizing long-term trends is the primary focus and a larger number if characterizing every little change is the primary focus.') 
  
  $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  $('#parameters-collapse-div').append(staticTemplates.reRunButton);
  addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div','MAP DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layer icon" src="images/layer_icon.png">`,true,null,mode+' DATA layers to view on map');
  $('#layer-list-collapse-div').append(`<ul id="layer-list" class = "layer-list"></ul>`);

  addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');
  addCollapse('sidebar-left','download-collapse-label','download-collapse-div','DOWNLOAD DATA',`<i role="img" class="fa fa-cloud-download mr-1" aria-hidden="true"></i>`,false,``,'Download '+mode+' products for further analysis');
  
}else if(mode === 'MTBS'){
  startYear = 1984;
  endYear = 2020;
  if(urlParams.startYear == null || urlParams.startYear == undefined){
      urlParams.startYear = startYear;
  }
  if(urlParams.endYear == null || urlParams.endYear == undefined){
     urlParams.endYear = endYear;
  }
  addCollapse('sidebar-left','support-collapse-label','support-collapse-div','SUPPORT & FEEDBACK',`<i role="img" class="fa fa-question-circle mr-1" aria-hidden="true"></i>`,true,``,'');
  $('#support-collapse-div').append(staticTemplates.walkThroughButton);
    $('#support-collapse-div').append(`<div class="dropdown-divider"</div>`);
  $('#support-collapse-div').append(`<p>MTBS burned area boundaries and severity within the Data Explorer and MTBS web map services are updated regularly, but alignment of their update schedule may vary. Please visit the <a href="https://mtbs.gov/direct-download?tab=map-services&target=mtbs-data-explorer" target="_blank" > map services</a> section at MTBS.gov to verify the publication dates when making comparisons between the MTBS data available within these products/services.</p>`)
  $('#support-collapse-div').append(`<div class="dropdown-divider"</div>`);
  $('#support-collapse-div').append(`<p style = "margin-bottom:0px;">If you have any issues with this tool or have suggestions on how it could be improved, please <a href="https://www.mtbs.gov/contact" target="_blank" > contact us</a></p>`)
  // $('#support-collapse-div').append(`<div class="dropdown-divider mb-2"</div>`);
  addCollapse('sidebar-left','parameters-collapse-label','parameters-collapse-div','PARAMETERS','<i role="img" class="fa fa-sliders mr-1" aria-hidden="true"></i>',false,null,'Adjust parameters used to filter and sort MTBS products');
 
  var mtbsZoomToDict ={"All":true,"CONUS":false,"Alaska":false,"Hawaii":false,"Puerto-Rico":false};

  addMultiRadio('parameters-collapse-div','mtbs-zoom-to-radio','Zoom to MTBS Mapping Area','mtbsMappingArea',mtbsZoomToDict)
  $('#mtbs-zoom-to-radio').prop('title','Zoom to MTBS region')
  $( "#mtbs-zoom-to-radio" ).change(function() {
    console.log(mtbsMappingArea);
    synchronousCenterObject(clientBoundsDict[mtbsMappingArea])
  });
  $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  
  addDualRangeSlider('parameters-collapse-div','Choose analysis year range:','urlParams.startYear','urlParams.endYear',startYear, endYear, urlParams.startYear, urlParams.endYear, 1,'analysis-year-slider','null','Years of MTBS data to include')
  addMultiRadio('parameters-collapse-div','mtbs-summary-method-radio','How to summarize MTBS data','mtbsSummaryMethod',{"Highest-Severity":true,"Most-Recent":false,"Oldest":false})

  $('#mtbs-summary-method-radio').prop('title','Select how to summarize MTBS raster data in areas with multiple fires.  Each summary method is applied on a pixel basis. "Highest-Severity" will show the severity and fire year corresponding to the highest severity. "Most-Recent" will show the severity and fire year corresponding to the most recently mapped fire. "Oldest" will show the severity and fire year corresponding to the oldest mapped fire.')
  $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  $('#parameters-collapse-div').append(staticTemplates.reRunButton);

  addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div',mode+' DATA',`<img style = 'width:1.2em;height:1.1em;margin-top:-0.2em;margin-left:-0.1em' class='image-icon mr-1' alt="MTBS logo" src="images/mtbs-logo.png">`,true,null,mode+' DATA layers to view on map');
  addCollapse('sidebar-left','reference-layer-list-collapse-label','reference-layer-list-collapse-div','REFERENCE DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="images/layer_icon.png">`,false,null,'Additional relevant layers to view on map intended to provide context for '+mode+' DATA');
  
  addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');
  
  $('#layer-list-collapse-div').append(`<ul id="layer-list" class = "layer-list"></ul>`);
  $('#reference-layer-list-collapse-div').append(`<ul id="reference-layer-list" class = "layer-list"></ul>`);
  
 
  $('#introModal-body').append(staticTemplates.walkThroughButton);
}else if(mode === 'TEST' || mode === 'IDS'){
  addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div',mode+' DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="images/layer_icon.png">`,true,null,mode+' DATA layers to view on map');
  $('#layer-list-collapse-div').append(`<ul id="layer-list" class = "layer-list"></ul>`);

  addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');

}else if(mode === 'LAMDA'){

addCollapse('sidebar-left','parameters-collapse-label','parameters-collapse-div','PARAMETERS','<i role="img" class="fa fa-sliders mr-1" aria-hidden="true"></i>',false,null,'Adjust parameters used to filter and sort LAMDA products');
  var startYear = 2021;
  var endYear = new Date().getYear()+1900;
  
  if(urlParams.year == null || urlParams.year == undefined){
        urlParams.year = endYear;
    }

addRangeSlider('parameters-collapse-div','Year','urlParams.year',startYear,endYear,urlParams.year,1,'year-slider','','Year of LAMDA products to show');
$('#parameters-collapse-div').append(staticTemplates.reRunButton);

 addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div',mode+' DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="images/layer_icon.png">`,true,null,mode+' DATA layers to view on map');
  $('#layer-list-collapse-div').append(`<ul id="layer-list" class = "layer-list"></ul>`);

  addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');


}else if(mode === 'geeViz'){
  addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div',mode+' DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="images/layer_icon.png">`,true,null,mode+' DATA layers to view on map');
  $('#layer-list-collapse-div').append(`<ul id="layer-list" class = "layer-list"></ul>`);
  addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');
 

}
else if(mode === 'STORM'){
  canExport = true;
  function refineFeatures(features,interpProps){
          var left = features.slice(0,features.length-1);
          var right = features.slice(1,features.length);
          var f = [left[0]];
          left.forEach(function(fl,i){
            var fr = right[i];
            var coordsL = fl.geometry.coordinates;
            var coordsR = fr.geometry.coordinates;

            
            var fm =  JSON.parse(JSON.stringify(fl));
            fm.geometry.coordinates = [(coordsL[0]+coordsR[0])/2.0,(coordsL[1]+coordsR[1])/2.0];
            
            interpProps.map(function(prop){

              var lProp =fl.properties[prop];
              var rProp = fr.properties[prop];
              var m = (rProp+lProp)/2.0
              fm.properties[prop] = m
            })
            f.push([fm,fr]);
          })
          f = f.flat();
          // console.log(f);
          // console.log(left);
        return f
        }

  addCollapse('sidebar-left','parameters-collapse-label','parameters-collapse-div','PARAMETERS','<i role="img" class="fa fa-sliders mr-1" aria-hidden="true"></i>',true,null,'Adjust parameters used to prepare storm outputs');

   $('#parameters-collapse-div').append(`
    <label>Download storm track from <a href="https://www.wunderground.com/hurricane" target="_blank">here</a>. Copy and paste the storm track coordinates into a text editor. Save the table. Then upload that table below. <a href="./geojson/michael.txt" download="michael.txt" >Download test data here.</a></label>
    <input class = 'file-input my-1' type="file" id="stormTrackUpload" name="upload"  style="display: inline-block;" title = "Download storm track from https://www.wunderground.com/hurricane">
    <hr>
    <label>Provide name for storm (optional):</label>
    <input title = 'Provide a name for the storm. The name of the provided storm track file will be used if left blank.'  type="user-selected-area-name" class="form-control" id="storm-name"  placeholder="Name your storm!" style='width:80%;'><hr>`)
   addRangeSlider('parameters-collapse-div','Refinement iterations','refinementIterations',0, 10, 5, 1,'refinement-factor-slider','null',"Specify number of iterations to perform a linear interpolation of provided track. A higher number is needed for tracks with fewer real observations")
   addRangeSlider('parameters-collapse-div','Max distance (km)','maxDistance',50, 500, 200, 50,'max-distance-slider','null',"Specify max distance in km from storm track to include in output")
   addRangeSlider('parameters-collapse-div','Min wind (mph)','minWind',0, 75, 30, 5,'min-wind-slider','null',"Specify min wind speed in mph to include in output")
   // addRangeSlider('parameters-collapse-div','Mod of Rupture','modRupture',2000, 20000, 8500, 100,'mod-rupture-slider','null',"Specify the modulus of rupture for the GALES model")
     
      $('#parameters-collapse-div').append(`
        <hr>
        <label style = 'width:90%'>The MOD of Rupture is intended to indicate how much force it takes to snap a tree. A single value can be provided by providing a constant image (e.g. ee.Image(1)) and a simple lookup to convert that image to a desired MOD of Rupture (e.g. {1:8500}). If different MOD of Rupture values are needed for different tree types, you can provide an EE image that may have tree classes or land cover classes that can then be cross-walked to a MOD of Rupture image with different values for different tree/land cover classes (e.g. ee.Image( "USGS/NLCD_RELEASES/2016_REL/2016" ).select([ 0 ]) with a lookup of {41:8500,42:2000,43:5000,90:4000}</label>
        <hr>
        <label>MOD of Rupture Image</label>
        <textarea   title = 'Provide an image with relevant land cover/tree classes. Provide a constant raster (ee.Image(1)) if you would like to use a constant'   class="form-control" id="mod-image"   oninput="auto_grow(this)" style='width:90%;'>ee.Image("USGS/NLCD_RELEASES/2016_REL/2016").select([0])</textarea>
        <hr>
        <label>MOD of Rupture Lookup</label>
        <textarea   title = 'Provide a lookup table to remap each class of the image provided above with a MOD of Rupture value.'  type="user-selected-area-name" class="form-control" id="mod-lookup" oninput="auto_grow(this)" style='width:90%;'>{41:8500, 42:2000, 43:5000, 90:4000}</textarea>
       `);


       $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>
      <button class = 'btn' style = 'margin-bottom: 0.5em!important;' onclick = 'ingestStormTrack()' title = 'Click to ingest storm track and map damage'>Ingest Storm Track</button>
      <button class = 'btn' style = 'margin-bottom: 0.5em!important;' onclick = 'reRun()' title = 'Click to remove existing layers and exports'>Clear All Layers/Exports</button><br>`);
    function ingestStormTrack() {
      $('#summary-spinner').show();
          if(jQuery('#stormTrackUpload')[0].files.length > 0){
               
            var fr=new FileReader(); 
            fr.onload=function(){ 
                var rows = fr.result.split('\n');
                rows =rows.filter(row => row.split('\t').length > 5);
                // console.log(fr.result) 
                // console.log(rows)
                rows = rows.map(function(row){
                  row = row.split('\t');
                  var out = {};
                  out.type = "Feature";
                  out.geometry = {};
                  out.geometry.type = 'Point';
                  out.geometry.coordinates = [parseFloat(row[3]), parseFloat(row[2])]
                  
                  out.properties = {};
                  out.properties.lat = parseFloat(row[2]);
                  out.properties.lon = parseFloat(row[3]);
                  out.properties.wspd = parseFloat(row[4]);
                  out.properties.pres = parseFloat(row[5]);
                  out.properties.category = row[6];
                  out.properties.date = new Date(row[0] + ' ' + row[1]).getTime();
                  out.properties.year = new Date(row[0] + ' ' + row[1]).getFullYear()
                  return out
                })
                // var sa = ee.Image('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/LANDFIRE/LF_US_EVH_200').geometry();
                // rows = ee.FeatureCollection(rows).filterBounds(sa).getInfo().features;
                // console.log(rows)
                // Map2.addLayer(rows)
                var iterations = refinementIterations;
                while(iterations > 0 && rows.length*2 < 1500){
                  console.log('Refining');
                  console.log(refinementIterations);
                  rows = refineFeatures(rows,['lat','lon','wspd','pres','date','year']);
                  console.log(rows.length);
                  iterations--
                }
                showMessage('Refinement finished','Refined '+ (refinementIterations-iterations).toString() +'/'+ refinementIterations.toString()+' iterations.\nTotal number of refined track points is: '+rows.length.toString())
                // rows = refineFeatures(rows,['lat','lon','wspd','pres','date','year']);

                var rowsLeft = rows.slice(0,rows.length-1);
                var rowsRight = rows.slice(1);
                var zipped = ee.List.sequence(0,rowsLeft.length-1).getInfo().map(function(i){
                  
                  var out = {};
                  out.type = "Feature";
                  out.geometry = rowsLeft[i].geometry;

                  out.properties = {};

                  out.properties.current = rowsLeft[i].properties;
                  out.properties.future = rowsRight[i].properties;
                  
                  return out
                })
                // console.log(zipped)
                // Map2.addLayer(rows)
                 $('#summary-spinner').slideUp();
                 // console.log(zipped)
                createHurricaneDamageWrapper(ee.FeatureCollection(zipped));
            } 
              
            fr.readAsText(jQuery('#stormTrackUpload')[0].files[0]);
            }else{
              $('#summary-spinner').hide();
              showMessage('No storm track provided','Please download storm track from <a href="https://www.wunderground.com/hurricane" target="_blank">here</a> . Copy and paste the storm track coordinates into a text editor. Save the table. Then upload that table above.')}


        } 
  //   $('#parameters-collapse-div').append(`<label>Provide storm track geoJSON:</label>
  //                                       <input rel="txtTooltip" title = 'Provide storm track geoJSON'  type="user-selected-area-name" class="form-control"  id="storm-track" placeholder="Provide storm track geoJSON" style='width:80%;'>`)
  
  
  // function ingestStormTrak(){
  //     var months = {
  //     'JAN' : '01',
  //     'FEB' : '02',
  //     'MAR' : '03',
  //     'APR' : '04',
  //     'MAY' : '05',
  //     'JUN' : '06',
  //     'JUL' : '07',
  //     'AUG' : '08',
  //     'SEP' : '09',
  //     'OCT' : '10',
  //     'NOV' : '11',
  //     'DEC' : '12'
  //     }
  //   if(jQuery('#stormTrackUpload')[0].files.length > 0){
  //     $('#summary-spinner').slideDown();
  //     convertToGeoJSON('stormTrackUpload').done(function(converted){

  //       converted.features = converted.features.map(function(f){
  //         f.properties.HR = parseFloat(f.properties['HHMM'].slice(0,2));
  //         f.properties.MN = parseFloat(f.properties['HHMM'].slice(2));
  //         if(Object.keys(months).indexOf(f.properties.MONTH) > -1){
  //           f.properties.MONTH = months[f.properties.MONTH]
  //         }
  //         return f
  //       })
  //       console.log('successfully converted to JSON');
  //       console.log(converted);
        


  //       var iterations =0;
  //       // var sa = ee.FeatureCollection("TIGER/2018/States").geometry();
  //       var sa = ee.Image('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/LANDFIRE/LF_US_EVH_200').geometry();
  //       // converted.features = ee.FeatureCollection(converted.features).filterBounds(sa).getInfo().features;
  //       for(iterations; iterations > 0; iterations--){
  //         converted.features = refineFeatures(converted.features,['LAT','LON','YEAR','MONTH','DAY','INTENSITY','MSLP','HR','MN']);
          
          
          
  //         //{"date": "Aug 16:18:00 GMT", "lat": 10.9, "lon": -25.4, "wspd": 20.0, "pres": 0.0, "FO": "O"}
        
  //       }
        
  //       var rows = converted.features.map(function(f){
         
  //         var props = f.properties;
  //         f.properties.date = new Date(props.YEAR,props.MONTH-1,props.DAY,props.HR,props.MN)
  //         f.properties.lat = props.LAT;
  //         f.properties.lon = props.LON;
  //         f.properties.wspd = props.INTENSITY
  //         f.properties.pres = props.MSLP
  //         f.properties.name = props.STORMNAME
  //         f.properties.year = props.YEAR;
  //         return f;//ee.Feature(f).buffer(10000)
  //       });
        
        
  //       createHurricaneDamageWrapper(rows,true);
  //       $('#summary-spinner').slideUp(); 
       
        
  //         })
  //   }else{showMessage('No storm track provided','Please select a .zip shapefile or a .geojson file to summarize across')}
  // }                     
  // $('#parameters-collapse-div').append(`<label>Provide storm track geoJSON:</label>
  //                                       <input rel="txtTooltip" title = 'Provide storm track geoJSON'  type="user-selected-area-name" class="form-control" value = '${JSON.stringify(rows)}' id="storm-track" placeholder="Provide storm track geoJSON" style='width:80%;'>`)
  
  // $('#parameters-collapse-div').append(`<label>Provide name for storm (optional):</label>
  //                                       <input rel="txtTooltip" title = 'Provide a name for the storm. A default one will be provided if left blank.'  type="user-selected-area-name" class="form-control" id="storm-name" value = 'Michael' placeholder="Name your storm!" style='width:80%;'>`)
  // addRangeSlider('parameters-collapse-div','Choose storm year','stormYear',1980, 2030, 2018, 1,'storm-year-slider','null',"Specify year of storm")
  // $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  // $('#parameters-collapse-div').append(staticTemplates.reRunButton);
  addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div',mode+' DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="images/layer_icon.png">`,true,null,mode+' DATA layers to view on map');
  $('#layer-list-collapse-div').append(`<ul id="layer-list" class = "layer-list"></ul>`);
  addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');
  addCollapse('sidebar-left','download-collapse-label','download-collapse-div','DOWNLOAD DATA',`<i role="img" class="fa fa-cloud-download mr-1" aria-hidden="true"></i>`,false,``,'Download '+mode+' products for further analysis');
 
}else{
  addCollapse('sidebar-left','layer-list-collapse-label','layer-list-collapse-div','ANCILLARY DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="images/layer_icon.png">`,true,null,mode+' DATA layers to view on map');
  addCollapse('sidebar-left','reference-layer-list-collapse-label','reference-layer-list-collapse-div','PLOT DATA',`<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="images/layer_icon.png">`,false,null,'Additional relevant layers to view on map intended to provide context for '+mode+' DATA');
  
  addCollapse('sidebar-left','tools-collapse-label','tools-collapse-div','TOOLS',`<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,false,'','Tools to measure and chart data provided on the map');

  $('#layer-list-collapse-div').append(`<ul id="layer-list" class = "layer-list"></ul>`);
  $('#reference-layer-list-collapse-div').append(`<ul id="reference-layer-list" class = "layer-list"></ul>`);
  plotsOn = true;
}

$('body').append(`<div class = 'legendDiv flexcroll col-sm-5 col-md-3 col-lg-3 col-xl-2 p-0 m-0' id = 'legendDiv'></div>`);
$('.legendDiv').css('bottom',$('.bottombar').height());
$('.sidebar').css('max-height',$('body').height()-$('.bottombar').height());
addLegendCollapse();
/////////////////////////////////////////////////////////////////
//Construct tool options for different modes
 

addAccordianContainer('tools-collapse-div','tools-accordian')
$('#tools-accordian').append(`<h5 class = 'pt-2' style = 'border-top: 0.0em solid black;'>Measuring Tools</h5>`);
// $('#tools-accordian').append(staticTemplates.imperialMetricToggle);
addSubAccordianCard('tools-accordian','measure-distance-label','measure-distance-div','Distance Measuring',staticTemplates.distanceDiv,false,`toggleTool(toolFunctions.measuring.distance)`,staticTemplates.distanceTipHover);

// <variable-radio onclick1 = 'updateDistance()' onclick2 = 'updateDistance()'var='metricOrImperialDistance' title2='' name2='Metric' name1='Imperial' value2='metric' value1='imperial' type='string' href="#" rel="txtTooltip" data-toggle="tooltip" data-placement="top" title='Toggle between imperial or metric units'></variable-radio>
addSubAccordianCard('tools-accordian','measure-area-label','measure-area-div','Area Measuring',staticTemplates.areaDiv,false,`toggleTool(toolFunctions.measuring.area)`,staticTemplates.areaTipHover);
addRadio('measure-distance-div','metricOrImperialDistance-radio','','Imperial','Metric','metricOrImperialDistance','imperial','metric','updateDistance()','updateDistance()','Toggle between imperial or metric units')

addRadio('measure-area-div','metricOrImperialArea-radio','','Imperial','Metric','metricOrImperialArea','imperial','metric','updateArea()','updateArea()','Toggle between imperial or metric units')

addShapeEditToolbar('measure-distance-div', 'measure-distance-div-icon-bar','undoDistanceMeasuring()','resetPolyline()')
addColorPicker('measure-distance-div-icon-bar','distance-color-picker','updateDistanceColor',distancePolylineOptions.strokeColor);

addShapeEditToolbar('measure-area-div', 'measure-area-div-icon-bar','undoAreaMeasuring()','resetPolys()')
addColorPicker('measure-area-div-icon-bar','area-color-picker','updateAreaColor',areaPolygonOptions.strokeColor);

// addAccordianContainer('pixel-tools-collapse-div','pixel-tools-accordian');
$('#tools-accordian').append(`<h5 class = 'pt-2' style = 'border-top: 0.1em solid black;'>Pixel Tools</h5>`);
addSubAccordianCard('tools-accordian','query-label','query-div','Query Visible Map Layers',staticTemplates.queryDiv,false,`toggleTool(toolFunctions.pixel.query)`,staticTemplates.queryTipHover);
// if(mode !== 'STORM'){
  addSubAccordianCard('tools-accordian','pixel-chart-label','pixel-chart-div','Query '+mode+' Time Series',staticTemplates.pixelChartDiv,false,`toggleTool(toolFunctions.pixel.chart)`,staticTemplates.pixelChartTipHover);
  addDropdown('pixel-chart-div','pixel-collection-dropdown','Choose which '+mode+' time series to chart','whichPixelChartCollection','Choose which '+mode+' time series to chart.');
 
// }
// $('#pixel-chart-div').append(staticTemplates.showChartButton);
// addAccordianContainer('area-tools-collapse-div','area-tools-accordian');
if(mode === 'geeViz'){
  $('#pixel-chart-label').remove();
  $('#share-button').remove();
   $('#tools-accordian').append(`<div class="dropdown-divider" ></div>`);
   //Sync tooltip toggle
  var tShowToolTipModal = true
  if(localStorage.showToolTipModal !== null && localStorage.showToolTipModal !== undefined){
    tShowToolTipModal = localStorage.showToolTipModal
  }
  addRadio('tools-accordian','tooltip-radio','Show tool tips','Yes','No','localStorage.showToolTipModal','true','false','','','Whether to show tool tips to help explain how to use the tools.');
  if(tShowToolTipModal === 'false'){$('#tooltip-radio-second_toggle_label').click();}
}
if(mode==='LAMDA'){$('#pixel-chart-label').remove();}
if(mode === 'LCMS'){$('#search-share-div').addClass('pt-2')};
if(mode === 'LCMS-pilot' || mode === 'MTBS'|| mode === 'lcms-base-learner' || mode === 'IDS' || mode === 'LCMS'){
  $('#tools-accordian').append(`<h5 class = 'pt-2' style = 'border-top: 0.1em solid black;'>Area Tools</h5>`);
  addSubCollapse('tools-accordian','area-chart-params-label','area-chart-params-div','Area Tools Parameters', '',false,'')
  $('#area-chart-params-label').prop('title', 'Click here to select which LCMS products to chart, and change which area units are used. ')
  // $('#tools-accordian').append(`<div class="dropdown-divider" ></div>`);
  addDropdown('area-chart-params-div','area-collection-dropdown','Choose which '+mode+' product to summarize','whichAreaChartCollection','Choose which '+mode+' time series to summarize.');
  // $('#area-chart-params-div').append(`<div class="dropdown-divider" ></div>`);
  $('#parameters-collapse-div').append(`<div class="dropdown-divider" ></div>`);
  addMultiRadio('area-chart-params-div','area-summary-format','Area Units','areaChartFormat',{"Percentage":true,"Acres":false,"Hectares":false})
  $('#area-summary-format').prop('title','Choose how to summarize area- as a percentage of the area, acres, or hectares.')
  addSubAccordianCard('tools-accordian','user-defined-area-chart-label','user-defined-area-chart-div','User-Defined Area',staticTemplates.userDefinedAreaChartDiv,false,`toggleTool(toolFunctions.area.userDefined)`,staticTemplates.userDefinedAreaChartTipHover);
  addSubAccordianCard('tools-accordian','upload-area-chart-label','upload-area-chart-div','Upload an Area',staticTemplates.uploadAreaChartDiv,false,'toggleTool(toolFunctions.area.shpDefined)',staticTemplates.uploadAreaChartTipHover);
  // addSubAccordianCard('tools-accordian','select-area-dropdown-chart-label','select-area-dropdown-chart-div','Select an Area from Dropdown',staticTemplates.selectAreaDropdownChartDiv,false,'toggleTool(toolFunctions.area.selectDropdown)',staticTemplates.selectAreaDropdownChartTipHover);
  addSubAccordianCard('tools-accordian','select-area-interactive-chart-label','select-area-interactive-chart-div','Select an Area on Map',staticTemplates.selectAreaInteractiveChartDiv,false,'toggleTool(toolFunctions.area.selectInteractive)',staticTemplates.selectAreaInteractiveChartTipHover);
  addRangeSlider('upload-reduction-factor-container','Vertex Reduction Factor','uploadReductionFactor',1, 5, 1 , 1,'upload-reduction-factor-slider','null',"Every n vertex in uploaded file will be kept for polygons > 100 vertices (E.g. if 3 is chosen, every third vertex remains). This is intended to help enable use of uploaded areas that may have failed due to its size.")
  addRangeSlider('simplify-error-range-container','Simplify Area - Max Error','simplifyMaxError',0, 500, 0 , 50,'simplify-error-slider','null',"If the selected area is very large and/or has a lot of vertices, it may not compute. In this instance, clear out any existing selections (trash can button below), and increase this value. The selected polygon will be simplified using a max error in meters equal to this value upon selection. Generally between 50 and 150 will get most areas to work.")
  addShapeEditToolbar('user-defined-edit-toolbar', 'user-defined-area-icon-bar','undoUserDefinedAreaCharting()','restartUserDefinedAreaCarting()')
  addColorPicker('user-defined-area-icon-bar','user-defined-color-picker','updateUDPColor',udpOptions.strokeColor);

  addShapeEditToolbar('select-features-edit-toolbar', 'select-area-interactive-chart-icon-bar','removeLastSelectArea()','clearSelectedAreas()','Click to unselect most recently selected polyogn','Click to clear all selected polygons');
  $('#tools-accordian').append(`<div class="dropdown-divider" ></div>`);
   //Sync tooltip toggle
  var tShowToolTipModal = true
  if(localStorage.showToolTipModal !== null && localStorage.showToolTipModal !== undefined){
    tShowToolTipModal = localStorage.showToolTipModal
  }
  addRadio('tools-accordian','tooltip-radio','Show tool tips','Yes','No','localStorage.showToolTipModal','true','false','','','Whether to show tool tips to help explain how to use the tools.');
  if(tShowToolTipModal === 'false'){$('#tooltip-radio-second_toggle_label').click();}

}
//Add some logos for different modes
if(mode === 'MTBS' || mode === 'Ancillary'){
  $('#contributor-logos').prepend(`<a href="https://www.usgs.gov/" target="_blank" >
                                    <img src="images/usgslogo.png" class = 'image-icon-bar' alt="USGS logo" title="Click to learn more about the US Geological Survey">
                                  </a>`)
  $('#contributor-logos').prepend(`<a href="https://www.mtbs.gov/" target="_blank" >
                                    <img src="images/mtbs-logo-large.png" class = 'image-icon-bar' alt="MTBS logo" title="Click to learn more about MTBS">
                                  </a>`)
}
//Handle exporting if chosen
if(canExport){
  // console.log('here')
   $('#download-collapse-div').append(staticTemplates.exportContainer);
   if(localStorage.export_crs !== undefined && localStorage.export_crs !== null && localStorage.export_crs.indexOf('EPSG') > -1){
    $('#export-crs').val(localStorage.export_crs)
  }else{localStorage.export_crs = $('#export-crs').val()};
   function cacheCRS(){
    localStorage.export_crs = $('#export-crs').val();
   }
   if(mode === 'STORM'){
     $('#export-area-drawing-div').append(`<hr>
                                            <button class = 'btn' onclick = 'addTrackBounds()' title = 'Add bounds of storm track for export area.'><i class="pr-1 fa fa-square-o" aria-hidden="true"></i> Use storm track bound as area to download</button>
                                            `)
     $('#export-button-div').append(`<hr>`);
     addRangeSlider('export-button-div','Quick look spatial resolution','quickLookRes',1200, 6000, 3000, 300,'quick-look-res-slider','null',"Specify spatial resolution for quick look downloads.")
     $('#export-button-div').append(`<button class = 'btn' onclick = 'downloadQuickLooks()'  title = 'Quickly download outputs at coarse resolution'><i class="pr-1 fa fa-cloud-download" aria-hidden="true"></i>Download Quick Look Outputs</button>
                                            `)
     
   }
}

if(urlParams.showSidebar === undefined || urlParams.showSidebar === null){
  urlParams.showSidebar = 'true'
}

function toggleSidebar(){
  $('#sidebar-left').toggle('collapse');
  // $('#title-banner').toggle('collapse');
  if(urlParams.showSidebar === 'false'){
    urlParams.showSidebar = 'true'
  }else{
    urlParams.showSidebar = 'false'
  }
};
if(urlParams.showSidebar === 'false'){
  $('#sidebar-left').hide();
}

//Wrapper for mapping functions
///////////////////////////////////////////////////////////////////
//Set up some globals
var mapDiv = document.getElementById('map');

// tableConverter = function(dataTableT){

//   // var x = [dataTableT[0]]
//   // x[0][0] = 'Year'
//   // dataTableT.slice(1).map(function(i){
    
//   //   i[0] = (i[0].getYear()+1900).toString()
//   //   x.push(i)
//   // })
//   // dataTableT   = x
// var lcDict = {
//   '0': 'No data',
// '1': 'Barren',
// '2': 'Grass/forb/herb',
// '3': 'Impervious',
// '4': 'Shrubs',
// '5': 'Snow/ice',
// '6': 'Trees',
// '7': 'Water'
// };

// var luDict = {
//   '0': 'No data',
// '1': 'Agriculture',
// '2': 'Developed',
// '3': 'Forest',
// '4': 'Non-forest wetland',
// '5': 'Other',
// '6': 'Rangeland'
// };

// var cpDict = {
//   '0': 'No Data',
//   '1': 'Stable',
//   '2':'Growth/recovery',
//   '3': 'Fire',
//   '4': 'Harvest',
//   '5': 'Other'
// }

//   // if(dataTableT[0].length > 5){
//   if(analysisMode === 'advanced'){
//     // console.log('convertinggggggg tabbbbbbbble' );
//     var isFirst = true;
//     dataTableT = dataTableT.map(function(i){if(isFirst === false){i[3] = lcDict[Math.round(i[3]*10)]};isFirst = false;return i});
//     var isFirst = true;
//     dataTableT = dataTableT.map(function(i){if(isFirst === false){i[4] = luDict[Math.round(i[4]*10)]};isFirst = false;return i});
//     var isFirst = true;
//     // dataTableT = dataTableT.map(function(i){if(isFirst === false){i[5] = cpDict[parseInt(i[5]*10)]};isFirst = false;return i});
// //       dataTableT = dataTableT.map(function(i){i[2] = cdlDict[i[2]];return i})
//   }
  

//       return dataTableT
//     };



function copyObj(mainObj) {
  let objCopy = {}; // objCopy will store a copy of the mainObj
  let key;

  for (key in mainObj) {
    objCopy[key] = mainObj[key]; // copies each property to the objCopy object
  }
  return objCopy;
};
function copyArray(array) {
  var arrayCopy = []; 
 

  array.map(function(i){
    arrayCopy.push(i)
  })
    
  
  return arrayCopy;
};
///////////////////////////////////////////////////////////////////
//Function to compute range list on client side
function range(start, stop, step){
  start = parseInt(start);
  stop = parseInt(stop);
    if (typeof stop=='undefined'){
        // one param defined
        stop = start;
        start = 0;
    }
    if (typeof step=='undefined'){
        step = 1;
    }
    if ((step>0 && start>=stop) || (step<0 && start<=stop)){
        return [];
    }
    var result = [];
    for (var i=start; step>0 ? i<stop : i>stop; i+=step){
        result.push(i);
    }
    return result;
}
///////////////////////////////////////////////////////////////////
//Convert lng, lat to nad 83 code
function llToNAD83(x,y){
      var vertex = [x,y];
      var smRadius = 6378136.98;
      var smRange = smRadius * Math.PI * 2.0;
      var smLonToX = smRange / 360.0;
      var smRadiansOverDegrees = Math.PI / 180.0;


      // compute x-map-unit
      vertex[0] *= smLonToX;

      var y = vertex[1];

      // compute y-map-unit
      if (y > 86.0)
      {
      vertex[1] = smRange;
      }
      else if (y < -86.0)
      {
      vertex[1] = -smRange;
      }
      else
      {
      y *= smRadiansOverDegrees;
      y = Math.log(Math.tan(y) + (1.0 / Math.cos(y)), Math.E);
      vertex[1] = y * smRadius; 
      }
      return {'x':vertex[0],'y':vertex[1]}
    }
///////////////////////////////////////////////////////////////////
//Make an object out of to lists of keys and values
//From:https://stackoverflow.com/questions/12199051/merge-two-arrays-of-keys-and-values-to-an-object-using-underscore answer 6
var toObj = (ks, vs) => ks.reduce((o,k,i)=> {o[k] = vs[i]; return o;}, {});
var toDict = toObj;
////////////////////////////////////////
//Copy an array
function CopyAnArray (ari1) {
   var mxx4 = [];
   for (var i=0;i<ari1.length;i++) {
      var nads2 = [];
      for (var j=0;j<ari1[0].length;j++) {
         nads2.push(ari1[i][j]);
      }
      mxx4.push(nads2);
   }
   return mxx4;
}
///////////////////////////////////////////////////////////////////
//Get a column of a 2-d array
function arrayColumn(arr,i){return arr.map(function(r){return r[i]})};
///////////////////////////////////////////////////////////////////
//Convert xyz coords to quad key for map services such as Bing
//Source: http://bcdcspatial.blogspot.com/2012/01/onlineoffline-mapping-map-tiles-and.html
function tileXYZToQuadKey(x, y, z){
        var quadKey = '';
         for(var i = z;i > 0;i--){
             var digit = 0;
              var mask = 1 << (i - 1);
              // print(mask);
              // print(i);
              if((x & mask)  != 0){
                        digit = digit + 1
                      }
              // print((x & mask))
              // print(digit)
              if((y & mask) != 0){
                        digit =digit + 2
                    
                  }
              // print(digit)
              quadKey = quadKey  + digit.toString();
            }
                return quadKey
       }
///////////////////////////////////////////////////////////////////
//Functions for centering map
function centerMap(lng,lat,zoom){
    map.setCenter({lat:lat,lng:lng});
    map.setZoom(zoom);
}
function synchronousCenterObject(feature){
    var bounds = new google.maps.LatLngBounds(); 
    feature.coordinates[0].map(function(latlng){
     bounds.extend({lng:latlng[0], lat:latlng[1]});
    });
    map.fitBounds(bounds);
}
function centerObject(fc){
  try{
    fc.geometry().bounds(100).evaluate(function(feature){synchronousCenterObject(feature);
    });
  }
  catch(err){
    try{
      fc.bounds(100).evaluate(function(feature){synchronousCenterObject(feature);
    })}catch(err){
      console.log(err);
    }
    console.log(err);
  }
}
///////////////////////////////////////////////////////////////////
//Function for creating color ramp generally for a map legend
function createColorRamp(styleName, colorList, width,height){
    var myCss ="background-image:linear-gradient(to right, ";
    for(var i = 0; i< colorList.length;i++){myCss = myCss + '#'+colorList[i].toLowerCase() + ',';}
    myCss = myCss.slice(0,-1) + ");";
  return myCss
}
///////////////////////////////////////////////////////////////////
//Function to convert csv, kml, shp to geoJSON using ogre.adc4gis.com
function convertToGeoJSON(formID){
  var url = 'https://ogre.adc4gis.com/convert'

  var data = new FormData();
  // data.append("sourceSrs","EPSG:5070");
   
  data.append("targetSrs","EPSG:4326");
  jQuery.each(jQuery('#'+formID)[0].files, function (i, file) {
    data.append("upload", file);
  });
  var out= $.ajax({
    type: 'POST',
    url: url,
    data: data,
    processData: false,
    contentType: false,
    error: function (err) {
        // console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
        showMessage('Error!', 'Error converting file: <hr>'+err.responseJSON.msg.replace('\n','<br>'));
        $('#summary-spinner').hide();
    }
  });
  return out;
}
function compressGeoJSON(geoJSON,reductionFactor){
  if(reductionFactor === undefined || reductionFactor === null){reductionFactor = 2}
  geoJSON.features = geoJSON.features.map(function(f){
    
    if(f.geometry.type.indexOf('Multi')> -1){
      f.geometry.coordinates = f.geometry.coordinates.map(function(poly){
        return poly.map(function(pts){
          if(pts.length>100){
            pts = pts.filter((element, index) => {return index % reductionFactor === 0;})
          }
          return pts//.map(function(pt){
          //   return [parseFloat(pt[0].toFixed(decimalPlaces)),parseFloat(pt[1].toFixed(decimalPlaces))]
          // })
        })
      })
    }else{
      f.geometry.coordinates = f.geometry.coordinates.map(function(poly){
        if(poly.length>100){
          poly = poly.filter((element, index) => {return index % reductionFactor === 0;});
        }
        return poly//.map(function(pt){
          // return [parseFloat(pt[0].toFixed(decimalPlaces)),parseFloat(pt[1].toFixed(decimalPlaces))]
        // })
      })
    }
   return f
  })
  return geoJSON
}
//////////////////////////////////////////////////////
//Wrappers for printing and printing to console
function printImage(message){print(message)};
function print(message){
    console.log(message)
}
function printEE(obj){
  print('Getting info about ee object')
  console.log(obj.getInfo(function(success,failure){
    if(success !== undefined){
      console.log(success);
    }
    else{
      console.log(failure)
    }

  }))
}
/////////////////////////////////////////////////////
//Get random number within specified range
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
/////////////////////////////////////////////////////
//Plot manager functions
//Clear plots from plot list
function clearPlots(){
var plotElements = document.getElementById("pt-list");;
                print(plotElements);
                while(plotElements.firstChild){
                    // print('removing')
                    plotElements.removeChild(plotElements.firstChild);
                    }
    plotDictID = 1;
    plotIDList = [];
    plotID =1;
}
function addPlotProject(plotProjectName,plotProjectPts){
  
  var projectElement = document.createElement("ee-pt-project");
  projectElement.name = plotProjectName;
  projectElement.plotList = plotProjectPts;
  projectElement.ID = plotProjectID;
  var ptList = document.querySelector("pt-project-list");
  ptList.insertBefore(projectElement,ptList.firstChild);
  plotProjectID++;

}

function setPlotColor(ID){
    var plotElements = document.getElementsByTagName("ee-pt");
      
  for(var i = 0;i<plotElements.length;i++){
    plotElements[i].style.outline = 'none';
    
  }
  // console.log(plotElements[0])
  plotElements[plotElements.length-ID].style.outline = '#FFF solid';
   
}
function setPlotProjectColor(ID){
    var plotElements = document.getElementsByTagName("ee-pt-project");
      
  for(var i = 0;i<plotElements.length;i++){
    plotElements[i].style.outline = 'none';
    
  }
  // console.log(plotElements[0])
  plotElements[plotElements.length-ID].style.outline = '#FFF dotted';
   
}
/////////////////////////////////////////////////////
//Wrapper function to add a select layer
function addSelectLayerToMap(item,viz,name,visible,label,fontColor,helpBox,whichLayerList,queryItem){
  viz.canQuery = false;
  viz.isSelectLayer = true;
  addToMap(item,viz,name,visible,label,fontColor,helpBox,'area-charting-select-layer-list',queryItem);
}
/////////////////////////////////////////////////////
//Functions to manage time lapses
var intervalPeriod = 666.6666666666666;
var timeLapseID;
var timeLapseFrame = 0;
var cumulativeMode = false;
function pauseTimeLapse(id){
  if(id === null || id === undefined){id = timeLapseID}
    timeLapseID = id;
  if(timeLapseObj[timeLapseID].isReady){
      pauseAll();
      clearActiveButtons();
      $('#'+timeLapseID+'-pause-button').addClass('time-lapse-active');
    }
  } 

function setFrameOpacity(frame,opacity){
  var s = $('#'+frame).slider();
  s.slider('option', 'value',opacity);
  s.slider('option','slide').call(s,null,{ handle: $('.ui-slider-handle', s), value: opacity });
}
//Function to shoe a specific frame
function selectFrame(id,fromYearSlider,advanceOne){

  if(id === null || id === undefined){id = timeLapseID}
  if(fromYearSlider === null || fromYearSlider === undefined){fromYearSlider = false}
  if(advanceOne === null || advanceOne === undefined){advanceOne = true}
  timeLapseID = id
  
  if(timeLapseID !== undefined && timeLapseObj[timeLapseID].isReady){
    turnOffLayers();
    turnOnTimeLapseLayers();
    var slidersT = timeLapseObj[timeLapseID].sliders;
    if(timeLapseFrame > slidersT.length-1){timeLapseFrame = 0}
    else if(timeLapseFrame < 0){timeLapseFrame = slidersT.length-1}

    if(!eval(cumulativeMode) || timeLapseFrame === 0){
      slidersT.map(function(s){
        try{
          setFrameOpacity(s,0)
        }catch(err){}
        
      });
    }else{
      slidersT.slice(0,timeLapseFrame).map(function(s){
        try{
          setFrameOpacity(s,timeLapseObj[timeLapseID].opacity)
        }catch(err){}
        
      })
    }
    
    var frame = slidersT[timeLapseFrame];
    try{
        setFrameOpacity(frame,timeLapseObj[timeLapseID].opacity);
        if(!fromYearSlider){
          Object.keys(timeLapseObj).map(function(k){
            var s = $('#'+k+'-year-slider').slider();
            s.slider('option', 'value',timeLapseObj[k].years[timeLapseFrame]);
            $('#'+k+'-year-slider-handle-label').text( timeLapseObj[k].years[timeLapseFrame])

          })
        }
      }catch(err){}
    $('#'+timeLapseID+'-year-label').show();
    // $('#'+timeLapseID+'-year-label').html(timeLapseObj[timeLapseID].years[timeLapseFrame])
    $('#time-lapse-year-label').show();
    $('#time-lapse-year-label').html(`Time lapse year: ${timeLapseObj[timeLapseID].years[timeLapseFrame]}`)
    // if(advanceOne){timeLapseFrame++};
  }
  
}
function advanceOneFrame(){
  timeLapseFrame++;
  selectFrame()
}
function pauseButtonFunction(id){
  if(id === null || id === undefined){id = timeLapseID}
  
  timeLapseID = id;
  if(timeLapseID !== undefined && timeLapseObj[timeLapseID].isReady){
    clearAllFrames();
    pauseTimeLapse();
    selectFrame();
    alignTimeLapseCheckboxes();
    timeLapseObj[timeLapseID].state = 'paused';
  }

}
function pauseAll(){
  Object.keys(timeLapseObj).map(function(k){
    if(timeLapseObj[k].intervalValue !== null && timeLapseObj[k].intervalValue !== undefined){
      window.clearInterval(timeLapseObj[k].intervalValue);
    }
    timeLapseObj[k].intervalValue = null;
  })
}
function forwardOneFrame(id){
    timeLapseID = id;
    if(timeLapseObj[timeLapseID].isReady){
      clearAllFrames();
      pauseTimeLapse();
      // year++;
      advanceOneFrame();
      alignTimeLapseCheckboxes();
    }
  };
function backOneFrame(id){
    timeLapseID = id;
    if(timeLapseObj[timeLapseID].isReady){
      clearAllFrames();
      pauseTimeLapse();

      timeLapseFrame--;
      selectFrame();
      alignTimeLapseCheckboxes();
    }
  };
function clearActiveButtons(){
   Object.keys(timeLapseObj).map(function(k){
    $('#'+k+'-pause-button').removeClass('time-lapse-active');
    $('#'+k+'-play-button').removeClass('time-lapse-active');
    if(k === timeLapseID){
      $('#'+k+'-stop-button').removeClass('time-lapse-active');
    }
    
   })
};
function clearAllFrames(){
  turnOffAllNonActiveTimeLapseLayers(); 
  
  Object.keys(timeLapseObj).map(function(k){
    var slidersT = timeLapseObj[k].sliders;
    $('#'+k+'-year-label').hide();
    $('#'+k+'-stop-button').addClass('time-lapse-active');
    $('#'+k+'-pause-button').removeClass('time-lapse-active');
    $('#'+k+'-play-button').removeClass('time-lapse-active');
    timeLapseObj[k].state = 'inactive';
    slidersT.map(function(s){
      try{setFrameOpacity(s,0)}
      catch(err){}
      
    })
  })
}
function setSpeed(id,speed){
  timeLapseID = id;
  intervalPeriod = speed;
  if(timeLapseObj[timeLapseID].isReady){
    pauseAll();
    playTimeLapse(id);
  }
}
function playTimeLapse(id){
   if(id === null || id === undefined){id = timeLapseID}
  
  timeLapseID = id;
  if(timeLapseID !== undefined && timeLapseObj[timeLapseID].isReady){
    clearAllFrames();
    pauseAll();
    timeLapseObj[timeLapseID].state = 'play';
    selectFrame(null,null,false);
    if(timeLapseObj[id].intervalValue === null || timeLapseObj[id].intervalValue === undefined){
        timeLapseObj[id].intervalValue =window.setInterval(advanceOneFrame, intervalPeriod);
      }
      $('#'+id+'-stop-button').removeClass('time-lapse-active');
      $('#'+id+'-pause-button').removeClass('time-lapse-active');
      $('#'+id+'-play-button').addClass('time-lapse-active');
      alignTimeLapseCheckboxes();
  }
}
function stopTimeLapse(id){
  $('#time-lapse-year-label').empty();
  $('#time-lapse-year-label').hide();
  timeLapseID = null;
  // turnOffAllTimeLapseLayers();
  pauseAll();
  clearAllFrames();
}
//Toggle all layers within a specific time lapse layer
function toggleTimeLapseLayers(id){
  if(id === null || id === undefined){id = timeLapseID}
  var visibleToggles = timeLapseObj[k].layerVisibleIDs;
  visibleToggles.map(function(i){$('#'+i).click()});
}
//Toggle all layers within all time lapse layers
function toggleAllTimeLapseLayers(){
  Object.keys(timeLapseObj).map(function(k){
    toggleTimeLapseLayers(k)
  })
}
//Turn off all layers within all time lapse layers
function turnOffAllTimeLapseLayers(){
  Object.keys(timeLapseObj).map(function(k){
    turnOffTimeLapseLayers(k)
  })
}
//Turn off all layers within non active time lapses
function turnOffAllNonActiveTimeLapseLayers(){
  Object.keys(timeLapseObj).map(function(k){
    if(k !== timeLapseID){
      turnOffTimeLapseLayers(k);
    }
  })
}
function toggleTimeLapseLayers(id){
  if(id === null || id === undefined){id = timeLapseID}
  if(timeLapseObj[id].isReady){
    timeLapseObj[id].layerVisibleIDs.map(function(i){$('#'+i).click()});
    if(timeLapseObj[id].visible){
      timeLapseObj[id].visible = false
    }else{timeLapseObj[id].visible = true}
  }
}
function turnOnTimeLapseLayers(id){
  if(id === null || id === undefined){id = timeLapseID}
  if(timeLapseObj[id].isReady){
    
    if(timeLapseObj[id].visible === false){
      timeLapseObj[id].visible = true;
      timeLapseObj[id].layerVisibleIDs.map(function(i){$('#'+i).click()});
    }
    queryObj[id].visible = timeLapseObj[id].visible;
  }
}
function turnOffTimeLapseLayers(id){
  if(id === null || id === undefined){id = timeLapseID}
  if(timeLapseObj[id].isReady){
    
    if(timeLapseObj[id].visible === true){
      timeLapseObj[id].visible = false;
      timeLapseObj[id].layerVisibleIDs.map(function(i){$('#'+i).click()});
    }
    queryObj[id].visible = timeLapseObj[id].visible;
  }
}
//Function to handle tiles getting stuck when requested from GEE
//Currently the best method seems to be to jitter the zoom to re-request the tiles from GEE
var lastJitter;
function jitterZoom(fromButton){
  if(fromButton === null || fromButton === undefined){fromButton = false}
  if(lastJitter === null || lastJitter === undefined){
    lastJitter = new Date();
  }
  var tDiff = new Date() - lastJitter;
  var jittered = false;
  if((tDiff > 5000 && geeTileLayersDownloading === 0) || tDiff > 20000 || fromButton){
    // console.log(tDiff)
    console.log('jittering zoom')
    var z = map.getZoom();
    updateViewList = false;
    map.setZoom(z-1);
    updateViewList = false;
    map.setZoom(z);
    jittered = true;
    lastJitter = new Date();
  }
  
  return jittered
  
}
//Tidy up time lapse checkboxes
function alignTimeLapseCheckboxes(){
  Object.keys(timeLapseObj).map(function(k){
    if(timeLapseObj[k].isReady){
      var checked = false;
      if(timeLapseObj[k].visible){
        checked = true;
        $('#'+k+'-time-lapse-layer-range-container').slideDown();
        $('#'+k+'-icon-bar').slideDown();
        $('#'+k+'-collapse-label').addClass('time-lapse-label-container');
      }
      else{
        $('#'+k+'-collapse-label').css('background',`-webkit-linear-gradient(left, #FFF, #FFF ${0}%, transparent ${0}%, transparent 100%)`);
        $('#'+k+'-time-lapse-layer-range-container').slideUp();
        $('#'+k+'-icon-bar').slideUp();
        $('#'+k+'-collapse-label').removeClass('time-lapse-label-container');
        $('#'+k+'-loading-spinner').hide();
        $('#'+k+'-loading-gear').hide();
      }
        
      $('#'+k+'-toggle-checkbox').prop('checked', checked);
    }
  })
}
function timeLapseCheckbox(id){
  var v = timeLapseObj[id].visible;
  ga('send', 'event', 'time-lapse-toggle', id,v);
  if(!v){
    pauseButtonFunction(id);

  }else{
    stopTimeLapse(id);
  }
  alignTimeLapseCheckboxes();
}
function toggleFrames(id){
  $('#'+id+'-collapse-div').toggle();
}
//Turn off all time lapses
function turnOffTimeLapseCheckboxes(){
  Object.keys(timeLapseObj).map(function(k){
    if(timeLapseObj[k].isReady){
      if(timeLapseObj[k].visible){
        stopTimeLapse(k);
      }
    }
    
  });
  alignTimeLapseCheckboxes();
}
//Toggle whether to show all layers prior to the current layer or just a single layer
function toggleCumulativeMode(){
  if(cumulativeMode){
    $('.cumulativeToggler').removeClass('time-lapse-active');
    cumulativeMode = false;
  }else{
    $('.cumulativeToggler').addClass('time-lapse-active');
    cumulativeMode = true;
  }
  // timeLapseFrame--;
  selectFrame();
  
}

//Fill empty collections
function fillEmptyCollections(inCollection,dummyImage){                       
  var dummyCollection = ee.ImageCollection([dummyImage.mask(ee.Image(0))]);
  var imageCount = inCollection.toList(1).length();
  return ee.ImageCollection(ee.Algorithms.If(imageCount.gt(0),inCollection,dummyCollection));

}
//////////////////////////////////////////////////////////////////////////
//Wrapper function to add a time lapse to the map
function addTimeLapseToMap(item,viz,name,visible,label,fontColor,helpBox,whichLayerList,queryItem){
  if(viz !== null && viz !== undefined && viz.serialized !== null && viz.serialized !== undefined && viz.serialized === true){
        item = ee.Deserializer.decode(item);
        viz.serialized = false;
    }
  if(viz.cumulativeMode === null || viz.cumulativeMode === undefined){viz.cumulativeMode = false}
    //Force time lapses to be turned off on load to speed up loading
    var visible = false;
  if(viz.opacity === undefined || viz.opacity === null){viz.opacity = 1}
  item = ee.ImageCollection(item);

  var checked = '';
  if(visible){checked = 'checked'}
  var legendDivID = name.replaceAll(' ','-')+ '-' +NEXT_LAYER_ID.toString() ;
  legendDivID = legendDivID.replaceAll('/','-');
  legendDivID = legendDivID.replaceAll('(','-');
  legendDivID = legendDivID.replaceAll(')','-');
  
  //AutoViz if specified
  if(viz.autoViz){
    dicts =getLookupDicts(ee.Image(item.first()),null,'eeImage')
    viz.classLegendDict = dicts.classLegendDict;
    viz.queryDict = dicts.queryDict;
    viz.autoViz = false;
  }
  
  viz.canQuery = false;
  viz.isSelectLayer = false;
  viz.isTimeLapse = true;
  viz.timeLapseID = legendDivID;
  viz.layerType = 'geeImage';
  
  if(viz.dateFormat  === null || viz.dateFormat  === undefined){
    viz.dateFormat = 'YYYY';
    viz.advanceInterval = 'year';
  }
  

  timeLapseObj[legendDivID] = {}
  if(whichLayerList === null || whichLayerList === undefined){whichLayerList = "layer-list"}  

 
  
  //Pull out years if not provided
  //Years need to be client-side
  //Assumes the provided image collection has time property under system:time_start property
  if(viz.years === null || viz.years === undefined){
    console.log('start computing years');
    viz.years = unique(item.sort('system:time_start',true).toList(10000,0).map(function(img){
      var d = ee.Date(ee.Image(img).get('system:time_start'))
      return ee.Number.parse(d.format(viz.dateFormat)).int32()
    }).getInfo());

    console.log('done computing years');
    console.log(viz.years);
    console.log(viz)
  }
  
  //Set up time laps object entry
  var startYearT = viz.years[0];
  var endYearT = viz.years[viz.years.length-1]
  timeLapseObj[legendDivID].years = viz.years;
  timeLapseObj[legendDivID].frames = ee.List.sequence(0,viz.years.length-1).getInfo();
  timeLapseObj[legendDivID].nFrames = viz.years.length;
  timeLapseObj[legendDivID].loadingLayerIDs = [];
  timeLapseObj[legendDivID].loadingTilesLayerIDs = [];
  timeLapseObj[legendDivID].layerVisibleIDs = [];
  timeLapseObj[legendDivID].sliders = [];
  timeLapseObj[legendDivID].intervalValue = null;
  timeLapseObj[legendDivID].isReady = false;
  timeLapseObj[legendDivID].visible = visible;
  timeLapseObj[legendDivID].state = 'inactive';
  timeLapseObj[legendDivID].opacity = viz.opacity*100;
 
  queryObj[legendDivID] = {'visible':timeLapseObj[legendDivID].visible,'queryItem':item,'queryDict':viz.queryDict,'type':'geeImageCollection','name':name};  
  
  var layerContainerTitle = 'Time lapse layers load multiple map layers throughout time. Once loaded, you can play the time lapse as an animation, or advance through single years using the buttons and sliders provided.  The layers can be displayed as a single year or as a cumulative mosaic of all preceding years using the right-most button.'
  
  //Set up container for time lapse
  $('#'+whichLayerList).append(`
                                <li   title = '${layerContainerTitle}' id = '${legendDivID}-collapse-label' class = 'layer-container'>
                                  <div class = 'time-lapse-layer-range-container' >
                                    <div title = 'Opacity' id='${legendDivID}-opacity-slider' class = 'simple-time-lapse-layer-range-first'>
                                      <div id='${legendDivID}-opacity-slider-handle' class=" time-lapse-slider-handle ui-slider-handle">
                                        <div style = 'display:none;' id='${legendDivID}-opacity-slider-handle-label' class = 'time-lapse-slider-handle-label'>${timeLapseObj[legendDivID].opacity/100}</div>
                                      </div>
                                    </div>
                                    <div id='${legendDivID}-time-lapse-layer-range-container' style = 'display:none;'>
                                      <div title = 'Frame Year' id='${legendDivID}-year-slider' class = 'simple-time-lapse-layer-range'>
                                        <div id='${legendDivID}-year-slider-handle' class=" time-lapse-slider-handle ui-slider-handle">
                                          <div id='${legendDivID}-year-slider-handle-label' class = 'time-lapse-slider-handle-label'>${viz.years[0]}</div>
                                        </div>
                                      </div>
                                    
                                      <div title = 'Frame Rate' id='${legendDivID}-speed-slider' class = 'simple-time-lapse-layer-range'>
                                        <div id='${legendDivID}-speed-slider-handle' class=" time-lapse-slider-handle ui-slider-handle">
                                          <div id='${legendDivID}-speed-slider-handle-label' class = 'time-lapse-slider-handle-label'>${(1/(intervalPeriod/1000)).toFixed(1)}fps</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <input  id="${legendDivID}-toggle-checkbox" onchange = 'timeLapseCheckbox("${legendDivID}")' type="checkbox" ${checked}/>
                                  <label  title = 'Activate/deactivate time lapse' id="${legendDivID}-toggle-checkbox-label" style = 'margin-bottom:0px;display:none;'  for="${legendDivID}-toggle-checkbox"></label>
                                  <i style = 'display:none;' id = '${legendDivID}-loading-gear' title = '${name} time lapse tiles loading' class="text-dark fa fa-gear fa-spin layer-spinner"></i>
                                  <i id = '${legendDivID}-loading-spinner' title = '${name} time lapse layers loading' class="text-dark fa fa-spinner fa-spin layer-spinner"></i>

                                  <span  id = '${legendDivID}-name-span'  class = 'layer-span'>${name}</span>

                                  <div id = "${legendDivID}-icon-bar" class = 'icon-bar pl-4 pt-3' style = 'display:none;'>
                                    <button class = 'btn' title = 'Back one frame' id = '${legendDivID}-backward-button' onclick = 'backOneFrame("${legendDivID}")'><i class="fa fa-backward fa-xs"></i></button>
                                    <button class = 'btn' title = 'Pause animation' id = '${legendDivID}-pause-button' onclick = 'pauseButtonFunction("${legendDivID}")'><i class="fa fa-pause"></i></button>
                                    <button style = 'display:none;' class = 'btn time-lapse-active' title = 'Clear animation' id = '${legendDivID}-stop-button' onclick = 'stopTimeLapse("${legendDivID}")'><i class="fa fa-stop"></i></button>
                                    <button class = 'btn' title = 'Play animation' id = '${legendDivID}-play-button'  onclick = 'playTimeLapse("${legendDivID}")'><i class="fa fa-play"></i></button>
                                    <button class = 'btn' title = 'Forward one frame' id = '${legendDivID}-forward-button' onclick = 'forwardOneFrame("${legendDivID}")'><i class="fa fa-forward"></i></button>
                                    <button style = '' class = 'btn' title = 'Refresh layers if tiles failed to load' id = '${legendDivID}-refresh-tiles-button' onclick = 'jitterZoom(true)'><i class="fa fa-refresh"></i></button>
                                    <button style = 'display:none;' class = 'btn' title = 'Toggle frame visiblity' id = '${legendDivID}-toggle-frames-button' onclick = 'toggleFrames("${legendDivID}")'><i class="fa fa-eye"></i></button>
                                    <button class = 'btn cumulativeToggler' onclick = 'toggleCumulativeMode()' title = 'Click to toggle whether to show a single year or all years in the past along with current year'><img style = 'width:1.4em;filter: invert(100%) brightness(500%)'  src="images/cumulative_icon.png"></button>
                                    <div id = "${legendDivID}-message-div" class = 'pt-2'></div>
                                  </div>

                                </li>
                                
                                <div id = '${legendDivID}-collapse-div' style = 'display:none;'></div>`)
  
  
  //Add legend
  $('#time-lapse-legend-list').append(`<div id="legend-${legendDivID}-collapse-div"></div>`);
  onclick = 'timeLapseCheckbox("${legendDivID}")'
  var prevent = false;
  var delay = 200;
  $('#'+ legendDivID + '-name-span').click(function(){
    // showMessage('test')
    setTimeout(function(){
      if(!prevent){
        timeLapseCheckbox(legendDivID);
      }
    },delay)
    
  });
  // $('#'+ legendDivID + '-name-span').dblclick(function(){
  //   // showMessage('test',item.get('bounds').getInfo())
  //   // printEE(item.get('bounds'))
  //   // synchronousCenterObject(item.get('bounds'))
  //   })

  //Add in layers
  viz.layerType = 'geeImage';
  viz.legendTitle = name;
  viz.opacity = 0;

  if(viz.timeLapseType === 'tileMapService'){
    viz.layerType = 'tileMapService';
    viz.years.map(function(yr){
      if(yr !== viz.years[0]){
        viz.addToLegend = false;
        viz.addToClassLegend = false;
      }
      var vizT = Object.assign({},viz);
      vizT.year = yr
        addToMap(standardTileURLFunction(item + yr.toString()+'/',true,''),vizT,name +' '+   yr.toString(),visible,label ,fontColor,helpBox,legendDivID+'-collapse-div',queryItem);
     }) 
  }else{
    var dummyImage = ee.Image(item.first());
    viz.years.map(function(yr){

      var d = ee.Date.parse(viz.dateFormat,yr.toString())
      var img = fillEmptyCollections(item.filterDate(d,d.advance(1,viz.advanceInterval)),dummyImage);
      var img = ee.Image(img.first()).set('system:time_start',d.millis());
      if(yr !== viz.years[0]){
        viz.addToLegend = false;
        viz.addToClassLegend = false;
        viz.classLegendDict = null;
      }
      var vizT = Object.assign({},viz);
      vizT.year = yr
      addToMap(img,vizT,name +' '+   yr.toString(),visible,label ,fontColor,helpBox,legendDivID+'-collapse-div',queryItem);
    })
  }
  //If its a tile map service, don't wait
  if(viz.timeLapseType === 'tileMapService'){
    timeLapseObj[legendDivID].isReady = true;
    $('#'+legendDivID+'-toggle-checkbox-label').show();
    $('#'+legendDivID+'-loading-spinner').hide();
  }
  //Get all the individual layers' sliders
  timeLapseObj[legendDivID].sliders = timeLapseObj[legendDivID].sliders;

  //Handle the sliders for that time lapse
  //Start with the opacity slider
  //Controls the opacity of all layers within that time lapse
  $('#'+legendDivID+'-opacity-slider').slider({
        min: 0,
        max: 1,
        step: 0.05,
        value: timeLapseObj[legendDivID].opacity/100,
        slide: function(e,ui){
          var opacity = ui.value;
          var k = legendDivID;
          var s = $('#'+k+'-opacity-slider').slider();
          s.slider('option', 'value',ui.value);
          $('#'+k+'-opacity-slider-handle-label').text(opacity);
          timeLapseObj[k].opacity = opacity*100
          selectFrame(null,null,false)
        }
      });
  //The year slider
  $('#'+legendDivID+'-year-slider').slider({
        min: startYearT,
        max: endYearT,
        step: 1,
        value: startYearT,
        slide: function(e,ui){
          var yr = ui.value;
          var i = viz.years.indexOf(yr);
          timeLapseFrame = i;
          Object.keys(timeLapseObj).map(function(k){
            var s = $('#'+k+'-year-slider').slider();
            s.slider('option', 'value',ui.value);
            $('#'+k+'-year-slider-handle-label').text( ui.value )
          })
          if(timeLapseObj[legendDivID].isReady){
            clearAllFrames();
            pauseTimeLapse(legendDivID);
            selectFrame(legendDivID,true,false);
            alignTimeLapseCheckboxes();
          }
        }
      });
  //The speed slider
  $('#'+legendDivID+'-speed-slider').slider({
        min: 0.5,
        max: 3.0  ,
        step: 0.5,
        value: 1.5,
        slide: function(e,ui){
          var speed = 1/ui.value*1000;
          Object.keys(timeLapseObj).map(function(k){
            var s = $('#'+k+'-speed-slider').slider();
            s.slider('option', 'value',ui.value);
            $('#'+k+'-speed-slider-handle-label').text(`${ui.value.toFixed(1)}fps`)
          })
          if(timeLapseObj[legendDivID].isReady){
            setSpeed(legendDivID,speed)
          }
        }
      });
}
/////////////////////////////////////////////////////
//Wrapper to add an export

function addExport(eeImage,name,res,Export,metadataParams,noDataValue){

  var exportElement = {};
  if(metadataParams === null || metadataParams === undefined){
    metadataParams = {};//'studyAreaName':studyAreaName,'version':'v2019.1','summaryMethod':summaryMethod,'whichOne':'Gain Year','startYear':startYear,'endYear':endYear,'description':'this is a description'}
  }
  if(Export === null || Export === undefined){
    Export = true;
  }
  if(noDataValue === null || noDataValue === undefined){
 
    noDataValue = -32768;
  }
  var checked = '';
  if(Export){checked = 'checked'}
  
  var now = Date().split(' ');
  var nowSuffix = '_'+now[2]+'_'+now[1]+'_'+now[3]+'_'+now[4]

  name = name;//+ nowSuffix
  name = name.replace(/\s+/g,'_')
  name = name.replaceAll('(','_')
  name = name.replaceAll(')','_')
  exportElement.res = res;
  exportElement.name = name;
 
  exportElement.eeImage = eeImage;

  exportElement.Export = Export;
  exportElement.ID = exportID;
  
  exportImageDict[exportID] = {'eeImage':eeImage,'name':name,'res':res,'shouldExport':Export,'metadataParams':metadataParams,'noDataValue':noDataValue}
  // var exportList = document.querySelector("export-list");
  $('#export-list').append(`<div class = 'input-group'>
                              <span  class="input-group-addon">
                                <input  id = '${name}-checkbox-${exportID}' type="checkbox" ${checked} >
                                <label  style = 'margin-bottom:0px;'  for='${name}-checkbox-${exportID}'></label>
                              </span>
                              
                              <input  id = '${name}-name-${exportID}' class="form-control export-name-input" type="text" value="${exportElement.name}" title = 'Change export name if needed'>
                            </div>`)
  $('#' + name + '-name-'+exportID.toString()).on('input', function() {
    exportImageDict[exportElement.ID].name = $(this).val()
  })
  $('#' + name + '-checkbox-'+exportID.toString()).on('change', function() {
   
    exportImageDict[exportElement.ID].shouldExport = this.checked
  })
  exportID ++;
}

/////////////////////////////////////////////////////
//Function to add ee object as well as client-side objects to map
function getLookupDicts(image,bandName,layerType){
  if(layerType == 'geeImageCollection'){image = ee.Image(image.first())}
  if(bandName === null || bandName === undefined){
    bandName = ee.Image(image).bandNames().getInfo()[0]
  }
  values = ee.List([image.get(bandName+'_class_values'),image.get(bandName+'_class_names'),image.get(bandName+'_class_palette')]).getInfo()
  value_name = zip(values[0],values[1]).map(function(i){return i.join('- ')})
  // console.log(value_name)
  legendDict = toObj(value_name,values[2])
  queryDict = toObj(values[0],value_name)
  return {'classLegendDict':legendDict,'queryDict':queryDict}
}
var typeLookup = {'Image':'geeImage','ImageCollection':'geeImageCollection','Feature':'geeVectorImage','FeatureCollection':'geeVectorImage','Geometry':'geeVectorImage'}
function addToMap(item,viz,name,visible,label,fontColor,helpBox,whichLayerList,queryItem){
    
    // $('#layer-list-collapse-label-message').html(`Loading: ${name}`)
    if(viz !== null && viz !== undefined && viz.serialized !== null && viz.serialized !== undefined && viz.serialized === true){
        item = ee.Deserializer.decode(item);
    }
    var currentGEERunID = geeRunID;
    if(whichLayerList === null || whichLayerList === undefined){whichLayerList = "layer-list"}
    if(viz === null || viz === undefined){viz = {}}
    if(name == null){
        name = "Layer "+NEXT_LAYER_ID;  
    }
    //Possible layerType: geeVector,geoJSONVector,geeImage,geeImageArray,geeImageCollection,tileMapService,dynamicMapService
    if(viz.layerType === null || viz.layerType === undefined){
      var eeType = ee.Algorithms.ObjectType(item).getInfo();
      if(eeType === 'Feature'){
        item = ee.FeatureCollection([item])
        eeType = ee.Algorithms.ObjectType(item).getInfo();
      }
   
      viz.layerType =typeLookup[eeType]; 
     
    }
    
    console.log(name + ': '+viz.layerType)
    // console.log(item.bandNames())
    if(viz.layerType === 'geoJSONVector'){viz.canQuery = false;}
    
    if(viz.layerType === 'geeVector' || viz.layerType === 'geoJSONVector'){
      if(viz.strokeOpacity === undefined || viz.strokeOpacity === null){viz.strokeOpacity = 1};
      if(viz.fillOpacity === undefined || viz.fillOpacity === null){viz.fillOpacity = 0.2};
      if(viz.fillColor === undefined || viz.fillColor === null){viz.fillColor = '222222'};
      if(viz.strokeColor === undefined || viz.strokeColor === null){viz.strokeColor = getColor()};
      if(viz.strokeWeight === undefined || viz.strokeWeight === null){viz.strokeWeight = 3};
      viz.opacityRatio = viz.strokeOpacity/viz.fillOpacity;
      if(viz.fillColor.indexOf('#') == -1){viz.fillColor = '#' + viz.fillColor};
      if(viz.strokeColor.indexOf('#') == -1){viz.strokeColor = '#' + viz.strokeColor};
      if(viz.addToClassLegend === undefined || viz.addToClassLegend === null){
        viz.addToClassLegend = true;
        
      }
    }else if(viz.layerType === 'geeVectorImage' ){
      if(viz.strokeOpacity === undefined || viz.strokeOpacity === null){viz.strokeOpacity = 1};
      viz.fillOpacity = 0;
      if(viz.fillColor === undefined || viz.fillColor === null){viz.fillColor = '222222'};
      if(viz.strokeColor === undefined || viz.strokeColor === null){viz.strokeColor = getColor()};
      if(viz.strokeWeight === undefined || viz.strokeWeight === null){viz.strokeWeight = 2};
      if(viz.fillColor.indexOf('#') == -1){viz.fillColor = '#' + viz.fillColor};
      if(viz.strokeColor.indexOf('#') == -1){viz.strokeColor = '#' + viz.strokeColor};
      if(viz.addToClassLegend === undefined || viz.addToClassLegend === null){
        viz.addToClassLegend = true;viz.addToLegend = false;
        
      }
    }

    //Handle legend
    var legendDivID = name.replaceAll(' ','-')+ '-' +NEXT_LAYER_ID.toString() ;
    legendDivID = legendDivID.replaceAll('/','-');
    legendDivID = legendDivID.replaceAll('(','-');
    legendDivID = legendDivID.replaceAll(')','-');
    legendDivID = legendDivID.replaceAll('&','-');
    legendDivID = legendDivID.replaceAll(',','-');
    legendDivID = legendDivID.replaceAll('.','-');

    if(visible == null){
        visible = true;
    }
    if(viz.opacity == null){
      viz.opacity = 1;
    }
    
    var layerObjKeys = Object.keys(layerObj);
    var nameIndex = layerObjKeys.indexOf(legendDivID);
    if(nameIndex   != -1){
      visible = layerObj[legendDivID].visible;
      viz.opacity = layerObj[legendDivID].opacity;
      if(viz.layerType === 'geeVector' || viz.layerType === 'geoJSONVector'){
        viz.strokeOpacity =  layerObj[legendDivID].opacity;
        viz.fillOpacity = viz.strokeOpacity / viz.opacityRatio;

      }
    }


    if(helpBox == null || helpBox === undefined){helpBox = ''};
    if(viz.title !== null && viz.title !== undefined){helpBox = viz.title};
    var layer = {};//document.createElement("ee-layer");
    
    layer.ID = NEXT_LAYER_ID;
    NEXT_LAYER_ID += 1;
    layer.layerChildID = layerChildID;
    layerChildID++
    layer.name = name ;
    layer.opacity = viz.opacity;
    viz.opacity = 1;
    layer.map = map;
    layer.helpBoxMessage = helpBox;
    layer.visible = visible;
    layer.label = label;
    layer.fontColor = fontColor;
    layer.helpBox = helpBox;
    layer.legendDivID = legendDivID ;
    if(queryItem === null || queryItem === undefined){queryItem = item};
    if(viz.canQuery === null || viz.canQuery === undefined){viz.canQuery = true};
    layer.canQuery = viz.canQuery;
    layer.queryItem = queryItem;
    layer.layerType = viz.layerType;

    //AutoViz if specified
    if(viz.autoViz){
      dicts =getLookupDicts(item,null,viz.layerType)
      viz.classLegendDict = dicts.classLegendDict;
      viz.queryDict = dicts.queryDict
    }
    //Construct legend
    if(viz != null && viz.bands == null && viz.addToLegend != false && (viz.addToClassLegend === undefined || viz.addToClassLegend === null || viz.addToClassLegend === false) &&(viz.classLegendDict == undefined || viz.classLegendDict == null )){
      addLegendContainer(legendDivID,'legend-'+whichLayerList,false,helpBox)
      
      var legend ={};
    
        if(viz.legendTitle !== null && viz.legendTitle !== undefined){
         
          legend.name = viz.legendTitle
        }else{
          legend.name = name;
        }
        
        legend.helpBoxMessage = helpBox
        if(viz.palette != null){
            var palette = viz.palette;
        } else{var palette = '000,FFF';}
        var paletteList = palette;
        if(typeof(palette) === 'string'){paletteList = paletteList.split(',');}
        if(paletteList.length == 1){paletteList = [paletteList[0],paletteList[0]];}
        paletteList = paletteList.map(function(color){if(color.indexOf('#')>-1){color = color.slice(1)};return color});
        var colorRamp = createColorRamp('colorRamp'+colorRampIndex.toString(),paletteList,180,20);
      
        legend.colorRamp = colorRamp;


        if(label != null && viz.min != null){
            legend.min = viz.min + ' ' +label;
        } else if(label != null && viz.min == null){
            legend.min = minLabel;
        } else if(label == null && viz.min != null){
            legend.min = viz.min;
        } 

        if(label != null && viz.max != null){
            legend.max = viz.max + ' ' +label;
        } else if(label != null && viz.max == null){
            legend.max = maxLabel;
        } else if(label == null && viz.max != null){
            legend.max = viz.max;
        } 

        if(viz.legendLabelLeft !== null && viz.legendLabelLeft !== undefined){legend.min = viz.legendLabelLeft + ' ' + viz.min}
        if(viz.legendLabelRight !== null && viz.legendLabelRight !== undefined){legend.max = viz.legendLabelRight + ' ' + viz.max}
        if(viz.legendLabelLeftAfter !== null && viz.legendLabelLeftAfter !== undefined){legend.min =  viz.min + ' '+viz.legendLabelLeftAfter }
        if(viz.legendLabelRightAfter !== null && viz.legendLabelRightAfter !== undefined){legend.max = viz.max + ' '+ viz.legendLabelRightAfter }
        if(legend.min ==null){legend.min = 'min'};
        if(legend.max ==null){legend.max = 'max'};
   
      if(fontColor != null){legend.fontColor = "color:#" +fontColor + ";" }
          else{legend.fontColor    = "color:#DDD;"}
       addColorRampLegendEntry(legendDivID,legend)
    }

    else if(viz != null   &&  ((viz.classLegendDict !== undefined  &&  viz.classLegendDict !== null) || viz.addToClassLegend === true)){
      addLegendContainer(legendDivID,'legend-'+whichLayerList,false,helpBox)
      var classLegendContainerID = legendDivID + '-class-container';
      var legendClassContainerName;
      if(viz.legendTitle !== null && viz.legendTitle !== undefined){
         
          legendClassContainerName = viz.legendTitle
        }else{
          legendClassContainerName = name;
        }
      addClassLegendContainer(classLegendContainerID,legendDivID,legendClassContainerName)
      if(viz.layerType !== 'geeVector' && viz.layerType !== 'geoJSONVector' && viz.layerType !== 'geeVectorImage'){
        var legendKeys = Object.keys(viz.classLegendDict);//.reverse();
        legendKeys.map(function(lk){

          var legend = {};//document.createElement("ee-class-legend");
          legend.name = name;
          
          legend.helpBoxMessage = helpBox;


          legend.classColor = viz.classLegendDict[lk];
          legend.classStrokeColor = '999';
          legend.classStrokeWeight = 1;
          legend.className = lk;
          addClassLegendEntry(classLegendContainerID,legend)
        })
      }else{
        var legend = {};
        legend.name = name;
        legend.helpBoxMessage = helpBox;
        var strokeColor = viz.strokeColor.slice(1);
        var fillColor = viz.fillColor.slice(1);

        if(strokeColor.length === 3){strokeColor =  strokeColor.split('').map(function(i){return i+i}).join().replaceAll(',','')}
        if(fillColor.length === 3){fillColor =  fillColor.split('').map(function(i){return i+i}).join().replaceAll(',','')}
        
        legend.classColor =  fillColor + Math.floor(viz.fillOpacity/2 * 255).toString(16);
        legend.classStrokeColor = strokeColor+ Math.floor(viz.strokeOpacity * 255).toString(16);
        legend.classStrokeWeight = viz.strokeWeight+1;
        legend.className = '';
   
        addClassLegendEntry(classLegendContainerID,legend)
      }

      

      var title = {};
      title.name = name;
      title.helpBoxMessage = helpBox;
    }

   
    layer.visible = visible;
    layer.item = item;
    layer.name = name;
    layer.viz = viz;
    layer.whichLayerList = whichLayerList;
    layer.layerId = layerCount;
    layer.currentGEERunID = currentGEERunID;
    //Add the layer
    addLayer(layer);
    layerCount ++;   
}

//////////////////////////////////////////////////////
//Wrapper for bringing in a tile map service
function standardTileURLFunction(url,xThenY,fileExtension,token){
              if(xThenY === null || xThenY === undefined  ){xThenY  = false;};
              if(token === null || token === undefined  ){token  = '';}
              else{token = '?token='+token};
              if(fileExtension === null || fileExtension === undefined  ){fileExtension  = '.png';}
              
              return function(coord, zoom) {
                    
                    // "Wrap" x (logitude) at 180th meridian properly
                    // NB: Don't touch coord.x because coord param is by reference, and changing its x property breakes something in Google's lib 
                    var tilesPerGlobe = 1 << zoom;
                    var x = coord.x % tilesPerGlobe;
                    console.log(coord,zoom,x)
                    if (x < 0) {
                        x = tilesPerGlobe+x;
                    }
                    // Wrap y (latitude) in a like manner if you want to enable vertical infinite scroll
                    // return "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/" + zoom + "/" + x + "/" + coord.y + "?access_token=pk.eyJ1IjoiaWhvdXNtYW4iLCJhIjoiY2ltcXQ0cnljMDBwNHZsbTQwYXRtb3FhYiJ9.Sql6G9QR_TQ-OaT5wT6f5Q"
                    if(xThenY ){
                        return url+ zoom + "/" + x + "/" + coord.y +fileExtension+token;
                    }
                    else{return url+ zoom + "/" + coord.y + "/" +x  +fileExtension+token;}//+ (new Date()).getTime();
                    
                }
            }
function superSimpleTileURLFunction(url){return function(coord, zoom) {return url + zoom+'/' + coord.y+'/'+coord.x}}
/////////////////////////////////////////////////////
//Function to add ee object ot map
function addRESTToMap(tileURLFunction,name,visible,maxZoom,helpBox,whichLayerList){
  var viz = {};var item = ee.Image();
  if(whichLayerList === null || whichLayerList === undefined){whichLayerList = "layer-list"}
    // print(item.getInfo().type)
    // if(item.getInfo().type === 'ImageCollection'){print('It is a collection')}
    if(name === null || name === undefined){
        name = "Layer "+NEXT_LAYER_ID;
        
    }

    if(visible === null || visible === undefined){
        visible = true;
    }
    if(maxZoom === null || maxZoom === undefined){
        maxZoom = 18;
    }
    if(helpBox == null){helpBox = ''};
    var layer = document.createElement("REST-layer");
    layer.tileURLFunction = tileURLFunction;
    layer.ID = NEXT_LAYER_ID;
    NEXT_LAYER_ID += 1;
    layer.layerChildID = layerChildID;
    layerChildID++
    layer.name = name ;
    layer.map = map;
    layer.helpBoxMessage = helpBox;
    layer.visible = visible;
    // layer.label = label;
    // layer.fontColor = fontColor;
    layer.helpBox = helpBox;
      layer.maxZoom = maxZoom;
   
    layer.visible = visible;
    layer.item = item;
    layer.name = name;
    
    var layerList = document.querySelector(whichLayerList);
    
    
    layerList.insertBefore(layer,layerList.firstChild);
    layerCount ++;
    item.getMap(viz,function(eeLayer){
        layer.setLayer(eeLayer);
    });
}
//////////////////////////////////////////////////////
//Function to convert xy space in the dom to the map
function point2LatLng(x,y) {
  
  var m = document.getElementById('map');
  x = x- m.offsetLeft;
  y = y-m.offsetTop;
  // console.log('converting div to lat lng');console.log(x.toString() + ' ' + y.toString());
  var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
  var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
  var scale = Math.pow(2, map.getZoom());
  var worldPoint = new google.maps.Point(x / scale + bottomLeft.x, y / scale + topRight.y);
  var out = map.getProjection().fromPointToLatLng(worldPoint);
  return out;
}
//////////////////////////////////////////////////////
//Wrapper function to get a dynamic map service
function getGroundOverlay(baseUrl,minZoom,ending){
  if(map.getZoom()>=minZoom){
  if(ending === undefined || ending === null){ending = ''};
  var mapHeight = $('#map').height();
  var mapWidth = $('#map').width();

   var bounds = map.getBounds();
  var keys = Object.keys(bounds);
  var keysX = Object.keys(bounds[keys[0]]);
  var keysY = Object.keys(bounds[keys[1]]);
  
  eeBoundsPoly = ee.Geometry.Rectangle([bounds[keys[1]][keysX[0]],bounds[keys[0]][keysY[0]],bounds[keys[1]][keysX[1]],bounds[keys[0]][keysY[1]]]);

  var ulx = bounds[keys[1]][keysX[0]];
  var lrx = bounds[keys[1]][keysX[1]];
  // if(ulx > lrx){ulx = -180;}
  var ulxy = [ulx,bounds[keys[0]][keysY[0]]];
  var lrxy = [lrx,bounds[keys[0]][keysY[1]]];
  // console.log('b');console.log(ulxy);console.log(lrxy);
  var ulxyMercator = llToNAD83(ulxy[0],ulxy[1]);
  var lrxyMercator = llToNAD83(lrxy[0],lrxy[1]);
  
  var url = baseUrl+ulxyMercator.x.toString()+'%2C'+lrxyMercator.y.toString()+'%2C'+lrxyMercator.x.toString()+'%2C'+ulxyMercator.y.toString()+
  '&bboxSR=102100&imageSR=102100&size='+mapWidth.toString()+'%2C'+mapHeight.toString()+'&f=image'+ending

  overlay = new google.maps.GroundOverlay(url,bounds);
  return overlay
}
else{
  url = '../images/blank.png';
  overlay = new google.maps.GroundOverlay(url,map.getBounds())
  return overlay
}
}
//////////////////////////////////////////////////////
/////////////////////////////////////////////////////
//Function to add dynamic object mapping service to map
function addDynamicToMap(baseUrl1,baseUrl2, ending1,ending2,minZoom1,minZoom2,name,visible,helpBox,whichLayerList){
  if(whichLayerList === null || whichLayerList === undefined){whichLayerList = "layer-list"}
    var viz = {};var item = ee.Image();
    if(name === null || name === undefined){
        name = "Layer "+NEXT_LAYER_ID;   
    }
    if(visible === null || visible === undefined){
        visible = true;
    }
    if(helpBox == null){helpBox = ''};
    function groundOverlayWrapper(){
      if(map.getZoom() > minZoom2){
        return getGroundOverlay(baseUrl2,minZoom2,ending1)
      }
      else{
        return getGroundOverlay(baseUrl1,minZoom1,ending2)
      }
      }
    var layer = document.createElement("dynamic-layer");
    
    layer.ID = NEXT_LAYER_ID;
    NEXT_LAYER_ID += 1;
    layer.layerChildID = layerChildID;
    layerChildID++
    layer.name = name ;
    layer.map = map;
    layer.helpBoxMessage = helpBox;
    layer.visible = visible;
    layer.groundOverlayFunction = groundOverlayWrapper;
    layer.helpBox = helpBox;
     
   // layer.baseUrl = baseUrl;
    layer.visible = visible;
    layer.item = item;
    layer.name = name;
    
    var layerList = document.querySelector(whichLayerList);
    
    
    layerList.insertBefore(layer,layerList.firstChild);
    layerCount ++;
    layer.startUp();
   
}
//Function to add a gee feature to the map
function addFeatureToMap(item,viz,name,visible,label,fontColor,helpBox,whichLayerList,queryItem){
  console.log('adding feature: '+name);
  item.evaluate(function(v){
    var layer = new google.maps.Data({fillOpacity: 0,strokeColor:'#F00'});
    layer.addGeoJson(v);
    layer.setMap(map);
    // map.overlayMapTypes.setAt(this.layerId, v);
  })
}
var featureViewObj = {};
function addFeatureView(assetId,visParams,name,visible,maxZoom,helpBox,whichLayerList){
  ee.data.getFeatureViewTilesKey({
          'assetId': assetId,
          'visParams':visParams
        },
  function(tokens){
    console.log(tokens)
    var url = 'https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/featureViews/'+tokens.token+'/tiles/'
    
    tileURLFunction =  function(coord, zoom) {return url + zoom+'/' + coord.x+'/'+coord.y}
    addToMap(tileURLFunction,{layerType:'tileMapService'},name,visible)
    
  })

  var legendDivID = name.replaceAll(' ','-')+ '-' +NEXT_LAYER_ID.toString() ;
  legendDivID = legendDivID.replaceAll('/','-');
  legendDivID = legendDivID.replaceAll('(','-');
  legendDivID = legendDivID.replaceAll(')','-');
  legendDivID = legendDivID.replaceAll('&','-');
  legendDivID = legendDivID.replaceAll(',','-');
  legendDivID = legendDivID.replaceAll('.','-');

  NEXT_LAYER_ID++;
  featureViewObj[legendDivID] = {
    name:name,
    assetId:assetId
  }
}
/////////////////////////////////////////////////////////////////////////////////////
//Set up Map2 object
function mp(){
  this.addLayer = function(item,viz,name,visible,label,fontColor,helpBox,whichLayerList,queryItem){
    addToMap(item,viz,name,visible,label,fontColor,helpBox,whichLayerList,queryItem);
  };
  this.addSerializedLayer = function(item,viz,name,visible,label,fontColor,helpBox,whichLayerList,queryItem){
    viz.serialized = true;
    addToMap(item,viz,name,visible,label,fontColor,helpBox,whichLayerList,queryItem);
  };
  this.addSelectLayer = function(item,viz,name,visible,label,fontColor,helpBox,whichLayerList,queryItem){
    addSelectLayerToMap(item,viz,name,visible,label,fontColor,helpBox,whichLayerList,queryItem);
    
  };
  this.addTimeLapse = function(item,viz,name,visible,label,fontColor,helpBox,whichLayerList,queryItem){
    addTimeLapseToMap(item,viz,name,visible,label,fontColor,helpBox,whichLayerList,queryItem);
  };
  this.addSerializedTimeLapse = function(item,viz,name,visible,label,fontColor,helpBox,whichLayerList,queryItem){
    viz.serialized = true;
    addTimeLapseToMap(item,viz,name,visible,label,fontColor,helpBox,whichLayerList,queryItem);
  };
  this.addREST = function(tileURLFunction,name,visible,maxZoom,helpBox,whichLayerList){
    addRESTToMap(tileURLFunction,name,visible,maxZoom,helpBox,whichLayerList);
  };
  this.addExport = function(eeImage,name,res,resMin,resMax,resStep,Export,vizParams){
    addExport(eeImage,name,res,resMin,resMax,resStep,Export,vizParams);
  };
  this.addPlot = function(nameLngLat){
    addPlot(nameLngLat);
  };
  this.addFeatureView = function(assetId,visParams,name,visible,maxZoom,helpBox,whichLayerList){
    addFeatureView(assetId,visParams,name,visible,maxZoom,helpBox,whichLayerList);
  };
  this.centerObject = function(fc){
    centerObject(fc);
  }
}
var Map2 = new mp();

////////////////////////////////////////////////////////////////////////
//Some helper functions
function sleep(delay) {
        var start = new Date().getTime();
        while (new Date().getTime() < start + delay);
      }
function stringToBoolean(string){
    switch(string.toLowerCase().trim()){
        case "true": case "yes": case "1": return true;
        case "false": case "no": case "0": case null: return false;
        default: return Boolean(string);
    }
}
////////////////////////////////////////////////////////////////////////
function setGEERunID(){
  geeRunID = new Date().getTime();
}
////////////////////////////////////////////////////////////////////////
//Function to rerun all GEE code
//Clears out current map, exports, and legends and then reruns
function reRun(){
  // $('#summary-spinner').show(); 
  showMessage('Loading Updated Layers',staticTemplates.loadingModal);
  // showMessage('Loading',staticTemplates.loadingModal)
  setGEERunID();

  //Clean out current map, legend, etc
  clearSelectedAreas();
  clearUploadedAreas();
  layerChildID = 0;
  geeTileLayersDownloading = 0;
  updateGEETileLayersLoading();

  stopTimeLapse();
  queryObj = {};areaChartCollections = {};pixelChartCollections = {};timeLapseObj = {};
  intervalPeriod = 666.6666666;
  timeLapseID = null;
  timeLapseFrame = 0;
  cumulativeMode = false;
  NEXT_LAYER_ID = 1;
  clearSelectedAreas();
  selectedFeaturesGeoJSON = {};
  ['layer-list','reference-layer-list','area-charting-select-layer-list','fhp-div','time-lapse-legend-list'].map(function(l){
    $('#'+l).empty();
    $('#legend-'+l).empty();
  })
  
  $('#export-list').empty();
  
	
  Object.values(featureObj).map(function(f){f.setMap(null)});
  featureObj = {};
  map.overlayMapTypes.getArray().forEach(function(element,index){
                     map.overlayMapTypes.setAt(index,null);   
                });

  refreshNumber   ++;

  exportImageDict = {};
  try{
    clearDownloadDropdown();
  }catch(err){}
  google.maps.event.clearListeners(mapDiv, 'click');
  

  //Rerun the GEE code
  setTimeout(function() { 
    run();  
    
    $('.modal').modal('hide');
    $('.modal-backdrop').remove();
    setupAreaLayerSelection();
    addLabelOverlay();
  }, 1500);
	
  
  
  // $('#error-modal').toggleClass('show');
  // $('#summary-spinner').hide(); 

  
}
////////////////////////////////////////////////////////////////////////
//Helper functions
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}
function rgbToHex(r,g,b) {
    return "#"+("00000"+(r<<16|g<<8|b).toString(16)).slice(-6);
}
//Taken from: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
function offsetColor(hex,offset){
  obj = hexToRgb(hex)
  obj.r = (obj.r+offset)%255
  obj.g = (obj.g+offset)%255
  obj.b = (obj.b+offset)%255
  return rgbToHex(obj.r,obj.g,obj.b) 
}
function invertColor(hex) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}
function randomColor(){
  var r = getRandomInt(100, 200);
  var g = getRandomInt(100, 200);
  var b = getRandomInt(100, 255);
  var c = rgbToHex(r,g,b)
  return c
}
function getChartColor(){
  var color = chartColors[chartColorI%chartColors.length]
  chartColorI++;
  return color

}
function randomRGBColor(){
  var r = getRandomInt(100, 225);
  var g = getRandomInt(100, 225);
  var b = getRandomInt(100, 225);
  
  return [r,g,b];
}
function randomColors(n){
  var out = [];
  while(n>0){
    out.push(randomColor());
    n = n-1;
  }
  return out
}
//////////////////////////////////
//Taken from: https://sashat.me/2017/01/11/list-of-20-simple-distinct-colors/
var colorList = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'];
var colorMod = colorList.length;
function getColor(){
  var currentColor =  colorList[colorMod%colorList.length];
  colorMod++;
  return currentColor
}
//Taken from: https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function LightenDarkenColor(col,amt) {
    var usePound = false;
    if ( col[0] == "#" ) {
        col = col.slice(1);
        usePound = true;
    }
    var num = parseInt(col,16);

    var r = (num >> 16) + amt;

    if ( r > 255 ) r = 255;
    else if  (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if ( b > 255 ) b = 255;
    else if  (b < 0) b = 0;

    var g = (num & 0x0000FF) + amt;

    if ( g > 255 ) g = 255;
    else if  ( g < 0 ) g = 0;

    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}
/////////////////////////////////////////////////////
//Area measurement
function startArea(){
  if(polyOn === false){
    polyOn = true;
  }
    areaPolygonOptions.polyNumber = polyNumber;
    map.setOptions({draggableCursor:'crosshair'});
    map.setOptions({disableDoubleClickZoom: true });
    // Construct the polygon.
    areaPolygonObj[polyNumber] = new google.maps.Polyline(areaPolygonOptions);
    areaPolygonObj[polyNumber].setMap(map);

    updateArea = function(){
      var unitName;var unitMultiplier;
        var keys = Object.keys(areaPolygonObj);
        // console.log('keys');console.log(keys);
        var totalArea = 0;
        var totalWithArea = 0;
        var outString = '';
        function areaWrapper(key){
          // console.log('key');console.log(key);
        // print('Adding in: '+key.toString());
        var pathT = areaPolygonObj[key].getPath().getArray();

        if(pathT.length > 0){

          clickCoords =clickLngLat;//pathT[pathT.length-1];
           console.log(clickCoords)
           console.log(pathT)
          // console.log(clickCoords);console.log(pathT.length);
          area = google.maps.geometry.spherical.computeArea(areaPolygonObj[key].getPath());
          
          var unitNames = unitNameDict[metricOrImperialArea].area;
          var unitMultipliers = unitMultiplierDict[metricOrImperialArea].area;
          if(area>0){
            totalWithArea++;
          }
          totalArea = totalArea + area

          if(totalArea >= 1000){
            unitName = unitNames[1];
            unitMultiplier = unitMultipliers[1];
          }
          else{
            unitName = unitNames[0];
            unitMultiplier = unitMultipliers[0];
            }
          console.log(unitNames);
          console.log(unitMultipliers);
          console.log(area);
          console.log(totalArea);
          console.log(unitName);
          console.log(unitMultiplier)
        }
      }
      keys.map(areaWrapper)
      var pixelProp = totalArea/9;

      totalArea = totalArea*unitMultiplier;
        totalArea = totalArea.formatNumber();
        var polyString = 'polygon';
        if(keys.length>1){
          polyString = 'polygons';
        }
        var areaContent = totalWithArea.toString()+' '+polyString+' <br>'+totalArea +' '+unitName ;
        if(mode === 'Ancillary'){areaContent += '<br>'+pixelProp.formatNumber() + ' % pixel'}
        infowindow.setContent(areaContent);
        infowindow.setPosition(clickCoords);
        
        infowindow.open(map);
        $('.gm-ui-hover-effect').hide();         
    }

  startListening();
}
function setToPolygon(id){
        if(id == undefined || id == null){id = polyNumber};
        console.log('Setting '+id.toString()+' to polygon');
        areaPolygonOptions.strokeColor = areaPolygonObj[id].strokeColor;
        var path = areaPolygonObj[id].getPath();
        areaPolygonObj[id].setMap(null);
        areaPolygonObj[id] = new google.maps.Polygon(areaPolygonOptions);
        areaPolygonObj[id].setPath(path);
        areaPolygonObj[id].setMap(map);
}
function setToPolyline(id){
        if(id == undefined || id == null){id = polyNumber};
        areaPolygonOptions.strokeColor = areaPolygonObj[id].strokeColor;
        var path = areaPolygonObj[polyNumber].getPath();
        areaPolygonObj[id].setMap(null);
        areaPolygonObj[id] = new google.maps.Polyline(areaPolygonOptions);
        areaPolygonObj[id].setPath(path);
        areaPolygonObj[id].setMap(map);
}

//Start listening for area measuring
function startListening(){
    mapHammer = new Hammer(document.getElementById('map'));

    mapHammer.on("tap", function(event) {
        

        var path = areaPolygonObj[polyNumber].getPath();
        var x =event.center.x;
        var y = event.center.y;
        clickLngLat =point2LatLng(x,y);
        path.push(clickLngLat);
        updateArea();
    
    });
    mapHammer.on("doubletap",function(){
        setToPolygon()
        resetPolygon();
    });

    google.maps.event.addListener(areaPolygonObj[polyNumber], "click", updateArea);
    google.maps.event.addListener(areaPolygonObj[polyNumber], "mouseup", updateArea);
    google.maps.event.addListener(areaPolygonObj[polyNumber], "dragend", updateArea);
    google.maps.event.addListener(areaPolygonObj[polyNumber].getPath(), 'set_at',  updateArea);

    window.addEventListener("keydown", resetPolys);
    window.addEventListener("keydown", deleteLastAreaVertex);

}
//Clear and restart area measuring
function resetPolys(e){
    if( e === undefined || e.key === 'Delete'|| e.key === 'd'|| e.key === 'Backspace' ){
        stopArea();
        startArea();
      }
    }
//Undo last vertex
function undoAreaMeasuring(){
  if(areaPolygonObj[polyNumber].getPath().length >0){
          areaPolygonObj[polyNumber].getPath().pop(1);
          updateArea();
        }
  else if(polyNumber > 1){
          stopListening();
          polyNumber = polyNumber -1;
          setToPolyline()
          startListening();
        }
}
function undoDistanceMeasuring(){
  distancePolyline.getPath().pop(1);
  updateDistance();
}
function deleteLastAreaVertex(e){
      // console.log(e);
      if(e.key == 'z' && e.ctrlKey){
        undoAreaMeasuring();
      }
    }
function deleteLastDistanceVertex(e){
      // console.log(e);
      if(e.key == 'z' && e.ctrlKey){
        undoDistanceMeasuring();
      }
    }
function activatePoly(poly){
  console.log(poly.polyNumber)
}
function stopListening(){
    try{
    mapHammer.destroy();
    google.maps.event.clearListeners(areaPolygonObj[polyNumber], 'dblclick');
    google.maps.event.clearListeners(areaPolygonObj[polyNumber], 'click');
    google.maps.event.clearListeners(mapDiv, 'click');
    google.maps.event.clearListeners(areaPolygonObj[polyNumber], 'mouseup');
    google.maps.event.clearListeners(areaPolygonObj[polyNumber], 'dragend');
    window.removeEventListener('keydown',resetPolys);
    window.removeEventListener('keydown',deleteLastAreaVertex);
    }catch(err){}
}
function clearPoly(id){

  areaPolygonObj[id].setMap(null);
  areaPolygonObj[id].setPath([]);
  updateArea();
  google.maps.event.clearListeners(areaPolygonObj[id], 'click');
}
function clearPolys(){
  stopListening();
  var keys = Object.keys(areaPolygonObj);
  keys.map(function(k){areaPolygonObj[k].setMap(null);})
  areaPolygonObj = {};
  polyNumber = 1;
  polyOn = false;

}
function stopArea(){
  try{
    mapHammer.destroy();
  }catch(err){}
  map.setOptions({disableDoubleClickZoom: true });
  
  clearPolys();
  infowindow.setMap(null);
  map.setOptions({draggableCursor:'hand'});
}

function resetPolygon(){
    stopListening();
    var keys = Object.keys(areaPolygonObj);
    var lastKey = keys[keys.length-1];
    console.log('last key '+lastKey.toString());
    polyNumber = parseInt(lastKey);
    polyNumber++;
    startArea();
    // console.log(areaPolygonObj)
}
function newPolygon(){
  stopArea();

}
///////////////////////////////////////////////////////////////////////////////////
//Distance measuring functions
function startDistance(){
  map.setOptions({draggableCursor:'crosshair'});
    try{
      distancePolyline.destroy();
    }catch(err){};
    
    distancePolyline = new google.maps.Polyline(distancePolylineOptions);
    distancePolyline.setMap(map);
    map.setOptions({disableDoubleClickZoom: true });

    google.maps.event.addListener(distancePolyline, "click", updateDistance);
    mapHammer = new Hammer(document.getElementById('map'));
    mapHammer.on("doubletap", resetPolyline);
    mapHammer.on("tap", function(event) {
        var x =event.center.x;
        var y = event.center.y;
        var path = distancePolyline.getPath();
        clickLngLat =point2LatLng(x,y)
        path.push(clickLngLat);
        updateDistance();
    });
    google.maps.event.addListener(distancePolyline, "mouseup", updateDistance);
    google.maps.event.addListener(distancePolyline, "dragend", updateDistance);
    google.maps.event.addListener(distancePolyline.getPath(), 'set_at',  updateDistance);
    window.addEventListener('keydown',deleteLastDistanceVertex);
    window.addEventListener('keydown',resetPolyline);
    }

function stopDistance(){
  try{
    window.removeEventListener('keydown',deleteLastDistanceVertex);
    window.removeEventListener('keydown',resetPolyline);
    mapHammer.destroy();
    map.setOptions({disableDoubleClickZoom: true });
    google.maps.event.clearListeners(distancePolyline, 'click');
    google.maps.event.clearListeners(mapDiv, 'click');
    google.maps.event.clearListeners(distancePolyline, 'mouseup');
    google.maps.event.clearListeners(distancePolyline, 'dragend');
    if(infowindow != undefined){infowindow.setMap(null);}
    distancePolyline.setMap(null);
    map.setOptions({draggableCursor:'hand'});
    infowindow.setMap(null);
  }catch(err){}  
}
function resetPolyline(e){
  if(e === undefined || e.key === undefined ||  e.key == 'Delete'|| e.key == 'd'|| e.key == 'Backspace'){
    stopDistance();startDistance();
  }    
}
updateDistance = function(){
  distance = google.maps.geometry.spherical.computeLength(distancePolyline.getPath());
  var pathT = distancePolyline.getPath().j;
  clickCoords = clickLngLat;//pathT[pathT.length-1];
  var unitNames = unitNameDict[metricOrImperialDistance].distance;
  var unitMultipliers = unitMultiplierDict[metricOrImperialDistance].distance;
  if(distance >= 1000){
    var unitName = unitNames[1];
    var unitMultiplier = unitMultipliers[1];
  }
  else{
    var unitName = unitNames[0];
    var unitMultiplier = unitMultipliers[0];
    }
  distance = distance*unitMultiplier
  if(distance >= 0){
   
        var distanceContent = distance.formatNumber() + ' ' + unitName 
        infowindow.setContent(distanceContent);
        infowindow.setPosition(clickCoords);

        infowindow.open(map);
        $('.gm-ui-hover-effect').hide();
  }
}
// function getDistance(lat1,lon1,lat2,lon2){
//     var R = 6371e3; // metres
//     var phi1 = lat1* Math.PI / 180;
//     var phi2 = lat2* Math.PI / 180;
//     var deltaPhi = (lat2-lat1)* Math.PI / 180;
//     var deltaLambda = (lon2-lon1)* Math.PI / 180;

//     var a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
//             Math.cos(phi1) * Math.cos(phi2) *
//             Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
//     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     var d = R * c;
//     return d
// }


// function addFusionTable1(id){
// var layer1 = new google.maps.FusionTablesLayer({
//           query: {
//             select: 'geometry',
//             from: id
//           },
//           styles: [{
//       polygonOptions: {
//         // fillColor: '#00FF00',
//         fillOpacity: 0.0000000000001,
//         strokeColor:'#FF0000',
//         strokeWeight : 2
//       }
//     }]
//     // map:map
//         });
//     layer1.setMap(map);
//     }
// function addFusionTable2(id){
// var layer2 = new google.maps.FusionTablesLayer({
//           query: {
//             select: 'geometry',
//             from: id
//           },
//           styles: [{
//       polygonOptions: {
//         // fillColor: '#00FF00',
//         fillOpacity: 0.0000000000001,
//         strokeColor:'#FF0000',
//         strokeWeight : 2
//       }
//     }]
//         });
// layer2.setMap(map);
    
//     }


////////////////////////////////////////////////////////////////
//Setup study areas and run functions
function dropdownUpdateStudyArea(whichOne){
  $('#summary-spinner').show();
  resetStudyArea(whichOne);
  var coords = studyAreaDict[whichOne].center;
  centerMap(coords[1],coords[0],coords[2]);
    if(mode === 'Ancillary'){
      run = runAncillary;
    } else if( mode === 'LT'){
      run  = runLT;
    }else if( mode === 'LCMS'|| (mode === 'LCMS-pilot' && studyAreaDict[longStudyAreaName].isPilot == false)){
      run  = runGTAC;
    }else if( mode === 'LCMS-pilot'){
      run  = runUSFS;
    }else if( mode === 'STORM'){
      run  = runStorm;
    }else if( mode === 'LAMDA'){
      run  = runLAMDA;
    }
    else if(mode === 'lcms-base-learner'){
      run = runBaseLearner
    }
      else if(studyAreaName === 'CONUS'){
      run = runCONUS
    }else{run = runUSFS};

    reRun();
};
//Function to set study area
var resetStudyArea = function(whichOne){
    localStorage.setItem("cachedStudyAreaName",whichOne);
    urlParams.studyAreaName = whichOne;
    $('#studyAreaDropdown').val(whichOne);
    $('#study-area-label').text(whichOne);
    console.log('changing study area');
    console.log(whichOne);
    lowerThresholdDecline =  studyAreaDict[whichOne].lossThresh;
    if(studyAreaDict[whichOne].lossSlowThresh !== undefined  && studyAreaDict[whichOne].lossSlowThresh !== null){
      lowerThresholdSlowLoss = studyAreaDict[whichOne].lossSlowThresh;
    }else{
      lowerThresholdSlowLoss = lowerThresholdDecline;
    }
    if(studyAreaDict[whichOne].lossFastThresh !== undefined  && studyAreaDict[whichOne].lossFastThresh !== null){
      lowerThresholdFastLoss = studyAreaDict[whichOne].lossFastThresh;
    }else{
      lowerThresholdFastLoss = lowerThresholdDecline;
    }
   
    upperThresholdDecline = 1;
    upperThresholdSlowLoss = 1;
    upperThresholdFastLoss = 1;
    lowerThresholdRecovery = studyAreaDict[whichOne].gainThresh;
    upperThresholdRecovery = 1;
    
    startYear = studyAreaDict[whichOne].startYear;
    endYear = studyAreaDict[whichOne].endYear;
   
    setUpRangeSlider('lowerThresholdDecline',0,1,lowerThresholdDecline,0.05,'decline-threshold-slider','null');
    setUpRangeSlider('lowerThresholdRecovery',0,1,lowerThresholdRecovery,0.05,'recovery-threshold-slider','null');
    
    setUpRangeSlider('lowerThresholdSlowLoss',0,1,lowerThresholdSlowLoss,0.05,'slow-loss-threshold-slider','null');
    setUpRangeSlider('lowerThresholdFastLoss',0,1,lowerThresholdFastLoss,0.05,'fast-loss-threshold-slider','null');
    
    setUpDualRangeSlider('urlParams.startYear','urlParams.endYear',minYear,maxYear,urlParams.startYear,urlParams.endYear,1,'analysis-year-slider','analysis-year-slider-update','null')

    var coords = studyAreaDict[whichOne].center;
    studyAreaName = studyAreaDict[whichOne].name;
    if(studyAreaName === 'CONUS'){run = runCONUS;}
    else if( mode === 'LCMS'|| (mode === 'LCMS-pilot' && studyAreaDict[longStudyAreaName].isPilot == false)){
      run = runGTAC;
    }
    else{run = runUSFS;};
    if(studyAreaDict[whichOne].addFastSlow){
      $('#fast-slow-threshold-container').show();
    }else{$('#fast-slow-threshold-container').hide();}
    if(studyAreaDict[whichOne].addGainThresh){
      $('#recovery-threshold-slider-container').show();
    }else{$('#recovery-threshold-slider-container').hide();}
    $('#export-crs').val(studyAreaDict[whichOne].crs)
}
///////////////////////////////////////////////////////////
//Taken from https://developers.google.com/maps/documentation/javascript/examples/places-searchbox
function initSearchBox() {
  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    var formattedAddresses = [];
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      formattedAddresses.push(place.formatted_address);
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    var boundsBounds = {
      south : [-85,85],
      west : [-179,179],
      north : [-85,85],
      east : [-179,179]
    }
    
    bounds = bounds.toJSON();
 
    Object.keys(bounds).map(function(key){
      var coord = bounds[key];
      var min =  boundsBounds[key][0];
      var max = boundsBounds[key][1];
      if(coord < min){bounds[key] = min;showMessage('Search coords tip!','Search coords format is lat lng (e.g. 45 -111)')}
      if(coord > max){bounds[key] = max;showMessage('Search coords tip!','Search coords format is lat lng (e.g. 45 -111)')}

    });
    console.log(bounds)
    console.log(formattedAddresses.join(','))
    ga('send', 'event', 'places-search', JSON.stringify(bounds), formattedAddresses.join(','));
    map.fitBounds(bounds);
  });
  }
/////////////////////////////////////////////////////////////////
//Set up info window
var infoWindowXOffset = 30;
function getInfoWindow(xOffset,yOffset){
  if(xOffset == null || xOffset === undefined){xOffset = 30};
  if(yOffset == null || yOffset === undefined){yOffset = -30};
  return new google.maps.InfoWindow({
    content : '',
    maxWidth: 300,
    pixelOffset: new google.maps.Size(xOffset,yOffset,'rem','rem'),
    close:false
  });
} 
//Functions for tracking views and going forward and backward map views
function trackView(){
  if(updateViewList){
    viewList = viewList.slice(0,viewIndex)
    viewList.push({lng:urlParams.lng, lat:urlParams.lat,zoom:urlParams.zoom});
    viewIndex = viewList.length;
    checkViewIndex();
  }
}
//See if there are any remaining views
function checkViewIndex(){
  if(viewIndex <= 1){
    viewIndex = 1
    $('#back-view-button').prop('disabled',true);
  }else{$('#back-view-button').prop('disabled',false)};

  if(viewIndex >= viewList.length){
    viewIndex = viewList.length;
    $('#forward-view-button').prop('disabled',true);
  }else{$('#forward-view-button').prop('disabled',false)};
}
function setView(view){
    updateViewList = false;
    map.setCenter(view);
    map.setZoom(view.zoom);
  }
  function backView(){
    viewIndex--;
    checkViewIndex();
    setView(viewList[viewIndex-1]);
    
  }
  function forwardView(){
    viewIndex++;
    checkViewIndex();
    setView(viewList[viewIndex-1]);
    
  } 
////////////////////////////////////////////////////////////////
// Create an overlay to display map labels only
var labelOverlayAdded = false;
function addLabelOverlay(){
  map.overlayMapTypes.setAt(Object.keys(layerObj).length, labelsMapType);
  labelOverlayAdded = true;
}
function removeLabelOverlay(){
  map.overlayMapTypes.setAt(Object.keys(layerObj).length,null);
  labelOverlayAdded = false;
}
function toggleLabelOverlay(){
  if(labelOverlayAdded){
    removeLabelOverlay()
  }else{addLabelOverlay()}
}
var labelsMapType;

//Initialize map
function initialize() {
  labelsMapType = new google.maps.StyledMapType([
  {
    "elementType": "geometry.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "weight": 0.01
      }
    ]
  }
]);

 
  var mapTypeIds = ['roadmap', 'satellite', 'hybrid', 'terrain'];
  if(urlParams.mapTypeId  === undefined || urlParams.mapTypeId  === null &&urlParams.mapTypeId.indexOf(urlParams.mapTypeIds)  === -1 ){
    urlParams.mapTypeId = 'hybrid'
  }
  //Set up map options
  var mapOptions = {
    center: null,
    zoom: null,
    minZoom: 2,
     disableDefaultUI: false,
    disableDoubleClickZoom: true,
    // maxZoom: 15,
    mapTypeId:urlParams.mapTypeId,
    streetViewControl: true,
    fullscreenControl: false,
    mapTypeControlOptions :{position: google.maps.ControlPosition.TOP_RIGHT,
      mapTypeIds: mapTypeIds},
    // fullscreenControlOptions:{position: google.maps.ControlPosition.RIGHT_TOP},
    streetViewControlOptions:{position: google.maps.ControlPosition.RIGHT_TOP},
    scaleControlOptions:{position: google.maps.ControlPosition.RIGHT_TOP},
    zoomControlOptions:{position: google.maps.ControlPosition.RIGHT_TOP},
    tilt:0,
    controlSize: 25,
    scaleControl: true,
    clickableIcons:false
  };

  var center = new google.maps.LatLng(initialCenter[0],initialCenter[1]);
  var zoom = initialZoomLevel;//8;

  var settings = null;


  //Set up caching of study area
  if(typeof(Storage) !== "undefined"){
    cachedStudyAreaName = localStorage.getItem("cachedStudyAreaName");
    // console.log(urlParams.studyAreaName)

    if(urlParams.studyAreaName !== null && urlParams.studyAreaName !== undefined){
      cachedStudyAreaName = decodeURIComponent(urlParams.studyAreaName);
    }else if(cachedStudyAreaName === null || cachedStudyAreaName === undefined){
      cachedStudyAreaName = defaultStudyArea;
    }
    studyAreaName = studyAreaDict[cachedStudyAreaName].name;
    longStudyAreaName = cachedStudyAreaName;
   
    $('#study-area-label').text(longStudyAreaName);
    $('#study-area-label').fitText(1.8);
    
    if(studyAreaSpecificPage == true){
      cachedSettingskey =  studyAreaName +"-settings"; 
    }
    settings = JSON.parse(localStorage.getItem(cachedSettingskey));
    layerObj =  null;
  }

  if(settings != null && settings.center != null && settings.zoom != null){
    center = settings.center;
    zoom  = settings.zoom;
  }
  if(layerObj === null){
    layerObj = {};
  }

  if(urlParams.lng !== undefined && urlParams.lng !== null && urlParams.lat !== undefined && urlParams.lat !== null ){
    print('Setting center from URL')
    mapOptions.center = {lng:parseFloat(urlParams.lng),lat:parseFloat(urlParams.lat)};
  }else{
    mapOptions.center = center;


  }
  if(urlParams.zoom !== undefined && urlParams.zoom !== null ){
    print('Setting zoom from URL')
    mapOptions.zoom = parseInt(urlParams.zoom);
  }else{
    mapOptions.zoom = zoom;
  }
  urlParams.lng =  mapOptions.center.lng;urlParams.lat = mapOptions.center.lat;urlParams.zoom= mapOptions.zoom;
  // trackView()  
  map = new google.maps.Map(document.getElementById("map"),mapOptions);
  //Associate the styled map with the MapTypeId and set it to display.
  // map.mapTypes.set('dark_mode', styledMapType);
  // const drawingManager = new google.maps.drawing.DrawingManager({
  //   drawingMode: google.maps.drawing.OverlayType.MARKER,
  //   drawingControl: true,
  //   drawingControlOptions: {
  //     position: google.maps.ControlPosition.TOP_CENTER,
  //     drawingModes: [
   
  //       google.maps.drawing.OverlayType.RECTANGLE,
  //       google.maps.drawing.OverlayType.POLYGON,
        
  //     ],
  //   },
    
    
  // });
  // drawingManager.setMap(map);
 //  $("#rectangle-drawing-btn").click( function(){
 //      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
 // });

 //  $("#polygon-drawing-btn")square-drawing-btn.click( function(){
 //        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
 //   });
  //Listen for street view use
  //Adapted from: https://stackoverflow.com/questions/7251738/detecting-google-maps-streetview-mode
  var thePanorama = map.getStreetView();
  google.maps.event.addListener(thePanorama, 'visible_changed', function() {

      if (thePanorama.getVisible()) {
        console.log('street view in use')
        $('#sidebar-left-container').hide();
        $('.sidebar-toggler').hide();
        $('#legendDiv').hide();
        $('#bottombar').hide();
          // Display your street view visible UI

      } else {
        console.log('street view not in use')
        $('#sidebar-left-container').show();
        $('.sidebar-toggler').show();
        $('#legendDiv').show();
        $('#bottombar').show();
          // Display your original UI

      }

  });
  marker=new google.maps.Circle({
    center:{lat:45,lng:-111},
    radius:5
  });
  
  infowindow = getInfoWindow();

  queryGeoJSON = new google.maps.Data();
  queryGeoJSON.setMap(map);
  queryGeoJSON.setStyle({strokeColor:'#FF0'});
  

  //Add search box
  initSearchBox();
  
  placeholderID = 1;


  // function addWMS(url,name,maxZoom,xThenY){
  //   if(maxZoom === null || maxZoom === undefined  ){
  //     maxZoom = 19;
  //   }
  //   if(xThenY === null || xThenY === undefined  ){
  //     xThenY = false;
  //   }
  //     var imageMapType =  new google.maps.ImageMapType({
  //     getTileUrl: function(coord, zoom) {
  //         // "Wrap" x (logitude) at 180th meridian properly
  //         // NB: Don't touch coord.x because coord param is by reference, and changing its x property breakes something in Google's lib 
  //         var tilesPerGlobe = 1 << zoom;
  //         var x = coord.x % tilesPerGlobe;
  //         if (x < 0) {
  //             x = tilesPerGlobe+x;
  //         }
  //         // Wrap y (latitude) in a like manner if you want to enable vertical infinite scroll
  //         // return "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/" + zoom + "/" + x + "/" + coord.y + "?access_token=pk.eyJ1IjoiaWhvdXNtYW4iLCJhIjoiY2ltcXQ0cnljMDBwNHZsbTQwYXRtb3FhYiJ9.Sql6G9QR_TQ-OaT5wT6f5Q"
  //         if(xThenY ){
  //             return url+ zoom + "/" + x + "/" + coord.y +".png?";
  //         }
  //         else{return url+ zoom + "/" + coord.y + "/" +x  +".png?";}//+ (new Date()).getTime();
          
  //     },
  //     tileSize: new google.maps.Size(256, 256),
  //     name: name,
  //     maxZoom: maxZoom
  
  // })

         
  //     map.mapTypes.set('Placeholder' + placeholderID.toString(),imageMapType )
  //     placeholderID  ++;
  // }
              

        

    //Set up cursor info in bottom bar
    function updateMousePositionAndZoom(cLng,cLat,zoom,elevation){
            $('.legendDiv').css('bottom',$('.bottombar').height());
            
            $( "#current-mouse-position" ).html( 'Lng: ' +cLng + ', Lat: ' + cLat +', '+elevation+ 'Zoom: ' +zoom +', 1:'+zoomDict[zoom]);
    }
     
    //Set up elevation api
   
    // var elevator = new google.maps.ElevationService;
    var lastElevation = 0;
    var elevationCheckTime = 0;

    function getElevation(center){
      mouseLat = center.lat().toFixed(4).toString();
      mouseLng = center.lng().toFixed(4).toString();
      try{
        var elevation = ee.Image("USGS/SRTMGL1_003").reduceRegion(ee.Reducer.first(),ee.Geometry.Point([center.lng(), center.lat()])).get('elevation');
        elevation.evaluate(function(thisElevation){
          
          if(thisElevation !== null){
            var thisElevationFt = parseInt(thisElevation*3.28084);
            lastElevation = 'Elevation: '+thisElevation.toString()+'(m),'+thisElevationFt.toString()+'(ft),';
          }else{
            var thisElevationFt = 'NA';
            lastElevation = 'Elevation: NA,';
          };
          
          updateMousePositionAndZoom(mouseLng,mouseLat,zoom,lastElevation)
        })
      }catch(err){
        var thisElevationFt = 'NA';
        lastElevation = 'Elevation: NA,';
        updateMousePositionAndZoom(mouseLng,mouseLat,zoom,lastElevation)
      }
      
    
   
    }
    //Listen for mouse movement and update bottom bar
    google.maps.event.addDomListener(mapDiv,'mousemove',function(event){
        var x =event.clientX;
        var y = event.clientY;
        var center =point2LatLng(x,y);
        var zoom = map.getZoom();
        // var center = event.latLng;
        mouseLat = center.lat().toFixed(4).toString();
        mouseLng = center.lng().toFixed(4).toString();
        var now = new Date().getTime()
        var dt = now - elevationCheckTime  ;
        
        if(dt > 1000){
          getElevation(center);
          elevationCheckTime = now;
        }
        else{updateMousePositionAndZoom(mouseLng,mouseLat,zoom,lastElevation)}
        
    })
    function trackViewChange(){
      // console.log('idle')
      zoom = map.getZoom();
      var mapCenter = map.getCenter();
      var mapCenterLng = mapCenter.lng();
      var mapCenterLat = mapCenter.lat();
      urlParams.lng = mapCenterLng;urlParams.lat = mapCenterLat;urlParams.zoom= zoom;

      trackView();
      
      // console.log('bounds changed');
      var bounds = map.getBounds();
      var keys = Object.keys(bounds);
      var keysX = Object.keys(bounds[keys[0]]);
      var keysY = Object.keys(bounds[keys[1]]);
      // console.log('b');console.log(bounds);
      updateMousePositionAndZoom(mouseLng,mouseLat,zoom,lastElevation);
      eeBoundsPoly = ee.Geometry.Rectangle([bounds[keys[1]][keysX[0]],bounds[keys[0]][keysY[0]],bounds[keys[1]][keysX[1]],bounds[keys[0]][keysY[1]]]);
      if(typeof(Storage) == "undefined") return;
      localStorage.setItem(cachedSettingskey,JSON.stringify({center:{lat:mapCenterLat,lng:mapCenterLng},zoom:zoom}));
      updateViewList = true;
      // setTimeout(function(){updateViewList = true;},10)
    }
    //Listen for zoom change and update bottom bar
    
    google.maps.event.addListener(map,'maptypeid_changed',function(){
        console.log('map type id changed')
        urlParams.mapTypeId = map.mapTypeId;
        if(map.mapTypeId === 'satellite'){removeLabelOverlay()}
        else{addLabelOverlay()};
    })

    //Keep track of map bounds and zoom changes
    // google.maps.event.addListener(map,'zoom_changed',trackViewChange)
    google.maps.event.addListener(map,'idle',trackViewChange);

    //Specify proxy server location
    //Proxy server used for EE and GCS auth
    //RCR appspot proxy costs $$
	 // ee.initialize("https://rcr-ee-proxy-server2.appspot.com/api","https://earthengine.googleapis.com/map",function(){
    //Initialize GEE
    
    setTimeout(function() { 
      if(localStorage['showIntroModal-'+mode] === 'true'){
        $('#introModal').modal().show();
      }else{
        showMessage('Loading',staticTemplates.loadingModal)
      }
      
    },1000);

    ee.initialize(authProxyAPIURL,geeAPIURL,function(){
      //Set up the correct GEE run function
      if(cachedStudyAreaName === null){
        $('#study-area-label').text(defaultStudyArea);
      }
      if(mode === 'Ancillary'){
        run = runAncillary;
      } else if( mode === 'LCMS'|| (mode === 'LCMS-pilot' && studyAreaDict[longStudyAreaName].isPilot == false)){
        run  = runGTAC;
      }else if( mode === 'LT'){
        run  = runLT;
      } else if(mode === 'MTBS'){
        run = runMTBS;
      }else if(mode === 'TEST'){
        run = runTest;
      }else if(mode === 'IDS'){
        run = runIDS;
      }else if(mode === 'geeViz'){
        run = runGeeViz;
      }else if( mode === 'LAMDA'){
      run  = runLAMDA;
      }else if( mode === 'STORM'){
      run  = runStorm;
      }else if(mode === 'lcms-base-learner'){
        run = runBaseLearner
      }else if(studyAreaName === 'CONUS'){
        longStudyAreaName = cachedStudyAreaName;
        run = runCONUS;
      }else if(cachedStudyAreaName != null){
        longStudyAreaName = cachedStudyAreaName;
        resetStudyArea(cachedStudyAreaName)
      } 
      else{run = runUSFS}
      // run = function(){};
    //Bring in downloads if needed
    if(mode === 'LCMS'){ 
      setupDropdownTreeDownloads(studyAreaName);
      populateLCMSDownloads();
    }

    setGEERunID();

    setTimeout(function() { 
       run();
    
      setupAreaLayerSelection();
      // setupFSB();
      //Bring in plots of they're turned on
      if(plotsOn){
        addPlotCollapse();
        loadAllPlots();
      }
      if(localStorage['showIntroModal-'+mode] !== 'true'){
        $('.modal').modal('hide');
        $('.modal-backdrop').remove();
      }else{
        $('#intro-modal-loading-div').hide();
        $('#summary-spinner').hide();
      };
      
      addLabelOverlay();
    }, 1500);
   
  	});

}
///////////////////////////////////////////////////////////////
//Wait to initialize
//Taken from: https://stackoverflow.com/questions/32808613/how-to-wait-till-the-google-maps-api-has-loaded-before-loading-a-google-maps-ove
var mapWaitCount = 0;
var mapWaitMax = 20;
//Handle failed attempts to load gmaps api
function map_load() { // if you need any param
    mapWaitCount++;
    // if api is loaded
    if(typeof google !== 'undefined') {
        initialize();
    }
    // try again if until maximum allowed attempt
    else if(mapWaitCount < mapWaitMax) {
        console.log('Waiting attempt #' + mapWaitCount); // just log
        setTimeout(function() { map_load(); }, 1000);
    }
    // if failed after maximum attempt, not mandatory
    else if(mapWaitCount >= mapWaitMax) {
        console.log('Failed to load google api');
    }
}

map_load();
/////////////////////////////////////////////////////


function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}
function downloadURI() {
	if(uri != null && uri != undefined){
	  var link = document.createElement("a");
	  link.download = uriName + '.png';
	  link.href = uri;
	  link.click();
	  // document.body.removeChild(link);
	    delete link;
}}

function clearUploadedAreas(){
	if(selectionTracker.uploadedLayerIndices === undefined || selectionTracker.uploadedLayerIndices === null){
		selectionTracker.uploadedLayerIndices = [];
	}
	// selectionTracker.uploadedLayerIndices.reverse().map(function(index){
 //    	map.overlayMapTypes.setAt(index,null)
 //    });
    turnOffUploadedLayers();
	$('#area-charting-shp-layer-list').empty();
}
function clearSelectedAreas(){
  

    
    selectionTracker.seletedFeatureLayerIndices.reverse().map(function(index){
    	map.overlayMapTypes.setAt(index,null)
    });
    setupAreaLayerSelection();
    updateSelectedAreasNameList();updateSelectedAreaArea();

    
}



function removeLastSelectArea(){
	selectionTracker.selectedFeatures = selectionTracker.selectedFeatures.slice(0,selectionTracker.selectedFeatures.length-1);
	updateSelectedAreasNameList();updateSelectedAreaArea();
	var lastIndex = selectionTracker.seletedFeatureLayerIndices[selectionTracker.seletedFeatureLayerIndices.length-1]
	map.overlayMapTypes.setAt(lastIndex,null);
	selectionTracker.seletedFeatureLayerIndices = selectionTracker.seletedFeatureLayerIndices.slice(0,selectionTracker.seletedFeatureLayerIndices.length-1)
	$('#area-charting-selected-layer-list li:first-child').remove();
}
function updateSelectedAreasNameList(){

	var selectedFeatures = ee.FeatureCollection(selectionTracker.selectedFeatures).flatten()
    
 //    $('#select-features-list-spinner').show();
   
  	// $('#selected-features-list').empty();
            
    var namesList = ee.List(ee.Dictionary(selectedFeatures.aggregate_histogram('name')).keys());
    
    namesList.evaluate(function(names,failure){
    	
        if(failure !== undefined){showMessage('Error',failure)}
        else{
        	selectionTracker.selectedNames = names;
            // names.map(function(nm){
                // $('#selected-features-list').append(`<ul>${nm}</ul>`);
            // })
           }
 //        $('#select-features-list-spinner').hide();
       })
}
function updateSelectedAreaArea(){
	var selectedFeatures = ee.FeatureCollection(selectionTracker.selectedFeatures).flatten()
    
    $('#select-features-area-spinner').show();
    
    var area =selectedFeatures.geometry().area(1000);
    area.evaluate(function(values,failure){
        if(failure !== undefined){showMessage('Error',failure)}
        else{
            $('#selected-features-area').html((values*0.0001).formatNumber() + ' hectares / '+(values*0.000247105).formatNumber() + ' acres');
                
                $('#select-features-area-spinner').hide();
            }
        })
            
    }

function setupAreaLayerSelection(){
	google.maps.event.clearListeners(map, 'click');
	selectionTracker.selectedFeatures = [];
	selectionTracker.selectedNames = [];
	selectionTracker.seletedFeatureLayerIndices = [];
	// turnOffSelectLayers();
	$('#selected-features-list').empty();
	$('#area-charting-selected-layer-list').empty();
	
	// Map2.addLayer(allSelectLayers,{layerType:'geeVectorImage'},'all select layers')
	    map.addListener('click',function(event){
	        if(getActiveTools().indexOf("Area Tools-Select an Area on map")>-1){
	            var coords = [event.latLng.lng(),event.latLng.lat()];
	            
	            Object.keys(selectedFeaturesJSON).map(function(k){
	            	if(layerObj[selectedFeaturesJSON[k].id].visible){
	            		var selectedFeaturesT = selectedFeaturesJSON[k].eeObject
	            			.filterBounds(ee.Geometry.Point(coords));
	            		
	            		var namesList = ee.List(selectedFeaturesT.aggregate_array('name'));

	            		namesList.evaluate(function(nms,failure){
	            			if(failure !== undefined){showMessage('Error',failure)}
        					else{
        						if(nms.length > 0){
        							console.log('names '+nms)
        							if(simplifyMaxError !== 0){
				            			selectedFeaturesT = ee.FeatureCollection(selectedFeaturesT.map(function(f){return ee.Feature(f).simplify(simplifyMaxError, crs)}));
				            		}
        							selectionTracker.selectedFeatures.push(selectedFeaturesT);

        						
        							var layerName = 'Selected '+selectedFeaturesJSON[k].layerName+' '+ nms.join('-').replaceAll('&','-');
        							if(simplifyMaxError !== 0){
        								layerName = 'Simplified ('+simplifyMaxError.toString()+'m)- '+layerName 
        							}
        							Map2.addLayer(selectedFeaturesT,{layerType:'geeVectorImage',isSelectedLayer :true},layerName,true,null,null,null,'area-charting-selected-layer-list');
        						}	updateSelectedAreasNameList();updateSelectedAreaArea();
        					}
	            		})	
	            	}
				})
	             
	        }   
	})
}

// function updateSelectedAreaArea(){
// 	var selectedFeatures = getSelectedGEEFeatureCollection();
// 	if(selectedFeatures === undefined){
// 		$('#selected-features-area').html('0 hectares / 0 acres');
// 	}else{
// 		$('#selected-features-area').html('Updating');
// 		$('#select-features-area-spinner').show();
// 		// selectedFeatures.evaluate(function(values){console.log(values)})
// 		// ee.Array(selectedFeatures.toList(10000,0).map(function(f){return ee.Feature(f).area()})).reduce(ee.Reducer.sum(),[0])
// 		ee.Feature(selectedFeatures.union().first()).area(1000)
// 		.evaluate(function(values,error){
// 			if(values === undefined){values = 0;console.log(error)};
//         	$('#selected-features-area').html((values*0.0001).formatNumber() + ' hectares / '+(values*0.000247105).formatNumber() + ' acres');
//         	$('#select-features-area-spinner').hide();
//     	})
// 	}
	
// }
function updateUserDefinedAreaArea(){
	var area = 0;
	Object.values(udpPolygonObj).map(function(poly){
		area += google.maps.geometry.spherical.computeArea(poly.getPath());
	});
	$('#user-defined-features-area').html((area*0.0001).formatNumber()+ ' hectares / '+(area*0.000247105).formatNumber()+ ' acres');
        	
	
}
function turnOffVectorLayers(){
	$(".vector-layer-checkbox").trigger("turnOffAllVectors");
}
function turnOffLayers(){
	$(".layer-checkbox").trigger("turnOffAll");
}

function turnOffSelectLayers(){
	$(".vector-layer-checkbox").trigger("turnOffAllSelectLayers");
}
function turnOnSelectedLayers(){
	$(".vector-layer-checkbox").trigger("turnOnAllSelectedLayers");
}
function turnOffUploadedLayers(){
	$(".vector-layer-checkbox").trigger("turnOffAllUploadedLayers");
}
function turnOnUploadedLayers(){
	$(".vector-layer-checkbox").trigger("turnOnAllUploadedLayers");
}
function turnOffSelectGeoJSON(){
	// Object.keys(selectedFeaturesJSON).map(function(k){
 //        selectedFeaturesJSON[k].geoJSON.forEach(function(f){selectedFeaturesJSON[k].geoJSON.setMap(null)});
 //    })
}
function turnOnSelectGeoJSON(){
	Object.keys(selectedFeaturesJSON).map(function(k){
        selectedFeaturesJSON[k].geoJSON.forEach(function(f){selectedFeaturesJSON[k].geoJSON.setMap(map)});
    })
}
function chartSelectedAreas(){
    
    // Map2.addLayer(selectedFeatures,{layerType :'geeVector'},'Selected Areas');
    // console.log(selectedFeatures);
    // console.log(ee.FeatureCollection(selectedFeatures).getInfo());
    var selectedFeatures  = ee.FeatureCollection(selectionTracker.selectedFeatures).flatten();

    $('#summary-spinner').slideDown();
    selectedFeatures.size().evaluate(function(size,failure){
    	if(failure !== undefined){showMessage('Error',failure)}
    	else if(size !== 0){
    		var title = $('#user-selected-area-name').val();
	    	if(title === ''){title = selectionTracker.selectedNames.join(' - ');}
	    	
	        makeAreaChart(selectedFeatures,title + ' ' + areaChartCollections[whichAreaChartCollection].label + ' Summary',true)
    	}else{
    		showMessage('Error!','Please select area to chart. Turn on any of the layers and click on polygons to select them.  Then hit the <kbd>Chart Selected Areas</kbd> button.');
    		$('#summary-spinner').slideUp();
    	}

    })
    	
    
    
    
}

function clearQueryGeoJSON(){
	queryGeoJSON.forEach(function(f){queryGeoJSON.remove(f)});
}

var  getQueryImages = function(lng,lat){
	var lngLat = [lng, lat];
	$('.gm-ui-hover-effect').show();
	var outDict = {};
	$('#summary-spinner').slideDown();
	// $('#query-container').empty();
	infowindow.setMap(null);
	infowindow.setPosition({lng:lng,lat:lat});
	
	var nameEnd = ' Queried Values for Lng '+lng.toFixed(3) + ' Lat ' + lat.toFixed(3);
	var queryContent =`<div>
							<h6 style = 'font-weight:bold;'>Queried values for<br>lng: ${lng.toFixed(3).toString()} lat: ${lat.toFixed(3).toString()}</h6>
							<li id = 'query-list-container'></li>
							
						</div>`
	 infowindow.setOptions({maxWidth:350});
			
	infowindow.setContent(queryContent);
	infowindow.open(map);
	var idI = 1;
	function makeQueryTable(value,q,k){
		// console.log(value);
		var containerID = k + '-container-'+idI.toString();
		idI++;
		$('#query-list-container').append(`<table class="table table-hover bg-white">
												<tbody>
													<tr class = 'bg-black'><th></th></tr>
												</tbody>
											  </table>`);
		if(value === null || value === undefined){
			$('#query-list-container').append(`<table class="table table-hover bg-white">
												<tbody id = '${containerID}'></tbody>
											  </table>`);
			$('#'+containerID).append(`<tr><th>${q.name}</th><th>NULL</th></tr>`);
		}else if(q.type === 'geeImage'){
			$('#query-list-container').append(`<table class="table table-hover bg-white">
												<tbody id = '${containerID}'></tbody>
											  </table>`);
			if(Object.keys(value).length === 1 ){
				var tValue = JSON.stringify(Object.values(value)[0]);
				if(q.queryDict !== null && q.queryDict !== undefined){
					tValue = q.queryDict[parseInt(tValue)]
				}
				
				$('#'+containerID).append(`<tr><th>${q.name}</th><td>${tValue}</td></tr>`);
				
			}
			else{
				$('#'+containerID).append(`<tr><th>${q.name}</th><th>Multi band</th></tr>`);
				
				Object.keys(value).map(function(kt){
					try{
					var v = value[kt]
					if(v !== null){v = v.toFixed(2).toString();}
					// var queryLine =  kt+ ': '+v + "<br>";
					$('#'+containerID).append(`<tr><td>${kt}</td><td>${v}</td></tr>`);
					}catch(err){
						$('#'+containerID).append(`<tr><td>${kt}</td><td>${JSON.stringify(v)}</td></tr>`);
					}
				});
				
			}	
		}else if(q.type === 'geeImageCollection'){
		
			$('#query-list-container').append(`<ul class = 'bg-black dropdown-divider'></ul>`);
			$('#query-list-container').append(`<ul class = 'm-0 p-0 bg-white' id = '${containerID}'></ul>`);
			infowindow.setOptions({maxWidth:1200});
			infowindow.open(map);
	 		var plotLayout = {
	 			plot_bgcolor:'#D6D1CA',
	 			paper_bgcolor:"#D6D1CA",
	 			font: {
			    family: 'Roboto Condensed, sans-serif'
			  },
				 			// legend: {"orientation": "h"},

	 			margin: {
				    l: 50,
				    r: 10,
				    b: 80,
				    t: 80,
				    pad: 0
				  },
	 			width:600,
	 			height:400,
	 			title: {
    				text:q.name
    			},
    			xaxis: {
    				tickangle:45,
    				tickfont:{size:12},
				    title: {
				      text: value.xLabel
				  }}
	 		};
	 		var buttonOptions = {
				    toImageButtonOptions: {
				        filename: q.name + nameEnd ,
				        width: 1200,
				        height: 800,
				        format: 'png'
				    }
				}
			console.log(value.table)
			Plotly.newPlot(containerID, value.table,plotLayout,buttonOptions);

		}else if(q.type === 'geeVectorImage' || q.type === 'geeVector'){
			$('#query-list-container').append(`<table class="table table-hover bg-white">
												<tbody id = '${containerID}'></tbody>
											  </table>`);
			
				var infoKeys = Object.keys(value);
	            $('#'+containerID).append(`<tr><th>${q.name}</th><th>Attribute Table</th></tr>`);
	            // queryContent += `<tr><th>Attribute Name</th><th>Attribute Value</th></tr>`;
	            
	            infoKeys.map(function(name){
	                var valueT = value[name];
	                $('#'+containerID).append(`<tr><th>${name}</th><td>${valueT}</td></tr>`);
	            });	
			
            
		}
		
		





		if(keyI >= keyCount){
			map.setOptions({draggableCursor:'help'});
			map.setOptions({cursor:'help'});
			$('#summary-spinner').slideUp();
			// queryContent += `<tr class = 'bg-black'><th></th><td></td></tr>`;
			// queryContent +=`</tbody></table>`;
		  // infowindow.setContent(queryContent);
		  // infowindow.open(map);
		}
	
	}
	// queryContent += queryLine;
	// $('#query-container').append(queryLine);
	var keys = Object.keys(queryObj);
	var keysToShow = [];
	keys.map(function(k){
		var q = queryObj[k];
		if(q.visible){keysToShow.push(k);}
	})
	// console.log(keysToShow);
	var keyCount = keysToShow.length;
	var keyI = 0;
	
	if(keyCount === 0){
		$('#summary-spinner').slideUp();
		showMessage('No Layers to Query!','No visible layers to query. Please turn on any layers you would like to query');

	}
	clearQueryGeoJSON();
	keysToShow.map(function(k){
		var q = queryObj[k];
	

		if(q.visible){
			var clickPt = ee.Geometry.Point(lngLat);
			ga('send', 'event', mode, 'pixelQuery-'+q.type, q.name);
			if(q.type === 'geeImage'){
				var img = ee.Image(q.queryItem);
				img.reduceRegion(ee.Reducer.first(),clickPt,30,'EPSG:5070',null,true,1e13,1).evaluate(function(values){
					keyI++;
					
					makeQueryTable(values,q,k);
				})
			}else if(q.type === 'geeImageCollection'){
				var dateFormat = q.queryDateFormat;
				if(dateFormat===null||dateFormat===undefined){dateFormat = 'YYYY-MM-dd'}
				var c = ee.ImageCollection(q.queryItem);
				var plotBounds = clickPt.buffer(plotRadius).bounds();
				function getCollectionValues(values){
					// console.log(values);
					keyI++;
					if(values.length >1){
						var header = values[0];
						values = values.slice(1);
						
						var hasTime = false;
						var timeColumnN = header.indexOf('time');
						var idColumnN = header.indexOf('id');
						

						var ids = arrayColumn(values,idColumnN).filter((v, i, a) => a.indexOf(v) === i);
						var expectedLength = ids.length;
						if(values.length > expectedLength){
							console.log('reducing number of inputs');
							values = values.slice(0,expectedLength);
						}
						
						hasTime =values[0][timeColumnN] !== null;

						var xColumn;
						var xLabel;
						if(hasTime){
							// xColumn = arrayColumn(values,timeColumnN).map(function(d){
							// 	// var date = new Date(d);
							// 	// var day = date.getDate().toString().padStart(2,'0');
							// 	// var month = (date.getMonth()+1).toString().padStart(2,'0');
							// 	// var year = date.getFullYear().toString();
							// 	return d;//year + '-' + month + '-' + day;
							// });
							xColumn = arrayColumn(values,timeColumnN);
							xLabel = 'Time';}
						else{xColumn = arrayColumn(values,idColumnN);xLabel = 'ID'}
						// var yColumns = ee.Image(c.first()).bandNames().getInfo();
						var yColumnNames = 	header.slice(4);
						yColumns = values.map(function(v){return v.slice(4)});
						var tableList = yColumnNames.map(function(c,i){
							return {
							  x: xColumn,
							  y: arrayColumn(yColumns,i),
							  type: 'scatter',
							  name:c
							}
						})
						
						
						
						
						
						makeQueryTable({table:tableList,xLabel:xLabel},q,k);
					}else{console.log('no data');makeQueryTable(null,q,k);}
					
				}
				if(c.first().propertyNames().getInfo().indexOf('system:time_start')>-1){
					c = c.sort('system:time_start').map(function(img){return img.set('system:time_start',img.date().format(dateFormat))});
				};
				
				var getRegionCall = c.getRegion(plotBounds,null,'EPSG:5070',[30,0,-2361915.0,0,-30,3177735.0]);
				getRegionCall.evaluate(function(values,failure){
					// console.log('values');
					console.log(values);
					if(values !== undefined && values !== null){
						getCollectionValues(values);
					}else{
						keyI++;
						makeQueryTable(null,q,k);
					}
					if(failure !== undefined && failure !== null){showMessage('Error',failure)}
				})
				// c.reduceRegion(ee.Reducer.first(),clickPt,null,'EPSG:5070',[30,0,-2361915.0,0,-30,3177735.0]).evaluate(function(value){keyI++;makeQueryTable(value,q,k);})
			}else if(q.type === 'geeVectorImage' || q.type === 'geeVector'){
				try{
					var features = q.queryItem.filterBounds(clickPt);
				}
				catch(err){
					// console.log(err);
					var features = ee.FeatureCollection([q.queryItem]).filterBounds(clickPt);
				}
				features.evaluate(function(values){
					// console.log(values);
					keyI++;
					
		            queryGeoJSON.addGeoJson(values);
           
					var features = values.features; 
					
					if(features.length === 0){
						makeQueryTable(null,q,k)
					}else{
						features.map(function(f){
      						makeQueryTable(f.properties,q,k)
      					})	
					}
      				
            		
        		})
			}
			
			// outDict[k] = value;

		}
	})
	
	
	
	
};
var fsb;
// var fieldName = 'NAME';
// var fsbPath = 'TIGER/2018/Counties';

// var fieldName = 'name';
// var fsbPath = 'USGS/WBD/2017/HUC10';

// var fieldName = 'FORESTNAME';
// var fsbPath = 'projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Boundaries';
function populateChartDropdown(id,collectionDict,whichChartCollectionVar){
	$('#'+id).empty();
	var keys = Object.keys(collectionDict);
	// console.log(keys)
	eval(whichChartCollectionVar+' = keys[0]');
	if(keys.length > 1){
	    Object.keys(collectionDict).map(function(k){
	    	addDropdownItem(id,collectionDict[k].label,k,collectionDict[k].tooltip);

	    });
	    $('#'+id+'-container').show();
	}else{$('#'+id+'-container').hide();}
	  
}
function populateAreaChartDropdown(){
  populateChartDropdown('area-collection-dropdown',areaChartCollections,'whichAreaChartCollection')
}
function populatePixelChartDropdown(){
  populateChartDropdown('pixel-collection-dropdown',pixelChartCollections,'whichPixelChartCollection')
}
// $('#area-collection-dropdown').change(function(){
//   console.log(whichAreaChartCollection);
//   // setupFSB();
// })
// var fieldName = 'PARKNAME';
// var fsbPath = 'projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/NPS_Boundaries';
function setupFSB(){
  $('#forestBoundaries').empty();
  $('#forestBoundaries').hide();
  // $('#summary-spinner').slideDown();
  $('#select-area-spinner').show();
  // $('#select-area-spinner').addClass(`fa-spin fa fa-spinner`);

  // var fsb = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Boundaries');
  // var fieldName = 'FORESTNAME';

  	var nfsFieldName = 'FORESTNAME';
	var nfs = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Boundaries');


	var npsFieldName = 'PARKNAME';
	var nps = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/NPS_Boundaries');

	nfs = nfs.map(function(f){return f.set('label',f.get(nfsFieldName))});


	nps = nps.map(function(f){return f.set('label',ee.String(f.get(npsFieldName)).cat(' National Park'))});

	fsb = nfs.merge(nps);
	fieldName = 'label';
 
	if(areaChartCollections[whichAreaChartCollection] !== undefined){
		fsb = fsb.filterBounds(areaChartCollections[whichAreaChartCollection].collection.geometry());

		  var names = ee.List(ee.Dictionary(fsb.aggregate_histogram(fieldName)).keys());
		  ee.Dictionary.fromLists(names, names).evaluate(function(d){
		  	// print('d');print(d);
		  	 var mySelect = $('#forestBoundaries');
			  var choose;
			  mySelect.append($('<option></option>').val(choose).html('Choose an area'))
			  $.each(d, function(val,text) {
			     
			      mySelect.append($('<option></option>').val(val).html(text)
			      );
			  });
			  // $('#select-area-spinner').removeClass('fa-spin fa fa-spinner');
			  $('#select-area-spinner').hide();
			  $('#forestBoundaries').show();
		  })
	}
  
 	
 
};

var udp;
var udpList = [];
var whichAreaDrawingMethod;

// function startAreaCharting(){
// 	console.log('starting area charting');
// 	// $('#areaChartingTabs').slideDown();
// 	$("#charting-parameters").slideDown();
// 	if(whichAreaDrawingMethod === '#user-defined'){console.log('starting user defined area charting');startUserDefinedAreaCharting();}
//   	else if(whichAreaDrawingMethod === '#shp-defined'){$('#areaUpload').slideDown();startShpDefinedCharting();}
//   	else if(whichAreaDrawingMethod === '#pre-defined'){$('#pre-defined').slideDown();}

// }
function areaChartingTabSelect(target){

	stopAreaCharting();
	stopCharting();
	// $('#charting-container').slideDown();
	// $("#charting-parameters").slideDown();
	
   
	whichAreaDrawingMethod = target;
  	console.log(target);
  	if(target === '#user-defined'){startUserDefinedAreaCharting();}
  	else if(target === '#shp-defined'){startShpDefinedCharting();}
  	else if(target === '#pre-defined'){$('#pre-defined').slideDown();}
  	else if(target === '#user-selected'){
  		map.setOptions({draggableCursor:'pointer'});
 		map.setOptions({cursor:'pointer'});
  	}
  	// startAreaCharting();
}
// function listenForUserDefinedAreaCharting(){
//   $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  	
//   var target = $(e.target).attr("href") // activated tab

//   console.log(target);
//   areaChartingTabSelect(target);
//   });
        
// }
// listenForUserDefinedAreaCharting();
function restartUserDefinedAreaCarting(e){
	// console.log(e);
	if(e === undefined || e.key == 'Delete'|| e.key == 'd'|| e.key == 'Backspace'){
		areaChartingTabSelect(whichAreaDrawingMethod);
		updateUserDefinedAreaArea();
		//startUserDefinedAreaCharting();
	}
	
}
function undoUserDefinedAreaCharting(e){
	// console.log(e);
	if(e === undefined || (e.key == 'z' && e.ctrlKey) ){
		try{
			udpPolygonObj[udpPolygonNumber].getPath().pop(1);
		}catch(err){
			udpPolygonNumber--;
			if(udpPolygonNumber < 1){udpPolygonNumber = 1;showMessage('Error!','No more vertices to undo')}
			udpPolygonObj[udpPolygonNumber].getPath().pop(1);
		}
		updateUserDefinedAreaArea();
        
        // udpList.pop(1);
      }
	
}
function startUserDefinedAreaCharting(){
	console.log('start clicking');
	
	// udpList = [];



	map.setOptions({draggableCursor:'crosshair'});
    map.setOptions({disableDoubleClickZoom: true });
    google.maps.event.clearListeners(mapDiv, 'dblclick');
    google.maps.event.clearListeners(mapDiv, 'click');
    window.addEventListener("keydown", restartUserDefinedAreaCarting);
    window.addEventListener("keydown", undoUserDefinedAreaCharting);
   try{
   	udp.setMap(null);
   }catch(err){};
   udpPolygonObj[udpPolygonNumber]  = new google.maps.Polyline(udpOptions);
   // udp = new google.maps.Polyline(udpOptions);

   udpPolygonObj[udpPolygonNumber].setMap(map);
   google.maps.event.addListener(udpPolygonObj[udpPolygonNumber], "click", updateUserDefinedAreaArea);
   google.maps.event.addListener(udpPolygonObj[udpPolygonNumber], "mouseup", updateUserDefinedAreaArea);
   google.maps.event.addListener(udpPolygonObj[udpPolygonNumber], "dragend", updateUserDefinedAreaArea);
   
   mapHammer = new Hammer(document.getElementById('map'));
   // google.maps.event.addDomListener(mapDiv, 'click', function(event) {
        mapHammer.on("tap", function(event) {
        

        var path = udpPolygonObj[udpPolygonNumber].getPath();
        var x =event.center.x;
        var y = event.center.y;
        clickLngLat =point2LatLng(x,y);
        // udpList.push([clickLngLat.lng(),clickLngLat.lat()])
        path.push(clickLngLat);
        updateUserDefinedAreaArea();
    
    });
   
	mapHammer.on("doubletap", function() {
	// 	$('#summary-spinner').slideDown();
        var path = udpPolygonObj[udpPolygonNumber].getPath();
        udpPolygonObj[udpPolygonNumber].setMap(null);
        udpPolygonObj[udpPolygonNumber] = new google.maps.Polygon(udpOptions);
        udpPolygonObj[udpPolygonNumber].setPath(path);
        udpPolygonObj[udpPolygonNumber].setMap(map);
        google.maps.event.addListener(udpPolygonObj[udpPolygonNumber], "click", updateUserDefinedAreaArea);
   		google.maps.event.addListener(udpPolygonObj[udpPolygonNumber], "mouseup", updateUserDefinedAreaArea);
   		google.maps.event.addListener(udpPolygonObj[udpPolygonNumber], "dragend", updateUserDefinedAreaArea);
        udpPolygonNumber++
        udpPolygonObj[udpPolygonNumber]  = new google.maps.Polyline(udpOptions);
        udpPolygonObj[udpPolygonNumber].setMap(map);
        google.maps.event.addListener(udpPolygonObj[udpPolygonNumber], "click", updateUserDefinedAreaArea);
   		google.maps.event.addListener(udpPolygonObj[udpPolygonNumber], "mouseup", updateUserDefinedAreaArea);
   		google.maps.event.addListener(udpPolygonObj[udpPolygonNumber], "dragend", updateUserDefinedAreaArea);
   
        updateUserDefinedAreaArea();
 //        google.maps.event.clearListeners(mapDiv, 'dblclick');
 //    	google.maps.event.clearListeners(mapDiv, 'click');
 //    	map.setOptions({draggableCursor:'hand'});
 // 		map.setOptions({cursor:'hand'});
 // 		mapHammer.destroy()
 // 		// var geoJson = {'type':'Polygon',
	// 		// 	'geometry':[udpList]};
	// 	try{
	// 		var userArea = ee.FeatureCollection([ee.Feature(ee.Geometry.Polygon(udpList))]);


		
	// 	// $('#areaUpload').slideDown();
	  	
	//   	// $("#charting-parameters").slideDown();
	//   	var udpName = $('#user-defined-area-name').val();
	//   	if(udpName === ''){udpName = 'User Defined Area '+userDefinedI.toString() ;userDefinedI++;};
	//   	var addon = ' '+ areaChartCollections[whichAreaChartCollection].label+ ' Summary';
	//   	udpName +=  addon
	// 	// Map2.addLayer(userArea,{},udpName,false)
	// 	// console.log(userArea.getInfo());
	// 	makeAreaChart(userArea,udpName,true);
	// 	}
	// 	catch(err){areaChartingTabSelect(whichAreaDrawingMethod);showMessage('Error',err);}
		

	});
    // google.maps.event.addDomListener(mapDiv, 'dblclick', function() {
      
    // });

}
function chartUserDefinedArea(){
	try{
		var userArea = [];
		var anythingToChart = false;
		Object.values(udpPolygonObj).map(function(v){
			var coords = v.getPath().getArray();
			var f = [];
			coords.map(function(coord){f.push([coord.lng(),coord.lat()])});
		
			if(f.length > 2){userArea.push(ee.Feature(ee.Geometry.Polygon(f)));anythingToChart = true}
		});
		if(!anythingToChart){
			showMessage('Error!','Please draw polygons on map. Double-click to finish drawing polygon. Once all polygons have been drawn, click the <kbd>Chart Selected Areas</kbd> button to create chart.')
		}
		else{
			userArea = ee.FeatureCollection(userArea);
			var udpName = $('#user-defined-area-name').val();
		  	if(udpName === ''){udpName = 'User Defined Area '+userDefinedI.toString() ;userDefinedI++;};
		  	var addon = ' '+ areaChartCollections[whichAreaChartCollection].label+ ' Summary';
		  	udpName +=  addon
		  	$('#summary-spinner').slideDown();
			makeAreaChart(userArea,udpName,true);	
		}
		
		}
		catch(err){showMessage('Error',err);}
	

}
function chartChosenArea(){
  // $('#charting-container').slideDown();
    // $("#charting-parameters").slideDown();
    $('#summary-spinner').slideDown();
    try{
   	udp.setMap(null);
   }catch(err){};
    map.setOptions({draggableCursor:'progress'});
			map.setOptions({cursor:'progress'});
  // var fsb = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Boundaries');
  // var fieldName = 'FORESTNAME';

 
  var chosenArea = $('#forestBoundaries').val();
  var chosenAreaName = chosenArea + ' '+ areaChartCollections[whichAreaChartCollection].label + ' Summary';
  var chosenAreaGeo = fsb.filter(ee.Filter.eq(fieldName,chosenArea));

  makeAreaChart(chosenAreaGeo,chosenAreaName);
  // console.log('Charting ' + chosenArea);
}

function getAreaSummaryTable(areaChartCollection,area,xAxisProperty,multiplier,dateFormat,crs,transform,scale){
	if(xAxisProperty === null || xAxisProperty === undefined){xAxisProperty = 'year'};
	if(multiplier === null || multiplier === undefined){multiplier = 100};
	if(dateFormat === null || dateFormat === undefined){dateFormat = 'YYYY'};
	if(crs === null || crs === undefined){crs = 'EPSG:5070'};
	// if(transform === null || transform === undefined){transform = null};
	// if((scale === null || scale === undefined) && transform === null){scale = 30}
	// else{scale = null};
	// console.log([scale,transform])
	// var test = ee.Image(areaChartCollection.first());
	// test= test.reduceRegion(ee.Reducer.fixedHistogram(0, 2, 2),area,null,null,null,true,1e13,2);
	// print(test.getInfo());
	if(xAxisProperty === 'year'){
		areaChartCollection = areaChartCollection.map(function(img){return img.set('year',img.date().format(dateFormat))});
		
	}
	
	var bandNames = ee.Image(areaChartCollection.first()).bandNames();
	
	return areaChartCollection.toList(10000,0).map(function(img){
						img = ee.Image(img);
				    // img = ee.Image(img).clip(area);
				    var t = img.reduceRegion(ee.Reducer.fixedHistogram(0, 2, 2),area,scale,crs,transform,true,1e13,4);
				    var xAxisLabel = img.get(xAxisProperty);
				    // t = ee.Dictionary(t).toArray().slice(1,1,2).project([0]);
				    // var lossT = t.slice(0,2,null);
				    // var gainT = t.slice(0,0,2);
				    // var lossSum = lossT.reduce(ee.Reducer.sum(),[0]).get([0]);
				    // var gainSum = gainT.reduce(ee.Reducer.sum(),[0]).get([0]);
				    // var lossPct = ee.Number.parse(lossT.get([1]).divide(lossSum).multiply(100).format('%.2f'));
				    // var gainPct = ee.Number.parse(gainT.get([1]).divide(gainSum).multiply(100).format('%.2f'));
				    // return [year,lossPct,gainPct];//ee.List([lossSum]);
				    t = ee.Dictionary(t);
				    // var values = t.values();
				    // var keys = t.keys();
				    var sum;
				    values = bandNames.map(function(bn){
				      var a = t.get(bn);
				      a = ee.Array(a).slice(1,1,2).project([0]);
				      sum = ee.Number(a.reduce(ee.Reducer.sum(),[0]).get([0]));
				      a = ee.Number(a.toList().get(1));
				      var pct = a.divide(sum).multiply(multiplier);
				      return pct;
				    });
				    values = ee.List([xAxisLabel]).cat(values);
				    return values;
				})
}

function expandChart(){
	console.log('expanding');
	$('#curve_chart_big').slideDown();
	$('#curve_chart_big_modal').modal();
	closeChart();
}
var currentChartID = 0;
function cancelMakeAreaChart(){
	currentChartID++;
	$('#summary-spinner').slideUp();
}
function makeAreaChart(area,name,userDefined){
	currentChartID++;
	var thisChartID = currentChartID;
	areaGeoJson = null;
	console.log('making chart');//console.log(userDefined);
	if(userDefined === undefined || userDefined === null){userDefined = false};
	
	areaChartingCount++;
	// closeChart();
	// document.getElementById('curve_chart_big').style.display = 'none';
	var fColor = randomColor().slice(1,7);
	
	
	// updateProgress(50);
	area = area.set('source','LCMS_data_explorer');
	centerObject(area);
	area = area.geometry();

	var areaChartCollection = areaChartCollections[whichAreaChartCollection].collection;
	var xAxisProperty = areaChartCollections[whichAreaChartCollection].xAxisProperty;
	var xAxisLabel = areaChartCollections[whichAreaChartCollection].xAxisLabel;
	var yAxisLabel = areaChartCollections[whichAreaChartCollection].yAxisLabel;
	var dateFormat = areaChartCollections[whichAreaChartCollection].dateFormat;
	if(xAxisProperty === null || xAxisProperty == undefined){xAxisProperty = 'year'};
	if(xAxisLabel === null || xAxisLabel == undefined){xAxisLabel = null};
	if(yAxisLabel === null || yAxisLabel == undefined){yAxisLabel = '% Area'};
	yAxisLabel = areaChartFormatDict[areaChartFormat].label;
	var totalArea = area.area(1000);
	if(['Acres','Hectares'].indexOf(areaChartFormat)>-1){
		multiplier =totalArea.multiply(areaChartFormatDict[areaChartFormat].mult);
	}
	else{
		multiplier = areaChartFormatDict[areaChartFormat].mult;
	}
	
	var bandNames = ee.Image(areaChartCollection.first()).bandNames().getInfo();
	bandNames = bandNames.map(function(bn){return bn.replaceAll('_',' ') + ' '+areaChartFormatDict[areaChartFormat].label});
	bandNames.unshift(xAxisProperty)
	


	var table = getAreaSummaryTable(areaChartCollection,area,xAxisProperty,multiplier,dateFormat,crs,transform,scale);
	// var bandNames = ee.Image(1).rename(['Year']).addBands(ee.Image(areaChartCollection.first())).bandNames().getInfo().map(function(i){return i.replaceAll('_',' ')});
	var iteration = 0;
	var maxIterations = 60;
	var success = false;
	var maxTime = 10000;
	var startTime = new Date();
	var tableT;
	function evalTable(){
		console.log('Evaluating area chart tables');
		table.evaluate(function(tableT, failure){
			print(iteration);
			print(tableT);
			print(failure);
			print(areaChartingCount);
			var endTime = new Date();
			var dt = endTime-startTime;
			console.log('dt: '+dt.toString())
			if(failure !== undefined && iteration < maxIterations && currentChartID === thisChartID && dt < maxTime){
				// $('#area-charting-message-box').empty();
				// $('#area-charting-message-box').html(failure	);
				evalTable()
			}
			else if(failure === undefined && currentChartID === thisChartID) {
				// tableT.unshift(['year','Loss %','Gain %']);
				tableT.unshift(bandNames)
				$('#summary-spinner').slideUp();
				var stackedAreaChart = areaChartCollections[whichAreaChartCollection].stacked;
				var steppedLine = areaChartCollections[whichAreaChartCollection].steppedLine;
				var colors = areaChartCollections[whichAreaChartCollection].colors;
				var chartType = areaChartCollections[whichAreaChartCollection].chartType
				var fieldsHidden = areaChartCollections[whichAreaChartCollection].fieldsHidden
				if(chartType === null || chartType === undefined){chartType = 'line'}
				ga('send', 'event', mode, 'areaChart', whichAreaChartCollection);
				addChartJS(tableT,name,chartType,stackedAreaChart,steppedLine,colors,xAxisLabel,yAxisLabel,fieldsHidden);
		
				// areaChartingTabSelect(whichAreaDrawingMethod);
				// map.setOptions({draggableCursor:'hand'});
				// map.setOptions({cursor:'hand'});
				// if(whichAreaDrawingMethod === '#user-defined'){
					area.evaluate(function(i,failure){
						areaGeoJson = i;
						areaGeoJson[name] = tableT;
						if(failure === undefined && areaGeoJson !== undefined && areaGeoJson !== null){
					    	$('#chart-download-dropdown').append(`<a class="dropdown-item" href="#" onclick = "exportJSON('${name}.geojson', areaGeoJson)">geoJSON</a>`);
					   }else{
					   	showMessage('Error','Could not convert summary area to geoJSON '+failure)
					   }
					});
				// }
				areaChartingCount--;
			}
			else if(failure !== undefined){
				$('#summary-spinner').slideUp();
				// map.setOptions({draggableCursor:'hand'});
				// map.setOptions({cursor:'hand'});
				
				// areaChartingTabSelect(whichAreaDrawingMethod);
				if(failure.indexOf('Dictionary.toArray: Unable to convert dictionary to array')>-1 || failure.indexOf("Array: Parameter 'values' is required.")> -1){
					failure = 'Most likely selected area does not overlap with selected LCMS study area<br>Please select area that overlaps with products<br>Raw Error Message:<br>'+failure;
				}
				showMessage('<i class="text-dark text-uppercase fa fa-exclamation-triangle"></i> Error! Try again',failure)};
			iteration ++;
		

		
			
	});
		
	}
	evalTable();
	
	


	
}
function fixGeoJSONZ(f){
	console.log('getting rid of z');
	f.features = f.features.map(function(f){
		if(f.geometry.type.indexOf('Multi') === -1){
			f.geometry.coordinates = f.geometry.coordinates.map(function(c){
	    															return c.map(function(i){
	    																return i.slice(0,2)})
																			});
		}else{
			f.geometry.coordinates = f.geometry.coordinates.map(function(c1){
	    															return c1.map(function(c2){
	    																return c2.map(function(i){
	    																	return i.slice(0,2)})
																				});
	    															});
		}
    
    return f;
  });
	console.log(f);

	return f
}
function runShpDefinedCharting(){
		clearUploadedAreas();
		if(jQuery('#areaUpload')[0].files.length > 0){
			try{udp.setMap(null);}
			catch(err){console.log(err)};
		
			$('#summary-spinner').slideDown();

			var name = jQuery('#areaUpload')[0].files[0].name.split('.')[0] 
			var addon = ' '+ areaChartCollections[whichAreaChartCollection].label + ' Summary';
			if(name.indexOf(addon) === -1){
				name += addon;
			}
			map.setOptions({draggableCursor:'progress'});
			map.setOptions({cursor:'progress'});
			
			convertToGeoJSON('areaUpload').done(function(convertedRaw){
				console.log('successfully converted to JSON');
				console.log(convertedRaw);
				console.log('compressing geoJSON')
				var converted = compressGeoJSON(convertedRaw,uploadReductionFactor);
				console.log(converted);
			//First try assuming the geoJSON has spatial info
			try{
				var area =ee.FeatureCollection(converted.features.map(function(t){return ee.Feature(t).dissolve(100,ee.Projection('EPSG:4326'))}));
				console.log('N features to summarize ');
				var nFeatures = area.size().getInfo()
				console.log(nFeatures);
				if(nFeatures == 0){
					showMessage('No Features Found','Found '+nFeatures.toString() + ' in provided file. Please select a file with features.');
					$('#summary-spinner').hide();
					return
				}
				} 
			//Fix it if not
			catch(err){
				err = err.toString();
				console.log('Error');console.log(err);
				if(err.indexOf('Error: Invalid GeoJSON geometry:') > -1){
					try{
						var area =ee.FeatureCollection(fixGeoJSONZ(converted).features.map(function(t){return ee.Feature(t).dissolve(100,ee.Projection('EPSG:4326'))}))	
						console.log('N features to summarize ');
						console.log(area.size().getInfo());
						}
					catch(err){
						err = err.toString();
						console.log(err)
						if(err.indexOf('413')>-1){
							showMessage('<i class="text-dark text-uppercase fa fa-exclamation-triangle"></i> Error Ingesting Study Area!','Provided vector has too many vertices.<br>Try increasing the "Vertex Reduction Factor" slider by one and then rerunning.')
						}else{
							showMessage('<i class="text-dark text-uppercase fa fa-exclamation-triangle"></i> Error Ingesting Study Area!',err)
						}
						$('#summary-spinner').hide();
						return;
						
					};
					}
				else{
					
					if(err.indexOf('413')>-1){
							showMessage('<i class="text-dark text-uppercase fa fa-exclamation-triangle"></i> Error Ingesting Study Area!','Provided vector has too many vertices.<br>Try increasing the "Vertex Reduction Factor" slider by one and then rerunning.')
						}else{
							showMessage('<i class="text-dark text-uppercase fa fa-exclamation-triangle"></i> Error Ingesting Study Area!',err)
						}
					$('#summary-spinner').hide();
					return;
					}
				};
				// var area  =ee.FeatureCollection(converted.features.map(function(t){return ee.Feature(t).dissolve(100,ee.Projection('EPSG:4326'))}));//.geometry()//.dissolve(1000,ee.Projection('EPSG:4326'));
				
				Map2.addLayer(area,{isUploadedLayer:true},name,true,null,null,name + ' for area summarizing','area-charting-shp-layer-list');
	
				makeAreaChart(area,name);
			})
		
	}else{showMessage('No Summary Area Selected','Please select a .zip shapefile or a .geojson file to summarize across')}
}
function startShpDefinedCharting(){
	// clearUploadedAreas();
	turnOnUploadedLayers();
	if(selectionTracker.uploadedLayerIndices === undefined || selectionTracker.uploadedLayerIndices === null){
		selectionTracker.uploadedLayerIndices = [];
	}
	
	// $('#areaUpload').change(function(){runShpDefinedCharting()})
};
function stopAreaCharting(){
	window.removeEventListener("keydown", restartUserDefinedAreaCarting);
    window.removeEventListener("keydown", undoUserDefinedAreaCharting);
	console.log('stopping area charting');
	try{
   	Object.keys(udpPolygonObj).map(function(k){
        udpPolygonObj[k].setMap(null) ;       
    });
    udpPolygonObj = {};
    udpPolygonNumber = 1;
    updateUserDefinedAreaArea();
   }catch(err){};
 //   $('#areaChartingTabs').slideUp();
	$('#areaUpload').unbind('change')
	// $("#charting-parameters").slideUp();
	// $('#user-defined').slideUp();
	// $('#shp-defined').slideUp();
	// $('#pre-defined').slideUp();
	$('#summary-spinner').slideUp();
	// // $('#areaUpload').slideUp();
	// google.maps.event.clearListeners(mapDiv, 'dblclick');
 //    google.maps.event.clearListeners(mapDiv, 'click');
	// updateProgress(1);
	// closeChart();

};

function startQuery(){
	areaGeoJson = null;
	try{udp.setMap(null);}catch(err){console.log(err)};

	google.maps.event.clearListeners(mapDiv, 'dblclick');
    google.maps.event.clearListeners(mapDiv, 'click');
	map.setOptions({draggableCursor:'help'});
 	map.setOptions({cursor:'help'});
 	mapHammer = new Hammer(document.getElementById('map'));
   	mapHammer.on("doubletap", function(e) {
	// google.maps.event.addDomListener(mapDiv,"dblclick", function (e) {
			$('#summary-spinner').slideDown()
			map.setOptions({draggableCursor:'progress'});
			map.setOptions({cursor:'progress'});
			
			print('Map was double clicked');
			var x =e.center.x;//clientX;
        	var y = e.center.y;//console.log(x);
        	center =point2LatLng(x,y);

			

			var pt = ee.Geometry.Point([center.lng(),center.lat()]);
			var plotBounds = pt.buffer(plotRadius).bounds();
	   		addClickMarker(plotBounds)
	   		
			marker.setMap(map);

			getQueryImages(center.lng(),center.lat());

		})
   		// mapHammer.on("tap",function(e){
   		// // 	infowindow.setMap(null);
   		// 	clearQueryGeoJSON();
   		// })
   		// map.addListener("click", function(){infowindow.setMap(null);clearQueryGeoJSON();});
	// document.getElementById('query-container').style.display = 'block';
}
function stopQuery(){
	print('stopping');
	try{
		mapHammer.destroy();
		map.setOptions({draggableCursor:'hand'});
		map.setOptions({cursor:'hand'});
		// $('#query-container').text('Double click on map to query values of displayed layers at a location');
		google.maps.event.clearListeners(mapDiv, 'dblclick');
		// google.maps.event.clearInstanceListeners(map);
		map.setOptions({cursor:'hand'});
		infowindow.setMap(null);
		marker.setMap(null);
	}catch(err){};
	
	// document.getElementById('query-container').style.display = 'none';
}
function getImageCollectionValuesForCharting(pt){
	
	// var timeSeries = years.map(function(yr){
	// 	var imageT = l5s.filterDate(ee.Date.fromYMD(yr,1,1),ee.Date.fromYMD(yr,12,31)).median().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
	// 	return imageT
	// })
	// timeSeries = ee.ImageCollection.fromImages(timeSeries);
	var icT = ee.ImageCollection(chartCollection.filterBounds(pt));
	var tryCount = 2;
	// print(icT.getRegion(pt.buffer(plotRadius),plotScale))
	try{var allValues = icT.getRegion(pt,null,'EPSG:5070',[30,0,-2361915.0,0,-30,3177735.0]).evaluate();
		print(allValues)
		return allValues}
	catch(err){showMessage('<i class="text-dark text-uppercase fa fa-exclamation-triangle"></i> Charting error',err.message)};//reRun();setTimeout(function(){icT.getRegion(pt.buffer(plotRadius),plotScale).getInfo();},5000)}
	

}
Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(), !mm[1] && '0', mm, !dd[1] && '0', dd].join(''); // padding
};
function getDataTable(pt){
	// var chartScale = plotScale;
	// var chartPtSize = plotRadius;
	// addToMap(pt.buffer(chartPtSize));

	
	var values = getImageCollectionValuesForCharting(pt);
	globalChartValues	 = values;
	// var values = imageCollectionForCharting.getRegion(pt.buffer(chartPtSize),chartScale).getInfo();
	
	if(chartIncludeDate){var startColumn = 3}else{var startColumn = 4};
	var header = values[0].slice(startColumn);

	values = values.slice(1).map(function(v){return v.slice(startColumn)}).sort(sortFunction);




	print(values)
	if(chartIncludeDate){
	values = values.map(function(v){
			  var d = [new Date(v[0])];
			  v.slice(1).map(function(vt){d.push(vt)})
			  return d})
	}

	var forChart = [header];
	values.map(function(v){forChart.push(v)});
	
	return forChart
}

// function changeChartType(newType,showExpanded){
// 	if(!showExpanded){showExpanded = false};
// 	newType.checked = true;
// 	$(newType).checked = true;
// 	chartType = newType.value;
// 	uriName = mode+'_Product_Time_Series_for_lng_' +center.lng().toFixed(4).toString() + '_' + center.lat().toFixed(4).toString(); //+ ' Res: ' +plotScale.toString() + '(m) Radius: ' + plotRadius	.toString() + '(m)';
// 	csvName = uriName + '.csv'
// 	document.getElementById('curve_chart').style.display = 'none';
// 	// setTimeout(function(){updateProgress(80);},0);
// 	Chart(showExpanded);
// }

//////////////////////////////////////////////////////////////////
//ChartJS code
function downloadChartJS(chart,name){
	var link = document.createElement("a");
	link.download = name;
	link.href = chart.toBase64Image();
	link.click();
	delete link;
	ga('send', 'event', mode, getActiveTools()[0] +'-chartDownload', 'png');
}
Chart.pluginService.register({
    beforeDraw: function (chart, easing) {
        if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
            var helpers = Chart.helpers;
            var ctx = chart.chart.ctx;
            var chartArea = chart.chartArea;

            ctx.save();
            ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
            ctx.fillRect(chartArea.left-90, chartArea.top-40, chartArea.right - chartArea.left+190, chartArea.bottom - chartArea.top+350);
            ctx.restore();
        }
    }
});
var dataToTable = function (dataset) {
    var html = '<table>';
    html += '<thead><tr><th style="width:120px;">#</th>';
    
    var columnCount = 0;
    jQuery.each(dataset.datasets, function (idx, item) {
        html += '<th style="background-color:' + item.fillColor + ';">' + item.label + '</th>';
        columnCount += 1;
    });

    html += '</tr></thead>';

    jQuery.each(dataset.labels, function (idx, item) {
        html += '<tr><td>' + item + '</td>';
        for (i = 0; i < columnCount; i++) {
            html += '<td style="background-color:' + dataset.datasets[i].fillColor + ';">' + (dataset.datasets[i].data[idx] === '0' ? '-' : dataset.datasets[i].data[idx]) + '</td>';
        }
        html += '</tr>';
    });

    html += '</tr><tbody></table>';

    return html;
};
var chartJSChart;
var chartType;
if(localStorage.tableOrChart === undefined || localStorage.tableOrChart === null){
	// if(mode === 'MTBS'){localStorage.tableOrChart = 'table'}
	// else{
		localStorage.tableOrChart = 'chart'
	// };
	
}

addModal('main-container','chart-modal');//addModalTitle('chart-modal','test');$('#chart-modal-body').append('hello');$('#chart-modal').modal();
function addChartJS(dt,title,chartType,stacked,steppedLine,colors,xAxisLabel,yAxisLabel,fieldsHidden){
	var displayXAxis = true;var displayYAxis = true;
	if(fieldsHidden === null || fieldsHidden === undefined){fieldsHidden = null};
	if(xAxisLabel === null || xAxisLabel === undefined){xAxisLabel = '';displayXAxis = false};
	if(yAxisLabel === null || yAxisLabel === undefined){yAxisLabel = '';displayYAxis = false};
	if(colors === null || colors === undefined){colors = chartColors};
	if(chartType === null || chartType === undefined){chartType = 'line'};
	if(stacked === null || stacked === undefined){stacked = false};
	if(steppedLine === undefined || steppedLine == null){steppedLine = false};

	console.log('starting convert to table')
	dataTable = dataTableNumbersToNames(dt);
	console.log('finished convert to table')
	var h = $(document).height();
	var w = $(document).width();
	if(h/w > 1){
		canvasHeight = '90%';
		canvasWidth = '100%';
	}
	else{
		canvasHeight = '50%';
		canvasWidth = '100%';
	}
	
	// console.log(dt);
	// $('#'+modalID).html('');
	clearModal('chart-modal');
	// if(title !== null && title !== undefined){addModalTitle('chart-modal',title)}
	
	$('#chart-modal-body').append(`<div id = 'chart-modal-graph-table-container' class = 'flexcroll chart-table-graph-container'></div>`);
    $('#chart-modal-graph-table-container').append(`<div id = 'chart-modal-graph-container' class = 'pb-2'>
    													<canvas id="chart-canvas" width="${canvasWidth}" height = "${canvasHeight}" ></canvas>
    												</div>`);
    $('#chart-modal-graph-table-container').append(`<div id="chart-table" style = 'display:none;' width="${canvasWidth}" height = "${canvasHeight}" ></div>`);
    var data = dt.slice(1);
    // console.log(data);
    var firstColumn = arrayColumn(data,0);
    // console.log(firstColumn)
    var columnN = dt[1].length;
    var columns = range(1,columnN);
    console.log('starting to convert to chart')
    var datasets = columns.map(function(i){
    	var fieldHidden = false;
    	if(fieldsHidden !== null){
    		fieldHidden = fieldsHidden[i-1]
    	}
        var col = arrayColumn(dt,i);
        var label = col[0];
        var data = col.slice(1);
        // console.log(data)
        data = data.map(function(i){
        			var out;
        			try{out = i.toFixed(6)}
        			catch(err){out = i;}
        			
        			return out
        			})
        // console.log(data)
        
        
        // var color = randomRGBColor();
        var color = colors[(i-1)%colors.length];
        if(color.indexOf('#') === -1){color = '#'+color};
        var out = {'label':label,
			        pointStyle: 'circle',
			        pointRadius:1,
			        'data':data,
			        'fill':false,
			        'borderColor':color,
			        'lineTension':0,
			        'borderWidth':2,
			        'steppedLine':steppedLine,
			        'showLine':true,
			        'spanGaps':true,
			        'hidden': fieldHidden
			    	};
		if(stacked){
			out['fill'] = true;
			out['backgroundColor'] = color
		}
        return out
        // console.log(label);console.log(data)
    });
    console.log('finished to convert to chart')
    chartColorI = 0;
    // console.log(datasets)
    try{
    	chartJSChart.destroy();	
    }
    catch(err){};
    chartJSChart = new Chart($('#chart-canvas'),{
    	"type":chartType,
	    "data":{"labels":firstColumn,
	    "datasets":datasets},
	    "options":{
	    	 title: {
	            display: true,
	            position:'top',
	            text: title.replaceAll('_',' '),
	            // fontColor: '#000',
	            fontSize: 16
	        },
	        legend:{
	        	display:true,
	        	position:'bottom',
	        	
	        	labels : {
	        		boxWidth:5,
	        		usePointStyle: true,
            
        		}
	        },
	        chartArea: {
		        backgroundColor: '#DDD'
		    },
		    scales: {
				yAxes: [{ stacked: stacked ,scaleLabel:{display:displayYAxis,labelString:yAxisLabel}}],
				xAxes: [{ stacked: stacked ,scaleLabel:{display:displayXAxis,labelString:xAxisLabel},maxBarThickness: 100}]
			}
    	}	
	});

	
	    $('#chart-download-dropdown').empty();
	    $('#chart-modal-footer').append(`<div class="dropdown">
										  <div class=" dropdown-toggle"  id="chartDownloadDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
										    Download
										  </div>
										  <div id = 'chart-download-dropdown' class="dropdown-menu px-2" aria-labelledby="chartDownloadDropdown">
										    <a class="dropdown-item" href="#" onclick = "downloadChartJS(chartJSChart,'${title}.png')">PNG</a>
										    <a class="dropdown-item" href="#" onclick = "exportToCsv('${title}.csv', dataTable)">CSV</a>
										  </div>
										</div>
										
										</div>
										<div class="dropdown">
										  <div class=" dropdown-toggle"  id="chartTypeDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
										    Chart Type
										  </div>
										  <div id = 'chart-type-dropdown' class="dropdown-menu px-2" aria-labelledby="chartTypeDropdown">
										    <a class="dropdown-item" href="#" onclick = "toggleChartTable('chart');change('line',false,${steppedLine});">Line</a>
										    <a class="dropdown-item" href="#" onclick = "toggleChartTable('chart');change('line',true,${steppedLine});">Stacked Line</a>
										    <a class="dropdown-item" href="#" onclick = "toggleChartTable('chart');change('bar',false,${steppedLine});">Bar</a>
										    <a class="dropdown-item" href="#" onclick = "toggleChartTable('chart');change('bar',true,${steppedLine});">Stacked Bar</a>
										    <a class="dropdown-item" href="#" onclick = "toggleChartTable('table')">Table</a>
										  </div>
										</div>
										`);
	   	
	    var chartTableHTML = htmlTable(dataTable);
	    $('#chart-table').append(chartTableHTML);
	    toggleChartTable(localStorage.tableOrChart)
	    $('#chart-modal').modal();
}


function toggleChartTable(showWhich){
	if(showWhich === 'table'){
		$('#chart-modal-graph-container').hide();
		$('#chart-table').show();
		localStorage.tableOrChart = 'table';
	}else if(showWhich === 'chart'){
		$('#chart-modal-graph-container').show();
		$('#chart-table').hide();
		localStorage.tableOrChart = 'chart';
	}
	else{
		$('#chart-modal-graph-container').show();
		$('#chart-table').show();
		localStorage.tableOrChart = 'both';
	}
}
function change(newType,stacked,steppedLine) {
	if(stacked === undefined || stacked == null){stacked = false};
	if(steppedLine === undefined || steppedLine == null){steppedLine = false};
	

		var config = chartJSChart.config;
		chartJSChart.destroy();
		config.type = newType;

		var currentScales = config.options.scales;
		currentScales.xAxes[0].stacked = stacked;
		currentScales.yAxes[0].stacked = stacked;
		config.options.scales = currentScales;
		if(stacked){
			// config.options.scales = {
			// 	yAxes: [{ stacked: stacked }],//,ticks:{min:0,max:100}}],
			// 	xAxes: [{ stacked: stacked }]
			// }

			var datasets = config.data.datasets;
			// console.log(datasets);
			datasets = datasets.map(function(dataset){
				dataset['fill'] = true;
				dataset['backgroundColor'] = dataset['borderColor'];
				dataset['steppedLine'] = steppedLine;
				return dataset;
			})
			config.data.datasets = datasets;
		}else{
			// config.options.scales = {
			// 	yAxes: [{ stacked: stacked }],
			// 	xAxes: [{ stacked: stacked }]
			// }
			var datasets = config.data.datasets;
			// console.log(datasets);
			datasets = datasets.map(function(dataset){
				dataset['fill'] = false;
				dataset['steppedLine'] = false;
				// dataset['backgroundColor'] = null;
				return dataset;
			})
			config.data.datasets = datasets;
		};
		
		
		chartJSChart = new Chart($('#chart-canvas'), config);
	
};
var chartTableDict;
var testTable = JSON.parse('[["id","longitude","latitude","time","Raw NDVI","LANDTRENDR Fitted NDVI","Land Cover Class","Land Use Class","Loss Probability","Gain Probability"],["Landsat_Fmask_allL7_SR_medoid_1984_1986_190_250_1_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1985",-109.74183328494144,42.94571387213776,486432000000,0.6041558441558442,0.61475,0.699999988079071,0.30000001192092896,0,0],["Landsat_Fmask_allL7_SR_medoid_1985_1987_190_250_2_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1986",-109.74183328494144,42.94571387213776,517968000000,0.6490280777537797,0.6148,0.699999988079071,0.30000001192092896,0,0],["Landsat_Fmask_allL7_SR_medoid_1986_1988_190_250_3_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1987",-109.74183328494144,42.94571387213776,549504000000,0.6315240083507307,0.61485,0.699999988079071,0.30000001192092896,0,0],["Landsat_Fmask_allL7_SR_medoid_1987_1989_190_250_4_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1988",-109.74183328494144,42.94571387213776,581126400000,0.6315240083507307,0.6149,0.699999988079071,0.30000001192092896,0,0],["Landsat_Fmask_allL7_SR_medoid_1988_1990_190_250_5_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1989",-109.74183328494144,42.94571387213776,612662400000,0.6353887399463807,0.61495,0.699999988079071,0.30000001192092896,0,0],["Landsat_Fmask_allL7_SR_medoid_1989_1991_190_250_6_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1990",-109.74183328494144,42.94571387213776,644198400000,0.6176795580110498,0.615,0.699999988079071,0.30000001192092896,0,0],["Landsat_Fmask_allL7_SR_medoid_1990_1992_190_250_7_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1991",-109.74183328494144,42.94571387213776,675734400000,0.5684689236988377,0.61505,0.699999988079071,0.30000001192092896,0,0],["Landsat_Fmask_allL7_SR_medoid_1991_1993_190_250_8_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1992",-109.74183328494144,42.94571387213776,707356800000,0.5684689236988377,0.6151,0.699999988079071,0.30000001192092896,0.019999999552965164,0],["Landsat_Fmask_allL7_SR_medoid_1992_1994_190_250_9_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1993",-109.74183328494144,42.94571387213776,738892800000,0.6082029141932002,0.61515,0.699999988079071,0.30000001192092896,0.019999999552965164,0],["Landsat_Fmask_allL7_SR_medoid_1993_1995_190_250_10_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1994",-109.74183328494144,42.94571387213776,770428800000,0.5819209039548022,0.6152000000000001,0.699999988079071,0.30000001192092896,0.05000000074505806,0],["Landsat_Fmask_allL7_SR_medoid_1994_1996_190_250_11_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1995",-109.74183328494144,42.94571387213776,801964800000,0.6067796610169491,0.6152500000000001,0.699999988079071,0.30000001192092896,0.05000000074505806,0],["Landsat_Fmask_allL7_SR_medoid_1995_1997_190_250_12_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1996",-109.74183328494144,42.94571387213776,833587200000,0.6067796610169491,0.6153000000000001,0.699999988079071,0.30000001192092896,0.019999999552965164,0],["Landsat_Fmask_allL7_SR_medoid_1996_1998_190_250_13_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1997",-109.74183328494144,42.94571387213776,865123200000,0.6450617283950617,0.6153500000000001,0.699999988079071,0.30000001192092896,0.03999999910593033,0.009999999776482582],["Landsat_Fmask_allL7_SR_medoid_1997_1999_190_250_14_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1998",-109.74183328494144,42.94571387213776,896659200000,0.6450617283950617,0.6154000000000001,0.699999988079071,0.30000001192092896,0.019999999552965164,0],["Landsat_Fmask_allL7_SR_medoid_1998_2000_190_250_15_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-1999",-109.74183328494144,42.94571387213776,928195200000,0.6054347826086957,0.61545,0.699999988079071,0.30000001192092896,0.07999999821186066,0],["Landsat_Fmask_allL7_SR_medoid_1999_2001_190_250_16_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2000",-109.74183328494144,42.94571387213776,959817600000,0.6196961760083813,0.6155,0.699999988079071,0.30000001192092896,0.10999999940395355,0],["Landsat_Fmask_allL7_SR_medoid_2000_2002_190_250_17_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2001",-109.74183328494144,42.94571387213776,991353600000,0.625,0.61555,0.699999988079071,0.30000001192092896,0.20999999344348907,0],["Landsat_Fmask_allL7_SR_medoid_2001_2003_190_250_18_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2002",-109.74183328494144,42.94571387213776,1022889600000,0.625,0.6156,0.699999988079071,0.30000001192092896,0.3700000047683716,0],["Landsat_Fmask_allL7_SR_medoid_2002_2004_190_250_19_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2003",-109.74183328494144,42.94571387213776,1054425600000,0.5976331360946746,0.61565,0.699999988079071,0.30000001192092896,0.30000001192092896,0],["Landsat_Fmask_allL7_SR_medoid_2003_2005_190_250_20_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2004",-109.74183328494144,42.94571387213776,1086048000000,0.6184004181913225,0.6157,0.699999988079071,0.30000001192092896,0.23999999463558197,0],["Landsat_Fmask_allL7_SR_medoid_2004_2006_190_250_21_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2005",-109.74183328494144,42.94571387213776,1117584000000,0.6023643202579259,0.6050375,0.699999988079071,0.30000001192092896,0.3799999952316284,0],["Landsat_Fmask_allL7_SR_medoid_2005_2007_190_250_22_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2006",-109.74183328494144,42.94571387213776,1149120000000,0.5668202764976958,0.594375,0.699999988079071,0.30000001192092896,0.3100000023841858,0],["Landsat_Fmask_allL7_SR_medoid_2006_2008_190_250_23_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2007",-109.74183328494144,42.94571387213776,1180656000000,0.5428024868483978,0.5837125000000001,0.699999988079071,0.30000001192092896,0.7099999785423279,0],["Landsat_Fmask_allL7_SR_medoid_2007_2009_190_250_24_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2008",-109.74183328494144,42.94571387213776,1212278400000,0.6413103831204887,0.5730500000000001,0.699999988079071,0.30000001192092896,0.5099999904632568,0],["Landsat_Fmask_allL7_SR_medoid_2008_2010_190_250_25_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2009",-109.74183328494144,42.94571387213776,1243814400000,0.5547407019381875,0.5623875,0.699999988079071,0.30000001192092896,0.8799999952316284,0],["Landsat_Fmask_allL7_SR_medoid_2009_2011_190_250_26_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2010",-109.74183328494144,42.94571387213776,1275350400000,0.5532495903877663,0.551725,0.699999988079071,0.30000001192092896,0.550000011920929,0],["Landsat_Fmask_allL7_SR_medoid_2010_2012_190_250_27_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2011",-109.74183328494144,42.94571387213776,1306886400000,0.5532495903877663,0.5410625,0.699999988079071,0.30000001192092896,0.5199999809265137,0],["Landsat_Fmask_allL7_SR_medoid_2011_2013_190_250_28_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2012",-109.74183328494144,42.94571387213776,1338508800000,0.5121196493037647,0.5304,0.699999988079071,0.30000001192092896,0.7799999713897705,0.019999999552965164],["Landsat_Fmask_allL7_SR_medoid_2012_2014_190_250_29_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2013",-109.74183328494144,42.94571387213776,1370044800000,0.5759870200108166,0.5492714285714286,0.699999988079071,0.30000001192092896,0.10999999940395355,0.15000000596046448],["Landsat_Fmask_allL7_SR_medoid_2013_2015_190_250_30_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2014",-109.74183328494144,42.94571387213776,1401580800000,0.5555555555555556,0.5681428571428572,0.699999988079071,0.30000001192092896,0.17000000178813934,0.09000000357627869],["Landsat_Fmask_allL7_SR_medoid_2014_2016_190_250_31_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2015",-109.74183328494144,42.94571387213776,1433116800000,0.6195835678109173,0.5870142857142857,0.699999988079071,0.30000001192092896,0.07999999821186066,0.029999999329447746],["Landsat_Fmask_allL7_SR_medoid_2015_2017_190_250_32_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2016",-109.74183328494144,42.94571387213776,1464739200000,0.6360619469026548,0.6058857142857144,0.699999988079071,0.30000001192092896,0.14000000059604645,0.14000000059604645],["Landsat_Fmask_allL7_SR_medoid_2016_2018_190_250_33_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2017",-109.74183328494144,42.94571387213776,1496275200000,0.6152263374485596,0.6247571428571429,0.699999988079071,0.30000001192092896,0.05000000074505806,0.11999999731779099],["Landsat_Fmask_allL7_SR_medoid_2017_2019_190_250_34_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2018",-109.74183328494144,42.94571387213776,1527811200000,0.656484727090636,0.6436285714285715,0.699999988079071,0.30000001192092896,0.17000000178813934,0.1899999976158142],["Landsat_Fmask_allL7_SR_medoid_2018_2020_190_250_35_BT-LC-LU-DND-RNR-DNDSlow-DNDFast-2019",-109.74183328494144,42.94571387213776,1559347200000,0.6271186440677967,0.6625,0.699999988079071,0.30000001192092896,0.1599999964237213,0.3199999928474426]]')
function dataTableNumbersToNames(dataTable){
	// try{chartTableDict = chartCollection.get('chartTableDict').getInfo();}
	// catch(err){chartTableDict = null};
	if(pixelChartCollections[whichPixelChartCollection].chartTableDict !== null && pixelChartCollections[whichPixelChartCollection].chartTableDict !== undefined){
		chartTableDict = pixelChartCollections[whichPixelChartCollection].chartTableDict;
	}else{chartTableDict = null;}
	
	
	// console.log(chartTableDict)
	var header = dataTable[0];//.map(function(i){return i.toProperCase()});
	header[0] = header[0].toProperCase();
	var outTable = [header];
	dataTable.slice(1).map(function(r){
		var row = [];
		jQuery.each(r,function(i,value){
			
			var label = header[i];
			
			var tableValue;
			// console.log(chartTableDict[label]);console.log(value);
        	if(chartTableDict !== null && chartTableDict[label] !== null && chartTableDict[label] !== undefined && value !== undefined){
        		var keys = Object.keys(chartTableDict[label]);
        		var whichKey  = keys.filter(function(k){return Math.abs(k-value)< 0.0001});
        		// console.log(whichKey)
        		tableValue = chartTableDict[label][whichKey];
        		if(tableValue === null || tableValue === undefined){
        			try{value = value.formatNumber()}
					catch(err){};
					tableValue =value ;
        		}
        		// console.log(tableValue)
        		// console.log(keys);console.log(parseFloat(value).toString());
        		// console.log(keys.indexOf(parseFloat(value)));
        		// console.log(keys.indexOf(parseInt(value)))
        	// } && (chartTableDict[label][parseInt(value)] !== undefined || chartTableDict[label][parseFloat(value)] !== undefined)){
        		// console.log('yay');
        		// console.log(chartTableDict[label]);
        		// tableValue = chartTableDict[label][parseInt(value)];
        		// if(tableValue === undefined){
        		// 	tableValue = chartTableDict[label][parseFloat(value)];
        		// }
			}else{
				try{value = value.toFixed(6)}
				catch(err){};
				tableValue =value ;
			};
			if(tableValue === null){tableValue = ''}
			row.push(tableValue);
		});
		outTable.push(row);

	})
	return outTable;

}
function htmlTable(table){
	var html = '<div class = "flexcroll chart-table text-black"><table class="table  table-hover">';
    html += '<thead><tr>';
    var header = dataTable[0];
 

   header.map(function(label){
   		html += '<th  class = "chart-table-first-row bg-black">' + label + '</th>';
      
   });
   html += '</tr></thead>';

    table.slice(1).map(function(r){
		html += '<tr>';
		var columnI = 0;
		r.map(function(value){
			html += '<td>' +  value + '</td>';
			columnI++;
		})	
		html += '</tr>';	
	});
	html += '</tr><tbody></table></div>';
   return html
}


var d =
[["time", "NDVI", "NDVI_LT_fitted", "Land Cover Class", "Land Use Class", "Loss Probability", "Gain Probability"]
,["1985", 0.6456953642384106, null, 0.6000000238418579, 0.30000001192092896, 0.019999999552965164, 0]
,["1986", 0.6456953642384106, 0.6573789473684211, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["1987", 0.6456953642384106, 0.6598578947368421, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["1988", 0.6934156378600823, 0.6623368421052632, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["1989", 0.6934156378600823, 0.6648157894736842, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["1990", 0.6934156378600823, 0.6672947368421053, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["1991", null, 0.6697736842105264, null, null, null, null]
,["1992", null, 0.6722526315789473, null, null, null, null]
,["1993", null, 0.6747315789473685, null, null, null, null]
,["1994", 0.6439862542955326, 0.6772105263157895, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["1995", 0.6439862542955326, 0.6796894736842105, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["1996", 0.6439862542955326, 0.6821684210526316, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["1997", null, 0.6846473684210527, null, null, null, null]
,["1998", 0.7261107729762629, 0.6871263157894737, 0.6000000238418579, 0.30000001192092896, 0.1599999964237213, 0]
,["1999", 0.7261107729762629, 0.6896052631578948, 0.6000000238418579, 0.30000001192092896, 0.07999999821186066, 0]
,["2000", 0.6856763925729443, 0.6920842105263157, 0.6000000238418579, 0.30000001192092896, 0.09000000357627869, 0]
,["2001", 0.6856763925729443, 0.6945631578947369, 0.6000000238418579, 0.30000001192092896, 0.07000000029802322, 0]
,["2002", 0.7016229712858926, 0.6970421052631579, 0.6000000238418579, 0.30000001192092896, 0.05000000074505806, 0]
,["2003", 0.6268958543983821, 0.6995210526315789, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["2004", 0.766839378238342, 0.7020000000000001, 0.6000000238418579, 0.30000001192092896, 0, 0]
,["2005", 0.1652502360717658, 0.1652, 0.10000000149011612, 0.5, 0.75, 0]
,["2006", 0.37468030690537085, 0.21481538461538469, 0.10000000149011612, 0.6000000238418579, 0.07999999821186066, 0.07999999821186066]
,["2007", 0.37468030690537085, 0.26443076923076925, 0.4000000059604645, 0.6000000238418579, 0.09000000357627869, 0.05999999865889549]
,["2008", 0.44536882972823066, 0.3140461538461539, 0.10000000149011612, 0.5, 0.12999999523162842, 0.12999999523162842]
,["2009", 0.3751962323390895, 0.3636615384615385, 0.4000000059604645, 0.6000000238418579, 0.019999999552965164, 0.07999999821186066]
,["2010", 0.3751962323390895, 0.41327692307692304, 0.4000000059604645, 0.6000000238418579, 0, 0.10999999940395355]
,["2011", 0.4737417943107221, 0.4628923076923077, 0.4000000059604645, 0.6000000238418579, 0.05999999865889549, 0.07999999821186066]
,["2012", 0.5301810865191147, 0.5125076923076924, 0.4000000059604645, 0.6000000238418579, 0.12999999523162842, 0.10000000149011612]
,["2013", 0.5709251101321586, 0.562123076923077, 0.4000000059604645, 0.6000000238418579, 0.05000000074505806, 0.8399999737739563]
,["2014", 0.569609507640068, 0.6117384615384616, 0.4000000059604645, 0.30000001192092896, 0, 0.6499999761581421]
,["2015", 0.6380090497737556, 0.6613538461538462, 0.4000000059604645, 0.6000000238418579, 0.019999999552965164, 0.8700000047683716]
,["2016", 0.7084615384615386, 0.7109692307692308, 0.4000000059604645, 0.30000001192092896, 0, 0.75]
,["2017", 0.7672530446549392, 0.7605846153846154, 0.4000000059604645, 0.30000001192092896, 0, 0.6499999761581421]];
var d = [['time','landcover','burnSeverity','cdl','percent_tree_cover','impervious','IDS Mort Type','IDS Mort DCA','IDS Defol Type','IDS Defol DCA','IDS Mort Type Year','IDS Mort DCA Year','IDS Defol Type Year','IDS Defol DCA Year'],
[1984,,,,,,,,,,,,,],
[1985,,,,,,,,,,,,,],
[1986,,,,,,,,,,,,,],
[1987,,,,,,,,,,,,,],
[1988,,,,,,,,,,,,,],
[1989,,,,,,,,,,,,,],
[1990,,,,,,,,,,,,,],
[1991,,,,,,,,,,,,,],
[1992,43,,,,,,,,,,,,],
[1993,,,,,,,,,,,,,],
[1994,,,,,,,,,,,,,],
[1995,,,,,,,,,,,,,],
[1996,,,,,,,,,,,,,],
[1997,,,,,,,,,,,,,],
[1998,,,,,,,,,,,,,],
[1999,,,,,,,,,,,,,],
[2000,,,,,,,,,,,,,],
[2001,43,,,,0,,,,,,,,],
[2002,,,,,,,,,,,,,],
[2003,,,,,,,,,,,,,],
[2004,43,,,,,,,,,,,,],
[2005,,,,,,2,11,,,2005,2005,,],
[2005,,,,,,2,11,,,2005,2005,,],
[2006,43,,,,0,,,,,,,,],
[2007,,,,,,2,80,,,2007,2007,,],
[2007,,,,,,2,80,,,2007,2007,,],
[2008,43,,143,,,,,,,,,,],
[2009,,,143,,,,,,,,,,],
[2010,,,143,,,,,,,,,,],
[2011,43,,142,65,0,,,,,,,,],
[2012,,,143,,,,,,,,,,],
[2013,43,,143,,,,,,,,,,],
[2014,,,143,,,,,,,,,,],
[2015,,,141,,,,,,,,,,],
[2016,43,,143,,0,,,,,,,,],
[2017,,,143,,,,,,,,,,],
[2018,,,143,,,,,,,,,,]]
// addChartJS(d,'test1');

// var legends = chartCollection.get('legends').getInfo();
// if(legends !== null){makeLegend(legends)}


function addClickMarker(plotBounds){
	plotBounds.evaluate(function(plotBounds){
		var coords = plotBounds.coordinates[0];
	
	marker.setMap(null);
	marker=new google.maps.Rectangle({
			// center:{lat:center.lat(),lng:center.lng()},
			// radius:plotRadius,
			 bounds: {
            north: coords[0][1],
            south: coords[2][1],
            east: coords[1][0],
            west: coords[0][0],
          	},
			strokeColor: '#FF0',
			fillOpacity:0
			});
	marker.setMap(map);
	})
	
}
function getEveryOther(values){
			return values.filter(i => values.indexOf(i)%2 ==0)
		}

function makeLegend(legendDicts){
	$( '#chart-modal-graph-container' ).append(`<div id = 'chart-legend' style = 'font-size:0.7em;' class = 'text-dark'></div>`);
	Object.keys(legendDicts).map(function(k){
		var title = k;
		try{
			var legendDict = JSON.parse(legendDicts[k]);
		}catch(err){
			var legendDict = legendDicts[k];
		}
		
		var legendID = title.replaceAll(' ','-')
		legendID = legendID.replaceAll(':','') + '-legend'
		$( '#chart-legend' ).append(`<div  class = 'px-2' id='${legendID}'>
										<div class = 'p-0'>${title}</div>
										<table  style = 'display:inline-block;vertical-align:top' class = 'table-bordered' id = '${legendID}-table'></table>
									</div>`)

		$('#'+legendID+ '-table').append(`<tr id = '${legendID}-table-names'></tr>`);
		$('#'+legendID+ '-table').append(`<tr id = '${legendID}-table-values'></tr>`);
		Object.keys(legendDict).map(function(k){
			$('#'+legendID+ '-table-names').append(`<td>${k}</td>`)
		})
		Object.keys(legendDict).map(function(k){
			$('#'+legendID+ '-table-values').append(`<td>${legendDict[k]}</td>`)
		})
	})
	

}


function startPixelChartCollection() {
	
	
	

	map.setOptions({draggableCursor:'help'});
	mapHammer = new Hammer(document.getElementById('map'));
   
    mapHammer.on("doubletap", function(event) {
    	chartCollection = pixelChartCollections[whichPixelChartCollection].collection;
    	
    	
    	// if(pixelChartCollections[whichPixelChartCollection].chartColors !== undefined && pixelChartCollections[whichPixelChartCollection].chartColors !== null){
    	// 	chartColors = pixelChartCollections[whichPixelChartCollection].chartColors;
    	// }
    	
    	areaGeoJson = null;
    	$('#summary-spinner').slideDown();
    	map.setOptions({draggableCursor:'progress'});
        var x =event.center.x;
        var y = event.center.y;
        center =point2LatLng(x,y);

		var pt = ee.Geometry.Point([center.lng(),center.lat()]);
		var plotBounds = pt.buffer(plotRadius).bounds();
   		addClickMarker(plotBounds)
		var icT = ee.ImageCollection(chartCollection.filterBounds(pt));
		
		uriName =  pixelChartCollections[whichPixelChartCollection].label.replaceAll(' ','_')+'_lng_' +center.lng().toFixed(4).toString() + '_lat_' + center.lat().toFixed(4).toString();
		chartTitle =  pixelChartCollections[whichPixelChartCollection].label+' (lng: ' +center.lng().toFixed(4).toString() + ' lat: ' + center.lat().toFixed(4).toString() + ')';
		
		csvName = uriName + '.csv'
		

		function chartValues(values){
			
			if(chartIncludeDate){var startColumn = 3}else{var startColumn = 4};
			print('Extracted values:');
			print(values);
			var header = values[0].slice(startColumn);
			values = values.slice(1).map(function(v){return v.slice(startColumn)}).sort(sortFunction);
			if(chartIncludeDate){
				values = values.map(function(v){
				  // var d = [new Date(v[0])];
				  // v.slice(1).map(function(vt){d.push(vt)})
				  var d = v[0];
				  
				  if(pixelChartCollections[whichPixelChartCollection].simplifyDate === false){
				  	var y = new Date(d).toGMTString();
				  }
				  else if(pixelChartCollections[whichPixelChartCollection].semiSimpleDate === true){
				  	var y = `${new Date(d).getFullYear()}-${new Date(d).getMonth()+1}-${new Date(d).getDate()}`
				  }else{
				  	var y = (new Date(d).getYear()+1900).toString();
				  }
				  // v = v.map(function(i){if(i === null){return i}else{return i.toFixed(3)}})
				  v[0] = y;
				  return v;
				})
			}
			// values = values.map(function(v)
			// 	{return v.map(function(i){
			// 	if(i === null || i === undefined){return i}
			// 	else if(i%1!==0){return parseFloat(i.toFixed(4))}
			// 	else if(i%1==0){return parseInt(i)}
			// 	else{return i}
			// 	})
			// });
			values.unshift(header);
			$('#summary-spinner').slideUp();
			map.setOptions({draggableCursor:'help'});
			ga('send', 'event', mode, 'pixelChart', whichPixelChartCollection);
			addChartJS(values,chartTitle,'line',false,false,pixelChartCollections[whichPixelChartCollection].chartColors,pixelChartCollections[whichPixelChartCollection].xAxisLabel,pixelChartCollections[whichPixelChartCollection].yAxisLabel,pixelChartCollections[whichPixelChartCollection].fieldsHidden);
		
			if(pixelChartCollections[whichPixelChartCollection].legends !== null && pixelChartCollections[whichPixelChartCollection].legends !== undefined){
				makeLegend(pixelChartCollections[whichPixelChartCollection].legends);
				toggleChartTable(localStorage.tableOrChart);
			}
			
   			}

		icT.getRegion(plotBounds,null,'EPSG:5070',[30,0,-2361915.0,0,-30,3177735.0]).evaluate(function(values,failure){
			$('#summary-spinner').slideUp();
			// if(values === undefined ||  values === null){
			// 	showMessage('<i class="text-dark text-uppercase fa fa-exclamation-triangle"></i> Error! Try again','Error encountered while charting.<br>Most likely clicked outside study area data extent<br>Try charting an area within the selected study area');
			// }
			if(failure !== undefined && failure !== null){showMessage('<i class="text-dark text-uppercase fa fa-exclamation-triangle"></i> Error! Try again',failure)}
			if(values !== undefined && values !== null && values.length > 1){
				var expectedLength = icT.size().getInfo()+1
				if(values.length > expectedLength){
					console.log('reducing number of inputs');
					// console.log(expectedLength);
					// console.log(values);
					values = values.slice(0,expectedLength)
					// values = getEveryOther(values);
				}
				chartValues(values);
			}
			else{

				showMessage('Charting Error','Unknown Error<br>Try again');
			}
		})
	})

		
		
      }

// function closeChart(){
// 	updateProgress(1);
// 	$('#curve_chart').slideUp();

	
// }
// function closeBigChart(){
// 	$('#curve_chart_big').slideUp();
	
// }
function stopCharting(){
	// document.getElementById('charting-parameters').style.display = 'none';
	// $("#charting-parameters").slideUp();
	// $("#whichIndexForChartingRadio").slideUp();
	// marker.setMap(null);
	// google.maps.event.clearListeners(mapDiv, 'dblclick');

	// updateProgress(1);
	// closeChart();
	// closeBigChart();
	try{
		mapHammer.destroy();
	}catch(err){};
	try{
		map.setOptions({draggableCursor:'hand'});
		$('#summary-spinner').slideUp();
		infowindow.setMap(null);
		marker.setMap(null);
		
	}catch(err){}
	

}

function exportJSON(filename,json){
	json = JSON.stringify(json);

	var blob = new Blob([json], { type: "application/json" });
	var url  = URL.createObjectURL(blob);

	var link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        ga('send', 'event', mode, getActiveTools()[0] +'-chartDownload', 'geoJSON');
    }
}
function exportToCsv(filename, rows) {
        var processRow = function (row) {
            var finalVal = '';
            for (var j = 0; j < row.length; j++) {
                var innerValue = row[j] === null || row[j] === undefined ? '' : row[j].toString();
                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                };

                var result = innerValue.replace(/"/g, '""');
                if (result.search(/("|,|\n)/g) >= 0)
                    result = '"' + result + '"';
                if (j > 0)
                    finalVal += ',';
                finalVal += result;
            }
            return finalVal + '\n';
        };

        var csvFile = '';
        for (var i = 0; i < rows.length; i++) {
            csvFile += processRow(rows[i]);
        }

        var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                ga('send', 'event', mode, getActiveTools()[0] +'-chartDownload', 'csv');
            }
        }
    }
function stopAllTools(){
  stopArea();
  stopDistance();
  stopQuery();
  stopCharting();
  stopAreaCharting();
  stopCharting();
  clearQueryGeoJSON();
  // clearQueryGeoJSON();
  // clearSelectedAreas();
  turnOffUploadedLayers();

  turnOffSelectLayers();
  turnOffSelectGeoJSON();

  Object.keys(toolFunctions).map(function(t){Object.keys(toolFunctions[t]).map(function(tt){toolFunctions[t][tt]['state'] = false})});
  updateToolStatusBar();
  
}
var toolFunctions = {'measuring':
                    {'area':
                      {'on':'stopAllTools();startArea();showTip("AREA MEASURING",staticTemplates.areaTip);',
                      'off':'stopAllTools();',
                      'state':false,
                      'title': 'Measuring Tools-Area Measuring'
                      },
                    'distance':
                      {'on':'stopAllTools();startDistance();showTip("DISTANCE MEASURING",staticTemplates.distanceTip);',
                      'off':'stopAllTools()',
                      'state':false,
                      'title': 'Measuring Tools-Distance Measuring'
                      }
                    },
                  'pixel':
                    {
                      'query':{
                        'on':'stopAllTools();startQuery();showTip("QUERY VISIBLE MAP LAYERS",staticTemplates.queryTip);',
                        'off':'stopAllTools()',
                        'state':false,
                        'title': 'Pixel Tools-Query Visible Map Layers'
                      },
                      'chart':{
                        'on':'stopAllTools();startPixelChartCollection();showTip("QUERY "+mode+" TIME SERIES",staticTemplates.pixelChartTip);',
                        'off':'stopAllTools()',
                        'state':false,
                        'title': 'Pixel Tools-Query '+mode+' Time Series'
                      }
                    },
                    'area':
                    {
                      'userDefined':{
                        'on':'stopAllTools();areaChartingTabSelect("#user-defined");showTip("SUMMARIZE BY USER-DEFINED AREA",staticTemplates.userDefinedAreaChartTip);',
                        'off':'stopAllTools()',
                        'state':false,
                        'title': 'Area Tools-User Defined Area Tool'
                      },
                      'shpDefined':{
                        'on':'stopAllTools();areaChartingTabSelect("#shp-defined");showTip("SUMMARIZE BY UPLOADED AREA",staticTemplates.uploadAreaChartTip);',
                        'off':'stopAllTools()',
                        'state':false,
                        'title': 'Area Tools-Upload an Area'
                      },
                      'selectDropdown':{
                        'on':'stopAllTools();areaChartingTabSelect("#pre-defined");showTip("SUMMARIZE BY PRE-DEFINED AREA",staticTemplates.selectAreaDropdownChartTip);',
                        'off':'stopAllTools()',
                        'state':false,
                        'title': 'Area Tools-Select an Area from Dropdown'
                      },
                      'selectInteractive':{
                        'on':'stopAllTools();turnOffVectorLayers();turnOnSelectedLayers();turnOnSelectGeoJSON();areaChartingTabSelect("#user-selected");showTip("SUMMARIZE BY PRE-DEFINED AREA",staticTemplates.selectAreaInteractiveChartTip);',
                        'off':'stopAllTools();turnOffSelectLayers();',
                        'state':false,
                        'title': 'Area Tools-Select an Area on map'
                      },
                    }
                  }
function getActiveTools(){
  var out = [];

  Object.keys(toolFunctions).map(function(t){Object.keys(toolFunctions[t]).map(function(tt){
                                                                        var state = toolFunctions[t][tt]['state'];
                                                                        var title = toolFunctions[t][tt]['title'];
                                                                        if(state){
                                                                          out.push(title)
                                                                          
                                                                        } 
                                                                        
                                                                      })});
  return out;
}
function updateToolStatusBar(){
  var somethingShown = false;
  $('#current-tool-selection').empty();
  $('#current-tool-selection').append(`Currently active tools: `)
  Object.keys(toolFunctions).map(function(t){Object.keys(toolFunctions[t]).map(function(tt){
                                                                        var state = toolFunctions[t][tt]['state'];
                                                                        var title = toolFunctions[t][tt]['title'];
                                                                        if(state){
                                                                          $('#current-tool-selection').append(`${title}`)
                                                                          somethingShown = true
                                                                        } 
                                                                        
                                                                      })});
  if(!somethingShown){$('#current-tool-selection').append(`No active tools`)}
    else{
    
      ga('send', 'event','tool-active', mode, $('#current-tool-selection').html().split(': ')[1]);
    }
}
function toggleTool(tool){

  if(tool.state){
    eval(tool.off);

    // tool.state = false
  }else{
    eval(tool.on);
    tool.state = true
  };
  updateToolStatusBar();
}


updateToolStatusBar();
// var paragraphs = document.getElementsByClassName("collapse-title");
// for (var i = 0; i < paragraphs.length; i++) {
//   var paragraph = paragraphs.item(i);
//   paragraph.style.setProperty("font-size", "0.5em", null);
//   paragraph.style.setProperty("padding", "0.0em", null);
//   paragraph.style.setProperty("margin", "0.0em", null);
// }
// Land Cover
// var PALETTE = 'b67430,78db53,F0F,ffb88c,8cfffc,32681e,2a74b8'
    //////////////////////////////////////////////////////
    // var PALETTE = [
    //   'b67430', // Barren
    //   '78db53', // Grass/forb/herb
    //   'F0F',//Impervious
    //   'ffb88c', // Shrubs
    //   '8cfffc', // Snow/ice
    //   '32681e', // Trees
    //   '2a74b8'  // Water
    // ];
//Function to combine LCMS change outputs based on the highest confidence
//Can handle each modeled output as a band or individual image using the format param
//Format can equal 'stack' or 'collection'
function combineChange(changeC,year,gain_thresh,slow_loss_thresh,fast_loss_thresh,format,mult, trackNoData){
  if(trackNoData === null || trackNoData === undefined){trackNoData = false}
  year = ee.Number(year).int16();
  var dummyImage = ee.Image(changeC.first());
  // print('here')
  if(format !== 'stack'){
      changeC = changeC.filter(ee.Filter.eq('year',year));
    var gain = changeC.filter(ee.Filter.eq('model','RNR')).mosaic();
    var slowLoss = changeC.filter(ee.Filter.eq('model','DND_Slow')).mosaic();
    var fastLoss = changeC.filter(ee.Filter.eq('model','DND_Fast')).mosaic();
    var stack = ee.Image.cat([slowLoss,fastLoss,gain]);

  }else{
    var stack = changeC
                .filter(ee.Filter.calendarRange(year,year,'year'))
                .filter(ee.Filter.neq('model','STABLE'))
                .mosaic().select(['DND_Slow','DND_Fast','RNR']);
  } 
  stack = stack.multiply(mult);
  var processingMask = stack.mask().reduce(ee.Reducer.min());

 
  var maxConf = stack.reduce(ee.Reducer.max());
  var maxConfMask = stack.eq(maxConf).and(stack.gte(ee.Image([slow_loss_thresh,fast_loss_thresh,gain_thresh]))).selfMask();
  var yearMask = ee.Image([year,year,year]).updateMask(maxConfMask).int16();
  var maxClass = ee.Image([1,2,3]).updateMask(maxConfMask).reduce(ee.Reducer.max()).rename(['maxClass']);

  var out = ee.Image.cat([stack,maxConfMask, yearMask,maxClass,processingMask]).rename(['Slow_Loss_Prob','Fast_Loss_Prob','Gain_Prob','Slow_Loss_Mask','Fast_Loss_Mask','Gain_Mask','Slow_Loss_Year','Fast_Loss_Year','Gain_Year','maxClass','processingMask']);
  return out.set('system:time_start',ee.Date.fromYMD(year,6,1).millis())
}
///////////////////////////////////////////
function combineLandCover(lcC,year,numbers,names,format,mult){
  var dummyImage = ee.Image(lcC.first());
  var probNames =  names.map(function(bn){return bn + '_Prob'})
  var mskNames = names.map(function(bn){return bn + '_Mask'});
  year = ee.Number(year).int16();
  if(format !== 'stack'){
      lcC = lcC.filter(ee.Filter.eq('year',year));
      
      lcC = ee.ImageCollection(names.map(function(nm){
       
        return fillEmptyCollections(lcC.filter(ee.Filter.eq('model',nm)),dummyImage).mosaic()
      })).toBands().rename(probNames)

  

  }else{
    var lcC = lcC.filter(ee.Filter.calendarRange(year,year,'year')).mosaic().select(names,probNames);
  }
  lcC = lcC.multiply(mult);
  // var processingMask = lcC.mask().reduce(ee.Reducer.min());
  var maxConf = lcC.reduce(ee.Reducer.max());
  var maxConfMask = lcC.eq(maxConf).rename(mskNames);
  var maxClass = ee.Image(numbers).updateMask(maxConfMask).reduce(ee.Reducer.max()).rename(['maxClass']);
  // maxClass = maxClass.unmask(numbers.max()+1,false);
  return (lcC.addBands(maxConfMask).addBands(maxClass)).set('system:time_start',ee.Date.fromYMD(year,6,1).millis())
}
function getLCMSVariables() {
// Loss/Gain Palettes
window.declineYearPalette = 'ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02';
window.recoveryYearPalette = 'AFDEA8,80C476,308023,145B09';

window.declineProbPalette = 'F5DEB3,D00';
window.recoveryProbPalette = 'F5DEB3,006400';

window.declineDurPalette = 'BD1600,E2F400,0C2780';
window.recoveryDurPalette = declineDurPalette;

// window.gainYearPaletteA = 'c5ee93,0f6460';
window.gainYearPaletteA = 'c5ee93,00a398';
// window.gainYearPaletteB = 'e0e0ff,4a50c4';
// window.changePaletteFull = ['3d4551','f39268','d54309','00a398','ffbe2e'];
// window.changePaletteFull = ['372E2C','f39268','d54309','00a398','372E2C','1B1716DD'];
window.changePaletteFull =['#3d4551','#f39268','#d54309','#00a398','#222222']
// window.changePaletteFull = ['3d4551','f39268','d54309','0f6460','ffbe2e'];
window.changePalette = ['f39268','d54309','00a398'];
window.whichIndices = ['NBR'];

// LCMS Project Boundaries
// var fnf = ee.FeatureCollection('projects/USFS/LCMS-NFS/R1/FNF/FNF_Admin_Bndy');
// var bt_study_area = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/BT/BT_LCMS_ProjectArea_5km');
window.bt_study_area = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/BT/GTNP_admin_bndy_5km_buffer_GTNP_Merge');
window.fnf_study_area = ee.FeatureCollection('projects/USFS/LCMS-NFS/R1/FNF/FNF_GNP_Merge_Admin_BND_1k');
window.mls_study_area = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/MLS/MLS_LCMS_ProjectArea_5km');
window.ck_study_area = ee.FeatureCollection('projects/USFS/LCMS-NFS/R10/CK/CK_LCMS_ProjectArea').map(function(f){return f.convexHull(1000)});

// Forest Service and Park Service Boundaries
window.usfs_regions = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Region_Boundaries');
window.b = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_Boundaries');
window.nps = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/NPS_Boundaries');
window.otherLands = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/OtherNationalDesignatedArea');
window.gtnp = ee.Feature(nps.filter(ee.Filter.eq('PARKNAME','Grand Teton')).first());
window.gnp = ee.Feature(nps.filter(ee.Filter.eq('PARKNAME','Glacier')).first());
window.kfnp = ee.Feature(nps.filter(ee.Filter.eq('PARKNAME','Kenai Fjords')).first());

window.btnf = ee.Feature(b.filter(ee.Filter.eq('FORESTNAME','Bridger-Teton National Forest')).first());
window.fnf = ee.Feature(b.filter(ee.Filter.eq('FORESTNAME','Flathead National Forest')).first());
window.mlsnf = ee.Feature(b.filter(ee.Filter.eq('FORESTNAME','Manti-La Sal National Forest')).first()); 
window.cnf = ee.Feature(b.filter(ee.Filter.eq('FORESTNAME','Chugach National Forest')).first());

window.R4_unofficial = ee.FeatureCollection('projects/USFS/LCMS-NFS/R4/R4_LCMS_ProjectArea_5km');
window.R4_official =usfs_regions.filter(ee.Filter.eq('REGION','04'));
// Other boundaries
window.huc8 = ee.FeatureCollection("USGS/WBD/2017/HUC08");
window.kenai_nwr = ee.FeatureCollection('projects/USFS/LCMS-NFS/AK-Ancillary-Data/Kenai_NWR').filterBounds(ck_study_area);

}
function computeThematicChange(c,numbers,legendColors, legendDict,queryDict,startYear,endYear){
    var period = 3;
    var changeColor = '7d2702'
    var cEarly = c.filter(ee.Filter.calendarRange(startYear,startYear+period,'year')).mode();
    var cLate = c.filter(ee.Filter.calendarRange(endYear-period,endYear,'year')).mode();
    var cNeq = cEarly.neq(cLate);

    var pairs = [];
    numbers.map(function(n1){
      numbers.map(function(n2){
        if(n1 !== n2){pairs.push(parseInt(n1.toString()+n2.toString()))}
      })
    });
    console.log(pairs)
    var cChange = cLate;
    cChange = cChange.where(cNeq,numbers.max()+1);
    changeLegendColors = copyArray(legendColors);
    changeLegendColors.push(changeColor);
    cChange = cChange.updateMask(cChange.eq(numbers.max()+1));
    changeLegendDict = copyObj(legendDict);
    changeLegendDict['Conversion/Change'] = changeColor;

    var changeViz = {title: `Most common class from ${startYear} to ${endYear} with change added.`,layerType : 'geeImage',min:numbers.min(),max:numbers.max()+1,palette:changeLegendColors,addToClassLegend:true,classLegendDict:changeLegendDict,queryDict:queryDict};
    return {'change':cChange,'viz':changeViz}
  }
function formatAreaChartCollection(collection,classCodes,classNames,unmask){
  if(unmask === undefined || unmask === null){unmask = true};
  function unstacker(img,code){
    return img.eq(parseInt(code))
  }
  function codeWrapper(img){
    t = ee.ImageCollection( classCodes.map(function(code){return unstacker(img,code)})).toBands()
    return t.rename(classNames).copyProperties(img,['system:time_start']).copyProperties(img)
  }
  out = ee.ImageCollection(collection.map(codeWrapper))

  if(unmask){
    out = ee.ImageCollection(out.map(function(img){return img.unmask(0,false)}));
  }
  return ee.ImageCollection(out)
}
function multBands(img,distDir,by){
    var out = img.multiply(ee.Image(distDir).multiply(by));
    out  = out.copyProperties(img,['system:time_start'])
              .copyProperties(img);formatAreaChartCollection
    return out;
}

function additionBands(img,howMuch){
    var out = img.add(ee.Image(howMuch));
    out  = out.copyProperties(img,['system:time_start'])
              .copyProperties(img);
    return out;
}

function simpleAddIndices(in_image,mult){
  if(mult === undefined || mult === null){mult = 1}
    in_image = in_image.addBands(in_image.normalizedDifference(['nir', 'red']).select([0],['NDVI']).multiply(mult));
    in_image = in_image.addBands(in_image.normalizedDifference(['nir', 'swir2']).select([0],['NBR']).multiply(mult));
    in_image = in_image.addBands(in_image.normalizedDifference(['nir', 'swir1']).select([0],['NDMI']).multiply(mult));
    in_image = in_image.addBands(in_image.normalizedDifference(['green', 'swir1']).select([0],['NDSI']).multiply(mult));  
    return in_image;
}
function simpleGetTasseledCap(image) {
  var bands = ee.List(['blue','green','red','nir','swir1','swir2']);
  // // Kauth-Thomas coefficients for Thematic Mapper data
  // var coefficients = ee.Array([
  //   [0.3037, 0.2793, 0.4743, 0.5585, 0.5082, 0.1863],
  //   [-0.2848, -0.2435, -0.5436, 0.7243, 0.0840, -0.1800],
  //   [0.1509, 0.1973, 0.3279, 0.3406, -0.7112, -0.4572],
  //   [-0.8242, 0.0849, 0.4392, -0.0580, 0.2012, -0.2768],
  //   [-0.3280, 0.0549, 0.1075, 0.1855, -0.4357, 0.8085],
  //   [0.1084, -0.9022, 0.4120, 0.0573, -0.0251, 0.0238]
  // ]);
  
  //Crist 1985 coeffs - TOA refl (http://www.gis.usu.edu/~doug/RS5750/assign/OLD/RSE(17)-301.pdf)
  var coefficients = ee.Array([[0.2043, 0.4158, 0.5524, 0.5741, 0.3124, 0.2303],
                    [-0.1603, -0.2819, -0.4934, 0.7940, -0.0002, -0.1446],
                    [0.0315, 0.2021, 0.3102, 0.1594, -0.6806, -0.6109]]);
  // Make an Array Image, with a 1-D Array per pixel.
  var arrayImage1D = image.select(bands).toArray();
  
  // Make an Array Image with a 2-D Array per pixel, 6x1.
  var arrayImage2D = arrayImage1D.toArray(1);
  
  var componentsImage = ee.Image(coefficients)
    .matrixMultiply(arrayImage2D)
    // Get rid of the extra dimensions.
    .arrayProject([0])
    // Get a multi-band image with TC-named bands.
    .arrayFlatten(
      [['brightness', 'greenness', 'wetness']])
    .float();
  
  return image.addBands(componentsImage);
  }
function batchFillCollection(c,expectedYears){
  var actualYears = c.toList(10000,0).map(function(img){return ee.Date(ee.Image(img).get('system:time_start')).get('year')}).distinct().getInfo();
  var missingYears = expectedYears.filter(function(x){return actualYears.indexOf(x)==-1})
  var dummyImage = ee.Image(c.first()).mask(ee.Image(0));
  var missingCollection = missingYears.map(function(yr){return dummyImage.set('system:time_start',ee.Date.fromYMD(yr,1,1).millis())});
  var out = c.merge(missingCollection).sort('system:time_start');
  return out;//.map(function(img){return img.unmask(255)});
}
function setSameDate(img){
  var yr = ee.Date(img.get('system:time_start')).get('year');
  return img.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
}
//Helper function to join two collections- Source: code.earthengine.google.com
function joinCollections(c1,c2, maskAnyNullValues){
  if(maskAnyNullValues === undefined || maskAnyNullValues === null){maskAnyNullValues = true}

  var MergeBands = function(element) {
    // A function to merge the bands together.
    // After a join, results are in 'primary' and 'secondary' properties.
    return ee.Image.cat(element.get('primary'), element.get('secondary'));
  };

  var join = ee.Join.inner();
  var filter = ee.Filter.equals('system:time_start', null, 'system:time_start');
  var joined = ee.ImageCollection(join.apply(c1, c2, filter));

  joined = ee.ImageCollection(joined.map(MergeBands));
  if(maskAnyNullValues){
    joined = joined.map(function(img){return img.mask(img.mask().and(img.reduce(ee.Reducer.min()).neq(0)))});
  }
  return joined;
}

function setNoData(image,noDataValue){
  var m = image.mask();
  image = image.mask(ee.Image(1));
  image = image.where(m.not(),noDataValue);
  return image;
}

function addYearBand(img){
  var d = ee.Date(img.get('system:time_start'));
  var y = d.get('year');
  
  var db = ee.Image.constant(y).rename(['year']).float();
  db = db.updateMask(img.select([0]).mask())
  return img.addBands(db).float();
}
function fillEmptyCollections(inCollection,dummyImage){                       
  var dummyCollection = ee.ImageCollection([dummyImage.mask(ee.Image(0))]);
  var imageCount = inCollection.toList(1).length();
  return ee.ImageCollection(ee.Algorithms.If(imageCount.gt(0),inCollection,dummyCollection));

}
// --------Add MTBS and IDS Layers-------------------------------
var idsStartYear = 1997;
var idsEndYear = 2021;
var idsMinYear = 1997;
var idsMaxYear = 2021;
function getIDSCollection(){
  if(startYear > idsMinYear && startYear <= idsMaxYear){idsStartYear = startYear}
    else{idsStartYear = idsMinYear}
  if(endYear < idsMaxYear && endYear >= idsMinYear){idsEndYear = endYear}  
    else{idsEndYear = idsMaxYear}
  // console.log('IDS Years:');console.log(idsStartYear);console.log(idsEndYear);
  // var idsFolder = 'projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/IDS';
  var idsFolder = 'projects/lcms-292214/assets/CONUS-Ancillary-Data/IDS';
  var ids = ee.data.getList({id:idsFolder}).map(function(t){return t.id});
 
  ids = ids.map(function(id){
    var idsT = ee.FeatureCollection(id);
    return idsT;
  });
  ids = ee.FeatureCollection(ids).flatten();
  ids = ids.filter(ee.Filter.and(ee.Filter.gte('SURVEY_YEA',idsStartYear),ee.Filter.lte('SURVEY_YEA',idsEndYear))).set('bounds',clientBoundsDict.CONUS);

  var years = ee.List.sequence(idsStartYear,idsEndYear);
  var dcaCollection = years.map(function(yr){
    var idsYr = ids.filter(ee.Filter.eq('SURVEY_YEA',yr));
    var dcaYr = idsYr.reduceToImage(['DCA_CODE'],ee.Reducer.first()).divide(1000);
    var dtYr = idsYr.reduceToImage(['DAMAGE_TYP'],ee.Reducer.first());
    return dcaYr.addBands(dtYr).int16().set('system:time_start',ee.Date.fromYMD(yr,6,1).millis()).rename(['Damage_Agent','Damage_Type']);   
  });
  dcaCollection = ee.ImageCollection.fromImages(dcaCollection);
  // console.log(dcaCollection.size().getInfo())
  return {'imageCollection':dcaCollection,'featureCollection':ids}
}
function getAspectObj(){
  var dem = ee.Image('USGS/SRTMGL1_003');
  var aspect = ee.Terrain.aspect(dem).int16();
  var aspectBinWidth = 90;
  var aspectBreaks = ee.List.sequence(0,360,aspectBinWidth).slice(0,-1);
  var from = [];
  var to =  [];
  var lookupDict = ee.Dictionary({});
  var lookupNames = ['Northeast (0'+String.fromCharCode(176)+'-89'+String.fromCharCode(176)+')','Southeast (90'+String.fromCharCode(176)+'-179'+String.fromCharCode(176)+')','Southwest (180'+String.fromCharCode(176)+'-269'+String.fromCharCode(176)+')','Northwest (270'+String.fromCharCode(176)+'-359'+String.fromCharCode(176)+')'];
  var lookupNumbers = ee.List([]);
  var colorDict = ee.Dictionary({})

  aspectBreaks.getInfo().map(function(b){
    b = ee.Number(b);
    var s = b;
    var e = b.add(aspectBinWidth).subtract(1);
    var toValue = (e.add(s)).divide(2).round();
    var toValueStr = ee.Number(toValue).int16().format()
    var fromT = ee.List.sequence(s,e);
    var toT = ee.List.repeat(toValue,aspectBinWidth);
    lookupNumbers = lookupNumbers.cat([toValueStr]);
    from.push(fromT);
    to.push(toT);
    colorDict =colorDict.set(toValueStr,randomColor())
    
  });
  
  from = ee.List(from).flatten();
  to = ee.List(to).flatten();

  var aspectLookupDict = ee.Dictionary.fromLists(lookupNumbers,lookupNames);
  var aspectBinned = aspect.remap(from,to)
  // Map2.addLayer(aspectBinned,{min:0,max:360},'Aspect Binned');
  return {'image':aspectBinned,'lookupDict':aspectLookupDict,'colorDict':colorDict}
}
function getNLCDObj(){
  var nlcdYears = [2001,2004,2006,2008,2011,2013,2016,2019];
  var nlcdLCMax = 95;//parseInt(nlcd.get('system:visualization_0_max').getInfo());
  var nlcdLCMin = 0;//parseInt(nlcd.get('system:visualization_0_min').getInfo());
  var nlcdLCPalette = ["466b9f", "d1def8", "dec5c5", "d99282", "eb0000", "ab0000", "b3ac9f", "68ab5f", "1c5f2c", "b5c58f", "af963c", "ccb879", "dfdfc2", "d1d182", "a3cc51", "82ba9e", "dcd939", "ab6c28", "b8d9eb", "6c9fb8"];//nlcd.get('system:visualization_0_palette').getInfo().split(',');
  
  var nlcdClassCodes = [11,12,21,22,23,24,31,41,42,43,51,52,71,72,73,74,81,82,90,95];
  var nlcdClassNames = ['Open Water','Perennial Ice/Snow','Developed, Open Space','Developed, Low Intensity','Developed, Medium Intensity','Developed High Intensity','Barren Land (Rock/Sand/Clay)','Deciduous Forest','Evergreen Forest','Mixed Forest','Dwarf Scrub','Shrub/Scrub','Grassland/Herbaceous','Sedge/Herbaceous','Lichens','Moss','Pasture/Hay','Cultivated Crops','Woody Wetlands','Emergent Herbaceous Wetlands'];
  var nlcdFullClassCodes = ee.List.sequence(nlcdLCMin,nlcdLCMax).getInfo();
  var nlcdLCVizDict = {};
  var nlcdLCQueryDict = {};
  var nlcdLegendDict = {};

  var ii = 0
  nlcdFullClassCodes.map(function(i){
    var index = nlcdClassCodes.indexOf(i);
    if(index !== -1){
      nlcdLCQueryDict[i] = nlcdClassNames[ii];
      nlcdLCVizDict[i] = nlcdLCPalette[ii];
      nlcdLegendDict[nlcdClassNames[ii]] = nlcdLCPalette[ii];
      ii++;
    }else{nlcdLCVizDict[i] = '000'}
  })
  // console.log(nlcdLCQueryDict);
  var nlcdLegendDictReverse = {};
  Object.keys(nlcdLegendDict).reverse().map(function(k){nlcdLegendDictReverse[k] = nlcdLegendDict[k]});
  var nlcd = ee.ImageCollection("USGS/NLCD_RELEASES/2019_REL/NLCD").select(['landcover'],['NLCD Landcover'])
            // .map(function(img){return img.set('system:time_start',ee.Date.fromYMD(ee.Number.parse(img.id()),6,1).millis())})
            .sort('system:time_start');
  var nlcdC = nlcdYears.map(function(nlcdYear){
      // if(nlcdYear >= startYear  && nlcdYear <= endYear){
        var nlcdT = nlcd.filter(ee.Filter.calendarRange(nlcdYear,nlcdYear,'year')).mosaic();
        nlcdT = nlcdT.set('system:time_start',ee.Date.fromYMD(nlcdYear,6,1).millis());
        return nlcdT;
      });
  nlcdC = ee.ImageCollection(nlcdC);
  // console.log(nlcdC.getInfo());
  var chartTableDict = {
    'NLCD Landcover':nlcdLCQueryDict
  }
  nlcdC =  nlcdC.set('bounds',clientBoundsDict.All).set('chartTableDict',chartTableDict);
  return {'collection':nlcdC,'years':nlcdYears,'palette':nlcdLCPalette,'vizDict':nlcdLCVizDict,'queryDict':nlcdLCQueryDict,'legendDict':nlcdLegendDict,'legendDictReverse':nlcdLegendDictReverse,'min':nlcdLCMin,'max':nlcdLCMax}
}
 
function getMTBSAndNLCD(studyAreaName,whichLayerList,showSeverity){
  if(showSeverity === null || showSeverity === undefined){showSeverity = false};
  if(mtbsSummaryMethod === null || mtbsSummaryMethod === undefined){mtbsSummaryMethod = 'Highest-Severity'}
 
    var mtbs_path = 'projects/gtac-mtbs/assets/burn_severity_mosaics/MTBS';//'projects/USFS/DAS/MTBS/BurnSeverityMosaics';
 
  var mtbsEndYear = endYear;
  if(endYear > 2020){mtbsEndYear = 2020}

  var mtbsYears = ee.List.sequence(1984,mtbsEndYear);
  var mtbs = ee.ImageCollection(mtbs_path);
  mtbs = mtbsYears.map(function(yr){
    var mtbsYr = mtbs.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic();
    return mtbsYr.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis())
  })
  mtbs = ee.ImageCollection.fromImages(mtbs);


  mtbs = mtbs.filter(ee.Filter.calendarRange(startYear,mtbsEndYear,'year'))
      
  
  mtbs = mtbs.map(function(img){return img.select([0],['burnSeverity']).byte()
    // .updateMask(img.neq(0).and(img.neq(6)))
    });


  var mtbs = mtbs.map(function(img){
    var severityRemapped = img.remap([1,2,3,4,5,6],[1,3,4,5,2,1]).rename(['burnSeverityRemap']);
    var burned = img.remap([1,2,3,4,5,6],[0,1,1,1,0,0]).rename(['burnedNotBurned']);
    burned = burned.selfMask();
    var burnYear = ee.Image(ee.Date(img.get('system:time_start')).get('year')).updateMask(severityRemapped.mask()).rename('burnYear');
    return img.addBands(severityRemapped).addBands(burned).addBands(burned.multiply(-1).rename(['burnYearNegative'])).addBands(burnYear).int16();
  });
 
  mtbs = ee.ImageCollection(mtbs);

  var mtbsSummaryDict = {'Highest-Severity':'burnSeverityRemap',"Most-Recent":'burnYear',"Oldest":'burnYearNegative'}
  var mtbsSummarized = mtbs.qualityMosaic(mtbsSummaryDict[mtbsSummaryMethod]);
  var mtbsCount = mtbs.select([2]).count();
  // var mtbsDistinct = mtbs.select([0]).reduce(ee.Reducer.countDistinct());
  // var multipleSame = mtbsCount.gt(1).and(mtbsDistinct.gt(1))
  // multipleSame = multipleSame.selfMask()
  // Map2.addLayer(mtbsDistinct,{min:1,max:3,palette:'00F,F00'},'Distinct',false);
  // Map2.addLayer(multipleSame,{min:1,max:1,palette:'F00'},'multipleSame',false);
  var mtbsClassDict = {
    'Unburned to Low': '006400',
    'Low':'7fffd4',
    'Moderate':'ffff00',
    'High':'ff0000',
    'Increased Greenness':'7fff00',
    'Non-Processing Area Mask':'ffffff'
  }

  mtbsQueryClassDict = {};
  var keyI = 1;
  Object.keys(mtbsClassDict).map(function(k){mtbsQueryClassDict[keyI] =k;keyI++;})

  if(chartMTBS === true){
    var mtbsStack = formatAreaChartCollection(mtbs.select([0]),Object.keys(mtbsQueryClassDict),Object.values(mtbsQueryClassDict),true);
    // console.log(mtbs.select([0]).getInfo())
    // console.log(Object.keys(mtbsQueryClassDict),Object.values(mtbsQueryClassDict))
    // Map2.addLayer(mtbsStack,{},'mtbs stack')
    areaChartCollections['mtbs'] = {'collection':mtbsStack,
                                  'colors':Object.values(mtbsClassDict),
                                  'label':'MTBS Burn Severity by Year',
                                  'stacked':true,
                                  'steppedLine':false,
                                  'chartType':'bar',
                                  'xAxisProperty':'year',
                                  'tooltip':'Chart the MTBS burn severity by year'}
    areaChartCollections['mtbs_burn_mosaic'] = {'collection':ee.ImageCollection([mtbs.select([2]).mosaic().unmask(0).rename(['Burned']).set('Burned','All Mapped Burned Area (Total of Low, Moderate, and High Severity) ' +startYear.toString() + '-' + endYear.toString())]),
                                  'colors':['#CC5500'],
                                  'label':'MTBS Burned Area Total '+startYear.toString() + '-' + endYear.toString(),
                                  'stacked':true,
                                  'steppedLine':false,
                                  'chartType':'bar',
                                  'xAxisProperty':'Burned',
                                  'tooltip':'Chart the union of all burned areas (areas with low, moderate, or high severity) ' +startYear.toString() + '-' + endYear.toString()}
    areaChartCollections['mtbs_burn_severity_mosaic'] = {'collection':ee.ImageCollection([mtbsStack.max().unmask(0).set('Burned','Burn Severity Total ' +startYear.toString() + '-' + endYear.toString())]),
                                  'colors':Object.values(mtbsClassDict),
                                  'label':'MTBS Burn Severity Total '+startYear.toString() + '-' + endYear.toString(),
                                  'stacked':true,
                                  'steppedLine':false,
                                  'chartType':'bar',
                                  'xAxisProperty':'Burned',
                                  'tooltip':'Chart the union of burn severity ' +startYear.toString() + '-' + endYear.toString()+'. The maximum severity is used when fires overlap. '}
  }
  var mtbsMaxSeverity = mtbs.select([0]).max();
  if(chartMTBSByNLCD){
    
    
   var nlcdObj = getNLCDObj();
  
   // {'collection':nlcdC,'years':nlcdYears,'palette':nlcdLCPalette,'vizDict':nlcdLCVizDict,'queryDict':nlcdLCQueryDict,'legendDict':nlcdLegendDict,'legendDictReverse':nlcdLegendDictReverse}
   // var nlcd = nlcdObj.collection;
   // var nlcdYears = nlcdObj.years;

    

   Map2.addTimeLapse(nlcdObj.collection,{min:nlcdObj.min,max:nlcdObj.max,palette:Object.values(nlcdObj.vizDict),addToClassLegend: true,classLegendDict:nlcdObj.legendDictReverse,queryDict: nlcdObj.queryDict,years:nlcdObj.years},'NLCD Land Cover Time Lapse',false,null,null,'NLCD landcover classes ','reference-layer-list');
          
   nlcdObj.years.map(function(nlcdYear){
      // if(nlcdYear >= startYear  && nlcdYear <= mtbsEndYear){
        var nlcdT = nlcdObj.collection.filter(ee.Filter.calendarRange(nlcdYear,nlcdYear,'year')).mosaic();
        var mtbsByNLCD = Object.keys(nlcdObj.queryDict).map(function(k){
          var name = nlcdObj.queryDict[k];
          var out = mtbsMaxSeverity.updateMask(nlcdT.eq(ee.Number.parse(k))).set('nlcd_landcover_class',name);
          return out
         });
         mtbsByNLCD = ee.ImageCollection(mtbsByNLCD);
         var mtbsByNLCDStack = formatAreaChartCollection(mtbsByNLCD,Object.keys(mtbsQueryClassDict),Object.values(mtbsQueryClassDict),true);
          
         // Map2.addLayer(nlcdT.set('bounds',clientBoundsDict.All),{min:nlcdObj.min,max:nlcdObj.max,palette:Object.values(nlcdObj.vizDict),addToClassLegend: true,classLegendDict:nlcdObj.legendDictReverse,queryDict: nlcdObj.queryDict},'NLCD '+nlcdYear.toString(),false,null,null,'NLCD landcover classes for '+nlcdYear.toString(),'reference-layer-list');
          
          areaChartCollections['mtbsNLCD'+nlcdYear.toString()] = {'collection':mtbsByNLCDStack,
                                        'colors':Object.values(mtbsClassDict),
                                        'label':'MTBS Burn Severity by NLCD Class '+nlcdYear.toString(),
                                        'stacked':true,
                                        'steppedLine':false,
                                        'chartType':'bar',
                                        'xAxisProperty':'nlcd_landcover_class',
                                        'xAxisLabel':'NLCD '+nlcdYear.toString() + ' Class',
                                        'tooltip':'Chart MTBS burn severity by each NLCD '+nlcdYear.toString() + ' landcover class'}
          // }
      
       })
  }
  if(chartMTBSByAspect){
    var aspectObj = getAspectObj();
    var aspectBinned = aspectObj.image;
    var aspectLookupDict = aspectObj.lookupDict.getInfo();
    // var aspectColorDict = aspectObj.colorDict.getInfo();
    var mtbsByAspect = Object.keys(aspectLookupDict).map(function(k){
          var name = aspectLookupDict[k];
          var out = mtbsMaxSeverity.updateMask(aspectBinned.eq(ee.Number.parse(k))).set('Aspect_Bin',name);
          return out
         });
         mtbsByAspect = ee.ImageCollection(mtbsByAspect);
         var mtbsByAspectStack = formatAreaChartCollection(mtbsByAspect,Object.keys(mtbsQueryClassDict),Object.values(mtbsQueryClassDict),true);
         // console.log(mtbsByAspectStack.getInfo())
          // print(mtbsByAspectStack.getInfo())
    //      Map2.addLayer(nlcdT.set('bounds',clientBoundsDict.All),{min:nlcdObj.min,max:nlcdObj.max,palette:Object.values(nlcdObj.vizDict),addToClassLegend: true,classLegendDict:nlcdObj.legendDictReverse,queryDict: nlcdObj.queryDict},'NLCD '+nlcdYear.toString(),false,null,null,'NLCD landcover classes for '+nlcdYear.toString(),'reference-layer-list');
          
          areaChartCollections['mtbsAspect'] = {'collection':mtbsByAspectStack,
                                        'colors':Object.values(mtbsClassDict),
                                        'label':'MTBS Burn Severity by Aspect',
                                        'stacked':true,
                                        'steppedLine':false,
                                        'chartType':'bar',
                                        'xAxisProperty':'Aspect_Bin',
                                        'xAxisLabel':'Aspect Bin',
                                        'tooltip':'Chart MTBS burn severity by aspect quadrants.'}
  }

// print(mtbsStack.getInfo());
  var severityViz = {layerType:'geeImage','queryDict': mtbsQueryClassDict,'min':1,'max':6,'palette':'006400,7fffd4,ffff00,ff0000,7fff00,ffffff',addToClassLegend: true,classLegendDict:mtbsClassDict}
  Map2.addLayer(mtbsSummarized.select([0]).set('bounds',clientBoundsDict.All),severityViz,'MTBS Burn Severity',showSeverity,null,null,'MTBS '+mtbsSummaryMethod+' burn severity mosaic from '+startYear.toString() + '-' + mtbsEndYear.toString(),whichLayerList)
  Map2.addLayer(mtbsSummarized.select([4]).set('bounds',clientBoundsDict.All),{min:startYear,max:endYear,palette:declineYearPalette,layerType:'geeImage'},'MTBS Burn Year',false,null,null,'MTBS '+mtbsSummaryMethod+' burn year from '+startYear.toString() + '-' + mtbsEndYear.toString(),whichLayerList)  
  Map2.addLayer(mtbsCount.set('bounds',clientBoundsDict.All),{layerType:'geeImage',min:1,max:5,palette:declineDurPalette.split(',').reverse().join(','),legendLabelLeft:'Count =',legendLabelRight:'Count >='},'MTBS Burn Count',false,null,null,'MTBS number of burns mapped for a given area from '+startYear.toString() + '-' + mtbsEndYear.toString() + ' with a burn serverity class of low, moderate, or high',whichLayerList)  
  
  var chartTableDict = {
    'Burn Severity':mtbsQueryClassDict
  }
  return {'NLCD':nlcdObj,
  'MTBS':{'collection':mtbs.set('bounds',clientBoundsDict.All).select([0],['Burn Severity']).set('chartTableDict',chartTableDict)},
  'MTBSSeverityViz':severityViz};
}
function getMTBSandIDS(studyAreaName,whichLayerList){
  if(whichLayerList === null || whichLayerList === undefined){whichLayerList = 'reference-layer-list'};
  var idsCollections = getIDSCollection();
  
    var mtbs_path = 'projects/USFS/DAS/MTBS/BurnSeverityMosaics';
   
  

  // var ned = ee.Image('USGS/NED');
  // var hillshade = ee.Terrain.hillshade(ned);
  // Map2.addLayer(hillshade,{min:0,max:255},'hillshade')
  var nlcd = ee.ImageCollection('USGS/NLCD_RELEASES/2016_REL');
  // Map2.addLayer(ee.Image(0),{min:0,max:0,palette:'000',opacity:0.8});
  [2016].map(function(yr){
    var tcc = nlcd.filter(ee.Filter.calendarRange(yr,yr,'year')).select(['percent_tree_cover']).mosaic();
  Map2.addLayer(tcc.updateMask(tcc.gte(1)).set('bounds',clientBoundsDict.CONUS),{min:1,max:90,palette:palettes.crameri.bamako[50].reverse()},'NLCD Tree Canopy Cover '+yr.toString(),false,null,null, 'NLCD '+yr.toString()+' Tree Canopy Cover',whichLayerList);

  })
  
  
  var idsYr = idsCollections.featureCollection.reduceToImage(['SURVEY_YEA'],ee.Reducer.max()).set('bounds',clientBoundsDict.CONUS);
  var idsCount = idsCollections.featureCollection.reduceToImage(['SURVEY_YEA'],ee.Reducer.count()).selfMask().set('bounds',clientBoundsDict.CONUS);
  Map2.addLayer(idsCount,{'min':1,'max':Math.ceil((idsEndYear-idsStartYear)/2)+1,palette:declineYearPalette},'IDS Survey Count',false,null,null, 'Number of times an area was included in the IDS survey ('+idsStartYear.toString()+'-'+idsEndYear.toString()+')',whichLayerList);
  Map2.addLayer(idsYr,{min:startYear,max:endYear,palette:declineYearPalette},'IDS Most Recent Year Surveyed',false,null,null, 'Most recent year an area was included in the IDS survey ('+idsStartYear.toString()+'-'+idsEndYear.toString()+')',whichLayerList);
  Map2.addLayer(idsCollections.featureCollection.set('bounds',clientBoundsDict.CONUS),{strokeColor:'0FF',layerType:'geeVectorImage'},'IDS Polygons',false,null,null, 'Polygons from the IDS survey ('+idsStartYear.toString()+'-'+idsEndYear.toString()+')',whichLayerList);
  
  // Map2.addLayer(idsCollection.select(['IDS Mort Type']).count().set('bounds',clientBoundsDict.All),{'min':1,'max':Math.floor((idsEndYear-idsStartYear)/4),palette:declineYearPalette},'IDS Mortality Survey Count',false,null,null, 'Number of times an area was recorded as mortality by the IDS survey',whichLayerList);
  // Map2.addLayer(idsCollection.select(['IDS Mort Type Year']).max().set('bounds',clientBoundsDict.All),{min:startYear,max:endYear,palette:declineYearPalette},'IDS Most Recent Year of Mortality',false,null,null, 'Most recent year an area was recorded as mortality by the IDS survey',whichLayerList);
  
  // Map2.addLayer(idsCollection.select(['IDS Defol Type']).count().set('bounds',clientBoundsDict.All),{'min':1,'max':Math.floor((idsEndYear-idsStartYear)/4),palette:declineYearPalette},'IDS Defoliation Survey Count',false,null,null, 'Number of times an area was recorded as defoliation by the IDS survey',whichLayerList);
  // Map2.addLayer(idsCollection.select(['IDS Defol Type Year']).max().set('bounds',clientBoundsDict.All),{min:startYear,max:endYear,palette:declineYearPalette},'IDS Most Recent Year of Defoliation',false,null,null, 'Most recent year an area was recorded as defoliation by the IDS survey',whichLayerList);
  
  var mtbs =getMTBSAndNLCD(studyAreaName,whichLayerList).MTBS.collection
  return [mtbs,idsCollections.imageCollection,idsCollections.featureCollection]
}
function getNAIP(whichLayerList){
  if(whichLayerList === null || whichLayerList === undefined){whichLayerList = 'reference-layer-list'};
  var naipYears = [[2003,2007],
                [2008,2008],
                [2009,2011],
                [2012,2014],
                [2015,2017],
                [2018,2020]];

  var naip = ee.ImageCollection("USDA/NAIP/DOQQ").select([0,1,2],['R','G','B']);
  // naip = naip.map(function(img){
  //   var y = ee.Date(img.get('system:time_start')).get('year');
  //   y = ee.Image(y).rename(['NAIP Year']);
  //   var out = img.addBands(y).copyProperties(img,['system:time_start']);
  //   return out

  // })
  naipYears.map(function(yr){
    
    var naipT = naip.filter(ee.Filter.calendarRange(yr[0],yr[1],'year')).mosaic().byte().set('bounds',clientBoundsDict.CONUS);
   
    Map2.addLayer(naipT,{'addToLegend':false,'min':25,'max':225,'layerType':'geeImage'},'NAIP ' + yr[0].toString()+ '-'+yr[1].toString(),false,null,null,'The National Agriculture Imagery Program (NAIP) acquired aerial imagery from the '+yr[0].toString()+' to the ' + yr[1].toString() +' agricultural growing season in the continental U.S.',whichLayerList);
  });

}
function getHansen(whichLayerList){
  if(whichLayerList === null || whichLayerList === undefined){whichLayerList = 'reference-layer-list'};
  var hansen = ee.Image("UMD/hansen/global_forest_change_2020_v1_8").reproject('EPSG:4326',null,30);

  var hansenClientBoundary = {"type":"Polygon","coordinates":[[[-180,-90],[180,-90],[180,90],[-180,90],[-180,-90]]]};//hansen.geometry().bounds(1000).getInfo();
  // print(hansenClientBoundary);
  var hansenLoss = hansen.select(['lossyear']).selfMask().add(2000).int16();
  var hansenStartYear = 2001;
  var hansenEndYear = 2020;

  if(startYear > hansenStartYear){hansenStartYear = startYear};
  if(endYear < hansenEndYear){hansenEndYear = endYear};
  // console.log([hansenStartYear,hansenEndYear])
  // var hansenYears = ee.List.sequence(hansenStartYear,hansenEndYear);
  // var hansenC =ee.ImageCollection.fromImages(hansenYears.map(function(yr){
  //   yr = ee.Number(yr);
  //   var t = ee.Image(yr).updateMask(hansenLoss.eq(yr)).set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
  //   return t;
  // }));
  // var hansenYearsCli = hansenYears.getInfo();
  // Map2.addTimeLapse(hansenC,{min:startYear,max:endYear,palette:declineYearPalette,years:hansenYearsCli},'Hansen Loss Time Lapse',false,null,null,'Hansen Global Forest Change year of loss',whichLayerList)
  var hansenGain = hansen.select(['gain']);
  hansenLoss = hansenLoss.updateMask(hansenLoss.gte(startYear).and(hansenLoss.lte(endYear)));
  Map2.addLayer(hansenLoss.set('bounds',hansenClientBoundary),{'min':startYear,'max':endYear,'palette':declineYearPalette},'Hansen Loss Year',false,null,null,'Hansen Global Forest Change year of loss',whichLayerList);
  Map2.addLayer(hansenGain.updateMask(hansenGain).set('bounds',hansenClientBoundary),{'min':1,'max':1,'palette':'0A0',addToClassLegend: true,classLegendDict:{'Forest Gain':'0A0'}},'Hansen Gain',false,null,null,'Hansen Global Forest Change gain',whichLayerList);

}
function getNLCD(){
  var nlcd = ee.ImageCollection('USGS/NLCD_RELEASES/2016_REL').select([0]);

  var nlcdForClasses = ee.Image('USGS/NLCD_RELEASES/2016_REL/2011');
  var names = nlcdForClasses.get('landcover_class_names');
  var palette = nlcdForClasses.get('landcover_class_palette');
  var values = nlcdForClasses.get('landcover_class_values').getInfo().map(function(i){return i.toString()});

  var classDict = ee.Dictionary.fromLists(values, palette).getInfo();
  print(classDict);
  var years = nlcd.toList(1000).map(function(i){
    i = ee.Image(i);
    var d = ee.Date(i.get('system:time_start'));
    var y = d.get('year');
    return y;
  }).getInfo();
  var yearsU = [];
  years.map(function(y){if(yearsU.indexOf(y) == -1){yearsU.push(y)}});

  var nlcdMosaic = yearsU.map(function(y){
    var nlcdT = nlcd.filter(ee.Filter.calendarRange(y,y,'year')).mosaic();
    return nlcdT.set('system:time_start',ee.Date.fromYMD(y,6,1).millis());
  });
  nlcdMosaic = ee.ImageCollection(nlcdMosaic);
  Map2.addLayer(nlcdMosaic.mode(),{addToClassLegend: true,classLegendDict:classDict},'NLCD');
}

//---------------Apply thresholds to loss and gain-------------------------------------------------------
function thresholdChange(changeCollection,changeThreshLower,changeThreshUpper,changeDir){
  if(changeDir === undefined || changeDir === null){changeDir = 1}
  var bandNames = ee.Image(changeCollection.first()).bandNames();
  bandNames = bandNames.map(function(bn){return ee.String(bn).cat('_change_year')});
  var change = changeCollection.map(function(img){
    var yr = ee.Date(img.get('system:time_start')).get('year');
    var changeYr = img.multiply(changeDir).gte(changeThreshLower).and(img.multiply(changeDir).lte(changeThreshUpper));
    var yrImage = img.where(img.mask(),yr);
    changeYr = yrImage.updateMask(changeYr).rename(bandNames).int16();
    return img.updateMask(changeYr.mask()).addBands(changeYr);
  });
  return change;
}

//---------------LandTrendr Functions-------------------------------------------------------
function LT_VT_multBands(img, multBy){
    var fitted = img.select('.*_fitted').multiply(multBy);
    var slope = img.select('.*_slope').multiply(multBy);
    var diff = img.select('.*_diff').multiply(multBy);
    var mag = img.select('.*_mag').multiply(multBy);
    var dur = img.select('.*_dur');
    var out = dur.addBands(fitted).addBands(slope).addBands(diff).addBands(mag);
    out  = out.copyProperties(img,['system:time_start'])
              .copyProperties(img);
    return ee.Image(out);
}

function convertStack_To_DurFitMagSlope(stackCollection, VTorLT){
  stackCollection = ee.ImageCollection(stackCollection);
  var stackList = stackCollection.first().bandNames();
  if (stackList.getInfo().indexOf('rmse') >= 0){
    stackList = stackList.remove('rmse');
    stackCollection = stackCollection.select(stackList);
  }  

  // Prep parameters for fitStackToCollection
  var maxSegments = stackCollection.first().get('maxSegments');
  var startYear = stackCollection.first().get('startYear');
  var endYear = stackCollection.first().get('endYear');
  var indexList = ee.Dictionary(stackCollection.aggregate_histogram('band')).keys().getInfo();
  
  //Set up output collection to populate
  var outputCollection; var stack;
  //Iterate across indices
  indexList.map(function(indexName){  
    stack = stackCollection.filter(ee.Filter.eq('band',indexName)).first();
    
    //Convert to image collection
    var yrDurMagSlopeCleaned = fitStackToCollection(stack, 
      maxSegments, 
      startYear, 
      endYear
    ); 

    //Rename
    var bns = ee.Image(yrDurMagSlopeCleaned.first()).bandNames();
    var outBns = bns.map(function(bn){return ee.String(indexName).cat('_'+VTorLT+'_').cat(bn)});  
    yrDurMagSlopeCleaned = yrDurMagSlopeCleaned.select(bns,outBns);
    
    if(outputCollection === undefined){
      outputCollection = yrDurMagSlopeCleaned;
    }else{
      outputCollection = joinCollections(outputCollection,yrDurMagSlopeCleaned,false);
    }  
  });
  return outputCollection;
}

function fitStackToCollection(stack, maxSegments, startYear, endYear){
  
  //Parse into annual fitted, duration, magnitude, and slope images
  //Iterate across each possible segment and find its fitted end value, duration, magnitude, and slope
  var yrDurMagSlope = ee.FeatureCollection(ee.List.sequence(1,maxSegments).map(function(i){
    i = ee.Number(i);

    //Set up slector for left and right side of segments
    var stringSelectLeft = ee.String('.*_').cat(i.byte().format());
    var stringSelectRight = ee.String('.*_').cat((i.add(1)).byte().format());
    
    //Get the left and right bands into separate images
    var stackLeft = stack.select([stringSelectLeft]);
    var stackRight = stack.select([stringSelectRight]);
    
    //Select off the year bands
    var segYearsLeft = stackLeft.select(['yrs_.*']).rename(['year_left']);
    var segYearsRight = stackRight.select(['yrs_.*']).rename(['year_right']);
    
    //Select off the fitted bands 
    var segFitLeft = stackLeft.select(['fit_.*']).rename(['fitted'])
    var segFitRight = stackRight.select(['fit_.*']).rename(['fitted'])
    
    //Compute duration, magnitude, and then slope
    var segDur = segYearsRight.subtract( segYearsLeft).rename(['dur']);
    var segMag = segFitRight.subtract( segFitLeft).rename(['mag']);
    var segSlope = segMag.divide(segDur).rename(['slope']);

    //Iterate across each year to see if the year is within a given segment
    //All annualizing is done from the right vertex backward
    //The first year of the time series is inserted manually with an if statement
    //Ex: If the first segment goes from 1984-1990 and the second from 1990-1997, the duration, magnitude,and slope
    //values from the first segment will be given to 1984-1990, while the second segment (and any subsequent segment)
    //the duration, magnitude, and slope values will be given from 1991-1997
    var annualizedCollection = ee.FeatureCollection(ee.List.sequence(startYear,endYear).map(function(yr){
      yr = ee.Number(yr);
      var yrImage = ee.Image(yr);

      //Find if the year is the first and include the left year if it is
      //Otherwise, do not include the left year
      yrImage = ee.Algorithms.If(yr.eq(startYear),
                  yrImage.updateMask(segYearsLeft.lte(yr).and(segYearsRight.gte(yr))),
                  yrImage.updateMask(segYearsLeft.lt(yr).and(segYearsRight.gte(yr))));
    
      yrImage = ee.Image(yrImage).rename(['yr']).int16();
      
      //Mask out the duration, magnitude, slope, and fit raster for the given year mask
      var yrDur = segDur.updateMask(yrImage);
      var yrMag = segMag.updateMask(yrImage);
      var yrSlope = segSlope.updateMask(yrImage);
      var yrFit = segFitRight.subtract(yrSlope.multiply(segYearsRight.subtract(yr))).updateMask(yrImage);
      
      //Get the difference from the 
      var diffFromLeft =yrFit.subtract(segFitLeft).updateMask(yrImage).rename(['diff']);
      // var relativeDiffFromLeft = diffFromLeft.divide(segMag.abs()).updateMask(yrImage).rename(['rel_yr_diff_left']).multiply(10000);
      
      // var diffFromRight =yrFit.subtract(segFitRight).updateMask(yrImage).rename(['yr_diff_right']);
      // var relativeDiffFromRight = diffFromRight.divide(segMag.abs()).updateMask(yrImage).rename(['rel_yr_diff_right']).multiply(10000)
      //Stack it up
      var out = yrDur.addBands(yrFit).addBands(yrMag).addBands(yrSlope)
                .addBands(diffFromLeft);
      out = out.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
      return out;
    }));
    return annualizedCollection;
  }));
  
  //Convert to an image collection
  yrDurMagSlope = ee.ImageCollection(yrDurMagSlope.flatten());
  
  //Collapse each given year to the single segment with data
  var yrDurMagSlopeCleaned = ee.ImageCollection.fromImages(ee.List.sequence(startYear,endYear).map(function(yr){
    var yrDurMagSlopeT = yrDurMagSlope.filter(ee.Filter.calendarRange(yr,yr,'year')).mosaic();
    return yrDurMagSlopeT.set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
  }));
  return yrDurMagSlopeCleaned;
}
function ltStackToFitted(ltStack,startYear,endYear){
  ltStack = ltStack.updateMask(ltStack.neq(0));
  var yearImg = ltStack.select(['yrs_vert_.*']);
  var fitImg = ltStack.select(['fit_vert_.*']).multiply(0.0001);
  
  var segLength = yearImg.bandNames().length();
  var segList = ee.List.sequence(0,segLength.subtract(1));
  var segListLeft = segList.slice(0,-1);
  var segListRight = segList.slice(1,null);
  
  var yearImgLeft = yearImg.select(segListLeft);
  var yearImgRight = yearImg.select(segListRight);
  
  var fitImgLeft = fitImg.select(segListLeft);
  var fitImgRight = fitImg.select(segListRight);
  
  var fitImgDiff = fitImgRight.subtract(fitImgLeft);
  var yearImgDiff = yearImgRight.subtract(yearImgLeft);
  
  var slope = fitImgDiff.divide(yearImgDiff);
  
  var out = ee.List.sequence(startYear+1,endYear).map(function(yr){
    yr = ee.Number(yr);
    var yearMaskLeft= yearImgLeft.lte(yr);
    var yearMaskRight= yearImgRight.gte(yr);
    var startVertexYear = yearImgLeft.updateMask(yearMaskLeft).reduce(ee.Reducer.max());
    var endVertexYear = yearImgRight.updateMask(yearMaskRight).reduce(ee.Reducer.min());
    
    var segDur = endVertexYear.subtract(startVertexYear);
    var segMag = fitImgDiff.updateMask(yearImgRight.eq(endVertexYear)).reduce(ee.Reducer.firstNonNull());
    
    var slopeT = slope.updateMask(yearImgRight.eq(endVertexYear)).reduce(ee.Reducer.firstNonNull());
    var fitImgRightT= fitImgRight.updateMask(yearImgRight.eq(endVertexYear)).reduce(ee.Reducer.firstNonNull());
    var yearDiffFromStart = ee.Image(yr).subtract(startVertexYear);
    var yearDiffFromEnd = endVertexYear.subtract(yr);
    
    var diffFromVertexStart = yearDiffFromStart.multiply(slopeT);
    var diffFromVertexEnd = yearDiffFromEnd.multiply(slopeT);
    
    var fitted = fitImgRightT.subtract(diffFromVertexEnd);
    return segDur.rename(['dur']).addBands(fitted.rename('fit')).addBands(segMag.rename(['mag'])).addBands(slopeT.rename(['slope'])).addBands(diffFromVertexStart.rename(['diff'])).set('system:time_start',ee.Date.fromYMD(yr,6,1).millis());
  });
  out = ee.ImageCollection.fromImages(out);
  return out;
}
function setupDownloads(studyAreaName){
  // Prep downloads
  console.log('setting up downloads')
    var saDict = lcmsDownloadDict[studyAreaName]
    if(saDict !== undefined){
      var downloads = saDict['downloads'];
      var description = saDict['description'];
      downloads.map(function(url){
        var name = url.substr(url.lastIndexOf('/') + 1);
        addDownload(url,name);
      });
      $('#product-descriptions').attr('href',description);
      $('#product-descriptions').attr('title','Click here for a detailed description of products available for download for chosen area');
    }else{
      addDownload('','No downloads available for chosen study area');
      $('#product-descriptions').attr('href',null);
      $('#product-descriptions').attr('title','No product description available for chosen study area');
    }
    

}
function setupDropdownTreeDownloads(studyAreaName){
  var studyAreas = ['CONUS','SEAK','PRUSVI'];
  var products = {'change':['annual','summary'],'land_cover':['annual'],'land_use':['annual'],'qa_bits':['annual']};
  var saDict = lcmsDownloadDict[studyAreaName]
  if(saDict !== undefined){
    var downloads = saDict['downloads'];
    studyAreas.map(function(sa){
      Object.keys(products).map(function(product){
        products[product].map(function(m){
          try{
            var download_list = downloads[sa][product][m];
            // console.log(download_list)
            var id = `${sa}-${product}-${m}-downloads`;
            var dropdownID = id + '-d';
            // console.log(dropdownID)
            $('#'+id).empty();
            // console.log(id)
            $('#'+id).append(`
              <label  title = 'Choose from list below to download LCMS products. Hold ctrl key to select multiples or shift to select blocks. There can be a small delay before a download will begin, especially over slower networks.' for="${dropdownID}">Select products to download:</label>
                              <select id = "${dropdownID}" size="8" style="height: 100%;" class=" bg-download-select" multiple ></select>
                              <br>
                              <button title = 'Click on this button to start downloads. If you have a popup blocker, you will need the manually click on the download links provided' class = 'btn' onclick = 'downloadSelectedAreas("${dropdownID}")'>Download</button>
                              <hr>`)
            download_list.map(function(url){
              var name = url.substr(url.lastIndexOf('v20') + 8);
              $('#'+dropdownID).append(`<option  value = "${url}">${name}</option>`);
            })
          }catch(err){console.log(err)}
        })
      })
    })
  }
  // $('select').selectpicker();
  // var saDict = lcmsDownloadDict[studyAreaName]
  //   if(saDict !== undefined){
  //     var downloads = saDict['downloads'];
  //     console.log(downloads)
  //     var description = saDict['description'];
  //     // downloads.map(function(url){
  //     //   var name = url.substr(url.lastIndexOf('/') + 1);
  //     //   addDownload(url,name);
  //     // });
  //     // $('#product-descriptions').attr('href',description);
  //     // $('#product-descriptions').attr('title','Click here for a detailed description of products available for download for chosen area');
  //   }else{
  //     addDownload('','No downloads available for chosen study area');
  //     $('#product-descriptions').attr('href',null);
  //     $('#product-descriptions').attr('title','No product description available for chosen study area');
  //   }
}

/////////////////////////////////////////////////////////////////////////////
//-------------------- BEGIN CCDC Helper Functions -------------------//
/////////////////////////////////////////////////////////////////////////////
//Function to predict a CCDC harmonic model at a given time
//The whichHarmonics options are [1,2,3] - denoting which harmonics to include
//Which bands is a list of the names of the bands to predict across
function simpleCCDCPrediction(img,timeBandName,whichHarmonics,whichBands){
  //Unit of each harmonic (1 cycle)
  var omega = ee.Number(2.0).multiply(Math.PI);
  
  //Pull out the time band in the yyyy.ff format
  var tBand = img.select([timeBandName]);
  
  //Pull out the intercepts and slopes
  var intercepts = img.select(['.*_INTP']);
  var slopes = img.select(['.*_SLP']).multiply(tBand);
  
  //Set up the omega for each harmonic for the given time band
  var tOmega = ee.Image(whichHarmonics).multiply(omega).multiply(tBand);
  var cosHarm = tOmega.cos();
  var sinHarm = tOmega.sin();
  
  //Set up which harmonics to select
  var harmSelect = whichHarmonics.map(function(n){return ee.String('.*').cat(ee.Number(n).format())});
  
  //Select the harmonics specified
  var sins = img.select(['.*_SIN.*']);
  sins = sins.select(harmSelect);
  var coss = img.select(['.*_COS.*']);
  coss = coss.select(harmSelect);
  
  //Set up final output band names
  var outBns = whichBands.map(function(bn){return ee.String(bn).cat('_predicted')});
  
  //Iterate across each band and predict value
  var predicted = ee.ImageCollection(whichBands.map(function(bn){
    bn = ee.String(bn);
    return ee.Image([intercepts.select(bn.cat('_.*')),
                    slopes.select(bn.cat('_.*')),
                    sins.select(bn.cat('_.*')).multiply(sinHarm),
                    coss.select(bn.cat('_.*')).multiply(cosHarm)
                    ]).reduce(ee.Reducer.sum());
  })).toBands().rename(outBns);
  return img.addBands(predicted);
}
/////////////////////////////////////////////////////////////
//Wrapper to predict CCDC values from a collection containing a time image and ccdc coeffs
//It is also assumed that the time format is yyyy.ff where the .ff is the proportion of the year
//The whichHarmonics options are [1,2,3] - denoting which harmonics to include
function simpleCCDCPredictionWrapper(c,timeBandName,whichHarmonics){
  var whichBands = ee.Image(c.first()).select(['.*_INTP']).bandNames().map(function(bn){return ee.String(bn).split('_').get(0)});
  whichBands = ee.Dictionary(whichBands.reduce(ee.Reducer.frequencyHistogram())).keys().getInfo();
  var out = c.map(function(img){return simpleCCDCPrediction(img,timeBandName,whichHarmonics,whichBands)});
  return out;
}
////////////////////////////////////////////////////////////////////////////////////////
function simpleGetTimeImageCollection(startYear,endYear,step){
  var yearImages = ee.ImageCollection(ee.List.sequence(startYear,endYear,step).map(function(n){
    n = ee.Number(n);
    var img = ee.Image(n).float().rename(['year']);
    var y = n.int16();
    var fraction = n.subtract(y);
    var d = ee.Date.fromYMD(y,1,1).advance(fraction,'year').millis();
    return img.set('system:time_start',d);
  }));
  return yearImages
}
////////////////////////////////////////////////////////////////////////////////////////
//Function to get the coeffs corresponding to a given date on a pixel-wise basis
//The raw CCDC image is expected
//It is also assumed that the time format is yyyy.ff where the .ff is the proportion of the year
function getCCDCSegCoeffs(timeImg,ccdcImg,fillGaps){
  var coeffKeys = ['.*_coefs'];
  var tStartKeys = ['tStart'];
  var tEndKeys = ['tEnd'];
  var tBreakKeys = ['tBreak'];
  
  //Get coeffs and find how many bands have coeffs
  var coeffs = ccdcImg.select(coeffKeys);
  var bns = coeffs.bandNames();
  var nBns = bns.length();
  var harmonicTag = ee.List(['INTP','SLP','COS1','SIN1','COS2','SIN2','COS3','SIN3']);

   
  //Get coeffs, start and end times
  coeffs = coeffs.toArray(2);
  var tStarts = ccdcImg.select(tStartKeys);
  var tEnds = ccdcImg.select(tEndKeys);
  var tBreaks = ccdcImg.select(tBreakKeys);
  
  //If filling to the tBreak, use this
  tStarts = ee.Image(ee.Algorithms.If(fillGaps,tStarts.arraySlice(0,0,1).arrayCat(tBreaks.arraySlice(0,0,-1),0),tStarts));
  tEnds = ee.Image(ee.Algorithms.If(fillGaps,tBreaks.arraySlice(0,0,-1).arrayCat(tEnds.arraySlice(0,-1,null),0),tEnds));
  
  
  //Set up a mask for segments that the time band intersects
  var tMask = tStarts.lt(timeImg).and(tEnds.gte(timeImg)).arrayRepeat(1,1).arrayRepeat(2,1);
  coeffs = coeffs.arrayMask(tMask).arrayProject([2,1]).arrayTranspose(1,0).arrayFlatten([bns,harmonicTag]);
  
  //If time band doesn't intersect any segments, set it to null
  coeffs = coeffs.updateMask(coeffs.reduce(ee.Reducer.max()).neq(0));
  
  return timeImg.addBands(coeffs);
}
////////////////////////////////////////////////////////////////////////////////////////
//      Functions for Annualizing CCDC:

////////////////////////////////////////////////////////////////////////////////////////
//Wrapper function for predicting CCDC across a set of time images
function predictCCDC(ccdcImg,timeImgs,fillGaps,whichHarmonics){//,fillGapBetweenSegments,addRMSE,rmseImg,nRMSEs){
  var timeBandName = ee.Image(timeImgs.first()).select([0]).bandNames().get(0);
  // Add the segment-appropriate coefficients to each time image
  timeImgs = timeImgs.map(function(img){return getCCDCSegCoeffs(img,ccdcImg,fillGaps)});

  //Predict across each time image
  return simpleCCDCPredictionWrapper(timeImgs,timeBandName,whichHarmonics);
}
////////////////////////////////////////////////////////////////////////////////////////
//Function for getting change years and magnitudes for a specified band from CCDC outputs
//Only change from the breaks is extracted
//As of now, if a segment has a high slope value, this method will not extract that 
function ccdcChangeDetection(ccdcImg,bandName){
  var magKeys = ['.*_magnitude'];
  var tBreakKeys = ['tBreak'];
  var changeProbKeys = ['changeProb'];
  var changeProbThresh = 1;
  //Pull out pieces from CCDC output
  var magnitudes = ccdcImg.select(magKeys);
  var breaks = ccdcImg.select(tBreakKeys);
  
  // Map.addLayer(breaks.arrayLength(0),{min:1,max:10});
  var changeProbs = ccdcImg.select(changeProbKeys);
  var changeMask = changeProbs.gte(changeProbThresh);
  magnitudes = magnitudes.select(bandName + '.*');

  
  //Sort by magnitude and years
  var breaksSortedByMag = breaks.arraySort(magnitudes);
  var magnitudesSortedByMag = magnitudes.arraySort();
  var changeMaskSortedByMag = changeMask.arraySort(magnitudes);
  
  var breaksSortedByYear = breaks.arraySort();
  var magnitudesSortedByYear = magnitudes.arraySort(breaks);
  var changeMaskSortedByYear = changeMask.arraySort(breaks);
  
  //Get the loss and gain years and magnitudes for each sorting method
  var highestMagLossYear = breaksSortedByMag.arraySlice(0,0,1).arrayFlatten([['loss_year']]);
  var highestMagLossMag = magnitudesSortedByMag.arraySlice(0,0,1).arrayFlatten([['loss_mag']]);
  var highestMagLossMask = changeMaskSortedByMag.arraySlice(0,0,1).arrayFlatten([['loss_mask']]);
  
  highestMagLossYear = highestMagLossYear.updateMask(highestMagLossMag.lt(0).and(highestMagLossMask));
  highestMagLossMag = highestMagLossMag.updateMask(highestMagLossMag.lt(0).and(highestMagLossMask));
  
  var highestMagGainYear = breaksSortedByMag.arraySlice(0,-1,null).arrayFlatten([['gain_year']]);
  var highestMagGainMag = magnitudesSortedByMag.arraySlice(0,-1,null).arrayFlatten([['gain_mag']]);
  var highestMagGainMask = changeMaskSortedByMag.arraySlice(0,-1,null).arrayFlatten([['gain_mask']]);
  
  highestMagGainYear = highestMagGainYear.updateMask(highestMagGainMag.gt(0).and(highestMagGainMask));
  highestMagGainMag = highestMagGainMag.updateMask(highestMagGainMag.gt(0).and(highestMagGainMask));
  
  var mostRecentLossYear = breaksSortedByYear.arraySlice(0,0,1).arrayFlatten([['loss_year']]);
  var mostRecentLossMag = magnitudesSortedByYear.arraySlice(0,0,1).arrayFlatten([['loss_mag']]);
  var mostRecentLossMask = changeMaskSortedByYear.arraySlice(0,0,1).arrayFlatten([['loss_mask']]);
  
  mostRecentLossYear = mostRecentLossYear.updateMask(mostRecentLossMag.lt(0).and(mostRecentLossMask));
  mostRecentLossMag = mostRecentLossMag.updateMask(mostRecentLossMag.lt(0).and(mostRecentLossMask));
  
  var mostRecentGainYear = breaksSortedByYear.arraySlice(0,-1,null).arrayFlatten([['gain_year']]);
  var mostRecentGainMag = magnitudesSortedByYear.arraySlice(0,-1,null).arrayFlatten([['gain_mag']]);
  var mostRecentGainMask = changeMaskSortedByYear.arraySlice(0,-1,null).arrayFlatten([['gain_mask']]);
  
  mostRecentGainYear = mostRecentGainYear.updateMask(mostRecentGainMag.gt(0).and(mostRecentGainMask));
  mostRecentGainMag = mostRecentGainMag.updateMask(mostRecentGainMag.gt(0).and(mostRecentGainMask));
  
  return {mostRecent:{
    loss:{year:mostRecentLossYear,
          mag: mostRecentLossMag
        },
    gain:{year:mostRecentGainYear,
          mag: mostRecentGainMag
        }
    },
    highestMag:{
    loss:{year:highestMagLossYear,
          mag: highestMagLossMag
        },
    gain:{year:highestMagGainYear,
          mag: highestMagGainMag
        }
    }    
  };
  
}

function getSelectLayers(short){
  var perims = ee.FeatureCollection('projects/gtac-mtbs/assets/perimeters/mtbs_perims_DD');//ee.FeatureCollection('projects/USFS/DAS/MTBS/mtbs_perims_DD');
  perims = perims.map(function(f){
    var d = ee.Date(f.get('Ig_Date'));
    
    return f.set({'Year':d.get('year')})
  })
  // perims = ee.FeatureCollection(perims.copyProperties(mtbs,['bounds']));
  // console.log(perims.get('bounds').getInfo())
  perims = perims.filter(ee.Filter.gte('Year',startYear));
  perims = perims.filter(ee.Filter.lte('Year',endYear));
  var huc4 = ee.FeatureCollection('USGS/WBD/2017/HUC04');
  var huc8 = ee.FeatureCollection('USGS/WBD/2017/HUC08');
  var huc12 = ee.FeatureCollection('USGS/WBD/2017/HUC12');
  var wdpa = ee.FeatureCollection("WCMC/WDPA/current/polygons");
  var wilderness = wdpa.filter(ee.Filter.eq('DESIG', 'Wilderness'));
  var counties = ee.FeatureCollection('TIGER/2018/Counties');
  var tiles  = ee.FeatureCollection("users/jdreynolds33/Zones_New");
  var bia = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/bia_bounds_2017');
  var ecoregions_subsections = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/Baileys_Ecoregions_Subsections');
  ecoregions_subsections = ecoregions_subsections.select(['MAP_UNIT_N'], ['NAME'], true);
  var ecoregions = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/Baileys_Ecoregions');
  ecoregions = ecoregions.select(['SECTION'],['NAME'])
  var ecoregionsEPAL4 = ee.FeatureCollection('EPA/Ecoregions/2013/L4');
  var district_boundaries = ee.FeatureCollection('projects/USFS/LCMS-NFS/CONUS-Ancillary-Data/FS_District_Boundaries');
  district_boundaries = district_boundaries.select(['DISTRICTNA'],['name']);
  var msas = ee.FeatureCollection('projects/lcms-292214/assets/CONUS-Ancillary-Data/TIGER_Urban_Areas_2018');
  var msas2 = ee.FeatureCollection('projects/lcms-292214/assets/CONUS-Ancillary-Data/TIGER_MSA_2019')
  if(short === null || short === undefined || short === false){
    // Map2.addSelectLayer(tiles,{strokeColor:'BB0',layerType:'geeVectorImage'},'TCC Processing Tiles',false,null,null,'TCC Processing Tiles. Turn on layer and click on any area wanted to include in chart');

    Map2.addSelectLayer(bia,{strokeColor:'0F0',layerType:'geeVectorImage'},'BIA Boundaries',false,null,null,'BIA boundaries. Turn on layer and click on any area wanted to include in chart');

    Map2.addSelectLayer(huc12,{strokeColor:'00F',layerType:'geeVectorImage'},'HUC 12',false,null,null,'HUC 12 watershed boundaries. Turn on layer and click on any HUC 12 wanted to include in chart');
    
    Map2.addSelectLayer(ecoregions,{strokeColor:'8F8',layerType:'geeVectorImage'},"Baileys Ecoregions Sections",false,null,null,'Baileys ecoregion sections. Turn on layer and click on any ecoregion wanted to include in chart');
    
    Map2.addSelectLayer(ecoregions_subsections,{strokeColor:'8F0',layerType:'geeVectorImage'},"Baileys Ecoregions Subsections",false,null,null,'Baileys ecoregions subsections. Turn on layer and click on any ecoregion wanted to include in chart');
    Map2.addSelectLayer(ee.FeatureCollection("EPA/Ecoregions/2013/L3"),{strokeColor:'8F8',layerType:'geeVectorImage'},"Level 3 EPA Ecoregions",false,null,null,'Omernik and Griffith 2014 Level 3 EPA Ecoregions. Turn on layer and click on any ecoregion wanted to include in chart');
    Map2.addSelectLayer(ee.FeatureCollection("EPA/Ecoregions/2013/L4"),{strokeColor:'8FD',layerType:'geeVectorImage'},"Level 4 EPA Ecoregions",false,null,null,'Omernik and Griffith 2014 Level 4 EPA Ecoregions. Turn on layer and click on any ecoregion wanted to include in chart');
    
    
    // Map2.addSelectLayer(usfs_regions,{strokeColor:'0F0',layerType:'geeVectorImage'},'National Forest Regions',false,null,null,'National Forest regional boundaries. Turn on layer and click on any Region wanted to include in chart');

    
    // Map2.addSelectLayer(wilderness,{strokeColor:'80F',layerType:'geeVectorImage'},'Wilderness',false,null,null,'Wilderness boundaries. Turn on layer and click on any winderness wanted to include in chart');
    
    // Map2.addSelectLayer(b,{strokeColor:'00F',layerType:'geeVectorImage'},'National Forests2',false,null,null,'National Forest boundaries. Turn on layer and click on any Forest wanted to include in chart');
    
    // Map2.addSelectLayer(nps,{strokeColor:'F0F',layerType:'geeVectorImage'},'National Parks',false,null,null,'National Park boundaries. Turn on layer and click on any Park wanted to include in chart');

    

    Map2.addSelectLayer(otherLands,{strokeColor:'DD0',layerType:'geeVectorImage'},'Other Designated Lands',false,null,null,'A boundary within which National Forest System land parcels have managment or use limits placed on them by legal authority. Examples are: National Recreation Area, National Monument, and National Game Refuge. Turn on layer and click on any Park wanted to include in chart');
    Map2.addSelectLayer(ee.FeatureCollection("TIGER/2018/States"),{strokeColor:'AD0',layerType:'geeVectorImage'},'US States and Territories',false,null,null,'2018 TIGER state and territory boundaries for the United States. Turn on layer and click on any state/territory wanted to include in chart');
  }
  Map2.addSelectLayer(counties,{strokeColor:'08F',layerType:'geeVectorImage'},'US Counties',false,null,null,'US Counties from 2018 TIGER data. Turn on layer and click on any county wanted to include in chart');

  Map2.addSelectLayer(msas,{strokeColor:'88F',layerType:'geeVectorImage'},'US Census Urban Areas',false,null,null,'TIGER, 2018, U.S. Urban Areas (https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_us_ua10_500k.zip). Turn on layer and click on any county wanted to include in chart');
  // Map2.addSelectLayer(msas2,{strokeColor:'88F',layerType:'geeVectorImage'},'US Census Urban Areas',false,null,null,'TIGER, 2018, U.S. MSAs  (https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_us_ua10_500k.zip). Turn on layer and click on any county wanted to include in chart');
  Map2.addSelectLayer(nps,{strokeColor:'F0F',layerType:'geeVectorImage'},'National Parks',false,null,null,'National Park boundaries. Turn on layer and click on any Park wanted to include in chart');
  Map2.addSelectLayer(b,{strokeColor:'00F',layerType:'geeVectorImage'},'National Forests',false,null,null,'National Forest boundaries. Turn on layer and click on any Forest wanted to include in chart');
  
  Map2.addSelectLayer(district_boundaries,{strokeColor:'80F',layerType:'geeVectorImage'},'National Forest Districts',false,null,null,'National Forest District boundaries. Turn on layer and click on any Forest wanted to include in chart');
  Map2.addSelectLayer(perims,{strokeColor:'808',layerType:'geeVectorImage'},'MTBS Fires',false,null,null,'Delineated perimeters of each MTBS mapped fire from '+startYear.toString()+'-'+endYear.toString()+'. Turn on layer and click on any fire wanted to include in chart');
  
}