**********RSAC RCR GEE Front-end**************

*********************************************************************************
*********************************************************************************
Designed to provide GEE front-end with no required user authentication

*********************************************************************************
*********************************************************************************
To deploy:
Download and install the App Engine SDK- https://cloud.google.com/appengine/docs/php/download
Make a project on https://console.developers.google.com/ with the same name as found in the .yaml first line (ex: my-first-ee-appspot)
Start the App Engine launcher
Add the project to the App Engine
Run the project
Deploy it

Updated method:
Run local dev server:
Run cmd in directory where project yaml is
Run: dev_appserver.py app.yaml
Go to: localhost:8080


To deploy:

Run cmd in directory where project yaml is
Select project with: gcloud init
gcloud --project projectName app deploy
gcloud app browse
*********************************************************************************
*********************************************************************************
Any server-side EE object/method works as it would in the Playground.  The only client-side method in the Playground that behaves roughly the same is Map.addLayer.  
Exporting and charting is handled slightly differently.
*********************************************************************************
*********************************************************************************
Keywords and non standard EE methods used in the run function:

chartCollection- EE image collection to be charted when user selects right-click charting and then right-clicks.  This collection should have a system:time_start image attribute to work properly.

Map.addExport- Syntax: Map.addExport			
			(singleOrMultiBandEEImage,
			'ExportName',
			DefaultSpatialResolution,
			minUserSelectableSpatialResolution,
			maxUserSelectableSpatialResolution,
			userSelectableSpatialResolutionStep,
			booleanToExportByDefault,
			vizParamsForLookingAtExports);
		Ex: Map.addExport(eeImage,'Export Composite 1',30,30,450,15,false,{'min':0.1,'max':0.4,'bands':'swir1,nir,red'});

Map.addREST- EX: Map.addREST(standardTileURLFunction('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/'),'ESRI World Imagery',false,19, 'ESRI worldwide high resolution imagery')

Map.addPlot- Ex: Map.addPlot([ID or Name,lng,lat]);- For adding plot buttons

*********************************************************************************
*********************************************************************************
Primary components to edit:
app.yaml- The name of the site on the first line
index.html- Various bits including various booleans at the very top, the title, the website icon, help-window message, and user-inputs inside the <variable-list>
ee/run.js- within the run.js script, place all ee code inside function called run wrapping all EE code (ex: run(){var image = ee.Image(1);Map.addLayer(image)})
js/pt-parser.js- Add any x,y coords and wrap add them using the Map.addPlot([ID,lng,lat])


*********************************************************************************
*********************************************************************************
Structure:
app.yaml- change the application name on the first line

static
	index.html- Primary html page. Several parameters at the very top will dictate what widgets 
			appear on the page.  Any user-input for controlling EE objects are specified inside the <variable-list> section
	
	components- core components.  No need to edit

	css- any css components. No need to edit

	ee
		run.js- All ee code must be within a function called run() inside the run.js script

	elements

		ee-layer.html- wrappers for ee layers, legends, REST mapping services, and exports.  Little need to edit.

		layer-list.html- containers for layers, legend, and plots to have elements added on-the-fly on loading. Little need to edit.

		variables.html- wrappers for user-inputs.  Supports:
								 numbers (variable-number)
								 text (variable-text)
								 range sliders (variable-range)
								 checkbox (variable-checkbox)
								 radio buttons (variable-radio)- only supports two radios at a time.  Supports numeric, string, or boolean values

	images- any images
	
	jquery- jquery
	
	js
		chart-manager.js- Wrapper for EE to client side charting using Google Charts API. Little need to edit
		drawing-manager.js- Wrapper to keep track of user-edited shapes, caching, and updating.  Little need to edit.
		ee_api_js.js- EE api.  Update as needed from: https://github.com/google/earthengine-api/tree/master/javascript/build
		export-manager.js- Script that builds, submits, and tracks export tasks.  Little need to edit.
		map-manager.js- Script that manages anything on the map.  This includes many of the wrappers for adding EE and REST layers, and authentication.  Little need to edit
		pt-parser.js- Script for adding plots with user-navigation if needed
		