//Wrapper for mapping functions
///////////////////////////////////////////////////////////////////
//Set up some globals
var mapDiv = document.getElementById('map');

tableConverter = function(dataTableT){

  // var x = [dataTableT[0]]
  // x[0][0] = 'Year'
  // dataTableT.slice(1).map(function(i){
    
  //   i[0] = (i[0].getYear()+1900).toString()
  //   x.push(i)
  // })
  // dataTableT   = x
var lcDict = {
  '0': 'No data',
'1': 'Barren',
'2': 'Grass/forb/herb',
'3': 'Impervious',
'4': 'Shrubs',
'5': 'Snow/ice',
'6': 'Trees',
'7': 'Water'
};

var luDict = {
  '0': 'No data',
'1': 'Agriculture',
'2': 'Developed',
'3': 'Forest',
'4': 'Non-forest wetland',
'5': 'Other',
'6': 'Rangeland'
};

var cpDict = {
  '0': 'No Data',
  '1': 'Stable',
  '2':'Growth/recovery',
  '3': 'Fire',
  '4': 'Harvest',
  '5': 'Other'
}

  // if(dataTableT[0].length > 5){
  if(analysisMode === 'advanced'){
    // console.log('convertinggggggg tabbbbbbbble' );
    var isFirst = true;
    dataTableT = dataTableT.map(function(i){if(isFirst === false){i[3] = lcDict[Math.round(i[3]*10)]};isFirst = false;return i});
    var isFirst = true;
    dataTableT = dataTableT.map(function(i){if(isFirst === false){i[4] = luDict[Math.round(i[4]*10)]};isFirst = false;return i});
    var isFirst = true;
    // dataTableT = dataTableT.map(function(i){if(isFirst === false){i[5] = cpDict[parseInt(i[5]*10)]};isFirst = false;return i});
//       dataTableT = dataTableT.map(function(i){i[2] = cdlDict[i[2]];return i})
  }
  

      return dataTableT
    };



infowindow = new google.maps.InfoWindow({
               content : '',
                maxWidth: 300,
                pixelOffset: new google.maps.Size(30,-30,'rem','rem'),
                close:false
              });
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
function arrayColumn(arr,i){return arr.map(function(r){return r[i]})};
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

//Function for centering map
function centerMap(lng,lat,zoom){
    map.setCenter({lat:lat,lng:lng});
    map.setZoom(zoom);
}
function centerObject(fc){
  try{
    fc.geometry().bounds().evaluate(function(feature){
    var bounds = new google.maps.LatLngBounds(); 
    
    feature.coordinates[0].map(function(latlng){
     bounds.extend({lng:latlng[0], lat:latlng[1]});
    });

    map.fitBounds(bounds);
    });
    
    
  }
  catch(err){
    // alert('Bad Fusion Table');
    console.log(err);
   
  }
  
}




//Function for creating color ramp generally for a map legend
function createColorRamp(styleName, colorList, width,height){
    var myCss = 
        
        "background-image:linear-gradient(to right, ";
     
    for(var i = 0; i< colorList.length;i++){myCss = myCss + '#'+colorList[i].toLowerCase() + ',';}
    myCss = myCss.slice(0,-1) + ");";



return myCss
}
//////////////////////////////////////////////////////
//Function to convert csv, kml, shp to geoJSON
function convertToGeoJSON(formID){
  var url = 'https://ogre.adc4gis.com/convert'

  var data = new FormData();
  data.append("targetSrs","EPSG:4326");
// data.append("sourceSrs",'');
  jQuery.each(jQuery('#'+formID)[0].files, function (i, file) {
   
    data.append("upload", file);
  });
  
  var out= $.ajax({
    type: 'POST',
    url: url,
    data: data,
    processData: false,
    contentType: false
  });
  
  
  return out;
}

