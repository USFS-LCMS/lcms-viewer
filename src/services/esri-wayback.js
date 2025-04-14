// Setup Wayback imagery
// Adapted from: https://livingatlas.arcgis.com/wayback

// Recursively get all wayback services that are part of the Wayback group
// https://www.arcgis.com/home/group.html?id=0f3189e1d1414edfad860b697b7d8311
function esri_wayback() {
  function getServices(start = 1, results = [], callback) {
    let allTemplateQuery = `https://www.arcgis.com/sharing/rest/content/groups/0f3189e1d1414edfad860b697b7d8311/search?q=%20%20-type%3A%22Code%20Attachment%22%20-type%3A%22Featured%20Items%22%20-type%3A%22Symbol%20Set%22%20-type%3A%22Color%20Set%22%20-type%3A%22Windows%20Viewer%20Add%20In%22%20-type%3A%22Windows%20Viewer%20Configuration%22%20-type%3A%22Map%20Area%22%20-typekeywords%3A%22MapAreaPackage%22%20-type%3A%22Indoors%20Map%20Configuration%22%20-typekeywords%3A%22SMX%22&num=100&start=${start}&sortField=&sortOrder=asc&f=json`;
    var out = $.ajax({
      type: "GET",
      url: allTemplateQuery,
      success: function (json) {
        results = results.concat(json.results);
        if (json.nextStart !== -1) {
          getServices(json.nextStart, results, callback);
        } else {
          parseWayback(results);
          if (callback !== undefined && callback !== null) {
            callback();
          }
        }
      },
      error: function (request, status, errorThrown) {
        console.log(status);
        if (callback !== undefined && callback !== null) {
          callback();
        }
      },
    });
  }
  function parseWayback(results) {
    // Find the non metadata tile services
    const nonMetadata = results.filter(
      (obj) =>
        obj.url.indexOf("WMTS/1.0.0/default028mm/MapServer/tile") > -1 &&
        obj.tags.indexOf("metadata") === -1 &&
        obj.title.indexOf("World Imagery (Wayback") > -1 &&
        obj.type == "WMTS"
    );

    // Find the metadata feature services
    const metadata = results.filter((obj) => obj.tags.indexOf("metadata") > -1);

    // Parse the non metadata tile services for Google Maps API format
    const wayBackLayers = {};
    nonMetadata.map((obj) => {
      let d = obj.title.split("World Imagery (Wayback ")[1];
      d = d.slice(2, d.length - 1);
      wayBackLayers[d] = obj.url.split("{level}/{row}/{col}")[0];
    });

    // Sort the services
    let sortedWayBackLayers = {};
    Object.keys(wayBackLayers)
      .sort()
      .map((k) => (sortedWayBackLayers[k] = wayBackLayers[k]));

    // Add the tile serviecs as a time lapse
    Map.addTimeLapse(
      sortedWayBackLayers,
      { layerType: "tileMapService", addToLegend: false, canQuery: false },
      "ESRI WayBack",
      null,
      null,
      null,
      null,
      "wayback-layer-list"
    );
    $("#WayBack-icon-bar>button.cumulativeToggler").hide();
    // Parse the metadata feature services and sort them
    const wayBackMetadataLayers = {};
    metadata.map((obj) => {
      let d = obj.title.split("World Imagery (Wayback ")[1];
      d = d.slice(2, 10);
      wayBackMetadataLayers[d] = obj.url;
    });
    let sortedWayBackMetadataLayers = {};
    Object.keys(wayBackMetadataLayers)
      .sort()
      .map((k) => (sortedWayBackMetadataLayers[k] = wayBackMetadataLayers[k]));

    //////////////////////////////////////////////////////////////////////
    // Setup metadata
    const waybackTimeLapseID = Object.keys(timeLapseObj).filter(
      (f) => f.indexOf("WayBack") > -1
    )[0];
    let metadataRequestID = 0;

    // Function to get Wayback metadata based on current map center
    function getMetadata() {
      $("#wayback-metadata").empty();

      // Populate metadata if the time lapse is on
      if (
        timeLapseID !== undefined &&
        timeLapseID !== null &&
        timeLapseObj[waybackTimeLapseID].visible
      ) {
        // Ensure any outstanding requests get ignored by issuing a new request id
        metadataRequestID++;
        let thisMetadataRequestID = metadataRequestID;

        // Show spinner
        $("#wayback-metadata-loading").show();
        $("#wayback-metadata-loading-spinner").addClass("fa-spin");

        // Find the map center and what date the frame is
        const clickLat = map.center.lat();
        const clickLng = map.center.lng();
        const k = Object.keys(sortedWayBackLayers)[urlParams.timeLapseFrame];

        // Attempt to pseudo replicate the inverse zoom levels - this is a bit off in some places
        const zOffset = 23;
        const metadataMinZoom = 6;
        const metadataMaxZoom = 13;
        let z =
          zOffset - map.zoom >= metadataMinZoom
            ? zOffset - map.zoom
            : metadataMinZoom;
        z = z >= metadataMaxZoom ? metadataMaxZoom : z;
        // Template metadata REST call
        // Currently handles point, but could handle the map bounds with bbox tweak if needed
        const metadataQueryTemplate = `${sortedWayBackMetadataLayers[k]}/${z}/query?f=json&where=1%3D1&outFields=SRC_DATE2%2CNICE_DESC%2CSRC_DESC%2CSAMP_RES%2CSRC_ACC&geometry=%7B%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%2C%22x%22%3A${clickLng}%2C%22y%22%3A${clickLat}%7D&returnGeometry=false&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects`;

        // Make request
        var out = $.ajax({
          type: "GET",
          url: metadataQueryTemplate,
          success: function (json) {
            // Ensure response is populated and still the same request ID
            if (
              metadataRequestID == thisMetadataRequestID &&
              json !== undefined &&
              json.features.length > 0
            ) {
              // Parse the features (usually just one) and populate UI
              json.features.map((f) => {
                f = f.attributes;
                $("#wayback-metadata").empty();
                let d = f.SRC_DATE2;
                d = d === null ? "NA" : new Date(d).toStringFormat();
                $("#wayback-metadata").append(`
              <ul  style = 'margin-bottom: 0px;'>
              <li style='font-weight:bold;'>Acquisition Date: ${d}</li>
              <div class='hl'></div>
              <li>Source: ${f.NICE_DESC} (${f.SRC_DESC})</li>
              <li>World Imagery Version: ${new Date(
                "20" + k
              ).toStringFormat()}</li>
              <li>Resolution: ${f.SAMP_RES.toFixed(2)} (m)</li>
              <li>Accuracy: ${f.SRC_ACC.toFixed(2)} (m)</li>
              
              </ul>`);

                // Hide spinners
                $("#wayback-metadata-loading-spinner").removeClass("fa-spin");
                $("#wayback-metadata-loading").hide();
              });
            } else {
              $("#wayback-metadata").append(`
              <ul  style = 'margin-bottom: 0px;'>
              <li>Metadata empty</li>
              </ul>`);

              // Hide spinners
              $("#wayback-metadata-loading-spinner").removeClass("fa-spin");
              $("#wayback-metadata-loading").hide();
            }
          },
          error: function (request, status, errorThrown) {
            console.log(status);
          },
        });
      }
    }

    // Handle different instances where metadata needs updated

    // Various selectors of time lapse UI
    const checkboxSelector = `#${waybackTimeLapseID}-toggle-checkbox`;
    const nameSpanSelector = `#${waybackTimeLapseID}-name-span`;
    const sliderLabelSelector = `#${waybackTimeLapseID}-year-slider-handle-label`;
    const combinedSelector = `${checkboxSelector},${nameSpanSelector}`;

    // First handle when the time lapse is turned on and off
    $(combinedSelector).on("click", () => {
      setTimeout(() => {
        if (timeLapseObj[waybackTimeLapseID].visible) {
          getMetadata();
        } else {
          $("#wayback-metadata").empty();
        }
      }, 500);
    });

    // Then handle the time lapse slider or button input changes in frames
    let domMetadataRequestID = 0;
    $(sliderLabelSelector).on("DOMSubtreeModified", () => {
      domMetadataRequestID++;
      let thisDomMetadataRequestID = domMetadataRequestID;
      setTimeout(() => {
        if (thisDomMetadataRequestID == domMetadataRequestID) {
          getMetadata();
        }
      }, 500);
    });

    // Then handle when the map pans or zooms and then comes to rest
    google.maps.event.addListener(map, "idle", () => {
      getMetadata();
    });
  }
  // Wrapper for setting up Wayback
  this.initialize = function (callback) {
    // Function to parse the services that are part of the Wayback group

    // Start the whole thing
    getServices(1, [], callback);
  };

  // Function to add UI container for Wayback timelapse and metadata
  this.addWaybackUIContainer = function (
    containerID = "#layer-list-collapse-div"
  ) {
    $(containerID).append(
      `<ul id="wayback-layer-list" class = "layer-list"></ul>`
    );
    $(containerID).append(
      `<div id = 'wayback-metadata-loading' style='display:none;'>
    <img id = 'wayback-metadata-loading-spinner' class = 'progress-spinner' src="./src/assets/images/esri-logo.png" height="${convertRemToPixels(
      1
    )}"  alt="ESRI logo image">Acquiring WayBack Imagery Metadata
      
    </div>
  <div id="wayback-metadata" class = ""></div>
  `
    );
  };
}
