var exportOuputName;
var submitOutputName;
var taskId;
var cancelAllTasks = function () {
  console.log("yay");
};
var downloadMetadata = function () {
  console.log("yay");
};
var downloadTraining = function () {
  console.log("yay");
};
var list = [];
var bucketName; //Will need to set permissions for reading and writing using: gsutil acl ch -u AllUsers:W gs://example-bucket and gsutil acl ch -u AllUsers:R gs://example-bucket
if (urlParams.bucketName === null || urlParams.bucketName === undefined) {
  bucketName = "viewer-exports";
} else {
  bucketName = urlParams.bucketName;
}

var eID = 1;
var exportFC;
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
    json.map(function (item) {
      message += `<li class = "m-0"><a class = 'intro-modal-links' href = "${item.mediaLink}" target = "_blank">${item.name}</a></li>`;
    });
    message += "</ul>";
    setTimeout(() => {
      if ($("#export-complete-message").hasClass("show")) {
        appendMessage2(
          "",
          `${id} has successfully exported!<br>The following files are available to download. If you have a popup blocker, you may need to manually download the files by clicking on the links below:<br>${message}`,
          "export-complete-message"
        );
      } else {
        showMessage(
          "Export Finished",
          `${id} has successfully exported!<br>The following files are available to download. If you have a popup blocker, you may need to manually download the files by clicking on the links below:<br>${message}`,
          "export-complete-message"
        );
      }
    }, 100);
    setTimeout(
      () =>
        json.map(function (item) {
          var link = document.createElement("a");
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

var cachedEEExports = null;
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

var selectedExportDict = {};
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
  var interv = (function (w, t) {
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
  google.maps.event.clearListeners(mapDiv, "dblclick");
  google.maps.event.clearListeners(mapDiv, "click");
  map.setOptions({ draggableCursor: "hand" });
  map.setOptions({ cursor: "hand" });
  try {
    mapHammer.destroy();
  } catch (err) {
    var x = err;
  }

  exportArea.setMap(null);
  exportArea = null;
}
function undoExportArea() {
  exportArea.getPath().pop(1);
}
function deleteLastExportVertex(e) {
  console.log(e);
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
function selectExportArea() {
  try {
    deleteExportArea();
  } catch (err) {}

  window.addEventListener("keydown", deleteLastExportVertex);
  window.addEventListener("keydown", resetExportArea);
  map.setOptions({ draggableCursor: "crosshair" });
  map.setOptions({ disableDoubleClickZoom: true });
  google.maps.event.clearListeners(mapDiv, "dblclick");
  google.maps.event.clearListeners(mapDiv, "click");
  // var exportAreaList = [];
  exportArea = new google.maps.Polyline(exportAreaPolylineOptions);

  exportArea.setMap(map);
  mapHammer = new Hammer(document.getElementById("map"));
  mapHammer.on("tap", function (event) {
    var path = exportArea.getPath();
    var x = event.center.x;
    var y = event.center.y;
    clickLngLat = point2LatLng(x, y);
    path.push(clickLngLat);
  });

  mapHammer.on("doubletap", function () {
    var path = exportArea.getPath();
    exportArea.setMap(null);
    exportArea = new google.maps.Polygon(exportAreaPolygonOptions);
    exportArea.setPath(path);
    exportArea.setMap(map);
    window.removeEventListener("keydown", deleteLastExportVertex);
    window.removeEventListener("keydown", resetExportArea);
    google.maps.event.clearListeners(mapDiv, "dblclick");
    google.maps.event.clearListeners(mapDiv, "click");
    map.setOptions({ draggableCursor: "hand" });
    map.setOptions({ cursor: "hand" });
    mapHammer.destroy();
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
  var tasksCancelled = 0;
  var tasksCancelledList = "\nNames:";
  ee.data.getTaskList((taskList) => {
    taskList = taskList.tasks;
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
  ee.data.getTaskList((tasks) => {
    let task = tasks.tasks.filter((t) => t.description === description)[0];

    cancelSingleTask(task);
    $(`#${description}-export-tracking-row`).slideUp();

    let exportCount = parseInt($("#export-count").html());
    exportCount--;
    $("#export-count").text(exportCount.toString());
    if (exportCount === 0) {
      $("#export-spinner").hide();
      $("#export-count-div").html(``);
    }
  });
}
downloadMetadata = function () {
  console.log("downloading metadta");
  var url = "./src/assets/images/lcms_metadata_beta.pdf";
  var link = document.createElement("a");
  link.href = url;
  link.download = url.substr(url.lastIndexOf("/") + 1);
  link.click();
};

function downloadExport(url, output) {
  var link = document.createElement("a");
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
  var url = "./src/assets/images/LCMS_Data_Explorer_exercise1.pdf";
  var link = document.createElement("a");
  link.href = url;
  link.download = url.substr(url.lastIndexOf("/") + 1);
  link.click();
};
////////////////////////////////////////////////
function trackExports() {
  exportList = [];

  var taskIDListTitle = "Exporting: ";
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
      var cachedEEExport = cachedEEExports[t.description];

      if (
        t.state === "RUNNING" ||
        t.state === "READY" ||
        t.state === "COMPLETED"
      ) {
        taskCount++;

        if (t.state === "READY") {
          timeDiff = "NA";
        } else {
          var st = t.start_timestamp_ms;
          var now = t.update_timestamp_ms;
          var timeDiff = now - st;
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
  fc,
  noDataValue,
  eeType,
  fileFormat
) {
  $("#summary-spinner").show();

  if (eeType === "Image") {
    eeImage = ee.Image(eeImage.clip(fc).unmask(noDataValue, false)); //.reproject(exportCRS,null,exportScale);

    try {
      var region = JSON.stringify(fc.geometry().bounds().getInfo());
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

  console.log(eeType);

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
  //Set up parameter object
  var params = {
    element: eeImage,
    type: exportTypeDict[eeType].type,
    description: exportOutputName,
    region: region,
    outputBucket: bucketName,
    outputPrefix: exportOutputName,
    crs: exportCRS,
    crsTransform: null,
    scale: exportScale,
    maxPixels: 1e13,
    shardSize: 256,
    fileDimensions: 256 * 75,
    fileFormat: fileFormat,
    formatOptions: { noData: noDataValue },
  };
  console.log(params);
  //Set up a task and update the spinner
  taskId = ee.data.newTaskId(1);
  return { taskID: taskId, params: params };
}
function googleMapPolygonToGEEPolygon(googleMapPolygon) {
  var path = googleMapPolygon.getPath().getArray();
  path = path.map(function (p) {
    return [p.lng(), p.lat()];
  });
  var geePolygon = ee.FeatureCollection([
    ee.Feature(ee.Geometry.Polygon(path)),
  ]);

  return geePolygon;
}
function exportImages() {
  let exportCRST = $("#export-crs").val() || exportCRS;
  console.log(exportCRST);

  var now = new Date().toISOString();
  let date = now.slice(2, 10);
  let time = now.slice(11, 19).replaceAll(":", "-");
  now = `${date}-${time}`;
  var exportsStarted = 0;
  var exportsSubmitted = "";
  let exportAreaProvided = exportArea !== null && exportArea !== undefined;
  let needToDrawPoly = false;
  Object.keys(exportImageDict).map(function (k) {
    var exportObject = exportImageDict[k];
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
        var exportName = exportObject["name"] + "_" + now;
        var noDataValue = exportObject["noDataValue"];
        exportsSubmitted += exportName + "<br>";
        var IDAndParams = getIDAndParams(
          exportObject.eeImage,
          exportName,
          exportCRST,
          exportObject.res,
          fc,
          noDataValue,
          exportObject.eeType,
          exportObject.fileFormat
        );

        console.log(IDAndParams);
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
    var exportObject = exportImageDict[k];
    var now = Date().split(" ");
    var nowSuffix = "_" + now[2] + "_" + now[1] + "_" + now[3] + "_" + now[4];
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
