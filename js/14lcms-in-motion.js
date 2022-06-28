let zoomToFullLayerExtent,layerTotal = 0,maxLayers=0,h,w,defaultView={"center":[-113.55467677113408,45.68161957233809],"zoom":3},timeLapseVisible = {};
function closeSplash(){
  $('#splash').hide();
}
function showSplash(){
  $('#splash').show();
  $('#intro-div').show();
  
}
function updateProgress(val) {
  var el = document.querySelector('.progressbar span');
  el.style.width = val + '%';
  el.innerText = val + '%';
};
function updateBottomBar(){
  if(maxLayers < layerTotal){maxLayers = layerTotal}
  var pct = parseInt((1-layerTotal/maxLayers)*100);
  updateProgress(pct);
 if(layerTotal === 0){
  $('#loading-spinner-logo').removeClass('fa-spin')
  $('#loading-spinner').hide();
  if(localStorage['showIntroModal-landscapes-in-motion']  !== 'true'){
    $('#splash').hide();
    $('#dontShowAgainCheckbox').click();
  }else{
    $('#intro-divider').hide();
  }
 
 }else{
  $('#loading-spinner').show();
 };
    resizeWindow();
}
//Function to handle resizing the windows properly
function resizeWindow(){
    console.log('resized');
    const margin = 5;
    h = window.innerHeight-margin;
    w = window.innerWidth;
    $('#splash').css({'max-height':h-50})
    $('.esri-popup__main-container').css({'max-height':h-50})
    // $('.esri-popup__main-container').css({'width':w-50})
    // var headerHeight = $('#headerDiv').height();
    // var bottomHeight = $('#bottomDiv').height();
    // // $('#selected-area-list').css({'height':h/3*2-100});
    // // $('#selected-area-div').css({'height':h/3*2-100});
    
    // if(w>h){
    //   $('#headerDiv').css({'left':$('#nameDiv').width()+$('.esri-zoom').width()+20})
    //   $('.entire').css({'float':'left','width':'45%'});
    //   $('.left').css({'float':'left','width':'10%'});
    //   $('.right').css({'float':'right','width':'45%'});
    //   // $('.bottom').css({'position': 'absolute','bottom': '0'});
    //   $("#viewDiv").height(h);
    //   $("#chartDiv").height(h);
    //   $("#nameDiv").height(h);
    //   // $('#legend-div').css({'float':'top','max-height':h/3});
    //   // $('#selected-area-div').css({'float':'bottom','height':h-$('#legend-div').height()-100});
    // }else{
    //   $("#viewDiv").height((window.innerHeight-(headerHeight*1.2))/2);
    //   $("#chartDiv").height((window.innerHeight-(headerHeight*1.2))/2);
    //   $('.left').css({'float':'top','width':'100%'});
    //   $('.right').css({'float':'bottom','width':'100%'});
    // }
    // $('#lcms-icon').height($('#dashboard-title').innerHeight()*0.6);

    // $('#chartDiv').css('overflow-y','visible');
  }
///////////////////////////////////////////////////////////////////////

  // $('div.esri-attribution__sources').html(html)