//////////////////////////////////////////////////////
//Wrappers for printing and printing to console
function printImage(message){print(message)};
function print(message){
    console.log(message)
}
/////////////////////////////////////////////////////
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
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
function addPlot(latLng){
  // plotDict[plotDictID] = false;
 
  var ptElement = document.createElement("ee-pt");
  
  ptElement.name = latLng;
  // print(latLng);
  ptElement.ID = plotDictID;
  // ptElement.isOn = false;
  var ptList = document.querySelector("pt-list");
    ptList.insertBefore(ptElement,ptList.firstChild);
   plotDictID ++;
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
//Taken from: https://stackoverflow.com/questions/2116558/fastest-method-to-replace-all-instances-of-a-character-in-a-string
String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 
/////////////////////////////////////
function addExport(eeImage,name,res,Export,metadataParams){

  var exportElement = document.createElement("ee-export");
  if(metadataParams === null || metadataParams === undefined){
    metadataParams = {'studyAreaName':studyAreaName,'version':'v2019.1','summaryMethod':summaryMethod,'whichOne':'Gain Year','startYear':startYear,'endYear':endYear,'description':'this is a description'}
  }
  if(Export === null || Export === undefined){
    Export = true;
  }
  
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
  
  exportImageDict[exportID] = {'eeImage':eeImage,'name':name,'res':res,'shouldExport':Export,'metadataParams':metadataParams}
  var exportList = document.querySelector("export-list");
    exportList.insertBefore(exportElement,exportList.firstChild);
  exportID ++;
}
function addImageDownloads(imagePathJson){
  
}
/////////////////////////////////////////////////////
//Function to add ee object ot map
function addRasterToMap(item,viz,name,visible,label,fontColor,helpBox,whichLayerList){
    if(whichLayerList === null || whichLayerList === undefined){whichLayerList = "layer-list"}
    // print(item.getInfo().type)
    // if(item.getInfo().type === 'ImageCollection'){print('It is a collection')}
    if(name == null){
        name = "Layer "+NEXT_LAYER_ID;
        NEXT_LAYER_ID += 1;
    }
    name = name.replaceAll(' ','-');
    name = name.replaceAll('(','-');
    name = name.replaceAll(')','-');
    if(visible == null){
        visible = true;
    }
    if(viz.opacity == null){
      viz.opacity = 1;
    }
    
    var layerObjKeys = Object.keys(layerObj);
    var nameIndex = layerObjKeys.indexOf(name);
    if(nameIndex   != -1){
      visible = layerObj[name][0];
      viz.opacity = layerObj[name][1];
    }

    if(helpBox == null){helpBox = ''};
    var layer = document.createElement("ee-layer");
    layer.ID = NEXT_LAYER_ID;
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
    // layer.viz = JSON.stringify(viz);
    // layer.viz  = viz;

    // if(viz.min !== null && viz.min !== undefined){
    //   layer.min = viz.min;
    // }
    // else{layer.min = 0;}
    
    if(viz != null && viz.bands == null && viz.addToLegend != false && viz.addToClassLegend != true){
        var legendItemContainer = document.createElement("legend-item");

        legendItemContainer.setAttribute("id", name);


        // var legendBreak = document.createElement("legend-break");
     
 
      // legendItemContainer.insertBefore(legendBreak,legendItemContainer.firstChild);

        var legend = document.createElement("ee-legend");
        legend.name = name;
        legend.helpBoxMessage = helpBox
        if(viz.palette != null){
            var palette = viz.palette;
        } else{var palette = '000,FFF';}
        var paletteList = palette.split(',');
        if(paletteList.length == 1){paletteList = [paletteList[0],paletteList[0]];}
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
        if(legend.min ==null){legend.min = 'min'};
        if(legend.max ==null){legend.max = 'max'};
    
    if(fontColor != null){legend.fontColor = "color:#" +fontColor + ";" }
        else{legend.fontColor    = "color:#DDD;"}
     
    var legendList = document.querySelector("legend-list");
    legendItemContainer.insertBefore(legend,legendItemContainer.firstChild);
    legendList.insertBefore(legendItemContainer,legendList.firstChild);

    
    }

    else if(viz != null && viz.bands == null && viz.addToClassLegend == true){

      var legendItemContainer = document.createElement("legend-item");
      legendItemContainer.setAttribute("id", name);
      // var legendBreak = document.createElement("legend-break");
     
       // var legendList = document.querySelector("legend-list");
      // legendItemContainer.insertBefore(legendBreak,legendItemContainer.firstChild);

      var legendKeys = Object.keys(viz.classLegendDict).reverse();
      legendKeys.map(function(lk){

        var legend = document.createElement("ee-class-legend");
        legend.name = name;
        legend.helpBoxMessage = helpBox;

        legend.classColor = viz.classLegendDict[lk];
        legend.className = lk;

        // var legendList = document.querySelector("legend-list");
        legendItemContainer.insertBefore(legend,legendItemContainer.firstChild);
      })

      var title = document.createElement("ee-class-legend-title");
      title.name = name;
      title.helpBoxMessage = helpBox;
      var legendList = document.querySelector("legend-list");
      legendItemContainer.insertBefore(title,legendItemContainer.firstChild);
      legendList.insertBefore(legendItemContainer,legendList.firstChild);
     
    }

   
    layer.visible = visible;
    layer.item = item;
    layer.name = name;
    layer.addToLayerObj(name,visible,item);
    var layerList = document.querySelector(whichLayerList);
    
    
    layerList.insertBefore(layer,layerList.firstChild);
    layerCount ++;
    item.getMap(viz,function(eeLayer){
        layer.setLayer(eeLayer);layer.setOpacity(layer.opacity,item);
    });
}

//////////////////////////////////////////////////////
function standardTileURLFunction(url,xThenY){
              if(xThenY === null || xThenY === undefined  ){xThenY  = false;}
              return function(coord, zoom) {
                    // "Wrap" x (logitude) at 180th meridian properly
                    // NB: Don't touch coord.x because coord param is by reference, and changing its x property breakes something in Google's lib 
                    var tilesPerGlobe = 1 << zoom;
                    var x = coord.x % tilesPerGlobe;
                    if (x < 0) {
                        x = tilesPerGlobe+x;
                    }
                    // Wrap y (latitude) in a like manner if you want to enable vertical infinite scroll
                    // return "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/" + zoom + "/" + x + "/" + coord.y + "?access_token=pk.eyJ1IjoiaWhvdXNtYW4iLCJhIjoiY2ltcXQ0cnljMDBwNHZsbTQwYXRtb3FhYiJ9.Sql6G9QR_TQ-OaT5wT6f5Q"
                    if(xThenY ){
                        return url+ zoom + "/" + x + "/" + coord.y +".png?";
                    }
                    else{return url+ zoom + "/" + coord.y + "/" +x  +".png?";}//+ (new Date()).getTime();
                    
                }
            }
/////////////////////////////////////////////////////
//Function to add ee object ot map
function addRESTToMap(tileURLFunction,name,visible,maxZoom,helpBox,whichLayerList){
  var viz = {};var item = ee.Image();
  if(whichLayerList === null || whichLayerList === undefined){whichLayerList = "layer-list"}
    // print(item.getInfo().type)
    // if(item.getInfo().type === 'ImageCollection'){print('It is a collection')}
    if(name === null || name === undefined){
        name = "Layer "+NEXT_LAYER_ID;
        NEXT_LAYER_ID += 1;
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
function getGroundOverlay(baseUrl,minZoom){
  if(map.getZoom()>=minZoom){

  var mapHeight = $('#map').height();
  var mapWidth = $('#map').width();

   var bounds = map.getBounds();
  var keys = Object.keys(bounds);
  var keysX = Object.keys(bounds[keys[0]]);
  var keysY = Object.keys(bounds[keys[1]]);
       console.log('b');console.log(bounds);
        eeBoundsPoly = ee.Geometry.Rectangle([bounds[keys[1]][keysX[0]],bounds[keys[0]][keysY[0]],bounds[keys[1]][keysX[1]],bounds[keys[0]][keysY[1]]]);

  var ulxy = [bounds[keys[1]][keysX[0]],bounds[keys[0]][keysY[0]]];
  var lrxy = [bounds[keys[1]][keysX[1]],bounds[keys[0]][keysY[1]]];
  var ulxyMercator = llToNAD83(ulxy[0],ulxy[1]);
  var lrxyMercator = llToNAD83(lrxy[0],lrxy[1]);
  
  var url = baseUrl+
  
  ulxyMercator.x.toString()+'%2C'+lrxyMercator.y.toString()+
  '%2C'+
  
  
  lrxyMercator.x.toString()+'%2C'+ulxyMercator.y.toString()+
  '&bboxSR=3857&imageSR=3857&size='+mapWidth.toString()+'%2C'+mapHeight.toString()+'&f=image'

  // console.log('url '+url)
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
function addDynamicToMap(baseUrl1,baseUrl2, minZoom1,minZoom2,name,visible,helpBox,whichLayerList){
  if(whichLayerList === null || whichLayerList === undefined){whichLayerList = "layer-list"}
var viz = {};var item = ee.Image();
    // print(item.getInfo().type)
    // if(item.getInfo().type === 'ImageCollection'){print('It is a collection')}
    if(name === null || name === undefined){
        name = "Layer "+NEXT_LAYER_ID;
        NEXT_LAYER_ID += 1;
    }

    if(visible === null || visible === undefined){
        visible = true;
    }
    // if(minZoom === null || minZoom === undefined){
    //     minZoom = 8;
    // }
    if(helpBox == null){helpBox = ''};
    function groundOverlayWrapper(){
      if(map.getZoom() > minZoom2){
        return getGroundOverlay(baseUrl2,minZoom2)
      }
      else{
        return getGroundOverlay(baseUrl1,minZoom1)
      }
      }
    var layer = document.createElement("dynamic-layer");
    
    layer.ID = NEXT_LAYER_ID;
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
//////////////////////////////////////////////////////
//Function for adding ee object to map
//Will handle vectors by converting them to rasters
function addToMap(item,viz,name,visible,label,fontColor,helpBox,whichLayerList){
    if(canAddToMap){
    try{var t = item.bandNames();
        
        addRasterToMap(item,viz,name,visible,label,fontColor,helpBox,whichLayerList);}
    catch(err){
        try{
        item = ee.Image().paint(item,3,3);
        addToMap(item,viz,name,visible,label,fontColor,helpBox,whichLayerList)
      }
    catch(err){
      item = ee.Image().paint(ee.FeatureCollection([item]),3,3);
        addToMap(item,viz,name,visible,label,fontColor,helpBox,whichLayerList)
    }
    };
}
    
}
function mp(){
  this.addLayer = function(item,viz,name,visible,label,fontColor,helpBox,whichLayerList){
    addToMap(item,viz,name,visible,label,fontColor,helpBox,whichLayerList);
  };
  this.addREST = function(tileURLFunction,name,visible,maxZoom,helpBox,whichLayerList){
    addRESTToMap(tileURLFunction,name,visible,maxZoom,helpBox,whichLayerList);
  };
  this.addExport = function(eeImage,name,res,resMin,resMax,resStep,Export,vizParams){
    addExport(eeImage,name,res,resMin,resMax,resStep,Export,vizParams);
  };
  this.addPlot = function(nameLngLat){
    addPlot(nameLngLat);

  }
}
var Map2 = new mp();

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
// function refreshLayerToMap()
function reRun(){
  layerChildID = 0;
  queryObj = {};
  if(analysisMode === 'advanced'){
    document.getElementById('threshold-container').style.display = 'inline-block';
    document.getElementById('advanced-radio-container').style.display = 'inline';
    // document.getElementById('charting-container').style.display = 'inline-block';
    
  }
  else{
    document.getElementById('threshold-container').style.display = 'none';
    document.getElementById('advanced-radio-container').style.display = 'none';
    // document.getElementById('charting-container').style.display = 'none';
    viewBeta = 'no';
    lowerThresholdDecline = 0.35;
    upperThresholdDecline = 1;
    lowerThresholdRecovery = 0.35;
    upperThresholdRecovery = 1;
    summaryMethod = 'year';
  }

	var layers = document.getElementById("layers");
  var referenceLayers = document.getElementById("reference-layers");
  var exportLayers = document.getElementById("export-layers");
    console.log('layers');
    console.log(layers);
    // console.log(layers.firstChild);
    var legend = document.getElementById("legend");
    var exports = document.getElementById("export-list");
    var overlayIndex = 0;
	while(layers.firstChild){
        
		layers.removeChild(layers.firstChild);
        // var thisOverlay = map.overlayMapTypes.b[overlayIndex];
        
        // console.log(layerCount);
        // setInterval(function(){if(map.overlayMapTypes.b.length >= layerCount){
        //     console.log('waiting')
        // }
        // console.log(map.overlayMapTypes.b.length)
        // this.map.overlayMapTypes.removeAt(foundIndex);
        // console.log(thisOverlay)
        overlayIndex++

	}
  map.overlayMapTypes.g.forEach(function(element,index){
                    
                    // if(element !== undefined && element !== null){
                        // console.log('remooooooving');
                    // console.log(index);
                    // console.log(element)
                    map.overlayMapTypes.setAt(index,null);
                    // map.overlayMapTypes.removeAt(index);

                // };
                    
                });
  // while(exportLayers.firstChild){
        
  //   exportLayers.removeChild(exportLayers.firstChild);
  //       // var thisOverlay = map.overlayMapTypes.b[overlayIndex];
        
  //       // console.log(layerCount);
  //       // setInterval(function(){if(map.overlayMapTypes.b.length >= layerCount){
  //       //     console.log('waiting')
  //       // }
  //       // console.log(map.overlayMapTypes.b.length)
  //       // this.map.overlayMapTypes.removeAt(foundIndex);
  //       // console.log(thisOverlay)
  //       // overlayIndex++

  // }
  while(referenceLayers.firstChild){
        
    referenceLayers.removeChild(referenceLayers.firstChild);
        // var thisOverlay = map.overlayMapTypes.b[overlayIndex];
        
        // console.log(layerCount);
        // setInterval(function(){if(map.overlayMapTypes.b.length >= layerCount){
        //     console.log('waiting')
        // }
        // console.log(map.overlayMapTypes.b.length)
        // this.map.overlayMapTypes.removeAt(foundIndex);
        // console.log(thisOverlay)
        // overlayIndex++

  }
  while(exports.firstChild){
        
    exports.removeChild(exports.firstChild);

  }
    console.log(layerCount);
    console.log(refreshNumber);
    while(legend.firstChild){
        legend.removeChild(legend.firstChild);
    }
    refreshNumber   ++;layerCount = 0;
  exportImageDict = {};
  clearDownloadDropdown();
	run();
  setupFSB();


//     var whileCount = 0;
//     while(whileCount < 5000){
    // while(map.overlayMapTypes.b.length < layerCount*(refreshNumber+1)){}
    interval2(function(){
      map.overlayMapTypes.j.slice(0,map.overlayMapTypes.j.length-layerCount).forEach(function(element,index){
                    
                    // if(element !== undefined && element !== null){
                    //     console.log('remooooooving');
                    // console.log(index);
                    // console.log(element)
                    map.overlayMapTypes.setAt(index,null);
                // };
                    
                });  
  },5000,3)
    
//     whileCount++;
// }
    // processFeatures(fc);
   
}

function toggleUnits(){
  if(metricOrImperial === 'metric'){metricOrImperial = 'imperial'}
    else{metricOrImperial = 'metric'};
}
function toggleAreaUnits(v){
  console.log(v);
  toggleUnits();
  updateArea();
  
}
function toggleDistanceAreaUnits(value){
  // console.log(value);
  toggleUnits();
  if(value === 'a'){updateArea();}
  else{updateDistance();}
  
  
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}
function rgbToHex(r,g,b) {
    return "#"+("00000"+(r<<16|g<<8|b).toString(16)).slice(-6);
}
function randomColor(){
  var r = getRandomInt(100, 255);
  var g = getRandomInt(0, 255);
  var b = getRandomInt(0, 50);
  var c = rgbToHex(r,g,b)
  return c
}
var chartColorI = 0;
var chartColors = ['#111','#808','#fb9a99','#33a02c','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#b15928'];
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
var colorList = randomColors(50);
var colorMod = colorList.length;
var currentColor =  colorList[colorMod%colorList.length];
colorMod++;
var polyNumber = 1;
var polyOn = false;


var areaPolygonOptions = {
              strokeColor:currentColor,
                fillOpacity:0.2,
              strokeOpacity: 1,
              strokeWeight: 3,
              draggable: true,
              editable: true,
              geodesic:true,
              polyNumber: polyNumber
            
            };

function startArea(){
  
  if(polyOn === false){
    // $( "#area-measurement" ).html( 'Click on map to start measuring<br>Press "Delete" or "d" button to clear<br>Press "u" to undo last vertex placement<br>Press "None" radio button to stop measuring');
    polyOn = true;
  }
  // 
   // $( "#distance-area-measurement" ).style.width = '0px';
  // document.getElementById('area-measurement').style.display = 'block';
  // document.getElementById('area-measurement').value = 'a';
  currentColor =  colorList[colorMod%colorList.length];
    areaPolygonOptions = {
              strokeColor:currentColor,
                fillOpacity:0.2,
              strokeOpacity: 1,
              strokeWeight: 3,
              draggable: true,
              editable: true,
              geodesic:true,
              polyNumber: polyNumber
            };
        
        colorMod++;
    map.setOptions({draggableCursor:'crosshair'});
    map.setOptions({disableDoubleClickZoom: true });

    // Construct the polygon.
        areaPolygonObj[polyNumber] = new google.maps.Polyline(areaPolygonOptions);
        areaPolygonObj[polyNumber].setMap(map);

        // areaPolygon = new google.maps.Polygon(areaPolygonOptions);
        // areaPolygon.setMap(map);

    updateArea = function(){
      var unitName;var unitMultiplier;
        var keys = Object.keys(areaPolygonObj);
        var totalArea = 0;
        var totalWithArea = 0;
        var outString = ''
        function areaWrapper(key){
        // print('Adding in: '+key.toString());
        var pathT = areaPolygonObj[key].getPath().g
        clickCoords = pathT[pathT.length-1];
        console.log(clickCoords)
        area = google.maps.geometry.spherical.computeArea(areaPolygonObj[key].getPath());
        
        var unitNames = unitNameDict[metricOrImperial].area;
        var unitMultipliers = unitMultiplierDict[metricOrImperial].area;
        // console.log(unitNames);
        // console.log(unitMultipliers);
        // console.log(area)
        
        if(totalArea >= 1){
          unitName = unitNames[1];
          unitMultiplier = unitMultipliers[1];
        }
        else{
          unitName = unitNames[0];
          unitMultiplier = unitMultipliers[0];
          }
        if(area >= 1){
          var unitNameT = unitNames[1];
          var unitMultiplierT = unitMultipliers[1];
        }
        else{
          var unitNameT = unitNames[0];
          var unitMultiplierT = unitMultipliers[0];
          };
        area = area;//*unitMultiplier
        // console.log(unitName);
        // console.log(unitMultiplier);
        if(area>0){
          totalWithArea++;
          outString  = outString + area*unitMultiplierT.toFixed(4).toString() + ' ' + unitNameT + '<br>'
        }
        totalArea = totalArea + area

        // console.log(totalArea);
      }
      keys.map(areaWrapper)
      var pixelProp = totalArea/9;
      totalArea = totalArea*unitMultiplier;
        // if(infowindow != undefined){infowindow.close()}
        // if(totalArea > 0){
            // infowindow = new google.maps.InfoWindow({
            // content: area.toFixed(2) + unit,
            // position: clickCoords
            // });
            // infowindow.open(map);
             totalArea = totalArea.toFixed(4).toString();

          var polyString = 'polygon';
          if(keys.length>1){
            polyString = 'polygons';
          }
          var areaContent = totalWithArea.toString()+' '+polyString+' <br>'+totalArea +' '+unitName ;
          // $( "#area-measurement" ).html(areaContent);//+' <br>' +pixelProp.toFixed(2) + '%pixel');
          infowindow.setContent(areaContent);
          infowindow.setPosition(clickCoords);
          
          infowindow.open(map);
          $('.gm-ui-hover-effect').hide();
          // $('#tool-message-box').empty();
          // $('#tool-message-box').show();
          // $('#tool-message-box').append(areaContent);
          
            // }       
    }
    // function newPoly(){
    //   areaPolygonObj[polyNumber].setMap(null);
    //   areaPolygonObj[polyNumber] = new google.maps.Polygon(areaPolygonOptions);
    //   areaPolygonObj[polyNumber].setMap(map);
    //   google.maps.event.addListener(areaPolygon, 'dblclick', function() {
    //     console.log('doubleClicked');
    //     newPoly();
    //     // resetPolygon();
    // });
    // }
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


function startListening(){
    // google.maps.event.addDomListener(map, 'click', function(event) {
    //     // console.log(event)
    //     // var path = areaPolygonObj[polyNumber].getPath();
    //     // path.push(event.latLng);
    //     // updateArea();
    //     console.log(event.latLng)
   
    
    // });
    google.maps.event.addDomListener(mapDiv, 'click', function(event) {
        
        

        var path = areaPolygonObj[polyNumber].getPath();
        var x =event.clientX;
        var y = event.clientY;
        clickLngLat =point2LatLng(x,y)
        path.push(clickLngLat);
        updateArea();
    
    });
    // google.maps.event.addDomListener(mapDiv, 'dblclick', function() {
    mapHammer = new Hammer(document.getElementById('map'));
    mapHammer.on("doubletap",function(){
        // console.log('doubleClicked');
        // newPoly();
        // startArea();
        
   
        
        setToPolygon()
        
        resetPolygon();

    });


    // var thisPoly = areaPolygonObj[polyNumber]
    // if(thisPoly.getPath().length > 2){
      // google.maps.event.addListener(thisPoly, "click", function(){activatePoly(thisPoly)});
    // }
    google.maps.event.addListener(areaPolygonObj[polyNumber], "click", updateArea);
 
    google.maps.event.addListener(areaPolygonObj[polyNumber], "mouseup", updateArea);
    google.maps.event.addListener(areaPolygonObj[polyNumber], "dragend", updateArea);
    google.maps.event.addListener(areaPolygonObj[polyNumber].getPath(), 'set_at',  updateArea);

    window.addEventListener("keydown", resetPolys);
    window.addEventListener("keydown", deleteLastVertex);

}
function resetPolys(e){
 
     
      if( e.key == 'Delete'|| e.key == 'd' ){
        stopArea();
        startArea();
      }
    }
function deleteLastVertex(e){
 
      
      if(e.key == 'u' || e.key == 'z' ){
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
    }
function activatePoly(poly){
  // stopListening();
  // var keys = Object.keys(areaPolygonObj);
  // keys.map(function(k){
  //   setToPolygon(k)
  //   areaPolygonObj[k].setEditable(false);
  //   areaPolygonObj[k].setDraggable(false);
    

  // })
  // polyNumber = poly.polyNumber;
  // areaPolygonObj[poly.polyNumber].setEditable(true);
  // areaPolygonObj[poly.polyNumber].setDraggable(true);
  // setToPolyline()
  // startListening();
 
 
  
  console.log(poly.polyNumber)
}
function stopListening(){
    // areaPolygonObj[polyNumber].setEditable(false);
    // areaPolygonObj[polyNumber].setDraggable(false);
    try{
    mapHammer.destroy();
    console.log(areaPolygonObj[polyNumber].polyNumber);
    google.maps.event.clearListeners(areaPolygonObj[polyNumber], 'dblclick');
    google.maps.event.clearListeners(areaPolygonObj[polyNumber], 'click');
    google.maps.event.clearListeners(mapDiv, 'click');
    google.maps.event.clearListeners(areaPolygonObj[polyNumber], 'mouseup');
    google.maps.event.clearListeners(areaPolygonObj[polyNumber], 'dragend');
    // if(infowindow != undefined){infowindow.close()}
    window.removeEventListener('keydown',resetPolys);
    window.removeEventListener('keydown',deleteLastVertex);
    // var thisPoly = areaPolygonObj[polyNumber]
    // if(thisPoly.getPath().length > 2){
    //   google.maps.event.addListener(thisPoly, "click", function(){activatePoly(thisPoly)});
    // }
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
  // google.maps.event.clearListeners(mapDiv, 'dblclick');
  try{
    mapHammer.destroy();
  }catch(err){}
  
    // google.maps.event.clearListeners(mapDiv, 'click');
  // $( "#area-measurement" ).html( '');
  // document.getElementById('area-measurement').style.display = 'none';
  map.setOptions({disableDoubleClickZoom: true });
  
  clearPolys();
  infowindow.setMap(null);
  map.setOptions({draggableCursor:'hand'});
   // $('#tool-message-box').empty();
    // $('#tool-message-box').hide();
  // map.setOptions({draggableCursor:'hand'});
  
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
function startDistance(){
  // showTip("DISTANCE MEASURING","Click on map to measure distance. Double click on map to clear")
  // $( "#distance-measurement" ).html( 'Click on map to start measuring<br>Double click to finish measurement');
  
  // document.getElementById('distance-measurement').style.display = 'inline-block';
  // document.getElementById('distance-measurement').value = 'd';
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
    map.setOptions({draggableCursor:'crosshair'});
    distancePolyline = new google.maps.Polyline(distancePolylineOptions);
    distancePolyline.setMap(map);


    


    map.setOptions({disableDoubleClickZoom: true });



    google.maps.event.addListener(distancePolyline, "click", updateDistance);
    mapHammer = new Hammer(document.getElementById('map'));
    mapHammer.on("doubletap", resetPolyline);
    mapHammer.on("tap", function(event) {
        // console.log('clicked');
        var x =event.center.x;
        var y = event.center.y;
        var path = distancePolyline.getPath();
        clickLngLat =point2LatLng(x,y)
        path.push(clickLngLat);
        updateDistance();
    });
    // google.maps.event.addDomListener(mapDiv, "dblclick", resetPolyline);
    google.maps.event.addListener(distancePolyline, "mouseup", updateDistance);
    google.maps.event.addListener(distancePolyline, "dragend", updateDistance);
    google.maps.event.addListener(distancePolyline.getPath(), 'set_at',  updateDistance);

    // distanceUpdater = setInterval(function(){updateMarkerPositionList();updateDistance();},500);

    }

function stopDistance(){
  // $( "#distance-measurement" ).html( '');
  // document.getElementById('distance-measurement').style.display = 'none';
  try{
    mapHammer.destroy();
    map.setOptions({disableDoubleClickZoom: true });
    // google.maps.event.clearListeners(mapDiv, 'dblclick');
    google.maps.event.clearListeners(distancePolyline, 'click');
    google.maps.event.clearListeners(mapDiv, 'click');
    google.maps.event.clearListeners(distancePolyline, 'mouseup');
    google.maps.event.clearListeners(distancePolyline, 'dragend');
    if(infowindow != undefined){infowindow.setMap(null);}
    distancePolyline.setMap(null);
    // clearInterval(distanceUpdater);
    map.setOptions({draggableCursor:'hand'});
    infowindow.setMap(null);
    // $('#tool-message-box').empty();
    // $('#tool-message-box').hide();
  }catch(err){}
    
}

function resetPolyline(){
    stopDistance();startDistance();
}
    
// function updateMarkerPositionList(){
//     var distance = google.maps.geometry.spherical.computeLength(distancePolyline.getPath());
//     console.log(distance);
//     var pathT = distancePolyline.getPath().b
//     markerPositionList = pathT.map(function(xy){return [xy.lat(),xy.lng()]})
//     clickCoords = distancePolyline.getPath().b[pathT.length-1]
// }
updateDistance = function(){
    distance = google.maps.geometry.spherical.computeLength(distancePolyline.getPath());
    var pathT = distancePolyline.getPath().g;
    clickCoords = pathT[pathT.length-1];
    // console.log(clickCoords)
    
    var unitNames = unitNameDict[metricOrImperial].distance;
    var unitMultipliers = unitMultiplierDict[metricOrImperial].distance;
    // console.log(unitNames);
    // console.log(unitMultipliers);
    // console.log(area)
        
    if(distance >= 10000){
      var unitName = unitNames[1];
      var unitMultiplier = unitMultipliers[1];
    }
    else{
      var unitName = unitNames[0];
      var unitMultiplier = unitMultipliers[0];
      }
    distance = distance*unitMultiplier
    // console.log(unitName);
    // console.log(unitMultiplier);

    if(distance > 0){
     
          var distanceContent = distance.toFixed(4) + ' ' + unitName 
          // $( "#distance-measurement" ).html(distanceContent);
    
          infowindow.setContent(distanceContent);
          infowindow.setPosition(clickCoords);

          infowindow.open(map);
          // $('#tool-message-box').empty();
          // $('#tool-message-box').show();
          // $('#tool-message-box').append(distanceContent);
          $('.gm-ui-hover-effect').hide();


    }

}
function getDistance(lat1,lon1,lat2,lon2){
    var R = 6371e3; // metres
    var phi1 = lat1* Math.PI / 180;
    var phi2 = lat2* Math.PI / 180;
    var deltaPhi = (lat2-lat1)* Math.PI / 180;
    var deltaLambda = (lon2-lon1)* Math.PI / 180;

    var a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var d = R * c;
    return d
}


function addFusionTable1(id){
var layer1 = new google.maps.FusionTablesLayer({
          query: {
            select: 'geometry',
            from: id
          },
          styles: [{
      polygonOptions: {
        // fillColor: '#00FF00',
        fillOpacity: 0.0000000000001,
        strokeColor:'#FF0000',
        strokeWeight : 2
      }
    }]
    // map:map
        });
    layer1.setMap(map);
    }
function addFusionTable2(id){
var layer2 = new google.maps.FusionTablesLayer({
          query: {
            select: 'geometry',
            from: id
          },
          styles: [{
      polygonOptions: {
        // fillColor: '#00FF00',
        fillOpacity: 0.0000000000001,
        strokeColor:'#FF0000',
        strokeWeight : 2
      }
    }]
        });
layer2.setMap(map);
    
    }

var layerObj = null;
var queryObj = {};
var lowerThresholdDecline = 0.35;
var upperThresholdDecline = 1;
var lowerThresholdRecovery = 0.35;
var upperThresholdRecovery = 1;

var cachedStudyAreaName = null;
var studyAreaDict = {'Flathead National Forest':['FNF',[48.16,-115.08,8],'EPSG:26911',0.35,0.35],
                  'Bridger-Teton National Forest':['BTNF',[43.4,-111.1,8],'EPSG:26912',0.35,0.35],
                  'Manti-La Sal National Forest':['MLSNF',[38.8,-111,8],'EPSG:26912',0.25,0.30],
                  'Chugach National Forest - Kenai Peninsula':['CNFKP',[60.4,-150.1, 9],'EPSG:3338',0.25,0.35],
                  'Science Team CONUS':['CONUS',[40.0,-95.0,4],'EPSG:5070',0.30,0.30],
                };

function dropdownUpdateStudyArea(whichOne){
  resetStudyArea(whichOne);
   // localStorage.setItem("cachedStudyAreaName",this.innerHTML)
   //  $('.status').text(this.innerHTML);
   //  $('#study-area-label').text(this.innerHTML);
    var coords = studyAreaDict[whichOne][1];
    // studyAreaName = studyAreaDict[this.innerHTML][0];
   //  // exportCRS = studyAreaDict[this.innerHTML][2];
   //  // $('input[name = "Export crs"]').val(exportCRS);
    centerMap(coords[1],coords[0],coords[2]);
    if(studyAreaName === 'CONUS'){run = runCONUS}
      else{run = runUSFS};

  

    reRun();
};
var resetStudyArea = function(whichOne){
    localStorage.setItem("cachedStudyAreaName",whichOne)
   
    $('#studyAreaDropdown').val(whichOne);
    $('#study-area-label').text(whichOne);
    console.log('changing study area');
    console.log(whichOne);
    lowerThresholdDecline =  studyAreaDict[whichOne][3];
    upperThresholdDecline = 1;
    lowerThresholdRecovery = studyAreaDict[whichOne][4];
    upperThresholdRecovery = 1;
    
    setUpRangeSlider('lowerThresholdDecline','upperThresholdDecline',0,1,lowerThresholdDecline,upperThresholdDecline,0.05,'slider2','declineThreshold','null')
    
    setUpRangeSlider('lowerThresholdRecovery','upperThresholdRecovery',0,1,lowerThresholdRecovery,upperThresholdRecovery,0.05,'slider3','recoveryThreshold','null')

    var coords = studyAreaDict[whichOne][1];
    studyAreaName = studyAreaDict[whichOne][0];
    if(studyAreaName === 'CONUS'){run = runCONUS}else{run = runUSFS};
    // exportCRS = studyAreaDict[whichOne][2];
    // $('#export-crs').val(exportCRS);
    // centerMap(coords[1],coords[0],8);
    // reRun();

}
  
function initialize() {
    var center = new google.maps.LatLng(initialCenter[0],initialCenter[1]);
    var zoom = initialZoomLevel;//8;

    var settings = null;


    // var randomID = null;
    if(typeof(Storage) !== "undefined"){
        settings = JSON.parse(localStorage.getItem("settings"));

        layerObj =  null;//JSON.parse(localStorage.getItem("layerObj"));

        cachedStudyAreaName = localStorage.getItem("cachedStudyAreaName");
        // randomID = JSON.parse(localStorage.getItem("randomID"));
    }

    if(settings != null && settings.center != null && settings.zoom != null){
        center = settings.center;
        zoom  = settings.zoom;
    }
    if(layerObj === null){
        layerObj = {};
    }
    
 
  // var mapTypeIds = [];
  //           for(var type in google.maps.MapTypeId) {
  //               mapTypeIds.push(google.maps.MapTypeId[type]);
  //           }
    // mapTypeIds.push("Bing Satellite");
    // mapTypeIds.push("Mapbox Satellite");         
    
    // [1,2,3,4,5,6,7,8,9].map(function(n){mapTypeIds.push("Placeholder"+n.toString());})
   
    

	
    mapOptions.center = center;
    mapOptions.zoom = zoom;
     
    map = new google.maps.Map(document.getElementById("map"),
                                  mapOptions);

    
       
   //  var testUrl = 'https://ecos.fws.gov/arcgis/rest/services/cap/cap/MapServer/0?f=pjson'
   // var ctaLayer = new google.maps.KmlLayer({
   //        url: '../layers/change_no_change_shp2_k.kml',
   //        map: map
   //      });
            placeholderID = 1;


            function addWMS(url,name,maxZoom,xThenY){
              if(maxZoom === null || maxZoom === undefined  ){
                maxZoom = 19;
              }
              if(xThenY === null || xThenY === undefined  ){
                xThenY = false;
              }
                var imageMapType =  new google.maps.ImageMapType({
                getTileUrl: function(coord, zoom) {
                    // "Wrap" x (logitude) at 180th meridian properly
                    // NB: Don't touch coord.x because coord param is by reference, and changing its x property breakes something in Google's lib 
                    var tilesPerGlobe = 1 << zoom;
                    var x = coord.x % tilesPerGlobe;
                    if (x < 0) {
                        x = tilesPerGlobe+x;
                    }
                    // Wrap y (latitude) in a like manner if you want to enable vertical infinite scroll
                    // return "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/" + zoom + "/" + x + "/" + coord.y + "?access_token=pk.eyJ1IjoiaWhvdXNtYW4iLCJhIjoiY2ltcXQ0cnljMDBwNHZsbTQwYXRtb3FhYiJ9.Sql6G9QR_TQ-OaT5wT6f5Q"
                    if(xThenY ){
                        return url+ zoom + "/" + x + "/" + coord.y +".png?";
                    }
                    else{return url+ zoom + "/" + coord.y + "/" +x  +".png?";}//+ (new Date()).getTime();
                    
                },
                tileSize: new google.maps.Size(256, 256),
                name: name,
                maxZoom: maxZoom
            
            })

                   
                map.mapTypes.set('Placeholder' + placeholderID.toString(),imageMapType )
                placeholderID  ++;
            }
              

        if(helpBox){
          // document.getElementById('helpBoxButton').style.display = 'inline-block';
        }
        if(useShapes){
          
            document.getElementById('shape-edit-container').style.display = 'inline-block';
            
            shapesMap = new ShapesMap(
            map, 
            document.getElementById("delete-button"),
            document.getElementById("clear-button"),
            document.getElementById("process-button"),
            document.getElementById("export-button"),
            document.getElementById("toggle-drawing-button"),
            document.getElementById("console"));

            if(exportCapability){
              document.getElementById('export-container-big').style.display = 'block';
             //    document.getElementById('process-button').style.display = 'inline-block';
             // document.getElementById('export-button').style.display = 'inline-block';
             // document.getElementById('cancel-tasks-button').style.display = 'inline-block';
             // document.getElementById('export-scale').style.display = 'inline-block';


             // document.getElementById('export-crs').style.display = 'inline-block';

            
         }

    }

    // if(downloadCapability){
    //     document.getElementById('download-container').style.display = 'block';
    //   }
    if(userCharting){
       // document.getElementById('plot-radius').style.display = 'inline-block';
       // document.getElementById('plot-scale').style.display = 'inline-block'; 
        // document.getElementById('charting-radio').style.display = 'inline-block';
        // document.getElementById('charting-label').style.display = 'inline-block';
        // document.getElementById('Progress').style.display = 'inline-block';
    }
    if(includeTools){
         // document.getElementById('tool-area').style.display = 'inline-block';
    }
    // if(includeLegend){
        // document.getElementById('legend').style.display = 'inline-block';
        // document.getElementById('legend-button').style.display = 'inline-block';
    // }
    if(displayParameters){
      // document.getElementById('parameters-only').style.display = 'inline-block';
    }
    if(plotNavigation){
      // document.getElementById('pt-list').style.display = 'inline-block';
      // document.getElementById('pt-project-list').style.display = 'inline-block';
      document.getElementById('plot-container').style.display = 'inline-block';
      document.getElementById('toggle-plot-list-button').style.display = 'inline-block';
    }
        // var shapesMap = new ShapesMap(
        // map, 
        // document.getElementById("delete-button"),
        // document.getElementById("clear-button"),
        // document.getElementById("process-button"),
        // document.getElementById("export-button"),
        // document.getElementById("stop-drawing-button"),
        // document.getElementById("console"));
        //     var panorama = new google.maps.StreetViewPanorama(
        //     document.getElementById('pano'), {
              
        //       pov: {
        //         heading: 34,
        //         pitch: 10
        //       }
        //     });
        // map.setStreetView(panorama);
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

        
        function updateMousePositionAndZoom(cLng,cLat,zoom,elevation){
                  
                $( "#current-mouse-position" ).html( 'Lng: ' +cLng + ', Lat: ' + cLat +', '+elevation+ 'Zoom: ' +zoom +', 1:'+zoomDict[zoom]);
        }
        
        // var elevationAPIKey = 'AIzaSyBiTunmJOy6JFGYWy2ms4_ScCOqK4rFf3w';
        // var elevationAPIKey = 'AIzaSyCXwPx9_pOQsvd-b_bG8ueGI82JnJO2mess';
        var elevator = new google.maps.ElevationService;
        var lastElevation = 0;
        var elevationCheckTime = 0
        function getElevation(center){
        mouseLat = center.lat().toFixed(4).toString();
        elevator.getElevationForLocations({
        'locations': [center]
        }, function(results, status) {
            // console.log(status);
        if(status === 'OVER_QUERY_LIMIT'){
          lastElevation = '';
          updateMousePositionAndZoom(mouseLng,mouseLat,zoom,'');
        }
        else if (status === 'OK') {
          // Retrieve the first result
          if (results[0]) {
            // Open the infowindow indicating the elevation at the clicked position.
                var thisElevation = results[0].elevation.toFixed(1);
                var thisElevationFt = (thisElevation*3.28084).toFixed(1);
                lastElevation = 'Elevation: '+thisElevation.toString()+'(m),'+thisElevationFt.toString()+'(ft),';
                updateMousePositionAndZoom(mouseLng,mouseLat,zoom,lastElevation)
                
          } else {
            updateMousePositionAndZoom(mouseLng,mouseLat,zoom,'No results found');
          }
        } 
        else {
          updateMousePositionAndZoom(mouseLng,mouseLat,zoom,lastElevation);
        }
        });
        }
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
            
            if(dt > 2000){
              getElevation(center);
              elevationCheckTime = now;
            }
            else{updateMousePositionAndZoom(mouseLng,mouseLat,zoom,lastElevation)}
            
        })
        google.maps.event.addListener(map,'zoom_changed',function(){
            var zoom = map.getZoom();
            
            console.log('zoom changed')
            
            updateMousePositionAndZoom(mouseLng,mouseLat,zoom,lastElevation)
        })

    google.maps.event.addListener(map,'bounds_changed',function(){
      zoom = map.getZoom();
      console.log('bounds changed');
      var bounds = map.getBounds();
      var keys = Object.keys(bounds);
      var keysX = Object.keys(bounds[keys[0]]);
      var keysY = Object.keys(bounds[keys[1]]);
      // console.log('b');console.log(bounds);
      eeBoundsPoly = ee.Geometry.Rectangle([bounds[keys[1]][keysX[0]],bounds[keys[0]][keysY[0]],bounds[keys[1]][keysX[1]],bounds[keys[0]][keysY[1]]]);

        if(typeof(Storage) == "undefined") return;
        localStorage.setItem("settings",JSON.stringify({center:{lat:map.getCenter().lat(),lng:map.getCenter().lng()},zoom:map.getZoom()}));
    });

    
    
        
    // if(randomID === null){randomID = parseInt(Math.random()*1000000)}
    // localStorage.setItem("randomID",JSON.stringify(randomID));

    //Specify proxy server location
    //Proxy server used for EE and GCS auth
    //RCR appspot proxy costs $$
	// ee.initialize("https://rcr-ee-proxy-server2.appspot.com/api","https://earthengine.googleapis.com/map",function(){
    ee.initialize(authProxyAPIURL,geeAPIURL,function(){
    
    // ee.initialize("http://localhost:8080/api","https://earthengine.googleapis.com/map",function(){
      if(cachedStudyAreaName != null){
      resetStudyArea(cachedStudyAreaName)
    }
    else{run = runUSFS}
  run();
  setupFSB();
	// plotPlots()
	});

}

google.maps.event.addDomListener(window, 'load', function(){
  
  initialize();
  
  });

