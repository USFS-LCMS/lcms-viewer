import ee

ee.Initialize(project="lcms-292214")


import geeViz.geeView as gv
import geeViz.assetManagerLib as aml
import geeViz.getImagesLib as gil

Map = gv.Map


out_class_name = "Wetland_Class"
dict = {
    f"{out_class_name}_class_names": [
        "Freshwater Forested/Shrub Wetland",
        "Freshwater Emergent Wetland",
        "Freshwater Pond",
        "Estuarine and Marine Wetland",
        "Riverine",
        "Lake",
        "Estuarine and Marine Deepwater",
        "Other",
    ],
    f"{out_class_name}_class_palette": ["008837", "7FC31C", "688CC0", "66C2A5", "0190BF", "13007C", "007C88", "B28653"],
    f"{out_class_name}_class_values": [1, 2, 3, 4, 5, 6, 7, 8],
}

sa_dict = {
    "CONUS": {
        "stateList": [
            "AL",
            "AR",
            "AZ",
            "CA",
            "CO",
            "CT",
            "DE",
            "FL",
            "GA",
            "IA",
            "ID",
            "IL",
            "IN",
            "KS",
            "KY",
            "LA",
            "MA",
            "MD",
            "ME",
            "MI",
            "MN",
            "MO",
            "MS",
            "MT",
            "NC",
            "ND",
            "NE",
            "NH",
            "NJ",
            "NM",
            "NV",
            "NY",
            "OH",
            "OK",
            "OR",
            "PA",
            "RI",
            "SC",
            "SD",
            "TN",
            "TX",
            "UT",
            "VA",
            "VT",
            "WA",
            "WI",
            "WV",
            "WY",
        ],
        "sa": ee.FeatureCollection("projects/lcms-292214/assets/CONUS-Ancillary-Data/conus_bounds_deBuffered"),
    },
    "AK": {"stateList": ["AK"], "sa": ee.FeatureCollection("projects/lcms-292214/assets/R10/AK/Ancillary/alaska_nlcd2016_boundary")},
    "HI": {"stateList": ["HI"], "sa": ee.FeatureCollection("projects/lcms-292214/assets/R5/Hawaii/Ancillary/Hawaii_Boundary_buff2mile")},
}

output_collection = "projects/lcms-292214/assets/Ancillary/NWI"
scale = 10
print(dict)
for sa in sa_dict.keys():
    crs = gil.common_projections[f"NLCD_{sa}"]["crs"]
    transform = gil.common_projections[f"NLCD_{sa}"]["transform"]

    transform[0] = scale
    transform[4] = scale
    states = sa_dict[sa]["stateList"]
    sa_bounds = sa_dict[sa]["sa"].geometry().bounds(500, crs)
    print(sa, len(states))
    nwi = ee.FeatureCollection([ee.FeatureCollection("projects/sat-io/open-datasets/NWI/wetlands/" + s + "_Wetlands") for s in states]).flatten()

    # print(sa, nwi.limit(5).size().getInfo())
    nwi = nwi.remap(dict[f"{out_class_name}_class_names"], dict[f"{out_class_name}_class_values"], "WETLAND_TY")
    nwi = nwi.reduceToImage(["WETLAND_TY"], ee.Reducer.first()).rename(["Wetland_Class"])
    nwi = nwi.set(dict).set({"study_area": sa}).byte()

    Map.addLayer(sa_bounds, {}, f"{sa} bounds")
    # print(nwi.getInfo())
    Map.addLayer(nwi, {"autoViz": True}, sa)

    # print(crs, transform)
    out_name = f"NWI_{sa}_{scale}m"
    gil.exportToAssetWrapper(nwi, out_name, output_collection + "/" + out_name, {".default": "mode"}, sa_bounds, None, crs, transform, overwrite=False)
Map.turnOnInspector()
Map.view()
