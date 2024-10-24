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
        "folder": "projects/sat-io/open-datasets/NWI/wetlands/",
    },
    "AK": {"stateList": ["AK"], "sa": ee.FeatureCollection("projects/lcms-292214/assets/R10/AK/Ancillary/alaska_nlcd2016_boundary"), "folder": "projects/sat-io/open-datasets/NWI/wetlands/"},
    "HI": {"stateList": ["HI"], "sa": ee.FeatureCollection("projects/lcms-292214/assets/R5/Hawaii/Ancillary/Hawaii_Boundary_buff2mile"), "folder": "projects/sat-io/open-datasets/NWI/wetlands/"},
    "PRUSVI": {"stateList": ["PRVI"], "sa": ee.FeatureCollection("projects/lcms-292214/assets/R8/PR_USVI/Ancillary/prusvi_boundary_buff2mile"), "folder": "projects/lcms-292214/assets/Ancillary/NWI_Vector/"},
    "DC": {
        "stateList": ["DC"],
        "sa": ee.FeatureCollection(
            [
                ee.Feature(
                    ee.Geometry.Polygon(
                        [[[-77.12470455038664, 38.750112923138474], [-76.87469177961412, 38.750112923138474], [-76.87469177961412, 39.00012650312057], [-77.12470455038664, 39.00012650312057], [-77.12470455038664, 38.750112923138474]]], None, False
                    )
                )
            ]
        ),
        "folder": "projects/lcms-292214/assets/Ancillary/NWI_Vector/",
    },
}

output_collection = "projects/lcms-292214/assets/Ancillary/NWI"
scale = 10
print(dict)
for sa in list(sa_dict.keys())[-2:]:
    try:
        crs = gil.common_projections[f"NLCD_{sa}"]["crs"]
        transform = gil.common_projections[f"NLCD_{sa}"]["transform"]
    except:
        crs = gil.common_projections[f"NLCD_CONUS"]["crs"]
        transform = gil.common_projections[f"NLCD_CONUS"]["transform"]
    transform[0] = scale
    transform[4] = scale
    print(sa)  # crs, transform)
    states = sa_dict[sa]["stateList"]

    sa_bounds = sa_dict[sa]["sa"].geometry().bounds(500, crs)
    # print(sa, len(states))
    nwi = ee.FeatureCollection([ee.FeatureCollection(sa_dict[sa]["folder"] + s + "_Wetlands") for s in states]).flatten()

    # # print(sa, nwi.limit(5).size().getInfo())
    nwi = nwi.remap(dict[f"{out_class_name}_class_names"], dict[f"{out_class_name}_class_values"], "WETLAND_TY")
    nwi = nwi.reduceToImage(["WETLAND_TY"], ee.Reducer.first()).rename(["Wetland_Class"])
    nwi = nwi.set(dict).set({"study_area": sa}).byte()

    Map.addLayer(ee.Feature(sa_bounds), {"styleParams": {"lineType": "dashed", "color": "F0F"}}, f"{sa} bounds")
    # # print(nwi.getInfo())
    Map.addLayer(nwi, {"autoViz": True}, sa)

    # # print(crs, transform)
    out_name = f"NWI_{sa}_{scale}m"
    print(out_name)
    gil.exportToAssetWrapper(nwi, out_name, output_collection + "/" + out_name, {".default": "mode"}, sa_bounds, None, crs, transform, overwrite=False)


# Must set up PRUSVI and DC separately
# From: https://www.fws.gov/program/national-wetlands-inventory/download-state-wetlands-data
# Download shp and upload to gee as an asset
Map.turnOnInspector()
Map.view()
