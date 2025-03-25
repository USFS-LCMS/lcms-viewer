function levelSymbology() {
  this.colorUIAdded = false;
  this.originalDefaultProductLevelLookups = {
    Land_Cover: {
      1: [1, "005E00", "Vegetated"],
      2: [2, "D3BF9B", "Non-Vegetated"],
      3: [3, "1B1716", "Non-Processing Area Mask"],
      1.1: [1, "005E00", "Tree Vegetated"],
      1.2: [2, "FFFF00", "Non-Tree Vegetated"],
      2.1: [3, "D3BF9B", "Non-Vegetated"],
      3.1: [4, "1B1716", "Non-Processing Area Mask"],
      "1.1.1": [1, "005E00", "Tree"],
      "1.2.1": [2, "E68A00", "Shrub"],
      "1.2.2": [3, "FFFF00", "Grass/Forb/Herb"],
      "2.1.1": [4, "D3BF9B", "Barren or Impervious"],
      "2.1.2": [5, "FFFFFF", "Snow or Ice"],
      "2.1.3": [6, "4780F3", "Water"],
      "3.1.1": [7, "1B1716", "Non-Processing Area Mask"],
      "1.1.1.1": [1, "005E00", "Tree"],
      "1.1.1.2": [2, "008000", "Tall Shrub & Tree Mix (SEAK Only)"],
      "1.1.1.3": [3, "00CC00", "Shrub & Tree Mix"],
      "1.1.1.4": [4, "B3FF1A", "Grass/Forb/Herb & Tree Mix"],
      "1.1.1.5": [5, "99FF99", "Barren & Tree Mix"],
      "1.2.1.1": [6, "B30088", "Tall Shrub (SEAK Only)"],
      "1.2.1.2": [7, "E68A00", "Shrub"],
      "1.2.1.3": [8, "FFAD33", "Grass/Forb/Herb & Shrub Mix"],
      "1.2.1.4": [9, "FFE0B3", "Barren & Shrub Mix"],
      "1.2.2.1": [10, "FFFF00", "Grass/Forb/Herb"],
      "1.2.2.2": [11, "AA7700", "Barren & Grass/Forb/Herb Mix"],
      "2.1.1.1": [12, "D3BF9B", "Barren or Impervious"],
      "2.1.2.1": [13, "FFFFFF", "Snow or Ice"],
      "2.1.3.1": [14, "4780F3", "Water"],
      "3.1.1.1": [15, "1B1716", "Non-Processing Area Mask"],
    },
    Change: {
      1: [1, "3D4551", "Stable"],
      2: [2, "D54309", "Loss"],
      3: [3, "1B1716", "Non-Processing Area Mask"],
      1.1: [1, "3D4551", "Stable"],
      1.2: [2, "00A398", "Gain"],
      2.1: [3, "D54309", "Loss"],
      3.1: [4, "1B1716", "Non-Processing Area Mask"],
      "1.1.1": [1, "3D4551", "Stable"],
      "1.2.1": [4, "00A398", "Gain"],
      "2.1.1": [2, "F39268", "Slow Loss"],
      "2.1.2": [3, "D54309", "Fast Loss"],
      "3.1.1": [5, "1B1716", "Non-Processing Area Mask"],
    },
    Land_Use: {
      1: [1, "F88DB9", "Anthropogenic"],
      2: [2, "1B9D0C", "Non-Anthropogenic"],
      3: [3, "1B1716", "Non-Processing Area Mask"],
      1.1: [1, "EFFF6B", "Agriculture"],
      1.2: [2, "FF2FF8", "Developed"],
      2.1: [3, "1B9D0C", "Forest"],
      2.2: [4, "A1A1A1", "Other"],
      2.3: [5, "C2B34A", "Rangeland or Pasture"],
      3.1: [6, "1B1716", "Non-Processing Area Mask"],
      "1.1.1": [1, "EFFF6B", "Agriculture"],
      "1.2.1": [2, "FF2FF8", "Developed"],
      "2.1.1": [3, "1B9D0C", "Forest"],
      "2.2.1": [4, "97FFFF", "Non-Forest Wetland"],
      "2.2.2": [5, "A1A1A1", "Other"],
      "2.3.1": [6, "C2B34A", "Rangeland or Pasture"],
      "3.1.1": [7, "1B1716", "Non-Processing Area Mask"],
    },
  };

  this.newDefaultProductLevelLookups = {
    Land_Cover: {
      1: [1, "61BB46", "Vegetated"],
      2: [2, "58646E", "Non-Vegetated"],
      3: [3, "1B1716", "Non-Processing Area Mask"],
      1.1: [1, "004E2B", "Tree Vegetated"],
      1.2: [2, "8DA463", "Non-Tree Vegetated"],
      2.1: [3, "893F54", "Non-Vegetated"],
      3.1: [4, "1B1716", "Non-Processing Area Mask"],
      "1.1.1": [1, "004E2B", "Tree"],
      "1.2.1": [2, "F89A1C", "Shrub"],
      "1.2.2": [3, "E5E98A", "Grass/Forb/Herb"],
      "2.1.1": [4, "893F54", "Barren or Impervious"],
      "2.1.2": [5, "E4F5FD", "Snow or Ice"],
      "2.1.3": [6, "00B6F0", "Water"],
      "3.1.1": [7, "1B1716", "Non-Processing Area Mask"],
      "1.1.1.1": [1, "004E2B", "Tree"],
      "1.1.1.2": [2, "009344", "Tall Shrub & Tree Mix (AK Only)"],
      "1.1.1.3": [3, "61BB46", "Shrub & Tree Mix"],
      "1.1.1.4": [4, "ACBB67", "Grass/Forb/Herb & Tree Mix"],
      "1.1.1.5": [5, "8B8560", "Barren & Tree Mix"],
      "1.2.1.1": [6, "CAFD4B", "Tall Shrub (AK Only)"],
      "1.2.1.2": [7, "F89A1C", "Shrub"],
      "1.2.1.3": [8, "8FA55F", "Grass/Forb/Herb & Shrub Mix"],
      "1.2.1.4": [9, "BEBB8E", "Barren & Shrub Mix"],
      "1.2.2.1": [10, "E5E98A", "Grass/Forb/Herb"],
      "1.2.2.2": [11, "DDB925", "Barren & Grass/Forb/Herb Mix"],
      "2.1.1.1": [12, "893F54", "Barren or Impervious"],
      "2.1.2.1": [13, "E4F5FD", "Snow or Ice"],
      "2.1.3.1": [14, "00B6F0", "Water"],
      "3.1.1.1": [15, "1B1716", "Non-Processing Area Mask"],
    },
    Change: {
      1: [1, "D54309", "Disturbance"],
      2: [2, "3D4551", "Stable"],
      3: [3, "1B1716", "Non-Processing Area Mask"],

      1.1: [1, "D54309", "Disturbance"],
      2.1: [2, "00A398", "Vegetation Growth"],
      2.2: [3, "3D4551", "Stable"],
      3.1: [4, "1B1716", "Non-Processing Area Mask"],

      "1.1.1": [1, "D54309", "Abrupt Disturbance"],
      "1.1.2": [2, "F39268", "Insect, Disease or Drought Stress"],
      "2.1.1": [3, "00A398", "Vegetation Growth"],
      "2.2.1": [4, "3D4551", "Stable"],
      "3.1.1": [5, "1B1716", "Non-Processing Area Mask"],

      "1.1.1.1": [1, "FF09F3", "Wind"],
      "1.1.1.2": [2, "CC982E", "Desiccation"],
      "1.1.1.3": [3, "0ADAFF", "Inundation"],
      "1.1.1.4": [4, "D54309", "Fire"],
      "1.1.1.5": [5, "FAFA4B", "Mechanical Land Transformation"],
      "1.1.1.6": [6, "AFDE1C", "Tree Removal"],
      "1.1.1.7": [7, "C291D5", "Other Loss"],
      "1.1.2.1": [8, "F39268", "Insect, Disease, or Drought Stress"],
      "2.1.1.1": [9, "00A398", "Vegetation Growth"],
      "2.2.1.1": [10, "3D4551", "Stable"],
      "3.1.1.1": [11, "1B1716", "Non-Processing Area Mask"],

      "1.1.1.1.1": [1, "FF09F3", "Wind"],
      "1.1.1.1.2": [2, "541AC2", "Hurricane"],
      "1.1.1.7.2": [3, "E4F5FD", "Snow or Ice Transition"],
      "1.1.1.2.1": [4, "CC982E", "Desiccation"],
      "1.1.1.3.1": [5, "0ADAFF", "Inundation"],
      "1.1.1.4.1": [6, "A10018", "Prescribed Fire"],
      "1.1.1.4.2": [7, "D54309", "Wildfire"],
      "1.1.1.5.1": [8, "FAFA4B", "Mechanical Land Transformation"],
      "1.1.1.6.1": [9, "AFDE1C", "Tree Removal"],
      "1.1.2.1.1": [10, "FFC80D", "Defoliation"],
      "1.1.2.1.2": [11, "A64C28", "Southern Pine Beetle"],
      "1.1.2.1.3": [12, "F39268", "Insect, Disease, or Drought Stress"],
      "1.1.1.7.1": [13, "C291D5", "Other Loss"],
      "2.1.1.1.1": [14, "00A398", "Vegetation Growth"],
      "2.2.1.1.1": [15, "3D4551", "Stable"],
      "3.1.1.1.1": [16, "1B1716", "Non-Processing Area Mask"],
    },

    Land_Use: {
      1: [1, "FF9EAB", "Anthropogenic"],
      2: [2, "004E2B", "Non-Anthropogenic"],
      3: [3, "1B1716", "Non-Processing Area Mask"],
      1.1: [1, "FBFF97", "Agriculture"],
      1.2: [2, "E6558B", "Developed"],
      2.1: [3, "004E2B", "Forest"],
      2.2: [4, "9DBAC5", "Other"],
      2.3: [5, "A6976A", "Rangeland or Pasture"],
      3.1: [6, "1B1716", "Non-Processing Area Mask"],
    },
  };
  this.products = ["Land_Cover", "Land_Use", "Change"];

  if (urlParams.productLevelLookups === undefined) {
    if (
      urlParams.originalColors !== undefined &&
      urlParams.originalColors === true
    ) {
      urlParams.productLevelLookups = this.originalDefaultProductLevelLookups;
    } else {
      urlParams.productLevelLookups = this.newDefaultProductLevelLookups;
    }
  }

  this.setupUI = function () {
    $("#level-collapse-container").empty();

    this.products.map((k) => {
      const productTitle = k.replaceAll("_", " ");
      const level_collapse_div_id = `${k}-level-color-pickers-div`;
      const collapseVisible = k === "Change";
      addSubCollapse(
        `level-collapse-container`,
        `${k}-level-color-pickers-label`,
        level_collapse_div_id,
        `Choose ${productTitle} Colors`,
        "",
        collapseVisible,
        "",
        `Choose colors for various levels of the LCMS ${productTitle} product. After you finish selecting colors, update map layers and charts by clicking the Submit button below.`
      );

      $("#" + level_collapse_div_id).append(`<div >
                      <table class = 'class-color-pickers-table' id = "${k}-color-list">
                          <thead >
                          <tr>
                          <th>Level</th>
                          <th>Value</th>
                          <th>Name</th>
                            <th>Color</th>
                          </tr>
                        </thead>
                        </table>
                      </p>`);
      let lastLevel = -1;
      Object.keys(urlParams.productLevelLookups[k]).map((k2) => {
        const l = urlParams.productLevelLookups[k][k2];
        const tempKey = `${k}---${k2}---picker`;
        const level = k2.split(".").length;
        let rowStyle = "";
        if (lastLevel !== level) {
          rowStyle = "style = 'border-top:1px solid black;'";
          lastLevel = level;
        }

        $(`#${k}-color-list`).append(`<tr ${rowStyle}>
            <td style='border-right:1px solid black;'>${level}</td>
            <td style = 'padding-left:0.25rem;'>${l[0]}</td>
            <td style = 'padding-left:0.25rem;'>${l[2]}</td>
            <td>
            <input  class = 'class-color-pickers' id="${tempKey}" data-jscolor="{backgroundColor:'#372e2c',value:'#${l[1]}',onChange: 'levelObj.update_colors()'}">
  
                      </td>
          </tr>`);
      });
    });
    this.colorUIAdded = true;
  };

  // # Get a lookup of names, values, and palette to set as properties for a given band
  this.getLookup = function (bandName, codes) {
    codes = codes || Object.keys(urlParams.productLevelLookups["Land_Cover"]);
    const out = {};
    out[`${bandName}_class_names`] = codes.map(
      (c) => urlParams.productLevelLookups[bandName][c][2]
    );
    out[`${bandName}_class_palette`] = codes.map(
      (c) => urlParams.productLevelLookups[bandName][c][1]
    );
    out[`${bandName}_class_values`] = codes.map(
      (c) => urlParams.productLevelLookups[bandName][c][0]
    );
    return out;
  };

  // # Method to collapse to a given level (1-4), and return the remap values as well as corresponding visualization properties
  this.getLevelNRemap = function (level, bandName = "Land_Cover") {
    if (this.colorUIAdded) {
      this.update_colors();
    }
    const names = Object.keys(urlParams.productLevelLookups[bandName]);
    const max_level = quantile(
      names.map((n) => n.split(".").length),
      1
    );

    let highest_level = names.filter((n) => n.split(".").length == max_level);
    let the_level = names.filter((n) => n.split(".").length == level);

    let fromList = [];
    let toList = [];

    highest_level.map((code) => {
      fromList.push(urlParams.productLevelLookups[bandName][code][0]);
      toList.push(
        urlParams.productLevelLookups[bandName][
          code.split(".").slice(0, level).join(".")
        ][0]
      );
    });

    const out_lookup = this.getLookup(bandName, the_level);
    //
    return {
      remap_from: fromList,
      remap_to: toList,
      viz_dict: out_lookup,
    };
  };

  this.update_colors = function () {
    // console.log("updating colors");
    // const t_lookup = urlParams.productLevelLookups;
    $(".class-color-pickers").each(function () {
      const id = $(this).attr("id");
      let v = $(this).attr("data-current-color");
      v = v[0] === "#" ? v.slice(1) : v;
      const product = id.split("---")[0];
      const code = id.split("---")[1];

      urlParams.productLevelLookups[product][code][1] = v;
    });
  };
  this.initialize = function () {
    this.propsHighest = Object.assign(
      {},
      this.getLevelNRemap(2, (bandName = "Land_Use")).viz_dict,
      this.getLevelNRemap(4, (bandName = "Land_Cover")).viz_dict,
      this.getLevelNRemap(3, (bandName = "Change")).viz_dict
    );
  };
  this.initialize();

  this.oldObjInfo = {
    Change_class_names: [
      "Stable",
      "Slow Loss",
      "Fast Loss",
      "Gain",
      "Non-Processing Area Mask",
    ],
    Change_class_palette: ["3d4551", "f39268", "d54309", "00a398", "1b1716"],
    Change_class_values: [1, 2, 3, 4, 5],
    Land_Cover_class_names: [
      "Trees",
      "Tall Shrubs & Trees Mix (SEAK Only)",
      "Shrubs & Trees Mix",
      "Grass/Forb/Herb & Trees Mix",
      "Barren & Trees Mix",
      "Tall Shrubs (SEAK Only)",
      "Shrubs",
      "Grass/Forb/Herb & Shrubs Mix",
      "Barren & Shrubs Mix",
      "Grass/Forb/Herb",
      "Barren & Grass/Forb/Herb Mix",
      "Barren or Impervious",
      "Snow or Ice",
      "Water",
      "Non-Processing Area Mask",
    ],
    Land_Cover_class_palette: [
      "005e00",
      "008000",
      "00cc00",
      "b3ff1a",
      "99ff99",
      "b30088",
      "e68a00",
      "ffad33",
      "ffe0b3",
      "ffff00",
      "aa7700",
      "d3bf9b",
      "ffffff",
      "4780f3",
      "1b1716",
    ],
    Land_Cover_class_values: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    ],
    Land_Use_class_names: [
      "Agriculture",
      "Developed",
      "Forest",
      "Non-Forest Wetland",
      "Other",
      "Rangeland or Pasture",
      "Non-Processing Area Mask",
    ],
    Land_Use_class_palette: [
      "efff6b",
      "ff2ff8",
      "1b9d0c",
      "97ffff",
      "a1a1a1",
      "c2b34a",
      "1b1716",
    ],
    Land_Use_class_values: [1, 2, 3, 4, 5, 6, 7],

    layerType: "ImageCollection",
  };
}
levelObj = new levelSymbology();
