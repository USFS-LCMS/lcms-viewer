/*List global variables in this script for use throughout the viewers*/
let urlParamsObj = {};pageUrl = document.URL;tinyURL = '';urlParams = {};

function setUrl(url){
  const obj = { Title: 'test', Url: url };
  history.pushState(obj, obj.Title, obj.Url);
}
function baseUrl(){
  return window.location.protocol + "//" + window.location.host  + window.location.pathname;
}
function eliminateSearchUrl(){
  setUrl(baseUrl());
}
function updatePageUrl(){
  pageUrl = window.location.protocol + "//" + window.location.host  + window.location.pathname + constructUrlSearch();
}
var fullShareURL;
function TweetThis(preURL='',postURL='',openInNewTab=false,showMessageBox=true){
    updatePageUrl();
    

    $.get(
        "https://tinyurl.com/api-create.php",
        {url: pageUrl},
        function(tinyURL){
            let key = tinyURL.split('https://tinyurl.com/')[1];
            let shareURL = pageUrl.split('?')[0] + '?id='+key;
            let fullURL = preURL+shareURL+postURL;
            // console.log(fullURL);
            ga('send', 'event', mode + '-share', pageUrl, shareURL);
            console.log('shared');
            if(openInNewTab){
               let win = window.open(fullURL, '_blank');
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
            }else{
              fullShareURL=fullURL
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
      $('#'+messageBoxId).html("Copied text to clipboard");
    }
}
function parseUrlSearch(){
  // console.log(window.location.search == '')
    let urlParamsStr = window.location.search;
      console.log(urlParamsStr);
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
          urlParams[str.split('=')[0]] = str.split('=')[1];
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
let cachedSettingskey = 'settings';
let startYear = 1985;
let endYear = 2021;
let startJulian = 153;//190;
let endJulian = 274;//250;
let layerObj = null;
let crs = 'EPSG:5070';
let transform = null;
let scale = 30;
let queryObj = {},timeLapseObj = {};dashboardObj={};
let addLCMSTimeLapsesOn;
parseUrlSearch();
let initialCenter = [37.5334105816903,-105.6787109375];
let initialZoomLevel = 5;
let studyAreaSpecificPage = false;
const studyAreaDict = {
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
                }

////////////////////////////////////////////////////////////////////////////////
/*Initialize parameters for loading study area when none is chosen or chached*/
let defaultStudyArea = 'USFS LCMS 1984-2020';
let studyAreaName = studyAreaDict[defaultStudyArea].name;
let longStudyAreaName = defaultStudyArea;
let cachedStudyAreaName = null;
let viewBeta = 'yes';

let lowerThresholdDecline = studyAreaDict[defaultStudyArea].lossThresh;
let upperThresholdDecline = 1.0;
let lowerThresholdRecovery = studyAreaDict[defaultStudyArea].gainThresh;
let upperThresholdRecovery = 1.0;

let lowerThresholdSlowLoss = studyAreaDict[defaultStudyArea].lossSlowThresh;
let upperThresholdSlowLoss = 1.0;
let lowerThresholdFastLoss = studyAreaDict[defaultStudyArea].lossFastThresh;
let upperThresholdFastLoss = 1.0;
if(lowerThresholdSlowLoss === undefined){lowerThresholdSlowLoss = lowerThresholdDecline}
if(lowerThresholdFastLoss === undefined){lowerThresholdFastLoss = lowerThresholdDecline} 

 
/*Set up some boundaries of different areas to zoom to*/
const clientBoundsDict = {'All':{"geodesic": false,"type": "Polygon","coordinates": [[[-169.215141654273, 71.75307977193499],
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
let toExport;
let exportArea;
let taskCount = 0;//Keeping track of the number of export tasks each session submitted
let canAddToMap = true;//Set whether addToMap function can add to the map
let canExport = false;//Set whether exports are allowed
let colorRampIndex = 1;
let NEXT_LAYER_ID = 1,layerChildID = 0;
let layerCount = 0,refreshNumber = 0;
let uri,uriName,csvName,dataTable,chartOptions,infowindow,queryGeoJSON,marker,mtbsSummaryMethod;


const selectedFeaturesJSON = {};
const selectionTracker = {};

let selectionUNID = 1;

let updateViewList = true;
let viewList = [];
let viewIndex = 0;

let outputURL;
let tableConverter = null;
let groundOverlayOn = false;

let chartIncludeDate = true,chartCollection,pixelChartCollections = {},areaChartCollections = {},queryClassDict = {},exportImage,exportVizParams,eeBoundsPoly,shapesMap;
var whichPixelChartCollection,whichAreaChartCollection;
let mouseLat,mouseLng,area = 0,distance = 0,areaPolygon,markerList = [],distancePolylineT,clickCoords,distanceUpdater;
let updateArea,updateDistance,areaPolygonObj = {},udpPolygonObj = {},udpPolygonNumber = 1,mapHammer,chartMTBS,chartMTBSByNLCD,chartMTBSByAspect;

let walkThroughAdded = false;
let distancePolyline;
const distancePolylineOptions = {
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

let polyNumber = 1,polyOn = false;


const areaPolygonOptions = {
              strokeColor:'#FF0',
                fillOpacity:0.2,
              strokeOpacity: 1,
              strokeWeight: 3,
              draggable: true,
              editable: true,
              geodesic:true,
              polyNumber: polyNumber
            
            };

let userDefinedI = 1;

const udpOptions = {
          strokeColor:'#FF0',
            fillOpacity:0.2,
          strokeOpacity: 1,
          strokeWeight: 3,
          draggable: true,
          editable: true,
          geodesic:true,
          polyNumber: 1
        };
const exportAreaPolylineOptions = {
          strokeColor:'#FF0',
            fillOpacity:0.2,
          strokeOpacity: 1,
          strokeWeight: 3,
          draggable: true,
          editable: true,
          geodesic:true,
          polyNumber: 1
        };
const exportAreaPolygonOptions = {
          strokeColor:'#FF0',
            fillOpacity:0.2,
          strokeOpacity: 1,
          strokeWeight: 3,
          draggable: false,
          editable: false,
          geodesic:true,
          polyNumber: 1
        };
let exportImageDict = {};
let featureObj = {},geeRunID,outstandingGEERequests = 0,geeTileLayersDownloading = 0;

let plotDictID = 1,exportID = 1;


const unitMultiplierDict = {imperial:
{area:[10.7639,0.000247105],distance:[3.28084,0.000621371]},
metric:
{area:[1,0.0001],distance:[1,0.001]}};

const unitNameDict = {imperial:
{area:['ft<sup>2</sup>','acres'],distance:['ft','miles']},
metric:
{area:['m<sup>2</sup>','hectares'],distance:['m','km']}};


//Chart variables
let plotRadius = 15;
let plotScale = 30;
var areaChartFormat = 'Percentage';
const areaChartFormatDict = {'Percentage': {'mult':100,'label':'% Area'}, 'Acres': {'mult':0.000247105,'label':'Acres'}, 'Hectares': {'mult':0.0001,'label':'Hectares'}};

let areaGeoJson;
let areaChartingCount = 0;
let center;let globalChartValues;



//Chart color properties
let chartColorI = 0;
let chartColorsDict = {
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

let chartColors = chartColorsDict.standard;


//Dictionary of zoom level map scales
const zoomDict = {20 : '1,128.49',
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

// See https://github.com/google/earthengine-api/blob/327fd96cf4fefda30c8a0d5da62d18c1d6844ea5/javascript/src/ee.js#L76 for param info for initializing to GEE
// Allow GEE to be initialized either using a server-side proxy or an access token
if(urlParams.geeAuthProxyURL == null || urlParams.geeAuthProxyURL == undefined){
    urlParams.geeAuthProxyURL = "https://rcr-ee-proxy-2.herokuapp.com";
    
}
let authProxyAPIURL = urlParams.geeAuthProxyURL;
let geeAPIURL = "https://earthengine.googleapis.com";

if(urlParams.accessToken !== null && urlParams.accessToken !== undefined && urlParams.accessToken !== 'null' && urlParams.accessToken !== 'None'){
    authProxyAPIURL = null;
    geeAPIURL = null;
    ee.data.setAuthToken('', 'Bearer', urlParams.accessToken, 3600, [], undefined, false);
}


var plotsOn = false;

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

Number.prototype.formatNumber = function(n=2){
  return this.toFixed(n).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
//Taken from: https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript 
String.prototype.toTitle = function() {
  return this.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase() });
}

//Function to produce monthDayNumber monthName year format date string
Date.prototype.toStringFormat = function(){
  const  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const yr = this.getFullYear();
  const month = months[this.getMonth()];
  const day = this.getDate();
  return `${day} ${month} ${yr}`;
}
//
//Taken from: https://stackoverflow.com/questions/22015684/how-do-i-zip-two-arrays-in-javascript
const zip = (a, b) => a.map((k, i) => [k, b[i]]);

//Taken from: https://stackoverflow.com/questions/11688692/how-to-create-a-list-of-unique-items-in-javascript
function unique(arr) {
    let u = {}, a = [];
    for(let i = 0, l = arr.length; i < l; ++i){
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
}

function convertRemToPixels(rem) {    
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}
function sleepFor(sleepDuration){
  var now = new Date().getTime();
  while(new Date().getTime() < now + sleepDuration){ 
      /* Do nothing */ 
  }
}