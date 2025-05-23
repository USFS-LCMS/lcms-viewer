let zoomToFullLayerExtent,
  layerTotal = 0,
  maxLayers = 0,
  h,
  w,
  defaultView = { center: [-113.55467677113408, 45.68161957233809], zoom: 3 },
  timeLapseVisible = {};
function closeSplash() {
  $("#splash").hide();
}
function showSplash() {
  $("#splash").show();
  $("#intro-div").show();
}
function updateProgress(val) {
  const el = document.querySelector(".progressbar span");
  el.style.width = val + "%";
  el.innerText = val + "%";
}
function updateBottomBar() {
  if (maxLayers < layerTotal) {
    maxLayers = layerTotal;
  }
  const pct = parseInt((1 - layerTotal / maxLayers) * 100);
  updateProgress(pct);
  if (layerTotal === 0) {
    $("#loading-spinner-logo").removeClass("fa-spin");
    $("#loading-spinner").hide();
    if (localStorage["showIntroModal-landscapes-in-motion"] !== "true") {
      $("#splash").hide();
      $("#dontShowAgainCheckbox").click();
    } else {
      $("#intro-divider").hide();
    }
  } else {
    $("#loading-spinner").show();
  }
  resizeWindow();
}
//Function to handle resizing the windows properly
function resizeWindow() {
  console.log("resized");
  const margin = 5;
  h = window.innerHeight - margin;
  w = window.innerWidth;
  $("#splash").css({ "max-height": h - 50 });
  $(".esri-popup__main-container").css({ "max-height": h - 50 });
}
///////////////////////////////////////////////////////////////////////
// Check to see if gifs can be viewed
const authProxyAPIURL = "https://rcr-ee-proxy-2.herokuapp.com";
const geeAPIURL = "https://earthengine.googleapis.com";
let gcpWorking = false;

const introDivContent = {
  true: `<span>
                            <img class = 'logo'  src="./src/assets/images/lcms-icon.png" style='vertical-align:middle;' alt="LCMS logo image">
                            <h2 class = 'splash-title'>Welcome to LCMS in Motion!</h2>
                          </span>
                          <hr style='margin-top:0.75rem;margin-bottom:0.75rem;'>
                          <div class ='my-3'> LCMS is a landscape change detection program developed by the USDA Forest Service. For an overview of LCMS and to find links to other LCMS Explorers, visit the <a href="home.html" target="_blank">LCMS Homepage.</a>
                          </div> 
                          <p>The LCMS in Motion application is designed to provide a visualization of how vegetation cover, land cover, and land use have changed across US National Forests.</p>
                          <p>By clicking on a Forest or Forest District boundary, a gif animation will pop up. This animation illustrates how the selected area has changed over the past 38 years. 
                          <br>
                          Click on the animation to open it in a new tab for a larger view.
                          <br>
                          You can download the gif by right clicking and selecting <kbd>Save image as..</kbd>
                          <br>
                          When any land cover and/or land use map layers are turned on, a time lapse slider will appear in the lower right corner that allows for different years to be shown.</p>`,
  false: `<span>
                                  <img class = 'logo'   src="./src/assets/images/lcms-icon.png" style='vertical-align:none;'  alt="LCMS logo image">
                                  <h2 class = 'splash-title'>Welcome to LCMS in Motion!</h2>
                                </span>
                                <hr style='margin-top:0.75rem;margin-bottom:0.75rem;'>
                                <p>LCMS is a landscape change detection program developed by the USDA Forest Service. This application is designed to provide a visualization of how vegetation cover, land cover, and land use have changed.</p>
                                
                              
                                <p>When any land cover and/or land use map layers are turned on, a time lapse slider will appear in the lower right corner that allows for different years to be shown.</p>`,
};

