let exportOuputName;
let submitOutputName;
let taskId;
let cancelAllTasks = function () {
  console.log("yay");
};
let downloadMetadata = function () {
  console.log("yay");
};
let downloadTraining = function () {
  console.log("yay");
};
const list = [];
let bucketName; //Will need to set permissions for reading and writing using: gsutil acl ch -u AllUsers:W gs://example-bucket and gsutil acl ch -u AllUsers:R gs://example-bucket
if (urlParams.bucketName === null || urlParams.bucketName === undefined) {
  bucketName = "viewer-exports";
} else {
  bucketName = urlParams.bucketName;
}

const eID = 1;
let exportFC;
///////////////////////////////////////////////////////////////////
function downloadFiles(id) {
  let badShpExtensions = ["cpg", "fix"];
  $.ajax({
    type: "GET",
    url: `https://storage.googleapis.com/storage/v1/b/${bucketName}/o?maxResults=100000`,
  }).done(function (json) {
    json = json.items.filter(
      (i) =>
        badShpExtensions.indexOf(i.name.split(".").pop()) === -1 &&
        i.id.indexOf(id) > -1
    );

    let message = '<ul class = "my-1">';
    let ji = 0;
    json.map(function (item) {
      message += `<li class = "m-0"><a class = 'intro-modal-links' href = "${item.mediaLink}" target = "_blank">${item.name}</a></li>`;
      if (
        mode === "HiForm-BMP" &&
        item.name.indexOf("Forest_NDVI_Change_Values_") > -1
      ) {
        message += `<li title = "Click to download color map for the Forest_NDVI_Change_Values output" class = "m-0"><a class = 'intro-modal-links' href = "./src/assets/palettes/HiForm_ColorMap_v072320.clr" target = "_blank">Color Map for ${item.name} </a></li>`;
        json.splice(ji + 1, 0, {
          mediaLink: "./src/assets/palettes/HiForm_ColorMap_v072320.clr",
          name: "HiForm_ColorMap_v072320.clr",
        });
      }
      ji++;
    });
    message += "</ul>";
    let completeMessage = `${id} has successfully exported!<br>The following files are available to download. If you have a popup blocker, you may need to manually download the files by clicking on the links below:<br>${message}`;
    setTimeout(() => {
      if ($("#export-complete-message").hasClass("show")) {
        appendMessage2("", completeMessage, "export-complete-message");
      } else {
        showMessage(
          "Export Finished",
          completeMessage,
          "export-complete-message"
        );
      }
    }, 100);
    setTimeout(
      () =>
        json.map(function (item) {
          const link = document.createElement("a");
          link.setAttribute("href", item.mediaLink);
          link.setAttribute("download", item.name);
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          sleep(1000);
          document.body.removeChild(link);
          sleep(1000);
        }),
      500
    );
    ga("send", "event", mode + "-download-file", id, json.length);
  });
}

let cachedEEExports = null;
if (
  typeof Storage !== "undefined" &&
  localStorage.cachedEEExports2 !== undefined &&
  localStorage.cachedEEExports2[mode] !== undefined
) {
  cachedEEExports = JSON.parse(localStorage.cachedEEExports2[mode]);
} else if (
  typeof Storage !== "undefined" &&
  localStorage.cachedEEExports2 === undefined
) {
  let t = {};
  t[mode] = {};
  localStorage.cachedEEExports2 = JSON.stringify(t);
} else if (
  typeof Storage !== "undefined" &&
  localStorage.cachedEEExports2 !== undefined
) {
  let currentCache = JSON.parse(localStorage.cachedEEExports2);
  if (currentCache[mode] === undefined) {
    currentCache[mode] = {};
    localStorage.cachedEEExports2 = JSON.stringify(currentCache);
  }

  cachedEEExports = JSON.parse(localStorage.cachedEEExports2)[mode];
}
if (cachedEEExports === null) {
  cachedEEExports = {};
}

