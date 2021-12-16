require(["esri/Map", 
            "esri/layers/GeoJSONLayer", 
            "esri/views/MapView",

            
            ], function (
      Map,
      GeoJSONLayer,
      MapView,
      BasemapGallery
    ) {
      // If GeoJSON files are not on the same domain as your website, a CORS enabled server
      // or a proxy is required.
      const url = 'https://raw.githack.com/USFS-LCMS/lcms-viewer/prod-viewer/geojson/usfs_boundaries.json';

      // Paste the url into a browser's address bar to download and view the attributes
      // in the GeoJSON file. These attributes include:
      // * mag - magnitude
      // * type - earthquake or other event such as nuclear test
      // * place - location of the event
      // * time - the time of the event
      // Use the Arcade Date() function to format time field into a human-readable format
      // const gif_dir ='http://lcms.forestry.oregonstate.edu/landscapes-in-motion/';
      const gif_dir = 'https://storage.googleapis.com/lcms-gifs/';
      const template = {
        title: null,
        content:  [{
          // The following creates a piechart in addition to an image. The chart is
          // also set  up to work with related tables.
          // Autocasts as new MediaContent()
          type: "media",
          // Autocasts as array of MediaInfo objects
          mediaInfos: [ 
          {
            title: null,
            type: "image", // Autocasts as new ImageMediaInfo object
            // Autocasts as new ImageMediaInfoValue object
            value: {
              "sourceURL": gif_dir+'{GIFNAMECHANGE}',
              "linkURL":  gif_dir+'{GIFNAMECHANGE}',
            }
          },
          {
            title: null,
            type: "image", // Autocasts as new ImageMediaInfo object
            // Autocasts as new ImageMediaInfoValue object
            value: {
              "sourceURL":  gif_dir+'{GIFNAMELANDCOVER}',
              "linkURL":  gif_dir+'{GIFNAMELANDCOVER}',
            }
          },
          {
            title: null,
            type: "image", // Autocasts as new ImageMediaInfo object
            // Autocasts as new ImageMediaInfoValue object
            value: {
              "sourceURL": gif_dir+'{GIFNAMELANDUSE}',
              "linkURL":  gif_dir+'{GIFNAMELANDUSE}',
            }
          }
          ]
        }]
        
      };

      var renderer = {
          type: "simple",  // autocasts as new SimpleRenderer()
          symbol: {
            type: "simple-fill",  // autocasts as new SimpleFillSymbol()
            color: [ 0, 122, 0, 0.5 ],
            outline: {  // autocasts as new SimpleLineSymbol()
              width: 0.8,
              color: '#1B1716'
            }
          }
        };

      const labelClass = {  // autocasts as new LabelClass()
                          symbol: {
                            type: "text",  // autocasts as new TextSymbol()
                            color: "#B2ECE4",
                            haloColor:  "#372E2C",
                            haloSize: 0.8,
                            font: {  // autocast as new Font()
                               family: "Ubuntu Mono",
                               size: 12,
                               // weight: "bold"
                             }
                          },
                          // labelPlacement: "above-right",
                          labelExpressionInfo: {
                            expression: "$feature.FORESTNAME"
                          },
                          // maxScale: 0,
                          // minScale: 30000000,
                          
                        };
      const geojsonLayer = new GeoJSONLayer({
        url: url,
        copyright: "USFS LCMS",
        popupTemplate: template,
        legendEnabled:true,
        renderer: renderer, //optional
        labelingInfo: [labelClass]
      });

      const map = new Map({
        basemap: "hybrid",
        layers: [geojsonLayer]
      });

      const view = new MapView({
        container: "viewDiv",
        center: [-103, 38],
        zoom: 5,
        map: map
      });
    });

//     var basemapGallery = new BasemapGallery({
//   view: view
// });
// // Add widget to the top right corner of the view
// view.ui.add(basemapGallery, {
//   position: "top-right"
// });
