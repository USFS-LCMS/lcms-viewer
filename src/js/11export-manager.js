var exportOuputName;
var submitOutputName;
var taskId;
var cancelAllTasks = function () {
  console.log("yay");
}; //showMessage('Completed','Tasks cancelled: 0');};
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
// exportCapability = true;
///////////////////////////////////////////////////////////////////
function downloadFiles(id) {
  $.ajax({
    type: "GET",
    url: `https://storage.googleapis.com/storage/v1/b/${bucketName}/o`,
  }).done(function (json) {
    json = json.items;

    let message = '<ul class = "my-1">';
    json.map(function (item) {
      if (item.id.indexOf(id) > -1) {
        message += `<li class = "m-0"><a href = "${item.mediaLink}" target = "_blank">${item.name}</a></li>`;
      }
    });
    message += "</ul>";
    setTimeout(() => {
      if ($("#export-complete-message").hasClass("show")) {
        appendMessage2(
          `<hr>${id} has successfully exported! The following downloads are available to download. If you have a popup blocker, you may need to manually download the files by clicking on the links below:<br>${message}`,
          "export-complete-message"
        );
      } else {
        showMessage(
          "Export Finished",
          `${id} has successfully exported! The following downloads are available to download. If you have a popup blocker, you may need to manually download the files by clicking on the links below:<br>${message}`,
          "export-complete-message"
        );
      }
    }, 100);
    setTimeout(
      () =>
        json.map(function (item) {
          if (item.id.indexOf(id) > -1) {
            var link = document.createElement("a");
            link.setAttribute("href", item.mediaLink);
            link.setAttribute("download", item.name);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            sleep(1000);
            document.body.removeChild(link);
            sleep(1000);
          }
        }),
      500
    );
  });
}

var cachedEEExports = null;
if (typeof Storage !== "undefined") {
  cachedEEExports = JSON.parse(localStorage.getItem("cachedEEExports"));
}
if (cachedEEExports === null) {
  cachedEEExports = {};
}

function updatePopup(value) {
  var tempName = "EE_Export_Image_" + exportScale.toString() + "m_" + exportCRS;
  var now = Date().split(" ");
  var nowSuffix = now[2] + "_" + now[1] + "_" + now[3] + "_" + now[4];
  exportOutputName = tempName + "_" + nowSuffix; //Add date

  document.getElementById("popup-text-input").value = exportOutputName;
}

