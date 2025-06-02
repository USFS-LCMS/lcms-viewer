const {
    getQueryClassDict,
    yearSlice,
    getEVTVegClassLayer
} = require('../src/gee/gee-run/run-ravg-viewer');

describe('run-ravg-viewer.js tests', () => {

    test("getQueryClassDict function test", () => {

        let testRef = {
            "Non - tree": "#f7f1c6",
            "Pinyon - Juniper Woodland": "#b3d1c8",
            "Deciduous Open Tree Canopy (OTC)": "#75b4c5",
            "Evergreen Closed Tree Canopy (CTC)": "#3597c2",
            "Evergreen Open Tree Canopy": "#2e7ba1",
            "Mixed Evergreen - Deciduous OTC": "#285e81",
            "Deciduous Closed Tree Canopy": "#233e66",
            "Mixed Evergreen - Deciduous CTC": "#1e1950",
        };

        let expected = {
            1: "Non - tree",
            2: "Pinyon - Juniper Woodland",
            3: "Deciduous Open Tree Canopy (OTC)",
            4: "Evergreen Closed Tree Canopy (CTC)",
            5: "Evergreen Open Tree Canopy",
            6: "Mixed Evergreen - Deciduous OTC",
            7: "Deciduous Closed Tree Canopy",
            8: "Mixed Evergreen - Deciduous CTC",
        };

        expect(getQueryClassDict(testRef)).toEqual(expected);

    });

    test("yearSlice function test", () => {
        expect(yearSlice("TEST123420250425")).toEqual("2025");
    });

    test("getEVTVegClassLayer function test", () => {

        let actual = getEVTVegClassLayer({}, 2020);

        let testClassDict = {
            "Non - tree": "#f7f1c6",
            "Pinyon - Juniper Woodland": "#b3d1c8",
            "Deciduous Open Tree Canopy (OTC)": "#75b4c5",
            "Evergreen Closed Tree Canopy (CTC)": "#3597c2",
            "Evergreen Open Tree Canopy": "#2e7ba1",
            "Mixed Evergreen - Deciduous OTC": "#285e81",
            "Deciduous Closed Tree Canopy": "#233e66",
            "Mixed Evergreen - Deciduous CTC": "#1e1950",
        }

        expect(actual).toHaveProperty("imageLayer");
        expect(actual).toHaveProperty("visualParams");
        expect(actual).toHaveProperty("classDict");
        expect(actual).toHaveProperty("label");

        expect(actual.imageLayer).toEqual({});
        expect(actual.visualParams).toEqual({
            bands: ["b1"],
            min: 1,
            max: 8,
            palette: Object.values(testClassDict),
            addToClassLegend: true,
            classLegendDict: testClassDict,
            queryDict: {
                1: "Non - tree",
                2: "Pinyon - Juniper Woodland",
                3: "Deciduous Open Tree Canopy (OTC)",
                4: "Evergreen Closed Tree Canopy (CTC)",
                5: "Evergreen Open Tree Canopy",
                6: "Mixed Evergreen - Deciduous OTC",
                7: "Deciduous Closed Tree Canopy",
                8: "Mixed Evergreen - Deciduous CTC",
            },
            years: [2001, 2012, 2014, 2016, 2020]
        });
        expect(actual.classDict).toEqual(testClassDict);
        expect(actual.label).toEqual("EVT 2020 Vegetation Classes");

    });

})