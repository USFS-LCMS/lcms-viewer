function addDownload(path, name) {
  $("#downloadDropdown").append($("<option></option>").val(path).html(name));
}
function clearDownloadDropdown() {
  $("#downloadDropdown").empty();
  addDownload("", "Choose a product to download");
}
clearDownloadDropdown();
function downloadByUrl(url) {
  print("downloading");
  print(url);
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  const downloadName = url.substr(url.lastIndexOf("/") + 1);

  link.setAttribute("download", downloadName);

  print(link);
  link.click();

  ga("send", "event", mode + "-download", "image-download", downloadName);

  showMessage(
    "Download Started",
    "Your download of " + downloadName + " has started."
  );

  return downloadName;
}
function downloadSelectedArea(id) {
  if (id === undefined || id === null) {
    id = downloadDropdown;
  }
  const url = $("#" + id).val();
  if (url !== "") {
    downloadByUrl(url);
  }
}
function downloadSelectedAreas(id) {
  const urls = $("#" + id).val();
  if (urls !== "") {
    const downloadNames = urls.map(downloadByUrl);
    let message = '<li class = "m-0">';
    urls.map(function (url) {
      const downloadName = url.substr(url.lastIndexOf("/") + 1);
      message += `<ul class = "m-0"><a href = "${url}" target = "_blank">${downloadName}</a></ul>`;
    });
    message += "</li>";
    showMessage(
      "Downloads Started",
      "The following downloads have started. If you have a popup blocker, you may need to manually download the files by clicking on the links below:<hr>" +
        message +
        "</ul></li>"
    );

    if (mode !== "TreeMap") {
      showSurveyModal("downloadedLCMSTif", true);
    }
  }
}
let surveyPopupShown = false;
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
        `We would really appreciate your feedback!`,
        takeSurveyModalText
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
  const link = document.createElement("a");
  link.href = "https://arcg.is/1e0jef0";
  link.target = "_blank";
  link.click();
  ga("send", "event", "survey-open", fromWhere);
}
function downloadTutorial() {
  const link = document.createElement("a");
  const tutorial_name = "LCMS_v2023-9_Data_Explorer_Overview.pdf";
  link.href = "./src/assets/tutorials/" + tutorial_name;
  link.target = "_blank";
  link.click();
  ga("send", "event", mode + "-download", "tutorial-download", tutorial_name);
  showSurveyModal("downloadedTutorial");
}
function downloadMethods(version) {
  const link = document.createElement("a");
  const methods_name = "LCMS_" + version + "_Methods.pdf";

  link.href =
    "https://data.fs.usda.gov/geodata/rastergateway/LCMS/" + methods_name;
  link.target = "_blank";
  link.click();
  ga("send", "event", mode + "-download", "methods-download", methods_name);
  showSurveyModal("downloadedMethodsDoc");
}
function downloadAnyMethods(path) {
  const link = document.createElement("a");

  link.href = path;
  link.target = "_blank";
  link.click();
  ga("send", "event", mode + "_methods-download", path);
}