const selectedExportDict = {};
function checkFunction(v) {
  console.log(v.checked + " " + v.value);
  eval("addToMap(" + exportImageDict[v.value]["image"] + ")");
  exportImageDict[v.value]["shouldExport"] = v.checked;
  console.log(exportImageDict);
}
function closePopup() {
  document.getElementById("export-list").style.display = "none";
}
function showPopup() {
  document.getElementById("export-list").style.display = "inline-block";
}
function interval2(func, wait, times) {
  const interv = (function (w, t) {
    return function () {
      if (typeof t === "undefined" || t-- > 0) {
        setTimeout(interv, w);
        try {
          func.call(null);
        } catch (e) {
          t = 0;
          throw e.toString();
        }
      }
    };
  })(wait, times);

  setTimeout(interv, wait);
}
////////////////////////////////////////////////
function deleteExportArea() {
  window.removeEventListener("keydown", deleteLastExportVertex);
  window.removeEventListener("keydown", resetExportArea);

  try {
    exportAreaHammer.destroy();
  } catch (err) {
    const x = err;
  }

  exportArea.setMap(null);
  exportArea = new google.maps.Polyline(exportAreaPolylineOptions);
  $("#select-export-area-btn").removeClass("btn-on");
  setMapCursor();
  updateExportAreaArea();
}
function undoExportArea() {
  exportArea.getPath().pop(1);
  updateExportAreaArea();
}
function deleteLastExportVertex(e) {
  if (e.key == "z" && e.ctrlKey) {
    undoExportArea();
  }
}
function resetExportArea(e) {
  if (
    e === undefined ||
    e.key === undefined ||
    e.key == "Delete" ||
    e.key == "d" ||
    e.key == "Backspace"
  ) {
    selectExportArea();
  }
}
let exportActiveTools = [];
let exportAreaHammer;
let exportAreaArea = 0;
let exportAreaTooBigWarningShown = false;
function updateExportAreaArea() {
  exportAreaArea =
    exportArea === undefined
      ? 0
      : google.maps.geometry.spherical.computeArea(exportArea.getPath());

  $("#user-defined-export-feature-area").html(
    (exportAreaArea * 0.0001).formatNumber() +
      " hectares / " +
      (exportAreaArea * 0.000247105).formatNumber() +
      " acres"
  );
  if (
    exportAreaArea * 0.000247105 > 10000000 &&
    exportAreaTooBigWarningShown === false
  ) {
    const m =
      mode === "TreeMap"
        ? `You have selected an area for export greater than 10,000,000 acres. Downloading areas this large will likely result in multiple download tiles you will then need to mosaic.
        <br>
        Please consider the "1) CONUS-wide Download" option.`
        : `You have selected an area for export greater than 10,000,000 acres. Downloading areas this large will likely result in multiple download tiles you will then need to mosaic.`;
    showMessage("Warning!", m);
    exportAreaTooBigWarningShown = true;
  }
}
function selectExportArea() {
  exportAreaTooBigWarningShown = false;
  updateExportAreaArea();
  try {
    deleteExportArea();
  } catch (err) {}
  exportAreaDrawingActive = true;
  window.addEventListener("keydown", deleteLastExportVertex);
  window.addEventListener("keydown", resetExportArea);
  map.setOptions({ draggableCursor: "crosshair" });
  map.setOptions({ disableDoubleClickZoom: true });
  google.maps.event.clearListeners(mapDiv, "dblclick");
  google.maps.event.clearListeners(mapDiv, "click");

  exportArea = new google.maps.Polyline(exportAreaPolylineOptions);

  exportArea.setMap(map);
  exportAreaHammer = new Hammer(document.getElementById("map"));
  exportAreaHammer.on("tap", function (event) {
    const path = exportArea.getPath();
    const x = event.center.x;
    const y = event.center.y;
    clickLngLat = point2LatLng(x, y);
    path.push(clickLngLat);
    updateExportAreaArea();
  });
  $("#select-export-area-btn").addClass("btn-on");

  exportAreaHammer.on("doubletap", function () {
    const path = exportArea.getPath();
    exportArea.setMap(null);
    exportArea = new google.maps.Polygon(exportAreaPolygonOptions);
    exportArea.setPath(path);
    exportArea.setMap(map);
    updateExportAreaArea();
    window.removeEventListener("keydown", deleteLastExportVertex);
    window.removeEventListener("keydown", resetExportArea);
    google.maps.event.clearListeners(mapDiv, "dblclick");
    google.maps.event.clearListeners(mapDiv, "click");
    setMapCursor();
    exportAreaHammer.destroy();
    $("#select-export-area-btn").removeClass("btn-on");
    exportAreaDrawingActive = false;
  });
}
//Function to look for running ee tasks and request cancellation
function cancelSingleTask(task) {
  if (Object.keys(cachedEEExports).indexOf(task.description) > -1) {
    print("Cancelling task: " + task.description);
    ee.data.cancelTask(task.id);
    ga("send", "event", mode + "-cancel-single-task", task.description);
    showMessage("Task Cancel Completed", "Task cancelled: " + task.description);
  }
}
cancelAllTasks = function () {
  $("#summary-spinner").show();
  // $("#export-count-div").empty();
  $("#export-count-div>.tracking-list>.export-tracking-running").remove();
  let tasksCancelled = 0;
  let tasksCancelledList = "\nNames:";
  ee.data.getTaskList((taskList) => {
    taskList = taskList.tasks || [];
    taskList.map(function (task) {
      if (
        (task.state === "RUNNING" || task.state === "READY") &&
        Object.keys(cachedEEExports).indexOf(task.description) > -1
      ) {
        print("Cancelling task: " + task.description);
        ee.data.cancelTask(task.id);
        tasksCancelledList = tasksCancelledList + "<br>" + task.description;
        tasksCancelled++;
      }
    });

    $("#summary-spinner").hide();
    showMessage(
      "Task Cancelling Completed",
      "Tasks cancelled: " +
        tasksCancelled.toString() +
        "<br>" +
        tasksCancelledList
    );
    ga(
      "send",
      "event",
      mode + "-cancel-all-tasks",
      tasksCancelled.length.toString()
    );

    trackExports();
  });
};