function makePopup() {
  // document.getElementById('popup-text-input').value = 'testName';
  document.getElementById("popup").style.display = "block";
  // var exportNameList = JSON.stringify({'ti':'ee.Image(1)'});

  var exportKeys = Object.keys(exportImageDict);
  exportKeys.map(function (k) {
    var sExport = exportImageDict[k]["shouldExport"];
    if (sExport) {
      var outputList = document.querySelector("popup-output-list");
      outputList.insertBefore(
        "<input type='checkbox' checked = true value = '" +
          k +
          "'onclick='checkFunction(this);'>" +
          exportImageDict[k]["name"] +
          "</label>",
        outputList.firstChild
      );
      // $("#popupList").append("<input type='checkbox' checked = true value = '"+k+"'onclick='checkFunction(this);'>"+exportImageDict[k]["name"]+"</label>")
    } else {
      // $("#popupList").append("<input type='checkbox'  value = '"+k+"'onclick='checkFunction(this);'>"+exportImageDict[k]["name"]+"</label>")
    }
    // $("#popupList").append('<input type="checkbox" name="image" value="'+k+'" onclick="checkFunction(this)" onchange="checkFunction(this)"> '+k+'<br>');
  });
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
  // console.log(e.key);
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
  // google.maps.event.addDomListener(mapDiv, 'click', function(event) {
  mapHammer.on("tap", function (event) {
    var path = exportArea.getPath();
    var x = event.center.x;
    var y = event.center.y;
    clickLngLat = point2LatLng(x, y);
    // exportAreaList.push([clickLngLat.lng(),clickLngLat.lat()])
    path.push(clickLngLat);
  });

  mapHammer.on("doubletap", function () {
    // $('#summary-spinner').slideDown();
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
cancelAllTasks = function () {
  $("#summary-spinner").show();
  var tasksCancelled = 0;
  var tasksCancelledList = "\nIDs:";
  var taskList = ee.data.getTaskList().tasks;
  taskList.map(function (task) {
    if (
      (task.state === "RUNNING" || task.state === "READY") &&
      Object.keys(cachedEEExports).indexOf(task.description) > -1
    ) {
      print("Cancelling task: " + task.id);
      ee.data.cancelTask(task.id);
      tasksCancelledList = tasksCancelledList + "\n" + task.id;
      tasksCancelled++;
    }
  });
  // taskCount = 0;
  // updateSpinner();
  $("#summary-spinner").hide();
  showMessage(
    "Cancelling Completed",
    "Tasks cancelled: " + tasksCancelled.toString() + "\n" + tasksCancelledList
  );
  trackExports();
};
downloadMetadata = function () {
  console.log("downloading metadta");
  var url = "./src/assets/images/lcms_metadata_beta.pdf";
  var link = document.createElement("a");
  link.href = url;
  link.download = url.substr(url.lastIndexOf("/") + 1);
  link.click();
};
// var dur_meta = 'metadata/lcms_v2019-1_metadata_template_duration.html';
// var lu_meta = 'metadata/lcms_v2019-1_metadata_template_landcover_landuse.html';
// var prob_meta = 'metadata/lcms_v2019-1_metadata_template_probability.html';
// var year_meta = 'metadata/lcms_v2019-1_metadata_template_year.html';
// var meta_template = 'metadata/lcms_v2019-1_metadata_template.html';
// var dur_meta_str;var lu_meta_str;var prob_meta_str;var year_meta_str;var meta_template_str;

// $(document).ready(function(){
//     $.get(meta_template, function(html_string){meta_template_str = html_string;},'html');
//   // $.get(dur_meta, function(html_string){dur_meta_str = html_string;},'html');
//   // $.get(lu_meta, function(html_string){lu_meta_str = html_string;},'html');
//   // $.get(prob_meta, function(html_string){prob_meta_str = html_string;},'html');
//   // $.get(year_meta, function(html_string){year_meta_str = html_string;},'html');

// });
// function exportMetadata(filename, html_string) {

//         var blob = new Blob([html_string], { type: 'text/html;charset=utf-8;' });
//         if (navigator.msSaveBlob) { // IE 10+
//             navigator.msSaveBlob(blob, filename);
//         } else {
//             var link = document.createElement("a");
//             if (link.download !== undefined) { // feature detection
//                 // Browsers that support HTML5 download attribute
//                 var url = URL.createObjectURL(blob);
//                 link.setAttribute("href", url);
//                 link.setAttribute("download", filename);
//                 link.style.visibility = 'hidden';
//                 document.body.appendChild(link);
//                 link.click();
//                 document.body.removeChild(link);
//             }
//         }
//     }
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
  var taskIDList = "Exporting: ";
  var taskIDListTitle = "Exporting: ";
  taskCount = 0;
  var taskList = ee.data.getTaskList().tasks;
  if (taskList.length > 10) {
    taskList = taskList.slice(0, 40);
  }

  taskList.map(function (t) {
    // if(Object.keys(cachedEEExports).indexOf(t.id) >-1 ){
    //     console.log('adding task to past ee export list')
    //     pastEEExports[t.id] = [t.state,false,t.description];
    //     }
    if (Object.keys(cachedEEExports).indexOf(t.description) > -1) {
      var cachedEEExport = cachedEEExports[t.description];

      if (t.state === "RUNNING" || t.state === "READY") {
        taskCount++;
        // cachedEEExport.status = t.status
        var st = cachedEEExport["start-time"];
        var now = new Date();
        var timeDiff = now - st;

        timeDiff = new Date(timeDiff);
        var timeDiffShow =
          zeroPad(timeDiff.getMinutes(), 2) +
          ":" +
          zeroPad(timeDiff.getSeconds(), 2);
        taskIDList =
          taskIDList +
          t.description.chunk(40).join("<br>") +
          "<br>Status: " +
          t.state +
          " <br>Processing Time: " +
          timeDiffShow +
          "<hr>";
        taskIDListTitle =
          taskIDListTitle +
          t.description +
          " Status: " +
          t.state +
          " Processing Time: " +
          timeDiffShow +
          "\n";
      } else if (
        t.state === "COMPLETED" &&
        cachedEEExport.downloaded === false
      ) {
        // var tOutputName = 'https://storage.googleapis.com/'+bucketName+'/'+cachedEEExports[t.description].outputName +'.tif'
        // downloadExport(tOutputName,cachedEEExports[t.description].outputName +'.tif')
        downloadFiles(cachedEEExports[t.description].outputName);
        // exportMetadata(cachedEEExports[t.id].outputName +'_metadata.html',cachedEEExports[t.id].metadata)

        // sleep(2000);
        // window.open(tOutputName);
        cachedEEExports[t.description]["downloaded"] = true;
      }
    }
  });

  // Object.keys(pastEEExports).map(function(k){
  //     var pe = pastEEExports[k]
  //     // console.log(k)
  //     // console.log(pe)
  //     if(pe[0] === 'COMPLETED' && pe[1] === false){
  //         var tOutputName = 'https://console.cloud.google.com/m/cloudstorage/b/'+bucketName+'/o/'+pe[2] +'.tif'
  //         // console.log('Exporting ' + pe[2]);
  //         pastEEExports[k] = [pe[0],true,pe[2]];

  //         showMessage('SUCCESS!',
  //              '<p style = "margin:5px;">'+ pe[2] + ' has successfully exported! </p><p style = "margin:3px;">If download does not work automatically, try following this link:</p> <a target="_blank" href="'+tOutputName+'">'+pe[2]+'</a>'
  //              )
  //          sleep(2000);
  //           window.open(tOutputName);
  //     }
  //     // else if(pe[0] === 'FAILED' && pe[1] === false){
  //     //     showMessage('FAILED',pe[0] + ' failed')
  //     // }

  // })

  // localStorage.setItem("pastEEExports",JSON.stringify(pastEEExports));
  $("#export-spinner").show();
  document.getElementById("export-spinner").title = taskIDListTitle;
  $("#export-count-div").html(taskIDList);

  //   $('#export-count-div').append(`<div id = "export-tasks-table-container">
  // 								<table
  // 								class="table table-hover "
  // 								id="export-tasks-table"
  // 								role="tabpanel"
  // 								tablename="Export Tasks Monitor"
  //               title="Current status of exports"
  // 								></table>
  // 							</div>`);
  $("#export-count").text(taskCount.toString());
  localStorage.setItem("cachedEEExports", JSON.stringify(cachedEEExports));

  if (taskCount === 0) {
    $("#export-spinner").hide();
    $("#export-count-div").html(``);
  }
  // console.log('just ran export checker');
  // updateSpinner();
}
function cacheExport(id, outputName, metadata) {
  cachedEEExports[id] = {
    status: "submitted",
    downloaded: false,
    "start-time": Date.parse(new Date()),
    outputName: outputName,
    metadata: metadata,
  };
  localStorage.setItem("cachedEEExports", JSON.stringify(cachedEEExports));
  trackExports();
}
if (canExport) {
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

  // var imageJson = eeImage.serialize();//ee.Serializer.toJSON(eeImage);
  $("#export-message-container").text("Exporting:" + exportOutputName);

  outputURL =
    "https://console.cloud.google.com/m/cloudstorage/b/" +
    bucketName +
    "/o/" +
    exportOutputName +
    ".tif"; //Currently cannot handle multiple tile exports for very large exports

  console.log(eeType);

  if (eeType === "Geometry") {
    eeImage = ee.Feature(eeImage);
    eeImage = ee.FeatureCollection([eeImage]);
  } else if (eeType === "Feature") {
    eeImage = ee.FeatureCollection([eeImage]);
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
  // var task = ee.batch.Export.image.toCloudStorage(eeImage, exportOutputName, bucketName, exportOutputName, null, region, exportScale, exportCRS, null, 1e13, 256, 256*75);

  // return task;
}
function googleMapPolygonToGEEPolygon(googleMapPolygon) {
  var path = googleMapPolygon.getPath().getArray();
  path = path.map(function (p) {
    return [p.lng(), p.lat()];
  });
  var geePolygon = ee.FeatureCollection([
    ee.Feature(ee.Geometry.Polygon(path)),
  ]);
  // print(geePolygon);
  // Map2.addLayer(geePolygon)
  return geePolygon;
}
function exportImages() {
  var exportCRS = $("#export-crs").val();
  // closePopup();
  // console.log(exportImageDict);
  // console.log('yay');
  var now = Date().split(" ");
  var nowSuffix = "_" + now[2] + "_" + now[1] + "_" + now[3] + "_" + now[4];
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
        var exportName = exportObject["name"] + nowSuffix;
        var noDataValue = exportObject["noDataValue"];
        exportsSubmitted += exportName + "<br>";
        var IDAndParams = getIDAndParams(
          exportObject.eeImage,
          exportName,
          exportCRS,
          exportObject.res,
          fc,
          noDataValue,
          exportObject.eeType,
          exportObject.fileFormat
        );

        //Start processing
        // function startTask(){
        //     console.log('Starting task');
        //     task.start(function(){
        //         // console.log('here')
        //         meta_template_strT = '{}';
        //         cacheExport(exportName,exportName,meta_template_strT);
        //         },
        //     function(fail){
        //         console.log(fail);
        //         startTask();
        //     })};
        // startTask();
        console.log(IDAndParams);
        ee.data.startProcessing(
          IDAndParams["taskId"],
          IDAndParams["params"],
          () => {
            meta_template_strT = "{}";
            cacheExport(exportName, exportName, meta_template_strT);
          }
        );

        // var metadataParams = exportObject['metadataParams']
        // meta_template_strT = '{}';//meta_template_str;

        // meta_template_strT = meta_template_strT.replaceAll('FILENAME_TITLE',exportObject['name']+nowSuffix + '.tif');
        // meta_template_strT = meta_template_strT.replaceAll('EXPORT_CRS',exportCRS);
        // meta_template_strT = meta_template_strT.replaceAll('STARTYEAR',metadataParams.startYear);
        // meta_template_strT = meta_template_strT.replaceAll('ENDYEAR',metadataParams.endYear);
        // meta_template_strT = meta_template_strT.replaceAll('VERSION',metadataParams.version);

        // meta_template_strT = meta_template_strT.replaceAll('STUDYAREA_LONGNAME',metadata_parser_dict.STUDYAREA_LONGNAME[metadataParams.studyAreaName]);
        // meta_template_strT = meta_template_strT.replaceAll('STUDYAREA_URL','https://lcms-data-explorer.appspot.com/');
        // meta_template_strT = meta_template_strT.replaceAll('WHICHONE',metadataParams.whichOne);
        // meta_template_strT = meta_template_strT.replaceAll('DETAILED_PARAGRAPH_DESCRIPTION',metadata_parser_dict[metadataParams.whichOne + '_Description'][0]);
        // meta_template_strT = meta_template_strT.replaceAll('SUPER_PARAGRAPH_DESCRIPTION',metadata_parser_dict[metadataParams.whichOne + '_Description'][1]);
        // meta_template_strT = meta_template_strT.replaceAll('SUMMARY_METHOD',metadata_parser_dict.SUMMARYMETHOD[metadataParams.summaryMethod]);
        // var theThesh;
        // if(metadataParams.whichOne.split(' ')[0] == 'Loss'){theThesh = lowerThresholdDecline}
        //     else{theThesh = lowerThresholdRecovery}
        // meta_template_strT = meta_template_strT.replaceAll('LOWER_THRESHOLD',theThesh);

        // meta_template_strT = meta_template_strT.replaceAll('CLASS_MIN',metadataParams.min);
        // meta_template_strT = meta_template_strT.replaceAll('CLASS_MAX',metadataParams.max);

        // meta_template_strT = meta_template_strT.replaceAll('OOB_ACCURACY',metadata_parser_dict[metadataParams.studyAreaName + '_' +metadataParams.whichOne.split(' ')[0] + '_ACC']['OOB_ACCURACY']);
        // meta_template_strT = meta_template_strT.replaceAll('OOB_KAPPA',metadata_parser_dict[metadataParams.studyAreaName + '_' +metadataParams.whichOne.split(' ')[0] + '_ACC']['OOB_KAPPA']);
        // meta_template_strT = meta_template_strT.replaceAll('CONFUSIONMATRIX',metadata_parser_dict[metadataParams.studyAreaName + '_' +metadataParams.whichOne.split(' ')[0] + '_CONFUSIONMATRIX']);
        // cacheExport(exportName,exportName,meta_template_strT);
        // exportMetadata(exportObject['name']+nowSuffix + '_metadata.html', meta_template_strT)
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
      "No images are selected for exporting. Please select any images you would like to export and then press the <kbd>Export Images</kbd> button again."
    );
  } else {
    $("#summary-spinner").show();
    showMessage(
      "Exports Started",
      "<hr>The following exports were submitted:<br>" +
        exportsSubmitted +
        "<hr>They will start running shortly. Once finished, they will automatically download. The current status of exports can be followed by hovering over the gear spinner in the lower portion of the <kbd>DOWNLOAD DATA</kbd> menu"
    );
  }
  $("#summary-spinner").hide();
}
function processFeatures2(fc, shoudExport) {
  exportFC = fc;
  // print('yay');
  // showPopup();
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
