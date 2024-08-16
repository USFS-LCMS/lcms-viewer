//From https://developers.google.com/analytics/devguides/collection/analyticsjs-->
// (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
// (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
// m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
// })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

var analyticsObj = {
  LCMS: "G-Q5Y0RQT6WG",
  "lcms-dashboard": "G-F0LCQBF44V",
  LT: "G-LR0GKY8FDL",
  IDS: "G-2J5DXETWEP",
  LAMDA: "G-69R0VS9W0V",
  "lcms-base-learner": "G-Q5Y0RQT6WG",
  MTBS: "G-BQYCM0QJVB",
  STORM: "G-8YPEV851B5",
  "Bloom-Mapper": "G-DXSXKN9537",
  Ancillary: "G-7NYEBLBGR4",
  "dev-viewer": "G-CT5Z7S3YFP",
  geeViz: "G-3KQZ4670E3",
  TreeMap: "G-Q2J4L3ZDFV",
  "lcms-home": "G-JD5RXX6TFK",
  "sequoia-view": "G-15Q4KFCY98",
  "HiForm-BMP": "G-NJ3SZE0E2J",
};

if (window.document.documentMode) {
  alert(
    "This website will not work with Microsoft Internet Explorer. Please switch to a browser such as Chrome, Firefox, Edge, Safari, etc"
  );
}

if (window.location.search.indexOf("analytics=dev") !== -1) {
  console.log("Using dev analytics");
  ga4ID = analyticsObj["dev-viewer"];
} else {
  console.log("Using analytics for: " + mode);
  var ga4ID = analyticsObj[mode];
  if (ga4ID === undefined) {
    console.log("Using default LCMS analytics");
    ga4ID = analyticsObj["LCMS"];
  }
}

$.getScript({
  url: `https://www.googletagmanager.com/gtag/js?id=${ga4ID}`,
  cache: true,
});
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());

gtag("config", ga4ID);
function ga(what, whatType, eventName, info1, info2) {
  gtag(whatType, eventName, {
    info1: info1,
    info2: info2,
  });
}
