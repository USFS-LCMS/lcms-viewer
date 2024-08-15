/*Templates for elements and various functions to create more pre-defined elements*/
/////////////////////////////////////////////////////////////////////
/*Provide titles to be shown for each mode*/
const titles = {
  "LCMS-pilot": {
    leftWords: "LCMS",
    centerWords: "DATA",
    rightWords: "EXPLORER",
    title: "LCMS Data Explorer",
  },
  LCMS: {
    leftWords: `LCMS`,
    centerWords: "DATA",
    rightWords: "EXPLORER",
    title: "LCMS Data Explorer",
  },
  "lcms-base-learner": {
    leftWords: `LCMS`,
    centerWords: "Base-Learner",
    rightWords: "EXPLORER",
    title: "LCMS Base Learner Explorer",
  },
  Ancillary: {
    leftWords: "Ancillary",
    centerWords: "DATA",
    rightWords: "Viewer",
    title: "TimeSync Ancillary Data Viewer",
  },
  LT: {
    leftWords: `LandTrendr`,
    centerWords: "DATA",
    rightWords: "EXPLORER",
    title: "LandTrendr Data Explorer",
  },
  MTBS: {
    leftWords: `MTBS`,
    centerWords: "DATA",
    rightWords: "EXPLORER",
    title: "MTBS Data Explorer",
  },
  TEST: {
    leftWords: "TEST",
    centerWords: "DATA",
    rightWords: "Explorer",
    title: "TEST Data Viewer",
  },
  IDS: {
    leftWords: "IDS",
    centerWords: "DATA",
    rightWords: "EXPLORER",
    title: "Insect and Disease Detection Survey Data Viewer",
  },
  geeViz: {
    leftWords: "geeViz",
    centerWords: "DATA",
    rightWords: "Viewer",
    title: "geeViz Data Viewer",
  },
  STORM: {
    leftWords: "Storm",
    centerWords: "Damage",
    rightWords: "Viewer",
    title: "Storm Damage Viewer",
  },
  LAMDA: {
    leftWords: "LAMDA",
    centerWords: "DATA",
    rightWords: "EXPLORER",
    title: "LAMDA Data Explorer",
  },
  "lcms-dashboard": {
    leftWords: "LCMS",
    centerWords: "DASHBOARD",
    rightWords: "",
    title: "LCMS Dashboard",
  },
  "Bloom-Mapper": {
    leftWords: "Bloom",
    centerWords: "MAPPER",
    rightWords: "",
    title: "Bloom Mapper",
  },
  TreeMap: {
    leftWords: "",
    centerWords: "TreeMap",
    rightWords: "Explorer",
    title: "TreeMap Explorer",
  },
  "sequoia-view": {
    leftWords: "Giant",
    centerWords: "Sequoia",
    rightWords: "Viewer",
    title: "Sequoia View",
  },
  "HiForm-BMP": {
    leftWords: "HiForm",
    centerWords: "Timber Harvest",
    rightWords: "BMP Tool",
    title: "HiForm Timber Harvest BMP Tool",
  },
};
///////////////////////////////////////////////////////////////////////
let specificAuthErrorMessages = {
  LCMS: `<p>Try <a class = 'support-text' title = "A simple LCMS output viewer" href = "lcms-in-motion.html" target="_blank">this viewer</a> for a simple visualization of LCMS data products.</p>
                                <p>The <kbd>DOWNLOAD DATA</kbd> menu on the left (of this page) is still available for downloading LCMS data.</p>
                                <p>For more information on LCMS please visit the <a class = 'support-text' title = "LCMS Clearinghouse Page" href = "https://data.fs.usda.gov/geodata/rastergateway/LCMS/" target="_blank">LCMS Clearinghouse Page</a>.</p>`,
  MTBS: `<p>Try <a class = 'support-text' title = "MTBS Interactive Data Viewer" href = "https://www.mtbs.gov/viewer/?region=all" target="_blank">this viewer</a> for a simple MTBS product viewer.</p>`,
};
let specificAuthErrorMessage = specificAuthErrorMessages[mode];
if (specificAuthErrorMessage === undefined) {
  specificAuthErrorMessage = ``;
}
let authErrorMessageContact = `<p>Please contact the LCMS help desk <a class = 'intro-modal-links' href = "mailto: sm.fs.lcms@usda.gov">(sm.fs.lcms@usda.gov)</a> if you have questions/comments about the ${mode} viewer or have feedback.</p>`;
if (mode === "MTBS") {
  authErrorMessageContact = `<p style = "margin-bottom:0px;">If you have any further questions about this, please <a class = 'intro-modal-links' href="https://www.mtbs.gov/contact" target="_blank" > contact us</a>.</p>`;
}
//////////////////////////////////////////////////////////////////////
/*Add anything to head not already there*/
$("head").append(`<title>${titles[mode].title}</title>`);
// $('head').append(`<script type="text/javascript" src="./src/assets/palettes/gena-gee-palettes.js"></script>`);
let topBannerParams = titles[mode];
let studyAreaDropdownLabel = `<h5 class = 'teal p-0 caret nav-link dropdown-toggle ' id = 'studyAreaDropdownLabel'>Bridger-Teton National Forest</h5> `;
/////////////////////////////////////////////////////////////////////
//Provide a bunch of templates to use for various elements
function getIntroModal(
  iconPath,
  welcomeText,
  topText,
  middleText,
  bottomText,
  loadingText = "Creating map services within Google Earth Engine"
) {
  return `<div class="modal fade modal-full-screen-styling"  id="introModal" tabindex="-1" role="dialog" >
                <div style='max-width:700px;' class="modal-dialog" role="document">
                    <div class="modal-content text-dark modal-content-full-screen-styling" >
                       
                        <div class="modal-body" id = 'introModal-body'>
                        <button type="button" class="close m-0 ml-auto text-dark" data-dismiss="modal">&times;</button>
                            <span>
                                <img class = 'logo' src="${iconPath}"   alt="logo image">
                                <h1 id = 'intro-modal-title-banner' title="" class = '  splash-title' style="font-weight:100;font-family: 'Roboto';">${titles[mode].leftWords}<span  style="font-weight:1000;font-family: 'Roboto Black', sans-serif;"> ${titles[mode].centerWords} </span>${titles[mode].rightWords}</h1>
                            </span>
                         
                        <div style = 'block;margin-top:0.5rem;'>
                            <span  style="font-weight:bold">${welcomeText}</span>
                            ${topText}
                        </div>
                        ${middleText}
                        ${bottomText}
                        <div class = 'mt-3' id = 'intro-modal-loading-div'>
                            <p >
                              <img style="width:1.8em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="./src/assets/images/GEE_logo_transparent.png">
                                ${loadingText}. 
                             </p>
                        </div>
                       
                        <div class="form-check  pl-0 mt-3 mb-2">
                            <input role="option" type="checkbox" class="form-check-input" id="dontShowAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
                            <label class=" text-uppercase form-check-label " for="dontShowAgainCheckbox" >Don't show again</label>
                        </div>
                    </div>
                        
                           
                        
                </div>
                </div>
            </div>`;
}
const staticTemplates = {
  map: `<section aria-label="Map where all map outputs are displayed" onclick = "$('#study-area-list').hide();" class = 'map' id = 'map'> </section>`,
  mainContainer: `<main aria-label="Main container to contain all elements" class = 'container main-container' id = 'main-container'></main>`,
  sidebarLeftToggler: `<img  title = 'Click to toggle sidebar visibility' class='sidebar-toggler' src='./src/assets/images/menu-hamburger_ffffff.svg' onclick = 'toggleSidebar()' >`,
  sidebarLeftContainer: `
						<nav onclick = "$('#study-area-list').hide();" class = ' col-sm-6 col-md-4 col-lg-3  sidebar  p-0 m-0 flexcroll  ' id = 'sidebar-left-container'>

					        <header id = 'sidebar-left-header'>
                                
                                </header>
                            
					        <div role="list" id = 'sidebar-left'></div>
					    </nav>`,
  geeSpinner: `<div id='summary-spinner' style='position:absolute;right:40%; bottom:40%;width:8rem;height:8rem;z-index:10000000;display:none;'><img  alt= "Google Earth Engine logo spinner" title="Background processing is occurring in Google Earth Engine" class="fa fa-spin" src="./src/assets/images/GEE_logo_transparent.png"  style='width:100%;height:100%'><span id = 'summary-spinner-message'></span></div>`,
  lcmsSpinner: `<div id='lcms-spinner' style='position:absolute;right:40%; bottom:40%;width:10rem;height:8rem;z-index:10000000;display:none;'><img  alt= "LCMS logo spinner" title="Background processing is occurring" class="fa fa-spin" src="./src/assets/images/lcms-icon.png"  style='width:100%;height:100%'><span id = 'lcms-spinner-message'></span></div>`,
  authErrorMessage: `<p>---  Error --- Map Loading Error ---</p>
                                                              <p>Map data did not load correctly and cannot be used at this time. We apologize for this inconvenience and are working to resolve this issue.</p>
                                                              ${specificAuthErrorMessage} 
                                                              ${authErrorMessageContact}
    `,
  exportContainer: `<div class = 'py-2' id = 'export-list-container'>
                        <h5>Choose which data to export:</h5>
                        <div class = 'py-2' id="export-list"></div>
                        <hr>
                        <div class = 'pl-3'>
                            <h5 title="Provide a projection crs and draw an area for image exports">Image export parameters</h5>
                            <form class="form-inline" title = 'Provide projection. Web mercator: "EPSG:4326", USGS Albers: "EPSG:5070", WGS 84 UTM Northern Hemisphere: "EPSG:326" + zone number (e.g. zone 17 would be EPSG:32617), NAD 83 UTM Northern Hemisphere: "EPSG:269" + zone number (e.g. zone 17 would be EPSG:26917) '>
                              <label for="export-crs">Projection: </label>
                              <div class="form-group pl-1">
                                <input type="text" id="export-crs" oninput = 'cacheCRS()' name="rg-from" value="EPSG:4326" class="form-control">
                              </div>
                            </form>
                            <div class = 'pt-2' id = 'export-area-drawing-div'>
                                
                                <button class = 'btn' onclick = 'selectExportArea()' title = 'Needed for image exports. Draw polygon by clicking on map. Double-click to complete polygon, press ctrl+z to undo most recent point, press Delete or Backspace to start over.'><i class="pr-1 fa fa-pencil" aria-hidden="true"></i> Draw area to download</button>
                                <a href="#" onclick = 'undoExportArea()' title = 'Click to undo last drawn point (ctrl z)'><i class="btn fa fa-undo"></i></a>
                                <a href="#" onclick = 'deleteExportArea()' title = 'Click to clear current drawing'><i class="btn fa fa-trash"></i></a>
                            </div>
                            <hr>  
                            <div class = 'pt-1 pb-3' >
                                <div id = 'export-button-div'>
                                    <button class = 'btn' onclick = 'exportImages()' title = 'Click to export selected data from GEE'><i class="pr-1 fa fa-cloud-download" aria-hidden="true"></i>Export</button>
                                    <button class = 'btn' onclick = 'cancelAllTasks()' title = 'Click to cancel all active exports'><i class="pr-1 fa fa-close" aria-hidden="true"></i>Cancel All Exports</button>
                                </div>
                                
                                
                            </div> 
                            
                        </div>
                        
                        <span style = 'display:none;' class="fa-stack fa-2x py-0" id='export-spinner' title="">
                            <img alt= "Google Earth Engine logo spinner" class="fa fa-spin fa-stack-2x" src="./src/assets/images/GEE_logo_transparent.png" alt="" style='width:4rem;height:4rem;'>
                            <strong id = 'export-count'  class="fa-stack-1x" style = 'padding-top: 0.1rem;cursor:pointer;'></strong>
                        </span>
                        <div id = 'export-count-div' ></div> 
                        
                    </div>`,
  topBanner: ` <div id = 'title-banner' class = 'white  title-banner '>
                    <a href="home.html" target="_blank" title = 'Click to visit the LCMS Homepage'>
                    <img id='title-banner-icon-left' class = 'title-banner-icon' style = 'height:1.7rem;'  alt="USDA Forest Service icon" src="./src/assets/images/logos_usda-fs.svg" >
                    </a>
                    <div class="vl title-banner-icon"></div>
                    <img id='title-banner-icon-right' class = 'title-banner-icon'  >
                    <div  class='my-0 title-banner-label'>  
                    ${topBannerParams.leftWords} <span class = 'gray' style="font-weight:1000;font-family: 'Roboto Black', sans-serif;">${topBannerParams.centerWords}</span> ${topBannerParams.rightWords}</div>
                </div>`,
  // topBanner: ` <div class='title-banner white'>
  // <span>${topBannerParams.leftWords} <p class = 'gray' style="font-weight:1000;font-family: 'Roboto Black', sans-serif;">${topBannerParams.centerWords}</p> ${topBannerParams.rightWords}</p>
  // </div>`,

  studyAreaDropdown: `<li   id = 'study-area-dropdown' class="nav-item dropdown navbar-dark navbar-nav nav-link p-0 col-12  "  data-toggle="dropdown">
		                <h5 href = '#' onclick = "$('#sidebar-left').show('fade');$('#study-area-list').toggle();" class = 'teal-study-area-label p-0 caret nav-link dropdown-toggle ' id='study-area-label'></h5> 
		                <div class="dropdown-menu" id="study-area-list">  
		                </div>
		            </li>`,
  placesSearchDiv: `<section id = 'search-share-div' class="input-group  text-center search-bar" '>
			            <div role='list' class="input-group-prepend">
                            <button onclick = 'getLocation()' title = 'Click to center map at your location' class=" btn input-group-text bg-white search-box pr-1 pl-2" id="get-location-button"><i class="fa fa-map-marker text-black "></i></button>
	    					<button onclick = 'storeParams()' title = 'Click to share your current view' class=" btn input-group-text bg-white search-box pr-1 pl-2" id="share-button"><i class="fa fa-share-alt teal "></i></button>
                            <buttom class="input-group-text bg-white search-box" id="search-icon"><i class="fa fa-search text-black "></i></buttom>
	  					</div>
			            <input id = 'pac-input' class="form-control bg-white search-box" title = 'Search for places on the map' type="text" placeholder="Search Places">
                        <div class="input-group-prepend">
                            <button onclick = 'backView()' title = 'Click to go back a view' class=" btn input-group-text bg-white search-box pr-1 pl-2" id="back-view-button"><i class="fa fa-chevron-left teal "></i></button>
                            <button onclick = 'forwardView()' title = 'Click to go forward a view' style = 'border-radius: 0px 3px 3px 0px' class=" btn input-group-text bg-white search-box pr-1 pl-2" id="forward-view-button"><i class="fa fa-chevron-right teal "></i></button>
                        </div>
                    </section>
                    <p class = 'mt-0 mb-1 text-center white' style = 'display:none;font-size:1.25rem;font-weight:bold' id = 'time-lapse-year-label'></p>`,
  introModal: {
    LCMS: getIntroModal(
      "./src/assets/images/lcms-icon.png",
      "Welcome to the Landscape Change Monitoring System (LCMS) Data Explorer!",
      `<p class='my-2'>
                                    This Data Explorer provides the ability to view, analyze, summarize, and download LCMS data. 
                                    </p>
                                    <div class ='my-3'> For an overview of LCMS and to find links to other LCMS Explorers, visit the
                                      <a class="intro-modal-links" href="home.html" target="_blank">LCMS Homepage.</a>
                                    </div>
                            LCMS is a remote sensing-based system for mapping and monitoring landscape change across the United States produced by the USDA Forest Service. LCMS provides a "best available" map of landscape change that leverages advances in time series-based change detection techniques, Landsat and Sentinel 2 data availability, cloud-based computing power, and big data analysis methods.

                            </p>
                            `,
      `<div style='display:inline-block;margin-top:0.5rem;'>
                            <div style ='float:left;' title='LCMS is produced by the USDA Forest Service'>
                                <img class = 'logo' alt="USDA Forest Service icon" src="./src/assets/images/logos_usda-fs_bn-dk-01.svg">
                                
                            </div>
                            <div style ='float:left;'>
                                <ul class="intro-list">
                                  <li title = "The Geospatial Technology and Applications Center (GTAC) provides leadership in geospatial science implementation in the USDA Forest Service by delivering vital services, data products, tools, training, and innovation to solve today's land and resource management challenges. All operational LCMS production and support takes place at GTAC."><a class="intro-modal-links" href="https://www.fs.usda.gov/about-agency/gtac" target="_blank">GTAC</a> Geospatial Technology and Applications Center
                                  </li>
                                  <li title = 'RedCastle Resources Inc. is the on-site contractor that has provided the technical expertise for LCMS' operational production, documentation, and delivery at GTAC.'><a class="intro-modal-links" href="https://www.redcastleresources.com/" target="_blank">RCR</a> RedCastle Resources Inc.
                                  </li>
                                  <li title = 'The Rocky Mountain Research Station provides the scientific foundation LCMS is built upon. They have been instrumental in developing and publishing the original LCMS methodology and continue to provide ongoing research and development to further improve LCMS methods.'><a class="intro-modal-links" href="https://www.fs.usda.gov/rmrs/tools/landscape-change-monitoring-system-lcms" target="_blank">RMRS</a> Rocky Mountain Research Station
                                  </li>
                                  <li title = 'LCMS utilizes Google Earth Engine for most of its data acqusition, processing, and visualization through an enterprise agreement between the USDA Forest Service and Google. In its current form, LCMS would not be possible without Google Earth Engine.'><a class="intro-modal-links" href="https://earthengine.google.com/" target="_blank">GEE</a> Google Earth Engine
                                  </li>
                                </ul>
                                
                            </div>
                        
                        </div>`,
      `<p>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>
                        <div class ='my-3'>
                           <a  class = 'intro-modal-links' onclick = 'downloadTutorial()' title="Click to launch tutorial that explains how to utilize the Data Explorer">TUTORIAL</a>
                            <a class="intro-modal-links" onclick="downloadMethods('v2023-9')" title="Open in-depth LCMS v2023.9 methods documentation">LCMS METHODS</a>
                            <a  class = 'intro-modal-links'  onclick = 'openLCMSSurvey("splashScreen")' title="Click to help us learn how you use LCMS and how we can make it better">LCMS USER SURVEY</a>
                            <a class = "intro-modal-links" title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov" >LCMS HELPDESK/FEEDBACK</a> 
                        </div>
                        
                        `
    ),
    "lcms-base-learner": getIntroModal(
      "./src/assets/images/lcms-icon.png",
      "Welcome to the Landscape Change Monitoring System (LCMS) Base-Learner Explorer!",
      `<div class ='my-3'> LCMS is a landscape change detection program developed by the USDA Forest Service. For an overview of LCMS and to find links to other LCMS Explorers, visit the
                                        <a class="intro-modal-links" href="home.html" target="_blank">LCMS Homepage.</a>
                                    </div> 
                                    <p>The Base Learner application is designed to provide a visualization of the change detection algorithm outputs that are used to produce LCMS products.</p>`,
      `<p>In addition to the map layers, LandTrendr and CCDC outputs can be compared through charting under the <kbd>Tools</kbd> -> <kbd>Pixel Tools</kbd>
                                    </p>`,
      `<p>Please review this <a class = 'support-text' onclick = 'downloadMethods("v2023-9")' title = 'Open in-depth LCMS v2023.9 methods documentation'>methods document</a> for more information about how these datasets are used to create LCMS products.   
                            </p>
                            <p>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>
                            <div class ='my-3'>
                                <a class="intro-modal-links" onclick="downloadMethods('v2023-9')" title="Open in-depth LCMS v2023.9 methods documentation">LCMS METHODS</a>
                                <a  class = 'intro-modal-links'  onclick = 'openLCMSSurvey("splashScreen")' title="Click to help us learn how you use LCMS and how we can make it better">LCMS USER SURVEY</a>
                                <a class = "intro-modal-links" title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov" >LCMS HELPDESK/FEEDBACK</a> 
                            </div>`
    ),
    "lcms-dashboard": getIntroModal(
      "./src/assets/images/lcms-icon.png",
      "Welcome to the Landscape Change Monitoring System (LCMS) Data Dashboard!",
      `<div class ='my-3'> LCMS is a landscape change detection program developed by the USDA Forest Service. For an overview of LCMS and to find links to other LCMS Explorers, visit the
                                        <a class="intro-modal-links" href="home.html" target="_blank">LCMS Homepage.</a>
                                    </div>
                                    <p>The LCMS Dashboard application is designed to provide the ability to quickly visualize and generate reports of how our landscapes are changing.</p>`,
      `<p>Pre-calculated summary areas are available for generating custom reports.</p>
                                    <p>Disclaimer: All summary numbers are based on modeled LCMS outputs. These tables are useful for understanding broad patterns of change on our landscape. Known as model-based inference, error margins are difficult to compute directly from the summary pixel counts. Currently, error margins are calculated from the LCMS reference sample for each year from each summary area, plus a 210km buffer. This assumes the statistical properties of the model-based and reference sample-based estimates are similar. Since this assumption is difficult to uphold, this method is still under scientific review. For details on valid statistical conclusions and understanding map error, please refer to the <a class="intro-modal-links" onclick="downloadMethods('v2023-9')" title="Open in-depth LCMS v2023.9 methods documentation">LCMS METHODS</a> document or reach out to the <a class = "intro-modal-links" title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov" >LCMS HELPDESK</a>.
                                    </p>`,
      `<p>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>
                            <div class ='my-3'>
                            <a class="intro-modal-links" onclick="startTour()" title="Click to take a tour of the LCMS Dashboard's features">DASHBOARD TOUR</a>
                            <a class="intro-modal-links" onclick="downloadMethods('v2023-9')" title="Open in-depth LCMS v2023.9 methods documentation">LCMS METHODS</a>
                            <a  class = 'intro-modal-links'  onclick = 'openLCMSSurvey("splashScreen")' title="Click to help us learn how you use LCMS and how we can make it better">LCMS USER SURVEY</a>
                            <a class = "intro-modal-links" title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov" >LCMS HELPDESK/FEEDBACK</a> 
                        </div>`,
      "Loading LCMS summary areas. This can take some time"
    ),
    IDS: getIntroModal(
      "./src/assets/images/lcms-icon.png",
      "Welcome to the Landscape Change Monitoring System (LCMS) Insect and Disease Detection Survey (IDS) Explorer!",
      `<div class ='my-3'> LCMS is a landscape change detection program developed by the USDA Forest Service. For an overview of LCMS and to find links to other LCMS Explorers, visit the
                <a class="intro-modal-links" href="home.html" target="_blank">LCMS Homepage.</a>
            </div>
            <p> The Insect and Disease Explorer (IDS) application is designed to provide a visualization of the LCMS outputs alongside outputs from the U.S. Department of Agriculture, Forest Service Forest Health Protection's <a class='intro-modal-links' href='https://www.fs.usda.gov/foresthealth/applied-sciences/mapping-reporting/detection-surveys.shtml' title = 'IDS homepage' target="_blank">Insect and Disease Detection Survey (IDS)</a>outputs.</p>
           
           <p>LCMS Change and IDS polygon data can be viewed simultaneously for each coincident year. These data can also be compared through charting under the <kbd>Tools</kbd> -> <kbd>Pixel Tools</kbd> and <kbd>Area Tools</kbd>
           </p>`,
      `
    <p>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>
    <div class ='my-3'>
    <a class="intro-modal-links" onclick="downloadMethods('v2023-9')" title="Open in-depth LCMS v2023.9 methods documentation">LCMS METHODS</a>
    <a  class = 'intro-modal-links'  onclick = 'openLCMSSurvey("splashScreen")' title="Click to help us learn how you use LCMS and how we can make it better">LCMS USER SURVEY</a>
    <a class = "intro-modal-links" title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov" >LCMS HELPDESK/FEEDBACK</a> 
</div>`,
      ""
    ),
    Ancillary: `<div class="modal fade "  id="introModal" tabindex="-1" role="dialog" >
                <div class="modal-dialog modal-md " role="document">
                    <div class="modal-content text-dark" style = 'background-color:rgba(230,230,230,0.95);'>
                        <button type="button" class="close p-2 ml-auto text-dark" data-dismiss="modal">&times;</button>
                        <div class = 'modal-header'>
                            <h3 class="mb-0 ">Welcome to the TimeSync Ancillary Data Viewer!</h3>
                        </div>
                        <div class="modal-body" id = 'introModal-body'>
                            <p class="pb-2 ">This viewer is intended to provide an efficient way of looking at ancillary data to help with responses for the TimeSync tool.</p>
                        </div>
                        <div class = 'modal-footer' id = 'introModal-footer'>
                        <div class = ' ml-0' id = 'intro-modal-loading-div'>
                            <p>
                              <img style="width:1.8em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="./src/assets/images/GEE_logo_transparent.png">
                                Creating map services within Google Earth Engine. 
                             </p>
                        </div>
						<div class="form-check  mr-0">
                                <input role="option" type="checkbox" class="form-check-input" id="dontShowAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
                                <label class=" text-uppercase form-check-label " for="dontShowAgainCheckbox" >Don't show again</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`,
    LT: getIntroModal(
      "./src/assets/images/lcms-icon.png",
      "Welcome to the LandTrendr Data Explorer!",
      `<li>
           <p class="pb-2 ">This tool allows for quick exploration of significant changes visible in the Landsat time series using the <a class = 'intro-modal-links' href="https://emapr.github.io/LT-GEE/" target="_blank">LandTrendr temporal segmentation algorithm</a>. While this tool can run across any area on earth, the quality of the output will be related to the availability of cloud-free Landsat observations.</p>
       </li>
       <li>
           <p class="pb-2 ">LandTrendr will run across the entire extent of the map when it is loaded. If you would like to map a different area, move to the view extent you would like to map, and then press the <kbd>Submit</kbd> button at the bottom of the <kbd>PARAMETERS</kbd> collapse menu.</p>
       </li>
        <li>
           <p class="pb-2 ">All Landsat image processing and LandTrendr algorithm application is being performed on-the-fly. This can take some time to run. If you try to run this tool across a very large extent (zoom level < 9), it may not run.</p>
       </li>`,
      `
    <p>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>
    <div class ='my-3'>
    <a class="intro-modal-links" href="https://emapr.github.io/LT-GEE/" target="_blank" title="Open additional LandTrendr resources">LandTrendr Guide</a>
    <a class = "intro-modal-links" title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov" >LCMS HELPDESK/FEEDBACK</a> 
</div>

<div class ='my-3' title='There are additional data visualization tools available in these other sites'>Other LCMS EXPLORERS:
    <a class = 'intro-modal-links' title = "Visualize and explore LCMS final outputs" href = "index.html" target="_blank">LCMS Data Explorer</a>
    <a class = 'intro-modal-links' title = "Visualize and explore time series datasets used to create the LCMS map outputs (Includes both LandTrendr and CCDC outputs)" href = "lcms-base-learner.html" target="_blank">LCMS Base Learner Explorer</a>
    <a class = 'intro-modal-links' title = "Visualize and explore summaries of LCMS data over different areas" href = "dashboard.html" target="_blank">LCMS Dashboard</a>
    <a class = 'intro-modal-links' title = "Visualize pre-made gifs illustrating patterns of change across U.S. Department of Agriculture, Forest Service Forests and Districts" href = "lcms-in-motion.html" target="_blank">LCMS-in-Motion</a>
    
</div>`,
      ""
    ),
    MTBS: getIntroModal(
      "./src/assets/images/mtbs-logo.png",
      "Welcome to the MTBS Data Explorer!",
      `<p class='my-2'>This tool is intended to allow for interactive exploration of the Monitoring Trends in Burn Severity (MTBS) data record.
            </p>
            <p class='my-2'>
            Monitoring Trends in Burn Severity (MTBS) is a multiagency program designed to consistently map the burn severity and perimeters of fires across all lands of the United States from 1984 and beyond. MTBS maps wildland and prescribed fires greater than 1,000 acres in the Western US and 500 acres in the Eastern US. 
    </p>
    <p class='my-2'>
    MTBS burn severity data are used to assess the impacts to landscape health and can be used to monitor trends in wildfire over time.
    </p>
    `,
      `<div style='display:inline-block;margin-top:0.5rem;'>
    <div style ='float:left;display:block' title='MTBS is jointly produced by the USDA Forest Service and USGS'>
        <img class = 'logo' alt="USDA Forest Service icon" src="./src/assets/images/logos_usda-fs_bn-dk-01.svg">
        <br>
        <img class = 'logo' style = 'margin-left:0.3rem;height:2.5rem;' alt="USGS icon" src="./src/assets/images/USGS_logo_green.svg">
    </div>
    <div style ='float:left;'>
        <ul class="intro-list">
          <li title = "The Geospatial Technology and Applications Center (GTAC) provides leadership in geospatial science implementation in the USDA Forest Service by delivering vital services, data products, tools, training, and innovation to solve today's land and resource management challenges. This Explorer was developed at GTAC.""><a class="intro-modal-links" href="https://www.fs.usda.gov/about-agency/gtac" target="_blank">GTAC</a> Geospatial Technology and Applications Center
          </li>
          <li title = "The Earth Resources Observation and Science (EROS) Center studies land change and produce land change data products used by researchers, resource managers, and policy makers across the nation and around the world. They also operate the Landsat satellite program with NASA, and maintain the largest civilian collection of images of the Earth's land surface in existence, including tens of millions of satellite images.""><a class="intro-modal-links" href="https://www.usgs.gov/centers/eros" target="_blank">EROS</a> Earth Resources Observation and Science Center
          </li>
          <li title = "This site utilizes Google Earth Engine for most of its data acqusition, processing, and visualization through an enterprise agreement between the USDA Forest Service and Google.""><a class="intro-modal-links" href="https://earthengine.google.com/" target="_blank">GEE</a> Google Earth Engine
          </li>
        </ul>
        
    </div>

</div>`,
      `<p>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>
<div class ='my-3'>
   <a  class = 'intro-modal-links' onclick = 'toggleWalkThroughCollapse()' title="Run interactive walk-through of the features of the MTBS Data Explorer">Run Walk-Through</a>

    <a class = "intro-modal-links" title = "Contact us" href="https://www.mtbs.gov/contact" target="_blank"  >CONTACT</a> 
</div>

`
    ),
    LAMDA: getIntroModal(
      "./src/assets/Icons_svg/logo_gtac_color-wt.svg",
      "Welcome to the Landscape Automated Monitoring and Detection Algorithm (LAMDA) Data Explorer!",
      `<li>
           <p class="pb-2 ">LAMDA is a near real-time landscape-scale change detection program developed by the USDA Forest Service to serve as a 'hot spot' indicator for areas where finer resolution data may be used for further investigation and to serve as an indicator of severe changes over forested regions. This application is designed to provide a visualization of LAMDA outputs.</p>
       </li>
       `,
      `
    <p>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>
    <div class ='my-3'>
    <a class = "intro-modal-links" title = "Publication outlining the methods used to derive these products" href = "https://www.mdpi.com/2072-4292/10/8/1184" target="_blank" >LAMDA Methods Publication</a>
    <a class="intro-modal-links" href="./lamda-downloads.html" target="_blank" title="LAMDA product download page">Download LAMDA Data</a>
    <a class = "intro-modal-links" title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov" >HELPDESK/FEEDBACK</a> 
</div>
<div class ='my-3' title='There are additional change data visualization tools available in these other sites'>Other EXPLORERS:
    <a class = 'intro-modal-links' title = "Visualize and explore LCMS final outputs" href = "index.html" target="_blank">LCMS Data Explorer</a>
    <a class = 'intro-modal-links' title = "Visualize and explore time series datasets used to create the LCMS map outputs (Includes both LandTrendr and CCDC outputs)" href = "lcms-base-learner.html" target="_blank">LCMS Base Learner Explorer</a>
    <a class = 'intro-modal-links' title = "Visualize and explore summaries of LCMS data over different areas" href = "dashboard.html" target="_blank">LCMS Dashboard</a>
    <a class = 'intro-modal-links' title = "Visualize pre-made gifs illustrating patterns of change across U.S. Department of Agriculture, Forest Service Forests and Districts" href = "lcms-in-motion.html" target="_blank">LCMS-in-Motion</a>
    
</div>`,
      ""
    ),
    "sequoia-view": getIntroModal(
      "./src/assets/Icons_svg/logo_gtac_color-wt.svg",
      "Welcome to the Giant Sequoia Viewer!",
      `<li>
<p class="pb-2 ">This near real-time program developed by the USDA Forest Service to serve as a 'hot spot' indicator for areas where finer resolution data may be used for further investigation and to serve as an indicator of severe changes over forested regions. This application is designed to provide first cut alarm of potentially declining named Giant Sequoias and the ability to view available remote sensing image data.</p>
</li>
`,
      `
<p>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>
<!-- <h5>For access please contact Sequoia Viewer project coordinator.</h5> -->
<div class ='my-3'>
<h6><b>First time users</b>, please click below to take a tutorial on how to use the Giant Sequoia Viewer's features:</h6>
<a class="intro-modal-links" onclick= "startTour()" id= "tutorialLink" title="Click to take a tour of the Giant Sequoia Viewer's features">TUTORIAL</a><br><br>
<a class = "intro-modal-links" title = "Publication outlining the methods used to derive these products" href = "https://www.mdpi.com/2072-4292/10/8/1184" target="_blank" >LAMDA Methods Publication</a>

<a class = "intro-modal-links" title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov" >HELPDESK/FEEDBACK</a> 
</div>
<div class ='my-3' title='There are additional change data visualization tools available in these other sites'>Other EXPLORERS:
<a class = 'intro-modal-links' title = "Visualize and explore LAMDA products" href = "lamda-downloads.html" target="_blank">LAMDA Explorer</a>


</div>`,
      ""
    ),
    "HiForm-BMP": getIntroModal(
      "./src/assets/Icons_svg/logo_gtac_color-wt.svg",
      "Welcome to the <i>HiForm</i> BMP Tool!",
      `<li>
<p class="pb-2 ">This application utilizes Google Earth Engine and 10m Sentinel-2 satellite imagery with a 5-day repeat frequency to identify locations of timber harvest and more moderate silvicultural treatments. State agencies monitor these activities to ensure compliance with water quality Best Management Practices (BMPs). Users define a timeframe for forest-only change analysis, which can generate short- and long-term forest change products. These outputs help prioritize site monitoring efforts and can be exported in various formats. The application also provides BMP-related data layers to help interpret local topographic and hydrologic conditions.
This tool was built using workflow components developed for the <i>HiForm</i> (“Hi-resolution Forest mapping”) forest disturbance mapping application, visit <a title="hiform link" href="https://hiform.org" target="_blank" >hiform.org</a> for more information
</p>
</li>
`,
      `
<p>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>

<div class ='my-3'>
<a class="intro-modal-links" onclick="startTour()" title="Click to take a tour of the ${mode}'s features">TOUR</a>
<a class = "intro-modal-links" title = "HiForm BMP Help Document" href = "" target="_blank" >Help Document</a>

<a class = "intro-modal-links" title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov" >HELPDESK/FEEDBACK</a> 
`,
      ""
    ),
    STORM: getIntroModal(
      "./src/assets/Icons_svg/logo_gtac_color-wt.svg",
      "Welcome to the Storm Damage Viewer!",
      `<p class='my-2'>
                            This tool provides an interactive ability to upload storm tracks and produce modeled wind fields and tree damage. These outputs can then be downloaded for further analysis.

                            </p>`,
      `<div style='display:inline-block;margin-top:0.5rem;'>
    <div style ='float:left;display:block' title='This tool is produced by the USDA Forest Service'>
        <img class = 'logo' alt="USDA Forest Service icon" src="./src/assets/images/logos_usda-fs_bn-dk-01.svg">
    </div>
    <div style ='float:left;'>
        <ul class="intro-list">
          <li title = "The Geospatial Technology and Applications Center (GTAC) provides leadership in geospatial science implementation in the USDA Forest Service by delivering vital services, data products, tools, training, and innovation to solve today's land and resource management challenges. This Explorer was developed at GTAC."><a class="intro-modal-links" href="https://www.fs.usda.gov/about-agency/gtac" target="_blank">GTAC</a> Geospatial Technology and Applications Center
          </li>
          <li title = 'The Southern Research Station provided the original methods for this data explorer.'><a class="intro-modal-links" href="https://www.srs.fs.usda.gov/" target="_blank">SRS</a> Southern Research Station
                                  </li>
            <li title = 'RedCastle Resources Inc. is the on-site contractor that has provided the technical expertise for adapting the original workflow from the SRS and developing this Viewer.'><a class="intro-modal-links" href="https://www.redcastleresources.com/" target="_blank">RCR</a> RedCastle Resources Inc.
            </li>
          <li title = 'This site utilizes Google Earth Engine for most of its data acqusition, processing, and visualization through an enterprise agreement between the USDA Forest Service and Google.'><a class="intro-modal-links" href="https://earthengine.google.com/" target="_blank">GEE</a> Google Earth Engine
          </li>
        </ul>
        
    </div>

</div>`,
      `<p>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>

<div class ='my-3'>
    <a class = "intro-modal-links" title = "Report highlighting a project that used this tool" href = "https://apps.fs.usda.gov/gtac/publications/2022/tree-structure-damage-impact-predictive-trees-dip-modeling-phase-ii" target="_blank" >PROJECT REPORT</a>
    <a class = "intro-modal-links" title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov" >HELPDESK/FEEDBACK</a> 
</div>
<div class ='my-3' title='There are additional change data visualization tools available in these other sites'>Other EXPLORERS:
    <a class = 'intro-modal-links' title = "Visualize and explore LCMS final outputs" href = "index.html" target="_blank">LCMS Data Explorer</a>
    <a class = 'intro-modal-links' title = "Visualize and explore time series datasets used to create the LCMS map outputs (Includes both LandTrendr and CCDC outputs)" href = "lcms-base-learner.html" target="_blank">LCMS Base Learner Explorer</a>
    <a class = 'intro-modal-links' title = "Visualize and explore summaries of LCMS data over different areas" href = "dashboard.html" target="_blank">LCMS Dashboard</a>
    <a class = 'intro-modal-links' title = "Visualize pre-made gifs illustrating patterns of change across U.S. Department of Agriculture, Forest Service Forests and Districts" href = "lcms-in-motion.html" target="_blank">LCMS-in-Motion</a>
    
</div>`
    ),
    "Bloom-Mapper": getIntroModal(
      "./src/assets/Icons_svg/logo_gtac_color-wt.svg",
      "Welcome to the Bloom MAPPER!",
      `<p class='my-2'>
            This prototype tool provides an interactive map with the ability to view lakes with potential cyanobacteria or algae blooms. These outputs have been created as a collaborative effort between field experts throughout Wyoming and the Geospatial Technology and Applications Center. Current methods are being tested for preliminary review. These products are not conclusive and are intended for review purposes only. 
            </p>`,
      `<div style='display:inline-block;margin-top:0.5rem;'>
    <div style ='float:left;display:block' title='Bloom mapper is a joint effort between GTAC and WY U.S. Department of Agriculture, Forest Service partners'>
        <img class = 'logo' alt="USDA Forest Service icon" src="./src/assets/images/logos_usda-fs_bn-dk-01.svg">
        
       
        
    </div>
    <div style ='float:left;'>
        <ul class="intro-list">
          <li title = "The Geospatial Technology and Applications Center (GTAC) provides leadership in geospatial science implementation in the USDA Forest Service by delivering vital services, data products, tools, training, and innovation to solve today's land and resource management challenges. This Explorer was developed at GTAC."><a class="intro-modal-links" href="https://www.fs.usda.gov/about-agency/gtac" target="_blank">GTAC</a> Geospatial Technology and Applications Center
          </li>
          
         
            <li title = 'RedCastle Resources Inc. is the on-site contractor that has provided the technical expertise for adapting the original workflow from the SRS and developing this Viewer.'><a class="intro-modal-links" href="https://www.redcastleresources.com/" target="_blank">RCR</a> RedCastle Resources Inc.
            </li>
          <li title = 'This site utilizes Google Earth Engine for most of its data acqusition, processing, and visualization through an enterprise agreement between the USDA Forest Service and Google.'><a class="intro-modal-links" href="https://earthengine.google.com/" target="_blank">GEE</a> Google Earth Engine
          </li>
        </ul>
        
    </div>
    <div class ='my-3'>
                            <a class="intro-modal-links" onclick="startTour()" title="Click to take a tour of the ${mode}'s features">TOUR</a>
                            <a class="intro-modal-links" onclick="downloadAnyMethods('./literature/Bloom_Mapper_v3_Methods_2023.pdf')" title="Open Bloom Mapper data creation methods documentation">METHODS</a>
                            <a class = "intro-modal-links" title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov" >HELPDESK/FEEDBACK</a> 
                        </div>

</div>`,
      `<p>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>

`
    ),
    TreeMap: getIntroModal(
      "./src/assets/Icons_svg/logo_gtac_color-wt.svg",
      "Welcome to the TreeMap Explorer!",
      `<p class='my-2'>
            This prototype tool provides an interactive map with the ability to view the 2016 TreeMap attributes. Source Data: Riley, Karin L.; Grenfell, Isaac C.; Finney, Mark A.; Shaw, John D. (2023). TreeMap 2016: A tree-level model of the forests of the conterminous United States circa 2016. Forest Service Research Data Archive. https://doi.org/10.2737/RDS-2021-0074. Accessed 2023-03-13. 
            </p>`,
      `<div style='display:inline-block;margin-top:0.5rem;'>
    <div style ='float:left;display:block' title='TreeMap Explorer is a joint effort between GTAC and USDA Forest Service Research'>
        <img class = 'logo' alt="USDA Forest Service icon" src="./src/assets/images/logos_usda-fs_bn-dk-01.svg">
        
       
        
    </div>
    <div style ='float:left;'>
        <ul class="intro-list">
          <li title = "The Geospatial Technology and Applications Center (GTAC) provides leadership in geospatial science implementation in the USDA Forest Service by delivering vital services, data products, tools, training, and innovation to solve today's land and resource management challenges. This Explorer was developed at GTAC."><a class="intro-modal-links" href="https://www.fs.usda.gov/about-agency/gtac" target="_blank">GTAC</a> Geospatial Technology and Applications Center
          </li>
          
         
            <li title = 'RedCastle Resources Inc. is the on-site contractor that has provided the technical expertise for adapting the original workflow from the SRS and developing this Viewer.'><a class="intro-modal-links" href="https://www.redcastleresources.com/" target="_blank">RCR</a> RedCastle Resources Inc.
            </li>
          <li title = 'This site utilizes Google Earth Engine for most of its data acqusition, processing, and visualization through an enterprise agreement between the USDA Forest Service and Google.'><a class="intro-modal-links" href="https://earthengine.google.com/" target="_blank">GEE</a> Google Earth Engine
          </li>
          <li title = 'TreeMap 2016 Research Dataset source data.'><a class="intro-modal-links" href="https://data.nal.usda.gov/dataset/treemap-2016-tree-level-model-forests-conterminous-united-states-circa-2016" target="_blank">RDS</a> Original TreeMap 2016 Research Dataset
          </li>
          <li title = "The Raster Data Gateway (RDG) is the location for TreeMap attribute downloads."><a class="intro-modal-links" href="https://staging-data.fs.usda.gov/geodata/rastergateway/treemap/index.php" target="_blank">RDG</a> Download TreeMap data on the Raster Data Gateway
          </li>
          <li title = "View TreeMap v2016 in the Google Earth Engine Data Catalog."><a class = 'intro-modal-links' href="https://developers.google.com/earth-engine/datasets/catalog/USFS_GTAC_TreeMap_v2016" target="_blank">GEE Catalog</a> View and use TreeMap data alongside hundreds of other datasets in Google Earth Engine
          </li>
        </ul>
        
    </div>
    <div class ='my-3'>
                            <a class="intro-modal-links" onclick="startTour()" title="Click to take a tour of the ${mode}'s features">TOUR</a>
                            <a class="intro-modal-links" href="https://academic.oup.com/jof/article/120/6/607/6701541" target="_blank" title="Open 2016 TreeMap documentation">METHODS</a>
                            <a class = "intro-modal-links" title = "Send us an E-mail" href = "mailto: sm.fs.treemaphelp@usda.gov" >HELPDESK/FEEDBACK</a> 
                        </div>

</div>`,
      `<p>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>

`
    ),
  },
  loadingModal: {
    all: function (
      logoPath,
      word,
      whatIsLoading = "map services within Google Earth Engine"
    ) {
      let logoLine = `<img class = 'logo' src="./src/assets/images/${logoPath}"   alt="${mode} logo image">`;
      if (logoPath === "" || logoPath === null || logoPath === undefined) {
        logoLine = ``;
      }
      return `<span>
                                                           ${logoLine} 
                                                            <h2 id = 'intro-modal-title-banner' title="" class = 'splash-title' style="font-weight:100;font-family: 'Roboto';">${topBannerParams.leftWords}<span  style="font-weight:1000;font-family: 'Roboto Black', sans-serif;"> ${topBannerParams.centerWords} </span> ${topBannerParams.rightWords}</h2>
                                                        </span>

                            

                        <p style = 'margin-top:1rem;'>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>
                <p style='font-weight:bold;margin-top:1rem;' title='Creating map services within Google Earth Engine. This can take some time. Thank you for your patience!'>
                  <img style="width:2.1em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="./src/assets/images/GEE_logo_transparent.png">
                    ${word} ${whatIsLoading}. This can take some time.
                  
                 </p>
                  `;
    },
    geeViz: `
                <p>
                  <img style="width:2.1em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="./src/assets/images/GEE_logo_transparent.png">
                    Creating map services within Google Earth Engine. 
                  <br>
                   <img style="width:2.1em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="./src/assets/images/GEE_logo_transparent.png">
                    This can take some time. Thank you for your patience!
                   <div id = 'loading-number-box'></div>
                 </p>
                  `,
  },
  bottomBar: `<footer class = 'bottombar'  id = 'bottombar' >
        			<span class = 'px-1'  id='current-tool-selection' title="Any tool that is currently active is shown here."></span>
        			<span id = 'gee-queue-len' class = 'px-1' style="display:none;" title="All map layers are dynamically requested from Google Earth Engine.  The number of outstanding requests is shown here.">Queue length for maps from GEE: <span id='outstanding-gee-requests'>0</span></span>
                    <span class = 'px-1' title="The number of outstanding map layers currently loading tiles.">Number of map layers loading: <span id='number-gee-tiles-downloading'>0</span></span>
                    <span title="Current location and elevation of mouse pointer and map zoom level and respective map scale" class = 'px-1'  id='current-mouse-position'  ></span>
                    <span id = 'usda-notices' > <a href="https://earthengine.google.com/" target="_blank">
                      <a href="https://www.usda.gov/privacy-policy/" class='links-bottombar' target="_blank">
                      Privacy Policy
                      </a>
                      <a href="https://www.usda.gov/accessibility-statement/" class='links-bottombar' target="_blank">
                      Accessibility Statement
                      </a>
                      <a href="https://www.fs.usda.gov/about-agency/disclaimers-important-notices" class='links-bottombar' target="_blank">
                      Disclaimers
                      </a>
                    </span>
                    <span id = 'contributor-logos' style='display:none;'> 
                        <a href="https://earthengine.google.com/" target="_blank">
                            <img src="./src/assets/images/GEE.png"   class = 'image-icon-bar' alt="Powered by Google Earth Engine"  href="#" title="Click to learn more about Google Earth Engine">
                        </a>
                        <a href="https://www.fs.usda.gov/" target="_blank">
                            <img src="./src/assets/images/usfslogo.png" class = 'image-icon-bar'  href="#"  alt= "USDA Forest Service logo" title="Click to learn more about the US Forest Service">
                        </a>
                        <a href="http://www.usda.gov" target="_blank">
                            <img src="./src/assets/images/usdalogo.png" class = 'image-icon-bar'  href="#"   alt= "USDA logo" title="Click to learn more about the USDA">
                        </a>
                    </span>
                </footer>`,
  dashboardResultsDiv: `<div class = 'dashboard-results-container' id = 'dashboard-results-container' style='display:none;'>
                                <div id ='dashboard-results-expander' title='Click and drag up and down to resize charts'></div>
                                <div id='dashboard-results-div22' class='bg-black dashboard-results'></div>
                            </div>`,
  dashboardHighlightsDisclaimerText: `LCMS Dashboard Disclaimer: All summary numbers are based on modeled LCMS outputs. These tables are useful for understanding broad patterns of change on our landscape. Known as model-based inference, error margins are difficult to compute directly from the summary pixel counts. Currently, error margins are calculated from the LCMS reference sample for each year from each summary area, plus a 210km buffer. This assumes the statistical properties of the model-based and reference sample-based estimates are similar. Since this assumption is difficult to uphold, this method is still under scientific review. For details on valid statistical conclusions and understanding map error, please refer to the LCMS methods document or reach out to the LCMS HELPDESK (sm.fs.lcms@usda.gov)`,
  dashboardResultsContainer: `<div id='dashboard-results-container-right' class='dashboard-highlights bg-black  col-md-6 col-lg-4 '>
        
        <div id = 'dashboard-download-button-container'>
            <button class='dashboard-download-button ' id='dashboard-download-button' onclick='makeDashboardReport()' title='Click to download PDF report containing the summaries currently being displayed.' >
                    <i class="fa fa-download dashboard-download-icon" aria-hidden="true"></i>
                    Download Report
            </button>
        </div>
        
        <div id = 'dashboard-results-list'></div>                            
                                    </div>`,
  dashboardResultsToggler: `<img  title = 'Click to toggle results pane visibility' id = 'dashboard-results-sidebar-toggler' class='dashboard-results-toggler' src='./src/assets/images/menu-hamburger_ffffff.svg' onclick = 'toggleHighlights()' >`,
  dashboardHighlightsContainer: `<div id='highlights-tables-container'>
        <ul class="nav nav-tabs px-2 highlights-table-tabs"  role="tablist" id='highlights-table-tabs'></ul>
        <div class="tab-content" id="highlights-table-divs"></div>
        <div id ='highlights-disclaimer-div' >
        <p class = 'highlights-disclaimer'>Disclaimer: All summary numbers are based on modeled LCMS outputs. These tables are useful for understanding broad patterns of change on our landscape. Known as model-based inference, error margins are difficult to compute directly from the summary pixel counts. Currently, error margins are calculated from the LCMS reference sample for each year from each summary area, plus a 210km buffer. This assumes the statistical properties of the model-based and reference sample-based estimates are similar. Since this assumption is difficult to uphold, this method is still under scientific review. For details on valid statistical conclusions and understanding map error, please refer to the <a class="teal" onclick="downloadMethods('v2023-9')" title="Open in-depth LCMS v2023.9 methods documentation">LCMS METHODS</a> document or reach out to the <a class = "teal" title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov" >LCMS HELPDESK</a>.
    </p></div>
    </div>`,
  dashboardHighlightsDiv: `<div id='dashboard-highlights-container' class='dashboard-highlights bg-black col-sm-7 col-md-4 col-xl-3'>
        <img style='height:3rem;' title = 'Click to toggle highlights visibility' id = 'dashboard-results-sidebar-toggler' class='sidebar-toggler' src='./src/assets/images/menu-hamburger_ffffff.svg' onclick = 'toggleHighlights()' >
        <p class='highlights-title highlights-div' style='' title = 'As you move the map around, summary areas that are visible will be ranked according to classes selected within the PARAMETERS menu'>Change Highlights</p>
        <div class='dashboard-download-div' id = 'download-dashboard-report-container' title='Click to download charts and tables in a single pdf report.'>
        <button class='btn dashboard-download-button' id='dashboard-download-button' onclick='makeDashboardReport()' >
          <i class="fa fa-download dashboard-download-icon" aria-hidden="true"></i>
          Download Report
          
        </button>
        
        
      </div>
      <div id = 'dashboard-results-div'>
        </div>
        <div id='highlights-tables-container'>
            <ul class="nav nav-tabs px-2 highlights-table-tabs"  role="tablist" id='highlights-table-tabs'></ul>
            <div class="tab-content" id="highlights-table-divs"></div>
            <p class = 'highlights-disclaimer'>Disclaimer: All summary numbers are based on modeled LCMS outputs. These tables are useful for understanding broad patterns of change on our landscape. Known as model-based inference, error margins are difficult to compute directly from the summary pixel counts. Currently, error margins are calculated from the LCMS reference sample for each year from each summary area, plus a 210km buffer. This assumes the statistical properties of the model-based and reference sample-based estimates are similar. Since this assumption is difficult to uphold, this method is still under scientific review. For details on valid statistical conclusions and understanding map error, please refer to the <a class="teal" onclick="downloadMethods('v2023-9')" title="Open in-depth LCMS v2023.9 methods documentation">LCMS METHODS</a> document or reach out to the <a class = "teal" title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov" >LCMS HELPDESK</a>.
            </p>
        </div>
        `,
  dashboardProgressDiv: `<div id = 'dashboard-progress-container' class='ml-3'>
        <span  style = 'display: flex;'>
        <img id = 'loading-spinner-logo' class = 'fa-spin progress-spinner' style='display:none;' src="./src/assets/images/GEE_logo_transparent.png" height="${convertRemToPixels(
          0.8
        )}"  alt="GEE logo image">
        
        <div class="progressbar progress-pulse" id='highlights-progressbar' class = 'px-2' title='Percent of summary areas that have finished downloading LCMS summary data'>
            <span  style="width: 0%;">0%</span>
        </div>
        <i  onclick='clearAllSelectedDashboardFeatures()' id='erase-all-dashboard-selected' title="Click to clear all selected features from this layer" class="fa fa-eraser eraser-all" ></i>
        
        </span>
        
        
        
        </div>`,
  //     dashboardDownloadReportButton:`<div class='dashboard-download-div' id = 'download-dashboard-report-container' title='Click to download charts and tables in a single pdf report.'>
  //     <button class='btn dashboard-download-button' id='dashboard-download-button' onclick='makeDashboardReport()' >
  //       <i class="fa fa-download dashboard-download-icon" aria-hidden="true"></i>
  //       Download Report

  //     </button>

  //   </div>
  //  `,
  walkThroughPopup: `<div class = 'walk-through-popup'>
                            <div id = 'walk-through-popup-content' class = 'walk-through-popup-content'></div>
	                       		<hr>
		                        <div class="icon-bar py-1 ">
								  <a onclick = 'previousWalkThrough()' title = 'Previous tutorial slide'><i class="fa fa-chevron-left text-black"></i></a>
								  <a onclick = 'nextWalkThrough()'  title = 'Next tutorial slide'><i class="fa fa-chevron-right text-black"></i></a>
								  <a id = 'walk-through-popup-progress'></a>
                                  <a onclick = 'removeWalkThroughCollapse()' style = 'float:right;'  title = 'Turn off Walk-Through'><i class="fa fa-stop text-black" aria-hidden="true"></i></a>
                                </div>
						</div>`,
  studyAreaDropdownButtonEnabledTooltip: `Choose your study area`,
  studyAreaDropdownButtonDisabledTooltip: `Still waiting on previous map layer requests. Can change study area once the previous requests are finished.`,
  reRunButtonEnabledTooltip: `Once finished changing parameters, press this button to refresh map layers`,
  reRunButtonDisabledTooltip: `Still waiting on previous map layer requests. Can re-submit once the previous requests are finished.`,
  reRunButton: `<button id = 'reRun-button' onclick = 'reRun()' class = 'btn   ' title="">Submit</button>`,
  addTimelapsesButton: `<button id = 'addTimelapses-button' onclick = 'addLCMSTimeLapses()' class = 'mb-1 ml-1 btn ' title="Add interactive time lapse of LCMS Change and Land Cover products. This will slow down the map loading">Add LCMS Time Lapses To Map</button>`,
  downloadDiv: `<div class = 'py-2'>
                        <a id = 'product-descriptions' target = '_blank'>Detailed Product Description</a>
        				<hr>
                        <label  title = 'Choose from dropdown below to download LCMS products. There can be a small delay before a download will begin, especially over slower networks.' for="downloadDropdown">Select product to download:</label>
    					<select class="form-control" id = "downloadDropdown" onchange = "downloadSelectedArea()""></select>
    				 </div>`,
  lcmsProductionDownloadDiv: `<ul id="downloadTree" class = 'pl-0 mb-0' title = 'Click through available LCMS products. Select which outputs to download, and then click the download button. Hold ctrl key to select multiples or shift to select blocks.'>
                                          <li class = 'pl-0'><span class="caret caret-down">Conterminous United States (v2023.9)</span>
                                            <ul class="nested active">
                                              <li><span class="caret">Change</span>
                                                <ul class="nested">
                                                  <li><span class="caret" title = 'Single layer summaries of what year change was mapped by LCMS serve as the foundational LCMS product that is easiest to work with in your local GIS. These are the same as the Slow Loss, Fast Loss, and Gain Year layers in the viewer.'>Summary</span>
                                                    <ul class="nested" id = 'CONUS-change-summary-downloads'></ul>
                                                  </li>
                                                  <li><span class="caret" title = 'Annual change layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the change time lapse.'>Annual</span>
                                                    <ul class="nested" id = 'CONUS-change-annual-downloads'></ul>
                                                  </li>
                                                </ul>
                                              </li>
                                              <li><span class="caret" title = 'Annual land cover layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the land cover time lapse.'>Land Cover</span>
                                                <ul class="nested" id = 'CONUS-land_cover-annual-downloads'></ul>
                                              </li>
                                              <li><span class="caret" title = 'Annual land use layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the land use time lapse.'>Land Use</span>
                                                <ul class="nested" id = 'CONUS-land_use-annual-downloads'></ul>
                                              </li>
                                              <li><span class="caret" title = 'Annual QA-bits depict ancillary information about the origin of the data used to produce LCMS products.'>QA Bits</span>
                                                <ul class="nested" id = 'CONUS-qa_bits-annual-downloads'></ul>
                                              </li>
                                            </ul>
                                          </li>
                                          <li><span class="caret caret-down">Southeastern Alaska (v2023.9)</span>
                                            <ul class="nested active">
                                              <li><span class="caret">Change</span>
                                                <ul class="nested">
                                                  <li><span class="caret" title = 'Single layer summaries of what year change was mapped by LCMS serve as the foundational LCMS product that is easiest to work with in your local GIS. These are the same as the Slow Loss, Fast Loss, and Gain Year layers in the viewer.'>Summary</span>
                                                    <ul class="nested" id = 'SEAK-change-summary-downloads'></ul>
                                                  </li>
                                                  <li><span class="caret" title = 'Annual change layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the change time lapse.'>Annual</span>
                                                    <ul class="nested" id = 'SEAK-change-annual-downloads'></ul>
                                                  </li>
                                                </ul>
                                              </li>
                                              <li><span class="caret" title = 'Annual land cover layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the land cover time lapse.'>Land Cover</span>
                                                <ul class="nested" id = 'SEAK-land_cover-annual-downloads'></ul>
                                              </li>
                                              <li><span class="caret" title = 'Annual land use layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the land use time lapse.'>Land Use</span>
                                                <ul class="nested" id = 'SEAK-land_use-annual-downloads'></ul>
                                              </li>
                                              <li><span class="caret" title = 'Annual QA-bits depict ancillary information about the origin of the data used to produce LCMS products.'>QA Bits</span>
                                                <ul class="nested" id = 'SEAK-qa_bits-annual-downloads'></ul>
                                              </li>
                                            </ul>
                                          </li>
                                          <li><span class="caret caret-down">Puerto Rico - US Virgin Islands (v2022.8)</span>
                                            <ul class="nested active">
                                              <li><span class="caret">Change</span>
                                                <ul class="nested">
                                                  <li><span class="caret" title = 'Single layer summaries of what year change was mapped by LCMS serve as the foundational LCMS product that is easiest to work with in your local GIS. These are the same as the Fast Loss, and Gain Year layers in the viewer.'>Summary</span>
                                                    <ul class="nested" id = 'PRUSVI-change-summary-downloads'></ul>
                                                  </li>
                                                  <li><span class="caret" title = 'Annual change layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the change time lapse.'>Annual</span>
                                                    <ul class="nested" id = 'PRUSVI-change-annual-downloads'></ul>
                                                  </li>
                                                </ul>
                                              </li>
                                              <li><span class="caret" title = 'Annual land cover layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the land cover time lapse.'>Land Cover</span>
                                                <ul class="nested" id = 'PRUSVI-land_cover-annual-downloads'></ul>
                                              </li>
                                              <li><span class="caret" title = 'Annual land use layers provide a more flexible product that can suite more customized data analysis. These are the same as the layers shown in the land use time lapse.'>Land Use</span>
                                                <ul class="nested" id = 'PRUSVI-land_use-annual-downloads'></ul>
                                              </li>
                                            </ul>
                                          </li>
                                        </ul>`,
  TreeMapGEEClippingDiv: `<h5 class='pt-2' style='border-top: 0.1em solid black;'>Data Clipping</h5>
                            <div class=" px-0 py-0 sub-sub-panel-title-collapsed ">
                              <a class = 'links' href="https://code.earthengine.google.com/6a10868aa172b8082a0d11bc0c54ea8c" target="_blank" title="Use a Google Earth Engine script template to download attributes clipped to polygon of interest.">
                                Clip and download data with Google Earth Engine
                              </a>
                            </div>`,
  TreeMapDownloadDiv: `<h5 class='pt-2'>CONUS Datasets</h5>
                      <ul id="downloadTree" class="pl-0 mb-0" title="Click through available TreeMap products. Select which outputs to download, and then click the download button. Hold ctrl key to select multiples or shift to select blocks.">
                                        <li class="pl-0"><span class="caret caret-down">2016</span>
                                          <ul class="nested active">
                                            <li><span class="caret" title="Download individual attributes of TreeMap.">Individual Attributes</span>
                                              <ul class="nested" id="TreeMap2016-attribute-downloads"></ul>
                                            </li>
                                            <li><span class="caret" title="Download the full TreeMap RDS.">RDS</span>
                                              <ul class="nested" id="TreeMap2016-rds-downloads"></ul>
                                            </li>
                                          </ul>
                                        </li>
                                    </ul>`,
  TreeMapSupportDiv: `<div  class = 'py-2 pl-3 pr-1'>
                                <header class = 'row'>
                                    <h3 class = ' text-capitalize'>TreeMap Resources</h3>
                                </header>
                                <section class = 'row'>
                                    <div class = 'col-lg-2 p-0 m-0'>
                                        <img src="./src/assets/images/information--v2.png" class = 'support-icons' alt="Other Resources icon"  href="#" title="Explore additional ways to access TreeMap.">
                                        </a>
                                    </div>
                                    <div class = 'col-lg-10'>
                                        <li>
                                            <a class = 'links' href='https://www.fs.usda.gov/research/treesearch/65597' target="_blank" title = 'View the TreeMap 2016 publication.'>2016 Publication</a>
                                        </li>
                                        <li>
                                            <a class = 'links' href='https://data.fs.usda.gov/geodata/rastergateway/treemap/index.php'  target="_blank" title = 'Get an overview of TreeMap data, download attributes, and browse additional documentation.'>Raster Data Gateway</a>
                                        </li>
                                        <li>
                                            <a class = 'links' href='https://developers.google.com/earth-engine/datasets/catalog/USFS_GTAC_TreeMap_v2016'  target="_blank" title = 'View and use TreeMap data in Google Earth Engine alongside hundreds of other datasets.'>Google Earth Engine</a>
                                        </li>
                                    </div>
                                </section>
                                <hr>
                                 <header class = 'row ' title = 'Open in-depth TreeMap methods documentation.'>
                                    <h3 class = ' text-capitalize'>TreeMap Methods</h3>
                                </header>
                                <div class = 'row ' title = 'Open in-depth TreeMap methods documentation.'>
                                    <div class = 'col-lg-2 p-0 m-0'>
                                        <img class = 'support-icons' alt = 'Methods icon' src = './src/assets/images/methods-icon.png'></a> 
                                    </div>
                                    <div class = 'col-lg-10'>
                                        Click to open in-depth methods document:
                                        <li>
                                            <a class = 'links' href='https://www.fs.usda.gov/rm/pubs_journals/2022/rmrs_2022_riley_k002.pdf' target="_blank" title = 'Open in-depth TreeMap methods documentation.'>Version 2016</a>
                                        </li> 
                                    </div>
                                </div>
                                <hr>
                                <header class = 'row'>
                                    <h3 class = ' text-capitalize'>Acknowledgements</h3>
                                </header>
                                <section class = 'row'>
                                    <div class = 'col-lg-2 p-0 m-0'>
                                        <a href="https://www.fs.usda.gov/about-agency/gtac" target="_blank">
                                        <img src="./src/assets/images/GTAC_Logo.png" class = 'support-icons' alt="GTAC Logo"  href="#" alt = "Geospatial Technology and Applications Center logo" title="Click to learn more about the Geospatial Technology and Applications Center (GTAC).">
                                        </a>
                                    </div>
                                    <div class = 'col-lg-10'>
                                        <a href="https://www.fs.usda.gov/about-agency/gtac" target="_blank">
                                            <p class = 'support-text'>The Geospatial Technology and Applications Center (GTAC) provides leadership in geospatial science implementation in the USDA Forest Service by delivering vital services, data products, tools, training, and innovation to solve today's land and resource management challenges. Operational TreeMap production and support takes place at GTAC.</p>
                                        </a>
                                    </div>
                                </section>
                                <hr>
                                <section class = 'row '>
                                    <div class = 'col-lg-2 p-0 m-0'>
                                        <a href="https://www.redcastleresources.com/" target="_blank">
                                            <img src="./src/assets/images/RCR-logo.jpg"  class = 'support-icons' alt="RedCastle Inc. Logo"  href="#"   title="Click to learn more about RedCastle Resources Inc."> 
                                        </a>
                                    </div>
                                    <div class = 'col-lg-10'>
                                        <a href="https://www.redcastleresources.com/" target="_blank">
                                            <p class = 'support-text'>RedCastle Resources Inc. is the on-site contractor that has provided the technical expertise for TreeMap's operational production, documentation, and delivery at GTAC.</p>
                                        </a>
                                    </div>
                                </section>
                                <hr>
                                <section class = 'row '>
                                    <div class = 'col-lg-2 p-0 m-0'>
                                        <a href="https://www.fs.usda.gov/rmrs/" target="_blank">
                                        <img src="./src/assets/images/usfslogo.png" class = 'support-icons' alt="U.S. Department of Agriculture, Forest Service Logo"  href="#"  title="Click to learn more about the Rocky Mountain Research Station (RMRS)">
                                        </a>
                                    </div>
                                    <div class = 'col-lg-10'>
                                        <a href="https://www.fs.usda.gov/rmrs/" target="_blank">
                                            <p class = 'support-text'>The Rocky Mountain Research Station provides the scientific foundation TreeMap is built upon. They have been instrumental in developing and publishing the original TreeMap methodology and continue to provide ongoing research and development to further improve TreeMap methods.</p>
                                        </a>
                                    </div>
                                </section>
                                
                                <hr>
                                <section class = 'row'>
                                    <div class = 'col-lg-2 p-0 m-0'>
                                        <a href="https://earthengine.google.com/" target="_blank">
                                            <img src="./src/assets/images/GEE_logo_transparent.png"  class = 'support-icons' alt="Google Earth Engine Logo"  href="#"   title="Click to learn more about Google Earth Engine">
                                            
                                        </a>
                                    </div>
                                    <div class = 'col-lg-10'>
                                        <a href="https://earthengine.google.com/" target="_blank">
                                            <p class = 'support-text'>TreeMap utilizes Google Earth Engine for visualization through an enterprise agreement between the USDA Forest Service and Google.</p>
                                        </a>
                                    </div>
                                </section>
                                <hr>
                                <section class = 'row'>
                                    <div class = 'col-lg-2 p-0 m-0'>
                                        <h2>"..."</h2>
                                    </div>
                                    <div class = 'col-lg-10  support-text'>
                                            Suggested citation: 
                                            <p class = 'support-text' onclick = 'copyText("suggested-citation-text","copiedCitationMessageBox")' id = 'suggested-citation-text' title='Click to copy suggested citation to clipboard'>Forest Service, U.S. Department of Agriculture (2024). TreeMap Data Explorer [Online]. Available at: https://apps.fs.usda.gov/lcms-viewer/treemap.html (Accessed: ${new Date().toStringFormat()}).
                                            </p>
                                            <span>
                                                <button onclick = 'copyText("suggested-citation-text","copiedCitationMessageBox")'' title = 'Click to copy suggested citation to clipboard' class="py-0 pr-1 fa fa-copy btn input-group-text bg-white" >
                                                </button>
                                                <p id = 'copiedCitationMessageBox'></p>
                                            </span>
                                    </div>
                                </section>
                                <hr>
                                <header class ='row'>
                                    <h3 class ='text-capitalize'>Contact</h3>
                                </header>
                                <section class = 'row '>
                                    <div class = 'col-lg-2 p-0 m-0'>
                                        <a title = "Send us an E-mail" href = "mailto: sm.fs.treemaphelp@usda.gov"><img class = 'support-icons' alt = 'Email icon' src = './src/assets/images/email.png'></a> 
                                    </div>
                                    <div class = 'col-lg-10'>
                                        <a class = 'support-text' title = "Send us an E-mail" href = "mailto: sm.fs.treemaphelp@usda.gov">
                                        Please contact the TreeMap help desk <span href = "mailto: sm.fs.treemaphelp@usda.gov">(sm.fs.treemaphelp@usda.gov)</span> if you have questions/comments about TreeMap or have feedback on the TreeMap Data Explorer.</a>
                                    </div>
                                </section>
                      </div>`,
  sequoiaSupportDiv: `<div  class = 'py-2 pl-3 pr-1'>
                        <header class = 'row ' title = 'Open Giant Sequoia Viewer tutorial'>
                            <h3 class = ' text-capitalize'>Tutorial</h3>
                        </header>
                        <div class = 'row ' onclick="startTour()" id="tutorialLink" title="Click to launch a tutorial that explains how to use the Giant Sequoia Viewer">
                            <div class = 'col-lg-2 p-0 m-0'>
                                <img class = 'support-icons' alt = 'Information icon' src = './src/assets/images/information--v2.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                            <a class="intro-modal-links" onclick="startTour()" id="tutorialLink" title="Click to launch a tutorial that explains how to use the Giant Sequoia Viewer">Giant Sequoia View TUTORIAL</a>
                            </div>
                        </div>
                        <hr>`,
  hiformSupportDiv: `<div  class = 'py-2 pl-3 pr-1'>
                      <header class = 'row ' title = 'Open HiForm-BMP tutorial'>
                          <h3 class = ' text-capitalize'>Tutorial</h3>
                      </header>
                      <div class = 'row ' onclick="startTour()" id="tutorialLink" title="Click to launch a tutorial that explains how to use the Giant Sequoia Viewer">
                          <div class = 'col-lg-2 p-0 m-0'>
                              <img class = 'support-icons' alt = 'Information icon' src = './src/assets/images/information--v2.png'></a> 
                          </div>
                          <div class = 'col-lg-10'>
                          <a class="intro-modal-links" onclick="startTour()" id="tutorialLink" title="Click to launch a tutorial that explains how to use the HiForm-BMP Tool">HiForm-BMP TUTORIAL</a>
                          </div>
                      </div>
                      <hr>
                      
                        <header class = 'row'>
                            <h3 class = ' text-capitalize'>Acknowledgements</h3>
                        </header>
                        <section class = 'row '>
                        <div class = 'col-lg-2 p-0 m-0'>
                            <a href="https://hiform.org/" target="_blank">
                            <img src="./src/assets/images/hiform-logo.png" class = 'support-icons' alt="U.S. Department of Agriculture, Forest Service Logo"  href="#"  title="Click to learn more about HiForm">
                            </a>
                        </div>
                        <div class = 'col-lg-10'>
                            <a href="https://hiform.org/" target="_blank">
                                <p class = 'support-text'>The Southern Research Station provides the scientific foundation, original workflow, and user community of HiForm-BMP.</p>
                            </a>
                        </div>
                    </section>
                    
                    <hr>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://www.fs.usda.gov/about-agency/gtac" target="_blank">
                                <img src="./src/assets/images/GTAC_Logo.png" class = 'support-icons' alt="GTAC Logo"  href="#" alt = "Geospatial Technology and Applications Center logo" title="Click to learn more about the Geospatial Technology and Applications Center (GTAC)">
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://www.fs.usda.gov/about-agency/gtac" target="_blank">
                                    <p class = 'support-text'>The Geospatial Technology and Applications Center (GTAC) provides leadership in geospatial science implementation in the USDA Forest Service by delivering vital services, data products, tools, training, and innovation to solve today's land and resource management challenges. All operational support for this tool takes place at GTAC.</p>
                                </a>
                            </div>
                        </section>
                        <hr>
                        <section class = 'row '>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://www.redcastleresources.com/" target="_blank">
                                    <img src="./src/assets/images/RCR-logo.jpg"  class = 'support-icons' alt="RedCastle Inc. Logo"  href="#"   title="Click to learn more about RedCastle Resources Inc."> 
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://www.redcastleresources.com/" target="_blank">
                                    <p class = 'support-text'>RedCastle Resources Inc. is the on-site contractor that has provided the technical expertise for the adaptation of the original HiForm-BMP workflow to this interface and delivery at GTAC.</p>
                                </a>
                            </div>
                        </section>
                        <hr>
                      
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://earthengine.google.com/" target="_blank">
                                    <img src="./src/assets/images/GEE_logo_transparent.png"  class = 'support-icons' alt="Google Earth Engine Logo"  href="#"   title="Click to learn more about Google Earth Engine">
                                    
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://earthengine.google.com/" target="_blank">
                                    <p class = 'support-text'>HiForm-BMP utilizes Google Earth Engine for its data acqusition, processing, and visualization, through an enterprise agreement between the USDA Forest Service and Google.</p>
                                </a>
                            </div>
                        </section>
                        <hr>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <h2>"..."</h2>
                            </div>
                            <div class = 'col-lg-10  support-text'>
                                    Suggested citation: 
                                    <p class = 'support-text' onclick = 'copyText("suggested-citation-text","copiedCitationMessageBox")' id = 'suggested-citation-text' title='Click to copy suggested citation to clipboard'>Forest Service, U.S. Department of Agriculture (2024). HiForm Timber Harvest BMP Tool[Online]. Available at: https://apps.fs.usda.gov/lcms-viewer/hiform-bmp.html (Accessed: ${new Date().toStringFormat()}).
                                    </p>
                                    <span>
                                        <button onclick = 'copyText("suggested-citation-text","copiedCitationMessageBox")'' title = 'Click to copy suggested citation to clipboard' class="py-0 pr-1 fa fa-copy btn input-group-text bg-white" >
                                        </button>
                                        <p id = 'copiedCitationMessageBox'></p>
                                    </span>
                            </div>
                        </section>
                        <hr>
                                <header class ='row'>
                                    <h3 class ='text-capitalize'>Contact</h3>
                                </header>
                                <section class = 'row '>
                                    <div class = 'col-lg-2 p-0 m-0'>
                                        <img class = 'support-icons' alt = 'Email icon' src = './src/assets/images/hiform-logo.png'>
                                    </div>
                                    <div class = 'col-lg-10'>
                                      <p>Please send questions to:</p>
                                      <p>Steve Norman, Research Ecologist (steven.norman@usda.gov)</p>
                                    
                                    Bill Christie, Remote Sensing / Geospatial Analyst (william.m.christie@usda.gov)
                                    </div>
                                </section>`,
  supportDiv: `<div  class = 'py-2 pl-3 pr-1'>
                        <header class = 'row ' title = 'Open LCMS Data Explorer tutorial'>
                            <h3 class = ' text-capitalize'>Tutorial</h3>
                        </header>
                        <div class = 'row ' title = 'Open LCMS Data Explorer tutorial'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <img class = 'support-icons' alt = 'Information icon' src = './src/assets/images/information--v2.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                                <a id = 'tutorial-download' class = 'links' onclick = 'downloadTutorial()'>
                                Click to launch a tutorial that explains how to utilize the Data Explorer</a>
                            </div>
                        </div>
                        <hr>
                        
                        <header class = 'row ' title = 'Click to help us learn how you use LCMS and how we can make it better'>
                        <h3 class = ' text-capitalize'>LCMS Survey</h3>
                    </header>
                    <div class = 'row ' title = 'Click to help us learn how you use LCMS and how we can make it better'>
                        <div class = 'col-lg-2 p-0 m-0'>
                            <img class = 'support-icons' alt = 'Methods icon' src = './src/assets/Icons_svg/documentation_372e2c.svg'></a> 
                        </div>
                        <div class = 'col-lg-10'>
                            Click to open the LCMS Survey:
                            <li>
                            <a  class = 'intro-modal-links'  onclick = 'openLCMSSurvey("supportMenu")' title="Click to help us learn how you use LCMS and how we can make it better">SURVEY</a>
                            </li>
                             
                        </div>
                    </div>
                    <hr>
                         <header class = 'row ' title = 'Open in-depth LCMS methods documentation'>
                            <h3 class = ' text-capitalize'>LCMS Methods</h3>
                        </header>
                        <div class = 'row ' title = 'Open in-depth LCMS methods documentation'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <img class = 'support-icons' alt = 'Methods icon' src = './src/assets/images/methods-icon.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                                Click to open in-depth methods document:
                                <li>
                                    <a class = 'links' onclick = 'downloadMethods("v2023-9")' title = 'Open in-depth LCMS v2023.9 methods documentation'>Version 2023.9 (CONUS and SEAK)</a>
                                </li>
                                <li>
                                    <a class = 'links' onclick = 'downloadMethods("v2022-8")' title = 'Open in-depth LCMS v2022.8 methods documentation'>Version 2022.8 (PRUSVI)</a>
                                </li>   
                            </div>
                        </div>
                        <hr>
                        <header class = 'row'>
                            <h3 class = ' text-capitalize' title = "In addition to this viewer, the LCMS Homepage provides an overview of LCMS and links to other viewers to help visualize and explore other aspects of the LCMS data flow">LCMS Homepage</h3>
                        </header>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a title = "In addition to this viewer, the LCMS Homepage provides an overview of LCMS and links to other viewers to help visualize and explore other aspects of the LCMS data flow" ><img class = 'support-icons' alt = 'Email icon' src = './src/assets/images/lcms-icon.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                                <li>
                                    <a class = 'links' title = "An overview of LCMS" href = "home.html" target="_blank">Introduction</a>
                                </li>
                                <li>
                                    <a class = 'links' title = "Other LCMS Explorers" href = "home.html#data-explorer" target="_blank">Other Data Explorers</a>
                                </li>
                            </div>
                        </section>
                        <hr>
                        <header class = 'row'>
                            <h3 class = ' text-capitalize'>Acknowledgements</h3>
                        </header>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://www.fs.usda.gov/about-agency/gtac" target="_blank">
                                <img src="./src/assets/images/GTAC_Logo.png" class = 'support-icons' alt="GTAC Logo"  href="#" alt = "Geospatial Technology and Applications Center logo" title="Click to learn more about the Geospatial Technology and Applications Center (GTAC)">
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://www.fs.usda.gov/about-agency/gtac" target="_blank">
                                    <p class = 'support-text'>The Geospatial Technology and Applications Center (GTAC) provides leadership in geospatial science implementation in the USDA Forest Service by delivering vital services, data products, tools, training, and innovation to solve today's land and resource management challenges. All operational LCMS production and support takes place at GTAC.</p>
                                </a>
                            </div>
                        </section>
                        <hr>
                        <section class = 'row '>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://www.redcastleresources.com/" target="_blank">
                                    <img src="./src/assets/images/RCR-logo.jpg"  class = 'support-icons' alt="RedCastle Inc. Logo"  href="#"   title="Click to learn more about RedCastle Resources Inc."> 
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://www.redcastleresources.com/" target="_blank">
                                    <p class = 'support-text'>RedCastle Resources Inc. is the on-site contractor that has provided the technical expertise for LCMS' operational production, documentation, and delivery at GTAC.</p>
                                </a>
                            </div>
                        </section>
                        <hr>
                        <section class = 'row '>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://www.fs.usda.gov/rmrs/tools/landscape-change-monitoring-system-lcms" target="_blank">
                                <img src="./src/assets/images/usfslogo.png" class = 'support-icons' alt="U.S. Department of Agriculture, Forest Service Logo"  href="#"  title="Click to learn more about the Rocky Mountain Research Station (RMRS)">
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://www.fs.usda.gov/rmrs/tools/landscape-change-monitoring-system-lcms" target="_blank">
                                    <p class = 'support-text'>The Rocky Mountain Research Station provides the scientific foundation LCMS is built upon. They have been instrumental in developing and publishing the original LCMS methodology and continue to provide ongoing research and development to further improve LCMS methods.</p>
                                </a>
                            </div>
                        </section>
                        
                        <hr>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://earthengine.google.com/" target="_blank">
                                    <img src="./src/assets/images/GEE_logo_transparent.png"  class = 'support-icons' alt="Google Earth Engine Logo"  href="#"   title="Click to learn more about Google Earth Engine">
                                    
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://earthengine.google.com/" target="_blank">
                                    <p class = 'support-text'>LCMS utilizes Google Earth Engine for most of its data acqusition, processing, and visualization, through an enterprise agreement between the USDA Forest Service and Google. In its current form, LCMS would not be possible without Google Earth Engine.</p>
                                </a>
                            </div>
                        </section>
                        <hr>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <h2>"..."</h2>
                            </div>
                            <div class = 'col-lg-10  support-text'>
                                    Suggested citation: 
                                    <p class = 'support-text' onclick = 'copyText("suggested-citation-text","copiedCitationMessageBox")' id = 'suggested-citation-text' title='Click to copy suggested citation to clipboard'>Forest Service, U.S. Department of Agriculture (2024). Landscape Change Monitoring System Data Explorer [Online]. Available at: https://apps.fs.usda.gov/lcms-viewer (Accessed: ${new Date().toStringFormat()}).
                                    </p>
                                    <span>
                                        <button onclick = 'copyText("suggested-citation-text","copiedCitationMessageBox")'' title = 'Click to copy suggested citation to clipboard' class="py-0 pr-1 fa fa-copy btn input-group-text bg-white" >
                                        </button>
                                        <p id = 'copiedCitationMessageBox'></p>
                                    </span>
                            </div>
                        </section>
                        <hr>
                        <header class ='row'>
                            <h3 class ='text-capitalize'>Contact</h3>
                        </header>
                        <section class = 'row '>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov"><img class = 'support-icons' alt = 'Email icon' src = './src/assets/images/email.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                                <a class = 'support-text' title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov">
                                Please contact the LCMS help desk <span href = "mailto: sm.fs.lcms@usda.gov">(sm.fs.lcms@usda.gov)</span> if you have questions/comments about LCMS or have feedback on the LCMS Data Explorer.</a>
                            </div>
                        </section>
        			</div>`,
  supportDivDashboard: `<div  class = 'py-2 pl-3 pr-1'>
                        <header class = 'row ' title = 'Open LCMS Data Explorer tutorial'>
                            <h3 class = ' text-capitalize'>Tutorial</h3>
                        </header>
                        <div class = 'row ' onclick="startTour()" title="Click to take a tour of the LCMS Dashboard's features">
                            <div class = 'col-lg-2 p-0 m-0'>
                                <img class = 'support-icons' alt = 'Information icon' src = './src/assets/images/information--v2.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                            <a class="intro-modal-links" onclick="startTour()" title="Click to take a tour of the LCMS Dashboard's features">DASHBOARD TOUR</a>
                            </div>
                        </div>
                        <hr>
                                                
                        <header class = 'row ' title = 'Click to help us learn how you use LCMS and how we can make it better'>
                        <h3 class = ' text-capitalize'>LCMS Survey</h3>
                    </header>
                    <div class = 'row ' title = 'Click to help us learn how you use LCMS and how we can make it better'>
                        <div class = 'col-lg-2 p-0 m-0'>
                            <img class = 'support-icons' alt = 'Methods icon' src = './src/assets/Icons_svg/documentation_372e2c.svg'></a> 
                        </div>
                        <div class = 'col-lg-10'>
                            Click to open the LCMS Survey:
                            <li>
                            <a  class = 'intro-modal-links'  onclick = 'openLCMSSurvey("supportMenu")' title="Click to help us learn how you use LCMS and how we can make it better">SURVEY</a>
                            </li>
                             
                        </div>
                    </div>
                    <hr>
                         
                         <header class = 'row ' title = 'Open in-depth LCMS methods documentation'>
                            <h3 class = ' text-capitalize'>LCMS Methods</h3>
                        </header>
                        <div class = 'row ' title = 'Open in-depth LCMS methods documentation'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <img class = 'support-icons' alt = 'Methods icon' src = './src/assets/images/methods-icon.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                                Click to open in-depth methods document:
                                <li>
                                    <a class = 'links' onclick = 'downloadMethods("v2023-9")' title = 'Open in-depth LCMS v2023.9 methods documentation'>Version 2023.9 (CONUS and SEAK)</a>
                                </li>
                                <li>
                                    <a class = 'links' onclick = 'downloadMethods("v2022-8")' title = 'Open in-depth LCMS v2022.8 methods documentation'>Version 2022.8 (PRUSVI)</a>
                                </li>   
                            </div>
                        </div>
                        <hr>
                        <header class = 'row'>
                            <h3 class = ' text-capitalize' title = "In addition to this viewer, the LCMS Homepage provides an overview of LCMS and links to other viewers to help visualize and explore other aspects of the LCMS data flow">LCMS Homepage</h3>
                        </header>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a title = "In addition to this viewer, the LCMS Homepage provides an overview of LCMS and links to other viewers to help visualize and explore other aspects of the LCMS data flow" ><img class = 'support-icons' alt = 'LCMS icon' src = './src/assets/images/lcms-icon.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                            <li>
                                <a class = 'links' title = "An overview of LCMS" href = "home.html" target="_blank">Introduction</a>
                            </li>
                            <li>
                                <a class = 'links' title = "Other LCMS Explorers" href = "home.html#data-explorer" target="_blank">Other Data Explorers</a>
                            </li>
                            </div>
                        </section>
                        <hr>
                        <header class = 'row'>
                            <h3 class = ' text-capitalize'>Acknowledgements</h3>
                        </header>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://www.fs.usda.gov/about-agency/gtac" target="_blank">
                                <img src="./src/assets/images/GTAC_Logo.png" class = 'support-icons' alt="GTAC Logo"  href="#" alt = "Geospatial Technology and Applications Center logo" title="Click to learn more about the Geospatial Technology and Applications Center (GTAC)">
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://www.fs.usda.gov/about-agency/gtac" target="_blank">
                                    <p class = 'support-text'>The Geospatial Technology and Applications Center (GTAC) provides leadership in geospatial science implementation in the USDA Forest Service by delivering vital services, data products, tools, training, and innovation to solve today's land and resource management challenges. All operational LCMS production and support takes place at GTAC.</p>
                                </a>
                            </div>
                        </section>
                        <hr>
                        <section class = 'row '>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://www.redcastleresources.com/" target="_blank">
                                    <img src="./src/assets/images/RCR-logo.jpg"  class = 'support-icons' alt="RedCastle Inc. Logo"  href="#"   title="Click to learn more about RedCastle Resources Inc."> 
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://www.redcastleresources.com/" target="_blank">
                                    <p class = 'support-text'>RedCastle Resources Inc. is the on-site contractor that has provided the technical expertise for LCMS' operational production, documentation, and delivery at GTAC.</p>
                                </a>
                            </div>
                        </section>
                        <hr>
                        <section class = 'row '>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://www.fs.usda.gov/rmrs/tools/landscape-change-monitoring-system-lcms" target="_blank">
                                <img src="./src/assets/images/usfslogo.png" class = 'support-icons' alt="U.S. Department of Agriculture, Forest Service Logo"  href="#"  title="Click to learn more about the Rocky Mountain Research Station (RMRS)">
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://www.fs.usda.gov/rmrs/tools/landscape-change-monitoring-system-lcms" target="_blank">
                                    <p class = 'support-text'>The Rocky Mountain Research Station provides the scientific foundation LCMS is built upon. They have been instrumental in developing and publishing the original LCMS methodology and continue to provide ongoing research and development to further improve LCMS methods.</p>
                                </a>
                            </div>
                        </section>
                        
                        <hr>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://earthengine.google.com/" target="_blank">
                                    <img src="./src/assets/images/GEE_logo_transparent.png"  class = 'support-icons' alt="Google Earth Engine Logo"  href="#"   title="Click to learn more about Google Earth Engine">
                                    
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://earthengine.google.com/" target="_blank">
                                    <p class = 'support-text'>LCMS utilizes Google Earth Engine for most of its data acqusition, processing, and visualization, through an enterprise agreement between the USDA Forest Service and Google. In its current form, LCMS would not be possible without Google Earth Engine.</p>
                                </a>
                            </div>
                        </section>
                        <hr>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <h2>"..."</h2>
                            </div>
                            <div class = 'col-lg-10  support-text'>
                                    Suggested citation: 
                                    <p class = 'support-text' onclick = 'copyText("suggested-citation-text","copiedCitationMessageBox")' id = 'suggested-citation-text' title='Click to copy suggested citation to clipboard'>Forest Service, U.S. Department of Agriculture (2024). Landscape Change Monitoring System Dashboard [Online]. Available at: https://apps.fs.usda.gov/lcms-viewer/dashboard.html (Accessed: ${new Date().toStringFormat()}).
                                    </p>
                                    <span>
                                        <button onclick = 'copyText("suggested-citation-text","copiedCitationMessageBox")'' title = 'Click to copy suggested citation to clipboard' class="py-0 pr-1 fa fa-copy btn input-group-text bg-white" >
                                        </button>
                                        <p id = 'copiedCitationMessageBox'></p>
                                    </span>
                            </div>
                        </section>
                        <hr>
                        <header class ='row'>
                            <h3 class ='text-capitalize'>Contact</h3>
                        </header>
                        <section class = 'row '>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov"><img class = 'support-icons' alt = 'Email icon' src = './src/assets/images/email.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                                <a class = 'support-text' title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov">
                                Please contact the LCMS help desk <span href = "mailto: sm.fs.lcms@usda.gov">(sm.fs.lcms@usda.gov)</span> if you have questions/comments about LCMS or have feedback on the LCMS Dashboard.</a>
                            </div>
                        </section>
        			</div>`,
  supportDivAlgal: `<div  class = 'py-2 pl-3 pr-1'>
                        <header class = 'row ' title = 'Open ${mode} tutorial'>
                            <h3 class = ' text-capitalize'>Tutorial</h3>
                        </header>
                        <div class = 'row ' onclick="startTour()" title="Click to take a tour of the ${mode}'s features">
                            <div class = 'col-lg-2 p-0 m-0'>
                                <img class = 'support-icons' alt = 'Information icon' src = './src/assets/images/information--v2.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                            <a class="intro-modal-links" onclick="startTour()" title="Click to take a tour of the LCMS ${mode}'s features">${mode} TOUR</a>
                            </div>
                        </div>
                        <hr>
                         <header class = 'row ' title = 'Open in-depth ${mode} methods documentation'>
                            <h3 class = ' text-capitalize'>${mode} Methods</h3>
                        </header>
                        <div class = 'row ' title = 'Open in-depth ${mode} methods documentation'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <img class = 'support-icons' alt = 'Methods icon' src = './src/assets/images/methods-icon.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                                Click to open in-depth methods document:
                                <li>
                                <a class="intro-modal-links" onclick="downloadAnyMethods('./literature/Bloom_Mapper_v3_Methods_2023.pdf')" title="Open Bloom Mapper data creation methods documentation">Bloom Mapper V3 METHODS</a>
                                </li>
                            </div>
                        </div>
                        
                        <hr>
                        <header class = 'row'>
                            <h3 class = ' text-capitalize'>Acknowledgements</h3>
                        </header>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://www.fs.usda.gov/about-agency/gtac" target="_blank">
                                <img src="./src/assets/images/GTAC_Logo.png" class = 'support-icons' alt="GTAC Logo"  href="#" alt = "Geospatial Technology and Applications Center logo" title="Click to learn more about the Geospatial Technology and Applications Center (GTAC)">
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://www.fs.usda.gov/about-agency/gtac" target="_blank">
                                    <p class = 'support-text'>The Geospatial Technology and Applications Center (GTAC) provides leadership in geospatial science implementation in the USDA Forest Service by delivering vital services, data products, tools, training, and innovation to solve today's land and resource management challenges. All production and support for this tool takes place at GTAC.</p>
                                </a>
                            </div>
                        </section>
                        <hr>
                        <section class = 'row '>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://www.redcastleresources.com/" target="_blank">
                                    <img src="./src/assets/images/RCR-logo.jpg"  class = 'support-icons' alt="RedCastle Inc. Logo"  href="#"   title="Click to learn more about RedCastle Resources Inc."> 
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://www.redcastleresources.com/" target="_blank">
                                    <p class = 'support-text'>RedCastle Resources Inc. is the on-site contractor that has provided the technical expertise for ${mode}'s methods development, documentation, and visualization (this viewer) at GTAC.</p>
                                </a>
                            </div>
                        </section>
                        <hr>
                        <section class = 'row '>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="" target="_blank">
                                    <img src="./src/assets/images/usfslogo.png" class = 'support-icons' alt="U.S. Department of Agriculture, Forest Service Logo"  href="#"  title="Click to learn more about our field collaborators ">
                                </a>
                                
                                <a href="" target="_blank" >
                                    <img class = 'support-icons' alt="Wyoming Department of Environmental Quality icon" src="./src/assets/images/WY-DEQ-Logo.png" style="margin-top: 1rem;padding-right: 0.5rem;">
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="" target="_blank">
                                    <p class = 'support-text'>
                                    U.S. Department of Agriculture, Forest Service units in Regions 2 and 4 in Wyoming collaborated to help GTAC develop and train this tool based on actual bloom data collected by the Wyoming Department of Environmental Quality, Water Quality Division, Watershed Protection Program as part of their state-wide monitoring efforts to document the occurrence of Harmful Cyanobacterial Blooms. Thousands of lakes over ~1 acre exist on Forest system lands in Wyoming. This tool is critical in helping Forest staff focus efforts to address this public safety concern.</p>
                                </a>
                            </div>
                        </section>
                        
                        <hr>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://earthengine.google.com/" target="_blank">
                                    <img src="./src/assets/images/GEE_logo_transparent.png"  class = 'support-icons' alt="Google Earth Engine Logo"  href="#"   title="Click to learn more about Google Earth Engine">
                                    
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://earthengine.google.com/" target="_blank">
                                    <p class = 'support-text'>${mode} utilizes Google Earth Engine for most of its data acqusition, processing, and visualization, through an enterprise agreement between the USDA Forest Service and Google. In its current form, ${mode} would not be possible without Google Earth Engine.</p>
                                </a>
                            </div>
                        </section>
                        <hr>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <h2>"..."</h2>
                            </div>
                            <div class = 'col-lg-10  support-text'>
                                    Suggested citation: 
                                    <p class = 'support-text' onclick = 'copyText("suggested-citation-text","copiedCitationMessageBox")' id = 'suggested-citation-text' title='Click to copy suggested citation to clipboard'>Forest Service, U.S. Department of Agriculture (2024). ${mode} [Online]. Available at: https://apps.fs.usda.gov/lcms-viewer/${mode}.html (Accessed: ${new Date().toStringFormat()}).
                                    </p>
                                    <span>
                                        <button onclick = 'copyText("suggested-citation-text","copiedCitationMessageBox")'' title = 'Click to copy suggested citation to clipboard' class="py-0 pr-1 fa fa-copy btn input-group-text bg-white" >
                                        </button>
                                        <p id = 'copiedCitationMessageBox'></p>
                                    </span>
                            </div>
                        </section>
                        <hr>
                        <header class ='row'>
                            <h3 class ='text-capitalize'>Contact</h3>
                        </header>
                        <section class = 'row '>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov"><img class = 'support-icons' alt = 'Email icon' src = './src/assets/images/email.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                                <a class = 'support-text' title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov">
                                Please contact the ${mode} help desk <span href = "mailto: sm.fs.lcms@usda.gov">(sm.fs.lcms@usda.gov)</span> if you have questions/comments about ${mode} or have feedback on the ${mode}.</a>
                            </div>
                        </section>
        			</div>`,
  tooltipToggle: ` <label class = 'mt-2'>If you turned off tool tips, but want them back:</label>
                        <button  class = 'btn  bg-black' onclick = 'showToolTipsAgain()'>Show tooltips</button>`,
  walkThroughButton: `<div >
                            <label class = 'mt-2'>Run a walk-through of the ${mode} Data Explorer's features</label>
                            <a  class = 'intro-modal-links ' onclick = 'toggleWalkThroughCollapse()' title = 'Run interactive walk-through of the features of the ${mode} Data Explorer'>Run Walk-Through</a>
                          </div>`,
  distanceDiv: `Click on map to measure distance`,
  distanceTip:
    "Click on map to measure distance. Press <kbd>ctrl+z</kbd> to undo most recent point. Double-click, press <kbd>Delete</kbd>, or press <kbd>Backspace</kbd> to clear measurment and start over.",
  areaDiv: `Click on map to measure area<variable-radio onclick1 = 'updateArea()' onclick2 = 'updateArea()' var='metricOrImperialArea' title2='' name2='Metric' name1='Imperial' value2='metric' value1='imperial' type='string' title='Toggle between imperial or metric units'></variable-radio>
       `,
  areaTip:
    "Click on map to measure area. Double-click to complete polygon, press <kbd>ctrl+z</kbd> to undo most recent point, press <kbd>Delete</kbd> or <kbd>Backspace</kbd> to start over. Any number of polygons can be defined by repeating this process.",
  queryDiv:
    "<div>Double-click on map to query values of displayed layers at that location</div>",
  queryTip:
    "Double-click on map to query the values of the visible layers.  Only layers that are turned on will be queried.",
  pixelChartDiv: `<div>Double-click on map to query ${mode} data time series<br></div>`,
  pixelChartTip:
    "Double-click on map to look at the full time series of " +
    mode +
    " outputs for a pixel.",
  mapDefinedAreaChartDiv: `<div  id="map-defined" ></div>`,
  userDefinedAreaChartDiv: `<div  id="user-defined" >
                                            <label>Provide name for area selected for charting (optional):</label>
                                            <input title = 'Provide a name for your chart. A default one will be provided if left blank.'  type="user-defined-area-name" class="form-control my-1" id="user-defined-area-name" placeholder="Name your charting area!" style='width:80%;'>
                                            <hr>
                                            <div>Total area selected: <i id = "user-defined-area-spinner" style = 'display:none;' class="fa fa-spinner fa-spin text-dark pl-1"></i></div>
                                            <div id = 'user-defined-features-area' class = 'select-layer-name'>0 hectares / 0 acres</div>
                                            <div id = 'user-defined-edit-toolbar'></div>
                                            <button class = 'btn' style = 'margin-bottom: 0.5em!important;' onclick = 'chartUserDefinedArea()' title = 'Click to summarize across drawn polygons'>Chart Selected Areas</button>
        		            			</div>
                                	</div>`,
  showChartButton: `<div class = 'py-2'>
                                <button onclick = "$('#chart-modal').modal()" class = 'btn bg-black' title = "If you turned off the chart, but want to show it again" >Turn on Chart</button>
                                </div>`,
  mapDefinedAreaChartTip:
    "Charts will automatically update to summarize the current view extent after you pan or zoom on the map.",
  userDefinedAreaChartTip:
    "Click on map to select an area to summarize " +
    mode +
    " products across. Press <kbd>ctrl+z</kbd> to undo most recent point.  Press <kbd>Delete</kbd>, or press <kbd>Backspace</kbd> to start over. Double-click to finish polygon. Any number of polygons can be defined by repeating this process. Once finished defining areas, click on the <kbd>Chart Selected Areas</kbd> button to create chart.",
  uploadAreaChartDiv: `<hr>
                                <label title = 'Powered by: https://ogre.adc4gis.com/'>Choose a zipped shapefile, kml, kmz, or geoJSON file to summarize across. Then hit "Chart across chosen file" button below to produce chart.</label>
                                <input class = 'file-input my-1' type="file" id="areaUpload" name="upload" accept=".zip,.geojson,.json,.kmz,.kml" style="display: inline-block;">
                                <hr>
                                <div id = 'upload-reduction-factor-container'></div>
                                <hr>
                                <div>Uploaded areas:</div>
                                <div id="area-charting-shp-layer-list"></div>
                                <hr>
                                <button class = 'btn' style = 'margin-bottom: 0.5em!important;' onclick = 'runShpDefinedCharting()' title = 'Click to summarize across chosen .zip shapefile, .kmz, .kml, or .geojson.'>Chart across chosen file</button>`,
  uploadShpToMapLayerDiv: `<hr>
                                <label title = 'Powered by: https://ogre.adc4gis.com/'>Choose a zipped shapefile, kml, kmz, or geoJSON file to add to the viewer for reference. Then click "Add file to viewer" button below to add the layer.</label>
                                <input class = 'file-input my-1' type="file" id="areaUpload" name="upload" accept=".zip,.geojson,.json,.kmz,.kml" style="display: inline-block;">
                                <div>Uploaded areas:</div>
                                <div id="area-charting-shp-layer-list"></div>
                                <hr>
                                <button class = 'btn' style = 'margin-bottom: 0.5em!important;' onclick = 'runShpDefinedAddLayer()' title = 'Click to add .zip shapefile, .kmz, .kml, or .geojson. Layer will appear in Reference Data.'>Add file to viewer</button>`,
  uploadAreaChartTip:
    "Select zipped shapefile (zip into .zip all files related to the shapefile) or a single .kmz, .kml (If the .kmz or .kml has embedded pngs or any other non vector data, the conversion will likely fail), or .geojson file to summarize products across.",
  selectAreaDropdownChartDiv: `<i title="Selecting pre-defined summary areas for chosen study area" id = "select-area-spinner" class="text-dark px-2 fa fa-spin fa-spinner"></i>
                            <select class = 'form-control' style = 'width:100%;'  id='forestBoundaries' onchange='chartChosenArea()'></select>
                            <hr>`,
  selectAreaDropdownChartTip:
    "Select from pre-defined areas to summarize products across.",
  selectAreaInteractiveChartDiv: `<div>Choose from layers below and click on map to select areas to include in chart</div>
                                        <hr>
                                        <label>Provide name for area selected for charting (optional):</label>
                                        <input title = 'Provide a name for your chart. A default one will be provided if left blank.'  type="user-selected-area-name" class="form-control" id="user-selected-area-name" placeholder="Name your charting area!" style='width:80%;'>
                                        <hr>
                                        <div id = 'simplify-error-range-container'></div>
                                        <hr>
                                        <div id="area-charting-select-layer-list"></div>
                                        <hr>
                                        <div>Selected areas:</div>
                                        <i id = "select-features-list-spinner" style = 'display:none;' class="fa fa-spinner fa-spin text-dark"></i>
                                        <li class = 'selected-features-list' id = 'selected-features-list'></li>
                                        <div id="area-charting-selected-layer-list"></div>
                                        <hr>
                                        <div>Total area selected: <i id = "select-features-area-spinner" style = 'display:none;' class="fa fa-spinner fa-spin text-dark pl-1"></i></div>
                                        <div id = 'selected-features-area' class = 'select-layer-name'>0 hectares / 0 acres</div>
                                        <div id = 'select-features-edit-toolbar'></div>
                                        <button class = 'btn' onclick = 'chartSelectedAreas()'>Chart Selected Areas</button>
                                        `,
  selectAreaInteractiveChartTip:
    "Select from pre-defined areas on map to summarize products across.",
  shareButtons: `<!-- Email -->
                        <a title = 'Share via E-mail' onclick = 'TweetThis("mailto:?Subject=USDA Forest Service Landscape Change Monitoring System&amp;Body=I%20saw%20this%20and%20thought%20you%20might%20be%20interested.%20 ","",true)'>
                            <img class = 'image-icon-bar' src="./src/assets/images/email.png" alt="Email" />
                        </a>
                        <a title = 'Share on Reddit' onclick = 'TweetThis("http://reddit.com/submit?url=","&amp;title=USDA Forest Service Landscape Change Monitoring System",true)' >
                            <img class = 'image-icon-bar' src="./src/assets/images/reddit.png" alt="Reddit" />
                        </a>
                        <a title = 'Share on Twitter' onclick = 'TweetThis("https://twitter.com/share?url=","&amp;text=USDA Forest Service Landscape Change Monitoring System&amp;hashtags=USFSLCMS",true)' >
                            <img class = 'image-icon-bar' src="./src/assets/images/twitter.png" alt="Twitter" />
                        </a>
                        <a  title = 'Share on Facebook' onclick = 'TweetThis("http://www.facebook.com/sharer.php?u=","",true)' >
                            <img class = 'image-icon-bar' src="./src/assets/images/facebook.png" alt="Facebook" />
                        </a>`,
};
//////////////////////////////////////////////////////////////////////////////////////////////
//Go through each tip and remove kbd tag for shoing in hover titles
Object.keys(staticTemplates)
  .filter((word) => word.indexOf("Tip") > -1)
  .map(function (t) {
    let tip = staticTemplates[t].replaceAll(`<kbd>`, ``);
    tip = tip.replaceAll(`</kbd>`, ``);
    staticTemplates[t + "Hover"] = tip;
  });
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//Start functions that add/remove and control elements
//////////////////////////////////////////////////////////////////////////////////////////////
//Center map on user's location
//Adapted from https://www.w3schools.com/html/html5_geolocation.asp
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showLocationError);
  } else {
    showMessage(
      "Cannot acquire location",
      "Geolocation is not supported by this browser."
    );
    ga("send", "event", mode + "-getLocation", "failure", "failure");
  }
}
function showPosition(position) {
  const pt = { lng: position.coords.longitude, lat: position.coords.latitude };
  ga("send", "event", mode + "-getLocation", "success", JSON.stringify(pt));
  let locationMarker = new google.maps.Marker({
    map: map,
    position: pt,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 5,
      strokeColor: "#FF0",
      map: map,
    },
  });
  map.setCenter(pt);
  map.setZoom(10);
  showMessage(
    "Acquired location",
    "Latitude: " +
      position.coords.latitude +
      "<br>Longitude: " +
      position.coords.longitude
  );
}
function showLocationError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      showMessage(
        "Cannot acquire location",
        "User denied the request for Geolocation."
      );
      break;
    case error.POSITION_UNAVAILABLE:
      showMessage(
        "Cannot acquire location",
        "Location information is unavailable."
      );
      break;
    case error.TIMEOUT:
      showMessage(
        "Cannot acquire location",
        "The request to get user location timed out."
      );
      break;
    case error.UNKNOWN_ERROR:
      showMessage("Cannot acquire location", "An unknown error occurred.");
      break;
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to add a Bootstrap dropdown
function addDropdown(containerID, dropdownID, title, variable, tooltip) {
  if (tooltip === undefined || tooltip === null) {
    tooltip = "";
  }
  $("#" + containerID)
    .append(`<div id="${dropdownID}-container" class="form-group" title="${tooltip}">
								  <label for="${dropdownID}"><p class = 'param-title'>${title}:</p></label>
								  <select class="form-control" id="${dropdownID}"></select>
								</div>`);
  $("select#" + dropdownID).on("change", function (value) {
    eval(`window.${variable} = $(this).val()`);
  });
}

