function exportToCsv2(areaObjID, bn, filename) {
  let table = areaChart.areaChartObj[areaObjID].tableExportData[bn];
  const blob = new Blob([table], { type: "text/csv;charset=utf-8;" });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      ga("send", "event", mode, "new-area-chart-chartDownload", "csv");
    }
  }
}
//////////////////////////////////////////////////////////////////////////
function downloadPlotlyAreaChartWrapper(areaObjID, bn, filename) {
  console.log(areaChart.areaChartObj[areaObjID].plots[bn]);
  downloadPlotly(
    areaChart.areaChartObj[areaObjID].plots[bn].plot,
    filename,
    true,
    2,
    areaChart.areaChartObj[areaObjID].plots[bn].containerID
  );
}
//////////////////////////////////////////////////////////////////////////
function areaChartCls() {
  this.setupTransitionPeriodUI = setupTransitionPeriodUI;
  this.setupTransitionPeriodUI();
  this.areaChartID = 1;
  this.makeChartID = 0;
  this.outstandingAddLayers = 0;
  this.chartLayerSelectFromMapLayers = true; //Whether to only chart visible area chart enabled layers

  this.areaChartObj = {};
  this.outstandingChartRequests = {};
  this.maxOutStandingChartRequests = {};
  this.chartContainerID = "chart-collapse-div";
  this.layerSelectContainerID = "area-chart-params-div";
  this.layerSelectID = "area-chart-layer-select";
  this.listeners = [];

  this.plot_bgcolor = "#d6d1ca";
  this.plot_font = "Roboto Condensed, sans-serif";
  this.areaChartingOn = false;
  this.autoChartingOn = false;
  this.firstRun = true;
  this.chartHWRatio = 0.7;
  this.sankeyTransitionPeriodYearBuffer = 0;
  this.currentSankeyLinkColors = [];
  this.sankeyChartIDs = [];
  this.chartDecimalProportion = chartDecimalProportion;
  this.chartPrecision = chartPrecision;
  $("body").append();

  //////////////////////////////////////////////////////////////////////////
  // Function to update Sankey colors
  this.updateSankeyLinkColors = function () {
    let allI = 0;
    // $(".sankey>g.sankey-links").css("fill", "");
    areaChart.sankeyChartIDs.map((id) => {
      let grads = $(`#${id}>.plot-container>.svg-container>svg:first>defs`);
      let plotContainer = $(`#${id}>.plot-container>`);
      let links = $(
        `#${id}>.plot-container>.svg-container>svg:first>g.sankey>g.sankey-links>path.sankey-link`
      );
      let nodes = $(
        `#${id}>.plot-container>.svg-container>svg:first>g.sankey>g.sankey-node-set>g.sankey-node`
      );
      let sankeyContainer = $(
        `#${id}>.plot-container>.svg-container>svg:first>g.sankey`
      );
      let sankeyLinkContainer = $(
        `#${id}>.plot-container>.svg-container>svg:first>g.sankey>g.sankey-links`
      );
      // sankeyContainer.empty();
      let svgContainerID = `${id}-new-container`;
      // sankeyContainer.append(
      //   `<svg xmlns="http://www.w3.org/2000/svg" role="img" id = "${svgContainerID}"</svg>`
      // );
      // sankeyLinkContainer.append(`<defs></defs>`);
      $(grads).empty();
      let svgContainer = $(`#${svgContainerID}`);
      $(links).each((i, element) => {
        const gradID = `linear-grad-${allI}`;
        // console.log(i);

        grads.append(
          `<linearGradient id="${gradID}" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" style="stop-color:#FFFF00;stop-opacity:1;"></stop>
            <stop offset="100%" style="stop-color:#0088FF;stop-opacity:1;"></stop>
          </linearGradient>`
        );

        // console.log(links);
        // $(element).attr("style", ``);
        // $(element).attr("fill-opacity", 0.8);
        // // $(element).css({ "mix-blend-mode": "multiply" });
        // $(element).attr("fill", `url(#${gradID})`);
        // $(element).attr("fill-opacity", 0.6);
        // $(element).attr("stroke", "none");
        $(element).css({ fill: `url(#${gradID})`, "fill-opacity": 1 });
        // svgContainer.append($(element));
        allI++;
      });

      // $(nodes).each((i, element) => {
      //   let rect = $(element).children(":first");
      //   console.log(rect);
      //   svgContainer.append($(rect));
      // });
    });
    // });
    // $(".main-svg>defs>g.gradients").empty();

    // $(".sankey>g.sankey-links>path.sankey-link").each((i, element) => {
    //   const gradID = `grad-${i}`;
    //   console.log(i);
    //   // $(`<defs>
    //   // <linearGradient id="${gradID}" spreadMethod="pad" x1="0%" x2="100%" y1="0%" y2="100%">
    //   //   <stop offset="0%" stop-color="#${areaChart.currentSankeyLinkColors[i][0]}"></stop>
    //   //   <stop offset="100%" stop-color="#${areaChart.currentSankeyLinkColors[i][1]}"></stop>
    //   // </linearGradient>
    //   // </defs>
    //   // `).insertBefore(element);

    //   // $(element).attr("style", ``);
    //   // $(element).css("mix-blend-mode", "multiply");
    //   // $(element).attr("fill", `url(#${gradID})`);
    //   // $(element).attr("fill-opacity", "1.0");

    //   $(element).css("fill", "#F00");
    // });
  };
  this.addMBSankey = function () {
    $("#legendDiv").css("max-width", "1000px");
    $(".sankey").empty();
    $(".sankey").append(
      `<svg width="900" height="400" aria-label="A chart." style="overflow: hidden;"><defs id="_ABSTRACT_RENDERER_ID_0"><linearGradient id="_ABSTRACT_RENDERER_ID_1" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FF0000;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FF2626;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_2" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FF0000;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FFFF00;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_3" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FF0000;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FFFF26;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_4" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FF0000;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#0000FF;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_5" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#2626FF;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FF2626;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_6" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#2626FF;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FFFF00;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_7" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#2626FF;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#0000FF;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_8" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FFA500;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FF2626;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_9" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FFA500;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FFFF00;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_10" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FFA500;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FFFF26;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_11" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FFA500;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#0000FF;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_12" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FFB226;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FF2626;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_13" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FFB226;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FFFF00;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_14" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FFB226;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FFFF26;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_15" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FFB226;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#0000FF;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_16" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FF2626;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#008000;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_17" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FF2626;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#269326;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_18" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FF2626;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#800080;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_19" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FF2626;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#932693;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_20" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FFFF00;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#008000;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_21" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FFFF00;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#269326;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_22" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FFFF00;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#008080;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_23" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FFFF00;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#800080;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_24" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FFFF00;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#932693;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_25" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FFFF26;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#269326;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_26" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FFFF26;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#800080;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_27" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#FFFF26;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#932693;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_28" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#0000FF;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#008000;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_29" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#0000FF;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#269326;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_30" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#0000FF;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#800080;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_31" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#0000FF;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#932693;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_32" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#932693;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#269393;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_33" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#932693;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FFC0CB;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_34" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#932693;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FFC9D2;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_35" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#008000;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#269393;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_36" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#008000;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FFC0CB;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_37" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#008000;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FFC9D2;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_38" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#269326;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#269393;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_39" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#269326;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FFC0CB;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_40" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#269326;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FFC9D2;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_41" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#008080;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#269393;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_42" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#008080;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FFC0CB;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_43" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#008080;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FFC9D2;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_44" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#800080;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#269393;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_45" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#800080;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FFC0CB;stop-opacity:1"></stop></linearGradient><linearGradient id="_ABSTRACT_RENDERER_ID_46" x1="0%" y1="0" x2="100%" y2="0" gradientUnits="objectBoundingBox"><stop offset="0%" style="stop-color:#800080;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#FFC9D2;stop-opacity:1"></stop></linearGradient></defs><g><path d="M10,135.7291666666666C105.55555555555556,135.7291666666666,201.11111111111111,91.35416666666609,296.6666666666667,91.35416666666609L296.6666666666667,128.33333333333275C201.11111111111111,128.33333333333275,105.55555555555556,172.70833333333326,10,172.70833333333326Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_1)"></path><path d="M10,187.49999999999994C105.55555555555556,187.49999999999994,201.11111111111111,313.6458333333332,296.6666666666667,313.6458333333332L296.6666666666667,321.0416666666665C201.11111111111111,321.0416666666665,105.55555555555556,194.8958333333333,10,194.8958333333333Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_2)"></path><path d="M10,172.70833333333326C105.55555555555556,172.70833333333326,201.11111111111111,160.52083333333272,296.6666666666667,160.52083333333272L296.6666666666667,167.91666666666606C201.11111111111111,167.91666666666606,105.55555555555556,180.1041666666666,10,180.1041666666666Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_3)"></path><path d="M10,180.1041666666666C105.55555555555556,180.1041666666666,201.11111111111111,222.2916666666663,296.6666666666667,222.2916666666663L296.6666666666667,229.68749999999963C201.11111111111111,229.68749999999963,105.55555555555556,187.49999999999994,10,187.49999999999994Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_4)"></path><path d="M10,343.22916666666674C105.55555555555556,343.22916666666674,201.11111111111111,143.12499999999943,296.6666666666667,143.12499999999943L296.6666666666667,150.52083333333277C201.11111111111111,150.52083333333277,105.55555555555556,350.62500000000006,10,350.62500000000006Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_5)"></path><path d="M10,358.02083333333337C105.55555555555556,358.02083333333337,201.11111111111111,335.8333333333332,296.6666666666667,335.8333333333332L296.6666666666667,372.8124999999999C201.11111111111111,372.8124999999999,105.55555555555556,395.00000000000006,10,395.00000000000006Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_6)"></path><path d="M10,350.62500000000006C105.55555555555556,350.62500000000006,201.11111111111111,274.0624999999996,296.6666666666667,274.0624999999996L296.6666666666667,281.4583333333329C201.11111111111111,281.4583333333329,105.55555555555556,358.02083333333337,10,358.02083333333337Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_7)"></path><path d="M10,204.8958333333333C105.55555555555556,204.8958333333333,201.11111111111111,128.33333333333275,296.6666666666667,128.33333333333275L296.6666666666667,135.7291666666661C201.11111111111111,135.7291666666661,105.55555555555556,212.29166666666663,10,212.29166666666663Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_8)"></path><path d="M10,256.66666666666663C105.55555555555556,256.66666666666663,201.11111111111111,321.0416666666665,296.6666666666667,321.0416666666665L296.6666666666667,328.43749999999983C201.11111111111111,328.43749999999983,105.55555555555556,264.06249999999994,10,264.06249999999994Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_9)"></path><path d="M10,212.29166666666663C105.55555555555556,212.29166666666663,201.11111111111111,167.91666666666606,296.6666666666667,167.91666666666606L296.6666666666667,204.89583333333272C201.11111111111111,204.89583333333272,105.55555555555556,249.2708333333333,10,249.2708333333333Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_10)"></path><path d="M10,249.2708333333333C105.55555555555556,249.2708333333333,201.11111111111111,229.68749999999963,296.6666666666667,229.68749999999963L296.6666666666667,237.08333333333297C201.11111111111111,237.08333333333297,105.55555555555556,256.66666666666663,10,256.66666666666663Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_11)"></path><path d="M10,274.06250000000006C105.55555555555556,274.06250000000006,201.11111111111111,135.7291666666661,296.6666666666667,135.7291666666661L296.6666666666667,143.12499999999943C201.11111111111111,143.12499999999943,105.55555555555556,281.45833333333337,10,281.45833333333337Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_12)"></path><path d="M10,325.83333333333337C105.55555555555556,325.83333333333337,201.11111111111111,328.4374999999999,296.6666666666667,328.4374999999999L296.6666666666667,335.8333333333332C201.11111111111111,335.8333333333332,105.55555555555556,333.2291666666667,10,333.2291666666667Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_13)"></path><path d="M10,281.45833333333337C105.55555555555556,281.45833333333337,201.11111111111111,204.89583333333272,296.6666666666667,204.89583333333272L296.6666666666667,212.29166666666606C201.11111111111111,212.29166666666606,105.55555555555556,288.8541666666667,10,288.8541666666667Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_14)"></path><path d="M10,288.8541666666667C105.55555555555556,288.8541666666667,201.11111111111111,237.08333333333294,296.6666666666667,237.08333333333294L296.6666666666667,274.0624999999996C201.11111111111111,274.0624999999996,105.55555555555556,325.83333333333337,10,325.83333333333337Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_15)"></path><path d="M306.6666666666667,113.54166666666609C402.22222222222223,113.54166666666609,497.7777777777778,98.75000000000023,593.3333333333334,98.75000000000023L593.3333333333334,113.5416666666669C497.7777777777778,113.5416666666669,402.22222222222223,128.33333333333275,306.6666666666667,128.33333333333275Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_16)"></path><path d="M306.6666666666667,135.7291666666661C402.22222222222223,135.7291666666661,497.7777777777778,251.8749999999999,593.3333333333334,251.8749999999999L593.3333333333334,259.2708333333332C497.7777777777778,259.2708333333332,402.22222222222223,143.12499999999943,306.6666666666667,143.12499999999943Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_17)"></path><path d="M306.6666666666667,128.33333333333275C402.22222222222223,128.33333333333275,497.7777777777778,175.3125000000001,593.3333333333334,175.3125000000001L593.3333333333334,182.70833333333346C497.7777777777778,182.70833333333346,402.22222222222223,135.7291666666661,306.6666666666667,135.7291666666661Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_18)"></path><path d="M306.6666666666667,91.35416666666609C402.22222222222223,91.35416666666609,497.7777777777778,4.831690603168681e-13,593.3333333333334,4.831690603168681e-13L593.3333333333334,22.187500000000483C497.7777777777778,22.187500000000483,402.22222222222223,113.54166666666609,306.6666666666667,113.54166666666609Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_19)"></path><path d="M306.6666666666667,321.0416666666665C402.22222222222223,321.0416666666665,497.7777777777778,120.93750000000023,593.3333333333334,120.93750000000023L593.3333333333334,128.33333333333357C497.7777777777778,128.33333333333357,402.22222222222223,328.43749999999983,306.6666666666667,328.43749999999983Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_20)"></path><path d="M306.6666666666667,350.62499999999983C402.22222222222223,350.62499999999983,497.7777777777778,274.0624999999999,593.3333333333334,274.0624999999999L593.3333333333334,296.2499999999999C497.7777777777778,296.2499999999999,402.22222222222223,372.81249999999983,306.6666666666667,372.81249999999983Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_21)"></path><path d="M306.6666666666667,372.81249999999983C402.22222222222223,372.81249999999983,497.7777777777778,328.4375000000001,593.3333333333334,328.4375000000001L593.3333333333334,350.6250000000001C497.7777777777778,350.6250000000001,402.22222222222223,394.99999999999983,306.6666666666667,394.99999999999983Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_22)"></path><path d="M306.6666666666667,328.43749999999983C402.22222222222223,328.43749999999983,497.7777777777778,219.6875000000001,593.3333333333334,219.6875000000001L593.3333333333334,241.8750000000001C497.7777777777778,241.8750000000001,402.22222222222223,350.62499999999983,306.6666666666667,350.62499999999983Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_23)"></path><path d="M306.6666666666667,313.6458333333332C402.22222222222223,313.6458333333332,497.7777777777778,81.35416666666714,593.3333333333334,81.35416666666714L593.3333333333334,88.75000000000047C497.7777777777778,88.75000000000047,402.22222222222223,321.0416666666665,306.6666666666667,321.0416666666665Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_24)"></path><path d="M306.6666666666667,190.10416666666606C402.22222222222223,190.10416666666606,497.7777777777778,259.2708333333332,593.3333333333334,259.2708333333332L593.3333333333334,266.6666666666665C497.7777777777778,266.6666666666665,402.22222222222223,197.4999999999994,306.6666666666667,197.4999999999994Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_25)"></path><path d="M306.6666666666667,167.91666666666606C402.22222222222223,167.91666666666606,497.7777777777778,182.70833333333346,593.3333333333334,182.70833333333346L593.3333333333334,204.89583333333346C497.7777777777778,204.89583333333346,402.22222222222223,190.10416666666606,306.6666666666667,190.10416666666606Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_26)"></path><path d="M306.6666666666667,160.52083333333272C402.22222222222223,160.52083333333272,497.7777777777778,22.187500000000483,593.3333333333334,22.187500000000483L593.3333333333334,29.583333333333815C497.7777777777778,29.583333333333815,402.22222222222223,167.91666666666606,306.6666666666667,167.91666666666606Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_27)"></path><path d="M306.6666666666667,274.0624999999996C402.22222222222223,274.0624999999996,497.7777777777778,113.5416666666669,593.3333333333334,113.5416666666669L593.3333333333334,120.93750000000023C497.7777777777778,120.93750000000023,402.22222222222223,281.4583333333329,306.6666666666667,281.4583333333329Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_28)"></path><path d="M306.6666666666667,296.2499999999996C402.22222222222223,296.2499999999996,497.7777777777778,266.6666666666666,593.3333333333334,266.6666666666666L593.3333333333334,274.0624999999999C497.7777777777778,274.0624999999999,402.22222222222223,303.6458333333329,306.6666666666667,303.6458333333329Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_29)"></path><path d="M306.6666666666667,281.4583333333329C402.22222222222223,281.4583333333329,497.7777777777778,204.89583333333346,593.3333333333334,204.89583333333346L593.3333333333334,219.6875000000001C497.7777777777778,219.6875000000001,402.22222222222223,296.2499999999996,306.6666666666667,296.2499999999996Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_30)"></path><path d="M306.6666666666667,222.2916666666663C402.22222222222223,222.2916666666663,497.7777777777778,29.58333333333382,593.3333333333334,29.58333333333382L593.3333333333334,81.35416666666714C497.7777777777778,81.35416666666714,402.22222222222223,274.0624999999996,306.6666666666667,274.0624999999996Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_31)"></path><path d="M603.3333333333334,4.831690603168681e-13C698.8888888888889,4.831690603168681e-13,794.4444444444445,42.187500000000114,890,42.187500000000114L890,79.16666666666677C794.4444444444445,79.16666666666677,698.8888888888889,36.97916666666715,603.3333333333334,36.97916666666715Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_32)"></path><path d="M603.3333333333334,59.16666666666715C698.8888888888889,59.16666666666715,794.4444444444445,358.0208333333335,890,358.0208333333335L890,365.4166666666668C794.4444444444445,365.4166666666668,698.8888888888889,66.56250000000048,603.3333333333334,66.56250000000048Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_33)"></path><path d="M603.3333333333334,36.97916666666715C698.8888888888889,36.97916666666715,794.4444444444445,237.08333333333337,890,237.08333333333337L890,259.27083333333337C794.4444444444445,259.27083333333337,698.8888888888889,59.16666666666715,603.3333333333334,59.16666666666715Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_34)"></path><path d="M603.3333333333334,98.75000000000023C698.8888888888889,98.75000000000023,794.4444444444445,79.16666666666677,890,79.16666666666677L890,116.14583333333343C794.4444444444445,116.14583333333343,698.8888888888889,135.72916666666688,603.3333333333334,135.72916666666688Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_35)"></path><path d="M603.3333333333334,157.91666666666688C698.8888888888889,157.91666666666688,794.4444444444445,365.4166666666668,890,365.4166666666668L890,372.8125000000001C794.4444444444445,372.8125000000001,698.8888888888889,165.31250000000023,603.3333333333334,165.31250000000023Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_36)"></path><path d="M603.3333333333334,135.72916666666688C698.8888888888889,135.72916666666688,794.4444444444445,259.27083333333337,890,259.27083333333337L890,281.45833333333337C794.4444444444445,281.45833333333337,698.8888888888889,157.91666666666688,603.3333333333334,157.91666666666688Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_37)"></path><path d="M603.3333333333334,251.87499999999986C698.8888888888889,251.87499999999986,794.4444444444445,153.1250000000001,890,153.1250000000001L890,190.10416666666677C794.4444444444445,190.10416666666677,698.8888888888889,288.8541666666665,603.3333333333334,288.8541666666665Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_38)"></path><path d="M603.3333333333334,311.0416666666666C698.8888888888889,311.0416666666666,794.4444444444445,380.2083333333335,890,380.2083333333335L890,387.6041666666668C794.4444444444445,387.6041666666668,698.8888888888889,318.4374999999999,603.3333333333334,318.4374999999999Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_39)"></path><path d="M603.3333333333334,288.8541666666666C698.8888888888889,288.8541666666666,794.4444444444445,303.64583333333337,890,303.64583333333337L890,325.83333333333337C794.4444444444445,325.83333333333337,698.8888888888889,311.0416666666666,603.3333333333334,311.0416666666666Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_40)"></path><path d="M603.3333333333334,328.4375000000001C698.8888888888889,328.4375000000001,794.4444444444445,190.10416666666677,890,190.10416666666677L890,227.08333333333343C794.4444444444445,227.08333333333343,698.8888888888889,365.4166666666668,603.3333333333334,365.4166666666668Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_41)"></path><path d="M603.3333333333334,387.6041666666668C698.8888888888889,387.6041666666668,794.4444444444445,387.6041666666668,890,387.6041666666668L890,395.0000000000001C794.4444444444445,395.0000000000001,698.8888888888889,395.0000000000001,603.3333333333334,395.0000000000001Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_42)"></path><path d="M603.3333333333334,365.4166666666668C698.8888888888889,365.4166666666668,794.4444444444445,325.83333333333337,890,325.83333333333337L890,348.02083333333337C794.4444444444445,348.02083333333337,698.8888888888889,387.6041666666668,603.3333333333334,387.6041666666668Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_43)"></path><path d="M603.3333333333334,175.3125000000001C698.8888888888889,175.3125000000001,794.4444444444445,116.14583333333344,890,116.14583333333344L890,153.1250000000001C794.4444444444445,153.1250000000001,698.8888888888889,212.29166666666677,603.3333333333334,212.29166666666677Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_44)"></path><path d="M603.3333333333334,234.47916666666677C698.8888888888889,234.47916666666677,794.4444444444445,372.81250000000017,890,372.81250000000017L890,380.2083333333335C794.4444444444445,380.2083333333335,698.8888888888889,241.8750000000001,603.3333333333334,241.8750000000001Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_45)"></path><path d="M603.3333333333334,212.29166666666677C698.8888888888889,212.29166666666677,794.4444444444445,281.45833333333337,890,281.45833333333337L890,303.64583333333337C794.4444444444445,303.64583333333337,698.8888888888889,234.47916666666677,603.3333333333334,234.47916666666677Z" stroke="none" stroke-width="0" fill-opacity="0.6" fill="url(#_ABSTRACT_RENDERER_ID_46)"></path></g><g><text text-anchor="start" x="16" y="168.81249999999994" font-family="sans-serif" font-size="10" stroke="none" stroke-width="0" fill="#000000">Brazil</text><text text-anchor="start" x="312.6666666666667" y="124.4374999999994" font-family="sans-serif" font-size="10" stroke="none" stroke-width="0" fill="#000000">Portugal</text><text text-anchor="start" x="312.6666666666667" y="357.82291666666663" font-family="sans-serif" font-size="10" stroke="none" stroke-width="0" fill="#000000">France</text><text text-anchor="start" x="312.6666666666667" y="189.9062499999995" font-family="sans-serif" font-size="10" stroke="none" stroke-width="0" fill="#000000">Spain</text><text text-anchor="start" x="312.6666666666667" y="266.4687499999998" font-family="sans-serif" font-size="10" stroke="none" stroke-width="0" fill="#000000">England</text><text text-anchor="start" x="16" y="372.61458333333337" font-family="sans-serif" font-size="10" stroke="none" stroke-width="0" fill="#000000">Canada</text><text text-anchor="start" x="16" y="237.97916666666669" font-family="sans-serif" font-size="10" stroke="none" stroke-width="0" fill="#000000">Mexico</text><text text-anchor="start" x="16" y="307.14583333333337" font-family="sans-serif" font-size="10" stroke="none" stroke-width="0" fill="#000000">USA</text><text text-anchor="end" x="587.3333333333334" y="135.53125000000017" font-family="sans-serif" font-size="10" stroke="none" stroke-width="0" fill="#000000">Angola</text><text text-anchor="end" x="587.3333333333334" y="288.65625" font-family="sans-serif" font-size="10" stroke="none" stroke-width="0" fill="#000000">Senegal</text><text text-anchor="end" x="587.3333333333334" y="212.09375" font-family="sans-serif" font-size="10" stroke="none" stroke-width="0" fill="#000000">Morocco</text><text text-anchor="end" x="587.3333333333334" y="47.875000000000355" font-family="sans-serif" font-size="10" stroke="none" stroke-width="0" fill="#000000">South Africa</text><text text-anchor="end" x="587.3333333333334" y="365.21875000000006" font-family="sans-serif" font-size="10" stroke="none" stroke-width="0" fill="#000000">Mali</text><text text-anchor="end" x="884" y="138.13541666666674" font-family="sans-serif" font-size="10" stroke="none" stroke-width="0" fill="#000000">China</text><text text-anchor="end" x="884" y="380.01041666666674" font-family="sans-serif" font-size="10" stroke="none" stroke-width="0" fill="#000000">India</text><text text-anchor="end" x="884" y="296.0520833333334" font-family="sans-serif" font-size="10" stroke="none" stroke-width="0" fill="#000000">Japan</text><rect x="0" y="135.7291666666666" width="10" height="59.166666666666686" stroke="none" stroke-width="0" fill-opacity="0.8" fill="#ff0000"></rect><rect x="296.6666666666667" y="91.35416666666609" width="10" height="59.16666666666663" stroke="none" stroke-width="0" fill-opacity="0.8" fill="#ff2626"></rect><rect x="296.6666666666667" y="313.6458333333332" width="10" height="81.3541666666668" stroke="none" stroke-width="0" fill-opacity="0.8" fill="#ffff00"></rect><rect x="296.6666666666667" y="160.52083333333272" width="10" height="51.77083333333357" stroke="none" stroke-width="0" fill-opacity="0.8" fill="#ffff26"></rect><rect x="296.6666666666667" y="222.2916666666663" width="10" height="81.35416666666691" stroke="none" stroke-width="0" fill-opacity="0.8" fill="#0000ff"></rect><rect x="0" y="343.22916666666674" width="10" height="51.77083333333326" stroke="none" stroke-width="0" fill-opacity="0.8" fill="#2626ff"></rect><rect x="0" y="204.8958333333333" width="10" height="59.16666666666677" stroke="none" stroke-width="0" fill-opacity="0.8" fill="#ffa500"></rect><rect x="0" y="274.06250000000006" width="10" height="59.166666666666686" stroke="none" stroke-width="0" fill-opacity="0.8" fill="#ffb226"></rect><rect x="593.3333333333334" y="98.75000000000023" width="10" height="66.56249999999989" stroke="none" stroke-width="0" fill-opacity="0.8" fill="#008000"></rect><rect x="593.3333333333334" y="251.8749999999999" width="10" height="66.56250000000023" stroke="none" stroke-width="0" fill-opacity="0.8" fill="#269326"></rect><rect x="593.3333333333334" y="175.3125000000001" width="10" height="66.56249999999977" stroke="none" stroke-width="0" fill-opacity="0.8" fill="#800080"></rect><rect x="593.3333333333334" y="4.831690603168681e-13" width="10" height="88.74999999999974" stroke="none" stroke-width="0" fill-opacity="0.8" fill="#932693"></rect><rect x="593.3333333333334" y="328.4375000000001" width="10" height="66.56249999999989" stroke="none" stroke-width="0" fill-opacity="0.8" fill="#008080"></rect><rect x="890" y="42.187500000000114" width="10" height="184.89583333333326" stroke="none" stroke-width="0" fill-opacity="0.8" fill="#269393"></rect><rect x="890" y="358.0208333333335" width="10" height="36.979166666666515" stroke="none" stroke-width="0" fill-opacity="0.8" fill="#ffc0cb"></rect><rect x="890" y="237.08333333333337" width="10" height="110.93750000000011" stroke="none" stroke-width="0" fill-opacity="0.8" fill="#ffc9d2"></rect></g><g></g><g></g><g></g><g></g><g></g></svg>`
    );
  };
  //////////////////////////////////////////////////////////////////////////
  // Function for cleanup of all area chart layers and output divs
  this.clearLayers = function () {
    this.clearChartLayerSelect();
    this.areaChartObj = {};
    this.areaChartID = 1;
    // this.makeChartID = 0;
    this.clearCharts();
  };
  //////////////////////////////////////////////////////////////////////////
  // Add chart layer object
  this.addLayer = function (eeLayer, params = {}, name, shouldChart = true) {
    if (
      params !== null &&
      params !== undefined &&
      params.serialized !== null &&
      params.serialized !== undefined &&
      params.serialized === true
    ) {
      eeLayer = ee.Deserializer.decode(eeLayer);

      if (params.reducer !== undefined && params.reducer !== null) {
        params.reducer = ee.Deserializer.fromJSON(params.reducer);
      }
      params.serialized = false;
    }

    $("#map-defined-area-chart-label").show();

    $("#area-collection-dropdown-container").hide();
    let obj = {};
    obj.name = name || `Area-Layer-${this.areaChartID}`;
    obj.id =
      params.id ||
      obj.name.replaceAll(" ", "-") + "-" + this.areaChartID.toString();
    obj.id = obj.id.replace(/[^A-Za-z0-9-]/g, "-");
    params.layerType =
      params.layerType ||
      getImagesLib.getObjType(eeLayer, "area chart add layer");
    params.eeObjInfo =
      params.eeObjInfo || getImagesLib.eeObjInfo(eeLayer, params.layerType);

    obj.dictServerSide = eeObjServerSide(params.eeObjInfo);

    if (params.layerType === undefined || params.layerType === null) {
      if (obj.dictServerSide === true) {
        console.log("start");
        params.eeObjInfo = params.eeObjInfo.getInfo();
        obj.dictServerSide = false;
        console.log(params.eeObjInfo);
      }
      obj.layerType = params.eeObjInfo.layerType;
    } else {
      obj.layerType = params.layerType;
    }

    eeLayer =
      obj.layerType === "ImageCollection"
        ? ee.ImageCollection(eeLayer)
        : ee.Image(eeLayer);

    if (obj.layerType !== "ImageCollection" && obj.layerType !== "Image") {
      setTimeout(
        () =>
          showMessage(
            "Area Chart addLayer Error",
            `Cannot add ee object type ${obj.layerType} as an area chart layer.<br>Accepted types are ee.ImageCollection and ee.Image`
          ),
        500
      );
    } else if (obj.layerType === "Image" && params.sankey === true) {
      setTimeout(
        () =>
          showMessage(
            "Area Chart addLayer Error",
            `Cannot add ee object type "${obj.layerType}" as an area chart layer sankey : true.<br>Accepted sankey GEE object types are "ImageCollection"`
          ),
        500
      );
    } else {
      if (params.bandNames === undefined || params.bandNames === null) {
        if (obj.dictServerSide) {
          console.log("start");
          params.eeObjInfo = params.eeObjInfo.getInfo();
          obj.dictServerSide = false;
          console.log(params);
        }
        obj.bandNames = params.eeObjInfo.bandNames;
      } else {
        obj.bandNames = params.bandNames;
      }

      obj.bandNames =
        typeof obj.bandNames === "string"
          ? obj.bandNames.split(",")
          : obj.bandNames;

      if (
        (params.class_names === undefined || params.class_names === null) &&
        params.class_dicts_added !== true
      ) {
        if (obj.dictServerSide) {
          console.log("start");
          params.eeObjInfo = params.eeObjInfo.getInfo();
          obj.dictServerSide = false;
          console.log(params);
        }
        params = addClassVizDicts(params);
      }
      obj.rangeSlider = params.rangeSlider === true ? {} : null;

      obj.item = eeLayer.select(obj.bandNames);
      obj.class_names = params.class_names || null;
      obj.class_values = params.class_values || null;
      obj.class_palette = params.class_palette || null;
      obj.class_visibility = params.class_visibility || null;
      if (params.showGrid === undefined || params.showGrid === null) {
        params.showGrid = true;
      }
      obj.showGrid = params.showGrid;
      if (obj.class_names !== null) {
        obj.bandNames = Object.keys(obj.class_names);
        obj.item = obj.item.select(obj.bandNames);
      }
      obj.palette = params.palette;
      if (typeof obj.palette === "string") {
        obj.palette = obj.palette.split(",");
      }
      obj.palette_lookup = params.palette_lookup;
      obj.chartType = params.chartType || "line";
      obj.stackedAreaChart = params.stackedAreaChart == true ? 0 : undefined;
      obj.steppedLine = params.steppedLine == true ? true : false;
      obj.label = obj.name;
      obj.shouldUnmask = params.shouldUnmask == true ? true : false;
      obj.unmaskValue = params.unmaskValue || 0;
      obj.xAxisLabel =
        params.xAxisLabel || obj.layerType === "ImageCollection" ? "Year" : "";
      obj.xAxisLabels = params.xAxisLabels;

      obj.xAxisProperty =
        params.xAxisProperty || obj.layerType === "ImageCollection"
          ? "year"
          : "system:index";

      obj.size = 1;
      if (obj.layerType === "ImageCollection") {
        obj.size =
          params.eeObjInfo.size !== undefined
            ? params.eeObjInfo.size
            : obj.item.size().getInfo();
      }

      obj.hovermode = params.hovermode || "closest";
      obj.dateFormat = params.dateFormat || "YYYY";
      obj.chartTitleFontSize = params.chartTitleFontSize || 10;
      obj.chartLabelFontSize = params.chartLabelFontSize || 10;
      obj.chartAxisTitleFontSize = params.chartAxisTitleFontSize || 10;
      obj.chartLabelMaxWidth = params.chartLabelMaxWidth || 40;
      obj.chartLabelMaxLength = params.chartLabelMaxLength || 100;
      obj.chartWidth = params.chartWidth;
      obj.chartHeight = params.chartHeight;
      obj.xTickDateFormat = params.xTickDateFormat || null;
      obj.chartDecimalProportion = params.chartDecimalProportion;
      obj.chartPrecision = params.chartPrecision;
      obj.scale = params.scale !== undefined ? params.scale : scale;
      obj.transform =
        params.transform !== undefined ? params.transform : transform;
      obj.crs = params.crs || crs;
      obj.autoScale = params.autoScale || true; // Whether to set the reducer resolution to a larger number below a specified zoom (next param)
      obj.minZoomSpecifiedScale = params.minZoomSpecifiedScale || 11; // Above this zoom level, it won't change the scale/transform of teh reducer
      obj.maxAutoScale = 2 ** 6; // Max n scale can be multiplied by (ideally 2**n)
      obj.sankeyTransitionPeriods = params.sankeyTransitionPeriods;
      obj.sankeyMinPercentage =
        params.sankeyMinPercentage !== undefined
          ? params.sankeyMinPercentage
          : 0.5;
      obj.barChartMaxClasses = params.barChartMaxClasses || 20;
      obj.plots = {};
      obj.tableExportData = {};
      obj.splitStr = "----";

      // Control for setting only one of scale or transform - defaults to transform (since it snaps)
      if (
        params.scale !== undefined &&
        params.scale !== null &&
        params.transform !== undefined &&
        params.transform !== null
      ) {
        obj.scale = null;
      }
      obj.chartScale = scale;
      obj.shouldChart = shouldChart;
      obj.sankey = params.sankey || false;
      obj.line = params.line || obj.sankey == false;

      if (obj.scale === undefined || obj.scale === null) {
        obj.chartScale = obj.transform[0];
      }
      if (obj.dateFormat.indexOf("HH:mm") > -1) {
        obj.xTickDateFormat = "%Y-%m-%d\n%H:%M";
      }

      // Set up class name, value, color pairwise combos for each band if sankey
      if (obj.sankey) {
        obj.sankey_class_names = {};
        obj.sankey_class_values = {};
        obj.sankey_class_palette = {};

        if (
          obj.sankeyTransitionPeriods === undefined ||
          obj.sankeyTransitionPeriods === null
        ) {
          let first_last_years = obj.item.reduceColumns(ee.Reducer.minMax(), [
            "system:time_start",
          ]);
          first_last_years = ee
            .Dictionary(first_last_years)
            .values()
            .map((n) => ee.Date(n).format(obj.dateFormat))
            .sort();

          obj.sankey_years = params.sankey_years || first_last_years.getInfo();
        }

        obj.bandNames.map((bn) => {
          let bn_sankey_class_names = [];
          let bn_sankey_class_values = [];
          let bn_sankey_class_palette = [];
          range(0, obj.class_names[bn].length).map((i1) => {
            range(0, obj.class_names[bn].length).map((i2) => {
              bn_sankey_class_names.push([
                obj.class_names[bn][i1],
                obj.class_names[bn][i2],
              ]);
              bn_sankey_class_values.push([
                obj.class_values[bn][i1],
                obj.class_values[bn][i2],
              ]);
              bn_sankey_class_palette.push([
                obj.class_palette[bn][i1],
                obj.class_palette[bn][i2],
              ]);
            });
          });
          obj.sankey_class_names[bn] = bn_sankey_class_names;
          obj.sankey_class_values[bn] = bn_sankey_class_values;
          obj.sankey_class_palette[bn] = bn_sankey_class_palette;
        });
      } else {
        if (obj.xAxisLabels === undefined || obj.xAxisLabels === null) {
          if (obj.dictServerSide) {
            console.log("start");
            params.eeObjInfo = params.eeObjInfo.getInfo();
            obj.dictServerSide = false;
            console.log(params.eeObjInfo);
          }
          if (
            obj.layerType === "ImageCollection" &&
            Object.keys(params.eeObjInfo).indexOf(obj.xAxisProperty) === -1
          ) {
            console.log("need to add x axis property value");

            obj.item = obj.item.map(function (img) {
              return img.set("year", img.date().format(obj.dateFormat));
            });
          }

          if (obj.layerType === "ImageCollection") {
            obj.xAxisLabels = obj.item
              .aggregate_histogram(obj.xAxisProperty)
              .keys()
              .getInfo();
          } else {
            obj.xAxisLabels = [""];
          }
        }
        obj.xAxisLabels = obj.xAxisLabels.map((l) =>
          isNaN(parseInt(l)) || (typeof l === "string" && l.indexOf("-") > -1)
            ? l
            : parseInt(l)
        );

        if (obj.layerType === "ImageCollection") {
          obj.stackBandNames = [];
          obj.xAxisLabels.map((xLabel) => {
            obj.bandNames.map((bn) => {
              obj.stackBandNames.push(`${xLabel}${obj.splitStr}${bn}`);
            });
          });
          // Mosaic if many :1 image to xAxisLabel exists
          if (obj.size > obj.xAxisLabels.length) {
            console.log("Mosaicking for single image per x label");

            let temp = [];

            obj.xAxisLabels.map((l) => {
              let t = obj.item.filter(ee.Filter.eq(obj.xAxisProperty, l));
              let f = t.first();
              t = t.mosaic().copyProperties(f).set(obj.xAxisProperty, l);
              temp.push(t);
            });
            obj.size = temp.length;
            obj.item = ee.ImageCollection(temp);
          }
        } else {
          obj.stackBandNames = obj.bandNames;
        }
      }

      if (obj.class_names !== null && Object.keys(obj.class_names).length > 0) {
        obj.isThematic = true;
        if (params.reducer !== undefined && params.reducer !== null) {
          obj.reducer = params.reducer;
          obj.reducerString =
            params.reducerString ||
            obj.reducer.getInfo().type.split("Reducer.")[1];
        } else {
          obj.reducer = ee.Reducer.frequencyHistogram();
          obj.reducerString = "frequencyHistogram";
        }
      } else {
        obj.isThematic = false;
        if (params.reducer !== undefined && params.reducer !== null) {
          obj.reducer = params.reducer;
          obj.reducerString =
            params.reducerString ||
            obj.reducer.getInfo().type.split("Reducer.")[1];
        } else {
          obj.reducer = ee.Reducer.mean();
          obj.reducerString = "mean";
        }
      }
      obj.visible = params.visible;

      obj.isThematic =
        obj.reducerString === "frequencyHistogram" ? true : obj.isThematic;
      obj.yAxisLabel =
        obj.yAxisLabel || obj.reducerString === "frequencyHistogram"
          ? undefined
          : obj.reducerString.toTitle();

      this.areaChartObj[obj.id] = obj;
      this.areaChartID++;
      this.outstandingAddLayers--;

      this.autoSankeyTransitionPeriods();
    }
  };
  //////////////////////////////////////////////////////////////////////////
  // Function to figure out the best transition periods for the user interface based on the intersection of provided datasets where sankeyTransitionPeriods were not provided
  this.autoSankeyTransitionPeriods = function () {
    let all_sankey_years = Object.values(this.areaChartObj).filter(
      (v) => v.sankey_years !== undefined
    );
    if (all_sankey_years.length > 0) {
      all_sankey_years = Object.values(all_sankey_years).map(
        (v) => v.sankey_years
      );
      activeStartYear = all_sankey_years.map((v) => v[0]).min();
      activeEndYear = all_sankey_years.map((v) => v[1]).max();

      $("#added-transition-rows tr:first > td input:first").val(
        activeStartYear
      );
      $("#added-transition-rows tr:first > td input:last").val(
        activeStartYear + this.sankeyTransitionPeriodYearBuffer
      );
      $("#added-transition-rows tr:last > td input:first").val(
        activeEndYear - this.sankeyTransitionPeriodYearBuffer
      );
      $("#added-transition-rows tr:last > td input:last").val(activeEndYear);
    }
  };
  //////////////////////////////////////////////////////////////////////////
  // Function to figure out an optimal resolution for a given map zoom level
  this.autoSetScale = function (
    scaleT,
    transformT,
    minZoomSpecifiedScale,
    maxAutoScale
  ) {
    scaleT = scaleT || transformT[0];
    let scaleMult = 1 / ((1 << map.getZoom()) / (1 << minZoomSpecifiedScale));
    scaleMult = scaleMult < 1 ? 1 : scaleMult;
    scaleMult = scaleMult > maxAutoScale ? maxAutoScale : scaleMult;
    scaleT = scaleT * scaleMult;

    let nominalScale = scaleT;
    if (transformT !== undefined && transformT !== null) {
      transformT[0] = scaleT;
      transformT[4] = -scaleT;
      scaleT = null;
    }
    // console.log([scaleMult, scaleT, transformT, nominalScale]);
    return [scaleT, transformT, scaleMult, nominalScale];
  };
  //////////////////////////////////////////////////////////////////////////
  // Function to get the current map bounds json string
  this.getMapExtentCoordsStr = function (
    joinStr = ",",
    coordOrder = ["west", "north", "east", "south"]
  ) {
    let coordJSON = map.getBounds().toJSON();

    return coordOrder
      .map((k) => coordJSON[k])
      .map((n) =>
        smartToFixed(n, this.chartDecimalProportion, this.chartPrecision)
      )
      .join(joinStr);
  };
  //////////////////////////////////////////////////////////////////////////
  // Function to start area charting whenever the map moves
  // Introduces a delay so the map is idle for 2 seconds before it starts charting
  this.startAutoCharting = function (idleDelay = 2000) {
    this.setupChartProgress();
    let idleEventID = 0;
    this.mapCoordsStr = this.getMapExtentCoordsStr();

    this.listeners.push(
      google.maps.event.addListener(map, "idle", () => {
        let nowCoords = this.getMapExtentCoordsStr();
        if (nowCoords !== this.mapCoordsStr) {
          this.clearCharts();
          $("#query-spinner-img").addClass("fa-spin");
          updateProgress(".progressbar", 0);
          this.mapCoordsStr = nowCoords;
          idleEventID++;
          let idleEventIDT = idleEventID;
          setTimeout(() => {
            if (idleEventID === idleEventIDT && this.autoChartingOn === true) {
              this.chartMapExtent("", true);
            } else if (this.autoChartingOn === false) {
              console.log("Auto charting turned off - will not chart");
            } else {
              console.log("Not idle long enough");
              console.log(idleEventID, idleEventIDT);
            }
          }, idleDelay);
        } else {
          console.log("Map has not really moved");
        }
      })
    );
    this.autoChartingOn = true;
    this.chartMapExtent("", true);
  };
  //////////////////////////////////////////////////////////////////////////
  // Function to stop auto charting - cleans up outputs, listeners, and ui elements
  this.stopAutoCharting = function () {
    this.clearCharts();
    this.teardownChartProgress();
    this.listeners.map((e) => google.maps.event.removeListener(e));
    this.listeners = [];
    this.autoChartingOn = false;
  };
  //////////////////////////////////////////////////////////////////////////
  // Clears all charts from container div (selected by id)
  this.clearCharts = function () {
    this.currentSankeyLinkColors = [];
    this.sankeyChartIDs = [];
    $(`#${this.chartContainerID}`).empty();
  };
  //////////////////////////////////////////////////////////////////////////
  // Wrapper to chart the current map extent
  this.chartMapExtent = function (name = "", originAuto = false) {
    let mapCoords = Object.values(map.getBounds().toJSON())
      .map((n) =>
        smartToFixed(n, this.chartDecimalProportion, this.chartPrecision)
      )
      .join(",");
    this.clearCharts();
    this.chartArea(eeBoundsPoly, `${name} (${mapCoords})`, originAuto);
  };
  //////////////////////////////////////////////////////////////////////////
  // Returns the ui elements for downloading png and csv outputs
  this.getDownloadButtonGroup = function (id, bn, outFilename) {
    return `<div class="btn-group areaChart-download-btn-group" role="group" >
  <button type="button" class="btn btn-secondary" onclick = "exportToCsv2('${id}','${bn}','${outFilename}.csv')" title = "Click to download ${outFilename}.csv tabular data">CSV</button>
  
  <button type="button" class="btn btn-secondary" onclick = "downloadPlotlyAreaChartWrapper('${id}','${bn}','${outFilename}.png')" title = "Click to download ${outFilename}.png chart">PNG</button>
</div>`;
  };
  //////////////////////////////////////////////////////////////////////////
  // Function to handle creating a sankey chart from given prepared dictionary
  this.makeSankeyChart = function (
    sankey_dict,
    labels,
    colors,
    bn,
    name,
    selectedObj,
    csvData,
    thickness = 35,
    nodePad = 15
  ) {
    sankey_dict.hovertemplate =
      "%{value}" +
      chartFormatDict[areaChartFormat].label +
      "<br>%{source.label}<br>%{target.label}<extra></extra>";
    let yAxisLabel =
      selectedObj.yAxisLabel || chartFormatDict[areaChartFormat].label;

    var data = {
      type: "sankey",
      textfont: { size: selectedObj.chartLabelFontSize },
      orientation: "h",
      node: {
        pad: nodePad,
        thickness: thickness,
        line: {
          color: "black",
          width: 0.5,
        },
        label: labels,
        color: colors,

        opacity: 0.5,
        hovertemplate: "%{value}" + yAxisLabel + "<br>%{label}<extra></extra>",
      },

      link: sankey_dict,
    };
    // console.log(data);
    data = [data];

    const plotLayout = {
      title: name,
      font: {
        size: selectedObj.chartTitleFontSize,
        family: this.plot_font,
      },
      plot_bgcolor: this.plot_bgcolor,
      paper_bgcolor: this.plot_bgcolor,

      autosize: true,
      width: this.chartWidth,
      height: this.chartHeight,
      margin: {
        l: 25,
        r: 25,
        b: 25,
        t: 50,
        pad: 0,
      },
    };
    const config = {
      toImageButtonOptions: {
        format: "png", // one of png, svg, jpeg, webp
        filename: name.replaceAll("<br>", " "),
        width: 1000,
        height: 600,
      },
      scrollZoom: false,
      displayModeBar: false,
    };

    let outFilename = name.replaceAll("<br>", " ");

    let tempGraphDivID = `${this.chartContainerID}-${selectedObj.id}-${bn}`;

    let downloadButtons = this.getDownloadButtonGroup(
      selectedObj.id,
      bn,
      outFilename
    );
    $(`#${this.chartContainerID}`).append(
      `<div id = ${tempGraphDivID}></div>${downloadButtons}<div class = 'hl'></div>`
    );
    this.sankeyChartIDs.push(tempGraphDivID);
    const graphDiv = document.getElementById(tempGraphDivID);
    selectedObj.plots[bn] = {
      containerID: tempGraphDivID,
      plot: Plotly.newPlot(graphDiv, data, plotLayout, config),
    };
  };

  this.makeChart = function (table, name, colors, visible, selectedObj) {
    let outFilename = `${selectedObj.name} ${name}`;
    let chartTitle = `${selectedObj.name}<br>${name}`;
    let yAxisLabel =
      selectedObj.yAxisLabel || chartFormatDict[areaChartFormat].label;
    let csvTable = [table[0].map((s) => s.replace(/[^A-Za-z0-9 -]/g, "-"))];
    if (selectedObj.layerType === "ImageCollection") {
      csvTable = csvTable.concat(
        table
          .slice(1)
          .map((r) =>
            r
              .slice(0, 1)
              .concat(
                r
                  .slice(1)
                  .map((n) =>
                    smartToFixed(
                      n,
                      selectedObj.chartDecimalProportion,
                      selectedObj.chartPrecision
                    )
                  )
              )
          )
      );
    } else {
      csvTable = csvTable.concat(
        table
          .slice(1)
          .map((r) =>
            r.map((n) =>
              smartToFixed(
                n,
                selectedObj.chartDecimalProportion,
                selectedObj.chartPrecision
              )
            )
          )
      );
      csvTable = transpose(csvTable);
      csvTable.unshift(["Class Name", yAxisLabel]);
    }

    selectedObj.tableExportData["line"] = csvTable
      .map((r) => r.join(","))
      .join("\n");
    // Set up table

    let yAxisLabelT, xAxisLabelT, margin;
    if (selectedObj.layerType === "ImageCollection") {
      let xColumn = arrayColumn(table, 0).slice(1);
      let iOffset = selectedObj.layerType === "ImageCollection" ? 1 : 0;
      let header = table[0];
      table = table.slice(1);

      let yColumns = range(1, header.length);

      var data = yColumns.map((i) => {
        let c = colors !== undefined ? colors[i - iOffset] : null;
        const yT = arrayColumn(table, i).map((n) =>
          smartToFixed(
            n,
            selectedObj.chartDecimalProportion,
            selectedObj.chartPrecision
          )
        );
        return {
          x: xColumn,
          y: yT,

          stackgroup: selectedObj.stackedAreaChart,
          mode: "lines+markers",
          visible: visible[i - 1],
          name: header[i]
            .slice(0, selectedObj.chartLabelMaxLength)
            .chunk(selectedObj.chartLabelMaxWidth)
            .join("<br>"),
          line: { color: c, width: 1 },
          marker: { size: 3 },
        };
      });
      xAxisLabelT = selectedObj.xAxisLabel;
      yAxisLabelT = yAxisLabel;
      margin = {
        l: 35,
        r: 25,
        b: 50,
        t: 50,
        pad: 5,
      };
    } else {
      colors = colors || [null];
      colors =
        colors.indexOf(null) > -1 ? table[0].map((c) => randomColor()) : colors;

      table[0] = table[0].map((n) =>
        n
          .slice(0, selectedObj.chartLabelMaxLength)
          .chunk(selectedObj.chartLabelMaxWidth)
          .join("<br>")
      );

      if (selectedObj.shouldUnmask) {
        table[0] = table[0].slice();
      }

      let z = zip(table[0], table[1]);
      z = cbind(z, colors);
      if (table[0].length > selectedObj.barChartMaxClasses) {
        let totalClases = table[0].length;
        let pctlCut = 1 - selectedObj.barChartMaxClasses / totalClases;
        let values = copyArray(table[1]);
        let min = quantile(values, pctlCut);

        z = z.filter((r) => r[1] > min);
      }
      table = [];
      table.push(z.map((r) => r[0]));
      table.push(
        z.map((r) =>
          smartToFixed(
            r[1],
            selectedObj.chartDecimalProportion,
            selectedObj.chartPrecision
          )
        )
      );

      colors = z.map((r) => r[2]);

      let maxLabelLen = table[0].map((n) => n.length).max();
      let totalLabelLen = table[0].length;
      let orientation = "v";
      let yIndex = 1;
      let xIndex = 0;
      if (maxLabelLen > totalLabelLen || maxLabelLen > 6) {
        orientation = "h";
        yIndex = 0;
        xIndex = 1;
      }

      var data = [
        {
          y: table[yIndex],
          x: table[xIndex],
          stackgroup: selectedObj.stackedAreaChart,
          type: "bar",
          orientation: orientation,
          name: selectedObj.name,
          marker: {
            color: colors,
          },
        },
      ];
      if (orientation === "h") {
        yAxisLabelT = selectedObj.xAxisLabel;
        xAxisLabelT = yAxisLabel;
        margin = {
          // l: 150,
          r: 15,
          // b: 40,
          t: 50,
          pad: 5,
        };
      } else {
        xAxisLabelT = selectedObj.xAxisLabel;
        yAxisLabelT = yAxisLabel;
        margin = {
          l: 35,
          r: 25,
          b: 50,
          t: 50,
          pad: 5,
        };
      }
    }

    const plotLayout = {
      hovermode: selectedObj.hovermode,
      plot_bgcolor: this.plot_bgcolor,
      paper_bgcolor: this.plot_bgcolor,
      font: {
        family: this.plot_font,
        size: selectedObj.chartTitleFontSize,
      },

      legend: {
        font: { size: selectedObj.chartLabelFontSize },
      },

      margin: margin,
      width: this.chartWidth,
      height: this.chartHeight,
      title: {
        text: chartTitle,
      },
      xaxis: {
        tickangle: 45,
        // automargin: false,
        showgrid: selectedObj.showGrid,
        rangeslider: selectedObj.rangeSlider,
        tickformat: selectedObj.xTickDateFormat,
        tickfont: { size: selectedObj.chartLabelFontSize },
        title: {
          text: xAxisLabelT,
          font: {
            size: selectedObj.chartAxisTitleFontSize,
          },
        },
      },
      yaxis: {
        // automargin: false,
        automargin: "left+bottom",
        tickfont: { size: selectedObj.chartLabelFontSize },
        title: {
          text: yAxisLabelT,
          font: {
            size: selectedObj.chartAxisTitleFontSize,
          },
        },
      },
    };
    const buttonOptions = {
      toImageButtonOptions: {
        filename: outFilename,
        width: 900,
        height: 600,
        format: "png",
      },
      scrollZoom: false,
      displayModeBar: false,
    };

    let tempGraphDivID = `${this.chartContainerID}-${selectedObj.id}`;

    let downloadButtons = this.getDownloadButtonGroup(
      selectedObj.id,
      "line",
      outFilename
    );
    $(`#${this.chartContainerID}`).append(`<div id = ${tempGraphDivID}></div>
    ${downloadButtons}<div class = 'hl'></div>`);
    const graphDiv = document.getElementById(tempGraphDivID);
    selectedObj.plots["line"] = {
      containerID: tempGraphDivID,
      plot: Plotly.newPlot(graphDiv, data, plotLayout, buttonOptions),
    };
  };
  this.setupChartProgress = function () {
    if (Object.keys(this.areaChartObj).length > 0) {
      $("#chart-collapse-label-chart-collapse-div").show();
      $("#legendDiv").css("max-width", "575px");
      $("#legendDiv").css(
        "max-height",
        window.innerHeight - convertRemToPixels(1) + 1
      );
      if (this.firstRun) {
        $("#area-collection-dropdown-container").hide();

        $("#query-spinner").append(`
        <div id="areaChart-progress-container" >
        <span style="display: flex;">
        <img id="query-spinner-img" class="progress-spinner"  src="./src/assets/images/gee-logo-light.png" height="${convertRemToPixels(
          0.8
        )}" alt="GEE logo image">
        
        <div class="progressbar progress-pulse" id="query-progressbar" title="'Percent of layers that have finished downloading chart summary data">
            <span style="width: 100%;">100%</span>
        </div>
        
        
        </span>
        
        
        
        </div>`);
        $("#areaChart-progress-container").width(
          $("#chart-collapse-label-label").width() -
            $("#areaChart-progress-container").width()
        );
        this.firstRun = false;
        this.areaChartingOn = true;
      }
    }
  };
  this.teardownChartProgress = function () {
    $("#areaChart-progress-container").remove();

    $("#legendDiv").css("max-width", "");
    $("#legendDiv").css("max-height", "60%");
    $("#chart-collapse-div").empty();
    $("#chart-collapse-label-chart-collapse-div").hide();
    this.firstRun = true;
    this.areaChartingOn = false;
  };
  this.autoHideAreaTools = function () {
    if (Object.keys(this.areaChartObj).length === 0) {
      this.hideAreaTools();
    }
  };
  this.hideAreaTools = function () {
    $("#area-tools-title").hide();
    $("#area-chart-params-label").hide();
    $("#user-defined-area-chart-label").hide();
    $("#upload-area-chart-label").hide();
    $("#select-area-interactive-chart-label").hide();
  };
  //////////////////////////////////////////////////////////////////////////
  // Primary function to handle charting a given area
  // Handles preparing ee image and collection objects for both line and sankey charts, gets the zonal
  // summaries, and manipulates the numbers for charting
  this.chartArea = function (area, name = "", originAuto = false) {
    // Get selected objects either from visible map layers or checkboxes
    let selectedChartLayers;
    if (this.chartLayerSelectFromMapLayers) {
      selectedChartLayers = [];

      Object.values(layerObj)
        .concat(Object.values(timeLapseObj))
        .filter((e) => e.viz.canAreaChart)
        .map((o) => {
          let objT = o.viz.areaChartParams;

          if (objT.line && objT.sankey) {
            selectedChartLayers.push([`${o.legendDivID}-----line`, o.visible]);
            selectedChartLayers.push([
              `${o.legendDivID}-----sankey`,
              o.visible,
            ]);
          } else {
            selectedChartLayers.push([o.legendDivID, o.visible]);
          }
        });

      selectedChartLayers = Object.fromEntries(
        selectedChartLayers.filter(([k, v]) => v)
      );
    } else {
      selectedChartLayers = Object.fromEntries(
        Object.entries(checkboxSelectedChartLayers).filter(([k, v]) => v)
      );
    }
    selectedChartLayers = Object.keys(selectedChartLayers);
    let selectedChartObjs = Object.values(this.areaChartObj).filter(
      (v) => selectedChartLayers.indexOf(v.id) > -1
    );

    this.makeChartID++;

    this.outstandingChartRequests[this.makeChartID] = 0;
    this.maxOutStandingChartRequests[this.makeChartID] = 0;
    if (selectedChartObjs.length === 0) {
      this.maxOutStandingChartRequests[this.makeChartID] = 1;
    }
    this.updateProgress();

    selectedChartObjs.map((selectedObj) => {
      let scaleT = structuredClone(selectedObj.scale);
      let transformT = structuredClone(selectedObj.transform);
      let scaleMult = 1;
      let nominalScale = scaleT || transformT[0];
      let divWidth =
        $("#" + getWalkThroughCollapseContainerID()).width() -
        convertRemToPixels(2);
      this.chartWidth = selectedObj.chartWidth || divWidth;
      this.chartHeight =
        selectedObj.chartHeight || parseInt(divWidth * this.chartHWRatio);
      if (selectedObj.autoScale) {
        let scaleTransform = this.autoSetScale(
          scaleT,
          transformT,
          selectedObj.minZoomSpecifiedScale,
          selectedObj.maxAutoScale
        );
        scaleT = scaleTransform[0];
        transformT = scaleTransform[1];
        scaleMult = scaleTransform[2];
        nominalScale = scaleTransform[3];
      }

      let makeChartID = this.makeChartID;

      if (selectedObj.sankey) {
        selectedObj.bandNames.map((bn) => {
          this.outstandingChartRequests[this.makeChartID]++;
          this.maxOutStandingChartRequests[this.makeChartID]++;
          let itemBn = selectedObj.item.select(bn);
          let dummyImage = itemBn.first();
          let sankeyC = [];
          let transitionBns = [];
          let sankeyTransitionPeriods =
            selectedObj.sankeyTransitionPeriods || getTransitionRowData();
          if (
            sankeyTransitionPeriods !== null &&
            sankeyTransitionPeriods !== undefined
          ) {
            range(0, sankeyTransitionPeriods.length - 1).map(
              (transitionPeriodI) => {
                let sankeyTransitionPeriod1 =
                  sankeyTransitionPeriods[transitionPeriodI];
                let sankeyTransitionPeriod2 =
                  sankeyTransitionPeriods[transitionPeriodI + 1];
                let itemBnTransitionPeriod1 = itemBn
                  .filter(
                    ee.Filter.calendarRange(
                      sankeyTransitionPeriod1[0],
                      sankeyTransitionPeriod1[1],
                      "year"
                    )
                  )
                  .mode();
                let itemBnTransitionPeriod2 = itemBn
                  .filter(
                    ee.Filter.calendarRange(
                      sankeyTransitionPeriod2[0],
                      sankeyTransitionPeriod2[1],
                      "year"
                    )
                  )
                  .mode();
                let transitionImg = ee.Image(0);

                selectedObj.sankey_class_values[bn].map(
                  (sankey_class_values_pair) => {
                    outClass = parseInt(
                      `${sankey_class_values_pair[0]}0990${sankey_class_values_pair[1]}`
                    );

                    transitionImg = transitionImg.where(
                      itemBnTransitionPeriod1
                        .eq(sankey_class_values_pair[0])
                        .and(
                          itemBnTransitionPeriod2.eq(
                            sankey_class_values_pair[1]
                          )
                        ),
                      outClass
                    );
                  }
                );
                let transitionBn = `${sankeyTransitionPeriod1.join(
                  "-"
                )}---${sankeyTransitionPeriod2.join("-")}`;
                transitionBns.push(transitionBn);
                transitionImg = transitionImg
                  .set("system:index", transitionBn)
                  .rename(`${bn}`);
                sankeyC.push(transitionImg);
              }
            );
            sankeyC = ee
              .ImageCollection(sankeyC)
              .toBands()
              .rename(transitionBns);

            sankeyC
              .reduceRegion(
                selectedObj.reducer,
                area,
                scaleT,
                selectedObj.crs,
                transformT,
                true,
                1e13,
                4
              )
              .evaluate((counts, failure) => {
                if (failure !== undefined) {
                  showMessage(
                    "Area Charting Error",
                    `Encountered the following error while summarizing ${selectedObj.name}<br>${failure}`
                  );
                } else {
                  if (
                    this.areaChartingOn === true &&
                    makeChartID === this.makeChartID &&
                    originAuto === this.autoChartingOn
                  ) {
                    let transitionPeriodI = 1;

                    let sankey_dict = {
                      source: [],
                      target: [],
                      value: [],
                      // color: [],
                    };
                    let labels = [];
                    let colors = [];

                    let outCSV = [];

                    selectedObj.class_names[bn].map((l) => {
                      let sankeyTransitionPeriod = sankeyTransitionPeriods[0];
                      sankeyTransitionPeriod =
                        sankeyTransitionPeriod[0] === sankeyTransitionPeriod[1]
                          ? sankeyTransitionPeriod[0]
                          : sankeyTransitionPeriod.join("-");
                      labels.push(`${sankeyTransitionPeriod} ${l}`);
                    });
                    selectedObj.class_palette[bn].map((c) => colors.push(c));

                    // selectedObj.class_palette[bn].map((c) => {
                    //   sankey_dict.color.push(c);
                    // });

                    Object.keys(counts).map((transitionPeriod) => {
                      let offset1 =
                        (transitionPeriodI - 1) *
                        selectedObj.class_names[bn].length;
                      let offset2 =
                        transitionPeriodI * selectedObj.class_names[bn].length;
                      //Append labels and colors
                      selectedObj.class_names[bn].map((l) => {
                        let sankeyTransitionPeriod =
                          sankeyTransitionPeriods[transitionPeriodI];
                        sankeyTransitionPeriod =
                          sankeyTransitionPeriod[0] ===
                          sankeyTransitionPeriod[1]
                            ? sankeyTransitionPeriod[0]
                            : sankeyTransitionPeriod.join("-");
                        labels.push(`${sankeyTransitionPeriod} ${l}`);
                      });
                      selectedObj.class_palette[bn].map((c) => colors.push(c));
                      // selectedObj.class_palette[bn].map((c) => {
                      //   sankey_dict.color.push(c);
                      // });

                      let countsTransitionPeriod = counts[transitionPeriod];
                      let rawValues = Object.values(countsTransitionPeriod);
                      let pixelTotal = sum(rawValues);
                      let mult;
                      if (areaChartFormat === "Percentage") {
                        mult = (1 / pixelTotal) * 100;
                      } else {
                        mult =
                          chartFormatDict[areaChartFormat].mult * scaleMult;
                      }
                      let values = rawValues.map((v) =>
                        smartToFixed(
                          v * mult,
                          selectedObj.chartDecimalProportion,
                          selectedObj.chartPrecision
                        )
                      );
                      let classes = Object.keys(countsTransitionPeriod).map(
                        (cls) => cls.split("0990").map((n) => parseInt(n))
                      );

                      let vi = 0;
                      let countLookup = {};
                      classes.map((cls) => {
                        let class_valueI1 = selectedObj.class_values[
                          bn
                        ].indexOf(cls[0]);
                        let color_value1 =
                          selectedObj.class_palette[bn][class_valueI1];
                        let class_valueI2 = selectedObj.class_values[
                          bn
                        ].indexOf(cls[1]);
                        let color_value2 =
                          selectedObj.class_palette[bn][class_valueI2];
                        if (
                          (rawValues[vi] / pixelTotal) * 100 >=
                          selectedObj.sankeyMinPercentage
                        ) {
                          sankey_dict.source.push(class_valueI1 + offset1);
                          sankey_dict.target.push(class_valueI2 + offset2);
                          sankey_dict.value.push(values[vi]);
                          // sankey_dict.color.push(color_value1);
                          this.currentSankeyLinkColors.push([
                            color_value1,
                            color_value2,
                          ]);
                        }

                        countLookup[
                          `${selectedObj.class_names[bn][class_valueI1]}---${selectedObj.class_names[bn][class_valueI2]}`
                        ] = values[vi];
                        vi++;
                      });

                      outCSV.push(
                        [""].concat(
                          selectedObj.class_names[bn].map((nm) => {
                            let tp = transitionPeriod.split("---")[1];
                            let tps = tp.split("-");
                            tp = tps[0] === tps[1] ? tps[0] : tp;
                            return `${nm.replace(
                              /[^A-Za-z0-9 -]/g,
                              "-"
                            )} ${tp} `;
                          })
                        )
                      );
                      selectedObj.class_names[bn].map((nm1) => {
                        let tp = transitionPeriod.split("---")[0];
                        let tps = tp.split("-");
                        tp = tps[0] === tps[1] ? tps[0] : tp;
                        let line = [
                          `${nm1.replace(/[^A-Za-z0-9 -]/g, "-")} ${tp}`,
                        ];
                        selectedObj.class_names[bn].map((nm2) => {
                          let v = countLookup[`${nm1}---${nm2}`];
                          v = v !== undefined ? v : 0;
                          line.push(v);
                        });
                        outCSV.push(line);
                      });
                      outCSV.push([""]);

                      transitionPeriodI++;
                    });

                    outCSV = outCSV.map((r) => r.join(",")).join("\n");
                    selectedObj.tableExportData[bn] = outCSV;
                    labels = labels.map((l) =>
                      l
                        .slice(0, selectedObj.chartLabelMaxLength)
                        .chunk(selectedObj.chartLabelMaxWidth)
                        .join("<br>")
                    );
                    let bnNameTitle = bn.replaceAll("_", " ") + " ";
                    if (
                      selectedObj.bandNames.length === 1 ||
                      selectedObj.name.indexOf(bnNameTitle) > -1
                    ) {
                      bnNameTitle = "";
                    }
                    this.makeSankeyChart(
                      sankey_dict,
                      labels,
                      colors,
                      bn,
                      `${selectedObj.name} ${bnNameTitle}<br>${name} (${nominalScale}m)`,
                      selectedObj,
                      outCSV
                    );

                    this.outstandingChartRequests[this.makeChartID]--;

                    this.updateProgress();
                  } else {
                    console.log(
                      `Chart id moved on: Returned ID = ${makeChartID}, Current ID = ${this.makeChartID}`
                    );
                  }
                }
              });
          } else {
            this.outstandingChartRequests[this.makeChartID]--;

            this.updateProgress();
          }
        });
      } else {
        this.outstandingChartRequests[this.makeChartID]++;
        this.maxOutStandingChartRequests[this.makeChartID]++;
        let areaChartCollectionStack =
          selectedObj.layerType === "ImageCollection"
            ? selectedObj.item.toBands()
            : selectedObj.item;

        areaChartCollectionStack = areaChartCollectionStack.rename(
          selectedObj.stackBandNames
        );

        if (selectedObj.shouldUnmask) {
          areaChartCollectionStack = areaChartCollectionStack.unmask(
            selectedObj.unmaskValue
          );
        }

        areaChartCollectionStack
          .reduceRegion(
            selectedObj.reducer,
            area,
            scaleT,
            selectedObj.crs,
            transformT,
            true,
            1e13,
            4
          )
          .evaluate((counts, failure) => {
            if (
              this.areaChartingOn === true &&
              makeChartID === this.makeChartID &&
              originAuto === this.autoChartingOn
            ) {
              if (failure !== undefined) {
                showMessage(
                  "Area Charting Error",
                  `Encountered the following error while summarizing ${selectedObj.name}<br>${failure}`
                );
              } else {
                let header =
                  selectedObj.layerType === "ImageCollection"
                    ? [selectedObj.xAxisLabel]
                    : [];

                // Pull auto viz attributes if available
                let colors = [];
                let visible = [];
                if (selectedObj.isThematic === true) {
                  selectedObj.class_namesT = {};
                  selectedObj.bandNames.map((bn) => {
                    let bnL = bn.replace(/[^A-Za-z0-9 -]/g, "-");
                    let nameStart = `${bnL}-`;
                    let class_namesT;
                    if (selectedObj.class_names !== null) {
                      class_namesT = selectedObj.class_names[bn];
                    } else if (counts[bn] !== undefined) {
                      class_namesT = Object.keys(counts[bn]);
                    } else {
                      let bnsT = Object.keys(counts).filter(
                        (k) => k.indexOf(bn) > -1
                      );
                      class_namesT = [];
                      bnsT.map(
                        (bnT) =>
                          (class_namesT = class_namesT.concat(
                            Object.keys(counts[bnT])
                          ))
                      );
                      class_namesT = unique(class_namesT);

                      selectedObj.class_namesT[bn] = class_namesT;
                    }
                    let class_paletteT;
                    if (selectedObj.class_palette !== null) {
                      class_paletteT = selectedObj.class_palette[bn];
                    } else if (
                      selectedObj.palette !== undefined &&
                      selectedObj.palette !== null
                    ) {
                      class_paletteT = selectedObj.palette;
                    } else if (
                      selectedObj.palette_lookup !== undefined &&
                      selectedObj.palette_lookup !== null
                    ) {
                      class_paletteT = class_namesT.map(
                        (cn) => selectedObj.palette_lookup[cn]
                      );
                    } else {
                      class_paletteT = class_namesT.map((c) => null);
                    }

                    if (selectedObj.bandNames.length == 1) {
                      nameStart = "";
                    }
                    class_namesT.map((cn) => {
                      // cd = cn.replace(/[^A-Za-z0-9 -]/g, "-");
                      header.push(`${nameStart}${cn}`);
                    });
                    class_paletteT.map((color) => {
                      color =
                        color !== null &&
                        color !== undefined &&
                        color[0] !== "#"
                          ? `#${color}`
                          : color;
                      colors.push(color);
                    });
                    if (
                      selectedObj.class_visibility !== null &&
                      selectedObj.class_visibility[bn] !== undefined
                    ) {
                      selectedObj.class_visibility[bn].map((v) => {
                        visible.push(v == true ? v : "legendonly");
                      });
                    } else if (selectedObj.visible !== undefined) {
                      selectedObj.visible.map((v) => {
                        visible.push(v == true ? v : "legendonly");
                      });
                    } else {
                      class_namesT.map((cn) => {
                        visible.push(true);
                      });
                    }
                  });
                } else {
                  colors = selectedObj.palette;

                  visible =
                    selectedObj.visible === undefined
                      ? selectedObj.bandNames.map((bn) => true)
                      : selectedObj.visible.map((v) =>
                          v === true ? v : "legendonly"
                        );
                  selectedObj.bandNames.map((bn) =>
                    header.push(bn.replace(/[^A-Za-z0-9 -]/g, " "))
                  );
                }
                let outTable = [header];
                if (selectedObj.layerType === "ImageCollection") {
                  selectedObj.xAxisLabels.map((xLabel) => {
                    let row = [xLabel];

                    if (selectedObj.isThematic) {
                      selectedObj.bandNames.map((bn) => {
                        let countsT =
                          counts[`${xLabel}${selectedObj.splitStr}${bn}`];
                        let values =
                          selectedObj.class_values !== null
                            ? selectedObj.class_values[bn]
                            : selectedObj.class_namesT[bn];
                        let names =
                          selectedObj.class_names !== null
                            ? selectedObj.class_names[bn]
                            : selectedObj.class_namesT[bn];
                        let pixelTotal = sum(Object.values(countsT)) || 0;
                        if (areaChartFormat === "Percentage") {
                          mult = (1 / pixelTotal) * 100;
                        } else {
                          mult =
                            chartFormatDict[areaChartFormat].mult * scaleMult;
                        }

                        values.map((v) => {
                          let tv = countsT[v] || 0;
                          row.push(tv * mult);
                        });
                      });
                    } else {
                      selectedObj.bandNames.map((bn) => {
                        let countsT =
                          counts[`${xLabel}${selectedObj.splitStr}${bn}`];
                        row.push(countsT);
                      });
                    }

                    outTable.push(row);
                  });
                } else {
                  let row = [];

                  if (selectedObj.isThematic) {
                    selectedObj.bandNames.map((bn) => {
                      let countsT = counts[bn];
                      let values =
                        selectedObj.class_values !== null
                          ? selectedObj.class_values[bn]
                          : Object.keys(countsT);
                      let names =
                        selectedObj.class_names !== null
                          ? selectedObj.class_names[bn]
                          : Object.keys(countsT);
                      let pixelTotal = sum(Object.values(countsT)) || 0;
                      if (areaChartFormat === "Percentage") {
                        mult = (1 / pixelTotal) * 100;
                      } else {
                        mult =
                          chartFormatDict[areaChartFormat].mult * scaleMult;
                      }

                      values.map((v) => {
                        let tv = countsT[v] || 0;
                        row.push(tv * mult);
                      });
                    });
                  } else {
                    selectedObj.bandNames.map((bn) => {
                      let countsT = counts[bn];
                      row.push(countsT);
                    });
                  }
                  outTable.push(row);
                }

                this.outstandingChartRequests[this.makeChartID]--;
                this.updateProgress();

                this.makeChart(
                  outTable,
                  `${name} (${nominalScale}m)`,
                  colors,
                  visible,
                  selectedObj
                );
              }
            } else {
              console.log(
                `Chart id moved on: Returned ID = ${makeChartID}, Current ID = ${this.makeChartID}`
              );
            }
          });
      }
    });
  };
  //////////////////////////////////////////////////////////////////////////
  this.clearChartLayerSelect = function () {
    $("#" + this.layerSelectID).remove();
  };
  // If checkbox layer selection is used, instantiate it with this function to populate the checkboxes
  this.populateChartLayerSelect = function () {
    this.chartLayerSelectFromMapLayers = false;
    urlParams.areaChartSelectedObj = urlParams.areaChartSelectedObj || {};
    let labels = [];
    Object.keys(this.areaChartObj).map((k) => {
      let obj = this.areaChartObj[k];
      urlParams.areaChartSelectedObj[obj.id] =
        urlParams.areaChartSelectedObj[obj.id] !== undefined
          ? urlParams.areaChartSelectedObj[obj.id]
          : obj.shouldChart;
      labels.push(obj.name);
    });

    addCheckboxes(
      this.layerSelectContainerID,
      this.layerSelectID,
      "Area Chart Layers",
      "checkboxSelectedChartLayers",
      urlParams.areaChartSelectedObj,
      labels,
      "Choose which layers to include in area summary charts",
      "prepend"
    );

    $("#" + this.layerSelectID).change(() => {
      if (this.autoChartingOn) {
        this.chartMapExtent("", true);
      }
    });

    $("#area-summary-format").change(() => {
      console.log("change");
      if (this.autoChartingOn) {
        this.chartMapExtent("", true);
      }
    });
  };
  //////////////////////////////////////////////////////////////////////////
  // Function to manage progress spinner and bar
  this.updateProgress = function () {
    if (this.areaChartingOn) {
      let p = 0;
      if (this.maxOutStandingChartRequests[this.makeChartID] > 0) {
        p = parseInt(
          (1 -
            this.outstandingChartRequests[this.makeChartID] /
              this.maxOutStandingChartRequests[this.makeChartID]) *
            100
        );
      }

      updateProgress(".progressbar", p);

      if (p === 100) {
        $("#query-spinner-img").removeClass("fa-spin");
      } else {
        $("#query-spinner-img").addClass("fa-spin");
      }
    }
  };
}
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
let areaChart = new areaChartCls();
$("#map-defined-area-chart-label").hide();
