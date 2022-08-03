/*Templates for elements and various functions to create more pre-defined elements*/
/////////////////////////////////////////////////////////////////////
/*Provide titles to be shown for each mode*/
const  titles = {
	'LCMS-pilot': {
		    leftWords: 'LCMS',
		    centerWords: 'DATA',
		    rightWords:'EXPLORER',
		    title:'LCMS Data Explorer'
			},
    'LCMS': {
            leftWords: `<img style = 'width:2rem;height:1.8rem;margin-top:-0.5rem;margin-left:0.1rem;margin-right:0.1rem;' alt="LCMS icon" src="images/logo_icon_lcms-data-viewer.svg">LCMS`,
            leftWordsSimple:'LCMS',
            centerWords: 'DATA',
            rightWords:'EXPLORER',
            title:'LCMS Data Explorer'
            },
    'lcms-base-learner': {
            leftWords: `<img style = 'width:2rem;height:1.8rem;margin-top:-0.5rem;margin-left:0.1rem;margin-right:0.1rem;' alt="LCMS icon" src="images/logo_icon_lcms-data-viewer.svg">LCMS`,
            leftWordsSimple:'LCMS',
            centerWords: 'Base-Learner',
            rightWords:'EXPLORER',
            title:'LCMS Base Learner Explorer'
            },
	'Ancillary': {
		    leftWords: 'Ancillary',
            leftWordsSimple:'Ancillary',
		    centerWords: 'DATA',
		    rightWords:'Viewer',
		    title:'TimeSync Ancillary Data Viewer'
			},
    'LT': {
            leftWords: `<img style = 'width:1.0em;height:0.9em;margin-top:-0.2em;margin-left:0.2em' class='image-icon mr-1' alt="LCMS icon" src="images/lcms-icon.png">LandTrendr`,
            leftWordsSimple:'LandTrendr',
            centerWords: 'DATA',
            rightWords:'EXPLORER',
            title:'LandTrendr Data Explorer'
            },
    'MTBS': {
            leftWords: `<img style = 'width:2rem;height:1.8rem;margin-top:-0.5rem;margin-left:0.1rem' class='image-icon ' alt="MTBS icon" src="images/mtbs-logo.png">MTBS`,
            leftWordsSimple:'MTBS',
            centerWords: 'DATA',
            rightWords:'EXPLORER',
            title:'MTBS Data Explorer'
            },
    'TEST': {
            leftWords: 'TEST',
            leftWordsSimple:'TEST',
            centerWords: 'DATA',
            rightWords:'Explorer',
            title:'TEST Data Viewer'
            },
    'IDS' : {
            leftWords: 'IDS',
            leftWordsSimple:'IDS',
            centerWords: 'DATA',
            rightWords:'EXPLORER',
            title:'Insect and Disease Detection Survey Data Viewer'
            },
    'geeViz': {
            leftWords: 'geeViz',
            leftWordsSimple:'geeViz',
            centerWords: 'DATA',
            rightWords:'Viewer',
            title:'geeViz Data Viewer'
            },
    'STORM': {
            leftWords: 'Storm',
            leftWordsSimple:'Storm',
            centerWords: 'Damage',
            rightWords:'Viewer',
            title:'Storm Damage Viewer'
            },
    'LAMDA': {
            leftWords: 'LAMDA',
            leftWordsSimple: 'LAMDA',
            centerWords: 'DATA',
            rightWords:'EXPLORER',
            title:'LAMDA Data Explorer'
            }     
}
//////////////////////////////////////////////////////////////////////
let specificAuthErrorMessages = {'LCMS':`<p>Try <a class = 'support-text' title = "A simple LCMS output viewer" href = "lcms-in-motion.html" target="_blank">this viewer</a> for a simple visualization of LCMS data products.</p>
                                <p>The <kbd>DOWNLOAD DATA</kbd> menu on the left (of this page) is still available for downloading LCMS data.</p>
                                <p>For more information on LCMS please visit the <a class = 'support-text' title = "LCMS Clearinghouse Page" href = "https://data.fs.usda.gov/geodata/rastergateway/LCMS/" target="_blank">LCMS Clearinghouse Page</a>.</p>`,
                                'MTBS':`<p>Try <a class = 'support-text' title = "MTBS Interactive Data Viewer" href = "https://www.mtbs.gov/viewer/?region=all" target="_blank">this viewer</a> for a simple MTBS product viewer.</p>`         
                                }
