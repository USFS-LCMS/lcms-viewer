//Taken from: https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
String.prototype.toTitle = function () {
  return this.replace(/(^|\s)\S/g, function (t) {
    return t.toUpperCase();
  });
};
///////////////////////////////////////////////////////////////////
//Function to compute range list on client side
function range(start, stop, step) {
  start = parseInt(start);
  stop = parseInt(stop);
  if (typeof stop == "undefined") {
    // one param defined
    stop = start;
    start = 0;
  }
  if (typeof step == "undefined") {
    step = 1;
  }
  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
    return [];
  }
  const result = [];
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
    result.push(i);
  }
  return result;
}
/////////////////////////////////////////////////////
//Taken from: https://stackoverflow.com/questions/2116558/fastest-method-to-replace-all-instances-of-a-character-in-a-string
String.prototype.replaceAll = function (str1, str2, ignore) {
  return this.replace(
    new RegExp(
      str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"),
      ignore ? "gi" : "g"
    ),
    typeof str2 == "string" ? str2.replace(/\$/g, "$$$$") : str2
  );
};
/////////////////////////////////////////////////////
// Introduce Python-like string formatting to JS
// "a{0}bcd{1}ef".formatUnicorn("FOO", "BAR"); // yields "aFOObcdBARef"
// "Hello, {name}, are you feeling {adjective}?".formatUnicorn({name:"Gabriel", adjective: "OK"});
// Taken from: https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
String.prototype.formatUnicorn =
  String.prototype.formatUnicorn ||
  function () {
    "use strict";
    var str = this.toString();
    if (arguments.length) {
      var t = typeof arguments[0];
      var key;
      var args =
        "string" === t || "number" === t
          ? Array.prototype.slice.call(arguments)
          : arguments[0];

      for (key in args) {
        str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
      }
    }

    return str;
  };
function addModal(containerID, modalID, bodyOnly) {
  if (bodyOnly === null || bodyOnly === undefined) {
    bodyOnly = false;
  }
  if (containerID === null || containerID === undefined) {
    containerID = "main-container";
  }
  if (modalID === null || modalID === undefined) {
    modalID = "modal-id";
  }
  $("#" + modalID).remove();
  if (bodyOnly) {
    $("#" + containerID)
      .append(`<div id = "${modalID}" class="modal fade " role="dialog">
              <div class="modal-dialog modal-md ">
              <div class="modal-content modal-content-not-full-screen-styling">
                  <div style = ' border-bottom: 0 none;'class="modal-header pb-0" id ="${modalID}-header">
                  <button style = 'float:right;' id = 'close-modal-button' type="button" class="close text-dark" data-dismiss="modal">&times;</button>
                  </div>
              <div id ="${modalID}-body" class="modal-body " ></div>
              </div>
          </div> 
          </div>`);
  } else {
    $("#" + containerID).append(`
          <div id = "${modalID}" class="modal fade " role="dialog">
              <div class="modal-dialog modal-lg ">
              <div class="modal-content bg-black">
              <button type="button" class="close p-2 ml-auto" data-dismiss="modal">&times;</button>
                  <div class="modal-header py-0" id ="${modalID}-header"></div>
              <div id ="${modalID}-body" class="modal-body " style = 'background:#DDD;' ></div>
                  <div class="modal-footer" id ="${modalID}-footer"></div>
              </div>
          </div> 
          </div>`);
  }
}

function addModalTitle(modalID, title) {
  if (modalID === null || modalID === undefined) {
    modalID = "modal-id";
  }
  $("#" + modalID + " .modal-header").prepend(
    `<h4 class="modal-title" id = '${modalID}-title'>${title}</h4>`
  );
}