//Function to add an item to a dropdown
function addDropdownItem(dropdownID, label, value, tooltip) {
  if (tooltip === undefined || tooltip === null) {
    tooltip = "";
  }
  $("#" + dropdownID).append(
    `<option class = '${dropdownID}-dropdown-item' $title = '${tooltip}' value = "${value}">${label}</option>`
  );
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to add a standard shape editor toolbar
function addShapeEditToolbar(
  containerID,
  toolbarID,
  undoFunction,
  restartFunction,
  undoTip,
  deleteTip
) {
  if (undoTip === undefined || undoTip === null) {
    undoTip = "Click to undo last drawn point (ctrl z)";
  }
  if (deleteTip === undefined || deleteTip === null) {
    deleteTip =
      "Click to clear current drawing and start a new one (Delete, or Backspace)";
  }
  $("#" + containerID).append(`<hr>
								    <div id = '${toolbarID}' class="icon-bar ">
								    	<a href="#" onclick = '${undoFunction}' title = '${undoTip}''><i class="btn fa fa-undo"></i></a>
									  	<a href="#" onclick = '${restartFunction}' title = '${deleteTip}'><i class="btn fa fa-trash"></i></a>
									</div>
									<hr>`);
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to set up a custom toggle radio
const setRadioValue = function (variable, value) {
  console.log(value);
  window[variable] = value;
};
function getRadio(id, label, name1, name2, variable, value1, value2) {
  return `<div class = 'container'>
                <div id = '${id}-row' class = 'row'>
            		<label class="col-sm-4">${label}</label>
            		<div class = 'col-sm-8'>
                		<div  id = '${id}' class="toggle_radio">
                            <input type="radio" checked class="toggle_option first_toggle" id="first_toggle${id}" name="toggle_option" onclick="setRadioValue('${variable}','${value1}')"  >
                	       <input type="radio"  class="toggle_option second_toggle" id="second_toggle${id}" name="toggle_option" onclick="setRadioValue('${variable}','${value2}')">
                	       <label for="first_toggle${id}"><p>${name1}</p></label>
                	       <label for="second_toggle${id}"><p>${name2}</p></label>
                	       <div class="toggle_option_slider"></div>
            	        </div>
            	   </div>
        	   </div>
        	</div>`;
}
//////////////////////////////////////////////////////////////////////////////////////////////
function getDiv(containerID, divID, label, variable, value) {
  eval(`var ${variable} = ${value}`);

  var div = `<div id = "${divID}">${label}</div>`;
  $("#" + containerID).append(div);
  $("#" + divID).click(function () {
    eval(`${variable}++`);

    $("#" + divID).append(window[variable]);
  });
}
//////////////////////////////////////////////////////////////////////////////////////////////
function getToggle(
  containerID,
  toggleID,
  onLabel,
  offLabel,
  onValue,
  offValue,
  variable,
  checked
) {
  if (
    checked === undefined ||
    checked === null ||
    checked === "true" ||
    checked === "checked"
  ) {
    checked = true;
  } else if (checked === "false" || checked === "") {
    checked = false;
  }

  var valueDict = { true: onValue, false: offValue };

  eval(`window.${variable} = valueDict[checked]`);
  var toggle = `<input role="option" id = "${toggleID}" class = 'p-0 m-0' type="checkbox"  data-toggle="toggle" data-on="${onLabel}" data-off="${offLabel}" data-onstyle="toggle-on" data-offstyle="toggle-off"><br>`;
  $("#" + containerID).append(toggle);
  if (checked) {
    $("#" + toggleID).bootstrapToggle("on");
  }
  $("#" + containerID).click(function () {
    console.log("here");
    var value = $("#" + toggleID).prop("checked");

    eval(`window.${variable} = valueDict[${value}]`);
  });
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Provide color picker and allow updating of drawn polygons
function updateDistanceColor(jscolor) {
  distancePolylineOptions.strokeColor = "#" + jscolor;
  if (distancePolyline !== undefined) {
    distancePolyline.setOptions(distancePolylineOptions);
  }
}
function updateUDPColor(jscolor) {
  udpOptions.strokeColor = "#" + jscolor;
  Object.keys(udpPolygonObj).map(function (k) {
    udpPolygonObj[k].setOptions(udpOptions);
  });
}
function updateAreaColor(jscolor) {
  areaPolygonOptions.strokeColor = "#" + jscolor;
  Object.keys(areaPolygonObj).map(function (k) {
    areaPolygonObj[k].setOptions(areaPolygonOptions);
    console.log(areaPolygonObj[k]);
  });
}
function addColorPicker(containerID, pickerID, updateFunction, value) {
  if (value === undefined || value === null) {
    value = "FFFF00";
  }
  $("#" + containerID)
    .append(`<button id = '${pickerID}' data-toggle="tooltip" title="If needed, change the color of shape you are drawing"
							    class=" fa fa-paint-brush text-dark color-button jscolor {valueElement:null,value:'${value}',onFineChange:'${updateFunction}(this)'} "
							    ></button>`);
}

//Functions to add and change content of BS modals
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
  // $('#'+modalID).empty();

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
function smartShowMessage(title, message, modalID) {
  if ($("#" + modalID).hasClass("show")) {
    console.log("yay");
    appendMessage2(message, modalID);
  } else {
    showMessage(title, message, modalID);
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Show a basic tip BS modal
function showTip(title, message) {
  if (
    localStorage.showToolTipModal == undefined ||
    localStorage.showToolTipModal == "undefined"
  ) {
    localStorage.showToolTipModal = "true";
  }
  if (localStorage.showToolTipModal === "true" && walkThroughAdded == false) {
    showMessage(
      "",
      '<span class = "font-weight-bold text-uppercase" >' +
        title +
        " </span><span>" +
        message +
        "</span>",
      "tip-modal",
      false
    );

    $("#tip-modal-body").append(`<form class="form-inline pt-3 pb-0">
								  <div class="form-check  mr-0">
                                	<input role="option" type="checkbox" class="form-check-input" id="dontShowTipAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
                                	<label class=" text-uppercase form-check-label " for="dontShowTipAgainCheckbox" >Turn off tips</label>
                            		</div>
								</form>`);
    $("#tip-modal").modal().show();
  }
  $("#dontShowTipAgainCheckbox").change(function () {
    localStorage.showToolTipModal = !this.checked;
    if (localStorage.showToolTipModal === "false") {
      $("#tooltip-radio-second_toggle_label").click();
    } else if (localStorage.showToolTipModal === "true") {
      $("#tooltip-radio-first_toggle_label").click();
    }
  });
}
// function to force a second opportunity for new users to open tutorial for sequoia viewer:
function showTutorialLinkAgain(title, message) {
  // If it is a user's first time at the site, localStorage.isFirstTime is undefined. This is then be set to false after a user clicks to do tutorial
  $("#introModal").on("hidden.bs.modal", function () {
    if (localStorage.isFirstTime != "false") {
      showMessage(title, message, "secondTutorialPopUp-modal", true);
      localStorage.isFirstTime = "false";
    }
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////
//Function to add a given study area to the study area dropdown
function addStudyAreaToDropdown(name, toolTip) {
  var id = name.replaceAll(" ", "-");
  $("#study-area-list").append(
    `<a id = '${id}' name = '${name}' class="dropdown-item "   data-toggle="tooltip" title="${toolTip}">${name}</a>`
  );
  $("#" + id).on("click", function () {
    // $('#summary-spinner').show();
    $("#study-area-list").hide();
    longStudyAreaName = this.name;
    dropdownUpdateStudyArea(this.name);
  });
}
//////////////////////////////////////////////////////////////////////////////////////////////
function addToggle(
  containerDivID,
  toggleID,
  title,
  onLabel,
  offLabel,
  on,
  variable,
  valueOn,
  valueOff,
  onChangeFunction,
  tooltip
) {
  var valueDict = { true: valueOn, false: valueOff };
  var checked;
  if (tooltip === undefined || tooltip === null) {
    tooltip = "";
  }
  if (on === null || on === undefined || on === "checked" || on === "true") {
    on = true;
    checked = "checked";
  } else {
    on = false;
    checked = "";
  }

  eval(`window.${variable} = valueDict[on];`);
  $("#" + containerDivID).append(
    `<div title="${tooltip}" >${title}<input  id = "${toggleID}" data-onstyle="dark" data-offstyle="light" data-style="border" role="option" type="checkbox" data-on="${onLabel}" data-off="${offLabel}"  ${checked} data-toggle="toggle" data-width="100" data-onstyle="dark" data-offstyle="light" data-style="border" data-size="small" ></div>`
  );
  $("#" + toggleID).change(function () {
    var value = valueDict[$("#" + toggleID).prop("checked")];
    eval(`window.${variable} = value;`);

    eval(`${onChangeFunction}`);
  });
}
//////////////////////////////////////////////////////////////////////////////////////////////
function addRadio(
  containerDivID,
  radioID,
  title,
  onLabel,
  offLabel,
  variable,
  valueOn,
  valueOff,
  onFunction,
  offFunction,
  tooltip
) {
  eval(`window.${variable} = '${valueOn}';`);
  $("#" + containerDivID)
    .append(`<row class = 'row' id = '${radioID}-container' title="${tooltip}">
		<p class="col-12  param-title">${title} </p>
		<div class = 'col-12 pt-0'>
    		<div  id = '#${radioID}'  class="toggle_radio p-0">
                <input type="radio" class = "first_toggle" checked class="toggle_option" id="${radioID}-first_toggle" name="${radioID}-toggle_option"  value="1" >
    	       <input type="radio" class="toggle_option second_toggle" id="${radioID}-second_toggle" name="${radioID}-toggle_option"  value="2" >
    	       <label for="${radioID}-first_toggle" id = '${radioID}-first_toggle_label'><p>${onLabel}</p></label>
    	       <label for="${radioID}-second_toggle"  id = '${radioID}-second_toggle_label'><p>${offLabel}</p></label>
    	       <div class="toggle_option_slider">
    	    </div>
	    </div>
	</div>
	</row>`);

  $("#" + radioID + "-first_toggle").change(function () {
    eval(`window.${variable} = '${valueOn}';`);

    eval(`${onFunction}`);
  });
  $("#" + radioID + "-second_toggle").change(function () {
    eval(`window.${variable} = '${valueOff}';`);
    eval(`${offFunction}`);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////
// HiForm-BMP Stuff
//////////////////////////////////////////////////////////////////////////////////////////////
// DROPDOWN SELECT STATES - Hiform
function addDropdownStates(
  containerID,
  dropdownId,
  label,
  variable,
  selectList,
  callback
) {
  $("#" + containerID)
    .append(`<div id="${containerID}-container class="form-group "><label for="${containerID}" class="form-label">${label}</label>
  <select id=${dropdownId} class="form-select mb-2 bg-tan"></select></div>`);

  $(`#${dropdownId}`).append(`<option>---</option>`);

  selectList.map((item) => {
    $(`#${dropdownId}`).append(`<option>${item}</option>`);
  });

  $(`#` + dropdownId).on("input", () => {
    selectedItem = $(`#state-select`).val();
    console.log("State Selected: " + selectedItem);
    callback(selectedItem);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////
// DROPDOWN SELECT COUNTIES - Hiform
function addDropdownCounties(
  containerID,
  dropdownId,
  label,
  variable,
  selectList,
  stateFP,
  stateAbr,
  callback
) {
  $("#" + containerID + "-container").replaceWith("");
  $("#" + containerID)
    .append(`<div id="${containerID}-container" class="mt-2"><label for="${containerID}" class="form-label">${label}</label>
  <select id=${dropdownId} class="form-select mb-2 bg-tan"></select></div>`);

  $(`#${dropdownId}`).append(`<option>---</option>`);
  selectList.map((item) => {
    $(`#${dropdownId}`).append(`<option>${item}</option>`);
  });

  $(`#` + dropdownId).on("input", () => {
    selectedItem = $(`#county-select`).val();
    console.log("County Selected: " + selectedItem);
    callback(selectedItem, stateFP, stateAbr);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////
// MultiRadio for Selection Type - Hiform
function addSelectTypeRadio(
  containerID,
  radioID,
  label,
  variable,
  optionList,
  title,
  callback
) {
  $("#" + containerID).append(
    `<form  title='${title}' class = 'simple-radio' id = '${radioID}'><p class = 'param-title'>${label}</p></form>`
  );

  eval(`if(window.${variable} === undefined){window.${variable} = ''};`);
  Object.keys(optionList).map(function (k) {
    const kID = k.replace(/[^A-Za-z0-9]/g, "-");
    var radioCheckboxID = kID + "-checkbox";
    var radioLabelID = radioCheckboxID + "-label";
    if (optionList[k] === "true") {
      optionList[k] = true;
    } else if (optionList[k] === "false") {
      optionList[k] = false;
    }
    var checked = optionList[k];

    if (checked) {
      checked = "checked";
      eval(`window.${variable} = "${k}"`);
    } else {
      checked = "";
    }

    $("#" + radioID).append(`<div class="form-check form-check-inline mb-2">
                              <input role="option" class="form-check-input" type="radio" name="inlineRadioOptions" id="${radioCheckboxID}" ${checked} value="${k}">
                              <label class="form-check-label" for="${radioCheckboxID}">${k}</label>
                            </div>`);
    $("#" + radioCheckboxID).change(function () {
      Object.keys(optionList).map((k) => (optionList[k] = false));
      var v = $(this).val();
      optionList[v] = true;
      eval(`window.${variable} = "${v}"`);
      callback(v);
    });
  });
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Date Picker - Hiform
function addHiFormPostDatePicker(
  containerID,
  datepickerID,
  minDate,
  maxDate,
  defaultStart,
  defaultEnd
) {
  $("#" + containerID).append(`<div id="${datepickerID}"></div>`);
  $("#" + datepickerID).append(`<div id="post-ranges-div">
                                <p class = 'param-title'>Define Post Date Range</p>
                                <input type="date" value="${defaultStart}" id="post-date-one" min=${minDate} max="${maxDate}" class="mt-2 mr-2" onchange="postDateOneHandler(event)">
                                <input type="date" value="${defaultEnd}" id="post-date-two" min=${minDate} max="${maxDate}" class="mt-2 mb-2" onchange="postDateTwoHandler(event)">
                              </div>`);
}

function addHiFormCustomPrePicker(containerID, datepickerID, minDate, maxDate) {
  $("#" + containerID).append(`<div id="${datepickerID}"></div>`);

  $("#define-pre-date-options").append(`<div id="pre-ranges-div">
                                          <input type="date" id="pre-date-one" min=${minDate} max="${maxDate}" class="mt-2 mr-2" onchange="preDateOneHandler(event)">
                                          <input type="date" id="pre-date-two" min=${minDate} max="${maxDate}" class="mt-2 mb-2" onchange="preDateTwoHandler(event)">
                                        </div>`);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Add Current AOI Paramaters Display - Hiform
function addCurrentAOIParametersDisplay() {
  $(`#select-aoi-label-select-aoi-div`)
    .append(`<div id="select-aoi-current-params" class="panel-collapse collapse panel-body show px-5 py-0">
                                                  <div id="display-aoi-selection-title">Selected County:</div>
                                                  <div id="display-aoi-selection"></div>
                                                </div>`);
  $(`#select-aoi-current-params`).hide();
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Add Current Date Paramaters Display - Hiform
function addCurrentDateParametersDisplay() {
  $(`#pre-post-dates-label-pre-post-dates-div`)
    .append(`<div id="date-current-params" class="panel-collapse collapse panel-body show px-5 py-0">
                                                            <div id="post-display-date-selection-title">Post Date Range:</div>
                                                            <div id="post-display-date-selection"></div>
                                                            <div id="pre-display-date-selection-title">Pre Date Range:</div>
                                                            <div id="pre-display-date-selection"></div>
                                                        </div>`);
  $(`#date-current-params`).hide();
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Process Button - Hiform
function addHiFormProcessButton(containerID) {
  $("#" + containerID)
    .append(`<hr><div class = 'pb-2' id="process-button-div" title="Select a county and define date ranges to process.">
                                <input title = 'Click to run HiForm BMP using your selected paramters' type="button" id="process-button" class="mb-2 btn" value="Process HiForm BMP" onclick="reRun()">
                              </div>`);

  $("#process-button").attr("disabled", "disabled");
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Reset Button - Hiform
function addHiFormResetButton(containerID) {
  $("#" + containerID)
    .append(`<div id="process-button-div" class="text-center mt-2" title="Select a county and define date ranges to process.">
                                <input type="button" id="reset-button" class="mb-2 btn" value="Restart Analysis" onclick="handleHiFormReset()">
                              </div>`);

  $("#reset-button").attr("disabled", "disabled");
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Export (Minus Select Area) - Hiform
function addHiFormExport(containerDiv) {
  $("#" + containerDiv)
    .append(`<div class = 'py-2' id = 'export-list-container'>
                        <h5>Choose which data to export:</h5>
                        <div class = 'py-2' id="export-list"></div>
                        <hr>
                        <div >
                            
                            <div class = 'pt-1 pb-3' >
                                <div id = 'export-button-div'>
                                    <button class = 'btn' onclick = 'exportImages()' title = 'Click to export selected data from GEE'><i class="pr-1 fa fa-cloud-download" aria-hidden="true"></i>Export</button>
                                    <button class = 'btn' onclick = 'cancelAllTasks()' title = 'Click to cancel all active exports'><i class="pr-1 fa fa-close" aria-hidden="true"></i>Cancel All Exports</button>
                                </div>
                                <hr>
                                <span style = 'display:none;' class="fa-stack fa-2x py-0" id='export-spinner' title="">
						    		<img alt= "Google Earth Engine logo spinner" class="fa fa-spin fa-stack-2x" src="./src/assets/images/GEE_logo_transparent.png" alt="" style='width:4rem;height:4rem;'>
						   			<strong id = 'export-count'  class="fa-stack-1x" style = 'padding-top: 0.1rem;cursor:pointer;'></strong>
								</span>
                                <div id = 'export-count-div' ></div>
                            </div>  
                        </div>
                        
                    </div>`);
}

//////////////////////////////////////////////////////////////////////////////////////////////
//Function to set up a checkbox list
//Will set up an object under the variable name with the optionList that is updated
//Option list is formatted as {'Label 1': true, 'Label 2':false...etc}
function addCheckboxes(
  containerID,
  checkboxID,
  title,
  variable,
  optionList,
  labels,
  hoverText = "",
  appendMethod = "append"
) {
  let containerHTML = `<form  id = '${checkboxID}'  title = '${hoverText}' class = 'simple-radio' ><p class = 'param-title'>${title}</p><ul class = 'checkboxList' id = '${checkboxID}-list' ></ul></form>`;
  if (appendMethod === "append") {
    $("#" + containerID).append(containerHTML);
  } else {
    $("#" + containerID).prepend(containerHTML);
  }

  eval(`if(window.${variable} === undefined){window.${variable} = []}`);
  let ki = 0;
  labels = labels || [];
  Object.keys(optionList).map(function (k) {
    let kLabel = labels[ki] || k;
    // console.log(k)
    const kID = k.replace(/[^A-Za-z0-9]/g, "-");
    const checkboxCheckboxID = variable + kID + "-checkbox";
    const checkboxLabelID = variable + kID + "-label";
    if (optionList[k] === "true") {
      optionList[k] = true;
    } else if (optionList[k] === "false") {
      optionList[k] = false;
    }
    let checked = optionList[k];
    optionList[k] = checked;
    if (checked) {
      checked = "checked";
    } else {
      checked = "";
    }
    eval(`window.${variable} = optionList`);
    $(
      "#" + checkboxID + "-list"
    ).append(`<li><input  role="option" id="${checkboxCheckboxID}" type="checkbox" ${checked} value = '${k}' />
                                 <label  id="${checkboxLabelID}" style = 'margin-bottom:0px;'  for="${checkboxCheckboxID}" >${kLabel}</label></li>`);

    $("#" + checkboxCheckboxID).change(function () {
      optionList[$(this).val()] = $(this)[0].checked;
      eval(`window.${variable} = optionList`);
      // console.log("Checkbox change");
      // console.log(optionList);
    });
    ki++;
  });
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Similar to the addCheckboxes only with radio buttons
//The variable assumes the value of the key of the object that is selected instead of the entire optionList object
//e.g. if optionList = {'hello':true,'there':false} then the variable = 'hello'
function addMultiRadio(
  containerID,
  radioID,
  label,
  variable,
  optionList,
  title
) {
  $("#" + containerID).append(
    `<form  title='${title}' class = 'simple-radio' id = '${radioID}'><p class = 'param-title'>${label}</p></form>`
  );

  eval(`if(window.${variable} === undefined){window.${variable} = ''};`);
  Object.keys(optionList).map(function (k) {
    const kID = k.replace(/[^A-Za-z0-9]/g, "-");
    var radioCheckboxID = kID + "-checkbox";
    var radioLabelID = radioCheckboxID + "-label";
    if (optionList[k] === "true") {
      optionList[k] = true;
    } else if (optionList[k] === "false") {
      optionList[k] = false;
    }
    var checked = optionList[k];

    if (checked) {
      checked = "checked";
      eval(`window.${variable} = "${k}"`);
    } else {
      checked = "";
    }

    $("#" + radioID).append(`<div class="form-check form-check-inline">
                              <input role="option" class="form-check-input" type="radio" name="inlineRadioOptions" id="${radioCheckboxID}" ${checked} value="${k}">
                              <label class="form-check-label" for="${radioCheckboxID}">${k}</label>
                            </div>`);
    $("#" + radioCheckboxID).change(function () {
      Object.keys(optionList).map((k) => (optionList[k] = false));
      var v = $(this).val();
      optionList[v] = true;
      eval(`window.${variable} = "${v}"`);
    });
  });
}
//////////////////////////////////////////////////////////////////////////////////////////////
// Function to add JSON text input widget
function addJSONInputTextBox(
  containerID,
  inputID,
  label,
  variable,
  defaultValue,
  title
) {
  eval(
    `if(window.${variable} === undefined){window.${variable} = ${JSON.stringify(
      defaultValue
    )}}`
  );
  $("#" + containerID).append(`
    <hr>
    <label>${label}</label>
    <textarea title='${title}' class="form-control json-input-text-box" id="${inputID}"oninput="auto_grow(this)" style='width:90%;'>${JSON.stringify(
    defaultValue
  )}</textarea>`);

  $("#" + inputID).on("input", () => {
    var tJSON = $(`#${inputID}`).val();
    // console.log(JSON.parse(tJSON));
    eval(`window.${variable} = JSON.parse(tJSON)`);
  });
}
//////////////////////////////////////////////////////////////////////////////////////////////
// Function to add vanilla text input widget
function addInputTextBox(
  containerID,
  inputID,
  label,
  variable,
  defaultValue,
  title
) {
  eval(
    `if(window.${variable} === undefined){window.${variable} = "${defaultValue}"}`
  );

  $("#" + containerID).append(`<form class="form-inline" title='${title}'>
                                <label for="${inputID}" class = 'mr-1'>${label} </label>
                                <div class="form-group">
                                  <input type="text" id="${inputID}"  value="${defaultValue}" class="form-control">
                                </div>
                              </form>`);

  $("#" + inputID).on("input", () => {
    var t = $(`#${inputID}`).val();
    eval(`window.${variable} = "${$(`#${inputID}`).val()}"`);
  });
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Some basic formatting functions
function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}
function formatDT(__dt) {
  var year = __dt.getFullYear();
  var month = zeroPad(__dt.getMonth() + 1, 2);
  var date = zeroPad(__dt.getDate(), 2);
  // var hours = zeroPad(__dt.getHours(), 2);
  // var minutes = zeroPad(__dt.getMinutes(), 2);
  // var seconds = zeroPad(__dt.getSeconds(), 2);
  return month + "/" + date + "/" + year.toString().slice(2, 4); //+ ' ' + hours + ':' + minutes + ':' + seconds;
}
function formatDT2(__dt) {
  var year = __dt.getFullYear();
  var month = zeroPad(__dt.getMonth() + 1, 2);
  var date = zeroPad(__dt.getDate(), 2);
  // console.log(`${year.toString().slice(2, 4)}-${month}-${date}`);
  // var hours = zeroPad(__dt.getHours(), 2);
  // var minutes = zeroPad(__dt.getMinutes(), 2);
  // var seconds = zeroPad(__dt.getSeconds(), 2);
  return `${year.toString().slice(2, 4)}-${month}-${date}`;
}
function formatDTJulian(__dt) {
  // var year = __dt.getFullYear();
  var month = zeroPad(__dt.getMonth() + 1, 2);
  var date = zeroPad(__dt.getDate(), 2);
  // var hours = zeroPad(__dt.getHours(), 2);
  // var minutes = zeroPad(__dt.getMinutes(), 2);
  // var seconds = zeroPad(__dt.getSeconds(), 2);
  return month + "/" + date; //+ ' ' + hours + ':' + minutes + ':' + seconds;
}

Date.fromDayofYear = function (n, y) {
  if (!y) y = new Date().getFullYear();
  var d = new Date(y, 0, 1);
  return new Date(d.setMonth(0, n));
};
Date.prototype.dayofYear = function () {
  var d = new Date(this.getFullYear(), 0, 0);
  return Math.floor((this - d) / 8.64e7);
};
//////////////////////////////////////////////////////////////////////////////////////////////
//Create a dual range slider
//Possible modes are : 'date','julian',or null
//Default mode is 'date', must specify mode as null to use vanilla numbers
function setUpDualRangeSlider(
  var1,
  var2,
  min,
  max,
  defaultMin,
  defaultMax,
  step,
  sliderID,
  updateID,
  mode,
  slideFun,
  stopFun
) {
  // var dt_from = "2000/11/01";
  // var dt_to = "2015/11/24";
  // $("#"+updateID +" .ui-slider .ui-slider-handle").css( {"width": '3px'} );
  if (mode === undefined || mode === null) {
    mode = "date";
  }
  if (defaultMin === undefined || defaultMin === null) {
    defaultMin = min;
  }
  if (defaultMax === undefined || defaultMax === null) {
    defaultMax = max;
  }
  // if(step === undefined  || step === null){step = 1};

  if (mode === "date") {
    min = new Date(min);
    max = new Date(max);
    step = step * 24 * 60 * 60;
    defaultMin = new Date(defaultMin);
    defaultMax = new Date(defaultMax);
    // step = step*60*60*24
    $("#" + updateID).html(formatDT(defaultMin) + " - " + formatDT(defaultMax));
  } else if (mode === "julian") {
    min = Date.fromDayofYear(min);
    max = Date.fromDayofYear(max);
    step = step * 24 * 60 * 60;
    defaultMin = Date.fromDayofYear(defaultMin);
    defaultMax = Date.fromDayofYear(defaultMax);
    $("#" + updateID).html(
      formatDTJulian(defaultMin) + " - " + formatDTJulian(defaultMax)
    );
  } else {
    $("#" + updateID).html(
      defaultMin.toString() + " - " + defaultMax.toString()
    );
  }

  if (mode === "date" || mode === "julian") {
    var minVal = Date.parse(min) / 1000;
    var maxVal = Date.parse(max) / 1000;
    var minDefault = Date.parse(defaultMin) / 1000;
    var maxDefault = Date.parse(defaultMax) / 1000;
  } else {
    var minVal = min;
    var maxVal = max;
    var minDefault = defaultMin;
    var maxDefault = defaultMax;
  }

  $("#" + sliderID).slider({
    range: true,
    min: minVal,
    max: maxVal,
    step: step,
    values: [minDefault, maxDefault],

    slide: function (e, ui) {
      if (mode === "date") {
        var value1 = ui.values[0] * 1000;
        var value2 = ui.values[1] * 1000;

        var value1Show = formatDT(new Date(value1));
        var value2Show = formatDT(new Date(value2));

        // value1 = new Date(value1);
        // value2 = new Date(value2);
        $("#" + updateID).html(
          value1Show.toString() + " - " + value2Show.toString()
        );

        eval(var1 + "= new Date(" + value1.toString() + ")");
        eval(var2 + "= new Date(" + value2.toString() + ")");
      } else if (mode === "julian") {
        var value1 = new Date(ui.values[0] * 1000);
        var value2 = new Date(ui.values[1] * 1000);

        var value1Show = formatDTJulian(value1);
        var value2Show = formatDTJulian(value2);
        value1 = value1.dayofYear();
        value2 = value2.dayofYear();

        $("#" + updateID).html(
          value1Show.toString() + " - " + value2Show.toString()
        );

        eval(var1 + "= " + value1.toString());
        eval(var2 + "= " + value2.toString());
      } else {
        var value1 = ui.values[0];
        var value2 = ui.values[1];

        var value1Show = value1;
        var value2Show = value2;

        $("#" + updateID).html(
          value1Show.toString() + " - " + value2Show.toString()
        );

        eval(var1 + "= " + value1.toString());
        eval(var2 + "= " + value2.toString());
      }
      if (slideFun !== undefined && slideFun !== null) {
        slideFun(e, ui);
      }
    },
    stop: function (e, ui) {
      if (stopFun !== undefined && stopFun !== null) {
        stopFun(e, ui);
      }
    },
  });
}
//Wrapper function to add a dual range slider
function addDualRangeSlider(
  containerDivID,
  title,
  var1,
  var2,
  min,
  max,
  defaultMin,
  defaultMax,
  step,
  sliderID,
  mode,
  tooltip,
  slideFun,
  stopFun
) {
  if (tooltip === null || tooltip === undefined) {
    tooltip = "";
  }

  // setUpRangeSlider('startYear', 'endYear', 1985, 2018, startYear, endYear, 1, 'slider1', 'date-range-value1', 'null');
  $("#" + containerDivID)
    .append(`<div  id="${sliderID}-container"class='dual-range-slider-container px-1' title="${tooltip}">
							        <div class='dual-range-slider-name pt-2 pb-3 param-title'>${title}</div>
							        <div id="${sliderID}" class='dual-range-slider-slider' href = '#'></div>
							        <div id='${sliderID}-update' class='dual-range-slider-value p-2'></div>
							    </div>`);
  setUpDualRangeSlider(
    var1,
    var2,
    min,
    max,
    defaultMin,
    defaultMax,
    step,
    sliderID,
    sliderID + "-update",
    mode,
    slideFun,
    stopFun
  );
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to add single range slider
function setUpRangeSlider(
  variable,
  min,
  max,
  defaultValue,
  step,
  sliderID,
  mode
) {
  eval(`window.${variable} = ${defaultValue};`);
  $("#" + sliderID + "-update").html(defaultValue);
  $("#" + sliderID).slider({
    min: min,
    max: max,
    step: step,
    value: defaultValue,
    slide: function (e, ui) {
      eval(`window.${variable} = ${ui.value};`);
      $("#" + sliderID + "-update").empty();
      $("#" + sliderID + "-update").html(ui.value);
    },
  });
}
//Wrapper for single range slider
function addRangeSlider(
  containerDivID,
  title,
  variable,
  min,
  max,
  defaultValue,
  step,
  sliderID,
  mode,
  tooltip
) {
  $("#" + containerDivID)
    .append(`<div  id="${sliderID}-container" class='dual-range-slider-container px-1' title="${tooltip}">
                                    <div class='dual-range-slider-name pt-2 pb-3 param-title'>${title}</div>
                                    <div id="${sliderID}" class='dual-range-slider-slider' href = '#'></div>
                                    <div id='${sliderID}-update' class='dual-range-slider-value p-2'></div>
                                </div>`);
  setUpRangeSlider(variable, min, max, defaultValue, step, sliderID, mode);
}
//////////////////////////////////////////////////////////////////////////////////////////////
//More Bootstrap element creators
//Function to add tab to list
function addTab(
  tabTitle,
  tabListID,
  divListID,
  tabID,
  divID,
  tabOnClick,
  divHTML,
  tabToolTip,
  selected
) {
  if (!tabToolTip) {
    tabToolTip = "";
  }
  var show;
  if (selected || selected === "true") {
    show = "active show";
  } else {
    show = "";
  }

  $("#" + tabListID).append(
    `<li class="nav-item"><a onclick = '${tabOnClick}' class="nav-link text-left text-dark tab-nav-link ${show}" id="'+tabID+'" data-toggle="tab" href="#${divID}" role="tab" aria-controls="${divID}" aria-selected="false" title="${tabToolTip}">${tabTitle}</a></li>`
  );

  $("#" + divListID).append(
    $(
      `<div class="tab-pane fade ${show}" id="${divID}" role="tabpanel" aria-labelledby="${tabID}" title="${tabToolTip}"></div>`
    ).append(divHTML)
  );
}
/////////////////////////////////////////////////////////////////////////////////////////////
function addTabContainer(containerID, tabListID, divListID) {
  $("#" + containerID)
    .append(`<ul class="pb-1 nav nav-tabs flex-column nav-justified md-tabs" id="${tabListID}" role="tablist">  
    </ul>
    <div class = 'tab-content card' id = '${divListID}'>
    </div>`);
}
// function addAccordianContainer(containerID,tabListID,divListID){
// 	$('#'+ containerID).append(`<ul class="pb-1 nav nav-tabs flex-column nav-justified md-tabs" id="${tabListID}" role="tablist">
//     </ul>
//     <div class = 'tab-content card' id = '${divListID}'>
//     </div>`);
// }
//////////////////////////////////////////////////////////////////////////////////////////////
function addCollapse(
  containerID,
  collapseLabelID,
  collapseID,
  collapseLabel,
  collapseLabelIcon,
  show,
  onclick,
  toolTip,
  mode = "append"
) {
  var collapsed;
  if (toolTip === undefined || toolTip === null) {
    toolTip = "";
  }
  if (show === true || show === "true" || show === "show") {
    show = "show";
    collapsed = "";
  } else {
    show = "";
    collapsed = "collapsed";
  }
  var collapseTitleDiv = `<header title="${toolTip}" class="panel-heading px-3 py-2 " role="tab" id="${collapseLabelID}" onclick = '${onclick}'>
	<h2 class="p-0 m-0 panel-title  ${collapsed}" data-toggle="collapse"  href="#${collapseID}" id="${collapseLabelID}-label" aria-expanded="${show}" aria-controls="${collapseID}"> <a class = 'collapse-title' role='img'>
	${collapseLabelIcon} ${collapseLabel} </a></h2><span id="${collapseLabelID}-message"</span></header>`;

  var collapseDiv = `<section id="${collapseID}" class="panel-collapse collapse panel-body ${show} px-5 py-0" role="tabpanel" aria-labelledby="${collapseLabelID}"></section>`;
  if (mode === "append") {
    $("#" + containerID).append(
      `<div role="listitem" id="${collapseLabelID}-${collapseID}"></div>`
    );
  } else {
    $("#" + containerID).prepend(
      `<div role="listitem" id="${collapseLabelID}-${collapseID}"></div>`
    );
  }
  $(`#${collapseLabelID}-${collapseID}`).append(collapseTitleDiv);
  $(`#${collapseLabelID}-${collapseID}`).append(collapseDiv);
}
//////////////////////////////////////////////////////////////////////////////////////////////
function addSubCollapse(
  containerID,
  collapseLabelID,
  collapseID,
  collapseLabel,
  collapseLabelIcon,
  show,
  onclick
) {
  var collapsed;
  if (show === true || show === "true" || show === "show") {
    show = "show";
    collapsed = "";
  } else {
    show = "";
    collapsed = "collapsed";
  }

  var collapseTitleDiv = `<div >
                                <div   class="panel-heading px-0 py-2 " role="tab" id="${collapseLabelID}" onclick = '${onclick}'>
	                           <h5 class="sub-panel-title ${collapsed}" data-toggle="collapse"  href="#${collapseID}" aria-expanded="false" aria-controls="${collapseID}" > <a class = 'collapse-title' >${collapseLabelIcon} ${collapseLabel} </a></h5>
                                </div>
                            </div`;

  var collapseDiv = `<div id="${collapseID}" class="panel-collapse collapse panel-body ${show} px-1 py-0" role="tabpanel" aria-labelledby="${collapseLabelID}"></div>`;
  $("#" + containerID).append(collapseTitleDiv);
  $("#" + containerID).append(collapseDiv);
}
//////////////////////////////////////////////////////////////////////////////////////////////
function addAccordianContainer(parentContainerID, accordianContainerID) {
  $("#" + parentContainerID).append(
    `<div class="accordion" id="${accordianContainerID}"></div>`
  );
}
//////////////////////////////////////////////////////////////////////////////////////////////
var panelCollapseI = 1;
function addAccordianCard(
  accordianContainerID,
  accordianCardHeaderID,
  accordianCardBodyID,
  accordianCardHeaderContent,
  accordianCardBodyContent,
  show,
  onclick,
  toolTip
) {
  var collapsed;
  if (toolTip === undefined || toolTip === null) {
    toolTip = "";
  }
  if (show === true || show === "true" || show === "show") {
    show = "show";
    collapsed = "";
  } else {
    show = "";
    collapsed = "collapsed";
  }
  $("#" + accordianContainerID).append(`
    <div>
      <div class=" px-0 py-2 sub-panel-title ${collapsed}" id="${accordianCardHeaderID}" data-toggle="collapse" data-target="#${accordianCardBodyID}"
        aria-expanded="false" aria-controls="${accordianCardBodyID}" onclick = '${onclick}'>
      <a class = 'collapse-title' title="${toolTip}"  >
        ${accordianCardHeaderContent} </a>
      </div>
      <div id="${accordianCardBodyID}" class="panel-collapse-${panelCollapseI} super-panel-collapse panel-collapse collapse panel-body pl-3 py-0  ${show} bg-black" aria-labelledby="${accordianCardHeaderID}"
        data-parent="#${accordianContainerID}">
        <div title="${toolTip}">${accordianCardBodyContent}</div>
      </div>
    </div>`);
  // $('#'+accordianCardBodyID+'.super-panel-collapse').on('hidden.bs.collapse', function () {
  // find the children and close them
  // $(!this).find('.show').collapse('hide');
  // console.log('hello')
  // $('.panel-collapse.show.collapse.toggle-collapse').collapse('hide');
  // stopAllTools();
  // });
  panelCollapseI++;
}
//////////////////////////////////////////////////////////////////////////////////////////////
function addSubAccordianCard(
  accordianContainerID,
  accordianCardHeaderID,
  accordianCardBodyID,
  accordianCardHeaderContent,
  accordianCardBodyContent,
  show,
  onclick,
  toolTip
) {
  var collapsed;
  if (toolTip === undefined || toolTip === null) {
    toolTip = "";
  }
  if (show === true || show === "true" || show === "show") {
    show = "show";
    collapsed = "";
  } else {
    show = "";
    collapsed = "collapsed";
  }
  $("#" + accordianContainerID).append(`
    <div>
      <div class=" px-0 py-2 sub-sub-panel-title ${collapsed}" id="${accordianCardHeaderID}" data-toggle="collapse" data-target="#${accordianCardBodyID}"
        aria-expanded="false" aria-controls="${accordianCardBodyID}" onclick = '${onclick}'>
      <a class = 'collapse-title' title="${toolTip}"  >
        ${accordianCardHeaderContent} </a>
      </div>
      <div id="${accordianCardBodyID}" class="panel-collapse-${panelCollapseI} toggle-collapse panel-collapse collapse panel-body pl-3 py-0  ${show} bg-black" aria-labelledby="${accordianCardHeaderID}"
        data-parent="#${accordianContainerID}">
        <div title="${toolTip}">${accordianCardBodyContent}</div>
      </div>
    </div>`);
  //  $('.panel-collapse.toggle-collapse').on('hidden.bs.collapse', function () {
  //  	console.log('hello')
  //  	// find the children and close them
  //  	$(this).find('.show').collapse('hide');
  //  	// $('.panel-collapse.show.collapse.toggle-collapse').collapse('hide');
  // });

  panelCollapseI++;
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Functions to run the walk through
function getWalkThroughCollapseContainerID() {
  var collapseContainer;
  if ($(window).width() < 768) {
    collapseContainer = "sidebar-left";
  } else {
    collapseContainer = "legendDiv";
  }
  return collapseContainer;
}
function moveElement(selectorFrom, appendToID) {
  $(selectorFrom).detach().appendTo(appendToID);
}
function moveCollapse(
  baseID,
  collapseContainer = getWalkThroughCollapseContainerID()
) {
  // $('#'+baseID+'-label').detach().appendTo('#'+collapseContainer);
  moveElement("#" + baseID + "-label", "#" + collapseContainer);
  // $('#'+baseID+'-div').detach().appendTo('#'+collapseContainer);
  moveElement("#" + baseID + "-div", "#" + collapseContainer);
}

//////////////////////////////////////////////////////////////////////////////////////////////
//Legend functions
function addLegendCollapse() {
  var collapseContainer = getWalkThroughCollapseContainerID();
  addCollapse(
    getWalkThroughCollapseContainerID(),
    "chart-collapse-label",
    "chart-collapse-div",
    `<div id='query-spinner' style = 'display:inline;'>QUERY OUTPUTS 
    </div>
    `,
    '<i class="fa fa-list  mx-0" aria-hidden="true"></i>',
    true,
    ``,
    "Query Visible Map Layers outputs will appear here"
  );
  addCollapse(
    collapseContainer,
    "legend-collapse-label",
    "legend-collapse-div",
    "LEGEND",
    '<i class="fa fa-location-arrow fa-rotate-45 mx-1" aria-hidden="true"></i>',
    true,
    ``,
    "LEGEND of the layers displayed on the map"
  );

  $("#chart-collapse-div").append(`<div role="list" id="chart-list"></div>`);
  $("#chart-collapse-label-chart-collapse-div").hide();
  $("#chart-collapse-div").removeClass("px-5");
  $("#chart-collapse-div").addClass("px-3");
  // $('#legend-collapse-div').append(`<legend-list   id="legend"></legend-list>`)
  $("#legend-collapse-div").append(
    `<div role="list" id="legend-layer-list"></div>`
  );
  $("#legend-collapse-div").append(
    `<div role="list" id="legend-reference-layer-list"></div>`
  );
  $("#legend-collapse-div").append(
    `<div role="list" id="legend-related-layer-list"></div>`
  );
  $("#legend-collapse-div").append(
    `<div role="list" id="legend-fhp-div"></div>`
  );
  $("#legend-collapse-div").append(
    `<div role="list" id="time-lapse-legend-list"></div>`
  );
  $("#legend-collapse-div").append(
    `<div role="list" id="legend-county-selection-layer-list"></div>`
  );

  $("#legend-collapse-div").append(
    `<div role="list" id="legend-area-charting-select-layer-list"></div>`
  );

  if (mode === "sequoia-view") {
    addCollapse(
      getWalkThroughCollapseContainerID(), //"sidebar-left",
      "table-collapse-label",
      "table-collapse-div",
      "MONITORING SITES",
      `<img class='panel-title-svg-lg'  alt="Graph icon" src="./src/assets/Icons_svg/graph_ffffff.svg">`,
      true,
      ``,
      "Giant Sequoia monitoring sites output table"
    );
  }
}
function addLegendContainer(legendContainerID, containerID, show, toolTip) {
  if (containerID === undefined || containerID === null) {
    containerID = "legend-collapse-div";
  }
  if (show === undefined || show === null) {
    show = true;
  }
  if (show) {
    show = "block";
  } else {
    show = "none";
  }
  $("#" + containerID)
    .prepend(`<div class = 'py-1 row' title= '${toolTip}' style = 'display:${show};' id = '${legendContainerID}'>
								</div>`);
}

function addClassLegendContainer(
  classLegendContainerID,
  legendContainerID,
  classLegendTitle
) {
  $("#" + legendContainerID).append(`<div class='my-legend'>
										<div class = 'legend-title'>${classLegendTitle}</div>
										<div class='legend-scale'>
									  		<ul class='legend-labels' id = '${classLegendContainerID}'></ul>
										</div>
									</div>`);
}
function addClassLegendEntry(classLegendContainerID, obj) {
  $("#" + classLegendContainerID).append(
    `<li><span style='border: ${obj.classStrokeWeight}px solid #${
      obj.classStrokeColor
    };background:${addColorHash(obj.classColor)};'></span>${obj.className}</li>`
  );
}

function addColorRampLegendEntry(legendContainerID, obj) {
  $("#" + legendContainerID)
    .append(`<li class = 'legend-colorRamp' title= '${obj.helpBoxMessage}'>
							            <div class = 'legend-title'>${obj.name}</div>
							            <div class = 'colorRamp'style='${obj.colorRamp};'></div>
							            <div>
							                <span class = 'leftLabel'>${obj.min}</span>
							                <span class = 'rightLabel'>${obj.max}</span>
							            </div>
							            
							        </li> `);
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to disable rerun button when there are still outstanding GEE requests
function regulateReRunButton() {
  if (outstandingGEERequests > 0) {
    $("#reRun-button").prop("disabled", true);
    $("#reRun-button").prop(
      "title",
      staticTemplates.reRunButtonDisabledTooltip
    );
  } else {
    $("#reRun-button").prop("disabled", false);
    $("#reRun-button").prop("title", staticTemplates.reRunButtonEnabledTooltip);
  }
}
//Function to help keep track of GEE requests
function updateOutstandingGEERequests() {
  // $('#loading-number-box').html(outstandingGEERequests)

  if (outstandingGEERequests === 0) {
    $("#gee-queue-len").hide();
  } else {
    $("#gee-queue-len").show();
    $("#outstanding-gee-requests").html(outstandingGEERequests);
  }

  regulateReRunButton();
}
function updateGEETileLayersLoading() {
  $("#number-gee-tiles-downloading").html(geeTileLayersDownloading);
}
function incrementOutstandingGEERequests() {
  outstandingGEERequests++;
  updateOutstandingGEERequests();
}
function decrementOutstandingGEERequests() {
  outstandingGEERequests--;
  updateOutstandingGEERequests();
}

function incrementGEETileLayersLoading() {
  geeTileLayersDownloading++;
  updateGEETileLayersLoading();
}
function decrementGEETileLayersLoading() {
  geeTileLayersDownloading--;
  updateGEETileLayersLoading();
}
function updateGEETileLayersDownloading() {
  geeTileLayersDownloading = Object.values(layerObj).filter(function (v) {
    return v.loading;
  }).length;
  updateGEETileLayersLoading();
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function for adding map layers of various sorts to the map
//Map layers can be ee objects, geojson, dynamic map services, and tile map services

function addLayer(layer) {
  //Initialize a bunch of variables
  layer.loadError = false;
  var id = layer.legendDivID;
  layer.id = id;
  var queryID = id + "-" + layer.ID;
  var containerID = id + "-container-" + layer.ID;
  var opacityID = id + "-opacity-" + layer.ID;
  var visibleID = id + "-visible-" + layer.ID;
  var spanID = id + "-span-" + layer.ID;
  var visibleLabelID = visibleID + "-label-" + layer.ID;
  var spinnerID = id + "-spinner-" + layer.ID;
  var eraserID = `${id}-eraser-${layer.ID}`;
  var selectionID = id + "-selection-list-" + layer.ID;
  var checked = "";
  let isDraggable = "draggable-layer";
  layerObj[id] = layer;
  layer.wasJittered = false;
  layer.loading = false;
  layer.refreshNumber = refreshNumber;
  if (layer.visible) {
    checked = "checked";
  }

  if (layer.viz.isTimeLapse) {
    // console.log(timeLapseObj[layer.viz.timeLapseID]);
    timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.push(id);
    timeLapseObj[layer.viz.timeLapseID].sliders.push(opacityID);
    timeLapseObj[layer.viz.timeLapseID].layerVisibleIDs.push(visibleID);
    isDraggable = "not-draggable-layer";
  }
  if (
    layer.layerType === "geeVector" ||
    layer.layerType === "geoJSONVector" ||
    layer.layerType === "dynamicMapService"
  ) {
    isDraggable = "not-draggable-layer";
  }
  //Set up layer control container
  $("#" + layer.whichLayerList)
    .prepend(`<li id = '${containerID}' aria-label="Map layer controls container for ${layer.name}" class = 'layer-container ${isDraggable}'  title= '${layer.helpBoxMessage}'>
								           <div id="${opacityID}" aria-labelledby="${containerID}" aria-label="Opacity range slider for ${layer.name}" class = 'simple-layer-opacity-range'></div>
								           <input  role="option" id="${visibleID}" aria-label="Layer visibility toggle checkbox for ${layer.name}" type="checkbox" ${checked}  />
								            <label class = 'layer-checkbox' id="${visibleLabelID}" aria-label="Layer visibility toggle checkbox for ${layer.name}" style = 'margin-bottom:0px;display:none;'  for="${visibleID}"></label>
								            <i id = "${spinnerID}" class="fa fa-spinner fa-spin layer-spinner" title='Waiting for layer service from Google Earth Engine'></i>
								            <i id = "${spinnerID}2" style = 'display:none;' class="fa fa-cog fa-spin layer-spinner" title='Waiting for map tiles from Google Earth Engine'></i>
								            <i id = "${spinnerID}3" style = 'display:none;' class="fa fa-cog fa-spin layer-spinner" title='Waiting for map tiles from Google Earth Engine'></i>
                                            <i title = 'Click to clear all selected features from this layer' id='${eraserID}' class="fa fa-eraser eraser" style="display:none;"></i>
								            <span id = '${spanID}' aria-labelledby="${containerID}" class = 'layer-span'>${layer.name}</span>
								       </li>`);
  //Set up opacity slider
  $("#" + opacityID).slider({
    min: 0,
    max: 100,
    step: 1,
    value: layer.opacity * 100,
    slide: function (e, ui) {
      layer.opacity = ui.value / 100;
      if (layer.viz.isTimeLapse === false) {
        urlParams.layerProps[layer.id].opacity = layer.opacity;
      }
      // console.log(layer.opacity);
      if (
        layer.layerType !== "geeVector" &&
        layer.layerType !== "geoJSONVector"
      ) {
        layer.layer.setOpacity(layer.opacity);
      } else {
        var style = layer.layer.getStyle();
        style.strokeOpacity = layer.opacity;
        style.fillOpacity = layer.opacity / layer.viz.opacityRatio;
        layer.layer.setStyle(style);
        if (layer.visible) {
          layer.range;
        }
      }
      if (layer.visible) {
        layer.rangeOpacity = layer.opacity;
      }
      layerObj[id].visible = layer.visible;
      layerObj[id].opacity = layer.opacity;
      setRangeSliderThumbOpacity();
    },
  });
  function setRangeSliderThumbOpacity() {
    // console.log([opacityID,layer.rangeOpacity].join('-'))
    $(`#${opacityID}`).css(
      "background-color",
      `rgba(55, 46, 44,${layer.rangeOpacity})!important`
    );
  }
  //Progress bar controller
  function updateProgress() {
    var pct = layer.percent;
    if (
      pct === 100 &&
      mode !== "lcms-dashboard" &&
      (layer.layerType === "geeImage" ||
        layer.layerType === "geeVectorImage" ||
        layer.layerType === "geeImageCollection")
    ) {
      jitterZoom();
    }
    $("#" + containerID).css(
      "background",
      `-webkit-linear-gradient(left, #FFF, #FFF ${pct}%, transparent ${pct}%, transparent 100%)`
    );
  }
  //Function for zooming to object
  function zoomFunction() {
    if (layer.layerType === "geeVector") {
      centerObject(layer.item);
    } else if (
      layer.layerType === "geeVectorImage" &&
      (layer.viz.bounds === undefined || layer.viz.bounds !== null)
    ) {
      centerObject(layer.viz.asyncBounds);
    } else if (layer.layerType === "geoJSONVector") {
      // centerObject(ee.FeatureCollection(layer.item.features.map(function(t){return ee.Feature(t).dissolve(100,ee.Projection('EPSG:4326'))})).geometry().bounds())
      // synchronousCenterObject(layer.item.features[0].geometry)
    } else {
      if (
        layer.item.args !== undefined &&
        layer.item.args.value !== null &&
        layer.item.args.value !== undefined
      ) {
        synchronousCenterObject(layer.item.args.value);
      } else if (
        layer.item.args !== undefined &&
        layer.item.args.featureCollection !== undefined &&
        layer.item.args.featureCollection.args !== undefined &&
        layer.item.args.featureCollection.args.value !== undefined &&
        layer.item.args.featureCollection.args.value !== undefined
      ) {
        synchronousCenterObject(layer.item.args.featureCollection.args.value);
      } else if (layer.viz.bounds !== undefined && layer.viz.bounds !== null) {
        synchronousCenterObject(layer.viz.bounds);
      } else {
        centerObject(layer.item);
      }
    }
  }
  //Try to handle load failures
  function loadFailure(failure) {
    layer.loadError = true;
    console.log("GEE Tile Service request failed for " + layer.name);
    console.log(containerID);
    $("#" + containerID).css("background", "red");
    $("#" + containerID).attr(
      "title",
      'Layer failed to load. Error message: "' + failure + '"'
    );
    // getGEEMapService();
  }
  //Function to handle turning off of different types of layers
  function turnOff() {
    ga("send", "event", "layer-off", layer.layerType, layer.name);
    if (!layer.viz.isTimeLapse) {
      urlParams.layerProps[id].visible = false;
    }
    if (layer.layerType === "dynamicMapService") {
      layer.layer.setMap(null);
      layer.visible = false;
      layer.percent = 0;
      layer.rangeOpacity = 0;
      setRangeSliderThumbOpacity();
      updateProgress();
      $("#" + layer.legendDivID).hide();
    } else if (
      layer.layerType !== "geeVector" &&
      layer.layerType !== "geoJSONVector"
    ) {
      layer.visible = false;
      layer.map.overlayMapTypes.setAt(layer.layerId, null);
      layer.percent = 0;
      updateProgress();
      $("#" + layer.legendDivID).hide();
      layer.rangeOpacity = 0;
      if (
        layer.layerType !== "tileMapService" &&
        layer.layerType !== "dynamicMapService" &&
        layer.canQuery
      ) {
        queryObj[queryID].visible = layer.visible;
      }
    } else {
      layer.visible = false;

      layer.percent = 0;
      updateProgress();
      $("#" + layer.legendDivID).hide();
      layer.layer.setMap(null);
      layer.rangeOpacity = 0;
      $("#" + spinnerID + "2").hide();
      // geeTileLayersDownloading = 0;
      // updateGEETileLayersLoading();
      if (layer.layerType === "geeVector" && layer.canQuery) {
        queryObj[queryID].visible = layer.visible;
      }
    }
    if (layer.viz.dashboardSummaryLayer) {
      Object.keys(layer.dashboardSelectedFeatures).map((nm) =>
        layer.dashboardSelectedFeatures[nm].polyList.map((p) => p.setMap(null))
      );
      updateDashboardCharts();
      updateDashboardHighlights();
    }
    layer.loading = false;
    updateGEETileLayersDownloading();

    $("#" + spinnerID + "2").hide();
    $("#" + spinnerID + "3").hide();
    vizToggleCleanup();

    if (!layer.viz.isTimeLapse) {
      if (areaChart.autoChartingOn && layer.viz.canAreaChart) {
        areaChart.chartMapExtent();
      }
    }
  }
  //Function to handle turning on different layer types
  function turnOn() {
    ga("send", "event", "layer-on", layer.layerType, layer.name);
    if (!layer.viz.isTimeLapse) {
      if (turnOffLayersWhenTimeLapseIsOn) {
        turnOffTimeLapseCheckboxes();
      }

      urlParams.layerProps[id].visible = true;
    }
    if (layer.layerType === "dynamicMapService") {
      layer.layer.setMap(map);
      layer.visible = true;
      layer.percent = 100;
      layer.rangeOpacity = layer.opacity;
      setRangeSliderThumbOpacity();
      updateProgress();
      $("#" + layer.legendDivID).show();
    } else if (
      layer.layerType !== "geeVector" &&
      layer.layerType !== "geoJSONVector"
    ) {
      layer.visible = true;
      layer.map.overlayMapTypes.setAt(layer.layerId, layer.layer);
      $("#" + layer.legendDivID).show();
      layer.rangeOpacity = layer.opacity;
      if (layer.isTileMapService) {
        layer.percent = 100;
        updateProgress();
      }
      if (!layer.viz.isTimeLapse) {
        layer.layer.setOpacity(layer.opacity);
      }
      if (
        layer.layerType !== "tileMapService" &&
        layer.layerType !== "dynamicMapService" &&
        layer.canQuery
      ) {
        queryObj[queryID].visible = layer.visible;
      }
    } else {
      layer.visible = true;
      layer.percent = 100;
      updateProgress();
      $("#" + layer.legendDivID).show();
      layer.layer.setMap(layer.map);
      layer.rangeOpacity = layer.opacity;
      if (layer.layerType === "geeVector" && layer.canQuery) {
        queryObj[queryID].visible = layer.visible;
      }
    }
    if (layer.viz.dashboardSummaryLayer) {
      Object.keys(layer.dashboardSelectedFeatures).map((nm) =>
        layer.dashboardSelectedFeatures[nm].polyList.map((p) => p.setMap(map))
      );
      // if (mode === "lcms-dashboard") {
      // dashboardBoxSelect();
      // } else {
      updateDashboardCharts();
      updateDashboardHighlights();
      // }
    }
    vizToggleCleanup();
    if (!layer.viz.isTimeLapse) {
      if (areaChart.autoChartingOn && layer.viz.canAreaChart) {
        areaChart.chartMapExtent();
      }
    }
  }
  //Some functions to keep layers tidy
  function vizToggleCleanup() {
    setRangeSliderThumbOpacity();
    layerObj[id].visible = layer.visible;
    layerObj[id].opacity = layer.opacity;
  }
  function checkFunction() {
    if (!layer.loadError) {
      if (layer.visible) {
        turnOff();
      } else {
        turnOn();
      }
    }
  }
  function turnOffAll() {
    if (layer.visible) {
      $("#" + visibleID).click();
    }
  }
  function turnOnAll() {
    if (!layer.visible) {
      $("#" + visibleID).click();
    }
  }
  $("#" + opacityID).val(layer.opacity * 100);

  //Handle double clicking
  var prevent = false;
  var delay = 200;
  $("#" + spanID).click(function () {
    setTimeout(function () {
      if (!prevent) {
        $("#" + visibleID).click();
      }
    }, delay);
  });
  $("#" + spinnerID + "2").click(function () {
    $("#" + visibleID).click();
  });
  //Try to zoom to layer if double clicked
  $("#" + spanID).dblclick(function () {
    zoomFunction();
    prevent = true;
    zoomFunction();
    if (!layer.visible) {
      $("#" + visibleID).click();
    }
    setTimeout(function () {
      prevent = false;
    }, delay);
  });

  //If checkbox is toggled
  $("#" + visibleID).change(function () {
    checkFunction();
  });

  layerObj[id].visible = layer.visible;
  layerObj[id].opacity = layer.opacity;

  //Handle different scenarios where all layers need turned off or on
  if (!layer.viz.isTimeLapse) {
    $(".layer-checkbox").on("turnOffAll", function () {
      turnOffAll();
    });
  }
  if (
    layer.layerType === "geeVector" ||
    layer.layerType === "geeVectorImage" ||
    layer.layerType === "geoJSONVector"
  ) {
    $("#" + visibleLabelID).addClass("vector-layer-checkbox");
    $(".vector-layer-checkbox").on("turnOffAll", function () {
      turnOffAll();
    });
    $(".vector-layer-checkbox").on("turnOnAll", function () {
      turnOnAll();
    });
    $(".vector-layer-checkbox").on("turnOffAllVectors", function () {
      turnOffAll();
    });
    $(".vector-layer-checkbox").on("turnOnAllVectors", function () {
      turnOnAll();
    });

    if (layer.viz.isUploadedLayer) {
      $("#" + visibleLabelID).addClass("uploaded-layer-checkbox");
      selectionTracker.uploadedLayerIndices.push(layer.layerId);
      $(".vector-layer-checkbox").on("turnOffAllUploadedLayers", function () {
        turnOffAll();
      });
      $(".vector-layer-checkbox").on("turnOnAllUploadedLayers", function () {
        turnOnAll();
      });
    }
  }

  //Handle different object types
  if (
    layer.layerType === "geeImage" ||
    layer.layerType === "geeVectorImage" ||
    layer.layerType === "geeImageCollection"
  ) {
    //Handle image colletions
    if (layer.layerType === "geeImageCollection") {
      // layer.item = ee.ImageCollection(layer.item);
      layer.imageCollection = layer.item;

      if (layer.viz.reducer === null || layer.viz.reducer === undefined) {
        layer.viz.reducer = ee.Reducer.lastNonNull();
      } else if (typeof layer.viz.reducer === "string") {
        try {
          layer.viz.reducer = ee.Deserializer.fromJSON(layer.viz.reducer);
        } catch (err) {
          layer.viz.reducer = eval(layer.viz.reducer);
        }
      }
      var bandNames = ee.Image(layer.item.first()).bandNames();
      layer.item = ee.Image(
        ee
          .ImageCollection(layer.item)
          .reduce(layer.viz.reducer)
          .rename(bandNames)
          .copyProperties(layer.imageCollection.first())
          .set(layer.item.toDictionary())
      );
      if (layer.viz.selfMask === true) {
        layer.item = layer.item.selfMask();
      }

      //Handle vectors
    } else if (
      layer.layerType === "geeVectorImage" ||
      layer.layerType === "geeVector"
    ) {
      if (layer.viz.isSelectLayer) {
        selectedFeaturesJSON[layer.name] = {
          layerName: layer.name,
          filterList: [],
          geoJSON: new google.maps.Data(),
          id: layer.id,
          rawGeoJSON: {},
          selection: ee.FeatureCollection([]),
        };
        // selectedFeaturesJSON[layer.name].geoJSON.setMap(layer.map);

        // layer.infoWindow = getInfoWindow(infoWindowXOffset);
        // infoWindowXOffset += 30;
        // selectedFeaturesJSON[layer.name].geoJSON.setStyle({strokeColor:invertColor(layer.viz.strokeColor)});
        // layer.queryVector = layer.item;
        $("#" + visibleLabelID).addClass("select-layer-checkbox");
        $(".vector-layer-checkbox").on("turnOffAllSelectLayers", function () {
          turnOffAll();
        });
        $(".vector-layer-checkbox").on("turnOnAllSelectLayers", function () {
          turnOnAll();
        });
        $(".vector-layer-checkbox").on("turnOffAll", function () {
          turnOffAll();
        });
        $(".vector-layer-checkbox").on("turnOnAll", function () {
          turnOnAll();
        });
      }
      layer.queryItem = layer.item;
      if (layer.layerType === "geeVectorImage") {
        try {
          layer.viz.asyncBounds = layer.item
            .geometry()
            .bounds(100, "EPSG:4326");
        } catch (err) {
          layer.viz.asyncBounds = layer.item.bounds(100, "EPSG:4326");
        }

        layer.item = ee.Image().paint(layer.item, null, layer.viz.strokeWeight);
        layer.viz.palette = layer.viz.strokeColor;
      }
      //Add functionality for select layers to be clicked and selected
      if (layer.viz.isSelectLayer) {
        if (layer.viz.selectLayerNameProperty === undefined) {
          var name;
          layer.queryItem
            .first()
            .propertyNames()
            .evaluate(function (propertyNames, failure) {
              if (failure !== undefined) {
                name = "system:index"; //showMessage('Error',failure)
              } else {
                propertyNames.map(function (p) {
                  if (p.toLowerCase().indexOf("name") !== -1) {
                    name = p;
                  }
                });
                if (name === undefined) {
                  name = "system:index";
                }
              }
              selectedFeaturesJSON[layer.name].fieldName = name;
              selectedFeaturesJSON[layer.name].eeObject =
                layer.queryItem.select([name], ["name"]);
            });
        } else {
          selectedFeaturesJSON[layer.name].fieldName =
            layer.viz.selectLayerNamePropertyname;
          selectedFeaturesJSON[layer.name].eeObject = layer.queryItem.select(
            [layer.viz.selectLayerNameProperty],
            ["name"]
          );
        }
      }
      if (layer.viz.isSelectedLayer) {
        $("#" + visibleLabelID).addClass("selected-layer-checkbox");
        $(".vector-layer-checkbox").on("turnOffAllSelectLayers", function () {
          turnOffAll();
        });
        $(".vector-layer-checkbox").on("turnOnAllSelectLayers", function () {
          turnOnAll();
        });
        $(".vector-layer-checkbox").on("turnOffAllSelectedLayers", function () {
          turnOffAll();
        });
        $(".vector-layer-checkbox").on("turnOnAllSelectedLayers", function () {
          turnOnAll();
        });
        selectionTracker.seletedFeatureLayerIndices.push(layer.layerId);
      }
    }
    //Add layer to query object if it can be queried
    if (layer.canQuery) {
      queryObj[queryID] = {
        visible: layer.visible,
        queryItem: layer.queryItem,
        queryDict: layer.viz.queryDict,
        type: layer.layerType,
        queryParams: layer.viz.queryParams || {},
        name: layer.name,
        queryDateFormat: layer.viz.queryDateFormat,
      };
    }
    incrementOutstandingGEERequests();

    //Handle creating GEE map services
    function getGEEMapServiceCallback(eeLayer) {
      decrementOutstandingGEERequests();
      $("#" + spinnerID).hide();
      if (layer.viz.isTimeLapse) {
        timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs = timeLapseObj[
          layer.viz.timeLapseID
        ].loadingLayerIDs.filter((timeLapseLayerID) => timeLapseLayerID !== id);
        var prop = parseInt(
          (1 -
            timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length /
              timeLapseObj[layer.viz.timeLapseID].nFrames) *
            100
        );
        // $('#'+layer.viz.timeLapseID+'-loading-progress').css('width', prop+'%').attr('aria-valuenow', prop).html(prop+'% frames loaded');
        $("#" + layer.viz.timeLapseID + "-collapse-label").css(
          "background",
          `-webkit-linear-gradient(left, #FFF, #FFF ${prop}%, transparent ${prop}%, transparent 100%)`
        );

        // $('#'+layer.viz.timeLapseID+'-loading-count').html(`${timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length}/${timeLapseObj[layer.viz.timeLapseID].nFrames} layers to load`)
        if (timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length === 0) {
          $("#" + layer.viz.timeLapseID + "-loading-spinner").hide();
          $("#" + layer.viz.timeLapseID + "-year-label").hide();
          // $('#'+layer.viz.timeLapseID+'-loading-progress-container').hide();
          $("#" + layer.viz.timeLapseID + "-collapse-label").css(
            "background",
            `-webkit-linear-gradient(left, #FFF, #FFF ${0}%, transparent ${0}%, transparent 100%)`
          );

          if (timeLapseObj[layer.viz.timeLapseID].userChosenVisible === true) {
            console.log("here");
            $("#" + layer.viz.timeLapseID + "-toggle-checkbox-label").click();
          }

          // $('#'+layer.viz.timeLapseID+'-icon-bar').show();
          // $('#'+layer.viz.timeLapseID+'-time-lapse-layer-range-container').show();
          $("#" + layer.viz.timeLapseID + "-toggle-checkbox-label").show();

          timeLapseObj[layer.viz.timeLapseID].isReady = true;
        }
      }
      $("#" + visibleLabelID).show();

      if (layer.currentGEERunID === geeRunID) {
        if (eeLayer === undefined) {
          loadFailure();
        } else {
          //Set up GEE map service
          var MAPID = eeLayer.mapid;
          var TOKEN = eeLayer.token;
          layer.highWaterMark = 0;
          var tileIncremented = false;
          var eeTileSource = new ee.layers.EarthEngineTileSource(eeLayer);
          // console.log(eeTileSource)
          layer.layer = new ee.layers.ImageOverlay(eeTileSource);
          var overlay = layer.layer;
          //Set up callback to keep track of tile downloading
          layer.layer.addTileCallback(function (event) {
            event.count = event.loadingTileCount;
            if (event.count > layer.highWaterMark) {
              layer.highWaterMark = event.count;
            }

            layer.percent = 100 - (event.count / layer.highWaterMark) * 100;
            if (event.count === 0 && layer.highWaterMark !== 0) {
              layer.highWaterMark = 0;
            }

            if (layer.percent !== 100) {
              layer.loading = true;
              $("#" + spinnerID + "2").show();
              if (!tileIncremented) {
                incrementGEETileLayersLoading();
                tileIncremented = true;
                if (layer.viz.isTimeLapse) {
                  timeLapseObj[layer.viz.timeLapseID].loadingTilesLayerIDs.push(
                    id
                  );
                }
              }
            } else {
              layer.loading = false;
              $("#" + spinnerID + "2").hide();
              decrementGEETileLayersLoading();
              if (layer.viz.isTimeLapse) {
                timeLapseObj[layer.viz.timeLapseID].loadingTilesLayerIDs =
                  timeLapseObj[
                    layer.viz.timeLapseID
                  ].loadingTilesLayerIDs.filter(
                    (timeLapseLayerID) => timeLapseLayerID !== id
                  );
              }
              tileIncremented = false;
            }
            //Handle the setup of layers within a time lapse
            if (layer.viz.isTimeLapse) {
              var loadingTimelapseLayers = Object.values(layerObj).filter(
                function (v) {
                  return (
                    v.loading &&
                    v.viz.isTimeLapse &&
                    v.whichLayerList === layer.whichLayerList
                  );
                }
              );
              var loadingTimelapseLayersYears = loadingTimelapseLayers
                .map(function (f) {
                  return [f.viz.year, f.percent].join(":");
                })
                .join(", ");
              var notLoadingTimelapseLayers = Object.values(layerObj).filter(
                function (v) {
                  return (
                    !v.loading &&
                    v.viz.isTimeLapse &&
                    v.whichLayerList === layer.whichLayerList
                  );
                }
              );
              var notLoadingTimelapseLayersYears = notLoadingTimelapseLayers
                .map(function (f) {
                  return [f.viz.year, f.percent].join(":");
                })
                .join(", ");
              $("#" + layer.viz.timeLapseID + "-message-div").html(
                "Loading:<br>" +
                  loadingTimelapseLayersYears +
                  "<hr>Not Loading:<br>" +
                  notLoadingTimelapseLayersYears
              );
              var propTiles = parseInt(
                (1 -
                  timeLapseObj[layer.viz.timeLapseID].loadingTilesLayerIDs
                    .length /
                    timeLapseObj[layer.viz.timeLapseID].nFrames) *
                  100
              );
              // $('#'+layer.viz.timeLapseID+'-loading-progress').css('width', propTiles+'%').attr('aria-valuenow', propTiles).html(propTiles+'% tiles loaded');
              $("#" + layer.viz.timeLapseID + "-loading-gear").show();

              $("#" + layer.viz.timeLapseID + "-collapse-label").css(
                "background",
                `-webkit-linear-gradient(90deg, #FFF, #FFF ${propTiles}%, transparent ${propTiles}%, transparent 100%)`
              );
              if (propTiles < 100) {
                // console.log(propTiles)
                // if(timeLapseObj[layer.viz.timeLapseID] === 'play'){
                // pauseButtonFunction();
                // }
              } else {
                $("#" + layer.viz.timeLapseID + "-loading-gear").hide();
              }
            }

            // var loadingLayers = Object.values(layerObj).filter(function(v){return v.loading});
            // console.log(loadingLayers);
            updateProgress();
            // console.log(event.count);
            // console.log(inst.highWaterMark);
            // console.log(event.count / inst.highWaterMark);
            // console.log(layer.percent)
          });
          if (layer.visible) {
            layer.map.overlayMapTypes.setAt(layer.layerId, layer.layer);
            $("#" + layer.legendDivID).show();
            layer.rangeOpacity = layer.opacity;

            layer.layer.setOpacity(layer.opacity);
          } else {
            layer.map.overlayMapTypes.setAt(layer.layerId, null);
            $("#" + layer.legendDivID).hide();
            layer.rangeOpacity = 0;
          }
          setRangeSliderThumbOpacity();
        }
      }
    }
    function updateTimeLapseLoadingProgress() {
      var loadingTimelapseLayers = Object.values(layerObj).filter(function (v) {
        return (
          v.loading &&
          v.viz.isTimeLapse &&
          v.whichLayerList === layer.whichLayerList
        );
      }).length;
      var notLoadingTimelapseLayers = Object.values(layerObj).filter(function (
        v
      ) {
        return (
          !v.loading &&
          v.viz.isTimeLapse &&
          v.whichLayerList === layer.whichLayerList
        );
      }).length;
      var total = loadingTimelapseLayers + notLoadingTimelapseLayers;
      var propTiles =
        (1 -
          loadingTimelapseLayers /
            timeLapseObj[layer.viz.timeLapseID].nFrames) *
        100;

      $("#" + layer.viz.timeLapseID + "-collapse-label").css(
        "background",
        `-webkit-linear-gradient(0deg, #FFF, #FFF ${propTiles}%, transparent ${propTiles}%, transparent 100%)`
      );
      if (propTiles < 100) {
        $("#" + layer.viz.timeLapseID + "-loading-gear").show();
        // console.log(propTiles)
        // if(timeLapseObj[layer.viz.timeLapseID] === 'play'){
        // pauseButtonFunction();
        // }
      } else {
        $("#" + layer.viz.timeLapseID + "-loading-gear").hide();
      }
    }
    //Handle alternative GEE tile service format
    function geeAltService(eeLayer, failure) {
      decrementOutstandingGEERequests();
      $("#" + spinnerID).hide();
      if (layer.viz.isTimeLapse) {
        timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs = timeLapseObj[
          layer.viz.timeLapseID
        ].loadingLayerIDs.filter((timeLapseLayerID) => timeLapseLayerID !== id);
        var prop = parseInt(
          (1 -
            timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length /
              timeLapseObj[layer.viz.timeLapseID].nFrames) *
            100
        );
        // $('#'+layer.viz.timeLapseID+'-loading-progress').css('width', prop+'%').attr('aria-valuenow', prop).html(prop+'% frames loaded');
        $("#" + layer.viz.timeLapseID + "-collapse-label").css(
          "background",
          `-webkit-linear-gradient(left, #FFF, #FFF ${prop}%, transparent ${prop}%, transparent 100%)`
        );

        // $('#'+layer.viz.timeLapseID+'-loading-count').html(`${timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length}/${timeLapseObj[layer.viz.timeLapseID].nFrames} layers to load`)
        if (timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length === 0) {
          $("#" + layer.viz.timeLapseID + "-loading-spinner").hide();
          $("#" + layer.viz.timeLapseID + "-year-label").hide();
          // $('#'+layer.viz.timeLapseID+'-loading-progress-container').hide();
          $("#" + layer.viz.timeLapseID + "-collapse-label").css(
            "background",
            `-webkit-linear-gradient(left, #FFF, #FFF ${0}%, transparent ${0}%, transparent 100%)`
          );

          // $('#'+layer.viz.timeLapseID+'-icon-bar').show();
          // $('#'+layer.viz.timeLapseID+'-time-lapse-layer-range-container').show();
          $("#" + layer.viz.timeLapseID + "-toggle-checkbox-label").show();

          timeLapseObj[layer.viz.timeLapseID].isReady = true;

          if (urlParams.layerProps[layer.viz.timeLapseID].visible === true) {
            timeLapseCheckbox(layer.viz.timeLapseID);
          }
          if (urlParams.cumulativeMode === true) {
            turnOnCumulativeMode();
          }
        }
      }
      $("#" + visibleLabelID).show();

      if (layer.currentGEERunID === geeRunID) {
        if (eeLayer === undefined || failure !== undefined) {
          loadFailure(failure);
        } else {
          const tilesUrl = eeLayer.urlFormat;

          var getTileUrlFun = function (coord, zoom) {
            var t = [coord, zoom];

            let url = tilesUrl
              .replace("{x}", coord.x)
              .replace("{y}", coord.y)
              .replace("{z}", zoom);
            if (!layer.loading) {
              layer.loading = true;
              layer.percent = 10;
              $("#" + spinnerID + "2").show();
              updateGEETileLayersDownloading();
              updateProgress();
              if (layer.viz.isTimeLapse) {
                updateTimeLapseLoadingProgress();
              }
            }

            return url;
          };
          layer.layer = new google.maps.ImageMapType({
            getTileUrl: getTileUrlFun,
          });
          // console.log(layer.name)
          // layer.layer = new ee.layers.ImageOverlay(new ee.layers.EarthEngineTileSource(eeLayer));
          // google.maps.event.addListener(layer.layer, "LOAD", (e)=>{
          //     console.log(e)
          // });
          layer.layer.addListener("tilesloaded", function (e) {
            layer.percent = 100;
            layer.loading = false;

            $("#" + spinnerID + "2").hide();
            updateGEETileLayersDownloading();
            updateProgress();
            if (layer.viz.isTimeLapse) {
              updateTimeLapseLoadingProgress();
            }
          });

          if (layer.visible) {
            layer.map.overlayMapTypes.setAt(layer.layerId, layer.layer);
            layer.rangeOpacity = layer.opacity;
            layer.layer.setOpacity(layer.opacity);
            $("#" + layer.legendDivID).show();
          } else {
            layer.rangeOpacity = 0;
            layer.map.overlayMapTypes.setAt(layer.layerId, null);
          }
          $("#" + spinnerID).hide();
          $("#" + visibleLabelID).show();

          setRangeSliderThumbOpacity();
        }
      }
    }
    //Asynchronous wrapper function to get GEE map service
    layer.mapServiceTryNumber = 0;
    function getGEEMapService() {
      // layer.item.getMap(layer.viz,function(eeLayer){getGEEMapServiceCallback(eeLayer)});

      //Handle embeded visualization params if available
      var vizKeys = Object.keys(layer.viz);
      var possibleVizKeys = [
        "bands",
        "min",
        "max",
        "gain",
        "bias",
        "gamma",
        "palette",
        "color",
      ];
      var vizFound = false;
      possibleVizKeys.map(function (k) {
        var i = vizKeys.indexOf(k) > -1;
        if (i) {
          vizFound = true;
        }
      });

      if (vizFound == false || layer.viz.autoViz) {
        layer.usedViz = {};
      } else {
        layer.usedViz = layer.viz;
      }

      let mapItem =
        layer.viz.bands !== undefined
          ? ee.Image(layer.item).select(layer.viz.bands)
          : ee.Image(layer.item);

      ee.Image(mapItem).getMap(layer.usedViz, function (eeLayer, failure) {
        if (eeLayer === undefined && layer.mapServiceTryNumber <= 1) {
          console.log(`Failed to load map service: ${layer.name}`);
          // queryObj[queryID].queryItem = layer.item;
          // layer.item = layer.item.visualize();
          getGEEMapService();
        } else {
          geeAltService(eeLayer, failure);
        }
      });

      // layer.item.getMap(layer.viz,function(eeLayer){
      // console.log(eeLayer)
      // console.log(ee.data.getTileUrl(eeLayer))
      // })
      layer.mapServiceTryNumber++;
    }
    getGEEMapService();

    //Handle different vector formats
  } else if (
    layer.layerType === "geeVector" ||
    layer.layerType === "geoJSONVector"
  ) {
    if (layer.canQuery) {
      queryObj[queryID] = {
        visible: layer.visible,
        queryItem: layer.queryItem,
        queryDict: layer.viz.queryDict,
        queryParams: layer.viz.queryParams || {},
        type: layer.layerType,
        name: layer.name,
      };
    }
    incrementOutstandingGEERequests();
    //Handle adding geoJSON to map
    function addGeoJsonToMap(v) {
      $("#" + spinnerID).hide();
      $("#" + visibleLabelID).show();

      if (layer.currentGEERunID === geeRunID) {
        if (v === undefined) {
          loadFailure();
        }
        layer.layer = new google.maps.Data();
        //  layer.viz.icon = {
        //    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        //    scale: 5,
        //    strokeWeight:2,
        //    strokeColor:"#B40404"
        // }
        layer.layer.setStyle(layer.viz);
        try {
          layer.layer.addGeoJson(v);
        } catch (err) {
          v = {
            type: "Feature",
            geometry: v,
            id: "0",
            properties: {},
          };
          layer.layer.addGeoJson(v);
        }

        if (layer.viz.clickQuery) {
          map.addListener("click", function () {
            infowindow.setMap(null);
          });
          layer.layer.addListener("click", function (event) {
            console.log(event);
            infowindow.setPosition(event.latLng);
            var infoContent = `<table class="table table-hover bg-white">
                            <tbody>`;
            var info = event.feature.j;
            Object.keys(info).map(function (name) {
              var value = info[name];
              infoContent += `<tr><th>${name}</th><td>${value}</td></tr>`;
            });
            infoContent += `</tbody></table>`;
            infowindow.setContent(infoContent);
            infowindow.open(map);
          });
        }

        featureObj[layer.name] = layer.layer;
        // console.log(this.viz);

        if (layer.visible) {
          layer.layer.setMap(layer.map);
          layer.rangeOpacity = layer.viz.strokeOpacity;
          layer.percent = 100;
          updateProgress();
          $("#" + layer.legendDivID).show();
        } else {
          layer.rangeOpacity = 0;
          layer.percent = 0;
          $("#" + layer.legendDivID).hide();
        }
        setRangeSliderThumbOpacity();
      }
    }
    if (layer.layerType === "geeVector") {
      decrementOutstandingGEERequests();
      layer.item.evaluate(function (v) {
        addGeoJsonToMap(v);
      });
    } else {
      decrementOutstandingGEERequests();
      addGeoJsonToMap(layer.item);
    }
    //Handle non GEE tile services
  } else if (layer.layerType === "tileMapService") {
    layer.layer = new google.maps.ImageMapType({
      getTileUrl: layer.item,
      tileSize: new google.maps.Size(256, 256),
      // tileSize: new google.maps.Size($('#map').width(),$('#map').height()),
      maxZoom: 15,
    });
    if (layer.visible) {
      layer.map.overlayMapTypes.setAt(layer.layerId, layer.layer);
      layer.rangeOpacity = layer.opacity;
      layer.layer.setOpacity(layer.opacity);
    } else {
      layer.rangeOpacity = 0;
      layer.map.overlayMapTypes.setAt(layer.layerId, null);
    }
    $("#" + spinnerID).hide();
    $("#" + visibleLabelID).show();
    setRangeSliderThumbOpacity();

    //Handle dynamic map services
  } else if (layer.layerType === "dynamicMapService") {
    function groundOverlayWrapper() {
      if (map.getZoom() > layer.item[1].minZoom) {
        return getGroundOverlay(
          layer.item[1].baseURL,
          layer.item[1].minZoom,
          layer.item[1].ending
        );
      } else {
        return getGroundOverlay(
          layer.item[0].baseURL,
          layer.item[0].minZoom,
          layer.item[0].ending
        );
      }
    }
    function updateGroundOverlay() {
      if (layer.layer !== null && layer.layer !== undefined) {
        layer.layer.setMap(null);
      }

      layer.layer = groundOverlayWrapper();

      if (layer.visible) {
        layer.layer.setMap(map);
        layer.percent = 100;
        updateProgress();
        groundOverlayOn = true;
        $("#" + layer.legendDivID).show();
        layer.layer.setOpacity(layer.opacity);
        layer.rangeOpacity = layer.opacity;
      } else {
        layer.rangeOpacity = 0;
      }
      setRangeSliderThumbOpacity();
    }
    updateGroundOverlay();
    // if(layer.visible){layer.opacity = 1}
    // else{this.opacity = 0}
    google.maps.event.addListener(map, "zoom_changed", function () {
      updateGroundOverlay();
    });

    google.maps.event.addListener(map, "dragend", function () {
      updateGroundOverlay();
    });
    $("#" + spinnerID).hide();
    $("#" + visibleLabelID).show();
    setRangeSliderThumbOpacity();
  }

  if (layer.viz.dashboardSummaryLayer) {
    function deleteAllSelected() {
      if (layer.visible) {
        Object.keys(layer.dashboardSelectedFeatures).map((fn) => {
          layer.dashboardSelectedFeatures[fn].polyList.map((p) =>
            p.setMap(null)
          );
          delete layer.dashboardSelectedFeatures[fn];
        });
        updateDashboardCharts();
        updateDashboardHighlights();
      }
    }
    // $(`#${eraserID}`).show();
    $(`#${eraserID}`).click(deleteAllSelected);
    layer.dashboardSelectedFeatures = {};
    layer.dashboardSummaryMode = layer.viz.dashboardSummaryMode;
    function mouseEventTracker(event) {
      console.log(event);
      console.log(`${layer.name} clicked`);

      if (dashboardAreaSelectionMode === "Click") {
        event.feature.toGeoJson((r) => {
          // console.log(r);
          let featureName =
            r.properties[layer.viz.dashboardFieldName].toString();
          if (
            Object.keys(layer.dashboardSelectedFeatures).indexOf(
              featureName
            ) === -1
          ) {
            layer.dashboardSelectedFeatures[featureName] = {
              geojson: r,
              polyList: [],
            };

            function getCoords(c) {
              if (c.type === "Polygon") {
                c.coordinates.map((c2) => {
                  let polyCoordsT = c2.map((c3) => {
                    return { lng: c3[0], lat: c3[1] };
                  });
                  layer.dashboardSelectedFeatures[featureName].polyList.push(
                    new google.maps.Polygon({
                      strokeColor: "#0FF",
                      fillColor: "#0FF",
                      fillOpacity: 0.3,
                      strokeOpacity: 0,
                      strokeWeight: 0,
                      path: polyCoordsT,
                      zIndex: -999,
                    })
                  );
                });
              } else if (c.type === "MultiPolygon") {
                // console.log(c);
                c.coordinates.map((c2) =>
                  getCoords({ type: "Polygon", coordinates: c2 })
                ); //c2.map(c3=>c3.map(c4=>coords.push({lng:c4[0],lat:c4[1]}))));
              } else if (c.type === "GeometryCollection") {
                c.geometries.map((g) => getCoords(g));
              }
            }
            getCoords(r.geometry);

            // var infoContent = `<table class="table table-hover bg-white">
            // <tbody>`

            // Object.keys(info).map(function(name){
            //     var value = info[name];
            //     infoContent +=`<tr><th>${name}</th><td>${value}</td></tr>`;
            // });
            // infoContent +=`</tbody></table>`;

            layer.dashboardSelectedFeatures[featureName].polyList.map((p) =>
              p.setMap(map)
            );
          } else {
            console.log(`Removing ${featureName}`);
            layer.dashboardSelectedFeatures[featureName].polyList.map((p) =>
              p.setMap(null)
            );
            delete layer.dashboardSelectedFeatures[featureName];
          }

          let selectedNames = Object.keys(layer.dashboardSelectedFeatures).join(
            ","
          );
          // $('#dashboard-results-collapse-div').append(selectedNames);
          updateDashboardCharts();
        });
      }

      // console.log(polyPath);
      // var prop = event.feature.getProperty(layer.viz.dashboardFieldName);
      // console.log(prop)
    }

    // layer.layer.addListener('click', mouseEventTracker)

    // layer.dragBox=addDragBox();
    // layer.dragBox.addListenTo(layer.layer,layer.id);
    // layer.dragBox.startListening();

    //   Object.values(layerObj).filter(l=>l.viz.dashboardSummaryLayer).map(v=>dragBox.addListenTo(v.layer,v.id))
    // layer.layer.addListener('mouseover', mouseEventTracker)
  }
}

//////////////////////////////////////////////////
// Function to listen allow for layer order changes and then update the map accordingly
function addLayerSortListener(
  containerSelector,
  layerSelector = ".layer-container.draggable-layer",
  layerSplitString = "-container-"
) {
  // Set up sortable layer list
  $(containerSelector).sortable({ items: `>${layerSelector}` });

  // Listen for sort stopping and then sort map layers accordingly
  $(containerSelector).on("sortstop", (e, ui) => {
    // Get the new order of layers
    var layerContainerIDs = $.map(
      $(`${containerSelector}>${layerSelector}`),
      (n) => n.id.split(layerSplitString)[0]
    );

    // Reverse them since map layers are bottom-up
    layerContainerIDs = layerContainerIDs.reverse();
    // console.log(layerContainerIDs);
    // Find the corresponding map layer ids and sort them
    var currentLayerIDs = layerContainerIDs
      .map((layerContainerID) => layerObj[layerContainerID].layerId)
      .sort((a, b) => a - b);
    // console.log(currentLayerIDs);

    // Iterate across each layer, clear it off the map, and update its layerId (index of its position in the layer list)
    layerContainerIDs.forEach((layerContainerID, i) => {
      let layer = layerObj[layerContainerID];

      // First clear out current layer
      // layer.map.overlayMapTypes.setAt(layer.layerId, null);

      // if (layer.layerType == "geeVector" || layer.layerType == "geoJSONVector") {
      // layer.layer.setMap(null);
      // }
      // Update the layer id
      layerObj[layerContainerID].layerId = currentLayerIDs[i];
    });

    // Add it back on the map if its visible
    layerContainerIDs.forEach((layerContainerID, i) => {
      let layer = layerObj[layerContainerID];
      if (layer.visible) {
        // console.log(`Adding ${layer.name} to the map ${layer.opacity}`);
        if (
          layer.layerType !== "geeVector" &&
          layer.layerType !== "geoJSONVector"
        ) {
          layer.map.overlayMapTypes.setAt(layer.layerId, layer.layer);
        } else {
          layer.map.overlayMapTypes.setAt(layer.layerId, null);
          layer.layer.setMap(layer.map);
        }

        // layer.layer.setOpacity(layer.opacity);
      } else {
        if (
          layer.layerType !== "geeVector" &&
          layer.layerType !== "geoJSONVector"
        ) {
          layer.map.overlayMapTypes.setAt(layer.layerId, null);
        } else {
          layer.layer.setMap(null);
        }
      }
    });
  });
}
//////////////////////////////////////////////////
// Transition charting input UI setup
function getTransitionRowData() {
  var periods = [];
  var periodsValid = true;
  periods.push([
    parseInt($("#first-transition-row td input:first").val()),
    parseInt($("#first-transition-row td input:last").val()),
  ]);

  let rowI = 1;
  $("#added-transition-rows tr").each(function () {
    let row = [];
    let colI = 0;
    $(this)
      .find("td")
      .each(function () {
        $(this)
          .find("input")
          .each(function () {
            let v = parseInt($(this).val());
            row.push(v);
          });
        colI++;
      });
    periods.push(row);
    rowI++;
  });
  periods.push([
    parseInt($("#last-transition-row td input:first").val()),
    parseInt($("#last-transition-row td input:last").val()),
  ]);
  var errorDict = {
    blank: "One or more blank value found",
    outsideYearRange: `Found years outside available year range. Please ensure all years are >= ${activeStartYear} and <= ${activeEndYear}.`,
    backwards:
      "One or more row has a first year that is greater than the last year",
    overlap:
      "Please ensure all transition periods have values and are in succession of one another and do not overlap",
  };
  var errorList = [];
  rowI = 0;
  periods.map((row) => {
    row.map((n) => {
      if (isNaN(n)) {
        errorList.push("blank");
      }
      if (n < activeStartYear || n > activeEndYear) {
        errorList.push("outsideYearRange");
      }
    });
    if (row[1] < row[0]) {
      errorList.push("backwards");
    }
    if (rowI > 0) {
      let previousRow = periods[rowI - 1];
      if (previousRow[1] >= row[0]) {
        errorList.push("overlap");
      }
    }
    rowI++;
  });
  if (errorList.length > 0) {
    let errorMessage =
      "The following errors were found:<br>" +
      unique(errorList)
        .map((e) => errorDict[e])
        .join("<br>");
    showMessage("Invalid Transition Periods Provided", errorMessage);
    periodsValid = false;
  }
  if (periodsValid) {
    return periods;
  } else {
    return null;
  }
}
function setupTransitionPeriodUI(containerID = "transition-periods-container") {
  $(`#${containerID}`).empty();
  $(`#${containerID}`).append(`
  <hr>
  <div class="row pb-2" title='Select Periods for Transition Area Charting. Please ensure each period does not completely overlap with the one preceeding it.'>
      <div style='padding-left:0.5rem;padding-right:0.5rem;width:100%;'>
  <p style='font-size:1.25rem;' >Transition Charting Periods</p>
          <table class="table " id="transition-period-table">
              <thead>
                  <tr>
                      
                      <th class="text-center">
                          First Year
                      </th>
                      <th class="text-center">
                          Last Year
                      </th>
                      
                  </tr>
              </thead>
              <tbody id='default-transition-start'> </tbody>
      <tbody id='added-transition-rows'></tbody>
      <tbody id='default-transition-end'></tbody>
     
          </table>

  <div class="input-group-prepend pl-2">
                          <button title = 'Click to add a transition period' class=" btn input-group-text bg-white search-box pr-1 pl-2" id="add-transition-row" onclick="addTransitionRow()"><i class="fa fa-plus teal " ></i></button>

                          <button title = 'Click to remove a transition period' style = 'border-radius: 0px 3px 3px 0px' class=" btn input-group-text bg-white search-box pr-1 pl-2" id="remove-transition-row" onclick="removeLastTransitionRow()"><i class="fa fa-minus teal "></i></button>
                      </div>
      </div>
  
  </div>
  
`);
  addRow(
    "default-transition-start",
    "first-transition-row",
    activeStartYear,
    activeStartYear + 2,
    true
  );
  addRow(
    "default-transition-end",
    "last-transition-row",
    activeEndYear - 2,
    activeEndYear,
    true
  );
}
var transitionRowI = 0;

function addRow(containerID, rowID, yr1, yr2, isBookend = false) {
  $(`#${containerID}`).append(`<tr id='${rowID}'>

<td>
<input type="number" min=${activeStartYear} max=${activeEndYear} title='Enter year between the year ranges above and below this row' value='${yr1}' placeholder='Enter Year' class="form-control"/>
</td>
<td>
<input type="number" min=${activeStartYear} max=${activeEndYear} title='Enter year between the year ranges above and below this row' value='${yr2}'  placeholder='Enter Year' class="form-control"/>
</td>
</tr>`);

  if (!isBookend) {
    $(`#${rowID}`).append(`<td>
    <button title = 'Click to remove this transition period' style = 'border-radius: 0px 3px 3px 0px' class=" btn input-group-text bg-white search-box pr-1 pl-2" onclick="removeRow('${rowID}')" id="${rowID}-remove-transition-row"><i class="fa fa-close teal "></i></button>
  </td>`);
  } else {
    $(`#${rowID}`).append(`<td>
    <button disabled title = 'Cannot remove this transition period since it is at the start or end' style = 'border-radius: 0px 3px 3px 0px' class=" btn input-group-text bg-white search-box pr-1 pl-2" onclick="removeRow('${rowID}')" id="${rowID}-remove-transition-row"><i class="fa fa-close gray invisible"></i></button>
  </td>`);
  }
}

function removeRow(rowID) {
  console.log(rowID);
  $(`#${rowID}`).remove();
}
function addTransitionRow() {
  addRow("added-transition-rows", `transition-row-${transitionRowI}`, "", "");
  transitionRowI++;
}
function removeLastTransitionRow() {
  $("#added-transition-rows tr:last").remove();
}
function updateProgress(id, val) {
  var el = document.querySelector(`${id} span`);
  el.style.width = val + "%";
  el.innerText = val + "%";
}
