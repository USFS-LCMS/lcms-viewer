///////////////////////////////////////////////////////////
// Sequoia run function
// if (mode === "sequoia-view") {
let seq_mon_query_clicked = false;
const site_highlights_dict = {};
// var exports;
// }

function runSequoia() {
  // First get a unique id url with all the parameters used to make the outputs
  // TweetThis(
  //   (preURL = ""),
  //   (postURL = ""),
  //   (openInNewTab = false),
  //   (showMessageBox = false),
  //   (onlyURL = true)
  // );

  // Empty any existing table if it exists and add a spinner to let user know the table is being computed
  $("#table-collapse-div").empty();
  $("#table-collapse-div").append(`<div id="sequoia-mon-loading-div" style="">
    <p>
      <img style="width:2rem;" class="image-icon fa-spin mr-1" alt="Google Earth Engine logo spinner" src="./src/assets/images/GEE_logo_transparent.png">
      Summarizing Giant Sequoia Monitoring Sites
     </p>
    </div>`);

  // Callback function that gets run after getImagesLib js is loaded
  // function runSequoiaLibLoadedCallback(){
  // Make the default GEE Playground scripts exports object name shortened version of getImagesLib - gil
  const gil = getImagesLib;

  // Pull in date params
  const preStartYear = urlParams.preStartYear, preEndYear = urlParams.preEndYear, postYear = urlParams.postYear, startJulian = urlParams.startJulian, endJulian = urlParams.endJulian;

  // Format julian days to MM/dd syntax
  startJulianFormatted = formatDTJulian(Date.fromDayofYear(startJulian)); //ee.Date.parse('YYYY-DDD',`2003-${startJulian}`).format('MM/dd').getInfo()
  endJulianFormatted = formatDTJulian(Date.fromDayofYear(endJulian)); //ee.Date.parse('YYYY-DDD',`2003-${endJulian}`).format('MM/dd').getInfo()

  //Send run event for Google Analytics
  ga(
    "send",
    "event",
    "sequoia-view-run",
    "date_params",
    `${preStartYear}-${preEndYear}__${postYear}__${startJulianFormatted}-${endJulianFormatted}`
  );

  getNAIP(null, true);
  turnOffLayersWhenTimeLapseIsOn = false;

  // Bring in the monitoring sites
  const monitoring_sites = ee.FeatureCollection(
    "projects/gtac-lamda/assets/giant-sequoia-monitoring/Inputs/Trees_of_Special_Interest"
  );
  // var monitoring_sites = ee.FeatureCollection("projects/lcms-292214/assets/Ancillary/filtered_dead_trees");
  // var monitoring_sites = ee.FeatureCollection("projects/lcms-292214/assets/Ancillary/SEKI_LiveTreesSubset");

  // Bring in the TCH NAIP-based change outputs for projection and snap raster
  const tchC = ee
    .ImageCollection(
      "projects/gtac-lamda/assets/giant-sequoia-monitoring/Inputs/TCH"
    )
    .filter(ee.Filter.stringContains("system:index", "v3shadows_extract_gfch"));

  const projection = tchC.first().projection().getInfo();
  crs = projection.crs;
  transform = projection.transform;
  scale = null;
  plotRadius = transform[0] / 2;

  // Make studyArea
  // Hard coded to the bounds of the monitoring sites unless someone defines the urlParam useMapBoundsAsStudyArea
  let studyArea;
  if (
    urlParams.useMapBoundsAsStudyArea === undefined ||
    urlParams.useMapBoundsAsStudyArea !== true
  ) {
    studyArea = monitoring_sites.geometry().bounds(500, crs);
  } else {
    studyArea = eeBoundsPoly;
  }

  // Center on study area if no previous stored map view is found
  if (localStorage.settings === undefined) {
    centerObject(studyArea);
  }

  // if a user clicks on the tutorial link in the splashscreen, set localStorage.isFirstTime = "false" so they aren't prompted with a second pop up
  $("#tutorialLink").on("click", function () {
    localStorage.isFirstTime = "false";
  });

  // if the user didn't open tutorial from splashscreen and it's their first time, trigger showTutorialAgain function
  if (localStorage.isFirstTime == null) {
    showTutorialLinkAgain(
      "First Time Users: ",
      `
                              <div class = 'col-lg-10'>
                              <a class="intro-modal-links" onclick="startTour()" title="Click to launch a tutorial to learn how to use the Giant Sequoia Viewer">Click to launch a brief tutorial that explains how to use the Giant Sequoia Viewer</a>
                              </div>
                              <hr>`
    );
  }

  let tdomBuffer = 1;
  if (urlParams.cloudMaskMethod["CloudScore+"]) {
    tdomBuffer = 0;
  }
  // Get S2 images for union of date periods
  const s2s = getImagesLib.getProcessedSentinel2Scenes({
    studyArea: studyArea,
    startYear: preStartYear - tdomBuffer,
    endYear: postYear + tdomBuffer,
    startJulian: startJulian,
    endJulian: endJulian,
    convertToDailyMosaics: false,
    applyTDOM: urlParams.cloudMaskMethod["S2Cloudless-TDOM"],
    applyCloudScorePlus: urlParams.cloudMaskMethod["CloudScore+"],
    applyCloudProbability: urlParams.cloudMaskMethod["S2Cloudless-TDOM"],
  });

  // Filter out pre and post images
  const preS2s = s2s.filter(
    ee.Filter.calendarRange(preStartYear, preEndYear, "year")
  );
  const postS2s = s2s.filter(ee.Filter.calendarRange(postYear, postYear, "year"));

  // Compute median composites and their difference
  const preComp = preS2s.median();
  const postComp = postS2s.median();
  const compDiff = postComp.subtract(preComp);

  // Pull in the change heuristic params
  const changeBands = Object.keys(urlParams.diffThreshs);
  const changeThresholds = Object.values(urlParams.diffThreshs);

  // Define which monitoring sites table fields to include in output table and which to use as label for mouse hover on a table row
  const monitoringSitesPropertyNames = ["Status", "Grove"];
  const labelProperty = "Tree_Name";

  // Pull in the LCMS land cover classes to be included in the tree mask
  const lcms_land_cover_tree_classes = Object.values(lcmsTreeMaskClasses)
    .insert(1, false)
    .map((e, i) => {
      return [i + 1, e];
    })
    .filter((row) => row[1])
    .map((n) => n[0]);

  // If no LCMS tree classes are selected, don't apply the mask
  let applyLCMSTreeMask = true;
  if (lcms_land_cover_tree_classes.length === 0) {
    applyLCMSTreeMask = false;
  }

  // Get the LCMS tree mask if any LCMS tree classes are selected
  if (applyLCMSTreeMask) {
    var lcmsTreeMask = ee
      .ImageCollection("USFS/GTAC/LCMS/v2022-8")
      .filter(ee.Filter.calendarRange(preStartYear - 1, postYear, "year"))
      .select(["Land_Cover"])
      .map((img) => img.eq(lcms_land_cover_tree_classes))
      .max()
      .reduce(ee.Reducer.max());

    Map.addLayer(
      lcmsTreeMask.selfMask(),
      {
        palette: "0A0",
        classLegendDict: {
          "LCMS Tree Mask": "0A0",
        },
      },
      "LCMS Tree Mask",
      false
    );
  }

  // Make band names so pre, post, and diff can be stacked
  const preBns = preComp
    .select(changeBands)
    .bandNames()
    .map((bn) => ee.String(bn).cat(`_Comp_Pre`));
  const postBns = postComp
    .select(changeBands)
    .bandNames()
    .map((bn) => ee.String(bn).cat(`_Comp_Post`));
  const diffBns = compDiff
    .select(changeBands)
    .bandNames()
    .map((bn) => ee.String(bn).cat(`_Comp_Diff`));

  // Set up download name
  let tableDownloadName = `Giant_Sequoia_Monitoring_Sites_Sentinel2_Change_Table_pre${preStartYear}-${preEndYear}__post${postYear}_dates${startJulianFormatted}-${endJulianFormatted}`;

  // Apply change thresholds by bands specified
  const changeHeuristic = compDiff
    .select(changeBands)
    .lt(changeThresholds)
    .reduce(ee.Reducer.mode())
    .rename(["Potential_Loss"]);

  // Stack all bands to be included in table
  let stack = ee.Image.cat([
    preComp.select(changeBands).rename(preBns),
    postComp.select(changeBands).rename(postBns),
    compDiff.select(changeBands).rename(diffBns),
    changeHeuristic,
  ]);
  if (applyLCMSTreeMask) {
    stack = stack.updateMask(lcmsTreeMask);
  }

  // Compute the mean for the radius of a Giant Sequoia for each site
  let summarizedSites = stack
    .focalMean(urlParams.treeDiameter / 2, "circle", "meters")
    .reduceRegions(
      monitoring_sites,
      ee.Reducer.first(),
      null,
      crs,
      transform,
      4
    );

  // create FC of loss sites
  const potentialLossSites = summarizedSites.filter(
    ee.Filter.eq("Potential_Loss", 1)
  );

  // Download the sites table
  summarizedSites.evaluate((t, failure) => {
    console.log(failure);
    console.log("Finished summarizing monitoring sites");

    // showMessage('Finished summarizing monitoring sites',JSON.stringify(t))

    //Set up output table
    $("#table-collapse-div")
      .append(`<div id = "monitoring-sites-table-container">
                                      <table
                                      class="table table-hover report-table"
                                      id="monitoring-sites-table"
                                      role="tabpanel"
                                      tablename="Giant Sequoia Monitoring Sites"
                    title="Double click on any row to zoom to location on map"
                                      ></table>
                                  </div>`);

    // Find the property names of only the spectral bands
    const spectralProps = Object.keys(t.features[0].properties).filter(
      (p) => changeBands.indexOf(p.split("_")[0]) > -1
    );

    // The location properties
    const locProps = ["Longitude", "Latitude"];

    // Concat all column names for the header
    let allProps = [labelProperty, "Potential_Loss"];
    allProps = allProps
      .concat(monitoringSitesPropertyNames)
      .concat(spectralProps)
      .concat(locProps);

    // Add in the table header
    $(`#monitoring-sites-table`).append(
      `<thead><tr class = ' highlights-table-section-title' id='mon-sites-table-header'></tr></thead>`
    );

    // Add columns within the header for each of the props concatenated above
    allProps.map((prop) => {
      $("#mon-sites-table-header").append(
        `<td class = 'highlights-entry '>${prop.replaceAll("_", " ")}</td>`
      );
    });

    // Set up hover icon
    const svgMarker = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: "#FF834C",
      fillOpacity: 0.2,
      strokeWeight: 1,
      strokeColor: "#FF834C",
      scale: 10,
    };
    const potLossDict = {
      null: "No data available",
      0: "No",
      1: "Yes",
    };
    const monSiteMarker = new google.maps.Marker({
      icon: svgMarker,
    });

    let siteID = 1;
    // make list of features that are yes for highlighting those another color:

    // Iterate across each feature and set up the table row
    t.features.map((f) => {
      const rowID = `seq-mon-site-${siteID}`;
      $(`#monitoring-sites-table`).append(
        `<tr class = 'highlights-row' id='${rowID}'></tr>`
      );
      // Add in the label prop value
      const l = f.properties[labelProperty];
      // if(potLossV===null){potLossV=''}
      $(`#${rowID}`).append(`<td class = 'highlights-entry '>${l}</td>`);
      // Add in the potential loss column value
      const potLossV = f.properties["Potential_Loss"];
      // if(potLossV===null){potLossV=''}
      $(`#${rowID}`).append(
        `<td class = 'highlights-entry '>${potLossDict[potLossV]}</td>`
      );
      // Add the props of the site itself
      monitoringSitesPropertyNames.map((prop) => {
        $(`#${rowID}`).append(
          `<td class = 'highlights-entry '>${f.properties[prop]}</td>`
        );
      });

      // Add any spectral properties
      spectralProps.map((prop) => {
        let v = f.properties[prop];
        if (v === null) {
          v = "";
        } else {
          v = parseFloat(v.toFixed(4));
        }
        $(`#${rowID}`).append(`<td class = 'highlights-entry '>${v}</td>`);
      });

      // Add the location properties
      locProps.map((prop) => {
        const v = f.properties[prop];
        $(`#${rowID}`).append(`<td class = 'highlights-entry '>${v}</td>`);
      });

      // Set up the location and label for hover and double click events on the table
      site_highlights_dict[rowID] = [
        f.properties.Longitude,
        f.properties.Latitude,
        `${f.properties[labelProperty]} | Potential Loss: ${
          potLossDict[f.properties["Potential_Loss"]]
        }`,
      ];

      siteID++;
    });

    // Once the table is loaded, set up listeners for table to map behaviors
    $(document).ready(() => {
      // As the mouse moves over the table, set a marker and label at that location on the map
      $("#monitoring-sites-table").on("mousemove", "tr", function (e) {
        try {
          const loc = site_highlights_dict[e.currentTarget.id];
          monSiteMarker.setPosition({
            lat: loc[1],
            lng: loc[0],
          });
          monSiteMarker.setLabel({
            text: loc[2],
            color: "#FFF",
            fontSize: "0.9rem",
            className: "gm-marker-label",
          });
          monSiteMarker.setMap(map);
        } catch (err) {
          monSiteMarker.setMap(null);
        }
      });
      // Any time the mouse leaves the table, get rid of any marker
      $("#monitoring-sites-table").on("mouseleave", "tr", function (e) {
        monSiteMarker.setMap(null);
      });

      // When the table row is double clicked, zoom there on the map
      $("#monitoring-sites-table").on("dblclick", "tr", function (e) {
        const loc = site_highlights_dict[e.currentTarget.id];
        map.setCenter({
          lat: loc[1],
          lng: loc[0],
        });
        map.setZoom(18);
      });

      // Cast the datatable as a DataTable object
      $(`#monitoring-sites-table`).DataTable({
        // fixedHeader: true,
        paging: false,
        searching: true,
        order: [1],
        responsive: true,
        dom: "Bfrtip",
        buttons: [
          // {
          // 	extend: 'colvis',
          // 	title: 'Data export'
          // },
          {
            extend: "copyHtml5",
            title: tableDownloadName,
            messageBottom: `Source: ${fullShareURL}`,
          },
          {
            extend: "csvHtml5",
            title: tableDownloadName,
            messageBottom: `Source: ${fullShareURL}`,
          },
          {
            extend: "excelHtml5",
            title: tableDownloadName,
            messageBottom: `Source: ${fullShareURL}`,
          },
          {
            extend: "pdfHtml5",
            title: tableDownloadName,
            messageBottom: `Source: ${fullShareURL}`,
          },
          {
            extend: "print",
            title: tableDownloadName,
            messageBottom: `Source: ${fullShareURL}`,
          },
        ],
      });
      // Change appearance of table container
      $(`#monitoring-sites-table-container`).addClass(
        `bg-white highlights-table`
      );

      // Set hover text
      $(".dt-buttons.btn-group.flex-wrap").prop(
        "title",
        "Download this table to any of these formats for local/offline use"
      );
      $("#monitoring-sites-table_filter").prop(
        "title",
        "Filter named Giant Sequoias here"
      );
      // Hide the table loading spinner
      $("#sequoia-mon-loading-div").hide();

      // Listen for downloading of table and log event
      $(
        "#monitoring-sites-table_wrapper>div.dt-buttons>button.buttons-html5 "
      ).on("click", (e) => {
        ga(
          "send",
          "event",
          "sequoia-monarch-table-download",
          e.target.innerText,
          tableDownloadName
        );
      });
    });
  });

  // create heatmap layer
  kernelRadius = 30; // pixels
  const densityPoints = potentialLossSites.map(function (yesTrees) {
    return yesTrees.set("dummy", 1);
  });

  function heatmap(fc, radius) {
    const pointImg = fc.reduceToImage(["dummy"], ee.Reducer.first()).unmask(0);
    const kernel = ee.Kernel.gaussian(radius, radius / 2).add(
      ee.Kernel.circle(radius * 2)
    );
    const result = pointImg.convolve(kernel);
    return result.updateMask(result.neq(0));
  }
  const heatmapImg = heatmap(densityPoints, kernelRadius);
  const heatmapGradient = ["lightgray", "yellow", "red"];

  // Bring in MTBS data : start MTBS data in 2012 at onset of 2012-2016 drought period
  const mtbs = ee
    .ImageCollection("USFS/GTAC/MTBS/annual_burn_severity_mosaics/v1")
    .filter(ee.Filter.calendarRange(preStartYear - 5, postYear, "year"))
    .map((img) => {
      return img.updateMask(img.gte(2).and(img.lte(4)));
    });
  const mtbsYr = mtbs
    .map((img) => {
      return ee.Image(img.date().get("year")).updateMask(img).int16();
    })
    .max();

  // Bring in SEKI assets as FeatureCollections
  const sekiNorthTAO = ee.FeatureCollection(
    "projects/gtac-lamda/assets/giant-sequoia-monitoring/Ancillary/SEKI_NORTH_2016_SPECIES_AND_MORTALITY_V7_TAO_SEGI"
  );
  const sekiLiveTrees = ee.FeatureCollection(
    "projects/gtac-lamda/assets/giant-sequoia-monitoring/Ancillary/SEKI_VEG_SequoiaTrees_pt_Alive"
  );
  const tharpsSequoias = ee.FeatureCollection(
    "projects/gtac-lamda/assets/giant-sequoia-monitoring/Ancillary/Tharps_Burn_Project_Sequoias"
  );
  const sierraGroves = ee.FeatureCollection(
    "projects/gtac-lamda/assets/giant-sequoia-monitoring/Ancillary/VEG_SequoiaGroves_Public_py"
  );
  // var deadTrees = ee.FeatureCollection("projects/gtac-lamda/assets/giant-sequoia-monitoring/Inputs/filtered_dead_trees");

  // Add Canopy Height Layer to reference layers
  const canopyHeight = ee
    .ImageCollection(
      "projects/meta-forest-monitoring-okw37/assets/CanopyHeight"
    )
    .mosaic();
  Map.addLayer(
    canopyHeight,
    {
      min: 0,
      max: 25,

      palette: ["440154", "414487", "2A788E", "22A884", "7AD151", "FDE725"],
    },
    `Tree Canopy Height (m)`,
    false,
    null,
    null,
    `Tolan et al. (2023). "Sub-meter resolution canopy height maps using self-supervised learning and a vision transformer trained on Aerial and GEDI Lidar"`,
    "reference-layer-list"
  );

  // Add MTBS layers to Reference data
  Map.addLayer(
    mtbs.count(),
    {
      min: 1,
      max: 4,

      palette: "BD1600,E2F400,0C2780",
    },
    `MTBS Burn Count ${preStartYear - 5}-${postYear}`,
    false,
    null,
    null,
    `Number of mapped MTBS burns from ${
      preStartYear - 5
    } to ${postYear} with low, moderate, or high severity`,
    "reference-layer-list"
  );
  Map.addLayer(
    mtbsYr,
    {
      min: preStartYear - 5,
      max: postYear,

      palette: "ffffe5,fff7bc,fee391,fec44f,fe9929,ec7014,cc4c02",
    },
    `MTBS Most Recent Burn Year ${preStartYear - 5}-${postYear}`,
    false,
    null,
    null,
    `Most recent mapped MTBS burn from ${
      preStartYear - 5
    } to ${postYear} with low, moderate, or high severity`,
    "reference-layer-list"
  );
  Map.addLayer(
    mtbs.max(),
    {
      min: 2,
      max: 4,

      palette: "7fffd4,FF0,F00",
      queryDict: {
        2: "Low",
        3: "Moderate",
        4: "High",
      },
      classLegendDict: {
        Low: "7fffd4",
        Moderate: "FF0",
        High: "F00",
      },
    },
    `MTBS Max Severity ${preStartYear - 5}-${postYear}`,
    false,
    null,
    null,
    `Highest severity mapped MTBS burn from ${
      preStartYear - 5
    } to ${postYear} with low, moderate, or high severity`,
    "reference-layer-list"
  );

  // Add SEKI vector layers to Reference Data
  Map.addLayer(
    sierraGroves,
    {
      strokeColor: "953822",
    },
    `Sequoia Groves of the Sierra Nevada`,
    false,
    null,
    null,
    null,
    "reference-layer-list"
  ); //{'strokeColor':'953822'} =dark reddish brown
  Map.addLayer(
    sekiNorthTAO,
    {
      strokeColor: "10755c",
    },
    `Tree Approximate Objects (TAO)`,
    false,
    null,
    null,
    `LiDAR-derived TAO for SEKI north; SEGI trees only.`,
    "reference-layer-list"
  ); //{'strokeColor':'10755c'} =dark teal
  Map.addLayer(
    sekiLiveTrees.map((f) => {
      return ee.Feature(f).buffer(urlParams.treeDiameter / 2);
    }),
    {
      strokeColor: "85bd04",
    },
    `SEKI Live Sequoia Trees`,
    false,
    null,
    null,
    `Sequoia trees from the Sequoia and Kings Canyon National Parks (SEKI) Sequoia Tree Inventory Project (STI).`,
    "reference-layer-list",
    false
  ); //'strokeColor':'85bd04'=light green
  Map.addLayer(
    tharpsSequoias.map((f) => {
      return ee.Feature(f).buffer(urlParams.treeDiameter / 2);
    }),
    {
      strokeColor: "BF40BF", // purple
    },
    `Tharps Burn Project Sequoias`,
    false,
    null,
    null,
    `SEGI trees of the Tharps Burn Project`,
    "reference-layer-list"
  ); // {'strokeColor':'eb7a38'} =orange

  // // filtered dead trees for commission analysis
  // Map.addLayer(
  //   deadTrees.map((f) => {
  //     return ee.Feature(f).buffer(urlParams.treeDiameter / 2);
  //   }),
  //   {
  //     strokeColor: "BF40BF", // purple
  //
  //   },
  //   `Dead Trees`,
  //   false,
  //   null,
  //   null,
  //   null,
  //   "reference-layer-list"
  // );

  // Add the analysis layers to the map
  Map.addLayer(
    preComp,
    urlParams.compVizParams,
    `Pre Composite ${preStartYear}-${preEndYear} ${startJulianFormatted}-${endJulianFormatted}`,
    false
  );
  Map.addLayer(
    postComp,
    urlParams.compVizParams,
    `Post Composite ${postYear} ${startJulianFormatted}-${endJulianFormatted}`,
    false
  );

  Map.addLayer(compDiff, urlParams.diffVizParams, "Pre-Post Composite", false);

  let changeHeuristicForMap = changeHeuristic.selfMask();
  if (applyLCMSTreeMask) {
    changeHeuristicForMap = changeHeuristicForMap.updateMask(lcmsTreeMask);
  }

  // Density heatmap of 'yes' flagged fields
  Map.addLayer(
    heatmapImg,
    {
      min: 0,
      max: 0.002,
      palette: heatmapGradient,
      opacity: 0.75,

      classLegendDict: {
        "No Flagged Trees": "lightgray",
        "Low Density of Flagged Trees": "Yellow",
        "Medium Density of Flagged Trees": "Orange",
        "High Density of Flagged Trees": "red",
      },
    },
    `Heatmap of Flagged Trees of Special Interest`,
    false,
    null,
    null,
    `A density heatmap of flagged trees of special interest found in proximity to one another`
  );

  Map.addLayer(
    changeHeuristicForMap,
    {
      palette: "E20",

      classLegendDict: {
        Loss: "E20",
      },
      queryDict: {
        1: "Yes",
        null: "No",
      },
    },
    `Potential Loss ${preStartYear}-${preEndYear} to ${postYear}`
  );

  Map.addLayer(
    monitoring_sites.map((f) => {
      return ee.Feature(f).buffer(urlParams.treeDiameter / 2);
    }),
    {
      strokeColor: "eb7a38", //orange
    },
    "Trees of Special Interest", //"Monitoring Sites",
    true,
    null,
    null,
    "Monitoring Sites" //"Trees of special interest"
  );
  Map.addLayer(
    potentialLossSites.map((f) => {
      return ee.Feature(f).buffer(urlParams.treeDiameter / 2);
    }),
    {
      strokeColor: "FF0", // yellow,
    },
    "Trees of Special Interest Flagged for Potential Loss",
    true,
    null,
    null,
    "Monitoring sites that have been flagged for potential decline (None until the user submits an analysis period for which trees become flagged)."
  );
  Map.addLayer(
    studyArea,
    { strokeColor: "0000FF", layerType: "geeVectorImage" },
    "Study Area",
    true
  );

  if (urlParams.canExport) {
    const exportBands = ["blue", "green", "red", "nir", "swir1", "swir2"];
    changeBands.map((bn) => {
      if (exportBands.indexOf(bn) === -1) {
        exportBands.push(bn);
      }
    });
    Map.addExport(
      preComp.select(exportBands).multiply(10000).int16(),
      `S2_Composite_yrs${preStartYear}-${preEndYear}_jds${startJulian}-${endJulian}`,
      10,
      true,
      {}
    );
    Map.addExport(
      postComp.select(exportBands).multiply(10000).int16(),
      `S2_Composite_yr${postYear}_jds${startJulian}-${endJulian}`,
      10,
      true,
      {}
    );
    Map.addExport(
      compDiff.select(exportBands).multiply(10000).int16(),
      `S2_Composite_Diff_preYrs${preStartYear}-${preEndYear}_postYr${postYear}_jds${startJulian}-${endJulian}`,
      10,
      true,
      {}
    );
    Map.addExport(
      changeHeuristicForMap.byte(),
      `S2_Change_preYrs${preStartYear}-${preEndYear}_postYr${postYear}_jds${startJulian}-${endJulian}`,
      10,
      true,
      {},
      255
    );
  }

  if (!seq_mon_query_clicked) {
    localStorage.showToolTipModal = "false";
    $("#query-label").click();
    seq_mon_query_clicked = true;
  }
}

