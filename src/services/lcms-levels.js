function levelSymbology() {
  this.colorUIAdded = false;
  this.lcmsLandCoverLookup = [
    [1, "005e00", "1", "Vegetated"],
    [2, "d3bf9b", "2", "Non-Vegetated"],
    [3, "1b1716", "3", "Non-Processing Area Mask"],
    [1, "005e00", "1.1", "Tree Vegetated"],
    [2, "ffff00", "1.2", "Non-Tree Vegetated"],
    [3, "d3bf9b", "2.1", "Non-Vegetated"],
    [4, "1b1716", "3.1", "Non-Processing Area Mask"],
    [1, "005e00", "1.1.1", "Tree"],
    [2, "e68a00", "1.2.1", "Shrub"],
    [3, "ffff00", "1.2.2", "Grass/Forb/Herb"],
    [4, "d3bf9b", "2.1.1", "Barren or Impervious"],
    [5, "ffffff", "2.1.2", "Snow or Ice"],
    [6, "4780f3", "2.1.3", "Water"],
    [7, "1b1716", "3.1.1", "Non-Processing Area Mask"],
    [1, "005e00", "1.1.1.1", "Tree"],
    [2, "008000", "1.1.1.2", "Tall Shrub & Tree Mix (SEAK Only)"],
    [3, "00cc00", "1.1.1.3", "Shrub & Tree Mix"],
    [4, "b3ff1a", "1.1.1.4", "Grass/Forb/Herb & Tree Mix"],
    [5, "99ff99", "1.1.1.5", "Barren & Tree Mix"],
    [6, "b30088", "1.2.1.1", "Tall Shrub (SEAK Only)"],
    [7, "e68a00", "1.2.1.2", "Shrub"],
    [8, "ffad33", "1.2.1.3", "Grass/Forb/Herb & Shrub Mix"],
    [9, "ffe0b3", "1.2.1.4", "Barren & Shrub Mix"],
    [10, "ffff00", "1.2.2.1", "Grass/Forb/Herb"],
    [11, "aa7700", "1.2.2.2", "Barren & Grass/Forb/Herb Mix"],
    [12, "d3bf9b", "2.1.1.1", "Barren or Impervious"],
    [13, "ffffff", "2.1.2.1", "Snow or Ice"],
    [14, "4780f3", "2.1.3.1", "Water"],
    [15, "1b1716", "3.1.1.1", "Non-Processing Area Mask"],
  ];

  this.lcmsChangeLookup = [
    [1, "3d4551", "1", "Stable"],
    [2, "d54309", "2", "Loss"],
    [3, "1b1716", "3", "Non-Processing Area Mask"],
    [1, "3d4551", "1.1", "Stable"],
    [2, "00a398", "1.2", "Gain"],
    [3, "d54309", "2.1", "Loss"],
    [4, "1b1716", "3.1", "Non-Processing Area Mask"],
    [1, "3d4551", "1.1.1", "Stable"],
    [4, "00a398", "1.2.1", "Gain"],
    [2, "f39268", "2.1.1", "Slow Loss"],
    [3, "d54309", "2.1.2", "Fast Loss"],
    [5, "1b1716", "3.1.1", "Non-Processing Area Mask"],
  ];

  this.lcmsLandUseLookup = [
    [1, "f88db9", "1", "Anthropogenic"],
    [2, "1b9d0c", "2", "Non-Anthropogenic"],
    [3, "1b1716", "3", "Non-Processing Area Mask"],
    [1, "efff6b", "1.1", "Agriculture"],
    [2, "ff2ff8", "1.2", "Developed"],
    [3, "1b9d0c", "2.1", "Forest"],
    [4, "a1a1a1", "2.2", "Other"],
    [5, "c2b34a", "2.3", "Rangeland or Pasture"],
    [6, "1b1716", "3.1", "Non-Processing Area Mask"],
    [1, "efff6b", "1.1.1", "Agriculture"],
    [2, "ff2ff8", "1.2.1", "Developed"],
    [3, "1b9d0c", "2.1.1", "Forest"],
    [4, "97ffff", "2.2.1", "Non-Forest Wetland"],
    [5, "a1a1a1", "2.2.2", "Other"],
    [6, "c2b34a", "2.3.1", "Rangeland or Pasture"],
    [7, "1b1716", "3.1.1", "Non-Processing Area Mask"],
  ];
  this.products = ["Land_Cover", "Land_Use", "Change"];
  this.initializeLookup = function () {
    if (urlParams.productLevelLookups === undefined) {
      urlParams.productLevelLookups = {};
      urlParams.productLevelLookups["Land_Cover"] = {};
      urlParams.productLevelLookups["Change"] = {};
      urlParams.productLevelLookups["Land_Use"] = {};
      this.lcmsLandCoverLookup.map(
        (r) =>
          (urlParams.productLevelLookups["Land_Cover"][r[2]] = [
            r[0],
            r[1],
            r[3],
          ])
      );
      this.lcmsLandUseLookup.map(
        (r) =>
          (urlParams.productLevelLookups["Land_Use"][r[2]] = [r[0], r[1], r[3]])
      );
      this.lcmsChangeLookup.map(
        (r) =>
          (urlParams.productLevelLookups["Change"][r[2]] = [r[0], r[1], r[3]])
      );
    }
  };
  this.printIt = function (message) {
    console.log(message);
  };
  this.setupUI = function () {
    $("#level-collapse-container").empty();

    this.products.map((k) => {
      const productTitle = k.replaceAll("_", " ");
      const level_collapse_div_id = `${k}-level-color-pickers-div`;
      const collapseVisible = k === "Land_Cover";
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

    return {
      remap_from: fromList,
      remap_to: toList,
      viz_dict: out_lookup,
    };
  };

  this.update_colors = function () {
    console.log("updating colors");
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
    this.initializeLookup();

    this.propsHighest = Object.assign(
      {},
      this.getLevelNRemap(3, (bandName = "Land_Use")).viz_dict,
      this.getLevelNRemap(4, (bandName = "Land_Cover")).viz_dict,
      this.getLevelNRemap(3, (bandName = "Change")).viz_dict
    );
  };
  this.initialize();
}
levelObj = new levelSymbology();