require(["esri/Map", 
            "esri/layers/GeoJSONLayer", 
            "esri/views/MapView",
            "esri/widgets/BasemapGallery", 
            "esri/widgets/LayerList",
            "esri/widgets/Expand",
            "esri/layers/FeatureLayer",
            "esri/core/watchUtils",
            "esri/config",
            "esri/layers/ImageryLayer",
            "esri/widgets/Legend",
            "esri/widgets/Slider",
            "esri/widgets/TimeSlider"
            ], function (
      Map,
      GeoJSONLayer,
      MapView,
      BasemapGallery,
      LayerList,
      Expand,
      FeatureLayer,
      watchUtils,
      esriConfig,
      ImageryLayer,
      Legend,
      Slider,
      TimeSlider
    ) {
      // If GeoJSON files are not on the same domain as your website, a CORS enabled server
      // or a proxy is required.
      esriConfig.request.trustedServers.push("*");
      
      let layerList = [];
      let isFirstLayer = true;
      var firstLayer;
      
      function addGifAreas(path,name,labelFieldname,outlineColor,fillColor,isFeatureService){
        const gif_dir = 'https://storage.googleapis.com/lcms-gifs/';
        const template = {
          title: null,
          docked:false,
          content:  `<ul>
                      <li>
                        <a class = 'gif-image' href='${gif_dir}{GIFNAMECHANGE}' target="_blank" title="Click to open {GIFNAMECHANGE} in a new tab">
                          <img  src='${gif_dir}{GIFNAMECHANGE}'  alt='{GIFNAMECHANGE}'>
                        </a>
                      </li>
                      <hr>
                      <li>
                        <a class = 'gif-image' href='${gif_dir}{GIFNAMELANDCOVER}' target="_blank" title="Click to open {GIFNAMELANDCOVER} in a new tab">
                          <img  src='${gif_dir}{GIFNAMELANDCOVER}'  alt='{GIFNAMELANDCOVER}'>
                        </a>
                      </li>
                      <hr>
                      <li>
                        <a class = 'gif-image' href='${gif_dir}{GIFNAMELANDUSE}' target="_blank" title="Click to open {GIFNAMELANDUSE} in a new tab">
                          <img  src='${gif_dir}{GIFNAMELANDUSE}'  alt='{GIFNAMELANDUSE}'>
                        </a>
                      </li>
                    </ul>`
        }
        // const template = {
        //   title: null,
        //   docked:true,
        //   content:  [{
        //     // The following creates a piechart in addition to an image. The chart is
        //     // also set  up to work with related tables.
        //     // Autocasts as new MediaContent()
        //     type: "media",
        //     medianInfosTooltip: "Legends",
        //     // Autocasts as array of MediaInfo objects
        //     mediaInfos: [ 
        //     { tooltip: "Test",
        //       title: null,
        //       type: "image", // Autocasts as new ImageMediaInfo object
        //       // Autocasts as new ImageMediaInfoValue object
        //       value: {
        //         "sourceURL": gif_dir+'{GIFNAMECHANGE}',
        //         "linkURL":  gif_dir+'{GIFNAMECHANGE}',

        //       }
        //     },
        //     {
        //       title: null,
        //       type: "image", // Autocasts as new ImageMediaInfo object
        //       // Autocasts as new ImageMediaInfoValue object
        //       value: {
        //         "sourceURL":  gif_dir+'{GIFNAMELANDCOVER}',
        //         "linkURL":  gif_dir+'{GIFNAMELANDCOVER}',
        //       }
        //     },
        //     {
        //       title: null,
        //       type: "image", // Autocasts as new ImageMediaInfo object
        //       // Autocasts as new ImageMediaInfoValue object
        //       value: {
        //         "sourceURL": gif_dir+'{GIFNAMELANDUSE}',
        //         "linkURL":  gif_dir+'{GIFNAMELANDUSE}',
        //       }
        //     }
        //     ]
        //   }]
          
        // };

        const renderer = {
            type: "simple",  // autocasts as new SimpleRenderer()
            symbol: {
              type: "simple-fill",  // autocasts as new SimpleFillSymbol()
              color: fillColor,
              outline: {  // autocasts as new SimpleLineSymbol()
                width: 0.8,
                color: outlineColor
              }
            }
          };

        const labelClass = {  // autocasts as new LabelClass()
                            symbol: {
                              type: "text",  // autocasts as new TextSymbol()
                              color: "#B2ECE4",
                              haloColor:  "#372E2C",
                              haloSize: 0.8,
                              font: {  // autocast as new Font()
                                 family: "Ubuntu Mono",
                                 size: 12,
                                 // weight: "bold"
                               }
                            },
                            // labelPlacement: "above-right",
                            labelExpressionInfo: {
                              expression: "$feature."+labelFieldname
                            },
                            // maxScale: 0,
                            // minScale: 30000000,
                            
                          };

        if(isFeatureService){
        var layer = new FeatureLayer({
          url: path,
          title: name,
          visible:isFirstLayer,
          copyright: "USDA Forest Service LCMS | Google Earth Engine",
          popupTemplate: template,
          legendEnabled:true,
          renderer: renderer, //optional
          labelingInfo: [labelClass]
        });
      }else{
        var layer = new GeoJSONLayer({
          url: path,
          title: name,
          visible:isFirstLayer,
          copyright: "USDA Forest Service LCMS | Google Earth Engine",
          popupTemplate: template,
          legendEnabled:true,
          renderer: renderer, //optional
          labelingInfo: [labelClass]
      
      })};
        layerTotal++;
        layerList.push(layer);
        if(isFirstLayer){
          firstLayer = layer;
        }
        isFirstLayer = false;

         layer.when(()=>{
          console.log(name+ ' loaded')
          layerTotal--;
          updateBottomBar();
        })
      };
      function checkTimeLapseVisible(){
        let anyVisible = Object.values(timeLapseVisible).filter((k)=>k).length>0;
        if(anyVisible){
          $('#timeSlider').show();
        }else{$('#timeSlider').hide();}
      }
      function addImageryLayer(path,name,visible,isTimeLapse=false){
        console.log(name)
        var layer = new ImageryLayer({
          url: path,
          id: name,
          title:name,
          visible: visible,
          opacity: 1 ,
          copyright:'USDA Forest Service LCMS | Google Earth Engine' 
        });
        layer.when(()=>{
          console.log(name+ ' loaded')
          layerTotal--;
          updateBottomBar();
        })

        if(isTimeLapse){
          timeLapseVisible[name]=visible;
          watchUtils.watch(layer, 'visible', function (event) { 
            console.log('Layer visibility changed: '+name+event);
            timeLapseVisible[name]=event;
            checkTimeLapseVisible();
          });
        }

        layerTotal++;
        layerList.push(layer);
        
      }
      ['PuertoRico_USVI','Southeast_Alaska','CONUS'].map(function(nm){
        addImageryLayer(`https://apps.fs.usda.gov/fsgisx01/rest/services/RDW_LandscapeAndWildlife/LCMS_${nm}_Annual_Landcover/ImageServer`,`LCMS Land Cover (${nm})`,false,true);
        addImageryLayer(`https://apps.fs.usda.gov/fsgisx01/rest/services/RDW_LandscapeAndWildlife/LCMS_${nm}_Annual_Landuse/ImageServer`,`LCMS Land Use (${nm})`,false,true);
        if(nm === 'PuertoRico_USVI'){
          addImageryLayer(`https://apps.fs.usda.gov/fsgisx01/rest/services/RDW_LandscapeAndWildlife/LCMS_${nm}_Year_Highest_Prob_Fast_Loss/ImageServer`,`LCMS Fast Loss Year (${nm})`,true);
          addImageryLayer(`https://apps.fs.usda.gov/fsgisx01/rest/services/RDW_LandscapeAndWildlife/LCMS_${nm}_Year_Highest_Prob_Gain/ImageServer`,`LCMS Gain Year (${nm})`,false);
        }else{
          addImageryLayer(`https://apps.fs.usda.gov/fsgisx01/rest/services/RDW_LandscapeAndWildlife/LCMS_${nm}_Year_Of_Highest_Prob_Fast_Loss/ImageServer`,`LCMS Fast Loss Year (${nm})`,true);
          addImageryLayer(`https://apps.fs.usda.gov/fsgisx01/rest/services/RDW_LandscapeAndWildlife/LCMS_${nm}_Year_Of_Highest_Prob_Slow_Loss/ImageServer`,`LCMS Slow Loss Year (${nm})`,false);
          addImageryLayer(`https://apps.fs.usda.gov/fsgisx01/rest/services/RDW_LandscapeAndWildlife/LCMS_${nm}_Year_Of_Highest_Prob_Gain/ImageServer`,`LCMS Gain Year (${nm})`,false);
        }
        
      })
      checkTimeLapseVisible();
      addGifAreas('https://storage.googleapis.com/lcms-gifs/usfs_boundaries.geojson','USFS Forests','FORESTNAME','#1B1716',[ 0, 122, 0, 0.3 ],false);
      addGifAreas('https://storage.googleapis.com/lcms-gifs/usfs_district_boundaries.geojson','USFS Districts','districtna','#1B171A',[ 0, 122, 122, 0.3 ],false);

      // addGifAreas('https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_ForestSystemBoundaries_01/MapServer','USFS Forests','FORESTNAME','#1B1716',[ 0, 122, 0, 0.5 ],true);
      // addGifAreas('https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_RangerDistricts_01/MapServer','USFS Districts','DISTRICTNAME','#1B171A',[ 0, 122, 122, 0.5 ],true);
      
     
      const map = new Map({
        basemap: "hybrid",
        layers: layerList
      });

      const view = new MapView({
        container: "viewDiv",
        map: map
      });

     
      view.when(()=>{
          
          $('#dontShowAgainCheckbox').change(function(){
            console.log(this.checked)
            localStorage['showIntroModal-landscapes-in-motion']  = !this.checked;
          });
          if(localStorage['showIntroModal-landscapes-in-motion']  === undefined || localStorage['showIntroModal-landscapes-in-motion']  === null){
            localStorage['showIntroModal-landscapes-in-motion']  = 'true'
          }
          if(localStorage['showIntroModal-landscapes-in-motion']  === 'true'){
            $('#intro-div').show();
          }
          if(localStorage.initView !== undefined && localStorage.initView !== null && localStorage.initView !== 'null'){
            view.goTo(JSON.parse(localStorage.initView));
          }

          // time slider widget initialization
          // users can visualize daily wind information
          // for the month of Oct 2011 using time slider
          const timeSlider = new TimeSlider({
            mode: "instant",
            container:"timeSlider",
            view: view,
            timeVisible: true,
            // Oct 1 - Oct 31
            fullTimeExtent: {
              start: new Date('1985-7-1'), 
              end: new Date('2021-7-1') 
            },
            stops: {
              interval: {
                value: 1,
                unit: "years"
              }
            }
          });
          const tsExpand = new Expand({
            view: view,
            content: timeSlider.container,
            expandIconClass: "esri-icon-play-circled",
            expandTooltip: "Timelapse Slider",
            expanded :true
          });
        
          // Add the expand instance to the ui
          // view.ui.add(timeSlider, "bottom-right");
          function setExtent(){
            // firstLayer.when(()=>{
              // zoomToFullLayerExtent = function(){
              //     view.extent = firstLayer.fullExtent;
              // }
              if(localStorage.initView === undefined || localStorage.initView === null || localStorage.initView === 'null'){
                  console.log('setting extent');
                // zoomToFullLayerExtent();
                view.goTo(defaultView);
              }
              watchUtils.whenTrue(view, "stationary",function(evt){
                console.log('stationary');
                localStorage.initView = JSON.stringify({center:[view.center.longitude,view.center.latitude],zoom:view.zoom});
              });

            // }
          }
          
          setExtent();
          
            
            
          // });
          var basemapGallery = new Expand({
            content:new BasemapGallery({
              view: view
            }),
            view:view,
            expanded :false,
            expandTooltip: "Basemaps"
          })
          // Add widget to the top right corner of the view
          view.ui.add(basemapGallery, {
            position: "top-left"
          });

          let layerListObj = new LayerList({
          view: view,
          listItemCreatedFunction: function (event) {

                        // The event object contains an item property.
                        // is is a ListItem referencing the associated layer
                        // and other properties. You can control the visibility of the
                        // item, its title, and actions using this object.

                        var item = event.item;



                        // An array of objects defining actions to place in the LayerList.
                        // By making this array two-dimensional, you can separate similar
                        // actions into separate groups with a breaking line.

                        item.actionsSections = [

                            [{
                                title: "Increase opacity ",
                                className: "esri-icon-up",
                                id: "increase-opacity"
                            }, {
                                title: "Decrease opacity",
                                className: "esri-icon-down",
                                id: "decrease-opacity"
                            }]
                        ];


                    }
                
        });
      // Event listener that fires each time an action is triggered

        layerListObj.on("trigger-action", function (event) {
            console.log(event)
            // The layer visible in the view at the time of the trigger.
            var visibleLayer = event.item.layer;

            //.visible ?
            //USALayer : censusLayer;

            // Capture the action id.
            var id = event.action.id;

            if (id === "increase-opacity") {

                // if the increase-opacity action is triggered, then
                // increase the opacity of the GroupLayer by 0.25

                if (visibleLayer.opacity < 1) {
                    visibleLayer.opacity += 0.25;

                }
            } else if (id === "decrease-opacity") {

                // if the decrease-opacity action is triggered, then
                // decrease the opacity of the GroupLayer by 0.25

                if (visibleLayer.opacity > 0) {
                    visibleLayer.opacity -= 0.25;
                }
            }
        });
    
      var bgExpand = new Expand({
        view: view,
        content: layerListObj,
        expanded :false,
        expandTooltip: "Layers",
      });
    
      // Add the expand instance to the ui
      view.ui.add(bgExpand, "top-left");

      // typical usage
      let legend = new Legend({
        view: view
      });

      var bgExpand = new Expand({
        view: view,
        content: legend,
        expandIconClass: "esri-icon-key",
        expandTooltip: "Legends",
        expanded :false
      });
    
      // Add the expand instance to the ui
      view.ui.add(bgExpand, "top-left");

      $(document).ready(function() {
          window.addEventListener('resize',resizeWindow)
        resizeWindow();

      });
      })
    });

    