function clearModal(modalID) {
  if (modalID === null || modalID === undefined) {
    modalID = "modal-id";
  }
  $("#" + modalID + "-title .modal-title").html("");
  $("#" + modalID + "-header").html("");
  $("#" + modalID + "-body").html("");
  $("#" + modalID + "-footer").html("");
  $(".modal").modal("hide");
  $(".modal-backdrop").remove();
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to plae a message in a BS modal and show it
function showMessage(title, message, modalID, show) {
  if (title === undefined || title === null) {
    title = "";
  }
  if (message === undefined || message === null) {
    message = "";
  }
  if (show === undefined || show === null) {
    show = true;
  }
  if (modalID === undefined || modalID === null) {
    modalID = "error-modal";
  }

  clearModal(modalID);
  addModal("main-container", modalID, true);
  if (title !== "" && title !== undefined && title !== null) {
    addModalTitle(modalID, title);
  }

  $("#" + modalID + "-body").append(message);
  if (show) {
    $("#" + modalID).modal();
  }
}

function appendMessage2(message, modalID) {
  if (message === undefined || message === null) {
    message = "";
  }
  if (modalID === undefined || modalID === null) {
    modalID = "error-modal";
  }
  $("#" + modalID + "-body").append(message);
}
//////////////////////////////////////////////////////////////////////////////////////////////
function populateLCMSDownloads() {
  var toggler = document.getElementsByClassName("caret");
  var i;

  for (i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener("click", function () {
      this.parentElement.querySelector(".nested").classList.toggle("active");
      this.classList.toggle("caret-down");
    });
  }
}
function setupDropdownTreeDownloads(
  containerID = "download-collapse-div-lcms"
) {
  const programTree = {
    LCMS: {
      CONUS: {
        longName: "Conterminous U.S.",
        startYear: 1985,
        endYear: 2024,
        version: "2024-10",
        products: {
          Change: ["annual"],
          Land_Cover: ["annual"],
          Land_Use: ["annual"],
          QA_Bits: ["annual"],
        },
      },
      AK: {
        longName: "Alaska",
        startYear: 1985,
        endYear: 2024,
        version: "2024-10",
        products: {
          Change: ["annual"],
          Land_Cover: ["annual"],
          Land_Use: ["annual"],
          QA_Bits: ["annual"],
        },
      },

      PRUSVI: {
        longName: "Puerto Rico - US Virgin Islands",
        startYear: 1985,
        endYear: 2023,
        version: "2023-9",
        products: {
          Change: ["annual", "summary"],
          Land_Cover: ["annual"],
          Land_Use: ["annual"],
          QA_Bits: ["annual"],
        },
        summary_products: ["Fast_Loss", "Gain"],
      },
      HI: {
        longName: "Hawaii",
        startYear: 1985,
        endYear: 2023,
        version: "2023-9",
        products: {
          Change: ["annual", "summary"],
          Land_Cover: ["annual"],
          Land_Use: ["annual"],
          QA_Bits: ["annual"],
        },
        summary_products: ["Fast_Loss", "Slow_Loss", "Gain"],
      },
    },
  };

  const programInfo = {
    LCMS: {
      pathFormat: {
        annual: `https://data.fs.usda.gov/geodata/LCMS/LCMS_{sa}_v{version}_{product}_Annual_{yr}.zip`,
        summary: `https://data.fs.usda.gov/geodata/LCMS/LCMS_{sa}_v{version}_{product}_{summary_product}_Summary_{startYear}_{endYear}.zip`,
      },
    },
    NLCD_TCC: {
      pathFormat: {
        annual: `https://data.fs.usda.gov/geodata/rastergateway/treecanopycover/docs/v{version}/{product}_{sa}_{yr}_v{version}_wgs84.zip`,
      },
      productTitles: {
        nlcd_tcc: "NLCD TCC",
        science_tcc: "Science TCC",
        science_se: "Science SE",
      },
    },
  };

  // Initialize container
  $("#" + containerID).append(
    `<ul id="downloadTree" class = 'pl-0 mb-0' title = 'Click through available LCMS and NLCD TCC products. Select which outputs to download, and then click the download button. Hold ctrl key to select multiples or shift to select blocks.'></ul`
  );
  $("#downloadTree").empty();
  Object.keys(programTree).map((program) => {
    const study_areas = programTree[program];
    const programTreeID = `caret-tree-${program}`;

    $("#downloadTree").append(`<ul class="nested active" >
      
        <li class = 'pl-0'>
          <span class="caret top-folder caret-down">${program.replaceAll(
            "_",
            " "
          )} Data</span>
          <ul id = "${programTreeID}" class="nested active"></ul>
        </ul>`);
    Object.keys(study_areas).map((sa) => {
      const saObj = programTree[program][sa];
      const saTreeID = `caret-tree-${program}-${sa}`;
      $("#" + programTreeID).append(`<li><span class="caret top-folder">${
        saObj.longName
      } (v${saObj.version.replaceAll("-", ".")})</span>
                                            <ul id = "${saTreeID}" class="nested"></ul></li>`);
      Object.keys(study_areas[sa].products).map((product) => {
        const productTreeID = `caret-tree-${program}-${sa}-${product}`;
        const productTitle = programInfo[program].productTitles
          ? programInfo[program].productTitles[product]
          : product;

        $("#" + saTreeID).append(`<li><span class="caret">${productTitle
          .replaceAll("_", " ")
          .toTitle()}</span>
                                            <ul id = "${productTreeID}" class="nested "></ul></li>`);
        study_areas[sa].products[product].map((m) => {
          const dropdownID = `${program}-${sa}-${product}-${m}`;

          $("#" + productTreeID).append(`
              <label  title = 'Choose from list below to download LCMS products. Hold ctrl key to select multiples or shift to select blocks. There can be a small delay before a download will begin, especially over slower networks.' for="${dropdownID}" class = 'download-selection-label'>Select products to download:</label>
                              <select id = "${dropdownID}" size="8" style="height: 100%;" class=" bg-download-select" multiple ></select>
                              <br>
                              <button title = 'Click on this button to start downloads. If you have a popup blocker, you will need the manually click on the download links provided' class = 'btn download-btn' onclick = 'downloadSelectedAreas("${dropdownID}")'>Download</button>
                              `);
          if (m === "annual") {
            // Handle NLCD TCC v2021.4 start year irregularity
            let startYear = study_areas[sa].startYear;
            startYear =
              program === "NLCD_TCC" && product === "nlcd_tcc"
                ? 2011
                : startYear;

            const years = range(startYear, study_areas[sa].endYear + 1);

            years.map((yr) => {
              let url = programInfo[program].pathFormat[m].formatUnicorn({
                sa: sa,
                version: study_areas[sa].version,
                product: product,
                yr: yr,
              });

              // Handle irregularities here
              url = url.replaceAll("_HI_", "_HAWAII_");
              url =
                program === "NLCD_TCC" && study_areas[sa].version === "2021-4"
                  ? url.replaceAll("_wgs84", "")
                  : url;

              const name = `${productTitle.replaceAll("_", " ")} ${m} ${yr}`;

              $("#" + dropdownID).append(
                `<option  value = "${url}">${name}</option>`
              );
            });
          } else if (m === "summary") {
            study_areas[sa].summary_products.map((summary_product) => {
              let url = programInfo[program].pathFormat[m].formatUnicorn({
                sa: sa,
                version: study_areas[sa].version,
                product: product,
                summary_product: summary_product,
                startYear: study_areas[sa].startYear,
                endYear: study_areas[sa].endYear,
              });

              // Handle irregularities here
              url = url.replaceAll("_HI_", "_HAWAII_");

              const name = `${productTitle.replaceAll(
                "_",
                " "
              )} ${summary_product} Summary ${study_areas[sa].startYear}-${
                study_areas[sa].endYear
              }`;
              $("#" + dropdownID).append(
                `<option  value = "${url}">${name}</option>`
              );
            });
          }
        });
      });
    });
  });
}
function downloadByUrl(url) {
  console.log("downloading");
  console.log(url);
  var link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  var downloadName = url.substr(url.lastIndexOf("/") + 1);
}

function downloadByUrl(url) {
  console.log("downloading");
  console.log(url);
  var link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  var downloadName = url.substr(url.lastIndexOf("/") + 1);

  link.setAttribute("download", downloadName);

  console.log(link);
  link.click();

  showMessage(
    "Download Started",
    "Your download of " + downloadName + " has started."
  );

  return downloadName;
}

function downloadSelectedAreas(id) {
  var urls = $("#" + id).val();
  console.log(urls);
  if (urls !== "") {
    var downloadNames = urls.map(downloadByUrl);
    var message = '<li class = "m-0">';
    urls.map(function (url) {
      var downloadName = url.substr(url.lastIndexOf("/") + 1);
      message += `<ul class = "m-0"><a href = "${url}" target = "_blank">${downloadName}</a></ul>`;
    });
    message += "</li>";
    showMessage(
      "Downloads Started",
      "The following downloads have started. If you have a popup blocker, you may need to manually download the files by clicking on the links below:<hr>" +
        message +
        "</ul></li>"
    );

    // showSurveyModal("downloadedLCMSTif", true);
  }
}

var surveyPopupShown = false;

function showSurveyModal(source, appendMessage = false) {
  console.log("showing survey");
  let takeSurveyModalText = `<p>We appreciate your interest in the Landscape Change Monitoring System and would welcome your feedback on the LCMS datasets and Data Explorer. If you would be willing to take our short user survey, the provided information will help inform future improvements and additional functionalities. Thank you.</p>
  <a  class = 'intro-modal-links'  onclick = 'openLCMSSurvey("${source}")' title="Click to help us learn how you use LCMS and how we can make it better">TAKE SURVEY</a>
  <div class="form-check  pl-0 mt-3 mb-2">
                            <input role="option" type="checkbox" class="form-check-input" id="dontShowSurveyAgainCheckbox"   name = 'dontShowSurveyPopupAgain' value = 'true'>
                            <label class=" text-uppercase form-check-label " for="dontShowSurveyAgainCheckbox" >Please don't ask me to take the survey again</label>
                        </div>`;
  if (localStorage["showSurveyPopupModal-" + mode] !== "false") {
    if (!appendMessage) {
      showMessage(
        "We would really appreciate your feedback!",
        takeSurveyModalText
      );
    } else {
      appendMessage2(
        `<hr><p style='font-size:1.2rem;font-weight:bold;'>We would really appreciate your feedback!</p>${takeSurveyModalText}`
      );
    }
  }

  $("#dontShowSurveyAgainCheckbox").change(function () {
    console.log(this.checked);
    localStorage["showSurveyPopupModal-" + mode] = !this.checked;
  });
  surveyPopupShown = true;
}

function openLCMSSurvey(fromWhere) {
  var link = document.createElement("a");
  link.href = "https://arcg.is/1e0jef0";
  link.target = "_blank";
  link.click();
  ga("send", "event", "survey-open", fromWhere);
}
function convertRemToPixels(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}
function resizePanes() {
  console.log("resized");
  if (window.innerWidth >= 768) {
    $(".nav-toggler").hide();
    $(".info-page").css(
      "padding-top",
      $("nav").height() + convertRemToPixels(1.5)
    );
    // $("hr.section").css(
    //   "margin-top",
    //   $("nav").height() + convertRemToPixels(1.5)
    // );
    $("hr.section").css("margin-bottom", -$("nav").height());
    $("#data-descriptions-header-row").show();

    $(".navbar-header").css({
      "font-size": "1.85rem",
      "padding-top": "0.2rem;",
    });
  } else {
    $(".nav-toggler").show();
    $(".info-page").css("padding-top", $(".navbar-header").height());
    $("#data-descriptions-header-row").hide();
    $(".navbar-header").css({
      "font-size": "1.65rem",
      "padding-top": "0.15rem;",
    });
  }
}
function toggleNavbar() {
  $("#navbar").slideToggle(200);
}
$(document).ready(function () {
  setupDropdownTreeDownloads("download-container");
  populateLCMSDownloads();
  resizePanes();
  $(".caret").attr("role", "img");
  $(".caret").attr("alt", "Folder Icon");
  addEventListener("resize", (e) => {
    resizePanes();
  });

  const ro = new ResizeObserver((e) => {
    resizePanes();
  });
  // Only observe the second box
  ro.observe(document.querySelector("#navbar"));
});
