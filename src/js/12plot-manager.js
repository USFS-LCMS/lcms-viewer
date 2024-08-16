function addPlotCollapse() {
  var collapseContainer = "sidebar-left";
  addCollapse(
    collapseContainer,
    "plot-collapse-label",
    "plot-collapse-div",
    "PLOTS",
    '<i class="fa fa-crosshairs  mx-1" aria-hidden="true"></i>',
    true,
    ``,
    "LEGEND of the layers displayed on the map"
  );
  addAccordianContainer("plot-collapse-div", "plots-accordian");
}

function plotListFilterFunction(id) {
  console.log(id);
  var rows = $("#" + id)
    .children("tbody")
    .children("tr");
  var value = $("#" + id + "-search")
    .val()
    .toLowerCase();
  console.log(value);
  if (value !== "") {
    $("#" + id + " > ul ").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) == 0);
    });
  } else {
    $("#" + id + " > ul").filter(function () {
      $(this).toggle($(this).text().toLowerCase() !== undefined);
    });
  }

  console.log(value);
}
function addPlotProjectAccordian(name) {
  var nameID = name.replaceAll(" ", "-");

  var plotListDiv = `<input  id="${nameID}-plot-list-search" class = 'form-control bg-black ' type="text" placeholder="Search Plots.." id="myInput" onkeyup="plotListFilterFunction('${nameID}-plot-list')">
						<li id="${nameID}-plot-list"></li>`;
  addSubAccordianCard(
    "plots-accordian",
    nameID + "-accordian-label",
    nameID + "-accordian-div",
    name,
    plotListDiv,
    false,
    ``,
    "Click to expand plot project"
  );
}
function addPlotgeoJSON(plotGeoJSONPath) {
  map.data.loadGeoJson(plotGeoJSONPath);
  map.data.setStyle({ fillOpacity: 0, strokeColor: "#F00" });
}
function loadPlots(plotProjectObj) {
  if (
    plotProjectObj["plotIDField"] === null ||
    plotProjectObj["plotIDField"] === undefined
  ) {
    plotProjectObj["plotIDField"] = "PLOTID";
  }
  addPlotProjectAccordian(plotProjectObj.name);
  fetch(plotProjectObj.path)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function (json) {
      json.features.map(function (f) {
        f.name = plotProjectObj.name;
        f.properties.PLOTID = f.properties[plotProjectObj["plotIDField"]];
        addPlot(f);
      });
      Map.addLayer(
        json,
        { layerType: "geoJSONVector", strokeColor: "#F00" },
        plotProjectObj.name + " Plots",
        true,
        null,
        null,
        "Plots for: " + plotProjectObj.name,
        "reference-layer-list"
      );
    });
}

function addPlot(obj) {
  $("#" + obj.name.replaceAll(" ", "-") + "-plot-list").append(`
		 <ul class = 'plot-button border-top border-bottom m-0' onclick = 'synchronousCenterObject(${JSON.stringify(
       obj.geometry
     )});$("ul.plot-button").removeClass("simple-bg-black");$(this).addClass("simple-bg-black")'>${
    obj.properties.PLOTID
  }</ul>
		`);
}

function loadAllPlots() {
  plotsGeoJSONs.map(function (p) {
    loadPlots(p);
  });
}
////////////////////////////////////////////////////////
var r4PlotsJson = {
  name: "Region 4",
  path: "./src/data/geojson/region4_sample_9strata_NEW_g_albers_30m_box.json",
  plotIDField: "PLOTID",
};
var mls = {
  name: "Manti La Sal",
  path: "./src/data/geojson/LCMS_Sample_1000k_MLSNF_5km_g_albers_30m_box.json",
  plotIDField: "FID_1",
};
var bt = {
  name: "Bridger-Teton",
  path: "./src/data/geojson/LCMS_Sample_1000k_BTNF_g_albers_30m_box.json",
  plotIDField: "FID_1",
};
var fnf = {
  name: "Flathead",
  path: "./src/data/geojson/LCMS_Sample_1000k_FNF_GNP_g_albers_30m_box.json",
  plotIDField: "FID_1",
};
var lcmap = {
  name: "First 25k",
  path: "./src/data/geojson/conus_random_25k_s_30m_box.json",
  plotIDField: "LCMS_ID",
};
var conus1 = {
  name: "CONUS 2020",
  path: "./src/data/geojson/CONUS_plots_new_g_albers_30m_box.json",
  plotIDField: "PLOT_ID",
};
var coastalAK = {
  name: "Coastal AK 2020",
  path: "./src/data/geojson/CoastalAK_sample_NEW_g_albers_30m_box.json",
  plotIDField: "LCMS_ID",
};
var coastalAK2022 = {
  name: "Coastal AK",
  path: "./src/data/geojson/Coastal_AK_plots_202211_final_30m_box.json",
  plotIDField: "ID",
};
var prviPractice = {
  name: "PRVI Practice",
  path: "./src/data/geojson/PR_USVI_Random_Sample_100_proj_g_albers_30m_box.json",
  plotIDField: "PLOTID",
};
var prviFinal = {
  name: "PRVI Final",
  path: "./src/data/geojson/PR_sample_1100_11strata_make_ordered_chipping_g_albers_30m_box.json",
  plotIDField: "PLOTID",
};
var hiFinal = {
  name: "HI Original",
  path: "./src/data/geojson/HI_plots_1000_selected_v2_Web_Mercator_Boxes.json",
  plotIDField: "PLOTID",
};
var CONUSpractice = {
  name: "CONUS Practice",
  path: "./src/data/geojson/CONUS_training_new_30m_box.json",
  plotIDField: "LCMS_ID",
};
var hiPractice = {
  name: "Hawaii Practice",
  path: "./src/data/geojson/HI_training_30m_box.json",
  plotIDField: "PLOTID",
};
var coastalAKPractice = {
  name: "Coastal Alaska Practice",
  path: "./src/data/geojson/AK_training_30m_box.json",
  plotIDField: "PLOTID",
};
var interiorAKPractice = {
  name: "Interior Alaska Practice",
  path: "./src/data/geojson/Interior_AK_locations_for_TS_training_5test_30m_box.json",
  plotIDField: "ID",
};
var interiorAK = {
  name: "Interior Alaska",
  path: "./src/data/geojson/Interior_AK_plots_selected_30m_box.json",
  plotIDField: "PLOTID",
};

var Hawaii2024 = {
  name: "Hawaii2024",
  path: "./src/data/geojson/Additional_HI_Training_Pts_30m_box.json",
  plotIDField: "PLOTID",
};

var plotsGeoJSONs = [
  interiorAKPractice,
  interiorAK,
  Hawaii2024,
  hiFinal,
  CONUSpractice,
  coastalAKPractice,
];
