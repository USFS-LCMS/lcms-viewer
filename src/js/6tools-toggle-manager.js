const mode_query_key = `Pixel Tools-Query ${mode} Time Series`;
const toolCursorLookup = {
  "Measuring Tools-Area Measuring": "crosshair",
  "Measuring Tools-Distance Measuring": "crosshair",
  "Pixel Tools-Query Visible Map Layers": "help",
  "Area Tools-Map Extent Area Tool": "",
  "Area Tools-User Defined Area Tool": "crosshair",
  "Area Tools-Upload an Area": "",
  "Area Tools-Select an Area on map": "pointer",
};
toolCursorLookup[mode_query_key] = "help";
function setMapCursor() {
  map.setOptions({
    draggableCursor: toolCursorLookup[getActiveTools()[0]] || "",
  });
}

function stopAllTools() {
  areaChart.stopAutoCharting();
  areaChart.areaChartingToolName;
  stopArea();
  stopDistance();
  stopQuery();
  stopCharting();
  stopAreaCharting();
  stopCharting();
  clearQueryGeoJSON();
  turnOffUploadedLayers();

  turnOffSelectLayers();
  turnOffSelectGeoJSON();

  Object.keys(toolFunctions).map(function (t) {
    Object.keys(toolFunctions[t]).map(function (tt) {
      toolFunctions[t][tt]["state"] = false;
    });
  });
  updateToolStatusBar();
}

const toolFunctions = {
  measuring: {
    area: {
      on: 'stopAllTools();startArea();showTip("AREA MEASURING",staticTemplates.areaTip);',
      off: "stopAllTools();",
      state: false,
      clickSelector: "#measure-distance-label",
      name: "Area_Measuring",
      title: "Measuring Tools-Area Measuring",
    },
    distance: {
      on: 'stopAllTools();startDistance();showTip("DISTANCE MEASURING",staticTemplates.distanceTip);',
      off: "stopAllTools();",
      state: false,
      clickSelector: "#measure-area-label",
      name: "Distance_Measuring",
      title: "Measuring Tools-Distance Measuring",
    },
  },
  pixel: {
    query: {
      on: 'stopAllTools();startQuery();showTip("QUERY VISIBLE MAP LAYERS",staticTemplates.queryTip);',
      off: "stopAllTools();",
      state: false,
      clickSelector: "#query-label",
      name: "Pixel_Query",
      title: "Pixel Tools-Query Visible Map Layers",
    },
    chart: {
      on: 'stopAllTools();startPixelChartCollection();showTip("QUERY "+mode+" TIME SERIES",staticTemplates.pixelChartTip);',
      off: "stopAllTools();",
      state: false,
      clickSelector: "#pixel-chart-label",
      name: "Pixel_TS_Query",
      title: "Pixel Tools-Query " + mode + " Time Series",
    },
  },
  area: {
    mapBounds: {
      on: 'stopAllTools();areaChart.areaChartingToolName="map";areaChart.startAutoCharting();showTip("SUMMARIZE BY MAP BOUNDS AREA",staticTemplates.mapDefinedAreaChartTip);',
      off: "stopAllTools();",
      state: false,
      clickSelector: "#map-defined-area-chart-label",
      name: "Area_Map",
      title: "Area Tools-Map Extent Area Tool",
    },
    userDefined: {
      on: 'stopAllTools();areaChart.areaChartingToolName="user";areaChart.setupChartProgress();areaChartingTabSelect("#user-defined");showTip("SUMMARIZE BY USER-DEFINED AREA",staticTemplates.userDefinedAreaChartTip);',
      off: "stopAllTools();",
      state: false,
      clickSelector: "#user-defined-area-chart-label",
      name: "Area_User",
      title: "Area Tools-User Defined Area Tool",
    },
    shpDefined: {
      on: 'stopAllTools();areaChart.areaChartingToolName="shp";areaChart.setupChartProgress();areaChartingTabSelect("#shp-defined");showTip("SUMMARIZE BY UPLOADED AREA",staticTemplates.uploadAreaChartTip);',
      off: "stopAllTools();",
      state: false,
      clickSelector: "#upload-area-chart-label",
      name: "Area_Upload",
      title: "Area Tools-Upload an Area",
    },
    selectDropdown: {
      on: 'stopAllTools();areaChartingTabSelect("#pre-defined");showTip("SUMMARIZE BY PRE-DEFINED AREA",staticTemplates.selectAreaDropdownChartTip);',
      off: "stopAllTools();",
      state: false,
      name: "Area_Select_Dropdown",
      title: "Area Tools-Select an Area from Dropdown",
    },
    selectInteractive: {
      on: 'stopAllTools();areaChart.areaChartingToolName="select";areaChart.setupChartProgress();turnOffVectorLayers();turnOnSelectedLayers();turnOnSelectGeoJSON();areaChartingTabSelect("#user-selected");showTip("SUMMARIZE BY PRE-DEFINED AREA",staticTemplates.selectAreaInteractiveChartTip);', //chartSelectedAreas(false);console.log("here")',
      off: "stopAllTools();turnOffSelectLayers();",
      state: false,
      clickSelector: "#select-area-interactive-chart-label",
      name: "Area_Select_Interactive",
      title: "Area Tools-Select an Area on map",
    },
  },
};

const toolFunctionsFlat = {};
Object.keys(toolFunctions).map((categoryK) => {
  const categoryO = toolFunctions[categoryK];
  Object.keys(categoryO).map(
    (k) => (toolFunctionsFlat[categoryO[k].name] = categoryO[k].clickSelector)
  );
});
function getActiveTools() {
  const out = [];

  Object.keys(toolFunctions).map(function (t) {
    Object.keys(toolFunctions[t]).map(function (tt) {
      const state = toolFunctions[t][tt]["state"];
      const title = toolFunctions[t][tt]["title"];
      if (state) {
        out.push(title);
      }
    });
  });
  return out;
}
function getActiveToolsList() {
  const out = [];

  Object.keys(toolFunctions).map(function (t) {
    Object.keys(toolFunctions[t]).map(function (tt) {
      const state = toolFunctions[t][tt]["state"];
      if (state) {
        out.push([t, tt]);
      }
    });
  });
  return out;
}
function updateToolStatusBar() {
  let somethingShown = false;
  $("#current-tool-selection").empty();
  $("#current-tool-selection").append(`Active tools: `);
  Object.keys(toolFunctions).map(function (t) {
    Object.keys(toolFunctions[t]).map(function (tt) {
      const state = toolFunctions[t][tt]["state"];
      const title = toolFunctions[t][tt]["title"];
      if (state) {
        $("#current-tool-selection").append(`${title}`);
        somethingShown = true;
      }
    });
  });
  if (!somethingShown) {
    $("#current-tool-selection").append(`No active tools`);
  } else {
    ga(
      "send",
      "event",
      "tool-active",
      mode,
      $("#current-tool-selection").html().split(": ")[1]
    );
  }
}

function toggleTool(tool) {
  if (tool.state) {
    urlParams.activeTool = undefined;
    eval(tool.off);
  } else {
    urlParams.activeTool = tool.name;
    eval(tool.on);
    tool.state = true;
  }
  updateToolStatusBar();
}

updateToolStatusBar();
