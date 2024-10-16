function stopAllTools() {
  areaChart.stopAutoCharting();
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
      title: "Measuring Tools-Area Measuring",
    },
    distance: {
      on: 'stopAllTools();startDistance();showTip("DISTANCE MEASURING",staticTemplates.distanceTip);',
      off: "stopAllTools()",
      state: false,
      title: "Measuring Tools-Distance Measuring",
    },
  },
  pixel: {
    query: {
      on: 'stopAllTools();startQuery();showTip("QUERY VISIBLE MAP LAYERS",staticTemplates.queryTip);',
      off: "stopAllTools()",
      state: false,
      title: "Pixel Tools-Query Visible Map Layers",
    },
    chart: {
      on: 'stopAllTools();startPixelChartCollection();showTip("QUERY "+mode+" TIME SERIES",staticTemplates.pixelChartTip);',
      off: "stopAllTools()",
      state: false,
      title: "Pixel Tools-Query " + mode + " Time Series",
    },
  },
  area: {
    mapBounds: {
      on: 'stopAllTools();areaChart.startAutoCharting();showTip("SUMMARIZE BY MAP BOUNDS AREA",staticTemplates.mapDefinedAreaChartTip);',
      off: "stopAllTools()",
      state: false,
      title: "Area Tools-Map Extent Area Tool",
    },
    userDefined: {
      on: 'stopAllTools();areaChart.setupChartProgress();areaChartingTabSelect("#user-defined");showTip("SUMMARIZE BY USER-DEFINED AREA",staticTemplates.userDefinedAreaChartTip);',
      off: "stopAllTools()",
      state: false,
      title: "Area Tools-User Defined Area Tool",
    },
    shpDefined: {
      on: 'stopAllTools();areaChart.setupChartProgress();areaChartingTabSelect("#shp-defined");showTip("SUMMARIZE BY UPLOADED AREA",staticTemplates.uploadAreaChartTip);',
      off: "stopAllTools()",
      state: false,
      title: "Area Tools-Upload an Area",
    },
    selectDropdown: {
      on: 'stopAllTools();areaChartingTabSelect("#pre-defined");showTip("SUMMARIZE BY PRE-DEFINED AREA",staticTemplates.selectAreaDropdownChartTip);',
      off: "stopAllTools()",
      state: false,
      title: "Area Tools-Select an Area from Dropdown",
    },
    selectInteractive: {
      on: 'stopAllTools();areaChart.setupChartProgress();turnOffVectorLayers();turnOnSelectedLayers();turnOnSelectGeoJSON();areaChartingTabSelect("#user-selected");showTip("SUMMARIZE BY PRE-DEFINED AREA",staticTemplates.selectAreaInteractiveChartTip);',
      off: "stopAllTools();turnOffSelectLayers();",
      state: false,
      title: "Area Tools-Select an Area on map",
    },
  },
};
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
    eval(tool.off);
  } else {
    eval(tool.on);
    tool.state = true;
  }
  updateToolStatusBar();
}

updateToolStatusBar();