function cancelTask(description) {
  $(`#${description}-export-tracking-row`).slideUp();
  ee.data.getTaskList((tasks) => {
    let task = tasks.tasks.filter((t) => t.description === description)[0];

    let exportCount = parseInt($("#export-count").html());
    exportCount--;
    $("#export-count").text(exportCount.toString());
    cancelSingleTask(task);

    if (exportCount === 0) {
      $("#export-spinner").hide();
      $("#export-count-div").html(``);
    }
  });
}
downloadMetadata = function () {
  console.log("downloading metadta");
  const url = "./src/assets/images/lcms_metadata_beta.pdf";
  const link = document.createElement("a");
  link.href = url;
  link.download = url.substr(url.lastIndexOf("/") + 1);
  link.click();
};

function downloadExport(url, output) {
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", output);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  sleep(1000);
  document.body.removeChild(link);
  sleep(1000);
}
downloadTraining = function () {
  console.log("downloading training");
  const url = "./src/assets/images/LCMS_Data_Explorer_exercise1.pdf";
  const link = document.createElement("a");
  link.href = url;
  link.download = url.substr(url.lastIndexOf("/") + 1);
  link.click();
};
////////////////////////////////////////////////
function trackExports() {
  exportList = [];

  const taskIDListTitle = "Exporting: ";
  taskCount = 0;
  ee.data.getTaskList((taskList) => {
    taskList = taskList.tasks.filter(
      (t) => Object.keys(cachedEEExports).indexOf(t.description) > -1
    );

    $("#export-count-div").empty();

    $("#export-count-div").append(`
                      <div  class = 'tracking-list' id="export-tracking-rows">
                      
                      </div>`);
    taskList.map(function (t) {
      const cachedEEExport = cachedEEExports[t.description];

      if (
        t.state === "RUNNING" ||
        t.state === "READY" ||
        t.state === "COMPLETED"
      ) {
        taskCount++;
        let timeDiff;
        if (t.state === "READY") {
          timeDiff = "NA";
        } else {
          const st = t.start_timestamp_ms;
          const now = t.update_timestamp_ms;
          timeDiff = now - st;
          timeDiff = new Date(timeDiff).toISOString().slice(11, 19);
        }
        let icon_color_class = t.state === "COMPLETED" ? "teal" : "db-100";
        let exportRowBtn = `
                            <div title = 'Click to cancel export task "${t.description}"' class="export-tracking-btn " onclick="cancelTask('${t.description}' )" id="${t.description}-cancel-export-button"><i class="fa fa-close ${icon_color_class}"></i></div>
                          `;
        let exportTypeBtn =
          t.task_type === "EXPORT_IMAGE"
            ? `<i title = '${t.description} export type: Image' class="fa fa-image ${icon_color_class}"></i>`
            : `<i title = '${t.description} export type: Vector' class="fa fa-table ${icon_color_class}"></i>`;

        if (t.state === "COMPLETED") {
          exportRowBtn = `<div title = 'Click to download outputs: "${t.description}"' class="export-tracking-btn" onclick="downloadFiles('${t.description}' )" id="${t.description}-download-export-button"><i class="fa fa-cloud-download ${icon_color_class}"></i></div>`;
        }

        let exportRow = `<div class="export-tracking-row" id = "${t.description}-export-tracking-row">
        <div class = 'export-description'>
        ${t.description} 
        </div>
        
        <div class = 'btn-group '>
        <div title = '${t.description} export task run time'>${timeDiff}</div>
        ${exportTypeBtn}
        ${exportRowBtn}
        </div>
      </div>`;
        $(`#export-tracking-rows`).append(exportRow);

        if (t.state === "COMPLETED") {
          $(`#${t.description}-export-tracking-row`).addClass(
            "export-tracking-complete"
          );
        } else {
          $(`#${t.description}-export-tracking-row`).addClass(
            "export-tracking-running"
          );
        }
        $(`#${t.description}-export-tracking-row`).attr(
          "title",
          `Export ${t.description} ${t.state}`
        );
      }
      if (t.state === "COMPLETED" && cachedEEExport.downloaded === false) {
        downloadFiles(cachedEEExports[t.description].outputName);
        cachedEEExports[t.description]["downloaded"] = true;
      }
    });

    document.getElementById("export-spinner").title = taskIDListTitle;

    $("#export-count").text(taskCount.toString());
    let currentCache = JSON.parse(localStorage.cachedEEExports2);
    currentCache[mode] = cachedEEExports;
    localStorage.cachedEEExports2 = JSON.stringify(currentCache);

    if (taskCount === 0) {
      $("#export-spinner").hide();
      $("#export-count-div").html(``);
    }
    let task_width = $("#sidebar-left-header").width() - convertRemToPixels(6);
    let button_width = 85;
    let label_width = task_width - button_width - convertRemToPixels(1);

    $(".export-description").css("max-width", label_width);
  });
}
function cacheExport(id, outputName, metadata) {
  cachedEEExports[id] = {
    status: "submitted",
    downloaded: false,
    "start-time": Date.parse(new Date()),
    outputName: outputName,
    metadata: metadata,
  };

  let currentCache = JSON.parse(localStorage.cachedEEExports2);
  currentCache[mode] = cachedEEExports;
  localStorage.cachedEEExports2 = JSON.stringify(currentCache);
  trackExports();
}
// Set up auto export tracking every 15 seconds
if (canExport) {
  setTimeout(() => trackExports(), 1000);
  interval2(trackExports, 15000, 100000);
}

