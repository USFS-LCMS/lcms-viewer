/*This script constructs the page depending on the chosen mode*/
/*Put main elements on body*/
$("body").append(staticTemplates.map);

$("body").append(staticTemplates.mainContainer);
$("body").append(staticTemplates.sidebarLeftContainer);

$("body").append(staticTemplates.geeSpinner);

$("body").append(staticTemplates.bottomBar);

// $('#summary-spinner').show();

$("#main-container").append(staticTemplates.sidebarLeftToggler);
if (mode === "lcms-dashboard") {
  $("body").append(staticTemplates.lcmsSpinner);
  $("body").append(staticTemplates.dashboardResultsContainer);
}
$("#sidebar-left-header").append(staticTemplates.topBanner);

/////////////////////////////////////////////////////////////////////
/*Check to see if modals should be shown*/
if (localStorage["showIntroModal-" + mode] == undefined) {
  localStorage["showIntroModal-" + mode] = "true";
}

/////////////////////////////////////////////////////////////////////

$("#sidebar-left-header").append(staticTemplates.placesSearchDiv);

if (
  [
    "LCMS",
    "lcms-base-learner",
    "Ancillary",
    "LT",
    "IDS",
    "lcms-dashboard",
  ].indexOf(mode) > -1
) {
  $("#title-banner-icon-right").attr(
    "src",
    "./src/assets/images/logo_icon_lcms-data-viewer.svg"
  );
  $("#title-banner-icon-right").attr("alt", "LCMS icon");
} else if (mode === "MTBS") {
  $("#title-banner-icon-right").attr(
    "src",
    "./src/assets/images/mtbs-logo.png"
  );
  $("#title-banner-icon-right").attr("alt", "MTBS icon");
} else {
  $("#title-banner-icon-right").hide();
}

function adjustTitleBanner() {
  $(".title-banner-icon").height(convertRemToPixels(1.5));
  $("#title-banner").fitText(1.6);
  setTimeout(() => {
    $("#title-banner").addClass("noWrap");
    $(".title-banner-icon").height(
      $(".title-banner-label").height() - convertRemToPixels(0.5)
    );
    $("#title-banner").removeClass("noWrap");
  }, 500);
}
adjustTitleBanner();

function populateDownloads() {
  const toggler = document.getElementsByClassName("caret");

  for (let i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener("click", function () {
      this.parentElement.querySelector(".nested").classList.toggle("active");
      this.classList.toggle("caret-down");
    });
  }
}