///////////////////////////////////////////////////////////////////////
require([
  "esri/Map",
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
  "esri/widgets/TimeSlider",
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
  let firstLayer;

  function addGifAreas(
    path,
    name,
    labelFieldname,
    outlineColor,
    fillColor,
    isFeatureService
  ) {
    const gif_dir = "https://storage.googleapis.com/lcms-gifs/";
    const template = {
      title: null,
      docked: false,
      content: `<ul>
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
                    </ul>`,
    };

    const renderer = {
      type: "simple", // autocasts as new SimpleRenderer()
      symbol: {
        type: "simple-fill", // autocasts as new SimpleFillSymbol()
        color: fillColor,
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: 0.8,
          color: outlineColor,
        },
      },
    };

    const labelClass = {
      // autocasts as new LabelClass()
      symbol: {
        type: "text", // autocasts as new TextSymbol()
        color: "#B2ECE4",
        haloColor: "#372E2C",
        haloSize: 0.8,
        font: {
          // autocast as new Font()
          family: "Ubuntu Mono",
          size: 12,
        },
      },

      labelExpressionInfo: {
        expression: "$feature." + labelFieldname,
      },
    };
    let layer;
    if (isFeatureService) {
      layer = new FeatureLayer({
        url: path,
        title: name,
        visible: isFirstLayer,
        copyright: "USDA Forest Service LCMS | Google Earth Engine",
        popupTemplate: template,
        legendEnabled: true,
        renderer: renderer, //optional
        labelingInfo: [labelClass],
      });
    } else {
      layer = new GeoJSONLayer({
        url: path,
        title: name,
        visible: isFirstLayer,
        copyright: "USDA Forest Service LCMS | Google Earth Engine",
        popupTemplate: template,
        legendEnabled: true,
        renderer: renderer, //optional
        labelingInfo: [labelClass],
      });
    }
    layerTotal++;
    layerList.push(layer);
    if (isFirstLayer) {
      firstLayer = layer;
    }
    isFirstLayer = false;

    layer.when(() => {
      console.log(name + " loaded");
      layerTotal--;
      updateBottomBar();
    });
  }
  function checkTimeLapseVisible() {
    let anyVisible =
      Object.values(timeLapseVisible).filter((k) => k).length > 0;
    if (anyVisible) {
      $("#timeSlider").show();
    } else {
      $("#timeSlider").hide();
    }
  }
  function addImageryLayer(path, name, visible, isTimeLapse = false) {
    console.log(name);
    const layer = new ImageryLayer({
      url: path,
      id: name,
      title: name,
      visible: visible,
      opacity: 1,
      copyright: "USDA Forest Service LCMS | Google Earth Engine",
    });
    layer.when(() => {
      console.log(name + " loaded");
      layerTotal--;
      updateBottomBar();
    });

    if (isTimeLapse) {
      timeLapseVisible[name] = visible;
      watchUtils.watch(layer, "visible", function (event) {
        console.log("Layer visibility changed: " + name + event);
        timeLapseVisible[name] = event;
        checkTimeLapseVisible();
      });
    }

    layerTotal++;
    layerList.push(layer);
  }

  function load() {
    // ["Hawaii", "PuertoRico_USVI", "Southeast_Alaska", "CONUS"].map(function (
    //   nm
    // ) {
    //   addImageryLayer(
    //     `https://apps.fs.usda.gov/fsgisx01/rest/services/RDW_LandscapeAndWildlife/LCMS_${nm}_Annual_Landcover/ImageServer`,
    //     `LCMS Land Cover (${nm})`,
    //     false,
    //     true
    //   );
    //   addImageryLayer(
    //     `https://apps.fs.usda.gov/fsgisx01/rest/services/RDW_LandscapeAndWildlife/LCMS_${nm}_Annual_Landuse/ImageServer`,
    //     `LCMS Land Use (${nm})`,
    //     false,
    //     true
    //   );
    //   if (nm === "PuertoRico_USVI") {
    //     addImageryLayer(
    //       `https://apps.fs.usda.gov/fsgisx01/rest/services/RDW_LandscapeAndWildlife/LCMS_${nm}_Year_Highest_Prob_Fast_Loss/ImageServer`,
    //       `LCMS Fast Loss Year (${nm})`,
    //       true
    //     );
    //     addImageryLayer(
    //       `https://apps.fs.usda.gov/fsgisx01/rest/services/RDW_LandscapeAndWildlife/LCMS_${nm}_Year_Highest_Prob_Gain/ImageServer`,
    //       `LCMS Gain Year (${nm})`,
    //       false
    //     );
    //   } else {
    //     addImageryLayer(
    //       `https://apps.fs.usda.gov/fsgisx01/rest/services/RDW_LandscapeAndWildlife/LCMS_${nm}_Year_Of_Highest_Prob_Fast_Loss/ImageServer`,
    //       `LCMS Fast Loss Year (${nm})`,
    //       true
    //     );
    //     addImageryLayer(
    //       `https://apps.fs.usda.gov/fsgisx01/rest/services/RDW_LandscapeAndWildlife/LCMS_${nm}_Year_Of_Highest_Prob_Slow_Loss/ImageServer`,
    //       `LCMS Slow Loss Year (${nm})`,
    //       false
    //     );
    //     addImageryLayer(
    //       `https://apps.fs.usda.gov/fsgisx01/rest/services/RDW_LandscapeAndWildlife/LCMS_${nm}_Year_Of_Highest_Prob_Gain/ImageServer`,
    //       `LCMS Gain Year (${nm})`,
    //       false
    //     );
    //   }
    // });
    // checkTimeLapseVisible();

    if (gcpWorking) {
      addGifAreas(
        "https://storage.googleapis.com/lcms-gifs/usfs_boundaries.geojson",
        "U.S. Department of Agriculture, Forest Service Forests",
        "FORESTNAME",
        "#1B1716",
        [0, 122, 0, 0.3],
        false
      );
      addGifAreas(
        "https://storage.googleapis.com/lcms-gifs/usfs_district_boundaries.geojson",
        "U.S. Department of Agriculture, Forest Service Districts",
        "districtna",
        "#1B171A",
        [0, 122, 122, 0.3],
        false
      );
    }

    const map = new Map({
      basemap: "hybrid",
      layers: layerList,
    });

    const view = new MapView({
      container: "viewDiv",
      map: map,
      spatialReference: {
        wkid: "3857",
      },
    });

    view.when(() => {
      $("#intro-div-content").append(introDivContent[gcpWorking.toString()]);
      $("#dontShowAgainCheckbox").change(function () {
        console.log(this.checked);
        localStorage["showIntroModal-landscapes-in-motion"] = !this.checked;
      });
      if (
        localStorage["showIntroModal-landscapes-in-motion"] === undefined ||
        localStorage["showIntroModal-landscapes-in-motion"] === null
      ) {
        localStorage["showIntroModal-landscapes-in-motion"] = "true";
      }
      if (localStorage["showIntroModal-landscapes-in-motion"] === "true") {
        $("#intro-div").show();
      }
      if (
        localStorage.initView !== undefined &&
        localStorage.initView !== null &&
        localStorage.initView !== "null"
      ) {
        view.goTo(JSON.parse(localStorage.initView));
      }

      // time slider widget initialization
      // users can visualize daily wind information
      // for the month of Oct 2011 using time slider
      const timeSlider = new TimeSlider({
        mode: "instant",
        container: "timeSlider",
        view: view,
        timeVisible: true,
        // Oct 1 - Oct 31
        fullTimeExtent: {
          start: new Date("1985-7-1"),
          end: new Date("2023-7-1"),
        },
        stops: {
          interval: {
            value: 1,
            unit: "years",
          },
        },
      });
      const tsExpand = new Expand({
        view: view,
        content: timeSlider.container,
        expandIconClass: "esri-icon-play-circled",
        expandTooltip: "Timelapse Slider",
        expanded: true,
      });

      // Add the expand instance to the ui

      function setExtent() {
        if (
          localStorage.initView === undefined ||
          localStorage.initView === null ||
          localStorage.initView === "null"
        ) {
          console.log("setting extent");
          view.goTo(defaultView);
        }
        watchUtils.whenTrue(view, "stationary", function (evt) {
          console.log("stationary");
          localStorage.initView = JSON.stringify({
            center: [view.center.longitude, view.center.latitude],
            zoom: view.zoom,
          });
        });
      }

      setExtent();

      const basemapGallery = new Expand({
        content: new BasemapGallery({
          view: view,
        }),
        view: view,
        expanded: false,
        expandTooltip: "Basemaps",
      });
      // Add widget to the top right corner of the view
      view.ui.add(basemapGallery, {
        position: "top-left",
      });

      let layerListObj = new LayerList({
        view: view,
        listItemCreatedFunction: function (event) {
          // The event object contains an item property.
          // is is a ListItem referencing the associated layer
          // and other properties. You can control the visibility of the
          // item, its title, and actions using this object.

          const item = event.item;

          // An array of objects defining actions to place in the LayerList.
          // By making this array two-dimensional, you can separate similar
          // actions into separate groups with a breaking line.

          item.actionsSections = [
            [
              {
                title: "Increase opacity ",
                className: "esri-icon-up",
                id: "increase-opacity",
              },
              {
                title: "Decrease opacity",
                className: "esri-icon-down",
                id: "decrease-opacity",
              },
            ],
          ];
        },
      });
      // Event listener that fires each time an action is triggered

      layerListObj.on("trigger-action", function (event) {
        console.log(event);
        // The layer visible in the view at the time of the trigger.
        const visibleLayer = event.item.layer;

        // Capture the action id.
        const id = event.action.id;

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

      let bgExpand = new Expand({
        view: view,
        content: layerListObj,
        expanded: false,
        expandTooltip: "Layers",
      });

      // Add the expand instance to the ui
      view.ui.add(bgExpand, "top-left");

      // typical usage
      let legend = new Legend({
        view: view,
      });

      bgExpand = new Expand({
        view: view,
        content: legend,
        expandIconClass: "esri-icon-key",
        expandTooltip: "Legends",
        expanded: false,
      });

      // Add the expand instance to the ui
      view.ui.add(bgExpand, "top-left");

      $(document).ready(function () {
        window.addEventListener("resize", resizeWindow);
        resizeWindow();
      });
    });
  }
  ee.initialize(
    authProxyAPIURL,
    geeAPIURL,
    () => {
      gcpWorking = true;
      load();
    },
    () => {
      load();
    }
  );
});