function updateSpinner() {
  if (taskCount === 0) {
    $("#download-spinner").css({ visibility: "hidden" });
  } else if (taskCount > 0 && taskCount <= 5) {
    $("#download-spinner").css({ visibility: "visible" });
    $("#download-spinner").attr(
      "src",
      "./src/assets/images/spinner" + taskCount.toString() + ".gif"
    );
  } else {
    $("#download-spinner").attr("src", "./src/assets/images/spinnerGT5.gif");
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////
function getIDAndParams(
  eeImage,
  exportOutputName,
  exportCRS,
  exportScale,
  exportTransform,
  fc,
  noDataValue,
  eeType,
  fileFormat
) {
  $("#summary-spinner").show();
  let region;
  if (eeType === "Image") {
    eeImage = ee.Image(eeImage.clip(fc).unmask(noDataValue, false)); //.reproject(exportCRS,null,exportScale);

    try {
      region = JSON.stringify(fc.geometry().bounds().getInfo());
    } catch (error) {
      if (
        error.message.indexOf("LinearRing requires at least 3 points.") > -1
      ) {
        showMessage(
          "Invalid Export Area Polygons",
          'Press "Clear All Shapes" button and redraw export areas<br>ensuring each drawn polygon has at least 3 points'
        );
      } else {
        showMessage("Something Went Wrong", error.message);
      }
    }
  }

  $("#export-message-container").text("Exporting:" + exportOutputName);

  outputURL =
    "https://console.cloud.google.com/m/cloudstorage/b/" +
    bucketName +
    "/o/" +
    exportOutputName +
    ".tif";

  if (eeType === "Geometry") {
    eeImage = ee.Feature(eeImage);
    eeImage = ee.FeatureCollection([eeImage]);
  } else if (eeType === "Feature") {
    eeImage = ee.FeatureCollection([eeImage]);
  }
  if (eeType !== "Image") {
    eeImage = eeImage.map((f) => f.transform(exportCRS, 10));
  }
  let exportTypeDict = {
    Image: { type: "EXPORT_IMAGE", format: "GEO_TIFF" },
    Geometry: { type: "EXPORT_FEATURES", format: "SHP" },
    Feature: { type: "EXPORT_FEATURES", format: "SHP" },
    FeatureCollection: { type: "EXPORT_FEATURES", format: "SHP" },
  };

  if (exportTransform !== undefined) {
    exportScale = null;
  }
  //Set up parameter object
  const params = {
    element: eeImage,
    type: exportTypeDict[eeType].type,
    description: exportOutputName,
    region: region,
    outputBucket: bucketName,
    outputPrefix: exportOutputName,
    crs: exportCRS,
    crsTransform: exportTransform,
    scale: exportScale,
    maxPixels: 1e13,
    shardSize: 256,
    fileDimensions: 256 * 75,
    fileFormat: fileFormat,
    formatOptions: { noData: noDataValue },
  };
  // console.log(params);
  //Set up a task and update the spinner
  taskId = ee.data.newTaskId(1);
  return { taskID: taskId, params: params };
}

function exportImages() {
  let exportCRST = $("#export-crs").val() || exportCRS;
  // console.log(exportCRST);

  let now = new Date().toISOString();
  let date = now.slice(2, 10);
  let time = now.slice(11, 19).replaceAll(":", "-");
  now = `${date}-${time}`;
  let exportsStarted = 0;
  let exportsSubmitted = "";
  let exportAreaProvided = exportArea !== null && exportArea !== undefined;

  let needToDrawPoly = false;
  Object.keys(exportImageDict).map(function (k) {
    const exportObject = exportImageDict[k];
    if (
      exportObject.eeType === "Image" &&
      exportAreaProvided === false &&
      exportObject["shouldExport"] === true
    ) {
      needToDrawPoly = true;
    } else if (exportObject.eeType !== "Image" || exportAreaProvided) {
      let fc;
      if (exportObject.eeType === "Image") {
        try {
          fc = googleMapPolygonToGEEPolygon(exportArea);
        } catch (error) {
          console.log(error);
          fc = exportArea;
        }
      }
      if (exportObject["shouldExport"] === true) {
        exportsStarted++;
        const exportName = exportObject["name"] + "_" + now;
        const noDataValue = exportObject["noDataValue"];
        exportsSubmitted += exportName + "<br>";

        const IDAndParams = getIDAndParams(
          exportObject.eeImage,
          exportName,
          exportCRST,
          exportObject.res,
          exportObject.transform,
          fc,
          noDataValue,
          exportObject.eeType,
          exportObject.fileFormat
        );

        ee.data.startProcessing(
          IDAndParams["taskId"],
          IDAndParams["params"],
          () => {
            meta_template_strT = "{}";
            cacheExport(exportName, exportName, meta_template_strT);
          }
        );
        ga(
          "send",
          "event",
          mode + "-start-export",
          IDAndParams["taskId"],
          exportName
        );
      }
    }
  });
  if (needToDrawPoly) {
    showMessage(
      "Error",
      "No export area selected. Select area by clicking on the <kbd>Draw area to download</kbd> button and then draw a polygon on the map."
    );
  } else if (exportsStarted === 0) {
    showMessage(
      "Nothing to Export!",
      "No layers are selected for exporting. Please select any images you would like to export and then press the <kbd>Export</kbd> button again."
    );
  } else {
    $("#summary-spinner").show();
    showMessage(
      "Exports Started",
      "<hr>The following exports were submitted:<br>" +
        exportsSubmitted +
        "<hr>They will start running shortly. Once finished, they will automatically download. The current status of exports is tracked in the lower portion of the <kbd>DOWNLOAD DATA</kbd> menu"
    );
  }
  $("#summary-spinner").hide();
}
function processFeatures2(fc, shoudExport) {
  exportFC = fc;
}

function displayExports(fc) {
  Object.keys(exportImageDict).map(function (k) {
    const exportObject = exportImageDict[k];
    const now = Date().split(" ");
    const nowSuffix = "_" + now[2] + "_" + now[1] + "_" + now[3] + "_" + now[4];
    addToMap(
      exportObject["eeImage"].clip(fc),
      exportObject["vizParams"],
      exportObject["name"] + nowSuffix,
      false,
      null,
      null,
      null,
      "export-layer-list"
    );
  });
}