function toggleAdvancedOn() {
  $("#threshold-container").slideDown();
  $("#advanced-radio-container").slideDown();
}
function toggleAdvancedOff() {
  $("#threshold-container").slideUp();
  $("#advanced-radio-container").slideUp();
}
/////////////////////////////////////////////////////////////////////
/*Start adding elements to page based on chosen mode*/
if (mode === "LCMS-pilot" || mode === "LCMS") {
  const minYear = startYear;
  const maxYear = endYear;
  if (urlParams.startYear == null || urlParams.startYear == undefined) {
    urlParams.startYear = startYear;
  }
  if (urlParams.endYear == null || urlParams.endYear == undefined) {
    urlParams.endYear = endYear;
  }
  if (
    urlParams.addLCMSTimeLapsesOn == null ||
    urlParams.addLCMSTimeLapsesOn == undefined
  ) {
    urlParams.addLCMSTimeLapsesOn = "no";
  }

  /*Construct panes in left sidebar*/
  addCollapse(
    "sidebar-left",
    "parameters-collapse-label",
    "parameters-collapse-div",
    "PARAMETERS",
    `<i role="img" class="fa fa-sliders mr-1" aria-hidden="true"></i>`,
    false,
    null,
    "Adjust parameters used to filter and sort LCMS products"
  );
  addCollapse(
    "sidebar-left",
    "layer-list-collapse-label",
    "layer-list-collapse-div",
    "LCMS DATA",
    `<img class='panel-title-svg-sm'alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
    true,
    null,
    "LCMS DATA layers to view on map"
  );
  addCollapse(
    "sidebar-left",
    "reference-layer-list-collapse-label",
    "reference-layer-list-collapse-div",
    "REFERENCE DATA",
    `<img class='panel-title-svg-lg'  alt="Layers icon" src="./src/assets/Icons_svg/data-layers_ffffff.svg">`,
    false,
    null,
    "Additional relevant layers to view on map intended to provide context for LCMS DATA"
  );

  addCollapse(
    "sidebar-left",
    "tools-collapse-label",
    "tools-collapse-div",
    "TOOLS",
    `<img class='panel-title-svg-lg'  alt="Tools icon" src="./src/assets/Icons_svg/tools_ffffff.svg">`,
    false,
    "",
    "Tools to measure and chart data provided on the map"
  );

  addCollapse(
    "sidebar-left",
    "download-collapse-label",
    "download-collapse-div",
    "DOWNLOAD DATA",
    `<img class='panel-title-svg-lg'  alt="Downloads icon" src="./src/assets/Icons_svg/dowload_ffffff.svg">`,
    false,
    ``,
    "Download LCMS products for further analysis"
  );
  addCollapse(
    "sidebar-left",
    "support-collapse-label",
    "support-collapse-div",
    "SUPPORT",
    `<img class='panel-title-svg-lg'  alt="Support icon" src="./src/assets/Icons_svg/support_ffffff.svg">`,
    false,
    ``,
    "If you need any help"
  );

  //Construct parameters form

  if (["standard", "advanced"].indexOf(urlParams.analysisMode) === -1) {
    urlParams.analysisMode = "standard";
  }
  if (["year", "prob"].indexOf(urlParams.summaryMethod) === -1) {
    urlParams.summaryMethod = "year";
  }

  const tAnalysisMode = urlParams.analysisMode;
  const tAddLCMSTimeLapsesOn = urlParams.addLCMSTimeLapsesOn;
  if (mode === "LCMS") {
    addRadio(
      "parameters-collapse-div",
      "addTimeLapses-radio",
      "Add LCMS Time Lapses:",
      "No",
      "Yes",
      "urlParams.addLCMSTimeLapsesOn",
      "no",
      "yes",
      null,
      null,
      "Add interactive time lapse of LCMS Change, Land Cover, and Land Use products. This will slow down the map loading"
    );
    $("#parameters-collapse-div").append(`<hr>`);
    if (tAddLCMSTimeLapsesOn === "yes") {
      $("#addTimeLapses-radio-second_toggle_label").click();
    }
  }
  addRadio(
    "parameters-collapse-div",
    "analysis-mode-radio",
    "Choose which mode:",
    "Standard",
    "Advanced",
    "urlParams.analysisMode",
    "standard",
    "advanced",
    "toggleAdvancedOff",
    "toggleAdvancedOn",
    "Standard mode provides the core LCMS products based on carefully selected parameters. Advanced mode provides additional LCMS products and parameter options"
  );

  urlParams.analysisMode = tAnalysisMode;
  $("#parameters-collapse-div").append(`<hr>`);

  addDualRangeSlider(
    "parameters-collapse-div",
    "Choose analysis year range:",
    "urlParams.startYear",
    "urlParams.endYear",
    minYear,
    maxYear,
    urlParams.startYear,
    urlParams.endYear,
    1,
    "analysis-year-slider",
    "null",
    "Years of LCMS data to include for land cover, land use, loss, and gain"
  );

  $("#parameters-collapse-div").append(`<hr>
                                          <div id='threshold-container' style="display:none;width:100%"></div>
                                          <div id='advanced-radio-container' style="display: none;"></div>`);

  if (mode === "LCMS-pilot") {
    addRangeSlider(
      "threshold-container",
      "Choose loss threshold:",
      "lowerThresholdDecline",
      0,
      1,
      lowerThresholdDecline,
      0.05,
      "decline-threshold-slider",
      "null",
      "Threshold window for detecting loss.  Any loss probability greater than or equal to this value will be flagged as loss "
    );
    $("#threshold-container").append(`<hr>`);
    addRangeSlider(
      "threshold-container",
      "Choose gain threshold:",
      "lowerThresholdRecovery",
      0,
      1,
      lowerThresholdRecovery,
      0.05,
      "recovery-threshold-slider",
      "null",
      "Threshold window for detecting gain.  Any gain probability greater than or equal to this value will be flagged as gain "
    );
    $("#advanced-radio-container").append(`<hr>`);
    $("#advanced-radio-container").append(
      `<div id = 'fast-slow-threshold-container' ></div>`
    );
    addRangeSlider(
      "fast-slow-threshold-container",
      "Choose slow loss threshold:",
      "lowerThresholdSlowLoss",
      0,
      1,
      lowerThresholdSlowLoss,
      0.05,
      "slow-loss-threshold-slider",
      "null",
      "Threshold window for detecting loss.  Any loss probability greater than or equal to this value will be flagged as loss "
    );
    $("#fast-slow-threshold-container").append(`<hr>`);
    addRangeSlider(
      "fast-slow-threshold-container",
      "Choose fast loss threshold:",
      "lowerThresholdFastLoss",
      0,
      1,
      lowerThresholdFastLoss,
      0.05,
      "fast-loss-threshold-slider",
      "null",
      "Threshold window for detecting loss.  Any loss probability greater than or equal to this value will be flagged as loss "
    );
    $("#advanced-radio-container").append(`<hr>`);

    addRadio(
      "advanced-radio-container",
      "treemask-radio",
      "Constrain analysis to areas with trees:",
      "Yes",
      "No",
      "applyTreeMask",
      "yes",
      "no",
      null,
      null,
      "Whether to constrain LCMS products to only treed areas. Any area LCMS classified as tree cover 2 or more years will be considered tree. Will reduce commission errors typical in agricultural and water areas, but may also reduce changes of interest in these areas."
    );
    $("#advanced-radio-container").append(`<hr>`);
  }
  const tSummaryMethod = urlParams.summaryMethod;
  addRadio(
    "advanced-radio-container",
    "summaryMethod-radio",
    "Summary method:",
    "Most recent year",
    "Highest prob",
    "urlParams.summaryMethod",
    "year",
    "prob",
    null,
    null,
    "How to choose which value for disturbance and growth to display.  Choose the value with the highest model confidence or from the most recent year above the threshold."
  );
  urlParams.summaryMethod = tSummaryMethod;

  $("#advanced-radio-container").append(`<hr>`);
  $("#parameters-collapse-div").append(staticTemplates.reRunButton);

  //Set up layer lists
  $("#layer-list-collapse-div").append(
    `<ul id="layer-list" class = "layer-list"></ul>`
  );
  $("#reference-layer-list-collapse-div").append(
    `<ul id="reference-layer-list" class = "layer-list"></ul>`
  );

  if (mode === "LCMS") {
    function populateLCMSDownloads() {
      const toggler = document.getElementsByClassName("caret");

      for (let i = 0; i < toggler.length; i++) {
        toggler[i].addEventListener("click", function () {
          this.parentElement
            .querySelector(".nested")
            .classList.toggle("active");

          this.classList.toggle("caret-down");
        });
      }
    }
    $("#download-collapse-div").append(
      staticTemplates.lcmsProductionDownloadDiv
    );
  } else {
    $("#download-collapse-div").append(staticTemplates.downloadDiv);
  }
  $("#support-collapse-div").append(staticTemplates.supportDiv);

  if (tAnalysisMode === "advanced") {
    $("#analysis-mode-radio-second_toggle_label").click();
  }
  if (tSummaryMethod === "prob") {
    $("#summaryMethod-radio-second_toggle_label").click();
  }
} else if (mode === "lcms-dashboard") {
  $("#title-banner").fitText(1.7);
  const minYear = startYear;
  const maxYear = endYear;
  if (urlParams.startYear == null || urlParams.startYear == undefined) {
    urlParams.startYear = startYear;
  }
  if (urlParams.endYear == null || urlParams.endYear == undefined) {
    urlParams.endYear = endYear;
  }

  $("#sidebar-left-header").append(staticTemplates.dashboardProgressDiv);

  addCollapse(
    "dashboard-results-list",
    "charts-collapse-label",
    "charts-collapse-div",
    "CHARTS",
    `<i role="img" class="fa fa-bar-chart mr-1" aria-hidden="true"></i>`,
    true,
    null,
    "Line chart LCMS summary results"
  );

  addCollapse(
    "dashboard-results-list",
    "tables-collapse-label",
    "tables-collapse-div",
    "TABLES",
    `<i role="img" class="fa fa-list mr-1" aria-hidden="true"></i>`,
    true,
    null,
    "Tabular LCMS summary results"
  );

  $("#tables-collapse-div").append(
    staticTemplates.dashboardHighlightsContainer
  );

  $("#charts-collapse-div").removeClass("px-5");
  $("#charts-collapse-div").addClass("px-3");
  $("#tables-collapse-div").removeClass("px-5");
  $(".plotly-chart").css("margin-left", "");
  $("#charts-collapse-label").on("click", () => {
    console.log("clicked");
    updateDashboardCharts();
  });
  addCollapse(
    "sidebar-left",
    "parameters-collapse-label",
    "parameters-collapse-div",
    "PARAMETERS",
    `<i role="img" class="fa fa-sliders mr-1" aria-hidden="true"></i>`,
    false,
    null,
    "Adjust parameters used to filter and sort LCMS products as well as change how summary areas are selected"
  );

  addCollapse(
    "sidebar-left",
    "layer-list-collapse-label",
    "layer-list-collapse-div",
    "LCMS SUMMARY AREAS",
    `<img class='panel-title-svg-sm'alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
    true,
    null,
    "LCMS summary areas to view on map"
  );

  $("#sidebar-left").append('<div id="charts-highlights-placeholder"</div>');
  addCollapse(
    "sidebar-left",
    "reference-layer-list-collapse-label",
    "reference-layer-list-collapse-div",
    "LCMS DATA",
    `<img class='panel-title-svg-sm'alt="LCMS icon" src="./src/assets/Icons_svg/logo_icon_lcms-data-viewer.svg">`,
    false,
    null,
    "LCMS DATA layers to view on map"
  );

  addCollapse(
    "sidebar-left",
    "support-collapse-label",
    "support-collapse-div",
    "SUPPORT",
    `<img class='panel-title-svg-lg'  alt="Support icon" src="./src/assets/Icons_svg/support_ffffff.svg">`,
    false,
    ``,
    "If you need any help"
  );
  if (!urlParams.dashboardAreaSelectionMode) {
    urlParams.dashboardAreaSelectionMode = {
      "View-Extent": false,
      Click: true,
      "Drag-Box": false,
    };
  }
  addMultiRadio(
    "parameters-collapse-div",
    "summary-area-selection-radio",
    "Choose how to select areas",
    "dashboardAreaSelectionMode",
    urlParams.dashboardAreaSelectionMode
  );
  //////////////////////////////////// Add summaryArea to question dict in future////////////////////////////////////////////
  window.questionDict = {
    fire: {
      title: "Post Fire Succession",
      hoverText: "Some more info about fire succession",
      productHighlightClasses: {
        "Land-Cover": true,
        "Land-Use": false,
        Change: true,
      },
      changeHighlightClasses: {
        Stable: false,
        "Slow-Loss": true,
        "Fast-Loss": true,
        Gain: true,
      },
      lcHighlightClasses: {
        Trees: true,
        "Tall-Shrubs": false,
        Shrubs: true,
        "Grass-Forb-Herb": true,
        "Barren-or-Impervious": true,
        "Snow-or-Ice": false,
        Water: false,
      },
      luHighlightClasses: {
        Agriculture: false,
        Developed: false,
        Forest: false,
        "Non-Forest-Wetland": false,
        "Rangeland-or-Pasture": false,
        Other: false,
      },
    },
    glacialRecession: {
      title: "Glacial Recession",
      hoverText: "Some more info about glacial succession",
      productHighlightClasses: {
        "Land-Cover": true,
        "Land-Use": false,
        Change: false,
      },
      changeHighlightClasses: {
        Stable: false,
        "Slow-Loss": false,
        "Fast-Loss": false,
        Gain: false,
      },
      lcHighlightClasses: {
        Trees: false,
        "Tall-Shrubs": true,
        Shrubs: false,
        "Grass-Forb-Herb": false,
        "Barren-or-Impervious": true,
        "Snow-or-Ice": true,
        Water: true,
      },
      luHighlightClasses: {
        Agriculture: false,
        Developed: false,
        Forest: false,
        "Non-Forest-Wetland": false,
        "Rangeland-or-Pasture": false,
        Other: false,
      },
    },
    forestToDeveloped: {
      title: "Forest and Agriculture to Developed",
      hoverText: "Forest and Agriculture land changing to developed",
      productHighlightClasses: {
        "Land-Cover": false,
        "Land-Use": true,
        Change: false,
      },
      changeHighlightClasses: {
        Stable: false,
        "Slow-Loss": false,
        "Fast-Loss": false,
        Gain: false,
      },
      lcHighlightClasses: {
        Trees: false,
        "Tall-Shrubs": false,
        Shrubs: false,
        "Grass-Forb-Herb": false,
        "Barren-or-Impervious": false,
        "Snow-or-Ice": false,
        Water: false,
      },
      luHighlightClasses: {
        Agriculture: true,
        Developed: true,
        Forest: true,
        "Non-Forest-Wetland": false,
        "Rangeland-or-Pasture": false,
        Other: false,
      },
    },
    waterLoss: {
      title: "Water Change",
      hoverText: "Loss of Water",
      productHighlightClasses: {
        "Land-Cover": true,
        "Land-Use": false,
        Change: true,
      },
      changeHighlightClasses: {
        Stable: false,
        "Slow-Loss": false,
        "Fast-Loss": true,
        Gain: false,
      },
      lcHighlightClasses: {
        Trees: false,
        "Tall-Shrubs": false,
        Shrubs: false,
        "Grass-Forb-Herb": false,
        "Barren-or-Impervious": false,
        "Snow-or-Ice": false,
        Water: true,
      },
      luHighlightClasses: {
        Agriculture: false,
        Developed: false,
        Forest: false,
        "Non-Forest-Wetland": false,
        "Rangeland-or-Pasture": false,
        Other: false,
      },
    },
    customQuestion: {
      title: "Custom - Choose your own Advanced Parameters to summarize",
      hoverText:
        "All products turned on for charting but empty until populated by user",
      productHighlightClasses: {
        "Land-Cover": true,
        "Land-Use": true,
        Change: true,
      },
      changeHighlightClasses: {
        Stable: false,
        "Slow-Loss": false,
        "Fast-Loss": false,
        Gain: false,
      },
      lcHighlightClasses: {
        Trees: false,
        "Tall-Shrubs": false,
        Shrubs: false,
        "Grass-Forb-Herb": false,
        "Barren-or-Impervious": false,
        "Snow-or-Ice": false,
        Water: false,
      },
      luHighlightClasses: {
        Agriculture: false,
        Developed: false,
        Forest: false,
        "Non-Forest-Wetland": false,
        "Rangeland-or-Pasture": false,
        Other: false,
      },
    },
  };
  // a variable to establish whether a 'share'/'deep' link is in play
  window.deepLink = false;

  // Use first listed question as default. If the questionVar is undefined/null, then the first question is default; otherwise a share link is in use
  if (urlParams.questionVar == undefined || urlParams.questionVar === null) {
    urlParams.questionVar = Object.keys(questionDict)[0];
  } else {
    deepLink = true;
  }

  // creates a Bootstrap dropdown to contain the questions
  function makeQuestionDropdown() {
    addDropdown(
      "parameters-collapse-div",
      "questions-dashboard-dropdown",
      "Learn More About",
      "urlParams.questionVar",
      "Choose a Topic to automatically select certain LCMS products to summarize"
    );
  }

  // populates the dropdown with the questions (keys) from the questionDict
  function populateQuestionDropdown() {
    Object.keys(questionDict).map((k) => {
      addDropdownItem(
        "questions-dashboard-dropdown",
        questionDict[k].title,
        k,
        questionDict[k].hoverText
      );
    });
  }

  // changes the LCMS product selections based on the question chosen
  //////////////////////////////// add summary area as part of Question functionality in future//////////////////////////////////////////
  function selectQuestion(selectedQuestion) {
    const selectedProducts = selectedQuestion.productHighlightClasses;
    Object.keys(selectedProducts).map((k) => {
      const checkboxID = `#productHighlightClasses${k}-checkbox`;

      $(checkboxID).prop("checked", selectedProducts[k]);
      urlParams.productHighlightClasses[k] = selectedProducts[k];
    });
    const selectedChangeClasses = selectedQuestion.changeHighlightClasses;

    Object.keys(selectedChangeClasses).map((k) => {
      const checkboxID = `#changeHighlightClasses${k}-checkbox`;

      $(checkboxID).prop("checked", selectedChangeClasses[k]);
      urlParams.changeHighlightClasses[k] = selectedChangeClasses[k];
    });
    const selectedLCclasses = selectedQuestion.lcHighlightClasses;

    Object.keys(selectedLCclasses).map((k) => {
      const checkboxID = `#lcHighlightClasses${k}-checkbox`;

      $(checkboxID).prop("checked", selectedLCclasses[k]);
      urlParams.lcHighlightClasses[k] = selectedLCclasses[k];
    });
    const selectedluClasses = selectedQuestion.luHighlightClasses;

    Object.keys(selectedluClasses).map((k) => {
      const checkboxID = `#luHighlightClasses${k}-checkbox`;

      $(checkboxID).prop("checked", selectedluClasses[k]);
      urlParams.luHighlightClasses[k] = selectedluClasses[k];
    });

    updateHighlightsProductSelectionDict();
    updateDashboardHighlights();
    updateDashboardCharts();
  }

  function listenForQuestionChangechangeQuestion() {
    $("select#questions-dashboard-dropdown").change(() => {
      console.log("A question was asked");
      selectQuestion(questionDict[urlParams.questionVar]);
    });
  }

  makeQuestionDropdown();
  populateQuestionDropdown();
  $("#questions-dashboard-dropdown").val(urlParams.questionVar);
  listenForQuestionChangechangeQuestion();

  addDualRangeSlider(
    "parameters-collapse-div",
    "Choose analysis year range:",
    "urlParams.startYear",
    "urlParams.endYear",
    minYear,
    maxYear,
    urlParams.startYear,
    urlParams.endYear,
    1,
    "analysis-year-slider",
    "null",
    "Years of LCMS data to include for land cover, land use, loss, and gain",
    null,
    () => {
      updateDashboardCharts();
      updateDashboardHighlights();
    }
  );

  addSubCollapse(
    "parameters-collapse-div",
    "advanced-dashboard-params-label",
    "advanced-dashboard-params-div",
    "Advanced Parameters",
    "",
    false,
    ""
  );
  if (urlParams.chartUnits === null || urlParams.chartUnits === undefined) {
    urlParams.chartUnits = { Percentage: true, Acres: false, Hectares: false };
  }
  addMultiRadio(
    "advanced-dashboard-params-div",
    "which-units-radio",
    "Chart Area Units",
    "chartFormat",
    urlParams.chartUnits
  );

  if (urlParams.pairwiseDiff === null || urlParams.pairwiseDiff === undefined) {
    urlParams.pairwiseDiff = { Annual: true, "Annual-Change": false };
  }
  addMultiRadio(
    "advanced-dashboard-params-div",
    "summary-pairwise-diff-radio",
    "Annual Amount or Change in Annual Amount",
    "pairwiseDiff",
    urlParams.pairwiseDiff
  );

  const highlightsProductsLookup = {
    Land_Cover: "Land-Cover",
    Land_Use: "Land-Use",
    Change: "Change",
  };
  const highlightsLCLookup = {
    Trees: "Trees",
    "Tall-Shrubs": "Tall Shrubs",
    Shrubs: "Shrubs",
    "Grass-Forb-Herb": "Grass/Forb/Herb",
    "Barren-or-Impervious": "Barren or Impervious",
    Water: "Water",
    "Snow-or-Ice": "Snow or Ice",
  };
  const highlightsLULookup = {
    Agriculture: "Agriculture",
    Developed: "Developed",
    Forest: "Forest",
    "Non-Forest-Wetland": "Non-Forest Wetland",
    "Rangeland-or-Pasture": "Rangeland or Pasture",
    Other: "Other",
  };
  const highlightsChangeLookup = {
    Stable: "Stable",
    "Slow-Loss": "Slow Loss",
    "Fast-Loss": "Fast Loss",
    Gain: "Gain",
  };

  window.highlightLCMSProducts = {
    Product: [],
    Land_Cover: [],
    Land_Use: [],
    Change: [],
  };
  window.highlightsSortingDict = {
    Trees: "asc",
    "Tall-Shrubs": "desc",
    Shrubs: "desc",
    "Grass/Forb/Herb": "desc",
    "Barren or Impervious": "desc",
    Water: "asc",
    "Snow or Ice": "asc",
    Agriculture: "asc",
    Developed: "desc",
    Forest: "asc",
    "Non-Forest Wetland": "asc",
    "Rangeland or Pasture": "desc",
    Other: "desc",
    Stable: "asc",
    "Slow Loss": "desc",
    "Fast Loss": "desc",
    Gain: "desc",
  };
  function updateHighlightsProductSelectionDict() {
    highlightLCMSProducts["Product"] = Object.keys(productHighlightClasses)
      .filter((k) => productHighlightClasses[k])
      .map((v) => highlightsProductsLookup[v]);
    highlightLCMSProducts["Land_Cover"] = Object.keys(lcHighlightClasses)
      .filter((k) => lcHighlightClasses[k])
      .map((v) => highlightsLCLookup[v]);
    highlightLCMSProducts["Land_Use"] = Object.keys(luHighlightClasses)
      .filter((k) => luHighlightClasses[k])
      .map((v) => highlightsLULookup[v]);
    highlightLCMSProducts["Change"] = Object.keys(changeHighlightClasses)
      .filter((k) => changeHighlightClasses[k])
      .map((v) => highlightsChangeLookup[v]);
  }
  // all three LCMS products turned on by default at initial load
  if (
    urlParams.productHighlightClasses === null ||
    urlParams.productHighlightClasses === undefined
  ) {
    urlParams.productHighlightClasses = {
      Change: true,
      "Land-Cover": true,
      "Land-Use": true,
    };
  }
  window.productHighlightClasses = urlParams.productHighlightClasses;

  if (
    urlParams.annualTransition === null ||
    urlParams.annualTransition === undefined
  ) {
    urlParams.annualTransition = { Annual: true, Transition: false };
  }
  addCheckboxes(
    "advanced-dashboard-params-div",
    "annual-transition-radio",
    "Choose which summary methods to chart",
    "annualTransition",
    urlParams.annualTransition
  );

  $("#advanced-dashboard-params-div").append("<hr>");

  // default change products at initial load
  if (
    urlParams.changeHighlightClasses === null ||
    urlParams.changeHighlightClasses === undefined
  ) {
    urlParams.changeHighlightClasses = {
      Stable: false,
      "Slow-Loss": true,
      "Fast-Loss": true,
      Gain: true,
    };
  }
  addCheckboxes(
    "advanced-dashboard-params-div",
    "change-highlights-radio",
    "Change Classes",
    "changeHighlightClasses",
    urlParams.changeHighlightClasses
  );
  $("#advanced-dashboard-params-div").append("<hr>");

  // default LC products at initial load
  if (
    urlParams.lcHighlightClasses === null ||
    urlParams.lcHighlightClasses === undefined
  ) {
    urlParams.lcHighlightClasses = {
      Trees: true,
      "Tall-Shrubs": false,
      Shrubs: true,
      "Grass-Forb-Herb": true,
      "Barren-or-Impervious": false,
      "Snow-or-Ice": false,
      Water: false,
    };
  }
  addCheckboxes(
    "advanced-dashboard-params-div",
    "lc-highlights-radio",
    "Land Cover Classes",
    "lcHighlightClasses",
    urlParams.lcHighlightClasses
  );

  $("#advanced-dashboard-params-div").append("<hr>");
  // default LU products at initial load
  if (
    urlParams.luHighlightClasses === null ||
    urlParams.luHighlightClasses === undefined
  ) {
    urlParams.luHighlightClasses = {
      Agriculture: false,
      Developed: false,
      Forest: false,
      "Non-Forest-Wetland": false,
      Other: false,
      "Rangeland-or-Pasture": false,
    };
  }
  addCheckboxes(
    "advanced-dashboard-params-div",
    "lu-highlights-radio",
    "Land Use Classes",
    "luHighlightClasses",
    urlParams.luHighlightClasses
  );
  $(
    "#lc-highlights-radio,#lu-highlights-radio,#change-highlights-radio"
  ).change(() => {
    if (Object.values(urlParams.changeHighlightClasses).indexOf(true) > -1) {
      urlParams.productHighlightClasses["Change"] = true;
    } else {
      urlParams.productHighlightClasses["Change"] = false;
    }
    if (Object.values(urlParams.lcHighlightClasses).indexOf(true) > -1) {
      urlParams.productHighlightClasses["Land-Cover"] = true;
    } else {
      urlParams.productHighlightClasses["Land-Cover"] = false;
    }
    if (Object.values(urlParams.luHighlightClasses).indexOf(true) > -1) {
      urlParams.productHighlightClasses["Land-Use"] = true;
    } else {
      urlParams.productHighlightClasses["Land-Use"] = false;
    }
    updateHighlightsProductSelectionDict();
    updateDashboardHighlights();
    updateDashboardCharts();
  });
  updateHighlightsProductSelectionDict();
  $("#advanced-dashboard-params-div").append("<hr>");

  if (urlParams.ciLevel === null || urlParams.ciLevel === undefined) {
    urlParams.ciLevel = { 90: false, 95: true, 99: false };
  }

  addMultiRadio(
    "advanced-dashboard-params-div",
    "ci-level-radio",
    "Confidence Interval Significance Level",
    "ciLevel",
    urlParams.ciLevel
  );

  $("#which-units-radio,#which-products-radio").change(() => {
    updateDashboardCharts();
    updateDashboardHighlights();
  });

  $("#annual-transition-radio").change(() => {
    updateDashboardCharts();
  });
  $("#ci-level-radio").change(() => {
    updateDashboardHighlights();
  });

  $("#analysis-year-slider-container").prop(
    "title",
    "Choose which years to include in the annual charts. The first and last year of this range of years will be uses for the highlights summaries."
  );
  $("#summary-area-selection-radio").prop(
    "title",
    'Choose how to select summary areas. "View-Extent" will automatically select all areas within the current map view extent. "Click" will all you to select areas by clicking on them. "Drag-Box" will allow you to select by creating a box'
  );
  $("#summary-pairwise-diff-radio").prop(
    "title",
    "Choose whether to show the amount or the amount of change from the previous year of the selected area(s) of each cover/use/change type"
  );
  $("#which-products-radio").prop(
    "title",
    "Choose which LCMS products to show in the charts, highlights, and report"
  );
  $("#annual-transition-radio").prop(
    "title",
    "Choose which chart type to show. Annual will show the percent for each year while transition will show a Sankey chart"
  );
  $("#change-highlights-radio").prop(
    "title",
    "Choose which change classes to include in the highlights tables"
  );
  $("#lc-highlights-radio").prop(
    "title",
    "Choose which land cover classes to include in the highlights tables"
  );
  $("#lu-highlights-radio").prop(
    "title",
    "Choose which land use classes to include in the highlights tables"
  );
  $("#which-units-radio").prop(
    "title",
    "Choose which units to represent summary areas in charts and tables"
  );
  $("#ci-level-radio").prop(
    "title",
    "Choose which significance level to use for computing the confidence interval and significant change"
  );
  $("#annualTransitionannualTransitionTransition-checkbox-label").prop(
    "title",
    "Select this to show Sankey charts"
  );
  $("#layer-list-collapse-div").append(
    `<ul id="layer-list" class = "layer-list"></ul>`
  );
  $("#reference-layer-list-collapse-div").append(
    `<ul id="reference-layer-list" class = "layer-list"></ul>`
  );
} else if (mode === "lcms-base-learner") {
  canExport = false;
  startYear = 1984;
  endYear = 2023;
  const minYear = startYear;
  const maxYear = endYear;
  if (urlParams.startYear == null || urlParams.startYear == undefined) {
    urlParams.startYear = startYear;
  }
  if (urlParams.endYear == null || urlParams.endYear == undefined) {
    urlParams.endYear = endYear;
  }
  if (urlParams.lossMagThresh == null || urlParams.lossMagThresh == undefined) {
    urlParams.lossMagThresh = -0.15;
  }
  if (urlParams.gainMagThresh == null || urlParams.gainMagThresh == undefined) {
    urlParams.gainMagThresh = 0.1;
  }

  if (urlParams.whichIndices2 == null || urlParams.whichIndices2 == undefined) {
    urlParams.whichIndices2 = {
      nir: false,
      swir1: false,
      swir2: false,
      NBR: true,
      NDVI: false,
    };
  }

  addCollapse(
    "sidebar-left",
    "parameters-collapse-label",
    "parameters-collapse-div",
    "PARAMETERS",
    '<i role="img" class="fa fa-sliders mr-1" aria-hidden="true"></i>',
    false,
    null,
    "Adjust parameters used to filter and sort LCMS products"
  );

  addDualRangeSlider(
    "parameters-collapse-div",
    "Choose analysis year range:",
    "urlParams.startYear",
    "urlParams.endYear",
    minYear,
    maxYear,
    urlParams.startYear,
    urlParams.endYear,
    1,
    "analysis-year-slider",
    "null",
    "Years of LCMS data to include for land cover, land use, loss, and gain"
  );
  addCheckboxes(
    "parameters-collapse-div",
    "index-choice-checkboxes",
    "Choose which indices to analyze",
    "whichIndices2",
    urlParams.whichIndices2
  );

  addSubCollapse(
    "parameters-collapse-div",
    "lt-params-label",
    "lt-params-div",
    "LANDTRENDR Params",
    "",
    false,
    ""
  );

  addRangeSlider(
    "lt-params-div",
    "Loss Magnitude Threshold",
    "urlParams.lossMagThresh",
    -0.8,
    -0.05,
    urlParams.lossMagThresh,
    0.05,
    "loss-mag-thresh-slider",
    "",
    "The threshold to detect loss for each LANDTRENDR segment.  Any difference for a given segement less than this threshold will be flagged as loss"
  );
  addRangeSlider(
    "lt-params-div",
    "Gain Magnitude Threshold",
    "urlParams.gainMagThresh",
    0.05,
    0.8,
    urlParams.gainMagThresh,
    0.05,
    "gain-mag-thresh-slider",
    "",
    "The threshold to detect gain for each LANDTRENDR segment.  Any difference for a given segement greater than this threshold will be flagged as gain"
  );

  $("#parameters-collapse-div").append(`<hr>`);
  $("#parameters-collapse-div").append(staticTemplates.reRunButton);

  addCollapse(
    "sidebar-left",
    "layer-list-collapse-label",
    "layer-list-collapse-div",
    "LCMS BASE LEARNER DATA",
    `<img style = 'width:1.2em;height:1.1em;margin-top:-0.2em;margin-left:-0.1em' class='image-icon mr-1' alt="LCMS icon" src="./src/assets/images/lcms-icon.png">`,
    true,
    null,
    "LCMS DATA layers to view on map"
  );
  $("#layer-list-collapse-div").append(
    `<ul id="layer-list" class = "layer-list"></ul>`
  );
  addCollapse(
    "sidebar-left",
    "tools-collapse-label",
    "tools-collapse-div",
    "TOOLS",
    `<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,
    false,
    "",
    "Tools to measure and chart data provided on the map"
  );
  if (canExport) {
    addCollapse(
      "sidebar-left",
      "download-collapse-label",
      "download-collapse-div",
      "DOWNLOAD DATA",
      `<i role="img" class="fa fa-cloud-download mr-1" aria-hidden="true"></i>`,
      false,
      ``,
      "Download " + mode + " products for further analysis"
    );
  }
} else if (mode === "LT") {
  canExport = true;
  startYear = 1984;
  endYear = new Date().getYear() + 1900;
  startJulian = 152;
  endJulian = 273;
  initialZoomLevel = 9;
  initialCenter = [37.64109979850402, -107.6917775643849];
  const minYear = startYear;
  const maxYear = endYear;
  if (urlParams.startYear == null || urlParams.startYear == undefined) {
    urlParams.startYear = startYear;
  }
  if (urlParams.endYear == null || urlParams.endYear == undefined) {
    urlParams.endYear = endYear;
  }
  if (urlParams.startJulian == null || urlParams.startJulian == undefined) {
    urlParams.startJulian = startJulian;
  }
  if (urlParams.endJulian == null || urlParams.endJulian == undefined) {
    urlParams.endJulian = endJulian;
  }

  addCollapse(
    "sidebar-left",
    "parameters-collapse-label",
    "parameters-collapse-div",
    "PARAMETERS",
    '<i role="img" class="fa fa-sliders mr-1" aria-hidden="true"></i>',
    false,
    null,
    "Adjust parameters used to filter and sort " + mode + " products"
  );

  addSubCollapse(
    "parameters-collapse-div",
    "comp-params-label",
    "comp-params-div",
    "Landsat Composite Params",
    "",
    false,
    ""
  );
  $("#comp-params-div").append(`<hr>`);

  addDualRangeSlider(
    "comp-params-div",
    "Choose analysis year range:",
    "urlParams.startYear",
    "urlParams.endYear",
    minYear,
    maxYear,
    urlParams.startYear,
    urlParams.endYear,
    1,
    "analysis-year-slider2",
    "null",
    "Years of " + mode + " data to include."
  );

  addDualRangeSlider(
    "comp-params-div",
    "Choose analysis date range:",
    "urlParams.startJulian",
    "urlParams.endJulian",
    1,
    365,
    urlParams.startJulian,
    urlParams.endJulian,
    1,
    "julian-day-slider",
    "julian",
    "Days of year of " +
      mode +
      " data to include for land cover, land use, loss, and gain"
  );
  $("#comp-params-div").append(`<hr>`);

  if (
    urlParams.whichPlatforms === null ||
    urlParams.whichPlatforms === undefined
  ) {
    urlParams.whichPlatforms = {
      L4: true,
      L5: true,
      "L7-SLC-On": true,
      "L7-SLC-Off": false,
      L8: true,
      L9: true,
    };
  }
  addCheckboxes(
    "comp-params-div",
    "which-sensor-method-radio",
    "Choose which Landsat platforms to include",
    "whichPlatforms",
    urlParams.whichPlatforms
  );

  $("#comp-params-div").append(`<hr>`);

  if (urlParams.yearBuffer === null || urlParams.yearBuffer === undefined) {
    urlParams.yearBuffer = 0;
  }
  addRangeSlider(
    "comp-params-div",
    "Composite Year Buffer",
    "urlParams.yearBuffer",
    0,
    2,
    urlParams.yearBuffer,
    1,
    "year-buffer-slider",
    "",
    "The number of adjacent years to include in a given year composite. (E.g. a value of 1 would mean the 2015 composite would have imagery from 2015 +- 1 year - 2014 to 2016)"
  );
  $("#comp-params-div").append(`<hr>`);

  if (urlParams.minObs === null || urlParams.minObs === undefined) {
    urlParams.minObs = 3;
  }
  addRangeSlider(
    "comp-params-div",
    "Minimum Number of Observations",
    "urlParams.minObs",
    1,
    5,
    urlParams.minObs,
    1,
    "min-obs-slider",
    "",
    "Minimum number of observations needed for a pixel to be included. This helps reduce noise in composites. Any number less than 3 can result in poor composite quality"
  );
  $("#comp-params-div").append(`<hr>`);

  const compMethodDict = { Median: false, Medoid: true };
  if (urlParams.compMethod !== null && urlParams.compMethod !== undefined) {
    Object.keys(compMethodDict).map((k) => (compMethodDict[k] = false));
    compMethodDict[urlParams.compMethod] = true;
  }
  addMultiRadio(
    "comp-params-div",
    "comp-method-radio",
    "Compositing method",
    "urlParams.compMethod",
    compMethodDict
  );
  $("#comp-params-div").append(`<hr>`);

  if (
    urlParams.whichCloudMasks === null ||
    urlParams.whichCloudMasks === undefined
  ) {
    urlParams.whichCloudMasks = {
      "fMask-Snow": true,
      cloudScore: false,
      "fMask-Cloud": true,
      TDOM: false,
      "fMask-Cloud-Shadow": true,
    };
  }
  addCheckboxes(
    "comp-params-div",
    "cloud-masking-checkboxes",
    "Choose which cloud masking methods to use",
    "whichCloudMasks",
    urlParams.whichCloudMasks
  );
  $("#comp-params-div").append(`<hr>`);

  const maskWaterDict = { No: false, Yes: true };
  if (urlParams.maskWater !== null && urlParams.maskWater !== undefined) {
    Object.keys(maskWaterDict).map((k) => (maskWaterDict[k] = false));
    maskWaterDict[urlParams.maskWater] = true;
  }
  addMultiRadio(
    "comp-params-div",
    "water-mask-radio",
    "Mask out water",
    "urlParams.maskWater",
    maskWaterDict
  );

  addSubCollapse(
    "parameters-collapse-div",
    "lt-params-label",
    "lt-params-div",
    "LANDTRENDR Params",
    "",
    false,
    ""
  );

  if (urlParams.whichIndices === null || urlParams.whichIndices === undefined) {
    urlParams.whichIndices = {
      NBR: true,
      NDVI: false,
      NDMI: false,
      NDSI: false,
      brightness: false,
      greenness: false,
      wetness: false,
      tcAngleBG: false,
    };
  }
  addCheckboxes(
    "lt-params-div",
    "index-choice-checkboxes",
    "Choose which indices to analyze",
    "whichIndices",
    urlParams.whichIndices
  );
  $("#lt-params-div").append(`<hr>`);

  const LTSortByDict = {
    largest: true,
    steepest: false,
    newest: false,
    oldest: false,
    shortest: false,
    longest: false,
  };
  if (urlParams.LTSortBy !== null && urlParams.LTSortBy !== undefined) {
    Object.keys(LTSortByDict).map((k) => (LTSortByDict[k] = false));
    LTSortByDict[urlParams.LTSortBy] = true;
  }
  addMultiRadio(
    "lt-params-div",
    "lt-sort-radio",
    "Choose method to summarize LANDTRENDR change",
    "urlParams.LTSortBy",
    LTSortByDict
  );

  if (
    urlParams.lossMagThresh === null ||
    urlParams.lossMagThresh === undefined
  ) {
    urlParams.lossMagThresh = -0.15;
  }
  addRangeSlider(
    "lt-params-div",
    "Loss Magnitude Threshold",
    "urlParams.lossMagThresh",
    -0.8,
    0,
    urlParams.lossMagThresh,
    0.01,
    "loss-mag-thresh-slider",
    "",
    "The threshold to detect loss for each LANDTRENDR segment.  Any difference between start and end values for a given segement less than this threshold will be flagged as loss"
  );

  if (
    urlParams.lossSlopeThresh === null ||
    urlParams.lossSlopeThresh === undefined
  ) {
    urlParams.lossSlopeThresh = -0.1;
  }
  addRangeSlider(
    "lt-params-div",
    "Loss Slope Threshold",
    "urlParams.lossSlopeThresh",
    -0.8,
    0,
    urlParams.lossSlopeThresh,
    0.01,
    "loss-slope-thresh-slider",
    "",
    "The threshold to detect loss for each LANDTRENDR segment.  Any slope of a given segement less than this threshold will be flagged as loss"
  );

  if (
    urlParams.gainMagThresh === null ||
    urlParams.gainMagThresh === undefined
  ) {
    urlParams.gainMagThresh = 0.1;
  }
  addRangeSlider(
    "lt-params-div",
    "Gain Magnitude Threshold",
    "urlParams.gainMagThresh",
    0.01,
    0.8,
    urlParams.gainMagThresh,
    0.01,
    "gain-mag-thresh-slider",
    "",
    "The threshold to detect gain for each LANDTRENDR segment.  Any difference between start and end values for a given segement greater than this threshold will be flagged as gain"
  );

  if (
    urlParams.gainSlopeThresh === null ||
    urlParams.gainSlopeThresh === undefined
  ) {
    urlParams.gainSlopeThresh = 0.1;
  }
  addRangeSlider(
    "lt-params-div",
    "Gain Slope Threshold",
    "urlParams.gainSlopeThresh",
    0.01,
    0.8,
    urlParams.gainSlopeThresh,
    0.01,
    "gain-slope-thresh-slider",
    "",
    "The threshold to detect gain for each LANDTRENDR segment.  Any slope of a given segement greater than this threshold will be flagged as gain"
  );

  if (
    urlParams.howManyToPull === null ||
    urlParams.howManyToPull === undefined
  ) {
    urlParams.howManyToPull = 1;
  }
  addRangeSlider(
    "lt-params-div",
    "How Many",
    "urlParams.howManyToPull",
    1,
    3,
    urlParams.howManyToPull,
    1,
    "how-many-slider",
    "",
    "The number of gains and losses to show. Typically an area only experiences a single loss/gain event, but in the cases where there are multiple above the specified thresholds, they can be shown."
  );

  if (urlParams.maxSegments === null || urlParams.maxSegments === undefined) {
    urlParams.maxSegments = 6;
  }
  addRangeSlider(
    "lt-params-div",
    "Max LANDTRENDR Segments",
    "urlParams.maxSegments",
    1,
    8,
    urlParams.maxSegments,
    1,
    "max-segments-slider",
    "",
    "The max number of segments LANDTRENDR can break time series into.  Generally 3-6 works well. Use a smaller number of characterizing long-term trends is the primary focus and a larger number if characterizing every little change is the primary focus."
  );

  $("#parameters-collapse-div").append(`<hr>`);
  $("#parameters-collapse-div").append(staticTemplates.reRunButton);
  addCollapse(
    "sidebar-left",
    "layer-list-collapse-label",
    "layer-list-collapse-div",
    "MAP DATA",
    `<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layer icon" src="./src/assets/images/layer_icon.png">`,
    true,
    null,
    mode + " DATA layers to view on map"
  );
  $("#layer-list-collapse-div").append(
    `<ul id="layer-list" class = "layer-list"></ul>`
  );

  addCollapse(
    "sidebar-left",
    "tools-collapse-label",
    "tools-collapse-div",
    "TOOLS",
    `<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,
    false,
    "",
    "Tools to measure and chart data provided on the map"
  );
  addCollapse(
    "sidebar-left",
    "download-collapse-label",
    "download-collapse-div",
    "DOWNLOAD DATA",
    `<i role="img" class="fa fa-cloud-download mr-1" aria-hidden="true"></i>`,
    false,
    ``,
    "Download " + mode + " products for further analysis"
  );
} else if (mode === "MTBS") {
  startYear = 1984;
  endYear = 2022;
  if (urlParams.startYear == null || urlParams.startYear == undefined) {
    urlParams.startYear = startYear;
  }
  if (urlParams.endYear == null || urlParams.endYear == undefined) {
    urlParams.endYear = endYear;
  }
  addCollapse(
    "sidebar-left",
    "support-collapse-label",
    "support-collapse-div",
    "SUPPORT & FEEDBACK",
    `<i role="img" class="fa fa-question-circle mr-1" aria-hidden="true"></i>`,
    true,
    ``,
    ""
  );
  $("#support-collapse-div").append(staticTemplates.walkThroughButton);
  $("#support-collapse-div").append(`<hr>`);
  $("#support-collapse-div").append(
    `<p>MTBS burned area boundaries and severity within the Data Explorer and MTBS web map services are updated regularly, but alignment of their update schedule may vary. Please visit the <a class = 'intro-modal-links' href="https://mtbs.gov/direct-download?tab=map-services&target=mtbs-data-explorer" target="_blank" > map services</a> section at MTBS.gov to verify the publication dates when making comparisons between the MTBS data available within these products/services.</p>`
  );
  $("#support-collapse-div").append(`<hr>`);
  $("#support-collapse-div").append(
    `<p style = "margin-bottom:0px;">If you have any issues with this tool or have suggestions on how it could be improved, please <a class = 'intro-modal-links' href="https://www.mtbs.gov/contact" target="_blank" > contact us</a>.</p>`
  );

  addCollapse(
    "sidebar-left",
    "parameters-collapse-label",
    "parameters-collapse-div",
    "PARAMETERS",
    '<i role="img" class="fa fa-sliders mr-1" aria-hidden="true"></i>',
    false,
    null,
    "Adjust parameters used to filter and sort MTBS products"
  );

  const mtbsZoomToDict = {
    All: true,
    CONUS: false,
    Alaska: false,
    Hawaii: false,
    "Puerto-Rico": false,
  };

  addMultiRadio(
    "parameters-collapse-div",
    "mtbs-zoom-to-radio",
    "Zoom to MTBS Mapping Area",
    "mtbsMappingArea",
    mtbsZoomToDict
  );
  $("#mtbs-zoom-to-radio").prop("title", "Zoom to MTBS region");
  $("#mtbs-zoom-to-radio").change(function () {
    console.log(mtbsMappingArea);
    synchronousCenterObject(clientBoundsDict[mtbsMappingArea]);
  });
  $("#parameters-collapse-div").append(`<hr>`);

  addDualRangeSlider(
    "parameters-collapse-div",
    "Choose analysis year range:",
    "urlParams.startYear",
    "urlParams.endYear",
    startYear,
    endYear,
    urlParams.startYear,
    urlParams.endYear,
    1,
    "analysis-year-slider",
    "null",
    "Years of MTBS data to include"
  );
  addMultiRadio(
    "parameters-collapse-div",
    "mtbs-summary-method-radio",
    "How to summarize MTBS data",
    "mtbsSummaryMethod",
    {
      "Highest-Severity": true,
      "Most-Recent": false,
      Oldest: false,
    }
  );

  $("#mtbs-summary-method-radio").prop(
    "title",
    'Select how to summarize MTBS raster data in areas with multiple fires.  Each summary method is applied on a pixel basis. "Highest-Severity" will show the severity and fire year corresponding to the highest severity. "Most-Recent" will show the severity and fire year corresponding to the most recently mapped fire. "Oldest" will show the severity and fire year corresponding to the oldest mapped fire.'
  );
  $("#parameters-collapse-div").append(`<hr>`);
  $("#parameters-collapse-div").append(staticTemplates.reRunButton);

  addCollapse(
    "sidebar-left",
    "layer-list-collapse-label",
    "layer-list-collapse-div",
    mode + " DATA",
    `<img style = 'height: 1.5rem;margin-top: -0.3rem;margin-left: -0.3rem;' class='image-icon mr-1' alt="MTBS logo" src="./src/assets/images/mtbs-logo.png">`,
    true,
    null,
    mode + " DATA layers to view on map"
  );
  addCollapse(
    "sidebar-left",
    "reference-layer-list-collapse-label",
    "reference-layer-list-collapse-div",
    "REFERENCE DATA",
    `<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="./src/assets/images/layer_icon.png">`,
    false,
    null,
    "Additional relevant layers to view on map intended to provide context for " +
      mode +
      " DATA"
  );

  addCollapse(
    "sidebar-left",
    "tools-collapse-label",
    "tools-collapse-div",
    "TOOLS",
    `<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,
    false,
    "",
    "Tools to measure and chart data provided on the map"
  );

  $("#layer-list-collapse-div").append(
    `<ul id="layer-list" class = "layer-list"></ul>`
  );
  $("#reference-layer-list-collapse-div").append(
    `<ul id="reference-layer-list" class = "layer-list"></ul>`
  );

  $("#introModal-body").append(staticTemplates.walkThroughButton);
} else if (mode === "TEST" || mode === "IDS") {
  addCollapse(
    "sidebar-left",
    "layer-list-collapse-label",
    "layer-list-collapse-div",
    mode + " DATA",
    `<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="./src/assets/images/layer_icon.png">`,
    true,
    null,
    mode + " DATA layers to view on map"
  );
  $("#layer-list-collapse-div").append(
    `<ul id="layer-list" class = "layer-list"></ul>`
  );

  addCollapse(
    "sidebar-left",
    "tools-collapse-label",
    "tools-collapse-div",
    "TOOLS",
    `<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,
    false,
    "",
    "Tools to measure and chart data provided on the map"
  );
} else if (mode === "Bloom-Mapper") {
  let algalRunID = 1;
  addCollapse(
    "sidebar-left",
    "parameters-collapse-label",
    "parameters-collapse-div",
    "PARAMETERS",
    '<i role="img" class="fa fa-sliders mr-1" aria-hidden="true"></i>',
    false,
    null,
    "Adjust parameters used to filter and sort LCMS products"
  );
  startYear = 2022;
  endYear = 2023;
  if (urlParams.startYear == null || urlParams.startYear == undefined) {
    urlParams.startYear = 2023;
  }
  if (urlParams.endYear == null || urlParams.endYear == undefined) {
    urlParams.endYear = 2023;
  }

  addDualRangeSlider(
    "parameters-collapse-div",
    "Choose analysis year range:",
    "urlParams.startYear",
    "urlParams.endYear",
    startYear,
    endYear,
    urlParams.startYear,
    urlParams.endYear,
    1,
    "analysis-year-slider",
    "null",
    "Years of algal data to include"
  );
  $("#parameters-collapse-div").append(staticTemplates.reRunButton);

  addCollapse(
    "sidebar-left",
    "layer-list-collapse-label",
    "layer-list-collapse-div",
    mode + " DATA",
    `<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="./src/assets/images/layer_icon.png">`,
    true,
    null,
    mode + " DATA layers to view on map"
  );
  $("#layer-list-collapse-div").append(
    `<ul id="layer-list" class = "layer-list"></ul>`
  );

  addCollapse(
    "sidebar-left",
    "tools-collapse-label",
    "tools-collapse-div",
    "TOOLS",
    `<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,
    false,
    "",
    "Tools to measure and chart data provided on the map"
  );

  addCollapse(
    "sidebar-left",
    "support-collapse-label",
    "support-collapse-div",
    "SUPPORT",
    `<img class='panel-title-svg-lg'  alt="Support icon" src="./src/assets/Icons_svg/support_ffffff.svg">`,
    false,
    ``,
    "If you need any help"
  );

  $("#support-collapse-div").append(staticTemplates.supportDivAlgal);
} else if (mode === "LAMDA") {
  addCollapse(
    "sidebar-left",
    "parameters-collapse-label",
    "parameters-collapse-div",
    "PARAMETERS",
    '<i role="img" class="fa fa-sliders mr-1" aria-hidden="true"></i>',
    false,
    null,
    "Adjust parameters used to filter and sort LAMDA products"
  );
  startYear = 2021;
  const endYearCutoff = new Date("2024-02-26").dayOfYear();
  const currentDate = new Date();
  endYear = currentDate.getYear() + 1900;
  const currentDayOfYear = currentDate.dayOfYear();
  if (currentDayOfYear < endYearCutoff) {
    endYear--;
  }

  if (urlParams.year == null || urlParams.year == undefined) {
    urlParams.year = endYear;
  }

  addRangeSlider(
    "parameters-collapse-div",
    "Year",
    "urlParams.year",
    startYear,
    endYear,
    urlParams.year,
    1,
    "year-slider",
    "",
    "Year of LAMDA products to show"
  );
  $("#parameters-collapse-div").append(staticTemplates.reRunButton);

  addCollapse(
    "sidebar-left",
    "layer-list-collapse-label",
    "layer-list-collapse-div",
    mode + " DATA",
    `<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="./src/assets/images/layer_icon.png">`,
    true,
    null,
    mode + " DATA layers to view on map"
  );
  $("#layer-list-collapse-div").append(
    `<ul id="layer-list" class = "layer-list"></ul>`
  );

  addCollapse(
    "sidebar-left",
    "tools-collapse-label",
    "tools-collapse-div",
    "TOOLS",
    `<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,
    false,
    "",
    "Tools to measure and chart data provided on the map"
  );
} else if (mode === "geeViz") {
  urlParams.startYear = urlParams.startYear || startYear;
  urlParams.endYear = urlParams.endYear || endYear;
  addCollapse(
    "sidebar-left",
    "layer-list-collapse-label",
    "layer-list-collapse-div",
    mode + " DATA",
    `<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="./src/assets/images/layer_icon.png">`,
    true,
    null,
    mode + " DATA layers to view on map"
  );
  $("#layer-list-collapse-div").append(
    `<ul id="layer-list" class = "layer-list"></ul>`
  );
  addCollapse(
    "sidebar-left",
    "tools-collapse-label",
    "tools-collapse-div",
    "TOOLS",
    `<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,
    false,
    "",
    "Tools to measure and chart data provided on the map"
  );
} else if (mode === "STORM") {
  canExport = true;
  function refineFeatures(features, interpProps) {
    const left = features.slice(0, features.length - 1);
    const right = features.slice(1, features.length);
    let f = [left[0]];
    left.forEach(function (fl, i) {
      const fr = right[i];
      const coordsL = fl.geometry.coordinates;
      const coordsR = fr.geometry.coordinates;

      const fm = JSON.parse(JSON.stringify(fl));
      fm.geometry.coordinates = [
        (coordsL[0] + coordsR[0]) / 2.0,
        (coordsL[1] + coordsR[1]) / 2.0,
      ];

      interpProps.map(function (prop) {
        let lProp = fl.properties[prop];
        let rProp = fr.properties[prop];
        let m = (rProp + lProp) / 2.0;
        fm.properties[prop] = m;
      });
      f.push([fm, fr]);
    });
    f = f.flat();
    // console.log(f);
    // console.log(left);
    return f;
  }

  addCollapse(
    "sidebar-left",
    "parameters-collapse-label",
    "parameters-collapse-div",
    "PARAMETERS",
    '<i role="img" class="fa fa-sliders mr-1" aria-hidden="true"></i>',
    true,
    null,
    "Adjust parameters used to prepare storm outputs"
  );

  $("#parameters-collapse-div").append(`
    <label>Download storm track from <a href="https://www.wunderground.com/hurricane" target="_blank">here</a>. Copy and paste the storm track coordinates into a text editor. Save the table. Then upload that table below. <a href="./src/data/geojson/michael.txt" download="michael.txt" >Download test data here.</a></label>
    <input class = 'file-input my-1' type="file" id="stormTrackUpload" name="upload"  style="display: inline-block;" title = "Download storm track from https://www.wunderground.com/hurricane">
    <hr>
    <label>Provide name for storm (optional):</label>
    <input title = 'Provide a name for the storm. The name of the provided storm track file will be used if left blank.'  type="user-selected-area-name" class="form-control" id="storm-name"  placeholder="Name your storm!" style='width:80%;'><hr>`);
  addRangeSlider(
    "parameters-collapse-div",
    "Refinement iterations",
    "refinementIterations",
    0,
    10,
    5,
    1,
    "refinement-factor-slider",
    "null",
    "Specify number of iterations to perform a linear interpolation of provided track. A higher number is needed for tracks with fewer real observations"
  );
  addRangeSlider(
    "parameters-collapse-div",
    "Max distance (km)",
    "maxDistance",
    50,
    500,
    200,
    50,
    "max-distance-slider",
    "null",
    "Specify max distance in km from storm track to include in output"
  );
  addRangeSlider(
    "parameters-collapse-div",
    "Min wind (mph)",
    "minWind",
    0,
    75,
    30,
    5,
    "min-wind-slider",
    "null",
    "Specify min wind speed in mph to include in output"
  );

  $("#parameters-collapse-div").append(`
        <hr>
        <label style = 'width:90%'>The MOD of Rupture is intended to indicate how much force it takes to snap a tree. A single value can be provided by providing a constant image (e.g. ee.Image(1)) and a simple lookup to convert that image to a desired MOD of Rupture (e.g. {1:8500}). If different MOD of Rupture values are needed for different tree types, you can provide an EE image that may have tree classes or land cover classes that can then be cross-walked to a MOD of Rupture image with different values for different tree/land cover classes (e.g. ee.Image( "USGS/NLCD_RELEASES/2016_REL/2016" ).select([ 0 ]) with a lookup of {41:8500,42:2000,43:5000,90:4000}</label>
        <hr>
        <label>MOD of Rupture Image</label>
        <textarea   title = 'Provide an image with relevant land cover/tree classes. Provide a constant raster (ee.Image(1)) if you would like to use a constant'   class="form-control" id="mod-image"   oninput="auto_grow(this)" style='width:90%;'>ee.Image("USGS/NLCD_RELEASES/2016_REL/2016").select([0])</textarea>
        <hr>
        <label>MOD of Rupture Lookup</label>
        <textarea   title = 'Provide a lookup table to remap each class of the image provided above with a MOD of Rupture value.'  type="user-selected-area-name" class="form-control" id="mod-lookup" oninput="auto_grow(this)" style='width:90%;'>{41:8500, 42:2000, 43:5000, 90:4000}</textarea>
       `);

  $("#parameters-collapse-div").append(`<hr>
      <button class = 'btn' style = 'margin-bottom: 0.5em!important;' onclick = 'ingestStormTrack()' title = 'Click to ingest storm track and map damage'>Ingest Storm Track</button>
      <button class = 'btn' style = 'margin-bottom: 0.5em!important;' onclick = 'reRun()' title = 'Click to remove existing layers and exports'>Clear All Layers/Exports</button><br>`);
  function ingestStormTrack() {
    if (jQuery("#stormTrackUpload")[0].files.length > 0) {
      const fr = new FileReader();
      fr.onload = function () {
        let rows = fr.result.split("\n");
        rows = rows.filter((row) => row.split("\t").length > 5);
        rows = rows.map(function (row) {
          row = row.split("\t");
          const out = {};
          out.type = "Feature";
          out.geometry = {};
          out.geometry.type = "Point";
          out.geometry.coordinates = [parseFloat(row[3]), parseFloat(row[2])];

          out.properties = {};
          out.properties.lat = parseFloat(row[2]);
          out.properties.lon = parseFloat(row[3]);
          out.properties.wspd = parseFloat(row[4]);
          out.properties.pres = parseFloat(row[5]);
          out.properties.category = row[6];
          out.properties.date = new Date(row[0] + " " + row[1]).getTime();
          out.properties.year = new Date(row[0] + " " + row[1]).getFullYear();
          return out;
        });

        let iterations = refinementIterations;
        const initialN = rows.length;
        while (iterations > 0 && rows.length * 2 < 1500) {
          console.log("Refining");
          console.log(refinementIterations);
          rows = refineFeatures(rows, [
            "lat",
            "lon",
            "wspd",
            "pres",
            "date",
            "year",
          ]);
          console.log(rows.length);
          iterations--;
        }
        setTimeout(function () {
          showMessage(
            "Track ingestion finished",
            "Refined " +
              (refinementIterations - iterations).toString() +
              "/" +
              refinementIterations.toString() +
              " iterations.<br>Total number of raw track points is: " +
              initialN.toString() +
              "<br>Total number of refined track points is: " +
              rows.length.toString()
          );
        }, 1000);

        const rowsLeft = rows.slice(0, rows.length - 1);
        const rowsRight = rows.slice(1);
        let zipped = range(0, rowsLeft.length).map(function (i) {
          const out = {};
          out.type = "Feature";
          out.geometry = rowsLeft[i].geometry;

          out.properties = {};

          out.properties.current = rowsLeft[i].properties;
          out.properties.future = rowsRight[i].properties;

          return out;
        });

        $("#summary-spinner").slideUp();

        createHurricaneDamageWrapper(ee.FeatureCollection(zipped));
      };

      fr.readAsText(jQuery("#stormTrackUpload")[0].files[0]);
    } else {
      $("#summary-spinner").hide();
      showMessage(
        "No storm track provided",
        'Please download storm track from <a href="https://www.wunderground.com/hurricane" target="_blank">here</a> . Copy and paste the storm track coordinates into a text editor. Save the table. Then upload that table above.'
      );
    }
  }

  addCollapse(
    "sidebar-left",
    "layer-list-collapse-label",
    "layer-list-collapse-div",
    mode + " DATA",
    `<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="./src/assets/images/layer_icon.png">`,
    true,
    null,
    mode + " DATA layers to view on map"
  );
  $("#layer-list-collapse-div").append(
    `<ul id="layer-list" class = "layer-list"></ul>`
  );
  addCollapse(
    "sidebar-left",
    "tools-collapse-label",
    "tools-collapse-div",
    "TOOLS",
    `<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,
    false,
    "",
    "Tools to measure and chart data provided on the map"
  );
  addCollapse(
    "sidebar-left",
    "download-collapse-label",
    "download-collapse-div",
    "DOWNLOAD DATA",
    `<i role="img" class="fa fa-cloud-download mr-1" aria-hidden="true"></i>`,
    false,
    ``,
    "Download " + mode + " products for further analysis"
  );
} else if (mode === "TreeMap") {
  canExport = true;
  $("head").append(
    `<script type="text/javascript" src="./src/assets/palettes/forest-type-palette.js"></script>`
  );
  addCollapse(
    "sidebar-left",
    "layer-list-collapse-label",
    "layer-list-collapse-div",
    "TreeMap DATA",
    `<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="./src/assets/images/layer_icon.png">`,
    true,
    null,
    mode + " DATA layers to view on map"
  );
  addCollapse(
    "sidebar-left",
    "tools-collapse-label",
    "tools-collapse-div",
    "TOOLS",
    `<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,
    false,
    "",
    "Tools to measure and chart data provided on the map"
  );
  addCollapse(
    "sidebar-left",
    "download-collapse-label",
    "download-collapse-div",
    "DOWNLOAD DATA",
    `<i role="img" class="fa fa-cloud-download mr-1" aria-hidden="true"></i>`,
    false,
    ``,
    "Download " + mode + " products for further analysis"
  );
  addCollapse(
    "sidebar-left",
    "support-collapse-label",
    "support-collapse-div",
    "SUPPORT",
    `<img class='panel-title-svg-lg'  alt="Support icon" src="./src/assets/Icons_svg/support_ffffff.svg">`,
    false,
    ``,
    "If you need any help"
  );
  $("#layer-list-collapse-div").append(
    `<ul id="layer-list" class = "layer-list"></ul>`
  );
  $("#download-collapse-div").append(staticTemplates.TreeMapDownloadDiv);
  $("#download-collapse-div").append(staticTemplates.TreeMapGEEClippingDiv);
  $("#support-collapse-div").append(staticTemplates.TreeMapSupportDiv);
} else if (mode === "sequoia-view") {
  addCollapse(
    "sidebar-left",
    "parameters-collapse-label",
    "parameters-collapse-div",
    "PARAMETERS",
    '<i role="img" class="fa fa-sliders mr-1" aria-hidden="true"></i>',
    true,
    null,
    "Adjust parameters used to prepare change analysis window"
  );
  const minYear = 2017;
  const maxYear = new Date().getFullYear();
  const dayOfYear = new Date().dayofYear();
  if (urlParams.preStartYear == null || urlParams.preStartYear == undefined) {
    urlParams.preStartYear = minYear;
  }
  if (urlParams.preEndYear == null || urlParams.preEndYear == undefined) {
    urlParams.preEndYear = maxYear - 1;
  }
  if (urlParams.postYear == null || urlParams.postYear == undefined) {
    urlParams.postYear = maxYear;
  }

  if (urlParams.startJulian == null || urlParams.startJulian == undefined) {
    urlParams.startJulian = dayOfYear - 16;
    if (urlParams.startJulian < 0) {
      urlParams.startJulian = 0;
    }
  }
  if (urlParams.endJulian == null || urlParams.endJulian == undefined) {
    urlParams.endJulian = dayOfYear - 2;
    if (urlParams.endJulian > 365) {
      urlParams.endJulian = 365;
    }
  }
  if (urlParams.compVizParams == null || urlParams.compVizParams == undefined) {
    urlParams.compVizParams = {
      min: 0.1,
      max: [0.5, 0.6, 0.6],
      bands: "swir2,nir,red",
      layerType: "geeImage",
      gamma: 1.6,
    };
  }
  if (urlParams.diffVizParams == null || urlParams.diffVizParams == undefined) {
    urlParams.diffVizParams = {
      min: -0.05,
      max: 0.05,
      layerType: "geeImage",
      bands: ["brightness", "greenness", "wetness"],
    };
  }
  if (urlParams.diffThreshs == null || urlParams.diffThreshs == undefined) {
    urlParams.diffThreshs = { greenness: -0.04, wetness: -0.015, NBR: -0.15 }; // old thresholds: greenness: -0.05, wetness: -0.02, NBR: -0.2
  }
  if (urlParams.treeDiameter == null || urlParams.treeDiameter == undefined) {
    urlParams.treeDiameter = 15;
  }
  if (
    urlParams.lcmsTreeMaskClasses == null ||
    urlParams.lcmsTreeMaskClasses == undefined
  ) {
    urlParams.lcmsTreeMaskClasses = {
      Trees: true,
      "Shrubs & Trees Mix": false,
      "Grass/Forb/Herb & Trees Mix": false,
      "Barren & Trees Mix": false,
    };
  }

  // $('#parameters-collapse-div').append(`<hr>`);

  addDualRangeSlider(
    "parameters-collapse-div",
    "Change Analysis date range:",
    "urlParams.startJulian",
    "urlParams.endJulian",
    1,
    365,
    urlParams.startJulian,
    urlParams.endJulian,
    1,
    "julian-day-slider",
    "julian",
    "Select a window of dates to filter the analysis (baseline and post-disturbance)."
  );
  addDualRangeSlider(
    "parameters-collapse-div",
    "Pre-Change year(s):",
    "urlParams.preStartYear",
    "urlParams.preEndYear",
    minYear,
    maxYear - 1,
    urlParams.preStartYear,
    urlParams.preEndYear,
    1,
    "pre-years-slider",
    "null",
    "Choose a year or range or years to calculate reference (pre-change) signal. If more than one year is chosen, the baseline will be the mean signal of the years during the selected date range."
  );
  addRangeSlider(
    "parameters-collapse-div",
    "Post-Change year:",
    "urlParams.postYear",
    minYear + 1,
    maxYear,
    urlParams.postYear,
    1,
    "post-years-slider",
    null,
    "Choose post-change year to compare against Baseline year(s)."
  );

  addSubCollapse(
    "parameters-collapse-div",
    "advanced-params-label",
    "advanced-params-div",
    "Advanced Parameters",
    "",
    false,
    ""
  );
  $("#parameters-collapse-div").append("<hr>");
  addRangeSlider(
    "advanced-params-div",
    "Giant Sequoia Canopy Diamater (m)",
    "urlParams.treeDiameter",
    5,
    30,
    urlParams.treeDiameter,
    5,
    "tree-diameter-slider",
    "null",
    "Specify the average diameter of a Giant Sequoia crown in meters"
  );

  addCheckboxes(
    "advanced-params-div",
    "lcms-tree-mask-class-checkboxes",
    "LCMS land cover classes to include as tree to mask out non tree areas from change detection. ",
    "lcmsTreeMaskClasses",
    urlParams.lcmsTreeMaskClasses
  );

  if (
    urlParams.cloudMaskMethod === null ||
    urlParams.cloudMaskMethod === undefined
  ) {
    urlParams.cloudMaskMethod = {
      "S2Cloudless-TDOM": false,
      "CloudScore+": true,
    };
  }
  addMultiRadio(
    "advanced-params-div",
    "cloud-mask-method-radio",
    "Cloud Masking Method",
    "cloudMaskMethod",
    urlParams.cloudMaskMethod,
    "Choose which cloud and cloud shadow masking method to use. S2 Cloudless and TDOM work well, but TDOM is a bit computationally intensive. cloudScore+ masks clouds and cloud shadows better, but will not be fully available for all Sentinel-2 data until around spring of 2024"
  );

  addJSONInputTextBox(
    "advanced-params-div",
    "diff-bands-thresh-input",
    "Difference Bands and Thresholds",
    urlParams,
    "diffThreshs",
    urlParams.diffThreshs,
    "Bands and thresholds to use for identifying change"
  );

  addJSONInputTextBox(
    "advanced-params-div",
    "comp-viz-params-input",
    "Composite Visualization Parameters",
    urlParams,
    "compVizParams",
    urlParams.compVizParams,
    "Viz params for composite images"
  );

  addJSONInputTextBox(
    "advanced-params-div",
    "diff-viz-params-input",
    "Difference Visualization Parameters",
    urlParams,
    "diffVizParams",
    urlParams.diffVizParams,
    "Viz params for difference image"
  );

  // Sync sliders
  $("#post-years-slider")
    .slider()
    .bind("slide", function (event, ui) {
      var yr = ui.value;
      var needsUpdated = false;
      if (yr <= urlParams.preEndYear) {
        urlParams.preEndYear = yr - 1;
        needsUpdated = true;
      }
      if (yr <= urlParams.preStartYear) {
        urlParams.preStartYear = yr - 1;
        needsUpdated = true;
      }
      if (needsUpdated) {
        $("#pre-years-slider").slider("values", [
          urlParams.preStartYear,
          urlParams.preEndYear,
        ]);
        $("#pre-years-slider-update").html(
          `${urlParams.preStartYear} - ${urlParams.preEndYear}`
        );
      }
    });
  $("#pre-years-slider")
    .slider()
    .bind("slide", function (event, ui) {
      var yrs = ui.values;
      var needsUpdated = false;
      if (yrs[0] >= urlParams.postYear) {
        urlParams.postYear = yrs[0] + 1;
        needsUpdated = true;
      }
      if (yrs[1] >= urlParams.postYear) {
        urlParams.postYear = yrs[1] + 1;
        needsUpdated = true;
      }
      if (needsUpdated) {
        $("#post-years-slider").slider("value", urlParams.postYear);
        $("#post-years-slider-update").html(`${urlParams.postYear}`);
      }
    });

  addCollapse(
    "sidebar-left",
    "layer-list-collapse-label",
    "layer-list-collapse-div",
    "MAP LAYERS",
    `<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="./src/assets/images/layer_icon.png">`,
    true,
    null,
    mode + " DATA layers to view on map"
  );

  addCollapse(
    "sidebar-left",
    "reference-layer-list-collapse-label",
    "reference-layer-list-collapse-div",
    "MANAGEMENT DATA", //"REFERENCE DATA"
    `<img class='panel-title-svg-lg'  alt="Layers icon" src="./src/assets/Icons_svg/data-layers_ffffff.svg">`,
    false,
    null,
    "Additional relevant layers to view on map intended to provide context for change data"
  );
  $("#reference-layer-list-collapse-div").append(
    `<ul id="reference-layer-list" class = "layer-list"></ul>`
  );

  addCollapse(
    "sidebar-left",
    "tools-collapse-label",
    "tools-collapse-div",
    "TOOLS",
    `<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,
    false,
    "",
    "Tools to measure and chart data provided on the map"
  );

  addCollapse(
    "sidebar-left",
    "support-collapse-label",
    "support-collapse-div",
    "SUPPORT",
    `<img class='panel-title-svg-lg'  alt="Support icon" src="./src/assets/Icons_svg/support_ffffff.svg">`,
    true,
    ``,
    "If you need any help"
  );
  $("#support-collapse-div").append(staticTemplates.sequoiaSupportDiv);
  $("#layer-list-collapse-div").append(
    `<ul id="layer-list" class = "layer-list"></ul>`
  );

  $("#parameters-collapse-div").append(staticTemplates.reRunButton);

  if (urlParams.canExport === true) {
    canExport = urlParams.canExport;
    addCollapse(
      "sidebar-left",
      "download-collapse-label",
      "download-collapse-div",
      "DOWNLOAD DATA",
      `<i role="img" class="fa fa-cloud-download mr-1" aria-hidden="true"></i>`,
      false,
      ``,
      "Download " + mode + " products for further analysis"
    );
  }
} else if (mode === "HiForm-BMP") {
  var selectedState;
  var selectedCounty;
  initialZoomLevel = 6;
  initialCenter = [34.750453053659456, -85.56084152109133];
  var selectedLayerId;
  urlParams.preDate1;
  urlParams.preDate2;
  urlParams.postDate1;
  urlParams.postDate2;
  urlParams.correctionTypeOption;
  canExport = true;
  function downloadHiFormTutorial() {
    var link = document.createElement("a");
    var tutorial_name = "HiForm_BMP_Tool_Users_Guide.pdf";
    link.href =
      "https://hiform.org/sites/default/files/project_files/2024-08/" +
      tutorial_name;
    link.target = "_blank";
    link.click();
    ga("send", "event", mode + "-download", "tutorial-download", tutorial_name);
    showSurveyModal("downloadedTutorial");
  }
  addCollapse(
    "sidebar-left",
    "select-aoi-label",
    "select-aoi-pane",
    "Select Area of Interest",
    '<i role="img" class="fa fa-mouse-pointer mr-1" aria-hidden="true"></i>',
    true,
    null,
    "Select are of interest for the Hi-Form BMP Tool"
  );

  $("#select-aoi-pane").append(`<div id="select-aoi-div"></div>
                               
                                <div id="select-aoi-layer-div" style='display:none;' class='pb-2'>
                                <p style='font-weight:bold;margin-bottom:0.5rem;' title = 'County map layers shown to help with selecting an area to run HiForm-BMP across'>AOI Selection Layers</p>
                                  <li style=''  id = 'county-selection-layer-list'></li>
                                </div>`);
  if (!urlParams.aoiSelectionType) {
    urlParams.aoiSelectionType = {
      "Select by Dropdown": true,
      "Select on Map": false,
      "Select Off": false,
    };
  }

  addSelectTypeRadio(
    "select-aoi-div",
    "select-type-radio",
    "Choose County Selection Type",
    "selectOption",
    urlParams.aoiSelectionType,
    "Choose method to select county to run Hi-Form BMP across",
    handleAoiSelectionType
  );

  addCurrentAOIParametersDisplay();

  function handleAoiSelectionType(selection) {
    if (selectOption == "Select by Dropdown") {
      google.maps.event.clearListeners(map, "click");
      $("#dropdown-select").remove();
      $("#select-aoi-div").append(`<div id="dropdown-select"></div>`);

      addDropdownStates(
        "dropdown-select",
        "state-select",
        "Select a State:",
        selectedState,
        availableStates,
        populateCountiesDropdown
      );
    } else if (selectOption == "Select on Map") {
      $("#" + "dropdown-select").remove();
      selectSingleCounty();
    } else if (selectOption == "Select Off") {
      $("#" + "dropdown-select").remove();
      google.maps.event.clearListeners(map, "click");
    }
  }

  function populateCountiesDropdown(selectedState) {
    var state = allStates.filter((s) => s.NAME === selectedState)[0];
    var counties = allCounties
      .filter((c) => c.STATEFP === state.STATEFP)
      .map((c) => c.NAME)
      .sort();

    addDropdownCounties(
      "dropdown-select",
      "county-select",
      "Select a County:",
      selectedCounty,
      counties,
      state.STATEFP,
      state.STUSPS,
      setSelectedCounty
    );
  }

  function setSelectedCounty(selectedCounty, stateFP, stateAbr) {
    Map.removeLayer(selectedLayerId);

    window.selectedFeature = ee
      .FeatureCollection("TIGER/2018/Counties")
      .filter(ee.Filter.eq("STATEFP", stateFP))
      .filter(ee.Filter.eq("NAME", selectedCounty));
    selectedLayerId = Map.addLayer(
      selectedFeature,
      { strokeColor: "0BFFFF", layerType: "geeVectorImage", canQuery: false },
      `${selectedCounty}, ${stateAbr}`,
      true,
      null,
      null,
      "Selected county",
      "county-selection-layer-list"
    );
    Map.centerObject(selectedFeature);
    urlParams.selectedState = stateAbr;
    urlParams.selectedCounty = selectedCounty;
    selectedCountyAndStateStr = `${selectedCounty}, ${stateAbr}`;
    exportArea = window.selectedFeature;
    toggleProcessButton();
  }

  function selectSingleCounty() {
    setTimeout(() => {
      google.maps.event.clearListeners(map, "click");
      google.maps.event.addListener(map, "click", (e) => {
        Map.showSpinner();

        Map.removeLayer(selectedLayerId);
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const point = ee.Geometry.Point([lng, lat]);
        features = ee.FeatureCollection("TIGER/2018/Counties");

        window.selectedFeature = features.filterBounds(point);
        let selectedInfo = ee
          .List([
            selectedFeature.first().get("NAME"),
            selectedFeature.first().get("STATEFP"),
          ])
          .getInfo();
        let countyName = selectedInfo[0];
        let stateFP = selectedInfo[1];
        let stateAbr = allStates.filter((s) => s.STATEFP === stateFP)[0].STUSPS;

        console.log(stateFP);
        selectedLayerId = Map.addLayer(
          selectedFeature,
          {
            strokeColor: "0BFFFF",
            layerType: "geeVectorImage",
            canQuery: false,
          },
          `${countyName}, ${stateAbr}`,
          true,
          null,
          null,
          "Selected county",
          "county-selection-layer-list"
        );
        Map.centerObject(selectedFeature, true, Map.hideSpinner);
        urlParams.selectedState = stateAbr;
        urlParams.selectedCounty = countyName;
        selectedCountyAndStateStr = `${countyName}, ${stateAbr}`;
        exportArea = window.selectedFeature;
        toggleProcessButton();
        // setTimeout(() => Map.hideSpinner(), 100);
      });
    }, 0);
  }

  function toggleProcessButton() {
    if (
      urlParams.preDate1 &&
      urlParams.preDate2 &&
      urlParams.postDate1 &&
      urlParams.postDate2 &&
      window.selectedFeature
    ) {
      $("#process-button").removeAttr("disabled");
    } else {
      $("#process-button").attr("disabled", "disabled");
    }
  }

  addCollapse(
    "sidebar-left",
    "pre-post-dates-label",
    "pre-post-dates-div",
    "Define 'post' and 'pre' date ranges",
    '<i role="img" class="fa fa-sliders mr-1" aria-hidden="true"></i>',
    true,
    null,
    "Select post and pre date ranges for the Hi-Form BMP Tool"
  );

  addCurrentDateParametersDisplay();
  var maxPostDate = advanceDate(new Date(), 0);
  var maxPreDate = advanceDate(new Date(), -3);

  urlParams.postDate1 = urlParams.postDate1 || advanceDate(maxPostDate, -60);
  urlParams.postDate2 = urlParams.postDate2 || maxPostDate;

  var minPreDate = "2016-01-01";
  var minPostDate = "2017-01-01";

  addHiFormPostDatePicker(
    "pre-post-dates-div",
    "post-date-picker-container",
    minPostDate,
    maxPostDate,
    urlParams.postDate1,
    urlParams.postDate2
  );
  if (!urlParams.preDateRange) {
    urlParams.preDateRange = {
      "6 Month": false,
      "1 Year": true,
      Custom: false,
    };
  }
  addSelectTypeRadio(
    "pre-post-dates-div",
    "define-pre-date-options",
    "Define Pre Date Range",
    "selectedPreDateRangeType",
    urlParams.preDateRange,
    "Choose a pre date range option",
    toggleCustomPostDate
  );

  $("#define-pre-date-options").append(
    `<div id="selected-date-range"><h6>Pre Date Range:</h6></div>`
  );
  $("#selected-date-range").append(`<p id="selected-date-range-contents"></p>`);

  addHiFormCustomPrePicker(
    "pre-post-dates-div",
    "pre-date-picker-container",
    minPreDate,
    maxPreDate
  );

  toggleCustomPostDate();

  function toggleCustomPostDate() {
    if (selectedPreDateRangeType === "Custom") {
      $("#pre-ranges-div").show();
    } else {
      $("#pre-ranges-div").hide();
    }

    handleSelectedPreDateType();
  }

  function preDateOneHandler(e) {
    console.log("Date Selected (Pre1): " + e.target.value);
    urlParams.preDate1 = e.target.value;

    // Fill in the pre date two if it's blank 60 days later or the end of the available data period or just before selected post period
    if ($("#pre-date-two").val() === "") {
      let bufferDate = advanceDate(urlParams.preDate1, 60);

      if (bufferDate > maxPreDate) {
        bufferDate = maxPreDate;
      }

      urlParams.preDate2 = bufferDate;
      $("#pre-date-two").val(urlParams.preDate2);
    }

    // Constrain pre date 2 to always be equal or after pre date 1
    if (urlParams.preDate1 > urlParams.preDate2) {
      urlParams.preDate2 = urlParams.preDate1;
      $("#pre-date-two").val(urlParams.preDate2);
    }
    $("#pre-date-one").val(urlParams.preDate1);

    toggleProcessButton();
  }

  function preDateTwoHandler(e) {
    console.log("Date Selected (Pre2): " + e.target.value);
    urlParams.preDate2 = e.target.value;

    // Fill in the pre date one if it's blank 60 days before or the end of the available data period or just before selected post period
    if ($("#pre-date-one").val() === "") {
      let bufferDate = advanceDate(urlParams.preDate1, -60);

      if (bufferDate < minPreDate) {
        bufferDate = maxPreDate;
      }

      urlParams.preDate1 = bufferDate;
      $("#pre-date-one").val(urlParams.preDate1);
    }

    // Constrain pre date 1 to always be equal or before pre date 2
    if (urlParams.preDate2 < urlParams.preDate1) {
      urlParams.preDate1 = urlParams.preDate2;
      $("#pre-date-one").val(urlParams.preDate1);
    }
    $("#pre-date-two").val(urlParams.preDate2);

    toggleProcessButton();
  }
  // Advance string date or date object by n days
  // Input date object or date string YYYY-MM-dd
  // Returns date string YYYY-MM-dd
  function advanceDate(d, nDays) {
    d = new Date(d);
    d.setDate(d.getDate() + nDays);
    return d.toISOString().slice(0, 10);
  }
  function postDateOneHandler(e) {
    console.log("Date Selected (Post1): " + e.target.value);
    urlParams.postDate1 = e.target.value;
    // Fill in the post date two if it's blank 60 days later or the end of the available data period
    if ($("#post-date-two").val() === "") {
      let bufferDate = advanceDate(urlParams.postDate1, 60);

      if (bufferDate > maxPostDate) {
        bufferDate = maxPostDate;
      }
      urlParams.postDate2 = bufferDate;
      $("#post-date-two").val(urlParams.postDate2);
    }

    // Constrain post date 2 to always be equal or after post date 1
    if (urlParams.postDate1 > urlParams.postDate2) {
      urlParams.postDate2 = urlParams.postDate1;
      $("#post-date-two").val(urlParams.postDate2);
    }

    handleSelectedPreDateType();
    toggleProcessButton();
  }

  function handleSelectedPreDateType() {
    // Set Pre Date if not custom range
    if (
      urlParams.postDate1 !== undefined &&
      urlParams.postDate2 !== undefined
    ) {
      if (selectedPreDateRangeType === "1 Year") {
        var ogdate = new Date(urlParams.postDate1);
        ogdate.setMonth(ogdate.getMonth() - 12);
        date_format = ogdate.toISOString().slice(0, 10);

        urlParams.preDate1 = date_format;

        var ogdate2 = new Date(urlParams.postDate2);
        ogdate2.setMonth(ogdate2.getMonth() - 12);
        date_format2 = ogdate2.toISOString().slice(0, 10);

        urlParams.preDate2 = date_format2;

        $("#selected-date-range").show();
        $("#selected-date-range-contents").text(
          `${urlParams.preDate1} ---- ${urlParams.preDate2}`
        );
      } else if (selectedPreDateRangeType === "6 Month") {
        var ogdate = new Date(urlParams.postDate1);
        ogdate.setMonth(ogdate.getMonth() - 6);
        date_format = ogdate.toISOString().slice(0, 10);

        urlParams.preDate1 = date_format;

        var ogdate2 = new Date(urlParams.postDate2);
        ogdate2.setMonth(ogdate2.getMonth() - 6);
        date_format2 = ogdate2.toISOString().slice(0, 10);

        urlParams.preDate2 = date_format2;

        $("#selected-date-range").show();
        $("#selected-date-range-contents").text(
          `${urlParams.preDate1} ---- ${urlParams.preDate2}`
        );
      } else {
        $("#selected-date-range").hide();
        urlParams.preDate1 =
          $("#pre-date-one").val() !== ""
            ? $("#pre-date-one").val()
            : urlParams.preDate1;
        urlParams.preDate2 =
          $("#pre-date-two").val() !== ""
            ? $("#pre-date-two").val()
            : urlParams.preDate2;
      }
    }
  }

  function postDateTwoHandler(e) {
    console.log("Date Selected (Post2): " + e.target.value);
    urlParams.postDate2 = e.target.value;
    $("#post-date-two").val(urlParams.postDate2);

    // Fill in the post date one if it's blank 60 days before
    if ($("#post-date-one").val() === "") {
      var bufferDate = advanceDate(urlParams.postDate2, -60);
      urlParams.postDate1 = bufferDate;
      $("#post-date-one").val(urlParams.postDate1);
      console.log("Date Selected (Post1): " + urlParams.postDate1);
    }

    // Constrain post date 1 to always be equal or before post date 2
    if (urlParams.postDate2 < urlParams.postDate1) {
      urlParams.postDate1 = urlParams.postDate2;
      $("#post-date-one").val(urlParams.postDate1);
    }

    handleSelectedPreDateType();

    toggleProcessButton();
  }

  addSubCollapse(
    "pre-post-dates-div",
    "advanced-params-label",
    "advanced-params-div",
    "Advanced Parameters",
    "",
    false,
    ""
  );
  if (!urlParams.correctionTypeOption) {
    urlParams.correctionTypeOption = { TOA: true, SR: false };
  }
  addSelectTypeRadio(
    "advanced-params-div",
    "correction-type-radio",
    "Choose Image Correction Type",
    "correctionTypeOption",
    urlParams.correctionTypeOption,
    "Choose either Top of Atmosphere or Surface Reflectance Correction Type",
    changeCorrectionTypeOption
  );

  function changeCorrectionTypeOption() {
    console.log(correctionTypeOption);
  }

  addHiFormProcessButton("pre-post-dates-div");

  function handleProcess() {
    // Check Parameters
    if (urlParams.preDate2 >= urlParams.postDate1) {
      setTimeout(
        () =>
          showMessage(
            "Invalid Dates Provided",
            "The Pre Date Range cannot be after the Post Date Range nor should they overlap",
            "date-alert-modal"
          ),
        0
      );

      return;
    }

    // Set Display Params
    $(`#display-aoi-selection`).html(selectedCountyAndStateStr);
    $(`#pre-display-date-selection`).html(
      `${urlParams.preDate1} - ${urlParams.preDate2}`
    );
    $(`#post-display-date-selection`).html(
      `${urlParams.postDate1} - ${urlParams.postDate2}`
    );

    // Open or Close Accordians

    $("#layer-list-collapse-div").removeClass("collapse");
    $("#layer-list-collapse-div").addClass("show");

    // Run HiForm Process
    $("#Select-Off-checkbox").click();
    hiform_bmp_process();
  }

  addCollapse(
    "sidebar-left",
    "layer-list-collapse",
    "layer-list-collapse-div",
    "View HiForm BMP Results",
    '<i role="img" class="fa fa-tree mr-1" aria-hidden="true"></i>',
    false,
    null,
    mode + " DATA layers to view on map"
  );

  $("#layer-list-collapse-div").append(
    `<ul id="layer-list" class = "layer-list"></ul>`
  );

  // addHiFormResetButton("layer-list-collapse-div");

  function handleHiFormReset() {
    // Make Parameters Visible again and Hide the Param Display
    $("#select-aoi-div").show();
    $("#pre-post-dates-div").show();
    $(`#select-aoi-current-params`).hide();
    $(`#date-current-params`).hide();

    // Open or Close Accordians
    $("#layer-list-collapse-label").addClass("collapsed");
    $("#layer-list-collapse-div").removeClass("show");
    $("#layer-list-collapse-label").prop("ariaExpanded", false);

    $("#pre-post-dates-div").toggleClass("collapsed show");
    $("#pre-post-dates-label").removeClass("collapsed");
    $("#pre-post-dates-label").prop("ariaExpanded", true);

    $("#select-aoi-div").toggleClass("collapsed show");
    $("#select-aoi-label").removeClass("collapsed");
    $("#select-aoi-label-label").prop("ariaExpanded", true);

    delete urlParams.postDate1;
    delete urlParams.postDate2;
    delete urlParams.preDate1;
    delete urlParams.preDate2;

    delete urlParams.selectedCounty;
    delete urlParams.selectedState;

    $("#post-date-one").val("");
    $("#post-date-two").val("");
    $("#pre-date-one").val("");
    $("#pre-date-two").val("");

    $("#selected-date-range").hide();

    // Reset Map
    reRun();

    // ReAdd Select AOI
    $("#select-aoi-div").empty();

    addSelectTypeRadio(
      "select-aoi-div",
      "select-type-radio",
      "Choose County Selection Type",
      "selectOption",
      urlParams.aoiSelectionType,
      "Choose method to select county to run Hi-Form BMP across",
      handleAoiSelectionType
    );
    handleAoiSelectionType(selectOption);
  }

  addCollapse(
    "sidebar-left",
    "related-layers-label",
    "related-layers-div",
    "BMP Related Layers",
    `<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="./src/assets/images/layer_icon.png">`,
    false,
    null,
    "View related layers for HiForm BMP"
  );

  $("#related-layers-div").append(
    `<ul id="related-layer-list" class = "layer-list"></ul>`
  );
  addCollapse(
    "sidebar-left",
    "tools-collapse-label",
    "tools-collapse-div",
    "TOOLS",
    `<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,
    false,
    "",
    "Tools to measure and chart data provided on the map"
  );
  addCollapse(
    "sidebar-left",
    "download-collapse-label",
    "download-collapse-div",
    "Download Data",
    `<i role="img" class="fa fa-cloud-download mr-1" aria-hidden="true"></i>`,
    false,
    null,
    "Download HiForm BMP results"
  );

  addHiFormExport("download-collapse-div");

  addCollapse(
    "sidebar-left",
    "hiform-support-label",
    "hiform-support-div",
    "Support",
    '<i role="img" class="fa fa-question-circle  mr-1" aria-hidden="true"></i>',
    false,
    null,
    "Access HiForm BMP Support Resources"
  );
  $("#hiform-support-div").append(staticTemplates.hiformSupportDiv);
} else {
  addCollapse(
    "sidebar-left",
    "layer-list-collapse-label",
    "layer-list-collapse-div",
    "ANCILLARY DATA",
    `<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="./src/assets/images/layer_icon.png">`,
    true,
    null,
    mode + " DATA layers to view on map"
  );

  addCollapse(
    "sidebar-left",
    "reference-layer-list-collapse-label",
    "reference-layer-list-collapse-div",
    "PLOT DATA",
    `<img style = 'width:1.1em;' class='image-icon mr-1' alt="Layers icon" src="./src/assets/images/layer_icon.png">`,
    false,
    null,
    "Additional relevant layers to view on map intended to provide context for " +
      mode +
      " DATA"
  );

  addCollapse(
    "sidebar-left",
    "tools-collapse-label",
    "tools-collapse-div",
    "TOOLS",
    `<i role="img" class="fa fa-gear mr-1" aria-hidden="true"></i>`,
    false,
    "",
    "Tools to measure and chart data provided on the map"
  );

  $("#layer-list-collapse-div").append(
    `<ul id="layer-list" class = "layer-list"></ul>`
  );

  $("#reference-layer-list-collapse-div").append(
    `<ul id="reference-layer-list" class = "layer-list"></ul>`
  );
  plotsOn = true;
}

$("body").append(
  `<div class = 'legendDiv flexcroll col-sm-5 col-md-3 col-lg-3 col-xl-2 p-0 m-0' id = 'legendDiv'></div>`
);
$(".legendDiv").css("bottom", "1rem");
$(".sidebar").css("max-height", $("body").height() - $(".bottombar").height());
addLegendCollapse();
/////////////////////////////////////////////////////////////////
//Construct tool options for different modes
addAccordianContainer("tools-collapse-div", "tools-accordian");
$("#tools-accordian").append(
  `<h5 class = 'pt-2' style = 'border-top: 0.0em solid black;'>Measuring Tools</h5>`
);
addSubAccordianCard(
  "tools-accordian",
  "measure-distance-label",
  "measure-distance-div",
  "Distance Measuring",
  staticTemplates.distanceDiv,
  false,
  `toggleTool(toolFunctions.measuring.distance)`,
  staticTemplates.distanceTipHover
);

addSubAccordianCard(
  "tools-accordian",
  "measure-area-label",
  "measure-area-div",
  "Area Measuring",
  staticTemplates.areaDiv,
  false,
  `toggleTool(toolFunctions.measuring.area)`,
  staticTemplates.areaTipHover
);
addRadio(
  "measure-distance-div",
  "metricOrImperialDistance-radio",
  "",
  "Imperial",
  "Metric",
  "metricOrImperialDistance",
  "imperial",
  "metric",
  "updateDistance",
  "updateDistance",
  "Toggle between imperial or metric units"
);

addRadio(
  "measure-area-div",
  "metricOrImperialArea-radio",
  "",
  "Imperial",
  "Metric",
  "metricOrImperialArea",
  "imperial",
  "metric",
  "updateArea",
  "updateArea",
  "Toggle between imperial or metric units"
);

addShapeEditToolbar(
  "measure-distance-div",
  "measure-distance-div-icon-bar",
  "undoDistanceMeasuring()",
  "resetPolyline()"
);
addColorPicker(
  "measure-distance-div-icon-bar",
  "distance-color-picker",
  "updateDistanceColor",
  distancePolylineOptions.strokeColor
);

addShapeEditToolbar(
  "measure-area-div",
  "measure-area-div-icon-bar",
  "undoAreaMeasuring()",
  "resetPolys()"
);
addColorPicker(
  "measure-area-div-icon-bar",
  "area-color-picker",
  "updateAreaColor",
  areaPolygonOptions.strokeColor
);

$("#tools-accordian").append(
  `<h5 class = 'pt-2' style = 'border-top: 0.1em solid black;'>Pixel Tools</h5>`
);
addSubAccordianCard(
  "tools-accordian",
  "query-label",
  "query-div",
  "Query Visible Map Layers",
  staticTemplates.queryDiv,
  false,
  `toggleTool(toolFunctions.pixel.query)`,
  staticTemplates.queryTipHover
);
if ($("#toggle-show-splash-screen-radio-container").length === 1) {
  //Sync tooltip toggle
  var tShowSplash = true;
  if (
    localStorage["showIntroModal-" + mode] !== null &&
    localStorage["showIntroModal-" + mode] !== undefined
  ) {
    tShowSplash = localStorage["showIntroModal-" + mode];
  }
  addRadio(
    "toggle-show-splash-screen-radio-container",
    "showIntroModal-radio",
    "Show Splash Screen",
    "Yes",
    "No",
    "localStorage['showIntroModal-'+mode]",
    "true",
    "false",
    null,
    null,
    "Whether to show splash screen when this page reloads."
  );
  if (tShowSplash === "false") {
    $("#showIntroModal-radio-second_toggle_label").click();
  }
}
if (
  ["Bloom-Mapper", "TreeMap", "sequoia-view", "HiForm-BMP"].indexOf(mode) === -1
) {
  addSubAccordianCard(
    "tools-accordian",
    "pixel-chart-label",
    "pixel-chart-div",
    "Query " + mode + " Time Series",
    staticTemplates.pixelChartDiv,
    false,
    `toggleTool(toolFunctions.pixel.chart)`,
    staticTemplates.pixelChartTipHover
  );
  addDropdown(
    "pixel-chart-div",
    "pixel-collection-dropdown",
    "Choose which " + mode + " time series to chart",
    "whichPixelChartCollection",
    "Choose which " + mode + " time series to chart."
  );
}

if (mode === "geeViz") {
  $("#pixel-chart-label").remove();
  $("#share-button").remove();
  $("#usda-notices").remove();
}
if (mode === "LAMDA") {
  $("#pixel-chart-label").remove();
}
if (
  mode === "LCMS-pilot" ||
  mode === "MTBS" ||
  mode === "IDS" ||
  mode === "LCMS" ||
  mode === "geeViz" ||
  mode === "LAMDA" ||
  mode === "TreeMap"
) {
  $("#tools-accordian").append(
    `<h5 class = 'pt-2' style = 'border-top: 0.1em solid black;'>Area Tools</h5>`
  );
  addSubCollapse(
    "tools-accordian",
    "area-chart-params-label",
    "area-chart-params-div",
    "Area Tools Parameters",
    "",
    false,
    ""
  );
  $("#area-chart-params-label").prop(
    "title",
    "Click here to select which LCMS products to chart, and change which area units are used. "
  );
  addDropdown(
    "area-chart-params-div",
    "area-collection-dropdown",
    "Choose which " + mode + " product to summarize",
    "whichAreaChartCollection",
    "Choose which " + mode + " time series to summarize."
  );
  $("#area-chart-params-div").append(`<hr>`);
  addMultiRadio(
    "area-chart-params-div",
    "area-summary-format",
    "Area Units",
    "areaChartFormat",
    { Percentage: true, Acres: false, Hectares: false }
  );
  if (mode === "LCMS" || mode === "geeViz") {
    var activeStartYear = urlParams.startYear;
    var activeEndYear = urlParams.endYear;
    $("#area-chart-params-div").append(
      `<div id='transition-periods-container'></div>`
    );
  }

  $("#area-summary-format").prop(
    "title",
    "Choose how to summarize area- as a percentage of the area, acres, or hectares."
  );
  addSubAccordianCard(
    "tools-accordian",
    "map-defined-area-chart-label",
    "map-defined-area-chart-div",
    "Map Extent Area",
    staticTemplates.mapDefinedAreaChartDiv,
    false,
    `toggleTool(toolFunctions.area.mapBounds)`,
    staticTemplates.mapDefinedAreaChartTipHover
  );
  addSubAccordianCard(
    "tools-accordian",
    "user-defined-area-chart-label",
    "user-defined-area-chart-div",
    "User-Defined Area",
    staticTemplates.userDefinedAreaChartDiv,
    false,
    `toggleTool(toolFunctions.area.userDefined)`,
    staticTemplates.userDefinedAreaChartTipHover
  );
  addSubAccordianCard(
    "tools-accordian",
    "upload-area-chart-label",
    "upload-area-chart-div",
    "Upload an Area",
    staticTemplates.uploadAreaChartDiv,
    false,
    "toggleTool(toolFunctions.area.shpDefined)",
    staticTemplates.uploadAreaChartTipHover
  );
  addSubAccordianCard(
    "tools-accordian",
    "select-area-interactive-chart-label",
    "select-area-interactive-chart-div",
    "Select an Area on Map",
    staticTemplates.selectAreaInteractiveChartDiv,
    false,
    "toggleTool(toolFunctions.area.selectInteractive)",
    staticTemplates.selectAreaInteractiveChartTipHover
  );
  addRangeSlider(
    "upload-reduction-factor-container",
    "Vertex Reduction Factor",
    "uploadReductionFactor",
    1,
    5,
    1,
    1,
    "upload-reduction-factor-slider",
    "null",
    "Every n vertex in uploaded file will be kept for polygons > 100 vertices (E.g. if 3 is chosen, every third vertex remains). This is intended to help enable use of uploaded areas that may have failed due to its size."
  );
  addRangeSlider(
    "simplify-error-range-container",
    "Simplify Area - Max Error",
    "simplifyMaxError",
    0,
    500,
    0,
    50,
    "simplify-error-slider",
    "null",
    "If the selected area is very large and/or has a lot of vertices, it may not compute. In this instance, clear out any existing selections (trash can button below), and increase this value. The selected polygon will be simplified using a max error in meters equal to this value upon selection. Generally between 50 and 150 will get most areas to work."
  );
  addShapeEditToolbar(
    "user-defined-edit-toolbar",
    "user-defined-area-icon-bar",
    "undoUserDefinedAreaCharting()",
    "restartUserDefinedAreaCarting()"
  );
  addColorPicker(
    "user-defined-area-icon-bar",
    "user-defined-color-picker",
    "updateUDPColor",
    udpOptions.strokeColor
  );

  addShapeEditToolbar(
    "select-features-edit-toolbar",
    "select-area-interactive-chart-icon-bar",
    "removeLastSelectArea()",
    "clearSelectedAreas()",
    "Click to unselect most recently selected polyogn",
    "Click to clear all selected polygons"
  );
}
$("#tools-accordian").append(`<div class="hl"></div>`);
//Sync tooltip toggle
var tShowToolTipModal = true;
if (
  localStorage["showToolTipModal-" + mode] !== null &&
  localStorage["showToolTipModal-" + mode] !== undefined
) {
  tShowToolTipModal = localStorage["showToolTipModal-" + mode];
}
addRadio(
  "tools-accordian",
  "tooltip-radio",
  "Show tool tips",
  "Yes",
  "No",
  "localStorage['showToolTipModal-'+mode]",
  "true",
  "false",
  null,
  null,
  "Whether to show tool tips to help explain how to use the tools."
);
if (tShowToolTipModal === "false") {
  $("#tooltip-radio-second_toggle_label").click();
}
// Add functionality to Sequoia mode for user to upload a shapefile, geoJSON, etc
if (mode === "sequoia-view") {
  $("#tools-accordian").append(
    `<h5 class = 'pt-2' style = 'border-top: 0.1em solid black;'>Area Tools</h5>`
  );

  addSubAccordianCard(
    "tools-accordian",
    "upload-area-chart-label",
    "upload-area-chart-div",
    "Upload an Area",
    staticTemplates.uploadShpToMapLayerDiv,
    false,
    "toggleTool(toolFunctions.area.shpDefined)",
    staticTemplates.uploadAreaChartTipHover
  );
}

//Add some logos for different modes
if (mode === "MTBS" || mode === "Ancillary") {
  $("#contributor-logos")
    .prepend(`<a href="https://www.usgs.gov/" target="_blank" >
                                    <img src="./src/assets/images/usgslogo.png" class = 'image-icon-bar' alt="USGS logo" title="Click to learn more about the US Geological Survey">
                                  </a>`);
  $("#contributor-logos")
    .prepend(`<a href="https://www.mtbs.gov/" target="_blank" >
                                    <img src="./src/assets/images/mtbs-logo-large.png" class = 'image-icon-bar' alt="MTBS logo" title="Click to learn more about MTBS">
                                  </a>`);
}
//Handle exporting if chosen
if (canExport) {
  // console.log('here')
  if (mode !== "HiForm-BMP") {
    $("#download-collapse-div").append(staticTemplates.exportContainer);
  }
  if (
    localStorage.export_crs !== undefined &&
    localStorage.export_crs !== null &&
    urlParams.exportCRS === undefined &&
    localStorage.export_crs.indexOf("EPSG") > -1
  ) {
    $("#export-crs").val(localStorage.export_crs);
  } else {
    localStorage.export_crs = $("#export-crs").val();
  }
  function cacheCRS() {
    localStorage.export_crs = $("#export-crs").val();
  }
  if (mode === "STORM") {
    $("#export-area-drawing-div").append(`<hr>
                                            <button class = 'btn' onclick = 'addTrackBounds()' title = 'Add bounds of storm track for export area.'><i class="pr-1 fa fa-square-o" aria-hidden="true"></i> Use storm track bound as area to download</button>
                                            `);
    $("#export-button-div").append(`<hr>`);
    addRangeSlider(
      "export-button-div",
      "Quick look spatial resolution",
      "quickLookRes",
      1200,
      6000,
      3000,
      300,
      "quick-look-res-slider",
      "null",
      "Specify spatial resolution for quick look downloads."
    );
    $("#export-button-div")
      .append(`<button class = 'btn' onclick = 'downloadQuickLooks()'  title = 'Quickly download outputs at coarse resolution'><i class="pr-1 fa fa-cloud-download" aria-hidden="true"></i>Download Quick Look Outputs</button>
                                            `);
  }
}
function resizeViewerPanes() {
  console.log("resized");
  if (mode !== "lcms-dashboard") {
    moveCollapse("chart-collapse");
    moveCollapse("legend-collapse");
    moveCollapse("table-collapse");
  }

  $(".legendDiv").css("bottom", "1rem");
  $(".legendDiv").css(
    "max-height",
    window.innerHeight - convertRemToPixels(1) + 1
  );
  $(".sidebar").css(
    "max-height",
    $("body").height() - $(".bottombar").height()
  );
  // moveCollapse('plot-collapse');
  if (walkThroughAdded) {
    moveCollapse("walk-through-collapse");
  }

  adjustTitleBanner();
  // addLegendCollapse();
}

function resizeDashboardPanes() {
  console.log("resized");
  let layerWidth = $(
    "#layer-list-collapse-label-layer-list-collapse-div"
  ).width(); //+5;
  let bottomHeight = $(".bottombar").height();
  let resultsHeight = $("#dashboard-results-container").height();
  let sidebarHeight = $("#sidebar-left-container").height();
  let expanderHeight = $("#dashboard-results-expander").height();
  let highlightsWidth = $(".dashboard-highlights").width();
  let highlightsHeight = $(".dashboard-highlights").height();
  $("#sidebar-left-container").css(
    "max-height",
    window.innerHeight - bottomHeight
  );
  if (
    sidebarHeight + bottomHeight + resultsHeight + expanderHeight <
    window.innerHeight
  ) {
    $("#dashboard-results-container").css("left", 0);
    if (
      highlightsHeight <
      window.innerHeight - resultsHeight - expanderHeight
    ) {
      $("#dashboard-results-container").css("max-width", window.innerWidth);
    } else {
      $("#dashboard-results-container").css(
        "max-width",
        window.innerWidth - highlightsWidth
      );
    }
  } else {
    $("#dashboard-results-container").css("left", layerWidth);
    if (
      highlightsHeight <
      window.innerHeight - resultsHeight - expanderHeight
    ) {
      $("#dashboard-results-container").css(
        "max-width",
        window.innerWidth - layerWidth
      );
      $(".dashboard-highlights").css("height");
    } else {
      $("#dashboard-results-container").css(
        "max-width",
        window.innerWidth - layerWidth - highlightsWidth
      );
    }
  }

  $("#dashboard-results-container").css(
    "bottom",
    bottomHeight + expanderHeight - 1
  );
  if (resultsHeight > 0) {
    $(".dashboard-highlights").css(
      "max-height",
      window.innerHeight - bottomHeight
    );
  } else {
    $(".dashboard-highlights").css(
      "max-height",
      window.innerHeight - bottomHeight
    );
  }

  try {
    if ($(window).width() < 768) {
      moveDashboardResults("left");
    } else if ($(window).width() >= 768) {
      moveDashboardResults("right");
    }
  } catch (err) {
    console.log(err);
  }
  $(".dashboard-results-toggler").css(
    "right",
    `${
      (($("#dashboard-results-container-right").width() -
        convertRemToPixels(3)) /
        $("body").width()) *
      100
    }%`
  );
}
if (mode === "lcms-dashboard") {
  $("body").append(staticTemplates.dashboardResultsToggler);
  $(".dashboard-results-toggler").css(
    "right",
    `${
      (($("#dashboard-results-container-right").width() -
        convertRemToPixels(3)) /
        $("body").width()) *
      100
    }%`
  );
  var dashboardScrollLeft = 0;
  var dashboardScrollTop = { left: 0, right: 0 };
  if (
    urlParams.showHighlightsBar === undefined ||
    urlParams.showHighlightsBar === null
  ) {
    urlParams.showHighlightsBar = true;
  }
  if (!urlParams.showHighlightsBar) {
    $("#highlights-tables-container").hide();
  }
  moveCollapse("legend-collapse", "sidebar-left");

  var dashboardResultsLocation = "right";
  var dashboardMoveLocationDict = {
    right: "dashboard-results-list",
    left: "charts-highlights-placeholder",
  };
  var dashboardScrollDict = {
    right: "#dashboard-results-container-right",
    left: "#sidebar-left-container",
  };

  var resultsScrollHandler = function () {
    clearTimeout($.data(this, "scrollTimer"));
    $.data(
      this,
      "scrollTimer",
      setTimeout(function () {
        dashboardScrollTop[dashboardResultsLocation] = $(
          dashboardScrollDict[dashboardResultsLocation]
        ).scrollTop();
      }, 250)
    );
  };
  var turnOnScrollMonitoring = function () {
    $(dashboardScrollDict[dashboardResultsLocation]).scroll(
      resultsScrollHandler
    );
  };
  var turnOffScrollMonitoring = function () {
    $(dashboardScrollDict[dashboardResultsLocation]).off(
      "scroll",
      resultsScrollHandler
    );
  };

  $(".panel-title").click((e) => {
    setTimeout(() => {
      resizeDashboardPanes();
    }, 500);
  });
  function addExpander() {
    var expander = {};
    expander.setDragID = (id) => (expander.id = id);
    expander.mouseDown = false;
    expander.mouseUpFun;
    expander.originalBackgroundColor;
    expander.startListening = () => {
      $("body")
        .mousedown((e) => {
          if (e.target.id === expander.id) {
            expander.mouseDown = true;
            expander.originalBackgroundColor = $(`#${expander.id}`).css(
              "background-color"
            );
            $(`#${expander.id}`).css("background-color", "#00BFA5");

            $("body").css("user-select", "none");
          }
        })
        .mouseup((e) => {
          if (expander.mouseDown) {
            console.log("mouseUp");
            expander.mouseDown = false;
            expander.mouseUpFun(e);
            $(`#${expander.id}`).css(
              "background-color",
              expander.originalBackgroundColor
            );
            $("body").css("user-select", "auto");
          }
        });
    };

    return expander;
  }
  var dashboardResultsHeight = convertRemToPixels(23);
  var expander = addExpander();
  expander.setDragID("dashboard-results-expander");

  expander.mouseUpFun = (e) => {
    dashboardResultsHeight =
      window.innerHeight - e.pageY - $(`#${expander.id}`).height();
    $(".dashboard-results-container").css("height", dashboardResultsHeight);

    updateDashboardCharts();
  };
  expander.startListening();

  var isDragging = false;
  var wasDragging = false;
  var mouseDown = false;

  var dragBox;
  function dashboardSelectionModeChange() {
    if (dashboardAreaSelectionMode === "View-Extent") {
      clearAllSelectedDashboardFeatures();
      startDashboardViewExtentSelect();
      try {
        dragBox.stopListening();
      } catch (err) {}
      dashboardBoxSelect();
    } else if (dashboardAreaSelectionMode === "Drag-Box") {
      if (dragBox === undefined) {
        dragBox = addDragBox();
        dragBox.addListenTo(map, "map");
        dragBox.addOnStopFunction(dashboardDragboxLayerSelect);
        dragBox.addOnStartFunction(clearAllSelectedDashboardFeatures);
      }
      stopDashboardViewExtentSelect();
      stopDashboardClickLayerSelect();
      clearAllSelectedDashboardFeatures();
      dragBox.startListening();
    } else {
      stopDashboardViewExtentSelect();
      clearAllSelectedDashboardFeatures();
      startDashboardClickLayerSelect();
      try {
        dragBox.stopListening();
      } catch (err) {}
    }
  }
  $("#summary-area-selection-radio").change(() =>
    dashboardSelectionModeChange()
  );
  var showPairwiseDiff;
  pairwiseDiffFun = () => {
    if (pairwiseDiff === "Annual-Change") {
      showPairwiseDiff = true;
    } else {
      showPairwiseDiff = false;
    }
  };
  pairwiseDiffFun();
  $("#summary-pairwise-diff-radio").change(() => {
    pairwiseDiffFun();
    updateDashboardCharts();
  });
  $("#support-collapse-div").append(staticTemplates.supportDivDashboard);
}
if (urlParams.showSidebar === undefined || urlParams.showSidebar === null) {
  urlParams.showSidebar = true;
}

if (urlParams.showSidebar === "true") {
  urlParams.showSidebar = true;
} else if (urlParams.showSidebar === "false") {
  urlParams.showSidebar = false;
}

function toggleSidebar() {
  $("#sidebar-left").toggle("collapse");

  if (mode === "lcms-dashboard") {
    setTimeout(() => {
      resizeDashboardPanes();
    }, 500);
  }
  if (urlParams.showSidebar === false) {
    urlParams.showSidebar = true;
  } else {
    urlParams.showSidebar = false;
  }
}
function toggleHighlights() {
  turnOffScrollMonitoring();
  $("#dashboard-results-list").toggle("collapse");
  setTimeout(() => {
    resizeDashboardPanes();
    urlParams.showHighlightsBar =
      $("#dashboard-results-list").css("display") !== "none";
    turnOnScrollMonitoring();
  }, 500);
}
if (urlParams.showSidebar === false) {
  $("#sidebar-left").hide();
}