// function runSequoia() {
//   console.log("here");

//   var geometry = ee.Geometry.Polygon([
//     [
//       [-144.3255524330655, 60.61876843815859],
//       [-144.353018253378, 60.68876359853027],
//       [-144.5233063393155, 60.70758247382545],
//       [-144.528799503378, 60.597200855879905],
//     ],
//   ]);

//   let comp = getImagesLib
//     .getProcessedSentinel2Scenes(geometry, 2024, 2024, 160, 190)
//     .median();

//   Map.addLayer(comp, getImagesLib.vizParamsFalse, "Comp");

//   Map.centerObject(geometry);

//   Map.addExport(
//     comp

//       .select(["blue", "green", "red", "nir", "swir1", "swir2"])
//       .multiply(10000)
//       .int16(),
//     "comp_test",
//     30,
//     false,
//     {},
//     -32768
//   );

//   Map.addExport(geometry, "geo_test", null, false);

//   let threshs = [0, 0.2, 0.5, 0.8];
//   let categorires = [];
//   let ti = 1;
//   threshs.map((t) => {
//     categorires.push(
//       ee
//         .Image(0)
//         .where(comp.select(["NDVI"]).gte(t), ti)
//         .byte()
//     );
//     ti++;
//   });
//   categorires = ee.ImageCollection(categorires).max().selfMask();

//   Map.addLayer(
//     categorires,
//     { min: 1, max: 5, palette: "F00,080" },
//     "NDVI Categories"
//   );
//   Map.turnOnInspector();
//   let v = categorires.reduceToVectors({
//     geometry: geometry,
//     scale: 20,
//     crs: "EPSG:32608",
//     bestEffort: true,
//     maxPixels: 1e13,
//     tileScale: 4,
//     geometryInNativeProjection: true,
//   });

//   Map.addExport(v, "ndvi_categories", null, true);
//   Map.addLayer(v, {}, "NDVI Categories Vectors");
//   Map.addLayer(geometry, {}, "Study Area");
// }