let specificAuthErrorMessage =specificAuthErrorMessages[mode];
if(specificAuthErrorMessage === undefined){specificAuthErrorMessage=``;}
let authErrorMessageContact =`<p>Please contact the LCMS help desk<a class = 'intro-modal-links' href = "mailto: sm.fs.lcms@usda.gov">(sm.fs.lcms@usda.gov)</a> if you have questions/comments about the ${mode} viewer or have feedback.</p>`;
if(mode==='MTBS'){
    authErrorMessageContact = `<p style = "margin-bottom:0px;">If you have any further questions about this, please <a class = 'intro-modal-links' href="https://www.mtbs.gov/contact" target="_blank" > contact us</a>.</p>`
}
//////////////////////////////////////////////////////////////////////
/*Add anything to head not already there*/
$('head').append(`<title>${titles[mode].title}</title>`);
$('head').append(`<script type="text/javascript" src="./js/gena-gee-palettes.js"></script>`);
let topBannerParams = titles[mode];
let studyAreaDropdownLabel = `<h5 class = 'teal p-0 caret nav-link dropdown-toggle ' id = 'studyAreaDropdownLabel'>Bridger-Teton National Forest</h5> `;
/////////////////////////////////////////////////////////////////////
//Provide a bunch of templates to use for various elements
function getIntroModal(iconPath,welcomeText,topText,middleText,bottomText){
    return `<div class="modal fade modal-full-screen-styling"  id="introModal" tabindex="-1" role="dialog" >
                <div style='max-width:700px;' class="modal-dialog" role="document">
                    <div class="modal-content text-dark modal-content-full-screen-styling" >
                       
                        <div class="modal-body" id = 'introModal-body'>
                        <button type="button" class="close m-0 ml-auto text-dark" data-dismiss="modal">&times;</button>
                            <span>
                                <img class = 'logo' src="${iconPath}"   alt="logo image">
                                <h1 id = 'intro-modal-title-banner' title="" class = '  splash-title' style="font-weight:100;font-family: 'Roboto';">${titles[mode].leftWordsSimple}<span  style="font-weight:1000;font-family: 'Roboto Black', sans-serif;"> ${titles[mode].centerWords} </span>${titles[mode].rightWords}</h1>
                            </span>
                         
                        <div style = 'block;margin-top:0.5rem;'>
                            <span  style="font-weight:bold">${welcomeText}</span>
                            ${topText}
                        </div>
                        ${middleText}
                        ${bottomText}
                        <div class = ' ml-0 m-0' id = 'intro-modal-loading-div'>
                            <p >
                              <img style="width:1.8em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="images/GEE_logo_transparent.png">
                                Creating map services within Google Earth Engine. 
                             </p>
                        </div>
                       
                        <div class="form-check  pl-0 mt-3 mb-2">
                            <input role="option" type="checkbox" class="form-check-input" id="dontShowAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
                            <label class=" text-uppercase form-check-label " for="dontShowAgainCheckbox" >Don't show again</label>
                        </div>
                    </div>
                        
                           
                        
                </div>
                </div>
            </div>`
}
const staticTemplates = {
	map:`<section aria-label="Map where all map outputs are displayed" onclick = "$('#study-area-list').hide();" class = 'map' id = 'map'> </section>`,
	mainContainer: `<main aria-label="Main container to contain all elements" class = 'container main-container' id = 'main-container'></main>`,
	sidebarLeftToggler:`<img style='height:3rem' title = 'Click to toggle sidebar visibility' class='sidebar-toggler' src='./images/menu-hamburger_ffffff.svg' onclick = 'toggleSidebar()' >`,
    sidebarLeftContainer: `
						<nav onclick = "$('#study-area-list').hide();" class = 'col-sm-7 col-md-4 col-lg-4 col-xl-3 sidebar  p-0 m-0 flexcroll  ' id = 'sidebar-left-container'>

					        <header id = 'sidebar-left-header'>
                                
                                </header>
                            
					        <div role="list" id = 'sidebar-left'></div>
					    </nav>`,
	geeSpinner : `<div id='summary-spinner' style='position:absolute;right:40%; bottom:40%;width:8rem;height:8rem;z-index:10000000;display:none;'><img  alt= "Google Earth Engine logo spinner" title="Background processing is occurring in Google Earth Engine" class="fa fa-spin" src="images/GEE_logo_transparent.png"  style='width:100%;height:100%'><span id = 'summary-spinner-message'></span></div>`,
    authErrorMessage:`<p>---  Error --- Map Loading Error ---</p>
                                                              <p>Map data did not load correctly and cannot be used at this time. We apologize for this inconvenience and are working to resolve this issue.</p>
                                                              ${specificAuthErrorMessage} 
                                                              ${authErrorMessageContact}
    `,
    exportContainer:`<hr>
                    <div class = 'py-2' id = 'export-list-container'>
                        <h5>Choose which images to export:</h5>
                        <div class = 'py-2' id="export-list"></div>
                        <hr>
                        <div class = 'pl-3'>
                            <form class="form-inline" title = 'Provide projection. Web mercator: "EPSG:4326", USGS Albers: "EPSG:5070", WGS 84 UTM Northern Hemisphere: "EPSG:326" + zone number (e.g. zone 17 would be EPSG:32617), NAD 83 UTM Northern Hemisphere: "EPSG:269" + zone number (e.g. zone 17 would be EPSG:26917) '>
                              <label for="export-crs">Projection: </label>
                              <div class="form-group pl-1">
                                <input type="text" id="export-crs" oninput = 'cacheCRS()' name="rg-from" value="EPSG:4326" class="form-control">
                              </div>
                            </form>
                            <div class = 'py-2' id = 'export-area-drawing-div'>
                                <button class = 'btn' onclick = 'selectExportArea()' title = 'Draw polygon by clicking on map. Double-click to complete polygon, press ctrl+z to undo most recent point, press Delete or Backspace to start over.'><i class="pr-1 fa fa-pencil" aria-hidden="true"></i> Draw area to download</button>
                                <a href="#" onclick = 'undoExportArea()' title = 'Click to undo last drawn point (ctrl z)'><i class="btn fa fa-undo"></i></a>
                                <a href="#" onclick = 'deleteExportArea()' title = 'Click to clear current drawing'><i class="btn fa fa-trash"></i></a>
                            </div>
                            <hr>  
                            <div class = 'pt-1 pb-3' >
                                <div id = 'export-button-div'>
                                    <button class = 'btn' onclick = 'exportImages()' title = 'Click to export selected images across selected area'><i class="pr-1 fa fa-cloud-download" aria-hidden="true"></i>Export Images</button>
                                    <button class = 'btn' onclick = 'cancelAllTasks()' title = 'Click to cancel all active exports'></i>Cancel All Exports</button>
                                </div>
                                <hr>
                                <span style = 'display:none;' class="fa-stack fa-2x py-0" id='export-spinner' title="">
						    		<img alt= "Google Earth Engine logo spinner" class="fa fa-spin fa-stack-2x" src="images/GEE_logo_transparent.png" alt="" style='width:2em;height:2em;'>
						   			<strong id = 'export-count'  class="fa-stack-1x" style = 'padding-left: 0.2em;padding-top: 0.1em;cursor:pointer;'></strong>
								</span>
                                <div id = 'export-count-div'></div>
                            </div>  
                        </div>
                        
                    </div>`,
	topBanner:`<h1 id = 'title-banner' title="" class = 'white  text-center title-banner' >
                    <img style = 'height:2rem;margin-top:-0.3rem'  alt="USDA Forest Service icon" src="images/logos_usda-fs.svg">
                    <div class="vl"></div>
                    ${topBannerParams.leftWords} <span class = 'gray' style="font-weight:1000;font-family: 'Roboto Black', sans-serif;">${topBannerParams.centerWords}</span> ${topBannerParams.rightWords}</h1>`,
//     topBanner:`<svg width="300" height="180"
//     style="border:solid 6px"
//     xmlns="http://www.w3.org/2000/svg">
//     <g>
//         <text y="50%" textLength="436" lengthAdjust="spacingAndGlyphs"  class = 'white text-center title-banner'>UGLY TEXT</text>
//     </g>
// </svg>`,
	studyAreaDropdown:`<li   id = 'study-area-dropdown' class="nav-item dropdown navbar-dark navbar-nav nav-link p-0 col-12  "  data-toggle="dropdown">
		                <h5 href = '#' onclick = "$('#sidebar-left').show('fade');$('#study-area-list').toggle();" class = 'teal-study-area-label p-0 caret nav-link dropdown-toggle ' id='study-area-label'></h5> 
		                <div class="dropdown-menu" id="study-area-list">  
		                </div>
		            </li>`,
	placesSearchDiv:`<section id = 'search-share-div' class="input-group  text-center search-bar" '>
			            <div role='list' class="input-group-prepend">
                            <button onclick = 'getLocation()' title = 'Click to center map at your location' class=" btn input-group-text bg-white search-box pr-1 pl-2" id="get-location-button"><i class="fa fa-map-marker text-black "></i></button>
	    					<button onclick = 'TweetThis()' title = 'Click to share your current view' class=" btn input-group-text bg-white search-box pr-1 pl-2" id="share-button"><i class="fa fa-share-alt teal "></i></button>
                            <buttom class="input-group-text bg-white search-box" id="search-icon"><i class="fa fa-search text-black "></i></buttom>
	  					</div>
			            <input id = 'pac-input' class="form-control bg-white search-box" title = 'Search for places on the map' type="text" placeholder="Search Places">
                        <div class="input-group-prepend">
                            <button onclick = 'backView()' title = 'Click to go back a view' class=" btn input-group-text bg-white search-box pr-1 pl-2" id="back-view-button"><i class="fa fa-chevron-left teal "></i></button>
                            <button onclick = 'forwardView()' title = 'Click to go forward a view' style = 'border-radius: 0px 3px 3px 0px' class=" btn input-group-text bg-white search-box pr-1 pl-2" id="forward-view-button"><i class="fa fa-chevron-right teal "></i></button>
                        </div>
                    </section>
                    <p class = 'mt-0 mb-1' style = 'display:none;font-size:0.8em;font-weight:bold' id = 'time-lapse-year-label'></p>`,
	introModal:{'LCMS':getIntroModal('./images/lcms-icon.png',
                                    'Welcome to the Landscape Change Monitoring System (LCMS) Data Explorer!',
                                    `<p class='my-2'>
                            LCMS is a remote sensing-based system for mapping and monitoring landscape change across the United States produced by the USDA Forest Service. LCMS provides a "best available" map of landscape change that leverages advances in time series-based change detection techniques, Landsat data availability, cloud-based computing power, and big data analysis methods.

                            </p>
                            <p class='my-2'>
                            This Data Explorer provides the ability to view, analyze, summarize, and download LCMS data. 
                            </p>`,
                            `<div style='display:inline-block;margin-top:0.5rem;'>
                            <div style ='float:left;' title='LCMS is produced by the USDA Forest Service'>
                                <img class = 'logo' alt="USDA Forest Service icon" src="images/logos_usda-fs_bn-dk-01.svg">
                                
                            </div>
                            <div style ='float:left;'>
                                <ul class="intro-list">
                                  <li title = 'The Geospatial Technology and Applications Center (GTAC) provides leadership in geospatial science implementation in the USDA Forest Service by delivering vital services, data products, tools, training, and innovation to solve today's land and resource management challenges. All operational LCMS production and support takes place at GTAC.'><a class="intro-modal-links" href="https://www.fs.usda.gov/about-agency/gtac" target="_blank">GTAC</a> Geospatial Technology and Applications Center
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
                            <a class="intro-modal-links" onclick="downloadMethods('v2021-7')" title="Open in-depth LCMS v2021.7 methods documentation">LCMS METHODS</a>
                            <a class = "intro-modal-links" title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov" >LCMS HELPDESK/FEEDBACK</a> 
                        </div>
                        
                        <div class ='my-3' title='There are additional data visualization tools available in these other sites'>Other LCMS EXPLORERS:
                            <a class = 'intro-modal-links' title = "Visualize and explore time series datasets used to create the LCMS map outputs" href = "lcms-base-learner.html" target="_blank">LCMS Base Learner Explorer</a>
                            <a class = 'intro-modal-links' title = "Visualize pre-made gifs illustrating patterns of change across USFS Forests and Districts" href = "lcms-in-motion.html" target="_blank">LCMS-in-Motion</a>
                            
                        </div>`),
            'lcms-base-learner':getIntroModal('./images/lcms-icon.png',
                                    'Welcome to the Landscape Change Monitoring System (LCMS) Base-Learner Explorer!',
                                    `<p>LCMS is a landscape change detection program developed by the USDA Forest Service. This application is designed to provide a visualization of the change detection algorithm outputs that are used to produce LCMS products.</p>`,
                                    `<p>In addition to the map layers, LandTrendr and CCDC outputs can be compared through charting under the <kbd>Tools</kbd> -> <kbd>Pixel Tools</kbd> and <kbd>Area Tools</kbd>
                                    </p>`,
                                    `<p>Please review this <a class = 'support-text' onclick = 'downloadMethods("v2021-7")' title = 'Open in-depth LCMS v2021.7 methods documentation'>methods document</a> for more information about how these datasets are used to create LCMS products.   
                            </p>
                            <p>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>
                            <div class ='my-3'>
                            <a class="intro-modal-links" onclick="downloadMethods('v2021-7')" title="Open in-depth LCMS v2021.7 methods documentation">LCMS METHODS</a>
                            <a class = "intro-modal-links" title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov" >LCMS HELPDESK/FEEDBACK</a> 
                        </div>
                        
                        <div class ='my-3' title='There are additional data visualization tools available in these other sites'>Other LCMS EXPLORERS:
                            <a class = 'intro-modal-links' title = "Visualize and explore LCMS final outputs" href = "index.html" target="_blank">LCMS Data Explorer</a>
                            <a class = 'intro-modal-links' title = "Visualize pre-made gifs illustrating patterns of change across USFS Forests and Districts" href = "lcms-in-motion.html" target="_blank">LCMS-in-Motion</a>
                            
                        </div>`
                ),
            'IDS':getIntroModal('./images/lcms-icon.png',
            'Welcome to the Landscape Change Monitoring System (LCMS) Insect and Disease Detection Survey (IDS) Explorer!',
           `<p>LCMS is a landscape change detection program developed by the USDA Forest Service. This application is designed to provide a visualization of the LCMS outputs alongside outputs from the USFS Forest Health Protection's <a class='intro-modal-links' href='https://www.fs.fed.us/foresthealth/applied-sciences/mapping-reporting/detection-surveys.shtml' title = 'IDS homepage' target="_blank">Insect and Disease Detection Survey (IDS)</a>outputs.</p>
           <hr>
           <p>LCMS Change and IDS polygon data can be viewed simultaneously for each coincident year. These data can also be compared through charting under the <kbd>Tools</kbd> -> <kbd>Pixel Tools</kbd> and <kbd>Area Tools</kbd>
           </p>`,
            `
    <p>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>
    <div class ='my-3'>
    <a class="intro-modal-links" onclick="downloadMethods('v2021-7')" title="Open in-depth LCMS v2021.7 methods documentation">LCMS METHODS</a>
    <a class = "intro-modal-links" title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov" >LCMS HELPDESK/FEEDBACK</a> 
</div>

<div class ='my-3' title='There are additional data visualization tools available in these other sites'>Other LCMS EXPLORERS:
    <a class = 'intro-modal-links' title = "Visualize and explore LCMS final outputs" href = "index.html" target="_blank">LCMS Data Explorer</a>
    <a class = 'intro-modal-links' title = "Visualize pre-made gifs illustrating patterns of change across USFS Forests and Districts" href = "lcms-in-motion.html" target="_blank">LCMS-in-Motion</a>
    
</div>`,''
)
,
            'Ancillary':`<div class="modal fade "  id="introModal" tabindex="-1" role="dialog" >
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
                              <img style="width:1.8em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="images/GEE_logo_transparent.png">
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
            'LT':getIntroModal('./images/lcms-icon.png',
            'Welcome to the LandTrendr Data Explorer!',
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
    <a class = 'intro-modal-links' title = "Visualize pre-made gifs illustrating patterns of change across USFS Forests and Districts" href = "lcms-in-motion.html" target="_blank">LCMS-in-Motion</a>
    
</div>`,''
),
            'MTBS':getIntroModal('./images/mtbs-logo.png',
            'Welcome to the MTBS Data Explorer!',
            `<p class='my-2'>
            Monitoring Trends in Burn Severity (MTBS) is a multiagency program designed to consistently map the burn severity and perimeters of fires across all lands of the United States from 1984 and beyond.
    </p>
    <p class='my-2'>
    MTBS maps prescribed fires that meet defined fire size thresholds of 1,000 acres in the Western US and 500 acres in the Eastern US. Prescribed fire plays an important role in forest and ecosystem health.
    </p>
    <p class='my-2'>
    MTBS burn severity data are used to assess the impacts to landscape health and can be used to monitor trends in wildfire over time.
    </p>
    <p class='my-2'>This tool is intended to allow for interactive exploration of the Monitoring Trends in Burn Severity (MTBS) data record.
    </p>`,
    `<div style='display:inline-block;margin-top:0.5rem;'>
    <div style ='float:left;display:block' title='MTBS is jointly produced by the USDA Forest Service and USGS'>
        <img class = 'logo' alt="USDA Forest Service icon" src="images/logos_usda-fs_bn-dk-01.svg">
        <br>
        <img class = 'logo' style = 'margin-left:0.3rem;height:2.5rem;' alt="USGS icon" src="images/USGS_logo_green.svg">
    </div>
    <div style ='float:left;'>
        <ul class="intro-list">
          <li title = 'The Geospatial Technology and Applications Center (GTAC) provides leadership in geospatial science implementation in the USDA Forest Service by delivering vital services, data products, tools, training, and innovation to solve today's land and resource management challenges. This Explorer was developed at GTAC.'><a class="intro-modal-links" href="https://www.fs.usda.gov/about-agency/gtac" target="_blank">GTAC</a> Geospatial Technology and Applications Center
          </li>
          <li title = 'The Earth Resources Observation and Science (EROS) Center studies land change and produce land change data products used by researchers, resource managers, and policy makers across the nation and around the world. They also operate the Landsat satellite program with NASA, and maintain the largest civilian collection of images of the Earth's land surface in existence, including tens of millions of satellite images.'><a class="intro-modal-links" href="https://www.usgs.gov/centers/eros" target="_blank">EROS</a> Earth Resources Observation and Science Center
          </li>
          <li title = 'This site utilizes Google Earth Engine for most of its data acqusition, processing, and visualization through an enterprise agreement between the USDA Forest Service and Google.'><a class="intro-modal-links" href="https://earthengine.google.com/" target="_blank">GEE</a> Google Earth Engine
          </li>
        </ul>
        
    </div>

</div>`,
`<p>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>
<div class ='my-3'>
   <a  class = 'intro-modal-links' onclick = 'toggleWalkThroughCollapse()' title="Run interactive walk-through of the features of the MTBS Data Explorer">Run Walk-Through</a>

    <a class = "intro-modal-links" title = "Contact us" href="https://www.mtbs.gov/contact" target="_blank"  >CONTACT</a> 
</div>

<div class ='my-3' title='There are additional data visualization tools available in these other sites'>Other MTBS EXPLORER:
    <a class = 'intro-modal-links' title = "View MTBS outputs" href = "https://www.mtbs.gov/viewer/index.html" target="_blank">MTBS Interactive Viewer</a>
    
    
</div>`),
            'LAMDA':`<div class="modal fade "  id="introModal" tabindex="-1" role="dialog" >
                <div class="modal-dialog modal-md " role="document">
                    <div class="modal-content text-dark" style = 'background-color:rgba(230,230,230,0.95);'>
                        <button type="button" class="close p-2 ml-auto text-dark" data-dismiss="modal">&times;</button>
                        <div class = 'modal-header'>
                            <h3 class="mb-0 ">Welcome to the Landscape Automated Monitoring and Detection Algorithm (LAMDA) Data Explorer!</h3>
                        </div>
                        <div class="modal-body" id = 'introModal-body'>
                            <p>LAMDA is a near real-time landscape-scale change detection program developed by the USDA Forest Service to serve as a 'hot spot' indicator for areas where finer resolution data may be used for further investigation and to serve as an indicator of severe changes over forested regions. This application is designed to provide a visualization of LAMDA outputs.</p>
                        </div>
                        <div class = 'modal-footer' id = 'introModal-footer'>
                        <div class = ' ml-0' id = 'intro-modal-loading-div'>
                            <p>
                              <img style="width:1.8em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="images/GEE_logo_transparent.png">
                                Creating map services within Google Earth Engine. 
                             </p>
                        </div>
                        <hr>
                        <div class="form-check  mr-0">
                                <input role="option" type="checkbox" class="form-check-input" id="dontShowAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
                                <label class=" text-uppercase form-check-label " for="dontShowAgainCheckbox" >Don't show again</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`,
            'STORM':`<div class="modal fade modal-full-screen-styling"  id="introModal" tabindex="-1" role="dialog" >
                <div style='max-width:700px;' class="modal-dialog" role="document">
                    <div class="modal-content text-dark modal-content-full-screen-styling" >
                       
                        <div class="modal-body" id = 'introModal-body'>
                        <button type="button" class="close m-0 ml-auto text-dark" data-dismiss="modal">&times;</button>
                            <span>
                                <img class = 'logo' src="./Icons_svg/logo_gtac_color-wt.svg"   alt="GTAC logo">
                                <h1 id = 'intro-modal-title-banner' title="" class = '  splash-title' style="font-weight:100;font-family: 'Roboto';">STORM<span  style="font-weight:1000;font-family: 'Roboto Black', sans-serif;"> DAMAGE </span>VIEWER</h1>
                            </span>
                         
                        <div style = 'block;margin-top:0.5rem;'>
                            <span  style="font-weight:bold">Welcome to the Storm Damage Viewer!</span>
                            
                            <p class='my-2'>
                            This tool is intended to provide an interactive ability to upload storm tracks and produce modeled wind fields and tree damage.

                            </p>
                           
                        </div>
                            <div style='display:inline-block;margin-top:0.5rem;'>
                                <div style ='float:left;' title='LCMS is produced by the USDA Forest Service'>
                                    <img class = 'logo' alt="USDA Forest Service icon" src="images/logos_usda-fs_bn-dk-01.svg">
                                    
                                </div>
                                
                            
                            </div>
                    
                                
                           <p>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>
                            

                             <div class = ' ml-0 m-0' id = 'intro-modal-loading-div'>
                                <p >
                                  <img style="width:1.8em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="images/GEE_logo_transparent.png">
                                    Creating map services within Google Earth Engine. 
                                 </p>
                            </div>
                           
                            <div class="form-check  pl-0 mt-3 mb-2">
                                <input role="option" type="checkbox" class="form-check-input" id="dontShowAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
                                <label class=" text-uppercase form-check-label " for="dontShowAgainCheckbox" >Don't show again</label>
                            </div>
                        </div>
                        
                           
                        
                    </div>
                </div>
            </div>`,
        },
    loadingModal:{'all':function(logoPath,word){
                                    let logoLine= `<img class = 'logo' src="./images/${logoPath}"   alt="${mode} logo image">`;
                                    if(logoPath === '' || logoPath === null || logoPath === undefined){
                                        logoLine=``
                                    }
                                    return `<span>
                                                           ${logoLine} 
                                                            <h2 id = 'intro-modal-title-banner' title="" class = 'splash-title' style="font-weight:100;font-family: 'Roboto';">${topBannerParams.leftWordsSimple}<span  style="font-weight:1000;font-family: 'Roboto Black', sans-serif;"> ${topBannerParams.centerWords} </span> ${topBannerParams.rightWords}</h2>
                                                        </span>

                            

                        <p style = 'margin-top:1rem;'>Google Earth Engine data acquisition, processing, and visualization is possible by a USDA Forest Service enterprise agreement with Google.</p>
                <p style='font-weight:bold;margin-top:1rem;' title='Creating map services within Google Earth Engine. This can take some time. Thank you for your patience!'>
                  <img style="width:2.1em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="images/GEE_logo_transparent.png">
                    ${word} map services within Google Earth Engine. This can take some time.
                  
                 </p>
                  `},
                  'geeViz':`
                <p>
                  <img style="width:2.1em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="images/GEE_logo_transparent.png">
                    Creating map services within Google Earth Engine. 
                  <br>
                   <img style="width:2.1em;" class="image-icon fa-spin mr-1" alt= "Google Earth Engine logo spinner" src="images/GEE_logo_transparent.png">
                    This can take some time. Thank you for your patience!
                   <div id = 'loading-number-box'></div>
                 </p>
                  `},
	bottomBar:`<footer class = 'bottombar'  id = 'bottombar' >
        			<span class = 'px-2'  id='current-tool-selection' title="Any tool that is currently active is shown here."></span>
        			<span class = 'px-2' title="All map layers are dynamically requested from Google Earth Engine.  The number of outstanding requests is shown here.">Queue length for maps from GEE: <span id='outstanding-gee-requests'>0</span></span>
                    <span class = 'px-2' title="The number of outstanding map layers currently loading tiles.">Number of map layers loading tiles: <span id='number-gee-tiles-downloading'>0</span></span>
                    <span title="Current location and elevation of mouse pointer and map zoom level and respective map scale" class = 'px-2'  id='current-mouse-position'  ></span>
                    <span id = 'contributor-logos' > 
                        <a href="https://earthengine.google.com/" target="_blank">
                            <img src="images/GEE.png"   class = 'image-icon-bar' alt="Powered by Google Earth Engine"  href="#" title="Click to learn more about Google Earth Engine">
                        </a>
                        <a href="http://www.fs.fed.us//" target="_blank">
                            <img src="images/usfslogo.png" class = 'image-icon-bar'  href="#"  alt= "USDA Forest Service logo" title="Click to learn more about the US Forest Service">
                        </a>
                        <a href="http://www.usda.gov" target="_blank">
                            <img src="images/usdalogo.png" class = 'image-icon-bar'  href="#"   alt= "USDA logo" title="Click to learn more about the USDA">
                        </a>
                    </span>
                </footer>`,
        walkThroughPopup:`<div class = 'walk-through-popup'>
                            <div id = 'walk-through-popup-content' class = 'walk-through-popup-content'></div>
	                       		<hr>
		                        <div class="icon-bar py-1 ">
								  <a onclick = 'previousWalkThrough()' title = 'Previous tutorial slide'><i class="fa fa-chevron-left text-black"></i></a>
								  <a onclick = 'nextWalkThrough()'  title = 'Next tutorial slide'><i class="fa fa-chevron-right text-black"></i></a>
								  <a id = 'walk-through-popup-progress'></a>
                                  <a onclick = 'removeWalkThroughCollapse()' style = 'float:right;'  title = 'Turn off Walk-Through'><i class="fa fa-stop text-black" aria-hidden="true"></i></a>
                                </div>
						</div>`,
        studyAreaDropdownButtonEnabledTooltip:`Choose your study area`,
        studyAreaDropdownButtonDisabledTooltip:`Still waiting on previous map layer requests. Can change study area once the previous requests are finished.`,
        reRunButtonEnabledTooltip:`Once finished changing parameters, press this button to refresh map layers`,
        reRunButtonDisabledTooltip:`Still waiting on previous map layer requests. Can re-submit once the previous requests are finished.`,
        reRunButton:`<button id = 'reRun-button' onclick = 'reRun()' class = 'mb-1 ml-1 btn ' title="">Submit</button>`,
        addTimelapsesButton:`<button id = 'addTimelapses-button' onclick = 'addLCMSTimeLapses()' class = 'mb-1 ml-1 btn ' title="Add interactive time lapse of LCMS Change and Land Cover products. This will slow down the map loading">Add LCMS Time Lapses To Map</button>`,
        downloadDiv :`<div class = 'py-2'>
                        <a id = 'product-descriptions' target = '_blank'>Detailed Product Description</a>
        				<hr>
                        <label  title = 'Choose from dropdown below to download LCMS products. There can be a small delay before a download will begin, especially over slower networks.' for="downloadDropdown">Select product to download:</label>
    					<select class="form-control" id = "downloadDropdown" onchange = "downloadSelectedArea()""></select>
    				 </div>`,
        lcmsProductionDownloadDiv:`<ul id="downloadTree" class = 'pl-0 mb-0' title = 'Click through available LCMS products. Select which outputs to download, and then click the download button. Hold ctrl key to select multiples or shift to select blocks.'>
                                          <li class = 'pl-0'><span class="caret caret-down">Conterminous United States (v2021.7)</span>
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
                                          <li><span class="caret caret-down">Southeastern Alaska (v2021.7)</span>
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
                                          <li><span class="caret caret-down">Puerto Rico - US Virgin Islands (v2020.6)</span>
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
        supportDiv :`<div  class = 'py-2 pl-3 pr-1'>
                        <header class = 'row ' title = 'Open LCMS Data Explorer tutorial'>
                            <h3 class = ' text-capitalize'>Tutorial</h3>
                        </header>
                        <div class = 'row ' title = 'Open LCMS Data Explorer tutorial'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <img class = 'support-icons' alt = 'Information icon' src = './images/information--v2.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                                <a class = 'support-text' onclick = 'downloadTutorial()'>
                                Click to launch a tutorial that explains how to utilize the Data Explorer</a>
                            </div>
                        </div>
                        <hr>
                         <header class = 'row ' title = 'Open in-depth LCMS methods documentation'>
                            <h3 class = ' text-capitalize'>LCMS Methods</h3>
                        </header>
                        <div class = 'row ' title = 'Open in-depth LCMS methods documentation'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <img class = 'support-icons' alt = 'Methods icon' src = './images/methods-icon.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                                Click to open in-depth methods document:
                                <li>
                                    <a class = 'support-text' onclick = 'downloadMethods("v2021-7")' title = 'Open in-depth LCMS v2021.7 methods documentation'>Version 2021.7 (CONUS and SEAK)</a>
                                </li>
                                <li>
                                    <a class = 'support-text' onclick = 'downloadMethods("v2020-6")' title = 'Open in-depth LCMS v2020.6 methods documentation'>Version 2020.6 (PRUSVI)</a>
                                </li>   
                            </div>
                        </div>
                        <hr>
                        <header class = 'row'>
                            <h3 class = ' text-capitalize' title = "In addition to this viewer, there are viewers to help visualize and explore other aspects of the LCMS data flow">Other LCMS Viewers</h3>
                        </header>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a title = "In addition to this viewer, there are viewers to help visualize and explore other aspects of the LCMS data flow" ><img class = 'support-icons' alt = 'Email icon' src = './images/lcms-icon.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                                <a class = 'support-text' title = "Visualize and explore time series datasets used to create the LCMS map outputs" href = "lcms-base-learner.html" target="_blank">LCMS Base Learner Explorer</a>
                                <hr>
                                <a class = 'support-text' title = "Visualize pre-made gifs illustrating patterns of change across USFS Forests and Districts" href = "lcms-in-motion.html" target="_blank">LCMS-in-Motion</a>
                            </div>
                        </section>
                        <hr>
                        <header class = 'row'>
                            <h3 class = ' text-capitalize'>Acknowledgements</h3>
                        </header>
                        <section class = 'row'>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://www.fs.fed.us/gstc/" target="_blank">
                                <img src="./images/GTAC_Logo.png" class = 'support-icons' alt="GTAC Logo"  href="#" alt = "Geospatial Technology and Applications Center logo" title="Click to learn more about the Geospatial Technology and Applications Center (GTAC)">
                                </a>
                            </div>
                            <div class = 'col-lg-10'>
                                <a href="https://www.fs.fed.us/gstc/" target="_blank">
                                    <p class = 'support-text'>The Geospatial Technology and Applications Center (GTAC) provides leadership in geospatial science implementation in the USDA Forest Service by delivering vital services, data products, tools, training, and innovation to solve today's land and resource management challenges. All operational LCMS production and support takes place at GTAC.</p>
                                </a>
                            </div>
                        </section>
                        <hr>
                        <section class = 'row '>
                            <div class = 'col-lg-2 p-0 m-0'>
                                <a href="https://www.redcastleresources.com/" target="_blank">
                                    <img src="images/RCR-logo.jpg"  class = 'support-icons' alt="RedCastle Inc. Logo"  href="#"   title="Click to learn more about RedCastle Resources Inc."> 
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
                                <img src="./images/usfslogo.png" class = 'support-icons' alt="USFS Logo"  href="#"  title="Click to learn more about the Rocky Mountain Research Station (RMRS)">
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
                                    <img src="images/GEE_logo_transparent.png"  class = 'support-icons' alt="Google Earth Engine Logo"  href="#"   title="Click to learn more about Google Earth Engine">
                                    
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
                                    <p class = 'support-text' onclick = 'copyText("suggested-citation-text","copiedCitationMessageBox")' id = 'suggested-citation-text' title='Click to copy suggested citation to clipboard'>Forest Service, U.S. Department of Agriculture (2022). Landscape Change Monitoring System Data Explorer [Online]. Available at: https://apps.fs.usda.gov/lcms-viewer (Accessed: ${new Date().toStringFormat()}).
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
                                <a title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov"><img class = 'support-icons' alt = 'Email icon' src = './images/email.png'></a> 
                            </div>
                            <div class = 'col-lg-10'>
                                <a class = 'support-text' title = "Send us an E-mail" href = "mailto: sm.fs.lcms@usda.gov">
                                Please contact the LCMS help desk <span href = "mailto: sm.fs.lcms@usda.gov">(sm.fs.lcms@usda.gov)</span> if you have questions/comments about LCMS or have feedback on the LCMS Data Explorer.</a>
                            </div>
                        </section>
        			</div>`,
                    tooltipToggle:` <label class = 'mt-2'>If you turned off tool tips, but want them back:</label>
                        <button  class = 'btn  bg-black' onclick = 'showToolTipsAgain()'>Show tooltips</button>`,
        walkThroughButton:`<div >
                            <label class = 'mt-2'>Run a walk-through of the ${mode} Data Explorer's features</label>
                            <a  class = 'intro-modal-links ' onclick = 'toggleWalkThroughCollapse()' title = 'Run interactive walk-through of the features of the ${mode} Data Explorer'>Run Walk-Through</a>
                          </div>`,
        distanceDiv : `Click on map to measure distance`,
        distanceTip : "Click on map to measure distance. Press <kbd>ctrl+z</kbd> to undo most recent point. Double-click, press <kbd>Delete</kbd>, or press <kbd>Backspace</kbd> to clear measurment and start over.",
        areaDiv : `Click on map to measure area<variable-radio onclick1 = 'updateArea()' onclick2 = 'updateArea()' var='metricOrImperialArea' title2='' name2='Metric' name1='Imperial' value2='metric' value1='imperial' type='string' title='Toggle between imperial or metric units'></variable-radio>
       `,
        areaTip : "Click on map to measure area. Double-click to complete polygon, press <kbd>ctrl+z</kbd> to undo most recent point, press <kbd>Delete</kbd> or <kbd>Backspace</kbd> to start over. Any number of polygons can be defined by repeating this process.",
        queryDiv : "<div>Double-click on map to query values of displayed layers at that location</div>",
        queryTip : 'Double-click on map to query the values of the visible layers.  Only layers that are turned on will be queried.',
        pixelChartDiv : `<div>Double-click on map to query ${mode} data time series<br></div>`,
        pixelChartTip : 'Double-click on map to look at the full time series of '+mode+' outputs for a pixel.',
        userDefinedAreaChartDiv : `<div  id="user-defined" >
                                            <label>Provide name for area selected for charting (optional):</label>
                                            <input title = 'Provide a name for your chart. A default one will be provided if left blank.'  type="user-defined-area-name" class="form-control my-1" id="user-defined-area-name" placeholder="Name your charting area!" style='width:80%;'>
                                            <hr>
                                            <div>Total area selected: <i id = "user-defined-area-spinner" style = 'display:none;' class="fa fa-spinner fa-spin text-dark pl-1"></i></div>
                                            <div id = 'user-defined-features-area' class = 'select-layer-name'>0 hectares / 0 acres</div>
                                            <div id = 'user-defined-edit-toolbar'></div>
                                            <button class = 'btn' style = 'margin-bottom: 0.5em!important;' onclick = 'chartUserDefinedArea()' title = 'Click to summarize across drawn polygons'>Chart Selected Areas</button>
        		            			</div>
                                	</div>`,
        showChartButton:`<div class = 'py-2'>
                                <button onclick = "$('#chart-modal').modal()" class = 'btn bg-black' title = "If you turned off the chart, but want to show it again" >Turn on Chart</button>
                                </div>`,
        userDefinedAreaChartTip : 'Click on map to select an area to summarize '+mode+' products across. Press <kbd>ctrl+z</kbd> to undo most recent point.  Press <kbd>Delete</kbd>, or press <kbd>Backspace</kbd> to start over. Double-click to finish polygon. Any number of polygons can be defined by repeating this process. Once finished defining areas, click on the <kbd>Chart Selected Areas</kbd> button to create chart.',
        uploadAreaChartDiv : `<hr>
                                <label title = 'Powered by: https://ogre.adc4gis.com/'>Choose a zipped shapefile, kml, kmz, or geoJSON file to summarize across. Then hit "Chart across chosen file" button below to produce chart.</label>
                                <input class = 'file-input my-1' type="file" id="areaUpload" name="upload" accept=".zip,.geojson,.json,.kmz,.kml" style="display: inline-block;">
                                <hr>
                                <div id = 'upload-reduction-factor-container'></div>
                                <hr>
                                <div>Uploaded areas:</div>
                                <div id="area-charting-shp-layer-list"></div>
                                <hr>
                                <button class = 'btn' style = 'margin-bottom: 0.5em!important;' onclick = 'runShpDefinedCharting()' title = 'Click to summarize across chosen .zip shapefile, .kmz, .kml, or .geojson.'>Chart across chosen file</button>`,
        uploadAreaChartTip : 'Select zipped shapefile (zip into .zip all files related to the shapefile) or a single .kmz, .kml (If the .kmz or .kml has embedded pngs or any other non vector data, the conversion will likely fail.), or .geojson file to summarize products across.',
        selectAreaDropdownChartDiv : `<i title="Selecting pre-defined summary areas for chosen study area" id = "select-area-spinner" class="text-dark px-2 fa fa-spin fa-spinner"></i>
                            <select class = 'form-control' style = 'width:100%;'  id='forestBoundaries' onchange='chartChosenArea()'></select>
                            <hr>`,
        selectAreaDropdownChartTip : 'Select from pre-defined areas to summarize products across.',
        selectAreaInteractiveChartDiv : `<div>Choose from layers below and click on map to select areas to include in chart</div>
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
                                        <hr>`,
        selectAreaInteractiveChartTip : 'Select from pre-defined areas on map to summarize products across.',
        shareButtons : `<!-- Email -->
                        <a title = 'Share via E-mail' onclick = 'TweetThis("mailto:?Subject=USDA Forest Service Landscape Change Monitoring System&amp;Body=I%20saw%20this%20and%20thought%20you%20might%20be%20interested.%20 ","",true)'>
                            <img class = 'image-icon-bar' src="./images/email.png" alt="Email" />
                        </a>
                        <a title = 'Share on Reddit' onclick = 'TweetThis("http://reddit.com/submit?url=","&amp;title=USDA Forest Service Landscape Change Monitoring System",true)' >
                            <img class = 'image-icon-bar' src="./images/reddit.png" alt="Reddit" />
                        </a>
                        <a title = 'Share on Twitter' onclick = 'TweetThis("https://twitter.com/share?url=","&amp;text=USDA Forest Service Landscape Change Monitoring System&amp;hashtags=USFSLCMS",true)' >
                            <img class = 'image-icon-bar' src="./images/twitter.png" alt="Twitter" />
                        </a>
                        <a  title = 'Share on Facebook' onclick = 'TweetThis("http://www.facebook.com/sharer.php?u=","",true)' >
                            <img class = 'image-icon-bar' src="./images/facebook.png" alt="Facebook" />
                        </a>`
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Go through each tip and remove kbd tag for shoing in hover titles
Object.keys(staticTemplates).filter(word => word.indexOf('Tip') > -1).map(function(t){
	let tip = staticTemplates[t].replaceAll(`<kbd>`,``);
	tip = tip.replaceAll(`</kbd>`,``);
	staticTemplates[t+'Hover'] = tip;
})
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
  }else{ 
    showMessage('Cannot acquire location','Geolocation is not supported by this browser.');
    ga('send', 'event', mode + '-getLocation', 'failure', 'failure');
  };
}
function showPosition(position) {
    const pt = {lng:position.coords.longitude,lat:position.coords.latitude};
    ga('send', 'event', mode + '-getLocation', 'success', JSON.stringify(pt));
    let locationMarker  = new google.maps.Marker({
              map: map,
              position: pt,
              icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 5,
                  strokeColor: '#FF0',
                  map: map
                }
            });
    map.setCenter(pt);
    map.setZoom(10);
    showMessage('Acquired location',"Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude);
}
function showLocationError(error){
    switch(error.code) {
    case error.PERMISSION_DENIED:
        showMessage('Cannot acquire location','User denied the request for Geolocation.');
        break;
    case error.POSITION_UNAVAILABLE:
        showMessage('Cannot acquire location','Location information is unavailable.');
        break;
    case error.TIMEOUT:
        showMessage('Cannot acquire location','The request to get user location timed out.');
        break;
    case error.UNKNOWN_ERROR:
        showMessage('Cannot acquire location','An unknown error occurred.');
        break;
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to add a Bootstrap dropdown
function addDropdown(containerID,dropdownID,dropdownLabel,variable,tooltip){
	if(tooltip === undefined || tooltip === null){tooltip = ''}
	$('#' + containerID).append(`<div id="${dropdownID}-container" class="form-group" title="${tooltip}">
								  <label for="${dropdownID}">${dropdownLabel}:</label>
								  <select class="form-control" id="${dropdownID}"></select>
								</div>`);
	  $("select#"+dropdownID).on("change", function(value) {
	  	eval(`window.${variable} = $(this).val()`);
	  });
}
//Function to add an item to a dropdown
function addDropdownItem(dropdownID,label,value,tooltip){
    if(tooltip === undefined || tooltip === null){tooltip = ''};
	$('#'+dropdownID).append(`<option title = '${tooltip}' value = "${value}">${label}</option>`)
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to add a standard shape editor toolbar
function addShapeEditToolbar(containerID, toolbarID,undoFunction,restartFunction,undoTip,deleteTip){
    if(undoTip === undefined || undoTip === null){undoTip = 'Click to undo last drawn point (ctrl z)'};
    if(deleteTip === undefined || deleteTip === null){deleteTip = 'Click to clear current drawing and start a new one (Delete, or Backspace)'};
	$('#'+containerID).append(`<hr>
								    <div id = '${toolbarID}' class="icon-bar ">
								    	<a href="#" onclick = '${undoFunction}' title = '${undoTip}''><i class="btn fa fa-undo"></i></a>
									  	<a href="#" onclick = '${restartFunction}' title = '${deleteTip}'><i class="btn fa fa-trash"></i></a>
									</div>
									<hr>`);
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to set up a custom toggle radio
const setRadioValue =function(variable,value){
	console.log(value)
	window[variable] = value;
	};
function getRadio(id,label,name1,name2,variable,value1,value2){
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
        	</div>`
}
//////////////////////////////////////////////////////////////////////////////////////////////
function getDiv(containerID,divID,label,variable,value){
	eval(`var ${variable} = ${value}`);
	console.log(eval(variable));
	var div = `<div id = "${divID}">${label}</div>`;
	$('#'+containerID).append(div);
	$('#'+ divID).click(function(){eval(`${variable}++`);console.log(eval(variable));$('#'+divID).append(eval(variable));})
}
//////////////////////////////////////////////////////////////////////////////////////////////
function getToggle(containerID,toggleID,onLabel,offLabel,onValue,offValue,variable,checked){
	if(checked === undefined || checked === null || checked === 'true' || checked === 'checked'){
		checked = true;
	}
	else if(checked === 'false' || checked === ''){
		checked = false;
	}

	var valueDict = {true:onValue,false:offValue};

	eval(`window.${variable} = valueDict[checked]`)
	var toggle = `<input role="option" id = "${toggleID}" class = 'p-0 m-0' type="checkbox"  data-toggle="toggle" data-on="${onLabel}" data-off="${offLabel}" data-onstyle="toggle-on" data-offstyle="toggle-off"><br>`;
	$('#'+containerID).append(toggle);
	if(checked){
		$('#'+toggleID).bootstrapToggle('on')
	}
	$('#'+containerID).click(function(){
		var value = $('#'+toggleID).prop('checked');
		console.log(value);
		eval(`window.${variable} = valueDict[${value}]`)

	})
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Provide color picker and allow updating of drawn polygons
function updateDistanceColor(jscolor) {
    distancePolylineOptions.strokeColor = '#' + jscolor;
    if(distancePolyline !== undefined){
        distancePolyline.setOptions(distancePolylineOptions);
    }
}
function updateUDPColor(jscolor) {
    udpOptions.strokeColor = '#' + jscolor;
    Object.keys(udpPolygonObj).map(function(k){
        udpPolygonObj[k].setOptions(udpOptions) ;       
    })
}
function updateAreaColor(jscolor) {
    areaPolygonOptions.strokeColor = '#' + jscolor;
    Object.keys(areaPolygonObj).map(function(k){
    	areaPolygonObj[k].setOptions(areaPolygonOptions);
    	console.log(areaPolygonObj[k])
    })
}
function addColorPicker(containerID,pickerID,updateFunction,value){
    if(value === undefined	|| value === null){value = 'FFFF00'}
	   $('#'+containerID).append(`<button id = '${pickerID}' data-toggle="tooltip" title="If needed, change the color of shape you are drawing"
							    class=" fa fa-paint-brush text-dark color-button jscolor {valueElement:null,value:'${value}',onFineChange:'${updateFunction}(this)'} "
							    ></button>`);
}

//Functions to add and change content of BS modals
function addModal(containerID,modalID,bodyOnly){
	if(bodyOnly === null || bodyOnly === undefined){bodyOnly = false};
	if(containerID === null || containerID === undefined){containerID = 'main-container'};
	if(modalID === null || modalID === undefined){modalID = 'modal-id'};
	$('#'+modalID).remove();
	if(bodyOnly){
	   $('#'+ containerID).append(`<div id = "${modalID}" class="modal fade " role="dialog">
            	<div class="modal-dialog modal-md ">
            		<div class="modal-content modal-content-not-full-screen-styling">
	            		<div style = ' border-bottom: 0 none;'class="modal-header pb-0" id ="${modalID}-header">
	            			<button style = 'float:right;' id = 'close-modal-button' type="button" class="close text-dark" data-dismiss="modal">&times;</button>
	            		</div>
	      				<div id ="${modalID}-body" class="modal-body " ></div>
        			</div>
        		</div> 
        	</div>`
        	);
	}else{
	   $('#'+ containerID).append(`
            <div id = "${modalID}" class="modal fade " role="dialog">
            	<div class="modal-dialog modal-lg ">
            		<div class="modal-content bg-black">
            		<button type="button" class="close p-2 ml-auto" data-dismiss="modal">&times;</button>
	            		<div class="modal-header py-0" id ="${modalID}-header"></div>
	      				<div id ="${modalID}-body" class="modal-body " style = 'background:#DDD;' ></div>
			          	<div class="modal-footer" id ="${modalID}-footer"></div>
        			</div>
        		</div> 
        	</div>`
        	);
	}
}
function addModalTitle(modalID,title){
	if(modalID === null || modalID === undefined){modalID = 'modal-id'};
	   $('#'+modalID+' .modal-header').prepend(`<h4 class="modal-title" id = '${modalID}-title'>${title}</h4>`);
}

function clearModal(modalID){
	if(modalID === null || modalID === undefined){modalID = 'modal-id'};
	// $('#'+modalID).empty();

	$('#'+modalID+'-title .modal-title').html('')
	$('#'+modalID+'-header').html('');
	$('#'+modalID+'-body').html('');
	$('#'+modalID+'-footer').html('');
	$('.modal').modal('hide');
	$('.modal-backdrop').remove()
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to plae a message in a BS modal and show it
function showMessage(title,message,modalID,show){
	if(title === undefined || title === null){title = ''}
	if(message === undefined || message === null){message = ''}
	if(show === undefined || show === null){show = true}
	if(modalID === undefined || modalID === null){modalID = 'error-modal'}
	
	clearModal(modalID);
	addModal('main-container',modalID,true);
    if(title !== '' && title !== undefined && title !== null){
        addModalTitle(modalID,title);
    }
	
	$('#'+modalID+'-body').append(message);
	if(show){$('#'+modalID).modal();}
};

//////////////////////////////////////////////////////////////////////////////////////////////
//Show a basic tip BS modal
function showTip(title,message){
	showMessage('','<span class = "font-weight-bold text-uppercase" >'+ title +' </span><span>' +message + '</span>','tip-modal',false)

	$('#tip-modal-body').append(`<form class="form-inline pt-3 pb-0">
								  <div class="form-check  mr-0">
                                	<input role="option" type="checkbox" class="form-check-input" id="dontShowTipAgainCheckbox"   name = 'dontShowAgain' value = 'true'>
                                	<label class=" text-uppercase form-check-label " for="dontShowTipAgainCheckbox" >Turn off tips</label>
                            		</div>
								</form>`);
	if(localStorage.showToolTipModal == undefined || localStorage.showToolTipModal == "undefined"){
	  localStorage.showToolTipModal = 'true';
	  }
	if(localStorage.showToolTipModal === 'true' && walkThroughAdded == false){
	  $('#tip-modal').modal().show();
	}
	$('#dontShowTipAgainCheckbox').change(function(){
    console.log(this.checked)
    localStorage.showToolTipModal  = !this.checked;
    if(localStorage.showToolTipModal === 'false'){$('#tooltip-radio-second_toggle_label').click();}
    else if(localStorage.showToolTipModal === 'true'){$('#tooltip-radio-first_toggle_label').click();};
    });

}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to add a given study area to the study area dropdown
function addStudyAreaToDropdown(name,toolTip){
	var id = name.replaceAll(' ','-');
	$('#study-area-list').append(`<a id = '${id}' name = '${name}' class="dropdown-item "   data-toggle="tooltip" title="${toolTip}">${name}</a>`)
  	$('#'+id).on('click',function(){
  		// $('#summary-spinner').show();
  		$('#study-area-list').hide();
        longStudyAreaName = this.name;
    	dropdownUpdateStudyArea(this.name);
    }); 
 }
 //////////////////////////////////////////////////////////////////////////////////////////////
 function addToggle(containerDivID,toggleID,title,onLabel,offLabel,on,variable,valueOn,valueOff,onChangeFunction,tooltip){
    var valueDict = {true:valueOn,false:valueOff};
    var checked;
    if(tooltip === undefined || tooltip === null){tooltip = ''}
    if(on === null || on === undefined || on === 'checked' || on === 'true'){on = true;checked = 'checked';}
    else {on = false;checked = ''};
    eval(`window.${variable} = valueDict[on];`);
    $('#'+containerDivID).append(`<div title="${tooltip}" >${title}<input  id = "${toggleID}" data-onstyle="dark" data-offstyle="light" data-style="border" role="option" type="checkbox" data-on="${onLabel}" data-off="${offLabel}"  ${checked} data-toggle="toggle" data-width="100" data-onstyle="dark" data-offstyle="light" data-style="border" data-size="small" ></div>`);
    $('#'+toggleID).change(function(){
        var value = valueDict[$('#'+toggleID).prop('checked')];
        eval(`window.${variable} = value;`);
        eval(`${onChangeFunction}`); 
    })
}
//////////////////////////////////////////////////////////////////////////////////////////////
function addRadio(containerDivID,radioID,title,onLabel,offLabel,variable,valueOn,valueOff,onFunction,offFunction,tooltip){
	eval(`window.${variable} = '${valueOn}';`);
	$('#'+containerDivID).append(`<row class = 'row' id = '${radioID}-container' title="${tooltip}">
		<h3 class="col-12 pb-0 h3">${title} </h3>
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

	$('#'+radioID + '-first_toggle').change(function(){
		eval(`window.${variable} = '${valueOn}';`);
		eval(`${onFunction}`);
	})
	$('#'+radioID + '-second_toggle').change(function(){
		eval(`window.${variable} = '${valueOff}';`);
		eval(`${offFunction}`);
	})
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to set up a checkbox list
//Will set up an object under the variable name with the optionList that is updated
//Option list is formatted as {'Label 1': true, 'Label 2':false...etc}
function addCheckboxes(containerID,checkboxID,title,variable,optionList){
    $('#'+containerID).append(`<form  id = '${checkboxID}'>${title}<br></form>`);
    eval(`if(window.${variable} === undefined){window.${variable} = []}`);
    Object.keys(optionList).map(function(k){
      // console.log(k)
      const checkboxCheckboxID = variable+k + '-checkbox';
      const checkboxLabelID = variable+checkboxCheckboxID + '-label'
      if(optionList[k] === 'true'){optionList[k] = true}
      else  if(optionList[k] === 'false'){optionList[k] = false};
      let checked = optionList[k];
      optionList[k] = checked;
      if(checked){checked = 'checked';}
        else{checked = ''};
        eval(`window.${variable} = optionList`)
      $('#'+checkboxID).append(`<input  role="option" id="${checkboxCheckboxID}" type="checkbox" ${checked} value = '${k}' />
                                 <label  id="${checkboxLabelID}" style = 'margin-bottom:0px;'  for="${checkboxCheckboxID}" >${k}</label>`);

      $('#'+checkboxCheckboxID).change( function() {
                                      optionList[$(this).val()] = $(this)[0].checked;
                                      eval(`window.${variable} = optionList`)
                                      console.log('Checkbox change');console.log(optionList);
                                    });
    })
  }
//////////////////////////////////////////////////////////////////////////////////////////////
//Similar to the addCheckboxes only with radio buttons
//The variable assumes the value of the key of the object that is selected instead of the entire optionList object
//e.g. if optionList = {'hello':true,'there':false} then the variable = 'hello'
function addMultiRadio(containerID,radioID,title,variable,optionList){
    $('#'+containerID).append(`<form  class = 'py-2' id = '${radioID}'>${title}<br></form>`);

    eval(`if(window.${variable} === undefined){window.${variable} = ''};`);
    Object.keys(optionList).map(function(k){
      var radioCheckboxID = k + '-checkbox';
      var radioLabelID = radioCheckboxID + '-label';
      var checked = optionList[k];
      if(checked){
        checked = 'checked';
        eval(`window.${variable} = "${k}"`)
      }else{checked = ''};
      
      $('#'+radioID).append(`<div class="form-check form-check-inline">
                              <input role="option" class="form-check-input" type="radio" name="inlineRadioOptions" id="${radioCheckboxID}" ${checked} value="${k}">
                              <label class="form-check-label" for="${radioCheckboxID}">${k}</label>
                            </div>`);
      $('#'+radioCheckboxID).change( function() {
                                      var v = $(this).val();
                                      eval(`window.${variable} = "${v}"`)
                                    });
})
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Some basic formatting functions
function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}
function formatDT(__dt) {
    var year = __dt.getFullYear();
    var month = zeroPad(__dt.getMonth()+1, 2);
    var date = zeroPad(__dt.getDate(), 2);
    // var hours = zeroPad(__dt.getHours(), 2);
    // var minutes = zeroPad(__dt.getMinutes(), 2);
    // var seconds = zeroPad(__dt.getSeconds(), 2);
    return   month + '/'+ date + '/'+ year.toString().slice(2,4) //+ ' ' + hours + ':' + minutes + ':' + seconds;
};
function formatDTJulian(__dt) {
    // var year = __dt.getFullYear();
    var month = zeroPad(__dt.getMonth()+1, 2);
    var date = zeroPad(__dt.getDate(), 2);
    // var hours = zeroPad(__dt.getHours(), 2);
    // var minutes = zeroPad(__dt.getMinutes(), 2);
    // var seconds = zeroPad(__dt.getSeconds(), 2);
    return  month + '/' + date ;//+ ' ' + hours + ':' + minutes + ':' + seconds;
};

Date.fromDayofYear= function(n, y){
    if(!y) y= new Date().getFullYear();
    var d= new Date(y, 0, 1);
    return new Date(d.setMonth(0, n));
}
Date.prototype.dayofYear= function(){
    var d= new Date(this.getFullYear(), 0, 0);
    return Math.floor((this-d)/8.64e+7);
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Create a dual range slider
//Possible modes are : 'date','julian',or null
//Default mode is 'date', must specify mode as null to use vanilla numbers
function setUpDualRangeSlider(var1,var2,min,max,defaultMin,defaultMax,step,sliderID,updateID,mode){
    // var dt_from = "2000/11/01";
  // var dt_to = "2015/11/24";
// $("#"+updateID +" .ui-slider .ui-slider-handle").css( {"width": '3px'} );
  if(mode === undefined  || mode === null){mode = 'date'};
  if(defaultMin === undefined  || defaultMin   === null){defaultMin  = min};
  if(defaultMax === undefined  || defaultMax   === null){defaultMax  = max};
  // if(step === undefined  || step === null){step = 1};

  if(mode === 'date'){
    min = new Date(min);
    max = new Date(max);
    step = step *24*60*60;
    defaultMin   = new Date(defaultMin);
    defaultMax   = new Date(defaultMax);
    // step = step*60*60*24
    $( "#"+updateID).html(formatDT(defaultMin)+ ' - ' + formatDT(defaultMax));
  }
  else if(mode === 'julian'){
    min = Date.fromDayofYear(min);
    max = Date.fromDayofYear(max);
    step = step *24*60*60;
    defaultMin = Date.fromDayofYear(defaultMin);
    defaultMax = Date.fromDayofYear(defaultMax);
    $( "#"+updateID).html(formatDTJulian(defaultMin)+ ' - ' + formatDTJulian(defaultMax));
  }
  else{$( "#"+updateID).html(defaultMin.toString()+ ' - ' + defaultMax.toString());}
  
  if(mode === 'date' || mode === 'julian'){
  var minVal = Date.parse(min)/1000;
  var maxVal = Date.parse(max)/1000;
  var minDefault = Date.parse(defaultMin)/1000;
  var maxDefault = Date.parse(defaultMax)/1000;
  }
  else{
    var minVal = min;
    var maxVal = max;
    var minDefault = defaultMin;
    var maxDefault = defaultMax;
  }

      $("#"+sliderID).slider({
        range:true,
         min: minVal,
    max: maxVal,
    step: step,
    values: [minDefault, maxDefault],

    slide: function(e,ui){

      if(mode === 'date'){
      var value1 = ui.values[0]*1000;
      var value2 = ui.values[1]*1000;

      var value1Show  = formatDT(new Date(value1));
      var value2Show  = formatDT(new Date(value2));

      // value1 = new Date(value1);
      // value2 = new Date(value2);
      $( "#"+updateID ).html(value1Show.toString() + ' - ' + value2Show.toString());
      
      eval(var1 + '= new Date('+ value1.toString()+')');
      eval(var2 + '= new Date('+ value2.toString()+')');
        }
      else if(mode === 'julian'){
      var value1 = new Date(ui.values[0]*1000);
      var value2 = new Date(ui.values[1]*1000);

      var value1Show  = formatDTJulian(value1);
      var value2Show  = formatDTJulian(value2);
      value1 =value1.dayofYear();
      value2 = value2.dayofYear();
      
    $( "#"+updateID ).html(value1Show.toString() + ' - ' + value2Show.toString());
          
          eval(var1 + '= '+ value1.toString());
          eval(var2 + '= '+ value2.toString());
            }
          else{
          var value1 = ui.values[0];
          var value2 = ui.values[1];

          var value1Show  = value1;
          var value2Show  = value2;

          $( "#"+updateID ).html(value1Show.toString() + ' - ' + value2Show.toString());
          
          eval(var1 + '= '+ value1.toString());
          eval(var2 + '= '+ value2.toString());
          }
        }
          }); 
  }
//Wrapper function to add a dual range slider
function addDualRangeSlider(containerDivID,title,var1,var2,min,max,defaultMin,defaultMax,step,sliderID,mode,tooltip){
	if(tooltip === null || tooltip === undefined){tooltip = ''};
	
	// setUpRangeSlider('startYear', 'endYear', 1985, 2018, startYear, endYear, 1, 'slider1', 'date-range-value1', 'null');
	$('#'+containerDivID).append(`<div  id="${sliderID}-container"class='dual-range-slider-container px-1' title="${tooltip}">
							        <div class='dual-range-slider-name pt-2 pb-3'>${title}</div>
							        <div id="${sliderID}" class='dual-range-slider-slider' href = '#'></div>
							        <div id='${sliderID}-update' class='dual-range-slider-value p-2'></div>
							    </div>`);
	setUpDualRangeSlider(var1,var2,min,max,defaultMin,defaultMax,step,sliderID,sliderID+ '-update',mode)

}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to add single range slider
function setUpRangeSlider(variable,min,max,defaultValue,step,sliderID,mode){
    eval(`window.${variable} = ${defaultValue};`);
    $('#'+sliderID + '-update').html(defaultValue);
    $("#"+sliderID).slider({
        min: min,
        max:max,
        step: step,
        value: defaultValue,
        slide: function(e,ui){
            eval(`window.${variable} = ${ui.value};`);
            $('#'+sliderID + '-update').empty();
            $('#'+sliderID + '-update').html(ui.value);
        }
    })
}
//Wrapper for single range slider
function addRangeSlider(containerDivID,title,variable,min,max,defaultValue,step,sliderID,mode,tooltip){
    $('#'+containerDivID).append(`<div  id="${sliderID}-container" class='dual-range-slider-container px-1' title="${tooltip}">
                                    <div class='dual-range-slider-name pt-2 pb-3'>${title}</div>
                                    <div id="${sliderID}" class='dual-range-slider-slider' href = '#'></div>
                                    <div id='${sliderID}-update' class='dual-range-slider-value p-2'></div>
                                </div>`);
    setUpRangeSlider(variable,min,max,defaultValue,step,sliderID,mode);
}
 //////////////////////////////////////////////////////////////////////////////////////////////
//More Bootstrap element creators
//Function to add tab to list
function addTab(tabTitle,tabListID, divListID,tabID, divID,tabOnClick,divHTML,tabToolTip,selected){  
  if(!tabToolTip){tabToolTip = ''};
  var show;
  if(selected || selected === 'true'){show = 'active show'}else{show = ''};

  $("#" + tabListID ).append(`<li class="nav-item"><a onclick = '${tabOnClick}' class="nav-link text-left text-dark tab-nav-link ${show}" id="'+tabID+'" data-toggle="tab" href="#${divID}" role="tab" aria-controls="${divID}" aria-selected="false" title="${tabToolTip}">${tabTitle}</a></li>`);

  $('#'+divListID).append($(`<div class="tab-pane fade ${show}" id="${divID}" role="tabpanel" aria-labelledby="${tabID}" title="${tabToolTip}"></div>`).append(divHTML))

    };
/////////////////////////////////////////////////////////////////////////////////////////////
function addTabContainer(containerID,tabListID,divListID){
	$('#'+ containerID).append(`<ul class="pb-1 nav nav-tabs flex-column nav-justified md-tabs" id="${tabListID}" role="tablist">  
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
function addCollapse(containerID,collapseLabelID,collapseID,collapseLabel, collapseLabelIcon,show,onclick,toolTip){
	var collapsed;
	if(toolTip === undefined || toolTip === null){toolTip = ''}
	if(show === true || show === 'true' || show === 'show'){show = 'show';collapsed = ''; }else{show = '';collapsed='collapsed'}
	var collapseTitleDiv = `<header title="${toolTip}" class="panel-heading px-3 py-2 " role="tab" id="${collapseLabelID}" onclick = '${onclick}'>
	<h2 class="p-0 m-0 panel-title  ${collapsed}" data-toggle="collapse"  href="#${collapseID}" id="${collapseLabelID}-label" aria-expanded="${show}" aria-controls="${collapseID}"> <a class = 'collapse-title' role='img'>
	${collapseLabelIcon} ${collapseLabel} </a></h2><span id="${collapseLabelID}-message"</span></header>`;

	var collapseDiv =`<section id="${collapseID}" class="panel-collapse collapse panel-body ${show} px-5 py-0" role="tabpanel" aria-labelledby="${collapseLabelID}"></section>`;
    $('#'+containerID).append(`<div role="listitem" id="${collapseLabelID}-${collapseID}"></div>`)
	$(`#${collapseLabelID}-${collapseID}`).append(collapseTitleDiv);
	$(`#${collapseLabelID}-${collapseID}`).append(collapseDiv);
}
//////////////////////////////////////////////////////////////////////////////////////////////
function addSubCollapse(containerID,collapseLabelID,collapseID,collapseLabel, collapseLabelIcon,show,onclick){
	var collapsed;
	if(show === true || show === 'true' || show === 'show'){show = 'show';collapsed = ''; }else{show = '';collapsed='collapsed'}


	var collapseTitleDiv = `<div >
                                <div   class="panel-heading px-0 py-2 " role="tab" id="${collapseLabelID}" onclick = '${onclick}'>
	                           <h5 class="sub-panel-title ${collapsed}" data-toggle="collapse"  href="#${collapseID}" aria-expanded="false" aria-controls="${collapseID}" > <a class = 'collapse-title' >${collapseLabelIcon} ${collapseLabel} </a></h5>
                                </div>
                            </div`;

	var collapseDiv =`<div id="${collapseID}" class="panel-collapse collapse panel-body ${show} px-1 py-0" role="tabpanel" aria-labelledby="${collapseLabelID}"></div>`;
	$('#'+containerID).append(collapseTitleDiv);
	$('#'+containerID).append(collapseDiv);
}
//////////////////////////////////////////////////////////////////////////////////////////////
function addAccordianContainer(parentContainerID,accordianContainerID){
  $('#' + parentContainerID).append(`<div class="accordion" id="${accordianContainerID}"></div>`);
    
}
//////////////////////////////////////////////////////////////////////////////////////////////
var panelCollapseI = 1;
function addAccordianCard(accordianContainerID,accordianCardHeaderID, accordianCardBodyID,accordianCardHeaderContent,accordianCardBodyContent,show,onclick,toolTip){
  var collapsed;
  if(toolTip === undefined || toolTip === null){toolTip = '';}
  if(show === true || show === 'true' || show === 'show'){show = 'show';collapsed = ''; }else{show = '';collapsed='collapsed'}
  $('#' + accordianContainerID).append(`
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
    </div>`)
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
function addSubAccordianCard(accordianContainerID,accordianCardHeaderID, accordianCardBodyID,accordianCardHeaderContent,accordianCardBodyContent,show,onclick,toolTip){
  var collapsed;
  if(toolTip === undefined || toolTip === null){toolTip = '';}
  if(show === true || show === 'true' || show === 'show'){show = 'show';collapsed = ''; }else{show = '';collapsed='collapsed'}
  $('#' + accordianContainerID).append(`
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
    </div>`)
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
function getWalkThroughCollapseContainerID(){
    var collapseContainer;
    if($(window).width() < 576){collapseContainer = 'sidebar-left' }
    else{collapseContainer = 'legendDiv';}
    return collapseContainer
}
function moveCollapse(baseID){
    var collapseContainer =getWalkThroughCollapseContainerID();
    $('#'+baseID+'-label').detach().appendTo('#'+collapseContainer);
    $('#'+baseID+'-div').detach().appendTo('#'+collapseContainer);
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Legend functions
function addLegendCollapse(){
    var collapseContainer =getWalkThroughCollapseContainerID(); 
    addCollapse(collapseContainer,'legend-collapse-label','legend-collapse-div','LEGEND','<i class="fa fa-location-arrow fa-rotate-45 mx-1" aria-hidden="true"></i>',true,``,'LEGEND of the layers displayed on the map')
    // $('#legend-collapse-div').append(`<legend-list   id="legend"></legend-list>`)
    $('#legend-collapse-div').append(`<div role="list" id="legend-layer-list"></div>`);
    $('#legend-collapse-div').append(`<div role="list" id="legend-reference-layer-list"></div>`);
    $('#legend-collapse-div').append(`<div role="list" id="legend-fhp-div"></div>`);
    $('#legend-collapse-div').append(`<div role="list" id="time-lapse-legend-list"></div>`);
    $('#legend-collapse-div').append(`<div role="list" id="legend-area-charting-select-layer-list"></div>`);
}
function addLegendContainer(legendContainerID,containerID,show,toolTip){
	if(containerID === undefined || containerID === null){containerID = 'legend-collapse-div'}
	if(show === undefined || show === null){show = true}
	if(show){show = 'block'}
	else{show = 'none'}
	$('#' + containerID).prepend(`<div class = 'py-2 row' title= '${toolTip}' style = 'display:${show};' id = '${legendContainerID}'>
								</div>`);
}

function addClassLegendContainer(classLegendContainerID,legendContainerID,classLegendTitle){
	$('#'+legendContainerID).append(`<div class='my-legend'>
										<div class = 'legend-title'>${classLegendTitle}</div>
										<div class='legend-scale'>
									  		<ul class='legend-labels' id = '${classLegendContainerID}'></ul>
										</div>
									</div>`)
}
function addClassLegendEntry(classLegendContainerID,obj){
	$('#'+classLegendContainerID).append(`<li><span style='border: ${obj.classStrokeWeight}px solid #${obj.classStrokeColor};background:#${obj.classColor};'></span>${obj.className}</li>`)
}

function addColorRampLegendEntry(legendContainerID,obj){
	$('#'+legendContainerID).append(`<li class = 'legend-colorRamp' title= '${obj.helpBoxMessage}'>
							            <div class = 'legend-title'>${obj.name}</div>
							            <div class = 'colorRamp'style='${obj.colorRamp};'></div>
							            <div>
							                <span class = 'leftLabel'>${obj.min}</span>
							                <span class = 'rightLabel'>${obj.max}</span>
							            </div>
							            
							        </li> `)
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function to disable rerun button when there are still outstanding GEE requests
function regulateReRunButton(){
	if(outstandingGEERequests > 0){
		$('#reRun-button').prop('disabled',true);
		$('#reRun-button').prop('title',staticTemplates.reRunButtonDisabledTooltip);
	}
	else{
		$('#reRun-button').prop('disabled',false);
		$('#reRun-button').prop('title',staticTemplates.reRunButtonEnabledTooltip);
	}
} 
//Function to help keep track of GEE requests
function updateOutstandingGEERequests(){
    // $('#loading-number-box').html(outstandingGEERequests)
	$('#outstanding-gee-requests').html(outstandingGEERequests);
	regulateReRunButton();
}
function updateGEETileLayersLoading(){
	$('#number-gee-tiles-downloading').html(geeTileLayersDownloading);
}
function incrementOutstandingGEERequests(){
	outstandingGEERequests ++;updateOutstandingGEERequests();
}
function decrementOutstandingGEERequests(){
	outstandingGEERequests --;updateOutstandingGEERequests();
}

function incrementGEETileLayersLoading(){
	geeTileLayersDownloading++;updateGEETileLayersLoading();
}
function decrementGEETileLayersLoading(){
	geeTileLayersDownloading--;updateGEETileLayersLoading();
}
function updateGEETileLayersDownloading(){
    geeTileLayersDownloading = Object.values(layerObj).filter(function(v){return v.loading}).length;
    updateGEETileLayersLoading();
}
//////////////////////////////////////////////////////////////////////////////////////////////
//Function for adding map layers of various sorts to the map
//Map layers can be ee objects, geojson, dynamic map services, and tile map services

function addLayer(layer){

    //Initialize a bunch of variables
    layer.loadError = false;
	var id = layer.legendDivID;
    layer.id = id;
    var queryID = id + '-'+layer.ID;
	var containerID = id + '-container-'+layer.ID;
	var opacityID = id + '-opacity-'+layer.ID;
	var visibleID = id + '-visible-'+layer.ID;
	var spanID = id + '-span-'+layer.ID;
	var visibleLabelID = visibleID + '-label-'+layer.ID;
	var spinnerID = id + '-spinner-'+layer.ID;
    var selectionID = id + '-selection-list-'+layer.ID;
	var checked = '';
    layerObj[id] = layer;
    layer.wasJittered = false;
    layer.loading = false;
    layer.refreshNumber = refreshNumber;
	if(layer.visible){checked = 'checked'}
    
    if(layer.viz.isTimeLapse){
        // console.log(timeLapseObj[layer.viz.timeLapseID]);
        timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.push(id);
        timeLapseObj[layer.viz.timeLapseID].sliders.push(opacityID);
        timeLapseObj[layer.viz.timeLapseID].layerVisibleIDs.push(visibleID);

    }

    //Set up layer control container
	$('#'+ layer.whichLayerList).prepend(`<li id = '${containerID}' aria-label="Map layer controls container for ${layer.name}" class = 'layer-container'  title= '${layer.helpBoxMessage}'>
								           <div id="${opacityID}" aria-labelledby="${containerID}" Opacity range slider for ${layer.name}" class = 'simple-layer-opacity-range'></div>
								           <input  role="option" id="${visibleID}" aria-label="Layer visibility toggle checkbox for ${layer.name}" type="checkbox" ${checked}  />
								            <label class = 'layer-checkbox' id="${visibleLabelID}" aria-label="Layer visibility toggle checkbox for ${layer.name}" style = 'margin-bottom:0px;display:none;'  for="${visibleID}"></label>
								            <i id = "${spinnerID}" class="fa fa-spinner fa-spin layer-spinner" title='Waiting for layer service from Google Earth Engine'></i>
								            <i id = "${spinnerID}2" style = 'display:none;' class="fa fa-cog fa-spin layer-spinner" title='Waiting for map tiles from Google Earth Engine'></i>
								            <i id = "${spinnerID}3" style = 'display:none;' class="fa fa-cog fa-spin layer-spinner" title='Waiting for map tiles from Google Earth Engine'></i>
                                            
								            <span id = '${spanID}' aria-labelledby="${containerID}" class = 'layer-span'>${layer.name}</span>
								       </li>`);
    //Set up opacity slider
	$("#"+opacityID).slider({
        min: 0,
        max: 100,
        step: 1,
        value: layer.opacity*100,
    	slide: function(e,ui){
    		layer.opacity = ui.value/100;
    		// console.log(layer.opacity);
    		 if(layer.layerType !== 'geeVector' && layer.layerType !== 'geoJSONVector'){
                layer.layer.setOpacity(layer.opacity);
                
                
              }else{
    	            var style = layer.layer.getStyle();
    	            style.strokeOpacity = layer.opacity;
    	            style.fillOpacity = layer.opacity/layer.viz.opacityRatio;
    	            layer.layer.setStyle(style);
    	            if(layer.visible){layer.range}
                    }
            if(layer.visible){
            	layer.rangeOpacity = layer.opacity;
            }     
            layerObj[id].visible = layer.visible;
            layerObj[id].opacity = layer.opacity;
    		setRangeSliderThumbOpacity();
    		}
	})
	function setRangeSliderThumbOpacity(){
		$('#'+opacityID).css("background-color", 'rgba(55, 46, 44,'+layer.rangeOpacity+')')
	}
    //Progress bar controller
	function updateProgress(){
		var pct = layer.percent;
        if(pct === 100 && (layer.layerType === 'geeImage' || layer.layerType === 'geeVectorImage' || layer.layerType === 'geeImageCollection')){jitterZoom()}
		$('#'+containerID).css('background',`-webkit-linear-gradient(left, #FFF, #FFF ${pct}%, transparent ${pct}%, transparent 100%)`)
	}
	//Function for zooming to object
	function zoomFunction(){

		if(layer.layerType === 'geeVector' ){
			centerObject(layer.item)
		}else if(layer.layerType === 'geoJSONVector'){
			// centerObject(ee.FeatureCollection(layer.item.features.map(function(t){return ee.Feature(t).dissolve(100,ee.Projection('EPSG:4326'))})).geometry().bounds())
			// synchronousCenterObject(layer.item.features[0].geometry)
		}else{
          
			if(layer.item.args !== undefined && layer.item.args.value !== null && layer.item.args.value !== undefined){
				synchronousCenterObject(layer.item.args.value)
			}
            else if(layer.item.args !== undefined &&layer.item.args.featureCollection !== undefined &&layer.item.args.featureCollection.args !== undefined && layer.item.args.featureCollection.args.value !== undefined && layer.item.args.featureCollection.args.value !== undefined){
                synchronousCenterObject(layer.item.args.featureCollection.args.value);
            };
		}
	}
    //Try to handle load failures
    function loadFailure(failure){
        layer.loadError = true;
        console.log('GEE Tile Service request failed for '+layer.name);
        console.log(containerID)
        $('#'+containerID).css('background','red');
        $('#'+containerID).attr('title','Layer failed to load. Error message: "'+failure + '"')
        // getGEEMapService();
    }
    //Function to handle turning off of different types of layers
    function turnOff(){
        ga('send', 'event', 'layer-off', layer.layerType,layer.name);
        if(layer.layerType === 'dynamicMapService'){
            layer.layer.setMap(null);
            layer.visible = false;
            layer.percent = 0;
            layer.rangeOpacity = 0;
            setRangeSliderThumbOpacity();
            updateProgress();
            $('#'+layer.legendDivID).hide();
        } else if(layer.layerType !== 'geeVector' && layer.layerType !== 'geoJSONVector'){
            layer.visible = false;
            layer.map.overlayMapTypes.setAt(layer.layerId,null);
            layer.percent = 0;
            updateProgress();
            $('#'+layer.legendDivID).hide();
            layer.rangeOpacity = 0;
            if(layer.layerType !== 'tileMapService' && layer.layerType !== 'dynamicMapService' && layer.canQuery){
             queryObj[queryID].visible = layer.visible;
            }
        }else{
            layer.visible = false;
            
            layer.percent = 0;
            updateProgress();
            $('#'+layer.legendDivID).hide();
            layer.layer.setMap(null);
            layer.rangeOpacity = 0;
            $('#' + spinnerID+'2').hide();
            // geeTileLayersDownloading = 0;
            // updateGEETileLayersLoading();
            if(layer.layerType === 'geeVector' && layer.canQuery){
                queryObj[queryID].visible = layer.visible;
            }
            
        }
        layer.loading = false;
        updateGEETileLayersDownloading();
            
        $('#'+spinnerID + '2').hide();
        $('#'+spinnerID + '3').hide();
        vizToggleCleanup();
    }
    //Function to handle turning on different layer types
    function turnOn(){
        ga('send', 'event', 'layer-on', layer.layerType,layer.name);
        if(!layer.viz.isTimeLapse){
            turnOffTimeLapseCheckboxes();
        }
        if(layer.layerType === 'dynamicMapService'){
            layer.layer.setMap(map);
            layer.visible = true;
            layer.percent = 100;
            layer.rangeOpacity = layer.opacity;
            setRangeSliderThumbOpacity();
            updateProgress();
            $('#'+layer.legendDivID).show();
        } else if(layer.layerType !== 'geeVector' && layer.layerType !== 'geoJSONVector'){
            layer.visible = true;
            layer.map.overlayMapTypes.setAt(layer.layerId,layer.layer);
            $('#'+layer.legendDivID).show();
            layer.rangeOpacity = layer.opacity;
            if(layer.isTileMapService){layer.percent = 100;updateProgress();}
            layer.layer.setOpacity(layer.opacity); 
            if(layer.layerType !== 'tileMapService' && layer.layerType !== 'dynamicMapService' && layer.canQuery){
             queryObj[queryID].visible = layer.visible;
            }
        }else{

           layer.visible = true;
            layer.percent = 100;
            updateProgress();
            $('#'+layer.legendDivID).show();
            layer.layer.setMap(layer.map);
            layer.rangeOpacity = layer.opacity;
            if(layer.layerType === 'geeVector' && layer.canQuery){
                queryObj[queryID].visible = layer.visible;
            }
        }
        vizToggleCleanup();
    }
    //Some functions to keep layers tidy
    function vizToggleCleanup(){
        setRangeSliderThumbOpacity();
        layerObj[id].visible = layer.visible;
        layerObj[id].opacity = layer.opacity;
    }
	function checkFunction(){
        if(!layer.loadError){
            if(layer.visible){
                turnOff();
            }else{turnOn()}  
        }
            
	}
    function turnOffAll(){  
        if(layer.visible){
            $('#'+visibleID).click();
        }
    }
    function turnOnAll(){
        if(!layer.visible){
            $('#'+visibleID).click();
        }
    }
	$("#"+ opacityID).val(layer.opacity * 100);

    //Handle double clicking
	var prevent = false;
	var delay = 200;
	$('#'+ spanID).click(function(){
		setTimeout(function(){
			if(!prevent){
				$('#'+visibleID).click();
			}
		},delay)
		
	});
    $('#'+ spinnerID + '2').click(function(){$('#'+visibleID).click();});
    //Try to zoom to layer if double clicked
	$('#'+ spanID).dblclick(function(){
            zoomFunction();
			prevent = true;
			zoomFunction();
			if(!layer.visible){$('#'+visibleID).click();}
			setTimeout(function(){prevent = false},delay)
		})

	//If checkbox is toggled
	$('#'+visibleID).change( function() {checkFunction();});
   

	layerObj[id].visible = layer.visible;
    layerObj[id].opacity = layer.opacity;
	
    //Handle different scenarios where all layers need turned off or on
    if(!layer.viz.isTimeLapse){
        $('.layer-checkbox').on('turnOffAll',function(){turnOffAll()});
    }
    if(layer.layerType === 'geeVector' || layer.layerType === 'geeVectorImage' || layer.layerType === 'geoJSONVector'){
        $('#'+visibleLabelID).addClass('vector-layer-checkbox');
        $('.vector-layer-checkbox').on('turnOffAll',function(){turnOffAll()});
        $('.vector-layer-checkbox').on('turnOnAll',function(){turnOnAll()});
        $('.vector-layer-checkbox').on('turnOffAllVectors',function(){turnOffAll()});
        $('.vector-layer-checkbox').on('turnOnAllVectors',function(){turnOnAll()});

        if(layer.viz.isUploadedLayer){
            $('#'+visibleLabelID).addClass('uploaded-layer-checkbox');
            selectionTracker.uploadedLayerIndices.push(layer.layerId)
            $('.vector-layer-checkbox').on('turnOffAllUploadedLayers',function(){turnOffAll()});
            $('.vector-layer-checkbox').on('turnOnAllUploadedLayers',function(){turnOnAll()});
        }
    }

    //Handle different object types
	if(layer.layerType === 'geeImage' || layer.layerType === 'geeVectorImage' || layer.layerType === 'geeImageCollection'){
        //Handle image colletions
        if(layer.layerType === 'geeImageCollection'){
            // layer.item = ee.ImageCollection(layer.item);
            layer.imageCollection = layer.item;

            if(layer.viz.reducer === null || layer.viz.reducer === undefined){
                layer.viz.reducer = ee.Reducer.lastNonNull();
            }
            var bandNames = ee.Image(layer.item.first()).bandNames();
            layer.item = ee.ImageCollection(layer.item).reduce(layer.viz.reducer).rename(bandNames).copyProperties(layer.imageCollection.first());
            
        //Handle vectors
        } else if(layer.layerType === 'geeVectorImage' || layer.layerType === 'geeVector'){

            if(layer.viz.isSelectLayer){
                
                selectedFeaturesJSON[layer.name] = {'layerName':layer.name,'filterList':[],'geoJSON':new google.maps.Data(),'id':layer.id,'rawGeoJSON':{},'selection':ee.FeatureCollection([])}
                // selectedFeaturesJSON[layer.name].geoJSON.setMap(layer.map);

                // layer.infoWindow = getInfoWindow(infoWindowXOffset);
                // infoWindowXOffset += 30;
                // selectedFeaturesJSON[layer.name].geoJSON.setStyle({strokeColor:invertColor(layer.viz.strokeColor)});
                // layer.queryVector = layer.item;  
                $('#'+visibleLabelID).addClass('select-layer-checkbox');
                $('.vector-layer-checkbox').on('turnOffAllSelectLayers',function(){turnOffAll()});
                $('.vector-layer-checkbox').on('turnOnAllSelectLayers',function(){turnOnAll()});
                $('.vector-layer-checkbox').on('turnOffAll',function(){turnOffAll()});
                $('.vector-layer-checkbox').on('turnOnAll',function(){turnOnAll()});
            }
            layer.queryItem = layer.item;
            if(layer.layerType === 'geeVectorImage'){
                layer.item = ee.Image().paint(layer.item,null,layer.viz.strokeWeight);
                layer.viz.palette = layer.viz.strokeColor;
            }
            //Add functionality for select layers to be clicked and selected
            if(layer.viz.isSelectLayer){
                var name;
                layer.queryItem.first().propertyNames().evaluate(function(propertyNames,failure){
                    if(failure !== undefined){showMessage('Error',failure)}
                    else{
                        propertyNames.map(function(p){
                            if(p.toLowerCase().indexOf('name') !== -1){name = p}
                        })
                        if(name === undefined){name = 'system:index'}
                        }
                    selectedFeaturesJSON[layer.name].fieldName = name
                    selectedFeaturesJSON[layer.name].eeObject = layer.queryItem.select([name],['name'])
                })
                
            }
            if(layer.viz.isSelectedLayer){
                $('#'+visibleLabelID).addClass('selected-layer-checkbox');
                $('.vector-layer-checkbox').on('turnOffAllSelectLayers',function(){turnOffAll()});
                $('.vector-layer-checkbox').on('turnOnAllSelectLayers',function(){turnOnAll()});
                $('.vector-layer-checkbox').on('turnOffAllSelectedLayers',function(){turnOffAll()});
                $('.vector-layer-checkbox').on('turnOnAllSelectedLayers',function(){turnOnAll()});
                selectionTracker.seletedFeatureLayerIndices.push(layer.layerId)
            }
            
          
        };
        //Add layer to query object if it can be queried
        if(layer.canQuery){
          queryObj[queryID] = {'visible':layer.visible,'queryItem':layer.queryItem,'queryDict':layer.viz.queryDict,'type':layer.layerType,'name':layer.name,'queryDateFormat':layer.viz.queryDateFormat};  
        }
		incrementOutstandingGEERequests();

		//Handle creating GEE map services
		function getGEEMapServiceCallback(eeLayer){
            decrementOutstandingGEERequests();
            $('#' + spinnerID).hide();
            if(layer.viz.isTimeLapse){
                timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs = timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.filter(timeLapseLayerID => timeLapseLayerID !== id)
                var prop = parseInt((1-timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length /timeLapseObj[layer.viz.timeLapseID].nFrames)*100);
                // $('#'+layer.viz.timeLapseID+'-loading-progress').css('width', prop+'%').attr('aria-valuenow', prop).html(prop+'% frames loaded');   
                $('#'+layer.viz.timeLapseID+ '-collapse-label').css('background',`-webkit-linear-gradient(left, #FFF, #FFF ${prop}%, transparent ${prop}%, transparent 100%)`)
                            
                // $('#'+layer.viz.timeLapseID+'-loading-count').html(`${timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length}/${timeLapseObj[layer.viz.timeLapseID].nFrames} layers to load`)
                if(timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length === 0){
                    $('#'+layer.viz.timeLapseID+'-loading-spinner').hide();
                    $('#'+layer.viz.timeLapseID+'-year-label').hide();
                    // $('#'+layer.viz.timeLapseID+'-loading-progress-container').hide();
                    $('#'+layer.viz.timeLapseID+ '-collapse-label').css('background',`-webkit-linear-gradient(left, #FFF, #FFF ${0}%, transparent ${0}%, transparent 100%)`)
                            
                    // $('#'+layer.viz.timeLapseID+'-icon-bar').show();
                    // $('#'+layer.viz.timeLapseID+'-time-lapse-layer-range-container').show();
                    $('#'+layer.viz.timeLapseID+'-toggle-checkbox-label').show();
                    
                    
                    timeLapseObj[layer.viz.timeLapseID].isReady = true;
                };
            }
            $('#' + visibleLabelID).show();
            
            if(layer.currentGEERunID === geeRunID){
                if(eeLayer === undefined){
                    loadFailure();
                }
                else{
                    //Set up GEE map service
                    var MAPID = eeLayer.mapid;
                    var TOKEN = eeLayer.token;
                    layer.highWaterMark = 0;
                    var tileIncremented = false;
                    var eeTileSource = new ee.layers.EarthEngineTileSource(eeLayer);
                    // console.log(eeTileSource)
                    layer.layer = new ee.layers.ImageOverlay(eeTileSource)
                    var overlay = layer.layer;
                    //Set up callback to keep track of tile downloading
                    layer.layer.addTileCallback(function(event){

                        event.count = event.loadingTileCount;
                        if(event.count > layer.highWaterMark){
                            layer.highWaterMark = event.count;
                        }

                        layer.percent = 100-((event.count / layer.highWaterMark) * 100);
                        if(event.count ===0 && layer.highWaterMark !== 0){layer.highWaterMark = 0}

                        if(layer.percent !== 100){
                            layer.loading = true;
                            $('#' + spinnerID+'2').show();
                            if(!tileIncremented){
                                incrementGEETileLayersLoading();
                                tileIncremented = true;
                                if(layer.viz.isTimeLapse){
                                    timeLapseObj[layer.viz.timeLapseID].loadingTilesLayerIDs.push(id);

                                }
                            }
                        }else{
                            layer.loading = false;
                            $('#' + spinnerID+'2').hide();
                            decrementGEETileLayersLoading();
                            if(layer.viz.isTimeLapse){
                                    timeLapseObj[layer.viz.timeLapseID].loadingTilesLayerIDs = timeLapseObj[layer.viz.timeLapseID].loadingTilesLayerIDs.filter(timeLapseLayerID => timeLapseLayerID !== id)
                
                                }
                            tileIncremented = false;
                        }
                        //Handle the setup of layers within a time lapse
                        if(layer.viz.isTimeLapse){
                            var loadingTimelapseLayers = Object.values(layerObj).filter(function(v){return v.loading && v.viz.isTimeLapse && v.whichLayerList === layer.whichLayerList});
                            var loadingTimelapseLayersYears = loadingTimelapseLayers.map(function(f){return [f.viz.year,f.percent].join(':')}).join(', ');
                            var notLoadingTimelapseLayers = Object.values(layerObj).filter(function(v){return !v.loading && v.viz.isTimeLapse && v.whichLayerList === layer.whichLayerList});
                            var notLoadingTimelapseLayersYears = notLoadingTimelapseLayers.map(function(f){return [f.viz.year,f.percent].join(':')}).join(', ');
                            $('#'+layer.viz.timeLapseID + '-message-div').html('Loading:<br>'+loadingTimelapseLayersYears+'<hr>Not Loading:<br>'+notLoadingTimelapseLayersYears);
                            var propTiles = parseInt((1-(timeLapseObj[layer.viz.timeLapseID].loadingTilesLayerIDs.length/timeLapseObj[layer.viz.timeLapseID].nFrames))*100);
                            // $('#'+layer.viz.timeLapseID+'-loading-progress').css('width', propTiles+'%').attr('aria-valuenow', propTiles).html(propTiles+'% tiles loaded');
                            $('#'+layer.viz.timeLapseID+ '-loading-gear').show();
                            
                            $('#'+layer.viz.timeLapseID+ '-collapse-label').css('background',`-webkit-linear-gradient(90deg, #FFF, #FFF ${propTiles}%, transparent ${propTiles}%, transparent 100%)`)
                            if(propTiles < 100){
                                // console.log(propTiles)
                                // if(timeLapseObj[layer.viz.timeLapseID] === 'play'){
                                // pauseButtonFunction();  
                                // }
                            }else{
                                $('#'+layer.viz.timeLapseID+ '-loading-gear').hide();
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
                    if(layer.visible){
                            layer.map.overlayMapTypes.setAt(layer.layerId, layer.layer);
                            $('#'+layer.legendDivID).show();
                            layer.rangeOpacity = layer.opacity; 
                            
                            layer.layer.setOpacity(layer.opacity); 
                        }else{
                          $('#'+layer.legendDivID).hide();
                          layer.rangeOpacity = 0;
                          
                        }
                        setRangeSliderThumbOpacity(); 
                }
                
            }
        }
        function updateTimeLapseLoadingProgress(){
            var loadingTimelapseLayers = Object.values(layerObj).filter(function(v){return v.loading && v.viz.isTimeLapse && v.whichLayerList === layer.whichLayerList}).length;
            var notLoadingTimelapseLayers = Object.values(layerObj).filter(function(v){return !v.loading && v.viz.isTimeLapse && v.whichLayerList === layer.whichLayerList}).length;
            var total = loadingTimelapseLayers+notLoadingTimelapseLayers
            var propTiles = (1-(loadingTimelapseLayers/timeLapseObj[layer.viz.timeLapseID].nFrames))*100
            
            $('#'+layer.viz.timeLapseID+ '-collapse-label').css('background',`-webkit-linear-gradient(0deg, #FFF, #FFF ${propTiles}%, transparent ${propTiles}%, transparent 100%)`)
            if(propTiles < 100){
                $('#'+layer.viz.timeLapseID+ '-loading-gear').show();
                // console.log(propTiles)
                // if(timeLapseObj[layer.viz.timeLapseID] === 'play'){
                // pauseButtonFunction();  
                // }
            }else{
                $('#'+layer.viz.timeLapseID+ '-loading-gear').hide();
            }
            }
        //Handle alternative GEE tile service format
        function geeAltService(eeLayer,failure){
            decrementOutstandingGEERequests();
            $('#' + spinnerID).hide();
            if(layer.viz.isTimeLapse){
                timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs = timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.filter(timeLapseLayerID => timeLapseLayerID !== id)
                var prop = parseInt((1-timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length /timeLapseObj[layer.viz.timeLapseID].nFrames)*100);
                // $('#'+layer.viz.timeLapseID+'-loading-progress').css('width', prop+'%').attr('aria-valuenow', prop).html(prop+'% frames loaded');   
                $('#'+layer.viz.timeLapseID+ '-collapse-label').css('background',`-webkit-linear-gradient(left, #FFF, #FFF ${prop}%, transparent ${prop}%, transparent 100%)`)
                            
                // $('#'+layer.viz.timeLapseID+'-loading-count').html(`${timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length}/${timeLapseObj[layer.viz.timeLapseID].nFrames} layers to load`)
                if(timeLapseObj[layer.viz.timeLapseID].loadingLayerIDs.length === 0){
                    $('#'+layer.viz.timeLapseID+'-loading-spinner').hide();
                    $('#'+layer.viz.timeLapseID+'-year-label').hide();
                    // $('#'+layer.viz.timeLapseID+'-loading-progress-container').hide();
                    $('#'+layer.viz.timeLapseID+ '-collapse-label').css('background',`-webkit-linear-gradient(left, #FFF, #FFF ${0}%, transparent ${0}%, transparent 100%)`)
                            
                    // $('#'+layer.viz.timeLapseID+'-icon-bar').show();
                    // $('#'+layer.viz.timeLapseID+'-time-lapse-layer-range-container').show();
                    $('#'+layer.viz.timeLapseID+'-toggle-checkbox-label').show();
                    
                    
                    timeLapseObj[layer.viz.timeLapseID].isReady = true;
                };
            }
            $('#' + visibleLabelID).show();
            
            if(layer.currentGEERunID === geeRunID){
                if(eeLayer === undefined || failure !== undefined){
                    loadFailure(failure);
                }
                else{
                    const tilesUrl = eeLayer.urlFormat;
                    
                    var getTileUrlFun = function(coord, zoom) {
                        var t = [coord,zoom];
                        
                        
                    let url = tilesUrl
                                .replace('{x}', coord.x)
                                .replace('{y}', coord.y)
                                .replace('{z}', zoom);
                    if(!layer.loading){
                        layer.loading = true;
                        layer.percent = 10;
                        $('#' + spinnerID+'2').show();
                        updateGEETileLayersDownloading();
                        updateProgress();
                        if(layer.viz.isTimeLapse){
                            updateTimeLapseLoadingProgress();  
                        }
                    }
                    
                    return url
                }
                    layer.layer = new google.maps.ImageMapType({
                            getTileUrl:getTileUrlFun
                        })

                    layer.layer.addListener('tilesloaded',function(){
                        layer.percent = 100;
                        layer.loading = false;
                        
                        
                        $('#' + spinnerID+'2').hide();
                        updateGEETileLayersDownloading();
                        updateProgress();
                        if(layer.viz.isTimeLapse){
                            updateTimeLapseLoadingProgress();  
                        }
                    })
                    
                    
                    if(layer.visible){
                        layer.map.overlayMapTypes.setAt(layer.layerId, layer.layer);
                        layer.rangeOpacity = layer.opacity; 
                        layer.layer.setOpacity(layer.opacity);
                        $('#'+layer.legendDivID).show();
                         }else{layer.rangeOpacity = 0;}
                         $('#' + spinnerID).hide();
                        $('#' + visibleLabelID).show();

                        setRangeSliderThumbOpacity();
                }
            }
        }
        //Asynchronous wrapper function to get GEE map service
        layer.mapServiceTryNumber = 0;
        function getGEEMapService(){
            // layer.item.getMap(layer.viz,function(eeLayer){getGEEMapServiceCallback(eeLayer)});
            
            //Handle embeded visualization params if available
            var vizKeys = Object.keys(layer.viz);
            var possibleVizKeys = ['bands','min','max','gain','bias','gamma','palette'];
            var vizFound = false;
            possibleVizKeys.map(function(k){
                var i = vizKeys.indexOf(k) > -1;
                if(i){vizFound = true}
            });
           
            if(vizFound == false){layer.usedViz = {}}
                else{layer.usedViz = layer.viz}
            // console.log(layer.usedViz);
            ee.Image(layer.item).getMap(layer.usedViz,function(eeLayer,failure){
                if(eeLayer === undefined && layer.mapServiceTryNumber <=1){
                    queryObj[queryID].queryItem = layer.item;
                    layer.item = layer.item.visualize();
                    getGEEMapService();
                }else{
                    geeAltService(eeLayer,failure);
                }  
            });

            // layer.item.getMap(layer.viz,function(eeLayer){
                // console.log(eeLayer)
                // console.log(ee.data.getTileUrl(eeLayer))
            // })
            layer.mapServiceTryNumber++;
        };
        getGEEMapService();

    //Handle different vector formats
	}else if(layer.layerType === 'geeVector' || layer.layerType === 'geoJSONVector'){
        if(layer.canQuery){
          queryObj[queryID] = {'visible':layer.visible,'queryItem':layer.queryItem,'queryDict':layer.viz.queryDict,'type':layer.layerType,'name':layer.name};  
        }
		incrementOutstandingGEERequests();
        //Handle adding geoJSON to map
		function addGeoJsonToMap(v){
			$('#' + spinnerID).hide();
			$('#' + visibleLabelID).show();

			if(layer.currentGEERunID === geeRunID){
                if(v === undefined){loadFailure()}
				layer.layer = new google.maps.Data();
               //  layer.viz.icon = {
               //    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
               //    scale: 5,
               //    strokeWeight:2,
               //    strokeColor:"#B40404"
               // }
		        layer.layer.setStyle(layer.viz);
		      
		      	layer.layer.addGeoJson(v);
                if(layer.viz.clickQuery){
                    map.addListener('click',function(){
                        infowindow.setMap(null);
                    })
                    layer.layer.addListener('click', function(event) {
                        console.log(event);
                        infowindow.setPosition(event.latLng);
                        var infoContent = `<table class="table table-hover bg-white">
                            <tbody>`
                        var info = event.feature.h;
                        Object.keys(info).map(function(name){
                            var value = info[name];
                            infoContent +=`<tr><th>${name}</th><td>${value}</td></tr>`;
                        });
                        infoContent +=`</tbody></table>`;
                        infowindow.setContent(infoContent);
                        infowindow.open(map);
                    })  
                }
		      	featureObj[layer.name] = layer.layer
		      	// console.log(this.viz);
		      
		      	if(layer.visible){
		        	layer.layer.setMap(layer.map);
		        	layer.rangeOpacity = layer.viz.strokeOpacity;
		        	layer.percent = 100;
		        	updateProgress();
		        	$('#'+layer.legendDivID).show();
		      	}else{
		        	layer.rangeOpacity = 0;
		        	layer.percent = 0;
		        	$('#'+layer.legendDivID).hide();
		      		}
		      	setRangeSliderThumbOpacity();
		      	}
  		}
  		if(layer.layerType === 'geeVector'){
            decrementOutstandingGEERequests();
  			layer.item.evaluate(function(v){addGeoJsonToMap(v)})
  		}else{decrementOutstandingGEERequests();addGeoJsonToMap(layer.item)}
	//Handle non GEE tile services	
	}else if(layer.layerType === 'tileMapService'){
		layer.layer = new google.maps.ImageMapType({
                getTileUrl: layer.item,
                tileSize: new google.maps.Size(256, 256),
                // tileSize: new google.maps.Size($('#map').width(),$('#map').height()),
                maxZoom: 15
            
            })
		if(layer.visible){
        	
        	layer.map.overlayMapTypes.setAt(layer.layerId, layer.layer);
        	layer.rangeOpacity = layer.opacity; 
        	layer.layer.setOpacity(layer.opacity); 
             }else{layer.rangeOpacity = 0;}
             $('#' + spinnerID).hide();
			$('#' + visibleLabelID).show();
			setRangeSliderThumbOpacity();
                
	//Handle dynamic map services
	}else if(layer.layerType === 'dynamicMapService'){
		function groundOverlayWrapper(){
	      if(map.getZoom() > layer.item[1].minZoom){
	        return getGroundOverlay(layer.item[1].baseURL,layer.item[1].minZoom,layer.item[1].ending)
	      }
	      else{
	        return getGroundOverlay(layer.item[0].baseURL,layer.item[0].minZoom,layer.item[0].ending)
	      }
	      };
	      function updateGroundOverlay(){
                if(layer.layer !== null && layer.layer !== undefined){
                    layer.layer.setMap(null);
                }
                
                layer.layer =groundOverlayWrapper();
                if(layer.visible){
                	layer.layer.setMap(map);
                	layer.percent = 100;
					updateProgress();
                	groundOverlayOn = true
              		$('#'+layer.legendDivID).show();
                	layer.layer.setOpacity(layer.opacity);
                	layer.rangeOpacity = layer.opacity;
                	
                }else{layer.rangeOpacity = 0};
                   setRangeSliderThumbOpacity();          

            };
            updateGroundOverlay();
            // if(layer.visible){layer.opacity = 1}
                // else{this.opacity = 0}
            google.maps.event.addListener(map,'zoom_changed',function(){updateGroundOverlay()});

            google.maps.event.addListener(map,'dragend',function(){updateGroundOverlay()});
             $('#' + spinnerID).hide();
			$('#' + visibleLabelID).show();
			setRangeSliderThumbOpacity();
	}
}


