const region8_fps = [
  "01",
  "05",
  "12",
  "13",
  "21",
  "22",
  "28",
  "37",
  "40",
  "45",
  "47",
  "48",
  "51",
];

const allStates = [
  {
    NAME: "United States Virgin Islands",
    STATEFP: "78",
    STUSPS: "VI",
  },
  {
    NAME: "Commonwealth of the Northern Mariana Islands",
    STATEFP: "69",
    STUSPS: "MP",
  },
  {
    NAME: "Guam",
    STATEFP: "66",
    STUSPS: "GU",
  },
  {
    NAME: "American Samoa",
    STATEFP: "60",
    STUSPS: "AS",
  },
  {
    NAME: "Puerto Rico",
    STATEFP: "72",
    STUSPS: "PR",
  },
  {
    NAME: "Rhode Island",
    STATEFP: "44",
    STUSPS: "RI",
  },
  {
    NAME: "New Hampshire",
    STATEFP: "33",
    STUSPS: "NH",
  },
  {
    NAME: "Vermont",
    STATEFP: "50",
    STUSPS: "VT",
  },
  {
    NAME: "Connecticut",
    STATEFP: "09",
    STUSPS: "CT",
  },
  {
    NAME: "Maine",
    STATEFP: "23",
    STUSPS: "ME",
  },
  {
    NAME: "Massachusetts",
    STATEFP: "25",
    STUSPS: "MA",
  },
  {
    NAME: "New Jersey",
    STATEFP: "34",
    STUSPS: "NJ",
  },
  {
    NAME: "Pennsylvania",
    STATEFP: "42",
    STUSPS: "PA",
  },
  {
    NAME: "New York",
    STATEFP: "36",
    STUSPS: "NY",
  },
  {
    NAME: "Illinois",
    STATEFP: "17",
    STUSPS: "IL",
  },
  {
    NAME: "Wisconsin",
    STATEFP: "55",
    STUSPS: "WI",
  },
  {
    NAME: "Ohio",
    STATEFP: "39",
    STUSPS: "OH",
  },
  {
    NAME: "Michigan",
    STATEFP: "26",
    STUSPS: "MI",
  },
  {
    NAME: "Indiana",
    STATEFP: "18",
    STUSPS: "IN",
  },
  {
    NAME: "Minnesota",
    STATEFP: "27",
    STUSPS: "MN",
  },
  {
    NAME: "Nebraska",
    STATEFP: "31",
    STUSPS: "NE",
  },
  {
    NAME: "North Dakota",
    STATEFP: "38",
    STUSPS: "ND",
  },
  {
    NAME: "Missouri",
    STATEFP: "29",
    STUSPS: "MO",
  },
  {
    NAME: "Kansas",
    STATEFP: "20",
    STUSPS: "KS",
  },
  {
    NAME: "South Dakota",
    STATEFP: "46",
    STUSPS: "SD",
  },
  {
    NAME: "Iowa",
    STATEFP: "19",
    STUSPS: "IA",
  },
  {
    NAME: "West Virginia",
    STATEFP: "54",
    STUSPS: "WV",
  },
  {
    NAME: "Florida",
    STATEFP: "12",
    STUSPS: "FL",
  },
  {
    NAME: "Maryland",
    STATEFP: "24",
    STUSPS: "MD",
  },
  {
    NAME: "North Carolina",
    STATEFP: "37",
    STUSPS: "NC",
  },
  {
    NAME: "Delaware",
    STATEFP: "10",
    STUSPS: "DE",
  },
  {
    NAME: "Georgia",
    STATEFP: "13",
    STUSPS: "GA",
  },
  {
    NAME: "South Carolina",
    STATEFP: "45",
    STUSPS: "SC",
  },
  {
    NAME: "Virginia",
    STATEFP: "51",
    STUSPS: "VA",
  },
  {
    NAME: "District of Columbia",
    STATEFP: "11",
    STUSPS: "DC",
  },
  {
    NAME: "Alabama",
    STATEFP: "01",
    STUSPS: "AL",
  },
  {
    NAME: "Tennessee",
    STATEFP: "47",
    STUSPS: "TN",
  },
  {
    NAME: "Kentucky",
    STATEFP: "21",
    STUSPS: "KY",
  },
  {
    NAME: "Mississippi",
    STATEFP: "28",
    STUSPS: "MS",
  },
  {
    NAME: "Louisiana",
    STATEFP: "22",
    STUSPS: "LA",
  },
  {
    NAME: "Texas",
    STATEFP: "48",
    STUSPS: "TX",
  },
  {
    NAME: "Oklahoma",
    STATEFP: "40",
    STUSPS: "OK",
  },
  {
    NAME: "Arkansas",
    STATEFP: "05",
    STUSPS: "AR",
  },
  {
    NAME: "Idaho",
    STATEFP: "16",
    STUSPS: "ID",
  },
  {
    NAME: "New Mexico",
    STATEFP: "35",
    STUSPS: "NM",
  },
  {
    NAME: "Utah",
    STATEFP: "49",
    STUSPS: "UT",
  },
  {
    NAME: "Colorado",
    STATEFP: "08",
    STUSPS: "CO",
  },
  {
    NAME: "Wyoming",
    STATEFP: "56",
    STUSPS: "WY",
  },
  {
    NAME: "Nevada",
    STATEFP: "32",
    STUSPS: "NV",
  },
  {
    NAME: "Montana",
    STATEFP: "30",
    STUSPS: "MT",
  },
  {
    NAME: "Arizona",
    STATEFP: "04",
    STUSPS: "AZ",
  },
  {
    NAME: "California",
    STATEFP: "06",
    STUSPS: "CA",
  },
  {
    NAME: "Oregon",
    STATEFP: "41",
    STUSPS: "OR",
  },
  {
    NAME: "Washington",
    STATEFP: "53",
    STUSPS: "WA",
  },
  {
    NAME: "Hawaii",
    STATEFP: "15",
    STUSPS: "HI",
  },
  {
    NAME: "Alaska",
    STATEFP: "02",
    STUSPS: "AK",
  },
];

const availableStates = allStates
  .filter((s) => region8_fps.indexOf(s.STATEFP) > -1)
  .map((s) => s.NAME)
  .sort();

const allCounties = [
  {
    COUNTYFP: "510",
    NAME: "St. Louis",
    STATEFP: "29",
  },
  {
    COUNTYFP: "510",
    NAME: "Carson City",
    STATEFP: "32",
  },
  {
    COUNTYFP: "580",
    NAME: "Covington",
    STATEFP: "51",
  },
  {
    COUNTYFP: "530",
    NAME: "Buena Vista",
    STATEFP: "51",
  },
  {
    COUNTYFP: "678",
    NAME: "Lexington",
    STATEFP: "51",
  },
  {
    COUNTYFP: "640",
    NAME: "Galax",
    STATEFP: "51",
  },
  {
    COUNTYFP: "720",
    NAME: "Norton",
    STATEFP: "51",
  },
  {
    COUNTYFP: "750",
    NAME: "Radford",
    STATEFP: "51",
  },
  {
    COUNTYFP: "590",
    NAME: "Danville",
    STATEFP: "51",
  },
  {
    COUNTYFP: "690",
    NAME: "Martinsville",
    STATEFP: "51",
  },
  {
    COUNTYFP: "775",
    NAME: "Salem",
    STATEFP: "51",
  },
  {
    COUNTYFP: "770",
    NAME: "Roanoke",
    STATEFP: "51",
  },
  {
    COUNTYFP: "520",
    NAME: "Bristol",
    STATEFP: "51",
  },
  {
    COUNTYFP: "053",
    NAME: "Escambia",
    STATEFP: "01",
  },
  {
    COUNTYFP: "123",
    NAME: "Tallapoosa",
    STATEFP: "01",
  },
  {
    COUNTYFP: "009",
    NAME: "Blount",
    STATEFP: "01",
  },
  {
    COUNTYFP: "115",
    NAME: "St. Clair",
    STATEFP: "01",
  },
  {
    COUNTYFP: "117",
    NAME: "Shelby",
    STATEFP: "01",
  },
  {
    COUNTYFP: "073",
    NAME: "Jefferson",
    STATEFP: "01",
  },
  {
    COUNTYFP: "127",
    NAME: "Walker",
    STATEFP: "01",
  },
  {
    COUNTYFP: "007",
    NAME: "Bibb",
    STATEFP: "01",
  },
  {
    COUNTYFP: "021",
    NAME: "Chilton",
    STATEFP: "01",
  },
  {
    COUNTYFP: "043",
    NAME: "Cullman",
    STATEFP: "01",
  },
  {
    COUNTYFP: "037",
    NAME: "Coosa",
    STATEFP: "01",
  },
  {
    COUNTYFP: "121",
    NAME: "Talladega",
    STATEFP: "01",
  },
  {
    COUNTYFP: "071",
    NAME: "Jackson",
    STATEFP: "01",
  },
  {
    COUNTYFP: "027",
    NAME: "Clay",
    STATEFP: "01",
  },
  {
    COUNTYFP: "091",
    NAME: "Marengo",
    STATEFP: "01",
  },
  {
    COUNTYFP: "019",
    NAME: "Cherokee",
    STATEFP: "01",
  },
  {
    COUNTYFP: "105",
    NAME: "Perry",
    STATEFP: "01",
  },
  {
    COUNTYFP: "063",
    NAME: "Greene",
    STATEFP: "01",
  },
  {
    COUNTYFP: "013",
    NAME: "Butler",
    STATEFP: "01",
  },
  {
    COUNTYFP: "057",
    NAME: "Fayette",
    STATEFP: "01",
  },
  {
    COUNTYFP: "131",
    NAME: "Wilcox",
    STATEFP: "01",
  },
  {
    COUNTYFP: "099",
    NAME: "Monroe",
    STATEFP: "01",
  },
  {
    COUNTYFP: "093",
    NAME: "Marion",
    STATEFP: "01",
  },
  {
    COUNTYFP: "119",
    NAME: "Sumter",
    STATEFP: "01",
  },
  {
    COUNTYFP: "133",
    NAME: "Winston",
    STATEFP: "01",
  },
  {
    COUNTYFP: "011",
    NAME: "Bullock",
    STATEFP: "01",
  },
  {
    COUNTYFP: "087",
    NAME: "Macon",
    STATEFP: "01",
  },
  {
    COUNTYFP: "023",
    NAME: "Choctaw",
    STATEFP: "01",
  },
  {
    COUNTYFP: "029",
    NAME: "Cleburne",
    STATEFP: "01",
  },
  {
    COUNTYFP: "111",
    NAME: "Randolph",
    STATEFP: "01",
  },
  {
    COUNTYFP: "039",
    NAME: "Covington",
    STATEFP: "01",
  },
  {
    COUNTYFP: "025",
    NAME: "Clarke",
    STATEFP: "01",
  },
  {
    COUNTYFP: "129",
    NAME: "Washington",
    STATEFP: "01",
  },
  {
    COUNTYFP: "041",
    NAME: "Crenshaw",
    STATEFP: "01",
  },
  {
    COUNTYFP: "075",
    NAME: "Lamar",
    STATEFP: "01",
  },
  {
    COUNTYFP: "059",
    NAME: "Franklin",
    STATEFP: "01",
  },
  {
    COUNTYFP: "035",
    NAME: "Conecuh",
    STATEFP: "01",
  },
  {
    COUNTYFP: "015",
    NAME: "Calhoun",
    STATEFP: "01",
  },
  {
    COUNTYFP: "005",
    NAME: "Barbour",
    STATEFP: "01",
  },
  {
    COUNTYFP: "033",
    NAME: "Colbert",
    STATEFP: "01",
  },
  {
    COUNTYFP: "077",
    NAME: "Lauderdale",
    STATEFP: "01",
  },
  {
    COUNTYFP: "055",
    NAME: "Etowah",
    STATEFP: "01",
  },
  {
    COUNTYFP: "085",
    NAME: "Lowndes",
    STATEFP: "01",
  },
  {
    COUNTYFP: "001",
    NAME: "Autauga",
    STATEFP: "01",
  },
  {
    COUNTYFP: "051",
    NAME: "Elmore",
    STATEFP: "01",
  },
  {
    COUNTYFP: "101",
    NAME: "Montgomery",
    STATEFP: "01",
  },
  {
    COUNTYFP: "047",
    NAME: "Dallas",
    STATEFP: "01",
  },
  {
    COUNTYFP: "109",
    NAME: "Pike",
    STATEFP: "01",
  },
  {
    COUNTYFP: "065",
    NAME: "Hale",
    STATEFP: "01",
  },
  {
    COUNTYFP: "125",
    NAME: "Tuscaloosa",
    STATEFP: "01",
  },
  {
    COUNTYFP: "107",
    NAME: "Pickens",
    STATEFP: "01",
  },
  {
    COUNTYFP: "003",
    NAME: "Baldwin",
    STATEFP: "01",
  },
  {
    COUNTYFP: "097",
    NAME: "Mobile",
    STATEFP: "01",
  },
  {
    COUNTYFP: "081",
    NAME: "Lee",
    STATEFP: "01",
  },
  {
    COUNTYFP: "113",
    NAME: "Russell",
    STATEFP: "01",
  },
  {
    COUNTYFP: "017",
    NAME: "Chambers",
    STATEFP: "01",
  },
  {
    COUNTYFP: "061",
    NAME: "Geneva",
    STATEFP: "01",
  },
  {
    COUNTYFP: "067",
    NAME: "Henry",
    STATEFP: "01",
  },
  {
    COUNTYFP: "069",
    NAME: "Houston",
    STATEFP: "01",
  },
  {
    COUNTYFP: "031",
    NAME: "Coffee",
    STATEFP: "01",
  },
  {
    COUNTYFP: "045",
    NAME: "Dale",
    STATEFP: "01",
  },
  {
    COUNTYFP: "095",
    NAME: "Marshall",
    STATEFP: "01",
  },
  {
    COUNTYFP: "079",
    NAME: "Lawrence",
    STATEFP: "01",
  },
  {
    COUNTYFP: "103",
    NAME: "Morgan",
    STATEFP: "01",
  },
  {
    COUNTYFP: "049",
    NAME: "DeKalb",
    STATEFP: "01",
  },
  {
    COUNTYFP: "083",
    NAME: "Limestone",
    STATEFP: "01",
  },
  {
    COUNTYFP: "089",
    NAME: "Madison",
    STATEFP: "01",
  },
  {
    COUNTYFP: "188",
    NAME: "Northwest Arctic",
    STATEFP: "02",
  },
  {
    COUNTYFP: "195",
    NAME: "Petersburg",
    STATEFP: "02",
  },
  {
    COUNTYFP: "122",
    NAME: "Kenai Peninsula",
    STATEFP: "02",
  },
  {
    COUNTYFP: "068",
    NAME: "Denali",
    STATEFP: "02",
  },
  {
    COUNTYFP: "100",
    NAME: "Haines",
    STATEFP: "02",
  },
  {
    COUNTYFP: "164",
    NAME: "Lake and Peninsula",
    STATEFP: "02",
  },
  {
    COUNTYFP: "060",
    NAME: "Bristol Bay",
    STATEFP: "02",
  },
  {
    COUNTYFP: "230",
    NAME: "Skagway",
    STATEFP: "02",
  },
  {
    COUNTYFP: "013",
    NAME: "Aleutians East",
    STATEFP: "02",
  },
  {
    COUNTYFP: "185",
    NAME: "North Slope",
    STATEFP: "02",
  },
  {
    COUNTYFP: "150",
    NAME: "Kodiak Island",
    STATEFP: "02",
  },
  {
    COUNTYFP: "282",
    NAME: "Yakutat",
    STATEFP: "02",
  },
  {
    COUNTYFP: "170",
    NAME: "Matanuska-Susitna",
    STATEFP: "02",
  },
  {
    COUNTYFP: "090",
    NAME: "Fairbanks North Star",
    STATEFP: "02",
  },
  {
    COUNTYFP: "130",
    NAME: "Ketchikan Gateway",
    STATEFP: "02",
  },
  {
    COUNTYFP: "023",
    NAME: "Santa Cruz",
    STATEFP: "04",
  },
  {
    COUNTYFP: "019",
    NAME: "Pima",
    STATEFP: "04",
  },
  {
    COUNTYFP: "011",
    NAME: "Greenlee",
    STATEFP: "04",
  },
  {
    COUNTYFP: "012",
    NAME: "La Paz",
    STATEFP: "04",
  },
  {
    COUNTYFP: "001",
    NAME: "Apache",
    STATEFP: "04",
  },
  {
    COUNTYFP: "005",
    NAME: "Coconino",
    STATEFP: "04",
  },
  {
    COUNTYFP: "007",
    NAME: "Gila",
    STATEFP: "04",
  },
  {
    COUNTYFP: "021",
    NAME: "Pinal",
    STATEFP: "04",
  },
  {
    COUNTYFP: "013",
    NAME: "Maricopa",
    STATEFP: "04",
  },
  {
    COUNTYFP: "025",
    NAME: "Yavapai",
    STATEFP: "04",
  },
  {
    COUNTYFP: "009",
    NAME: "Graham",
    STATEFP: "04",
  },
  {
    COUNTYFP: "017",
    NAME: "Navajo",
    STATEFP: "04",
  },
  {
    COUNTYFP: "003",
    NAME: "Cochise",
    STATEFP: "04",
  },
  {
    COUNTYFP: "027",
    NAME: "Yuma",
    STATEFP: "04",
  },
  {
    COUNTYFP: "015",
    NAME: "Mohave",
    STATEFP: "04",
  },
  {
    COUNTYFP: "137",
    NAME: "Stone",
    STATEFP: "05",
  },
  {
    COUNTYFP: "113",
    NAME: "Polk",
    STATEFP: "05",
  },
  {
    COUNTYFP: "049",
    NAME: "Fulton",
    STATEFP: "05",
  },
  {
    COUNTYFP: "083",
    NAME: "Logan",
    STATEFP: "05",
  },
  {
    COUNTYFP: "001",
    NAME: "Arkansas",
    STATEFP: "05",
  },
  {
    COUNTYFP: "015",
    NAME: "Carroll",
    STATEFP: "05",
  },
  {
    COUNTYFP: "141",
    NAME: "Van Buren",
    STATEFP: "05",
  },
  {
    COUNTYFP: "071",
    NAME: "Johnson",
    STATEFP: "05",
  },
  {
    COUNTYFP: "129",
    NAME: "Searcy",
    STATEFP: "05",
  },
  {
    COUNTYFP: "133",
    NAME: "Sevier",
    STATEFP: "05",
  },
  {
    COUNTYFP: "121",
    NAME: "Randolph",
    STATEFP: "05",
  },
  {
    COUNTYFP: "065",
    NAME: "Izard",
    STATEFP: "05",
  },
  {
    COUNTYFP: "127",
    NAME: "Scott",
    STATEFP: "05",
  },
  {
    COUNTYFP: "023",
    NAME: "Cleburne",
    STATEFP: "05",
  },
  {
    COUNTYFP: "095",
    NAME: "Monroe",
    STATEFP: "05",
  },
  {
    COUNTYFP: "037",
    NAME: "Cross",
    STATEFP: "05",
  },
  {
    COUNTYFP: "047",
    NAME: "Franklin",
    STATEFP: "05",
  },
  {
    COUNTYFP: "067",
    NAME: "Jackson",
    STATEFP: "05",
  },
  {
    COUNTYFP: "021",
    NAME: "Clay",
    STATEFP: "05",
  },
  {
    COUNTYFP: "003",
    NAME: "Ashley",
    STATEFP: "05",
  },
  {
    COUNTYFP: "041",
    NAME: "Desha",
    STATEFP: "05",
  },
  {
    COUNTYFP: "097",
    NAME: "Montgomery",
    STATEFP: "05",
  },
  {
    COUNTYFP: "135",
    NAME: "Sharp",
    STATEFP: "05",
  },
  {
    COUNTYFP: "017",
    NAME: "Chicot",
    STATEFP: "05",
  },
  {
    COUNTYFP: "089",
    NAME: "Marion",
    STATEFP: "05",
  },
  {
    COUNTYFP: "117",
    NAME: "Prairie",
    STATEFP: "05",
  },
  {
    COUNTYFP: "011",
    NAME: "Bradley",
    STATEFP: "05",
  },
  {
    COUNTYFP: "043",
    NAME: "Drew",
    STATEFP: "05",
  },
  {
    COUNTYFP: "109",
    NAME: "Pike",
    STATEFP: "05",
  },
  {
    COUNTYFP: "075",
    NAME: "Lawrence",
    STATEFP: "05",
  },
  {
    COUNTYFP: "147",
    NAME: "Woodruff",
    STATEFP: "05",
  },
  {
    COUNTYFP: "077",
    NAME: "Lee",
    STATEFP: "05",
  },
  {
    COUNTYFP: "029",
    NAME: "Conway",
    STATEFP: "05",
  },
  {
    COUNTYFP: "061",
    NAME: "Howard",
    STATEFP: "05",
  },
  {
    COUNTYFP: "039",
    NAME: "Dallas",
    STATEFP: "05",
  },
  {
    COUNTYFP: "073",
    NAME: "Lafayette",
    STATEFP: "05",
  },
  {
    COUNTYFP: "019",
    NAME: "Clark",
    STATEFP: "05",
  },
  {
    COUNTYFP: "063",
    NAME: "Independence",
    STATEFP: "05",
  },
  {
    COUNTYFP: "093",
    NAME: "Mississippi",
    STATEFP: "05",
  },
  {
    COUNTYFP: "103",
    NAME: "Ouachita",
    STATEFP: "05",
  },
  {
    COUNTYFP: "013",
    NAME: "Calhoun",
    STATEFP: "05",
  },
  {
    COUNTYFP: "139",
    NAME: "Union",
    STATEFP: "05",
  },
  {
    COUNTYFP: "143",
    NAME: "Washington",
    STATEFP: "05",
  },
  {
    COUNTYFP: "007",
    NAME: "Benton",
    STATEFP: "05",
  },
  {
    COUNTYFP: "087",
    NAME: "Madison",
    STATEFP: "05",
  },
  {
    COUNTYFP: "033",
    NAME: "Crawford",
    STATEFP: "05",
  },
  {
    COUNTYFP: "131",
    NAME: "Sebastian",
    STATEFP: "05",
  },
  {
    COUNTYFP: "101",
    NAME: "Newton",
    STATEFP: "05",
  },
  {
    COUNTYFP: "009",
    NAME: "Boone",
    STATEFP: "05",
  },
  {
    COUNTYFP: "107",
    NAME: "Phillips",
    STATEFP: "05",
  },
  {
    COUNTYFP: "057",
    NAME: "Hempstead",
    STATEFP: "05",
  },
  {
    COUNTYFP: "099",
    NAME: "Nevada",
    STATEFP: "05",
  },
  {
    COUNTYFP: "027",
    NAME: "Columbia",
    STATEFP: "05",
  },
  {
    COUNTYFP: "005",
    NAME: "Baxter",
    STATEFP: "05",
  },
  {
    COUNTYFP: "149",
    NAME: "Yell",
    STATEFP: "05",
  },
  {
    COUNTYFP: "115",
    NAME: "Pope",
    STATEFP: "05",
  },
  {
    COUNTYFP: "091",
    NAME: "Miller",
    STATEFP: "05",
  },
  {
    COUNTYFP: "081",
    NAME: "Little River",
    STATEFP: "05",
  },
  {
    COUNTYFP: "031",
    NAME: "Craighead",
    STATEFP: "05",
  },
  {
    COUNTYFP: "111",
    NAME: "Poinsett",
    STATEFP: "05",
  },
  {
    COUNTYFP: "055",
    NAME: "Greene",
    STATEFP: "05",
  },
  {
    COUNTYFP: "085",
    NAME: "Lonoke",
    STATEFP: "05",
  },
  {
    COUNTYFP: "105",
    NAME: "Perry",
    STATEFP: "05",
  },
  {
    COUNTYFP: "045",
    NAME: "Faulkner",
    STATEFP: "05",
  },
  {
    COUNTYFP: "119",
    NAME: "Pulaski",
    STATEFP: "05",
  },
  {
    COUNTYFP: "053",
    NAME: "Grant",
    STATEFP: "05",
  },
  {
    COUNTYFP: "125",
    NAME: "Saline",
    STATEFP: "05",
  },
  {
    COUNTYFP: "069",
    NAME: "Jefferson",
    STATEFP: "05",
  },
  {
    COUNTYFP: "079",
    NAME: "Lincoln",
    STATEFP: "05",
  },
  {
    COUNTYFP: "025",
    NAME: "Cleveland",
    STATEFP: "05",
  },
  {
    COUNTYFP: "145",
    NAME: "White",
    STATEFP: "05",
  },
  {
    COUNTYFP: "123",
    NAME: "St. Francis",
    STATEFP: "05",
  },
  {
    COUNTYFP: "035",
    NAME: "Crittenden",
    STATEFP: "05",
  },
  {
    COUNTYFP: "051",
    NAME: "Garland",
    STATEFP: "05",
  },
  {
    COUNTYFP: "059",
    NAME: "Hot Spring",
    STATEFP: "05",
  },
  {
    COUNTYFP: "055",
    NAME: "Napa",
    STATEFP: "06",
  },
  {
    COUNTYFP: "041",
    NAME: "Marin",
    STATEFP: "06",
  },
  {
    COUNTYFP: "013",
    NAME: "Contra Costa",
    STATEFP: "06",
  },
  {
    COUNTYFP: "081",
    NAME: "San Mateo",
    STATEFP: "06",
  },
  {
    COUNTYFP: "001",
    NAME: "Alameda",
    STATEFP: "06",
  },
  {
    COUNTYFP: "069",
    NAME: "San Benito",
    STATEFP: "06",
  },
  {
    COUNTYFP: "085",
    NAME: "Santa Clara",
    STATEFP: "06",
  },
  {
    COUNTYFP: "087",
    NAME: "Santa Cruz",
    STATEFP: "06",
  },
  {
    COUNTYFP: "097",
    NAME: "Sonoma",
    STATEFP: "06",
  },
  {
    COUNTYFP: "077",
    NAME: "San Joaquin",
    STATEFP: "06",
  },
  {
    COUNTYFP: "095",
    NAME: "Solano",
    STATEFP: "06",
  },
  {
    COUNTYFP: "031",
    NAME: "Kings",
    STATEFP: "06",
  },
  {
    COUNTYFP: "107",
    NAME: "Tulare",
    STATEFP: "06",
  },
  {
    COUNTYFP: "103",
    NAME: "Tehama",
    STATEFP: "06",
  },
  {
    COUNTYFP: "089",
    NAME: "Shasta",
    STATEFP: "06",
  },
  {
    COUNTYFP: "067",
    NAME: "Sacramento",
    STATEFP: "06",
  },
  {
    COUNTYFP: "061",
    NAME: "Placer",
    STATEFP: "06",
  },
  {
    COUNTYFP: "017",
    NAME: "El Dorado",
    STATEFP: "06",
  },
  {
    COUNTYFP: "113",
    NAME: "Yolo",
    STATEFP: "06",
  },
  {
    COUNTYFP: "057",
    NAME: "Nevada",
    STATEFP: "06",
  },
  {
    COUNTYFP: "115",
    NAME: "Yuba",
    STATEFP: "06",
  },
  {
    COUNTYFP: "101",
    NAME: "Sutter",
    STATEFP: "06",
  },
  {
    COUNTYFP: "091",
    NAME: "Sierra",
    STATEFP: "06",
  },
  {
    COUNTYFP: "009",
    NAME: "Calaveras",
    STATEFP: "06",
  },
  {
    COUNTYFP: "043",
    NAME: "Mariposa",
    STATEFP: "06",
  },
  {
    COUNTYFP: "105",
    NAME: "Trinity",
    STATEFP: "06",
  },
  {
    COUNTYFP: "027",
    NAME: "Inyo",
    STATEFP: "06",
  },
  {
    COUNTYFP: "051",
    NAME: "Mono",
    STATEFP: "06",
  },
  {
    COUNTYFP: "003",
    NAME: "Alpine",
    STATEFP: "06",
  },
  {
    COUNTYFP: "011",
    NAME: "Colusa",
    STATEFP: "06",
  },
  {
    COUNTYFP: "049",
    NAME: "Modoc",
    STATEFP: "06",
  },
  {
    COUNTYFP: "063",
    NAME: "Plumas",
    STATEFP: "06",
  },
  {
    COUNTYFP: "093",
    NAME: "Siskiyou",
    STATEFP: "06",
  },
  {
    COUNTYFP: "021",
    NAME: "Glenn",
    STATEFP: "06",
  },
  {
    COUNTYFP: "005",
    NAME: "Amador",
    STATEFP: "06",
  },
  {
    COUNTYFP: "029",
    NAME: "Kern",
    STATEFP: "06",
  },
  {
    COUNTYFP: "007",
    NAME: "Butte",
    STATEFP: "06",
  },
  {
    COUNTYFP: "033",
    NAME: "Lake",
    STATEFP: "06",
  },
  {
    COUNTYFP: "015",
    NAME: "Del Norte",
    STATEFP: "06",
  },
  {
    COUNTYFP: "025",
    NAME: "Imperial",
    STATEFP: "06",
  },
  {
    COUNTYFP: "023",
    NAME: "Humboldt",
    STATEFP: "06",
  },
  {
    COUNTYFP: "053",
    NAME: "Monterey",
    STATEFP: "06",
  },
  {
    COUNTYFP: "073",
    NAME: "San Diego",
    STATEFP: "06",
  },
  {
    COUNTYFP: "079",
    NAME: "San Luis Obispo",
    STATEFP: "06",
  },
  {
    COUNTYFP: "083",
    NAME: "Santa Barbara",
    STATEFP: "06",
  },
  {
    COUNTYFP: "109",
    NAME: "Tuolumne",
    STATEFP: "06",
  },
  {
    COUNTYFP: "035",
    NAME: "Lassen",
    STATEFP: "06",
  },
  {
    COUNTYFP: "045",
    NAME: "Mendocino",
    STATEFP: "06",
  },
  {
    COUNTYFP: "037",
    NAME: "Los Angeles",
    STATEFP: "06",
  },
  {
    COUNTYFP: "059",
    NAME: "Orange",
    STATEFP: "06",
  },
  {
    COUNTYFP: "111",
    NAME: "Ventura",
    STATEFP: "06",
  },
  {
    COUNTYFP: "071",
    NAME: "San Bernardino",
    STATEFP: "06",
  },
  {
    COUNTYFP: "065",
    NAME: "Riverside",
    STATEFP: "06",
  },
  {
    COUNTYFP: "047",
    NAME: "Merced",
    STATEFP: "06",
  },
  {
    COUNTYFP: "099",
    NAME: "Stanislaus",
    STATEFP: "06",
  },
  {
    COUNTYFP: "019",
    NAME: "Fresno",
    STATEFP: "06",
  },
  {
    COUNTYFP: "039",
    NAME: "Madera",
    STATEFP: "06",
  },
  {
    COUNTYFP: "081",
    NAME: "Moffat",
    STATEFP: "08",
  },
  {
    COUNTYFP: "107",
    NAME: "Routt",
    STATEFP: "08",
  },
  {
    COUNTYFP: "043",
    NAME: "Fremont",
    STATEFP: "08",
  },
  {
    COUNTYFP: "101",
    NAME: "Pueblo",
    STATEFP: "08",
  },
  {
    COUNTYFP: "109",
    NAME: "Saguache",
    STATEFP: "08",
  },
  {
    COUNTYFP: "115",
    NAME: "Sedgwick",
    STATEFP: "08",
  },
  {
    COUNTYFP: "017",
    NAME: "Cheyenne",
    STATEFP: "08",
  },
  {
    COUNTYFP: "027",
    NAME: "Custer",
    STATEFP: "08",
  },
  {
    COUNTYFP: "111",
    NAME: "San Juan",
    STATEFP: "08",
  },
  {
    COUNTYFP: "003",
    NAME: "Alamosa",
    STATEFP: "08",
  },
  {
    COUNTYFP: "099",
    NAME: "Prowers",
    STATEFP: "08",
  },
  {
    COUNTYFP: "113",
    NAME: "San Miguel",
    STATEFP: "08",
  },
  {
    COUNTYFP: "023",
    NAME: "Costilla",
    STATEFP: "08",
  },
  {
    COUNTYFP: "015",
    NAME: "Chaffee",
    STATEFP: "08",
  },
  {
    COUNTYFP: "025",
    NAME: "Crowley",
    STATEFP: "08",
  },
  {
    COUNTYFP: "055",
    NAME: "Huerfano",
    STATEFP: "08",
  },
  {
    COUNTYFP: "029",
    NAME: "Delta",
    STATEFP: "08",
  },
  {
    COUNTYFP: "103",
    NAME: "Rio Blanco",
    STATEFP: "08",
  },
  {
    COUNTYFP: "073",
    NAME: "Lincoln",
    STATEFP: "08",
  },
  {
    COUNTYFP: "083",
    NAME: "Montezuma",
    STATEFP: "08",
  },
  {
    COUNTYFP: "079",
    NAME: "Mineral",
    STATEFP: "08",
  },
  {
    COUNTYFP: "089",
    NAME: "Otero",
    STATEFP: "08",
  },
  {
    COUNTYFP: "095",
    NAME: "Phillips",
    STATEFP: "08",
  },
  {
    COUNTYFP: "091",
    NAME: "Ouray",
    STATEFP: "08",
  },
  {
    COUNTYFP: "011",
    NAME: "Bent",
    STATEFP: "08",
  },
  {
    COUNTYFP: "007",
    NAME: "Archuleta",
    STATEFP: "08",
  },
  {
    COUNTYFP: "053",
    NAME: "Hinsdale",
    STATEFP: "08",
  },
  {
    COUNTYFP: "065",
    NAME: "Lake",
    STATEFP: "08",
  },
  {
    COUNTYFP: "021",
    NAME: "Conejos",
    STATEFP: "08",
  },
  {
    COUNTYFP: "061",
    NAME: "Kiowa",
    STATEFP: "08",
  },
  {
    COUNTYFP: "051",
    NAME: "Gunnison",
    STATEFP: "08",
  },
  {
    COUNTYFP: "009",
    NAME: "Baca",
    STATEFP: "08",
  },
  {
    COUNTYFP: "033",
    NAME: "Dolores",
    STATEFP: "08",
  },
  {
    COUNTYFP: "071",
    NAME: "Las Animas",
    STATEFP: "08",
  },
  {
    COUNTYFP: "049",
    NAME: "Grand",
    STATEFP: "08",
  },
  {
    COUNTYFP: "105",
    NAME: "Rio Grande",
    STATEFP: "08",
  },
  {
    COUNTYFP: "125",
    NAME: "Yuma",
    STATEFP: "08",
  },
  {
    COUNTYFP: "057",
    NAME: "Jackson",
    STATEFP: "08",
  },
  {
    COUNTYFP: "063",
    NAME: "Kit Carson",
    STATEFP: "08",
  },
  {
    COUNTYFP: "121",
    NAME: "Washington",
    STATEFP: "08",
  },
  {
    COUNTYFP: "117",
    NAME: "Summit",
    STATEFP: "08",
  },
  {
    COUNTYFP: "041",
    NAME: "El Paso",
    STATEFP: "08",
  },
  {
    COUNTYFP: "119",
    NAME: "Teller",
    STATEFP: "08",
  },
  {
    COUNTYFP: "067",
    NAME: "La Plata",
    STATEFP: "08",
  },
  {
    COUNTYFP: "069",
    NAME: "Larimer",
    STATEFP: "08",
  },
  {
    COUNTYFP: "087",
    NAME: "Morgan",
    STATEFP: "08",
  },
  {
    COUNTYFP: "077",
    NAME: "Mesa",
    STATEFP: "08",
  },
  {
    COUNTYFP: "085",
    NAME: "Montrose",
    STATEFP: "08",
  },
  {
    COUNTYFP: "075",
    NAME: "Logan",
    STATEFP: "08",
  },
  {
    COUNTYFP: "013",
    NAME: "Boulder",
    STATEFP: "08",
  },
  {
    COUNTYFP: "093",
    NAME: "Park",
    STATEFP: "08",
  },
  {
    COUNTYFP: "059",
    NAME: "Jefferson",
    STATEFP: "08",
  },
  {
    COUNTYFP: "001",
    NAME: "Adams",
    STATEFP: "08",
  },
  {
    COUNTYFP: "035",
    NAME: "Douglas",
    STATEFP: "08",
  },
  {
    COUNTYFP: "039",
    NAME: "Elbert",
    STATEFP: "08",
  },
  {
    COUNTYFP: "005",
    NAME: "Arapahoe",
    STATEFP: "08",
  },
  {
    COUNTYFP: "047",
    NAME: "Gilpin",
    STATEFP: "08",
  },
  {
    COUNTYFP: "019",
    NAME: "Clear Creek",
    STATEFP: "08",
  },
  {
    COUNTYFP: "123",
    NAME: "Weld",
    STATEFP: "08",
  },
  {
    COUNTYFP: "037",
    NAME: "Eagle",
    STATEFP: "08",
  },
  {
    COUNTYFP: "097",
    NAME: "Pitkin",
    STATEFP: "08",
  },
  {
    COUNTYFP: "045",
    NAME: "Garfield",
    STATEFP: "08",
  },
  {
    COUNTYFP: "129",
    NAME: "Wakulla",
    STATEFP: "12",
  },
  {
    COUNTYFP: "065",
    NAME: "Jefferson",
    STATEFP: "12",
  },
  {
    COUNTYFP: "039",
    NAME: "Gadsden",
    STATEFP: "12",
  },
  {
    COUNTYFP: "073",
    NAME: "Leon",
    STATEFP: "12",
  },
  {
    COUNTYFP: "027",
    NAME: "DeSoto",
    STATEFP: "12",
  },
  {
    COUNTYFP: "081",
    NAME: "Manatee",
    STATEFP: "12",
  },
  {
    COUNTYFP: "115",
    NAME: "Sarasota",
    STATEFP: "12",
  },
  {
    COUNTYFP: "015",
    NAME: "Charlotte",
    STATEFP: "12",
  },
  {
    COUNTYFP: "127",
    NAME: "Volusia",
    STATEFP: "12",
  },
  {
    COUNTYFP: "035",
    NAME: "Flagler",
    STATEFP: "12",
  },
  {
    COUNTYFP: "095",
    NAME: "Orange",
    STATEFP: "12",
  },
  {
    COUNTYFP: "069",
    NAME: "Lake",
    STATEFP: "12",
  },
  {
    COUNTYFP: "117",
    NAME: "Seminole",
    STATEFP: "12",
  },
  {
    COUNTYFP: "097",
    NAME: "Osceola",
    STATEFP: "12",
  },
  {
    COUNTYFP: "119",
    NAME: "Sumter",
    STATEFP: "12",
  },
  {
    COUNTYFP: "033",
    NAME: "Escambia",
    STATEFP: "12",
  },
  {
    COUNTYFP: "113",
    NAME: "Santa Rosa",
    STATEFP: "12",
  },
  {
    COUNTYFP: "083",
    NAME: "Marion",
    STATEFP: "12",
  },
  {
    COUNTYFP: "009",
    NAME: "Brevard",
    STATEFP: "12",
  },
  {
    COUNTYFP: "005",
    NAME: "Bay",
    STATEFP: "12",
  },
  {
    COUNTYFP: "045",
    NAME: "Gulf",
    STATEFP: "12",
  },
  {
    COUNTYFP: "055",
    NAME: "Highlands",
    STATEFP: "12",
  },
  {
    COUNTYFP: "053",
    NAME: "Hernando",
    STATEFP: "12",
  },
  {
    COUNTYFP: "103",
    NAME: "Pinellas",
    STATEFP: "12",
  },
  {
    COUNTYFP: "101",
    NAME: "Pasco",
    STATEFP: "12",
  },
  {
    COUNTYFP: "057",
    NAME: "Hillsborough",
    STATEFP: "12",
  },
  {
    COUNTYFP: "049",
    NAME: "Hardee",
    STATEFP: "12",
  },
  {
    COUNTYFP: "071",
    NAME: "Lee",
    STATEFP: "12",
  },
  {
    COUNTYFP: "021",
    NAME: "Collier",
    STATEFP: "12",
  },
  {
    COUNTYFP: "043",
    NAME: "Glades",
    STATEFP: "12",
  },
  {
    COUNTYFP: "013",
    NAME: "Calhoun",
    STATEFP: "12",
  },
  {
    COUNTYFP: "037",
    NAME: "Franklin",
    STATEFP: "12",
  },
  {
    COUNTYFP: "007",
    NAME: "Bradford",
    STATEFP: "12",
  },
  {
    COUNTYFP: "029",
    NAME: "Dixie",
    STATEFP: "12",
  },
  {
    COUNTYFP: "067",
    NAME: "Lafayette",
    STATEFP: "12",
  },
  {
    COUNTYFP: "047",
    NAME: "Hamilton",
    STATEFP: "12",
  },
  {
    COUNTYFP: "075",
    NAME: "Levy",
    STATEFP: "12",
  },
  {
    COUNTYFP: "059",
    NAME: "Holmes",
    STATEFP: "12",
  },
  {
    COUNTYFP: "121",
    NAME: "Suwannee",
    STATEFP: "12",
  },
  {
    COUNTYFP: "123",
    NAME: "Taylor",
    STATEFP: "12",
  },
  {
    COUNTYFP: "125",
    NAME: "Union",
    STATEFP: "12",
  },
  {
    COUNTYFP: "079",
    NAME: "Madison",
    STATEFP: "12",
  },
  {
    COUNTYFP: "063",
    NAME: "Jackson",
    STATEFP: "12",
  },
  {
    COUNTYFP: "133",
    NAME: "Washington",
    STATEFP: "12",
  },
  {
    COUNTYFP: "077",
    NAME: "Liberty",
    STATEFP: "12",
  },
  {
    COUNTYFP: "051",
    NAME: "Hendry",
    STATEFP: "12",
  },
  {
    COUNTYFP: "131",
    NAME: "Walton",
    STATEFP: "12",
  },
  {
    COUNTYFP: "091",
    NAME: "Okaloosa",
    STATEFP: "12",
  },
  {
    COUNTYFP: "017",
    NAME: "Citrus",
    STATEFP: "12",
  },
  {
    COUNTYFP: "087",
    NAME: "Monroe",
    STATEFP: "12",
  },
  {
    COUNTYFP: "105",
    NAME: "Polk",
    STATEFP: "12",
  },
  {
    COUNTYFP: "109",
    NAME: "St. Johns",
    STATEFP: "12",
  },
  {
    COUNTYFP: "003",
    NAME: "Baker",
    STATEFP: "12",
  },
  {
    COUNTYFP: "019",
    NAME: "Clay",
    STATEFP: "12",
  },
  {
    COUNTYFP: "089",
    NAME: "Nassau",
    STATEFP: "12",
  },
  {
    COUNTYFP: "107",
    NAME: "Putnam",
    STATEFP: "12",
  },
  {
    COUNTYFP: "011",
    NAME: "Broward",
    STATEFP: "12",
  },
  {
    COUNTYFP: "099",
    NAME: "Palm Beach",
    STATEFP: "12",
  },
  {
    COUNTYFP: "086",
    NAME: "Miami-Dade",
    STATEFP: "12",
  },
  {
    COUNTYFP: "093",
    NAME: "Okeechobee",
    STATEFP: "12",
  },
  {
    COUNTYFP: "085",
    NAME: "Martin",
    STATEFP: "12",
  },
  {
    COUNTYFP: "111",
    NAME: "St. Lucie",
    STATEFP: "12",
  },
  {
    COUNTYFP: "061",
    NAME: "Indian River",
    STATEFP: "12",
  },
  {
    COUNTYFP: "041",
    NAME: "Gilchrist",
    STATEFP: "12",
  },
  {
    COUNTYFP: "001",
    NAME: "Alachua",
    STATEFP: "12",
  },
  {
    COUNTYFP: "023",
    NAME: "Columbia",
    STATEFP: "12",
  },
  {
    COUNTYFP: "183",
    NAME: "Long",
    STATEFP: "13",
  },
  {
    COUNTYFP: "179",
    NAME: "Liberty",
    STATEFP: "13",
  },
  {
    COUNTYFP: "029",
    NAME: "Bryan",
    STATEFP: "13",
  },
  {
    COUNTYFP: "051",
    NAME: "Chatham",
    STATEFP: "13",
  },
  {
    COUNTYFP: "103",
    NAME: "Effingham",
    STATEFP: "13",
  },
  {
    COUNTYFP: "031",
    NAME: "Bulloch",
    STATEFP: "13",
  },
  {
    COUNTYFP: "087",
    NAME: "Decatur",
    STATEFP: "13",
  },
  {
    COUNTYFP: "115",
    NAME: "Floyd",
    STATEFP: "13",
  },
  {
    COUNTYFP: "193",
    NAME: "Macon",
    STATEFP: "13",
  },
  {
    COUNTYFP: "049",
    NAME: "Charlton",
    STATEFP: "13",
  },
  {
    COUNTYFP: "119",
    NAME: "Franklin",
    STATEFP: "13",
  },
  {
    COUNTYFP: "265",
    NAME: "Taliaferro",
    STATEFP: "13",
  },
  {
    COUNTYFP: "075",
    NAME: "Cook",
    STATEFP: "13",
  },
  {
    COUNTYFP: "251",
    NAME: "Screven",
    STATEFP: "13",
  },
  {
    COUNTYFP: "147",
    NAME: "Hart",
    STATEFP: "13",
  },
  {
    COUNTYFP: "291",
    NAME: "Union",
    STATEFP: "13",
  },
  {
    COUNTYFP: "319",
    NAME: "Wilkinson",
    STATEFP: "13",
  },
  {
    COUNTYFP: "019",
    NAME: "Berrien",
    STATEFP: "13",
  },
  {
    COUNTYFP: "061",
    NAME: "Clay",
    STATEFP: "13",
  },
  {
    COUNTYFP: "283",
    NAME: "Treutlen",
    STATEFP: "13",
  },
  {
    COUNTYFP: "037",
    NAME: "Calhoun",
    STATEFP: "13",
  },
  {
    COUNTYFP: "099",
    NAME: "Early",
    STATEFP: "13",
  },
  {
    COUNTYFP: "043",
    NAME: "Candler",
    STATEFP: "13",
  },
  {
    COUNTYFP: "023",
    NAME: "Bleckley",
    STATEFP: "13",
  },
  {
    COUNTYFP: "003",
    NAME: "Atkinson",
    STATEFP: "13",
  },
  {
    COUNTYFP: "263",
    NAME: "Talbot",
    STATEFP: "13",
  },
  {
    COUNTYFP: "303",
    NAME: "Washington",
    STATEFP: "13",
  },
  {
    COUNTYFP: "091",
    NAME: "Dodge",
    STATEFP: "13",
  },
  {
    COUNTYFP: "311",
    NAME: "White",
    STATEFP: "13",
  },
  {
    COUNTYFP: "163",
    NAME: "Jefferson",
    STATEFP: "13",
  },
  {
    COUNTYFP: "309",
    NAME: "Wheeler",
    STATEFP: "13",
  },
  {
    COUNTYFP: "109",
    NAME: "Evans",
    STATEFP: "13",
  },
  {
    COUNTYFP: "259",
    NAME: "Stewart",
    STATEFP: "13",
  },
  {
    COUNTYFP: "107",
    NAME: "Emanuel",
    STATEFP: "13",
  },
  {
    COUNTYFP: "011",
    NAME: "Banks",
    STATEFP: "13",
  },
  {
    COUNTYFP: "105",
    NAME: "Elbert",
    STATEFP: "13",
  },
  {
    COUNTYFP: "315",
    NAME: "Wilcox",
    STATEFP: "13",
  },
  {
    COUNTYFP: "281",
    NAME: "Towns",
    STATEFP: "13",
  },
  {
    COUNTYFP: "093",
    NAME: "Dooly",
    STATEFP: "13",
  },
  {
    COUNTYFP: "131",
    NAME: "Grady",
    STATEFP: "13",
  },
  {
    COUNTYFP: "005",
    NAME: "Bacon",
    STATEFP: "13",
  },
  {
    COUNTYFP: "267",
    NAME: "Tattnall",
    STATEFP: "13",
  },
  {
    COUNTYFP: "317",
    NAME: "Wilkes",
    STATEFP: "13",
  },
  {
    COUNTYFP: "125",
    NAME: "Glascock",
    STATEFP: "13",
  },
  {
    COUNTYFP: "187",
    NAME: "Lumpkin",
    STATEFP: "13",
  },
  {
    COUNTYFP: "111",
    NAME: "Fannin",
    STATEFP: "13",
  },
  {
    COUNTYFP: "123",
    NAME: "Gilmer",
    STATEFP: "13",
  },
  {
    COUNTYFP: "001",
    NAME: "Appling",
    STATEFP: "13",
  },
  {
    COUNTYFP: "065",
    NAME: "Clinch",
    STATEFP: "13",
  },
  {
    COUNTYFP: "287",
    NAME: "Turner",
    STATEFP: "13",
  },
  {
    COUNTYFP: "243",
    NAME: "Randolph",
    STATEFP: "13",
  },
  {
    COUNTYFP: "161",
    NAME: "Jeff Davis",
    STATEFP: "13",
  },
  {
    COUNTYFP: "155",
    NAME: "Irwin",
    STATEFP: "13",
  },
  {
    COUNTYFP: "269",
    NAME: "Taylor",
    STATEFP: "13",
  },
  {
    COUNTYFP: "133",
    NAME: "Greene",
    STATEFP: "13",
  },
  {
    COUNTYFP: "301",
    NAME: "Warren",
    STATEFP: "13",
  },
  {
    COUNTYFP: "165",
    NAME: "Jenkins",
    STATEFP: "13",
  },
  {
    COUNTYFP: "241",
    NAME: "Rabun",
    STATEFP: "13",
  },
  {
    COUNTYFP: "271",
    NAME: "Telfair",
    STATEFP: "13",
  },
  {
    COUNTYFP: "201",
    NAME: "Miller",
    STATEFP: "13",
  },
  {
    COUNTYFP: "253",
    NAME: "Seminole",
    STATEFP: "13",
  },
  {
    COUNTYFP: "237",
    NAME: "Putnam",
    STATEFP: "13",
  },
  {
    COUNTYFP: "205",
    NAME: "Mitchell",
    STATEFP: "13",
  },
  {
    COUNTYFP: "273",
    NAME: "Terrell",
    STATEFP: "13",
  },
  {
    COUNTYFP: "095",
    NAME: "Dougherty",
    STATEFP: "13",
  },
  {
    COUNTYFP: "321",
    NAME: "Worth",
    STATEFP: "13",
  },
  {
    COUNTYFP: "177",
    NAME: "Lee",
    STATEFP: "13",
  },
  {
    COUNTYFP: "007",
    NAME: "Baker",
    STATEFP: "13",
  },
  {
    COUNTYFP: "261",
    NAME: "Sumter",
    STATEFP: "13",
  },
  {
    COUNTYFP: "249",
    NAME: "Schley",
    STATEFP: "13",
  },
  {
    COUNTYFP: "189",
    NAME: "McDuffie",
    STATEFP: "13",
  },
  {
    COUNTYFP: "073",
    NAME: "Columbia",
    STATEFP: "13",
  },
  {
    COUNTYFP: "181",
    NAME: "Lincoln",
    STATEFP: "13",
  },
  {
    COUNTYFP: "033",
    NAME: "Burke",
    STATEFP: "13",
  },
  {
    COUNTYFP: "025",
    NAME: "Brantley",
    STATEFP: "13",
  },
  {
    COUNTYFP: "191",
    NAME: "McIntosh",
    STATEFP: "13",
  },
  {
    COUNTYFP: "127",
    NAME: "Glynn",
    STATEFP: "13",
  },
  {
    COUNTYFP: "081",
    NAME: "Crisp",
    STATEFP: "13",
  },
  {
    COUNTYFP: "137",
    NAME: "Habersham",
    STATEFP: "13",
  },
  {
    COUNTYFP: "069",
    NAME: "Coffee",
    STATEFP: "13",
  },
  {
    COUNTYFP: "167",
    NAME: "Johnson",
    STATEFP: "13",
  },
  {
    COUNTYFP: "175",
    NAME: "Laurens",
    STATEFP: "13",
  },
  {
    COUNTYFP: "017",
    NAME: "Ben Hill",
    STATEFP: "13",
  },
  {
    COUNTYFP: "305",
    NAME: "Wayne",
    STATEFP: "13",
  },
  {
    COUNTYFP: "141",
    NAME: "Hancock",
    STATEFP: "13",
  },
  {
    COUNTYFP: "009",
    NAME: "Baldwin",
    STATEFP: "13",
  },
  {
    COUNTYFP: "071",
    NAME: "Colquitt",
    STATEFP: "13",
  },
  {
    COUNTYFP: "275",
    NAME: "Thomas",
    STATEFP: "13",
  },
  {
    COUNTYFP: "277",
    NAME: "Tift",
    STATEFP: "13",
  },
  {
    COUNTYFP: "257",
    NAME: "Stephens",
    STATEFP: "13",
  },
  {
    COUNTYFP: "185",
    NAME: "Lowndes",
    STATEFP: "13",
  },
  {
    COUNTYFP: "173",
    NAME: "Lanier",
    STATEFP: "13",
  },
  {
    COUNTYFP: "027",
    NAME: "Brooks",
    STATEFP: "13",
  },
  {
    COUNTYFP: "279",
    NAME: "Toombs",
    STATEFP: "13",
  },
  {
    COUNTYFP: "209",
    NAME: "Montgomery",
    STATEFP: "13",
  },
  {
    COUNTYFP: "229",
    NAME: "Pierce",
    STATEFP: "13",
  },
  {
    COUNTYFP: "299",
    NAME: "Ware",
    STATEFP: "13",
  },
  {
    COUNTYFP: "055",
    NAME: "Chattooga",
    STATEFP: "13",
  },
  {
    COUNTYFP: "221",
    NAME: "Oglethorpe",
    STATEFP: "13",
  },
  {
    COUNTYFP: "219",
    NAME: "Oconee",
    STATEFP: "13",
  },
  {
    COUNTYFP: "195",
    NAME: "Madison",
    STATEFP: "13",
  },
  {
    COUNTYFP: "171",
    NAME: "Lamar",
    STATEFP: "13",
  },
  {
    COUNTYFP: "063",
    NAME: "Clayton",
    STATEFP: "13",
  },
  {
    COUNTYFP: "089",
    NAME: "DeKalb",
    STATEFP: "13",
  },
  {
    COUNTYFP: "227",
    NAME: "Pickens",
    STATEFP: "13",
  },
  {
    COUNTYFP: "045",
    NAME: "Carroll",
    STATEFP: "13",
  },
  {
    COUNTYFP: "297",
    NAME: "Walton",
    STATEFP: "13",
  },
  {
    COUNTYFP: "013",
    NAME: "Barrow",
    STATEFP: "13",
  },
  {
    COUNTYFP: "223",
    NAME: "Paulding",
    STATEFP: "13",
  },
  {
    COUNTYFP: "199",
    NAME: "Meriwether",
    STATEFP: "13",
  },
  {
    COUNTYFP: "113",
    NAME: "Fayette",
    STATEFP: "13",
  },
  {
    COUNTYFP: "143",
    NAME: "Haralson",
    STATEFP: "13",
  },
  {
    COUNTYFP: "015",
    NAME: "Bartow",
    STATEFP: "13",
  },
  {
    COUNTYFP: "077",
    NAME: "Coweta",
    STATEFP: "13",
  },
  {
    COUNTYFP: "159",
    NAME: "Jasper",
    STATEFP: "13",
  },
  {
    COUNTYFP: "151",
    NAME: "Henry",
    STATEFP: "13",
  },
  {
    COUNTYFP: "085",
    NAME: "Dawson",
    STATEFP: "13",
  },
  {
    COUNTYFP: "097",
    NAME: "Douglas",
    STATEFP: "13",
  },
  {
    COUNTYFP: "211",
    NAME: "Morgan",
    STATEFP: "13",
  },
  {
    COUNTYFP: "135",
    NAME: "Gwinnett",
    STATEFP: "13",
  },
  {
    COUNTYFP: "231",
    NAME: "Pike",
    STATEFP: "13",
  },
  {
    COUNTYFP: "247",
    NAME: "Rockdale",
    STATEFP: "13",
  },
  {
    COUNTYFP: "255",
    NAME: "Spalding",
    STATEFP: "13",
  },
  {
    COUNTYFP: "035",
    NAME: "Butts",
    STATEFP: "13",
  },
  {
    COUNTYFP: "117",
    NAME: "Forsyth",
    STATEFP: "13",
  },
  {
    COUNTYFP: "121",
    NAME: "Fulton",
    STATEFP: "13",
  },
  {
    COUNTYFP: "149",
    NAME: "Heard",
    STATEFP: "13",
  },
  {
    COUNTYFP: "067",
    NAME: "Cobb",
    STATEFP: "13",
  },
  {
    COUNTYFP: "057",
    NAME: "Cherokee",
    STATEFP: "13",
  },
  {
    COUNTYFP: "217",
    NAME: "Newton",
    STATEFP: "13",
  },
  {
    COUNTYFP: "129",
    NAME: "Gordon",
    STATEFP: "13",
  },
  {
    COUNTYFP: "233",
    NAME: "Polk",
    STATEFP: "13",
  },
  {
    COUNTYFP: "139",
    NAME: "Hall",
    STATEFP: "13",
  },
  {
    COUNTYFP: "157",
    NAME: "Jackson",
    STATEFP: "13",
  },
  {
    COUNTYFP: "285",
    NAME: "Troup",
    STATEFP: "13",
  },
  {
    COUNTYFP: "293",
    NAME: "Upson",
    STATEFP: "13",
  },
  {
    COUNTYFP: "047",
    NAME: "Catoosa",
    STATEFP: "13",
  },
  {
    COUNTYFP: "083",
    NAME: "Dade",
    STATEFP: "13",
  },
  {
    COUNTYFP: "295",
    NAME: "Walker",
    STATEFP: "13",
  },
  {
    COUNTYFP: "313",
    NAME: "Whitfield",
    STATEFP: "13",
  },
  {
    COUNTYFP: "213",
    NAME: "Murray",
    STATEFP: "13",
  },
  {
    COUNTYFP: "039",
    NAME: "Camden",
    STATEFP: "13",
  },
  {
    COUNTYFP: "079",
    NAME: "Crawford",
    STATEFP: "13",
  },
  {
    COUNTYFP: "289",
    NAME: "Twiggs",
    STATEFP: "13",
  },
  {
    COUNTYFP: "169",
    NAME: "Jones",
    STATEFP: "13",
  },
  {
    COUNTYFP: "207",
    NAME: "Monroe",
    STATEFP: "13",
  },
  {
    COUNTYFP: "225",
    NAME: "Peach",
    STATEFP: "13",
  },
  {
    COUNTYFP: "235",
    NAME: "Pulaski",
    STATEFP: "13",
  },
  {
    COUNTYFP: "153",
    NAME: "Houston",
    STATEFP: "13",
  },
  {
    COUNTYFP: "145",
    NAME: "Harris",
    STATEFP: "13",
  },
  {
    COUNTYFP: "197",
    NAME: "Marion",
    STATEFP: "13",
  },
  {
    COUNTYFP: "001",
    NAME: "Hawaii",
    STATEFP: "15",
  },
  {
    COUNTYFP: "009",
    NAME: "Maui",
    STATEFP: "15",
  },
  {
    COUNTYFP: "007",
    NAME: "Kauai",
    STATEFP: "15",
  },
  {
    COUNTYFP: "055",
    NAME: "Kootenai",
    STATEFP: "16",
  },
  {
    COUNTYFP: "057",
    NAME: "Latah",
    STATEFP: "16",
  },
  {
    COUNTYFP: "033",
    NAME: "Clark",
    STATEFP: "16",
  },
  {
    COUNTYFP: "037",
    NAME: "Custer",
    STATEFP: "16",
  },
  {
    COUNTYFP: "049",
    NAME: "Idaho",
    STATEFP: "16",
  },
  {
    COUNTYFP: "077",
    NAME: "Power",
    STATEFP: "16",
  },
  {
    COUNTYFP: "009",
    NAME: "Benewah",
    STATEFP: "16",
  },
  {
    COUNTYFP: "003",
    NAME: "Adams",
    STATEFP: "16",
  },
  {
    COUNTYFP: "085",
    NAME: "Valley",
    STATEFP: "16",
  },
  {
    COUNTYFP: "059",
    NAME: "Lemhi",
    STATEFP: "16",
  },
  {
    COUNTYFP: "071",
    NAME: "Oneida",
    STATEFP: "16",
  },
  {
    COUNTYFP: "035",
    NAME: "Clearwater",
    STATEFP: "16",
  },
  {
    COUNTYFP: "079",
    NAME: "Shoshone",
    STATEFP: "16",
  },
  {
    COUNTYFP: "047",
    NAME: "Gooding",
    STATEFP: "16",
  },
  {
    COUNTYFP: "029",
    NAME: "Caribou",
    STATEFP: "16",
  },
  {
    COUNTYFP: "021",
    NAME: "Boundary",
    STATEFP: "16",
  },
  {
    COUNTYFP: "007",
    NAME: "Bear Lake",
    STATEFP: "16",
  },
  {
    COUNTYFP: "061",
    NAME: "Lewis",
    STATEFP: "16",
  },
  {
    COUNTYFP: "087",
    NAME: "Washington",
    STATEFP: "16",
  },
  {
    COUNTYFP: "067",
    NAME: "Minidoka",
    STATEFP: "16",
  },
  {
    COUNTYFP: "031",
    NAME: "Cassia",
    STATEFP: "16",
  },
  {
    COUNTYFP: "013",
    NAME: "Blaine",
    STATEFP: "16",
  },
  {
    COUNTYFP: "063",
    NAME: "Lincoln",
    STATEFP: "16",
  },
  {
    COUNTYFP: "025",
    NAME: "Camas",
    STATEFP: "16",
  },
  {
    COUNTYFP: "081",
    NAME: "Teton",
    STATEFP: "16",
  },
  {
    COUNTYFP: "069",
    NAME: "Nez Perce",
    STATEFP: "16",
  },
  {
    COUNTYFP: "041",
    NAME: "Franklin",
    STATEFP: "16",
  },
  {
    COUNTYFP: "005",
    NAME: "Bannock",
    STATEFP: "16",
  },
  {
    COUNTYFP: "017",
    NAME: "Bonner",
    STATEFP: "16",
  },
  {
    COUNTYFP: "053",
    NAME: "Jerome",
    STATEFP: "16",
  },
  {
    COUNTYFP: "083",
    NAME: "Twin Falls",
    STATEFP: "16",
  },
  {
    COUNTYFP: "045",
    NAME: "Gem",
    STATEFP: "16",
  },
  {
    COUNTYFP: "001",
    NAME: "Ada",
    STATEFP: "16",
  },
  {
    COUNTYFP: "015",
    NAME: "Boise",
    STATEFP: "16",
  },
  {
    COUNTYFP: "027",
    NAME: "Canyon",
    STATEFP: "16",
  },
  {
    COUNTYFP: "073",
    NAME: "Owyhee",
    STATEFP: "16",
  },
  {
    COUNTYFP: "039",
    NAME: "Elmore",
    STATEFP: "16",
  },
  {
    COUNTYFP: "075",
    NAME: "Payette",
    STATEFP: "16",
  },
  {
    COUNTYFP: "065",
    NAME: "Madison",
    STATEFP: "16",
  },
  {
    COUNTYFP: "043",
    NAME: "Fremont",
    STATEFP: "16",
  },
  {
    COUNTYFP: "011",
    NAME: "Bingham",
    STATEFP: "16",
  },
  {
    COUNTYFP: "051",
    NAME: "Jefferson",
    STATEFP: "16",
  },
  {
    COUNTYFP: "019",
    NAME: "Bonneville",
    STATEFP: "16",
  },
  {
    COUNTYFP: "023",
    NAME: "Butte",
    STATEFP: "16",
  },
  {
    COUNTYFP: "121",
    NAME: "Marion",
    STATEFP: "17",
  },
  {
    COUNTYFP: "005",
    NAME: "Bond",
    STATEFP: "17",
  },
  {
    COUNTYFP: "083",
    NAME: "Jersey",
    STATEFP: "17",
  },
  {
    COUNTYFP: "163",
    NAME: "St. Clair",
    STATEFP: "17",
  },
  {
    COUNTYFP: "027",
    NAME: "Clinton",
    STATEFP: "17",
  },
  {
    COUNTYFP: "013",
    NAME: "Calhoun",
    STATEFP: "17",
  },
  {
    COUNTYFP: "119",
    NAME: "Madison",
    STATEFP: "17",
  },
  {
    COUNTYFP: "133",
    NAME: "Monroe",
    STATEFP: "17",
  },
  {
    COUNTYFP: "117",
    NAME: "Macoupin",
    STATEFP: "17",
  },
  {
    COUNTYFP: "171",
    NAME: "Scott",
    STATEFP: "17",
  },
  {
    COUNTYFP: "137",
    NAME: "Morgan",
    STATEFP: "17",
  },
  {
    COUNTYFP: "107",
    NAME: "Logan",
    STATEFP: "17",
  },
  {
    COUNTYFP: "129",
    NAME: "Menard",
    STATEFP: "17",
  },
  {
    COUNTYFP: "167",
    NAME: "Sangamon",
    STATEFP: "17",
  },
  {
    COUNTYFP: "021",
    NAME: "Christian",
    STATEFP: "17",
  },
  {
    COUNTYFP: "127",
    NAME: "Massac",
    STATEFP: "17",
  },
  {
    COUNTYFP: "057",
    NAME: "Fulton",
    STATEFP: "17",
  },
  {
    COUNTYFP: "175",
    NAME: "Stark",
    STATEFP: "17",
  },
  {
    COUNTYFP: "203",
    NAME: "Woodford",
    STATEFP: "17",
  },
  {
    COUNTYFP: "179",
    NAME: "Tazewell",
    STATEFP: "17",
  },
  {
    COUNTYFP: "123",
    NAME: "Marshall",
    STATEFP: "17",
  },
  {
    COUNTYFP: "143",
    NAME: "Peoria",
    STATEFP: "17",
  },
  {
    COUNTYFP: "001",
    NAME: "Adams",
    STATEFP: "17",
  },
  {
    COUNTYFP: "177",
    NAME: "Stephenson",
    STATEFP: "17",
  },
  {
    COUNTYFP: "141",
    NAME: "Ogle",
    STATEFP: "17",
  },
  {
    COUNTYFP: "201",
    NAME: "Winnebago",
    STATEFP: "17",
  },
  {
    COUNTYFP: "007",
    NAME: "Boone",
    STATEFP: "17",
  },
  {
    COUNTYFP: "025",
    NAME: "Clay",
    STATEFP: "17",
  },
  {
    COUNTYFP: "185",
    NAME: "Wabash",
    STATEFP: "17",
  },
  {
    COUNTYFP: "009",
    NAME: "Brown",
    STATEFP: "17",
  },
  {
    COUNTYFP: "151",
    NAME: "Pope",
    STATEFP: "17",
  },
  {
    COUNTYFP: "033",
    NAME: "Crawford",
    STATEFP: "17",
  },
  {
    COUNTYFP: "135",
    NAME: "Montgomery",
    STATEFP: "17",
  },
  {
    COUNTYFP: "055",
    NAME: "Franklin",
    STATEFP: "17",
  },
  {
    COUNTYFP: "023",
    NAME: "Clark",
    STATEFP: "17",
  },
  {
    COUNTYFP: "059",
    NAME: "Gallatin",
    STATEFP: "17",
  },
  {
    COUNTYFP: "075",
    NAME: "Iroquois",
    STATEFP: "17",
  },
  {
    COUNTYFP: "041",
    NAME: "Douglas",
    STATEFP: "17",
  },
  {
    COUNTYFP: "189",
    NAME: "Washington",
    STATEFP: "17",
  },
  {
    COUNTYFP: "159",
    NAME: "Richland",
    STATEFP: "17",
  },
  {
    COUNTYFP: "065",
    NAME: "Hamilton",
    STATEFP: "17",
  },
  {
    COUNTYFP: "193",
    NAME: "White",
    STATEFP: "17",
  },
  {
    COUNTYFP: "169",
    NAME: "Schuyler",
    STATEFP: "17",
  },
  {
    COUNTYFP: "181",
    NAME: "Union",
    STATEFP: "17",
  },
  {
    COUNTYFP: "085",
    NAME: "Jo Daviess",
    STATEFP: "17",
  },
  {
    COUNTYFP: "125",
    NAME: "Mason",
    STATEFP: "17",
  },
  {
    COUNTYFP: "191",
    NAME: "Wayne",
    STATEFP: "17",
  },
  {
    COUNTYFP: "069",
    NAME: "Hardin",
    STATEFP: "17",
  },
  {
    COUNTYFP: "061",
    NAME: "Greene",
    STATEFP: "17",
  },
  {
    COUNTYFP: "157",
    NAME: "Randolph",
    STATEFP: "17",
  },
  {
    COUNTYFP: "149",
    NAME: "Pike",
    STATEFP: "17",
  },
  {
    COUNTYFP: "145",
    NAME: "Perry",
    STATEFP: "17",
  },
  {
    COUNTYFP: "087",
    NAME: "Johnson",
    STATEFP: "17",
  },
  {
    COUNTYFP: "173",
    NAME: "Shelby",
    STATEFP: "17",
  },
  {
    COUNTYFP: "051",
    NAME: "Fayette",
    STATEFP: "17",
  },
  {
    COUNTYFP: "139",
    NAME: "Moultrie",
    STATEFP: "17",
  },
  {
    COUNTYFP: "017",
    NAME: "Cass",
    STATEFP: "17",
  },
  {
    COUNTYFP: "015",
    NAME: "Carroll",
    STATEFP: "17",
  },
  {
    COUNTYFP: "047",
    NAME: "Edwards",
    STATEFP: "17",
  },
  {
    COUNTYFP: "079",
    NAME: "Jasper",
    STATEFP: "17",
  },
  {
    COUNTYFP: "187",
    NAME: "Warren",
    STATEFP: "17",
  },
  {
    COUNTYFP: "153",
    NAME: "Pulaski",
    STATEFP: "17",
  },
  {
    COUNTYFP: "165",
    NAME: "Saline",
    STATEFP: "17",
  },
  {
    COUNTYFP: "101",
    NAME: "Lawrence",
    STATEFP: "17",
  },
  {
    COUNTYFP: "045",
    NAME: "Edgar",
    STATEFP: "17",
  },
  {
    COUNTYFP: "071",
    NAME: "Henderson",
    STATEFP: "17",
  },
  {
    COUNTYFP: "199",
    NAME: "Williamson",
    STATEFP: "17",
  },
  {
    COUNTYFP: "077",
    NAME: "Jackson",
    STATEFP: "17",
  },
  {
    COUNTYFP: "147",
    NAME: "Piatt",
    STATEFP: "17",
  },
  {
    COUNTYFP: "053",
    NAME: "Ford",
    STATEFP: "17",
  },
  {
    COUNTYFP: "019",
    NAME: "Champaign",
    STATEFP: "17",
  },
  {
    COUNTYFP: "029",
    NAME: "Coles",
    STATEFP: "17",
  },
  {
    COUNTYFP: "035",
    NAME: "Cumberland",
    STATEFP: "17",
  },
  {
    COUNTYFP: "183",
    NAME: "Vermilion",
    STATEFP: "17",
  },
  {
    COUNTYFP: "115",
    NAME: "Macon",
    STATEFP: "17",
  },
  {
    COUNTYFP: "049",
    NAME: "Effingham",
    STATEFP: "17",
  },
  {
    COUNTYFP: "067",
    NAME: "Hancock",
    STATEFP: "17",
  },
  {
    COUNTYFP: "095",
    NAME: "Knox",
    STATEFP: "17",
  },
  {
    COUNTYFP: "109",
    NAME: "McDonough",
    STATEFP: "17",
  },
  {
    COUNTYFP: "081",
    NAME: "Jefferson",
    STATEFP: "17",
  },
  {
    COUNTYFP: "113",
    NAME: "McLean",
    STATEFP: "17",
  },
  {
    COUNTYFP: "039",
    NAME: "De Witt",
    STATEFP: "17",
  },
  {
    COUNTYFP: "105",
    NAME: "Livingston",
    STATEFP: "17",
  },
  {
    COUNTYFP: "003",
    NAME: "Alexander",
    STATEFP: "17",
  },
  {
    COUNTYFP: "093",
    NAME: "Kendall",
    STATEFP: "17",
  },
  {
    COUNTYFP: "031",
    NAME: "Cook",
    STATEFP: "17",
  },
  {
    COUNTYFP: "037",
    NAME: "DeKalb",
    STATEFP: "17",
  },
  {
    COUNTYFP: "089",
    NAME: "Kane",
    STATEFP: "17",
  },
  {
    COUNTYFP: "063",
    NAME: "Grundy",
    STATEFP: "17",
  },
  {
    COUNTYFP: "111",
    NAME: "McHenry",
    STATEFP: "17",
  },
  {
    COUNTYFP: "197",
    NAME: "Will",
    STATEFP: "17",
  },
  {
    COUNTYFP: "043",
    NAME: "DuPage",
    STATEFP: "17",
  },
  {
    COUNTYFP: "097",
    NAME: "Lake",
    STATEFP: "17",
  },
  {
    COUNTYFP: "091",
    NAME: "Kankakee",
    STATEFP: "17",
  },
  {
    COUNTYFP: "011",
    NAME: "Bureau",
    STATEFP: "17",
  },
  {
    COUNTYFP: "155",
    NAME: "Putnam",
    STATEFP: "17",
  },
  {
    COUNTYFP: "099",
    NAME: "LaSalle",
    STATEFP: "17",
  },
  {
    COUNTYFP: "131",
    NAME: "Mercer",
    STATEFP: "17",
  },
  {
    COUNTYFP: "161",
    NAME: "Rock Island",
    STATEFP: "17",
  },
  {
    COUNTYFP: "073",
    NAME: "Henry",
    STATEFP: "17",
  },
  {
    COUNTYFP: "103",
    NAME: "Lee",
    STATEFP: "17",
  },
  {
    COUNTYFP: "195",
    NAME: "Whiteside",
    STATEFP: "17",
  },
  {
    COUNTYFP: "039",
    NAME: "Elkhart",
    STATEFP: "18",
  },
  {
    COUNTYFP: "099",
    NAME: "Marshall",
    STATEFP: "18",
  },
  {
    COUNTYFP: "141",
    NAME: "St. Joseph",
    STATEFP: "18",
  },
  {
    COUNTYFP: "041",
    NAME: "Fayette",
    STATEFP: "18",
  },
  {
    COUNTYFP: "177",
    NAME: "Wayne",
    STATEFP: "18",
  },
  {
    COUNTYFP: "123",
    NAME: "Perry",
    STATEFP: "18",
  },
  {
    COUNTYFP: "117",
    NAME: "Orange",
    STATEFP: "18",
  },
  {
    COUNTYFP: "171",
    NAME: "Warren",
    STATEFP: "18",
  },
  {
    COUNTYFP: "137",
    NAME: "Ripley",
    STATEFP: "18",
  },
  {
    COUNTYFP: "047",
    NAME: "Franklin",
    STATEFP: "18",
  },
  {
    COUNTYFP: "051",
    NAME: "Gibson",
    STATEFP: "18",
  },
  {
    COUNTYFP: "049",
    NAME: "Fulton",
    STATEFP: "18",
  },
  {
    COUNTYFP: "055",
    NAME: "Greene",
    STATEFP: "18",
  },
  {
    COUNTYFP: "139",
    NAME: "Rush",
    STATEFP: "18",
  },
  {
    COUNTYFP: "135",
    NAME: "Randolph",
    STATEFP: "18",
  },
  {
    COUNTYFP: "087",
    NAME: "LaGrange",
    STATEFP: "18",
  },
  {
    COUNTYFP: "131",
    NAME: "Pulaski",
    STATEFP: "18",
  },
  {
    COUNTYFP: "149",
    NAME: "Starke",
    STATEFP: "18",
  },
  {
    COUNTYFP: "045",
    NAME: "Fountain",
    STATEFP: "18",
  },
  {
    COUNTYFP: "159",
    NAME: "Tipton",
    STATEFP: "18",
  },
  {
    COUNTYFP: "025",
    NAME: "Crawford",
    STATEFP: "18",
  },
  {
    COUNTYFP: "155",
    NAME: "Switzerland",
    STATEFP: "18",
  },
  {
    COUNTYFP: "121",
    NAME: "Parke",
    STATEFP: "18",
  },
  {
    COUNTYFP: "009",
    NAME: "Blackford",
    STATEFP: "18",
  },
  {
    COUNTYFP: "147",
    NAME: "Spencer",
    STATEFP: "18",
  },
  {
    COUNTYFP: "075",
    NAME: "Jay",
    STATEFP: "18",
  },
  {
    COUNTYFP: "181",
    NAME: "White",
    STATEFP: "18",
  },
  {
    COUNTYFP: "101",
    NAME: "Martin",
    STATEFP: "18",
  },
  {
    COUNTYFP: "173",
    NAME: "Warrick",
    STATEFP: "18",
  },
  {
    COUNTYFP: "129",
    NAME: "Posey",
    STATEFP: "18",
  },
  {
    COUNTYFP: "163",
    NAME: "Vanderburgh",
    STATEFP: "18",
  },
  {
    COUNTYFP: "037",
    NAME: "Dubois",
    STATEFP: "18",
  },
  {
    COUNTYFP: "125",
    NAME: "Pike",
    STATEFP: "18",
  },
  {
    COUNTYFP: "017",
    NAME: "Cass",
    STATEFP: "18",
  },
  {
    COUNTYFP: "053",
    NAME: "Grant",
    STATEFP: "18",
  },
  {
    COUNTYFP: "165",
    NAME: "Vermillion",
    STATEFP: "18",
  },
  {
    COUNTYFP: "167",
    NAME: "Vigo",
    STATEFP: "18",
  },
  {
    COUNTYFP: "153",
    NAME: "Sullivan",
    STATEFP: "18",
  },
  {
    COUNTYFP: "021",
    NAME: "Clay",
    STATEFP: "18",
  },
  {
    COUNTYFP: "083",
    NAME: "Knox",
    STATEFP: "18",
  },
  {
    COUNTYFP: "169",
    NAME: "Wabash",
    STATEFP: "18",
  },
  {
    COUNTYFP: "085",
    NAME: "Kosciusko",
    STATEFP: "18",
  },
  {
    COUNTYFP: "027",
    NAME: "Daviess",
    STATEFP: "18",
  },
  {
    COUNTYFP: "093",
    NAME: "Lawrence",
    STATEFP: "18",
  },
  {
    COUNTYFP: "119",
    NAME: "Owen",
    STATEFP: "18",
  },
  {
    COUNTYFP: "105",
    NAME: "Monroe",
    STATEFP: "18",
  },
  {
    COUNTYFP: "073",
    NAME: "Jasper",
    STATEFP: "18",
  },
  {
    COUNTYFP: "111",
    NAME: "Newton",
    STATEFP: "18",
  },
  {
    COUNTYFP: "089",
    NAME: "Lake",
    STATEFP: "18",
  },
  {
    COUNTYFP: "127",
    NAME: "Porter",
    STATEFP: "18",
  },
  {
    COUNTYFP: "091",
    NAME: "LaPorte",
    STATEFP: "18",
  },
  {
    COUNTYFP: "115",
    NAME: "Ohio",
    STATEFP: "18",
  },
  {
    COUNTYFP: "161",
    NAME: "Union",
    STATEFP: "18",
  },
  {
    COUNTYFP: "029",
    NAME: "Dearborn",
    STATEFP: "18",
  },
  {
    COUNTYFP: "005",
    NAME: "Bartholomew",
    STATEFP: "18",
  },
  {
    COUNTYFP: "107",
    NAME: "Montgomery",
    STATEFP: "18",
  },
  {
    COUNTYFP: "031",
    NAME: "Decatur",
    STATEFP: "18",
  },
  {
    COUNTYFP: "057",
    NAME: "Hamilton",
    STATEFP: "18",
  },
  {
    COUNTYFP: "081",
    NAME: "Johnson",
    STATEFP: "18",
  },
  {
    COUNTYFP: "059",
    NAME: "Hancock",
    STATEFP: "18",
  },
  {
    COUNTYFP: "013",
    NAME: "Brown",
    STATEFP: "18",
  },
  {
    COUNTYFP: "109",
    NAME: "Morgan",
    STATEFP: "18",
  },
  {
    COUNTYFP: "095",
    NAME: "Madison",
    STATEFP: "18",
  },
  {
    COUNTYFP: "133",
    NAME: "Putnam",
    STATEFP: "18",
  },
  {
    COUNTYFP: "063",
    NAME: "Hendricks",
    STATEFP: "18",
  },
  {
    COUNTYFP: "011",
    NAME: "Boone",
    STATEFP: "18",
  },
  {
    COUNTYFP: "145",
    NAME: "Shelby",
    STATEFP: "18",
  },
  {
    COUNTYFP: "035",
    NAME: "Delaware",
    STATEFP: "18",
  },
  {
    COUNTYFP: "065",
    NAME: "Henry",
    STATEFP: "18",
  },
  {
    COUNTYFP: "079",
    NAME: "Jennings",
    STATEFP: "18",
  },
  {
    COUNTYFP: "071",
    NAME: "Jackson",
    STATEFP: "18",
  },
  {
    COUNTYFP: "067",
    NAME: "Howard",
    STATEFP: "18",
  },
  {
    COUNTYFP: "103",
    NAME: "Miami",
    STATEFP: "18",
  },
  {
    COUNTYFP: "023",
    NAME: "Clinton",
    STATEFP: "18",
  },
  {
    COUNTYFP: "007",
    NAME: "Benton",
    STATEFP: "18",
  },
  {
    COUNTYFP: "157",
    NAME: "Tippecanoe",
    STATEFP: "18",
  },
  {
    COUNTYFP: "015",
    NAME: "Carroll",
    STATEFP: "18",
  },
  {
    COUNTYFP: "143",
    NAME: "Scott",
    STATEFP: "18",
  },
  {
    COUNTYFP: "043",
    NAME: "Floyd",
    STATEFP: "18",
  },
  {
    COUNTYFP: "061",
    NAME: "Harrison",
    STATEFP: "18",
  },
  {
    COUNTYFP: "019",
    NAME: "Clark",
    STATEFP: "18",
  },
  {
    COUNTYFP: "175",
    NAME: "Washington",
    STATEFP: "18",
  },
  {
    COUNTYFP: "077",
    NAME: "Jefferson",
    STATEFP: "18",
  },
  {
    COUNTYFP: "151",
    NAME: "Steuben",
    STATEFP: "18",
  },
  {
    COUNTYFP: "033",
    NAME: "DeKalb",
    STATEFP: "18",
  },
  {
    COUNTYFP: "001",
    NAME: "Adams",
    STATEFP: "18",
  },
  {
    COUNTYFP: "003",
    NAME: "Allen",
    STATEFP: "18",
  },
  {
    COUNTYFP: "179",
    NAME: "Wells",
    STATEFP: "18",
  },
  {
    COUNTYFP: "183",
    NAME: "Whitley",
    STATEFP: "18",
  },
  {
    COUNTYFP: "069",
    NAME: "Huntington",
    STATEFP: "18",
  },
  {
    COUNTYFP: "113",
    NAME: "Noble",
    STATEFP: "18",
  },
  {
    COUNTYFP: "149",
    NAME: "Plymouth",
    STATEFP: "19",
  },
  {
    COUNTYFP: "193",
    NAME: "Woodbury",
    STATEFP: "19",
  },
  {
    COUNTYFP: "027",
    NAME: "Carroll",
    STATEFP: "19",
  },
  {
    COUNTYFP: "061",
    NAME: "Dubuque",
    STATEFP: "19",
  },
  {
    COUNTYFP: "101",
    NAME: "Jefferson",
    STATEFP: "19",
  },
  {
    COUNTYFP: "187",
    NAME: "Webster",
    STATEFP: "19",
  },
  {
    COUNTYFP: "111",
    NAME: "Lee",
    STATEFP: "19",
  },
  {
    COUNTYFP: "127",
    NAME: "Marshall",
    STATEFP: "19",
  },
  {
    COUNTYFP: "195",
    NAME: "Worth",
    STATEFP: "19",
  },
  {
    COUNTYFP: "033",
    NAME: "Cerro Gordo",
    STATEFP: "19",
  },
  {
    COUNTYFP: "051",
    NAME: "Davis",
    STATEFP: "19",
  },
  {
    COUNTYFP: "179",
    NAME: "Wapello",
    STATEFP: "19",
  },
  {
    COUNTYFP: "041",
    NAME: "Clay",
    STATEFP: "19",
  },
  {
    COUNTYFP: "059",
    NAME: "Dickinson",
    STATEFP: "19",
  },
  {
    COUNTYFP: "021",
    NAME: "Buena Vista",
    STATEFP: "19",
  },
  {
    COUNTYFP: "013",
    NAME: "Black Hawk",
    STATEFP: "19",
  },
  {
    COUNTYFP: "075",
    NAME: "Grundy",
    STATEFP: "19",
  },
  {
    COUNTYFP: "017",
    NAME: "Bremer",
    STATEFP: "19",
  },
  {
    COUNTYFP: "085",
    NAME: "Harrison",
    STATEFP: "19",
  },
  {
    COUNTYFP: "129",
    NAME: "Mills",
    STATEFP: "19",
  },
  {
    COUNTYFP: "155",
    NAME: "Pottawattamie",
    STATEFP: "19",
  },
  {
    COUNTYFP: "123",
    NAME: "Mahaska",
    STATEFP: "19",
  },
  {
    COUNTYFP: "125",
    NAME: "Marion",
    STATEFP: "19",
  },
  {
    COUNTYFP: "053",
    NAME: "Decatur",
    STATEFP: "19",
  },
  {
    COUNTYFP: "031",
    NAME: "Cedar",
    STATEFP: "19",
  },
  {
    COUNTYFP: "151",
    NAME: "Pocahontas",
    STATEFP: "19",
  },
  {
    COUNTYFP: "109",
    NAME: "Kossuth",
    STATEFP: "19",
  },
  {
    COUNTYFP: "089",
    NAME: "Howard",
    STATEFP: "19",
  },
  {
    COUNTYFP: "147",
    NAME: "Palo Alto",
    STATEFP: "19",
  },
  {
    COUNTYFP: "159",
    NAME: "Ringgold",
    STATEFP: "19",
  },
  {
    COUNTYFP: "025",
    NAME: "Calhoun",
    STATEFP: "19",
  },
  {
    COUNTYFP: "039",
    NAME: "Clarke",
    STATEFP: "19",
  },
  {
    COUNTYFP: "065",
    NAME: "Fayette",
    STATEFP: "19",
  },
  {
    COUNTYFP: "001",
    NAME: "Adair",
    STATEFP: "19",
  },
  {
    COUNTYFP: "037",
    NAME: "Chickasaw",
    STATEFP: "19",
  },
  {
    COUNTYFP: "081",
    NAME: "Hancock",
    STATEFP: "19",
  },
  {
    COUNTYFP: "157",
    NAME: "Poweshiek",
    STATEFP: "19",
  },
  {
    COUNTYFP: "165",
    NAME: "Shelby",
    STATEFP: "19",
  },
  {
    COUNTYFP: "185",
    NAME: "Wayne",
    STATEFP: "19",
  },
  {
    COUNTYFP: "097",
    NAME: "Jackson",
    STATEFP: "19",
  },
  {
    COUNTYFP: "043",
    NAME: "Clayton",
    STATEFP: "19",
  },
  {
    COUNTYFP: "007",
    NAME: "Appanoose",
    STATEFP: "19",
  },
  {
    COUNTYFP: "177",
    NAME: "Van Buren",
    STATEFP: "19",
  },
  {
    COUNTYFP: "197",
    NAME: "Wright",
    STATEFP: "19",
  },
  {
    COUNTYFP: "137",
    NAME: "Montgomery",
    STATEFP: "19",
  },
  {
    COUNTYFP: "175",
    NAME: "Union",
    STATEFP: "19",
  },
  {
    COUNTYFP: "107",
    NAME: "Keokuk",
    STATEFP: "19",
  },
  {
    COUNTYFP: "131",
    NAME: "Mitchell",
    STATEFP: "19",
  },
  {
    COUNTYFP: "191",
    NAME: "Winneshiek",
    STATEFP: "19",
  },
  {
    COUNTYFP: "161",
    NAME: "Sac",
    STATEFP: "19",
  },
  {
    COUNTYFP: "055",
    NAME: "Delaware",
    STATEFP: "19",
  },
  {
    COUNTYFP: "067",
    NAME: "Floyd",
    STATEFP: "19",
  },
  {
    COUNTYFP: "009",
    NAME: "Audubon",
    STATEFP: "19",
  },
  {
    COUNTYFP: "079",
    NAME: "Hamilton",
    STATEFP: "19",
  },
  {
    COUNTYFP: "069",
    NAME: "Franklin",
    STATEFP: "19",
  },
  {
    COUNTYFP: "141",
    NAME: "O'Brien",
    STATEFP: "19",
  },
  {
    COUNTYFP: "167",
    NAME: "Sioux",
    STATEFP: "19",
  },
  {
    COUNTYFP: "005",
    NAME: "Allamakee",
    STATEFP: "19",
  },
  {
    COUNTYFP: "189",
    NAME: "Winnebago",
    STATEFP: "19",
  },
  {
    COUNTYFP: "093",
    NAME: "Ida",
    STATEFP: "19",
  },
  {
    COUNTYFP: "029",
    NAME: "Cass",
    STATEFP: "19",
  },
  {
    COUNTYFP: "083",
    NAME: "Hardin",
    STATEFP: "19",
  },
  {
    COUNTYFP: "173",
    NAME: "Taylor",
    STATEFP: "19",
  },
  {
    COUNTYFP: "145",
    NAME: "Page",
    STATEFP: "19",
  },
  {
    COUNTYFP: "035",
    NAME: "Cherokee",
    STATEFP: "19",
  },
  {
    COUNTYFP: "071",
    NAME: "Fremont",
    STATEFP: "19",
  },
  {
    COUNTYFP: "095",
    NAME: "Iowa",
    STATEFP: "19",
  },
  {
    COUNTYFP: "023",
    NAME: "Butler",
    STATEFP: "19",
  },
  {
    COUNTYFP: "063",
    NAME: "Emmet",
    STATEFP: "19",
  },
  {
    COUNTYFP: "047",
    NAME: "Crawford",
    STATEFP: "19",
  },
  {
    COUNTYFP: "019",
    NAME: "Buchanan",
    STATEFP: "19",
  },
  {
    COUNTYFP: "143",
    NAME: "Osceola",
    STATEFP: "19",
  },
  {
    COUNTYFP: "073",
    NAME: "Greene",
    STATEFP: "19",
  },
  {
    COUNTYFP: "087",
    NAME: "Henry",
    STATEFP: "19",
  },
  {
    COUNTYFP: "119",
    NAME: "Lyon",
    STATEFP: "19",
  },
  {
    COUNTYFP: "003",
    NAME: "Adams",
    STATEFP: "19",
  },
  {
    COUNTYFP: "133",
    NAME: "Monona",
    STATEFP: "19",
  },
  {
    COUNTYFP: "091",
    NAME: "Humboldt",
    STATEFP: "19",
  },
  {
    COUNTYFP: "115",
    NAME: "Louisa",
    STATEFP: "19",
  },
  {
    COUNTYFP: "171",
    NAME: "Tama",
    STATEFP: "19",
  },
  {
    COUNTYFP: "135",
    NAME: "Monroe",
    STATEFP: "19",
  },
  {
    COUNTYFP: "117",
    NAME: "Lucas",
    STATEFP: "19",
  },
  {
    COUNTYFP: "057",
    NAME: "Des Moines",
    STATEFP: "19",
  },
  {
    COUNTYFP: "011",
    NAME: "Benton",
    STATEFP: "19",
  },
  {
    COUNTYFP: "113",
    NAME: "Linn",
    STATEFP: "19",
  },
  {
    COUNTYFP: "105",
    NAME: "Jones",
    STATEFP: "19",
  },
  {
    COUNTYFP: "103",
    NAME: "Johnson",
    STATEFP: "19",
  },
  {
    COUNTYFP: "183",
    NAME: "Washington",
    STATEFP: "19",
  },
  {
    COUNTYFP: "045",
    NAME: "Clinton",
    STATEFP: "19",
  },
  {
    COUNTYFP: "163",
    NAME: "Scott",
    STATEFP: "19",
  },
  {
    COUNTYFP: "139",
    NAME: "Muscatine",
    STATEFP: "19",
  },
  {
    COUNTYFP: "169",
    NAME: "Story",
    STATEFP: "19",
  },
  {
    COUNTYFP: "015",
    NAME: "Boone",
    STATEFP: "19",
  },
  {
    COUNTYFP: "121",
    NAME: "Madison",
    STATEFP: "19",
  },
  {
    COUNTYFP: "181",
    NAME: "Warren",
    STATEFP: "19",
  },
  {
    COUNTYFP: "049",
    NAME: "Dallas",
    STATEFP: "19",
  },
  {
    COUNTYFP: "153",
    NAME: "Polk",
    STATEFP: "19",
  },
  {
    COUNTYFP: "077",
    NAME: "Guthrie",
    STATEFP: "19",
  },
  {
    COUNTYFP: "099",
    NAME: "Jasper",
    STATEFP: "19",
  },
  {
    COUNTYFP: "035",
    NAME: "Cowley",
    STATEFP: "20",
  },
  {
    COUNTYFP: "015",
    NAME: "Butler",
    STATEFP: "20",
  },
  {
    COUNTYFP: "191",
    NAME: "Sumner",
    STATEFP: "20",
  },
  {
    COUNTYFP: "173",
    NAME: "Sedgwick",
    STATEFP: "20",
  },
  {
    COUNTYFP: "095",
    NAME: "Kingman",
    STATEFP: "20",
  },
  {
    COUNTYFP: "079",
    NAME: "Harvey",
    STATEFP: "20",
  },
  {
    COUNTYFP: "073",
    NAME: "Greenwood",
    STATEFP: "20",
  },
  {
    COUNTYFP: "157",
    NAME: "Republic",
    STATEFP: "20",
  },
  {
    COUNTYFP: "039",
    NAME: "Decatur",
    STATEFP: "20",
  },
  {
    COUNTYFP: "147",
    NAME: "Phillips",
    STATEFP: "20",
  },
  {
    COUNTYFP: "075",
    NAME: "Hamilton",
    STATEFP: "20",
  },
  {
    COUNTYFP: "199",
    NAME: "Wallace",
    STATEFP: "20",
  },
  {
    COUNTYFP: "151",
    NAME: "Pratt",
    STATEFP: "20",
  },
  {
    COUNTYFP: "101",
    NAME: "Lane",
    STATEFP: "20",
  },
  {
    COUNTYFP: "195",
    NAME: "Trego",
    STATEFP: "20",
  },
  {
    COUNTYFP: "115",
    NAME: "Marion",
    STATEFP: "20",
  },
  {
    COUNTYFP: "165",
    NAME: "Rush",
    STATEFP: "20",
  },
  {
    COUNTYFP: "187",
    NAME: "Stanton",
    STATEFP: "20",
  },
  {
    COUNTYFP: "181",
    NAME: "Sherman",
    STATEFP: "20",
  },
  {
    COUNTYFP: "001",
    NAME: "Allen",
    STATEFP: "20",
  },
  {
    COUNTYFP: "021",
    NAME: "Cherokee",
    STATEFP: "20",
  },
  {
    COUNTYFP: "023",
    NAME: "Cheyenne",
    STATEFP: "20",
  },
  {
    COUNTYFP: "029",
    NAME: "Cloud",
    STATEFP: "20",
  },
  {
    COUNTYFP: "167",
    NAME: "Russell",
    STATEFP: "20",
  },
  {
    COUNTYFP: "089",
    NAME: "Jewell",
    STATEFP: "20",
  },
  {
    COUNTYFP: "123",
    NAME: "Mitchell",
    STATEFP: "20",
  },
  {
    COUNTYFP: "171",
    NAME: "Scott",
    STATEFP: "20",
  },
  {
    COUNTYFP: "189",
    NAME: "Stevens",
    STATEFP: "20",
  },
  {
    COUNTYFP: "033",
    NAME: "Comanche",
    STATEFP: "20",
  },
  {
    COUNTYFP: "145",
    NAME: "Pawnee",
    STATEFP: "20",
  },
  {
    COUNTYFP: "065",
    NAME: "Graham",
    STATEFP: "20",
  },
  {
    COUNTYFP: "129",
    NAME: "Morton",
    STATEFP: "20",
  },
  {
    COUNTYFP: "063",
    NAME: "Gove",
    STATEFP: "20",
  },
  {
    COUNTYFP: "133",
    NAME: "Neosho",
    STATEFP: "20",
  },
  {
    COUNTYFP: "013",
    NAME: "Brown",
    STATEFP: "20",
  },
  {
    COUNTYFP: "011",
    NAME: "Bourbon",
    STATEFP: "20",
  },
  {
    COUNTYFP: "027",
    NAME: "Clay",
    STATEFP: "20",
  },
  {
    COUNTYFP: "105",
    NAME: "Lincoln",
    STATEFP: "20",
  },
  {
    COUNTYFP: "183",
    NAME: "Smith",
    STATEFP: "20",
  },
  {
    COUNTYFP: "127",
    NAME: "Morris",
    STATEFP: "20",
  },
  {
    COUNTYFP: "007",
    NAME: "Barber",
    STATEFP: "20",
  },
  {
    COUNTYFP: "109",
    NAME: "Logan",
    STATEFP: "20",
  },
  {
    COUNTYFP: "003",
    NAME: "Anderson",
    STATEFP: "20",
  },
  {
    COUNTYFP: "117",
    NAME: "Marshall",
    STATEFP: "20",
  },
  {
    COUNTYFP: "203",
    NAME: "Wichita",
    STATEFP: "20",
  },
  {
    COUNTYFP: "067",
    NAME: "Grant",
    STATEFP: "20",
  },
  {
    COUNTYFP: "019",
    NAME: "Chautauqua",
    STATEFP: "20",
  },
  {
    COUNTYFP: "163",
    NAME: "Rooks",
    STATEFP: "20",
  },
  {
    COUNTYFP: "069",
    NAME: "Gray",
    STATEFP: "20",
  },
  {
    COUNTYFP: "017",
    NAME: "Chase",
    STATEFP: "20",
  },
  {
    COUNTYFP: "207",
    NAME: "Woodson",
    STATEFP: "20",
  },
  {
    COUNTYFP: "153",
    NAME: "Rawlins",
    STATEFP: "20",
  },
  {
    COUNTYFP: "193",
    NAME: "Thomas",
    STATEFP: "20",
  },
  {
    COUNTYFP: "159",
    NAME: "Rice",
    STATEFP: "20",
  },
  {
    COUNTYFP: "135",
    NAME: "Ness",
    STATEFP: "20",
  },
  {
    COUNTYFP: "205",
    NAME: "Wilson",
    STATEFP: "20",
  },
  {
    COUNTYFP: "141",
    NAME: "Osborne",
    STATEFP: "20",
  },
  {
    COUNTYFP: "025",
    NAME: "Clark",
    STATEFP: "20",
  },
  {
    COUNTYFP: "081",
    NAME: "Haskell",
    STATEFP: "20",
  },
  {
    COUNTYFP: "185",
    NAME: "Stafford",
    STATEFP: "20",
  },
  {
    COUNTYFP: "041",
    NAME: "Dickinson",
    STATEFP: "20",
  },
  {
    COUNTYFP: "047",
    NAME: "Edwards",
    STATEFP: "20",
  },
  {
    COUNTYFP: "179",
    NAME: "Sheridan",
    STATEFP: "20",
  },
  {
    COUNTYFP: "097",
    NAME: "Kiowa",
    STATEFP: "20",
  },
  {
    COUNTYFP: "077",
    NAME: "Harper",
    STATEFP: "20",
  },
  {
    COUNTYFP: "201",
    NAME: "Washington",
    STATEFP: "20",
  },
  {
    COUNTYFP: "049",
    NAME: "Elk",
    STATEFP: "20",
  },
  {
    COUNTYFP: "131",
    NAME: "Nemaha",
    STATEFP: "20",
  },
  {
    COUNTYFP: "137",
    NAME: "Norton",
    STATEFP: "20",
  },
  {
    COUNTYFP: "031",
    NAME: "Coffey",
    STATEFP: "20",
  },
  {
    COUNTYFP: "053",
    NAME: "Ellsworth",
    STATEFP: "20",
  },
  {
    COUNTYFP: "083",
    NAME: "Hodgeman",
    STATEFP: "20",
  },
  {
    COUNTYFP: "119",
    NAME: "Meade",
    STATEFP: "20",
  },
  {
    COUNTYFP: "125",
    NAME: "Montgomery",
    STATEFP: "20",
  },
  {
    COUNTYFP: "057",
    NAME: "Ford",
    STATEFP: "20",
  },
  {
    COUNTYFP: "111",
    NAME: "Lyon",
    STATEFP: "20",
  },
  {
    COUNTYFP: "055",
    NAME: "Finney",
    STATEFP: "20",
  },
  {
    COUNTYFP: "093",
    NAME: "Kearny",
    STATEFP: "20",
  },
  {
    COUNTYFP: "009",
    NAME: "Barton",
    STATEFP: "20",
  },
  {
    COUNTYFP: "051",
    NAME: "Ellis",
    STATEFP: "20",
  },
  {
    COUNTYFP: "155",
    NAME: "Reno",
    STATEFP: "20",
  },
  {
    COUNTYFP: "175",
    NAME: "Seward",
    STATEFP: "20",
  },
  {
    COUNTYFP: "113",
    NAME: "McPherson",
    STATEFP: "20",
  },
  {
    COUNTYFP: "099",
    NAME: "Labette",
    STATEFP: "20",
  },
  {
    COUNTYFP: "037",
    NAME: "Crawford",
    STATEFP: "20",
  },
  {
    COUNTYFP: "143",
    NAME: "Ottawa",
    STATEFP: "20",
  },
  {
    COUNTYFP: "169",
    NAME: "Saline",
    STATEFP: "20",
  },
  {
    COUNTYFP: "139",
    NAME: "Osage",
    STATEFP: "20",
  },
  {
    COUNTYFP: "177",
    NAME: "Shawnee",
    STATEFP: "20",
  },
  {
    COUNTYFP: "197",
    NAME: "Wabaunsee",
    STATEFP: "20",
  },
  {
    COUNTYFP: "085",
    NAME: "Jackson",
    STATEFP: "20",
  },
  {
    COUNTYFP: "087",
    NAME: "Jefferson",
    STATEFP: "20",
  },
  {
    COUNTYFP: "005",
    NAME: "Atchison",
    STATEFP: "20",
  },
  {
    COUNTYFP: "091",
    NAME: "Johnson",
    STATEFP: "20",
  },
  {
    COUNTYFP: "121",
    NAME: "Miami",
    STATEFP: "20",
  },
  {
    COUNTYFP: "107",
    NAME: "Linn",
    STATEFP: "20",
  },
  {
    COUNTYFP: "103",
    NAME: "Leavenworth",
    STATEFP: "20",
  },
  {
    COUNTYFP: "045",
    NAME: "Douglas",
    STATEFP: "20",
  },
  {
    COUNTYFP: "059",
    NAME: "Franklin",
    STATEFP: "20",
  },
  {
    COUNTYFP: "043",
    NAME: "Doniphan",
    STATEFP: "20",
  },
  {
    COUNTYFP: "061",
    NAME: "Geary",
    STATEFP: "20",
  },
  {
    COUNTYFP: "161",
    NAME: "Riley",
    STATEFP: "20",
  },
  {
    COUNTYFP: "149",
    NAME: "Pottawatomie",
    STATEFP: "20",
  },
  {
    COUNTYFP: "053",
    NAME: "Clinton",
    STATEFP: "21",
  },
  {
    COUNTYFP: "231",
    NAME: "Wayne",
    STATEFP: "21",
  },
  {
    COUNTYFP: "001",
    NAME: "Adair",
    STATEFP: "21",
  },
  {
    COUNTYFP: "097",
    NAME: "Harrison",
    STATEFP: "21",
  },
  {
    COUNTYFP: "193",
    NAME: "Perry",
    STATEFP: "21",
  },
  {
    COUNTYFP: "055",
    NAME: "Crittenden",
    STATEFP: "21",
  },
  {
    COUNTYFP: "119",
    NAME: "Knott",
    STATEFP: "21",
  },
  {
    COUNTYFP: "127",
    NAME: "Lawrence",
    STATEFP: "21",
  },
  {
    COUNTYFP: "175",
    NAME: "Morgan",
    STATEFP: "21",
  },
  {
    COUNTYFP: "087",
    NAME: "Green",
    STATEFP: "21",
  },
  {
    COUNTYFP: "237",
    NAME: "Wolfe",
    STATEFP: "21",
  },
  {
    COUNTYFP: "201",
    NAME: "Robertson",
    STATEFP: "21",
  },
  {
    COUNTYFP: "129",
    NAME: "Lee",
    STATEFP: "21",
  },
  {
    COUNTYFP: "159",
    NAME: "Martin",
    STATEFP: "21",
  },
  {
    COUNTYFP: "189",
    NAME: "Owsley",
    STATEFP: "21",
  },
  {
    COUNTYFP: "051",
    NAME: "Clay",
    STATEFP: "21",
  },
  {
    COUNTYFP: "095",
    NAME: "Harlan",
    STATEFP: "21",
  },
  {
    COUNTYFP: "063",
    NAME: "Elliott",
    STATEFP: "21",
  },
  {
    COUNTYFP: "197",
    NAME: "Powell",
    STATEFP: "21",
  },
  {
    COUNTYFP: "171",
    NAME: "Monroe",
    STATEFP: "21",
  },
  {
    COUNTYFP: "141",
    NAME: "Logan",
    STATEFP: "21",
  },
  {
    COUNTYFP: "071",
    NAME: "Floyd",
    STATEFP: "21",
  },
  {
    COUNTYFP: "065",
    NAME: "Estill",
    STATEFP: "21",
  },
  {
    COUNTYFP: "229",
    NAME: "Washington",
    STATEFP: "21",
  },
  {
    COUNTYFP: "039",
    NAME: "Carlisle",
    STATEFP: "21",
  },
  {
    COUNTYFP: "183",
    NAME: "Ohio",
    STATEFP: "21",
  },
  {
    COUNTYFP: "043",
    NAME: "Carter",
    STATEFP: "21",
  },
  {
    COUNTYFP: "195",
    NAME: "Pike",
    STATEFP: "21",
  },
  {
    COUNTYFP: "025",
    NAME: "Breathitt",
    STATEFP: "21",
  },
  {
    COUNTYFP: "105",
    NAME: "Hickman",
    STATEFP: "21",
  },
  {
    COUNTYFP: "225",
    NAME: "Union",
    STATEFP: "21",
  },
  {
    COUNTYFP: "131",
    NAME: "Leslie",
    STATEFP: "21",
  },
  {
    COUNTYFP: "143",
    NAME: "Lyon",
    STATEFP: "21",
  },
  {
    COUNTYFP: "155",
    NAME: "Marion",
    STATEFP: "21",
  },
  {
    COUNTYFP: "069",
    NAME: "Fleming",
    STATEFP: "21",
  },
  {
    COUNTYFP: "033",
    NAME: "Caldwell",
    STATEFP: "21",
  },
  {
    COUNTYFP: "079",
    NAME: "Garrard",
    STATEFP: "21",
  },
  {
    COUNTYFP: "045",
    NAME: "Casey",
    STATEFP: "21",
  },
  {
    COUNTYFP: "207",
    NAME: "Russell",
    STATEFP: "21",
  },
  {
    COUNTYFP: "187",
    NAME: "Owen",
    STATEFP: "21",
  },
  {
    COUNTYFP: "181",
    NAME: "Nicholas",
    STATEFP: "21",
  },
  {
    COUNTYFP: "115",
    NAME: "Johnson",
    STATEFP: "21",
  },
  {
    COUNTYFP: "233",
    NAME: "Webster",
    STATEFP: "21",
  },
  {
    COUNTYFP: "109",
    NAME: "Jackson",
    STATEFP: "21",
  },
  {
    COUNTYFP: "167",
    NAME: "Mercer",
    STATEFP: "21",
  },
  {
    COUNTYFP: "135",
    NAME: "Lewis",
    STATEFP: "21",
  },
  {
    COUNTYFP: "157",
    NAME: "Marshall",
    STATEFP: "21",
  },
  {
    COUNTYFP: "099",
    NAME: "Hart",
    STATEFP: "21",
  },
  {
    COUNTYFP: "057",
    NAME: "Cumberland",
    STATEFP: "21",
  },
  {
    COUNTYFP: "085",
    NAME: "Grayson",
    STATEFP: "21",
  },
  {
    COUNTYFP: "153",
    NAME: "Magoffin",
    STATEFP: "21",
  },
  {
    COUNTYFP: "219",
    NAME: "Todd",
    STATEFP: "21",
  },
  {
    COUNTYFP: "027",
    NAME: "Breckinridge",
    STATEFP: "21",
  },
  {
    COUNTYFP: "213",
    NAME: "Simpson",
    STATEFP: "21",
  },
  {
    COUNTYFP: "205",
    NAME: "Rowan",
    STATEFP: "21",
  },
  {
    COUNTYFP: "041",
    NAME: "Carroll",
    STATEFP: "21",
  },
  {
    COUNTYFP: "147",
    NAME: "McCreary",
    STATEFP: "21",
  },
  {
    COUNTYFP: "133",
    NAME: "Letcher",
    STATEFP: "21",
  },
  {
    COUNTYFP: "217",
    NAME: "Taylor",
    STATEFP: "21",
  },
  {
    COUNTYFP: "177",
    NAME: "Muhlenberg",
    STATEFP: "21",
  },
  {
    COUNTYFP: "221",
    NAME: "Trigg",
    STATEFP: "21",
  },
  {
    COUNTYFP: "047",
    NAME: "Christian",
    STATEFP: "21",
  },
  {
    COUNTYFP: "021",
    NAME: "Boyle",
    STATEFP: "21",
  },
  {
    COUNTYFP: "137",
    NAME: "Lincoln",
    STATEFP: "21",
  },
  {
    COUNTYFP: "101",
    NAME: "Henderson",
    STATEFP: "21",
  },
  {
    COUNTYFP: "235",
    NAME: "Whitley",
    STATEFP: "21",
  },
  {
    COUNTYFP: "121",
    NAME: "Knox",
    STATEFP: "21",
  },
  {
    COUNTYFP: "125",
    NAME: "Laurel",
    STATEFP: "21",
  },
  {
    COUNTYFP: "107",
    NAME: "Hopkins",
    STATEFP: "21",
  },
  {
    COUNTYFP: "013",
    NAME: "Bell",
    STATEFP: "21",
  },
  {
    COUNTYFP: "035",
    NAME: "Calloway",
    STATEFP: "21",
  },
  {
    COUNTYFP: "091",
    NAME: "Hancock",
    STATEFP: "21",
  },
  {
    COUNTYFP: "059",
    NAME: "Daviess",
    STATEFP: "21",
  },
  {
    COUNTYFP: "149",
    NAME: "McLean",
    STATEFP: "21",
  },
  {
    COUNTYFP: "199",
    NAME: "Pulaski",
    STATEFP: "21",
  },
  {
    COUNTYFP: "083",
    NAME: "Graves",
    STATEFP: "21",
  },
  {
    COUNTYFP: "145",
    NAME: "McCracken",
    STATEFP: "21",
  },
  {
    COUNTYFP: "007",
    NAME: "Ballard",
    STATEFP: "21",
  },
  {
    COUNTYFP: "139",
    NAME: "Livingston",
    STATEFP: "21",
  },
  {
    COUNTYFP: "003",
    NAME: "Allen",
    STATEFP: "21",
  },
  {
    COUNTYFP: "061",
    NAME: "Edmonson",
    STATEFP: "21",
  },
  {
    COUNTYFP: "031",
    NAME: "Butler",
    STATEFP: "21",
  },
  {
    COUNTYFP: "227",
    NAME: "Warren",
    STATEFP: "21",
  },
  {
    COUNTYFP: "169",
    NAME: "Metcalfe",
    STATEFP: "21",
  },
  {
    COUNTYFP: "009",
    NAME: "Barren",
    STATEFP: "21",
  },
  {
    COUNTYFP: "089",
    NAME: "Greenup",
    STATEFP: "21",
  },
  {
    COUNTYFP: "019",
    NAME: "Boyd",
    STATEFP: "21",
  },
  {
    COUNTYFP: "077",
    NAME: "Gallatin",
    STATEFP: "21",
  },
  {
    COUNTYFP: "117",
    NAME: "Kenton",
    STATEFP: "21",
  },
  {
    COUNTYFP: "081",
    NAME: "Grant",
    STATEFP: "21",
  },
  {
    COUNTYFP: "005",
    NAME: "Anderson",
    STATEFP: "21",
  },
  {
    COUNTYFP: "073",
    NAME: "Franklin",
    STATEFP: "21",
  },
  {
    COUNTYFP: "209",
    NAME: "Scott",
    STATEFP: "21",
  },
  {
    COUNTYFP: "017",
    NAME: "Bourbon",
    STATEFP: "21",
  },
  {
    COUNTYFP: "113",
    NAME: "Jessamine",
    STATEFP: "21",
  },
  {
    COUNTYFP: "049",
    NAME: "Clark",
    STATEFP: "21",
  },
  {
    COUNTYFP: "239",
    NAME: "Woodford",
    STATEFP: "21",
  },
  {
    COUNTYFP: "165",
    NAME: "Menifee",
    STATEFP: "21",
  },
  {
    COUNTYFP: "011",
    NAME: "Bath",
    STATEFP: "21",
  },
  {
    COUNTYFP: "173",
    NAME: "Montgomery",
    STATEFP: "21",
  },
  {
    COUNTYFP: "151",
    NAME: "Madison",
    STATEFP: "21",
  },
  {
    COUNTYFP: "203",
    NAME: "Rockcastle",
    STATEFP: "21",
  },
  {
    COUNTYFP: "179",
    NAME: "Nelson",
    STATEFP: "21",
  },
  {
    COUNTYFP: "163",
    NAME: "Meade",
    STATEFP: "21",
  },
  {
    COUNTYFP: "123",
    NAME: "Larue",
    STATEFP: "21",
  },
  {
    COUNTYFP: "093",
    NAME: "Hardin",
    STATEFP: "21",
  },
  {
    COUNTYFP: "029",
    NAME: "Bullitt",
    STATEFP: "21",
  },
  {
    COUNTYFP: "103",
    NAME: "Henry",
    STATEFP: "21",
  },
  {
    COUNTYFP: "211",
    NAME: "Shelby",
    STATEFP: "21",
  },
  {
    COUNTYFP: "185",
    NAME: "Oldham",
    STATEFP: "21",
  },
  {
    COUNTYFP: "223",
    NAME: "Trimble",
    STATEFP: "21",
  },
  {
    COUNTYFP: "215",
    NAME: "Spencer",
    STATEFP: "21",
  },
  {
    COUNTYFP: "075",
    NAME: "Fulton",
    STATEFP: "21",
  },
  {
    COUNTYFP: "015",
    NAME: "Boone",
    STATEFP: "21",
  },
  {
    COUNTYFP: "023",
    NAME: "Bracken",
    STATEFP: "21",
  },
  {
    COUNTYFP: "037",
    NAME: "Campbell",
    STATEFP: "21",
  },
  {
    COUNTYFP: "191",
    NAME: "Pendleton",
    STATEFP: "21",
  },
  {
    COUNTYFP: "161",
    NAME: "Mason",
    STATEFP: "21",
  },
  {
    COUNTYFP: "021",
    NAME: "Caldwell",
    STATEFP: "22",
  },
  {
    COUNTYFP: "107",
    NAME: "Tensas",
    STATEFP: "22",
  },
  {
    COUNTYFP: "049",
    NAME: "Jackson",
    STATEFP: "22",
  },
  {
    COUNTYFP: "035",
    NAME: "East Carroll",
    STATEFP: "22",
  },
  {
    COUNTYFP: "083",
    NAME: "Richland",
    STATEFP: "22",
  },
  {
    COUNTYFP: "027",
    NAME: "Claiborne",
    STATEFP: "22",
  },
  {
    COUNTYFP: "039",
    NAME: "Evangeline",
    STATEFP: "22",
  },
  {
    COUNTYFP: "059",
    NAME: "LaSalle",
    STATEFP: "22",
  },
  {
    COUNTYFP: "009",
    NAME: "Avoyelles",
    STATEFP: "22",
  },
  {
    COUNTYFP: "127",
    NAME: "Winn",
    STATEFP: "22",
  },
  {
    COUNTYFP: "025",
    NAME: "Catahoula",
    STATEFP: "22",
  },
  {
    COUNTYFP: "007",
    NAME: "Assumption",
    STATEFP: "22",
  },
  {
    COUNTYFP: "081",
    NAME: "Red River",
    STATEFP: "22",
  },
  {
    COUNTYFP: "085",
    NAME: "Sabine",
    STATEFP: "22",
  },
  {
    COUNTYFP: "065",
    NAME: "Madison",
    STATEFP: "22",
  },
  {
    COUNTYFP: "041",
    NAME: "Franklin",
    STATEFP: "22",
  },
  {
    COUNTYFP: "013",
    NAME: "Bienville",
    STATEFP: "22",
  },
  {
    COUNTYFP: "003",
    NAME: "Allen",
    STATEFP: "22",
  },
  {
    COUNTYFP: "123",
    NAME: "West Carroll",
    STATEFP: "22",
  },
  {
    COUNTYFP: "043",
    NAME: "Grant",
    STATEFP: "22",
  },
  {
    COUNTYFP: "079",
    NAME: "Rapides",
    STATEFP: "22",
  },
  {
    COUNTYFP: "037",
    NAME: "East Feliciana",
    STATEFP: "22",
  },
  {
    COUNTYFP: "047",
    NAME: "Iberville",
    STATEFP: "22",
  },
  {
    COUNTYFP: "077",
    NAME: "Pointe Coupee",
    STATEFP: "22",
  },
  {
    COUNTYFP: "121",
    NAME: "West Baton Rouge",
    STATEFP: "22",
  },
  {
    COUNTYFP: "005",
    NAME: "Ascension",
    STATEFP: "22",
  },
  {
    COUNTYFP: "091",
    NAME: "St. Helena",
    STATEFP: "22",
  },
  {
    COUNTYFP: "125",
    NAME: "West Feliciana",
    STATEFP: "22",
  },
  {
    COUNTYFP: "063",
    NAME: "Livingston",
    STATEFP: "22",
  },
  {
    COUNTYFP: "057",
    NAME: "Lafourche",
    STATEFP: "22",
  },
  {
    COUNTYFP: "029",
    NAME: "Concordia",
    STATEFP: "22",
  },
  {
    COUNTYFP: "069",
    NAME: "Natchitoches",
    STATEFP: "22",
  },
  {
    COUNTYFP: "119",
    NAME: "Webster",
    STATEFP: "22",
  },
  {
    COUNTYFP: "031",
    NAME: "De Soto",
    STATEFP: "22",
  },
  {
    COUNTYFP: "017",
    NAME: "Caddo",
    STATEFP: "22",
  },
  {
    COUNTYFP: "015",
    NAME: "Bossier",
    STATEFP: "22",
  },
  {
    COUNTYFP: "117",
    NAME: "Washington",
    STATEFP: "22",
  },
  {
    COUNTYFP: "105",
    NAME: "Tangipahoa",
    STATEFP: "22",
  },
  {
    COUNTYFP: "087",
    NAME: "St. Bernard",
    STATEFP: "22",
  },
  {
    COUNTYFP: "093",
    NAME: "St. James",
    STATEFP: "22",
  },
  {
    COUNTYFP: "075",
    NAME: "Plaquemines",
    STATEFP: "22",
  },
  {
    COUNTYFP: "089",
    NAME: "St. Charles",
    STATEFP: "22",
  },
  {
    COUNTYFP: "051",
    NAME: "Jefferson",
    STATEFP: "22",
  },
  {
    COUNTYFP: "103",
    NAME: "St. Tammany",
    STATEFP: "22",
  },
  {
    COUNTYFP: "095",
    NAME: "St. John the Baptist",
    STATEFP: "22",
  },
  {
    COUNTYFP: "113",
    NAME: "Vermilion",
    STATEFP: "22",
  },
  {
    COUNTYFP: "099",
    NAME: "St. Martin",
    STATEFP: "22",
  },
  {
    COUNTYFP: "001",
    NAME: "Acadia",
    STATEFP: "22",
  },
  {
    COUNTYFP: "045",
    NAME: "Iberia",
    STATEFP: "22",
  },
  {
    COUNTYFP: "101",
    NAME: "St. Mary",
    STATEFP: "22",
  },
  {
    COUNTYFP: "097",
    NAME: "St. Landry",
    STATEFP: "22",
  },
  {
    COUNTYFP: "053",
    NAME: "Jefferson Davis",
    STATEFP: "22",
  },
  {
    COUNTYFP: "019",
    NAME: "Calcasieu",
    STATEFP: "22",
  },
  {
    COUNTYFP: "023",
    NAME: "Cameron",
    STATEFP: "22",
  },
  {
    COUNTYFP: "067",
    NAME: "Morehouse",
    STATEFP: "22",
  },
  {
    COUNTYFP: "111",
    NAME: "Union",
    STATEFP: "22",
  },
  {
    COUNTYFP: "073",
    NAME: "Ouachita",
    STATEFP: "22",
  },
  {
    COUNTYFP: "061",
    NAME: "Lincoln",
    STATEFP: "22",
  },
  {
    COUNTYFP: "011",
    NAME: "Beauregard",
    STATEFP: "22",
  },
  {
    COUNTYFP: "115",
    NAME: "Vernon",
    STATEFP: "22",
  },
  {
    COUNTYFP: "029",
    NAME: "Washington",
    STATEFP: "23",
  },
  {
    COUNTYFP: "027",
    NAME: "Waldo",
    STATEFP: "23",
  },
  {
    COUNTYFP: "017",
    NAME: "Oxford",
    STATEFP: "23",
  },
  {
    COUNTYFP: "007",
    NAME: "Franklin",
    STATEFP: "23",
  },
  {
    COUNTYFP: "003",
    NAME: "Aroostook",
    STATEFP: "23",
  },
  {
    COUNTYFP: "025",
    NAME: "Somerset",
    STATEFP: "23",
  },
  {
    COUNTYFP: "021",
    NAME: "Piscataquis",
    STATEFP: "23",
  },
  {
    COUNTYFP: "015",
    NAME: "Lincoln",
    STATEFP: "23",
  },
  {
    COUNTYFP: "009",
    NAME: "Hancock",
    STATEFP: "23",
  },
  {
    COUNTYFP: "013",
    NAME: "Knox",
    STATEFP: "23",
  },
  {
    COUNTYFP: "011",
    NAME: "Kennebec",
    STATEFP: "23",
  },
  {
    COUNTYFP: "019",
    NAME: "Penobscot",
    STATEFP: "23",
  },
  {
    COUNTYFP: "001",
    NAME: "Androscoggin",
    STATEFP: "23",
  },
  {
    COUNTYFP: "023",
    NAME: "Sagadahoc",
    STATEFP: "23",
  },
  {
    COUNTYFP: "031",
    NAME: "York",
    STATEFP: "23",
  },
  {
    COUNTYFP: "005",
    NAME: "Cumberland",
    STATEFP: "23",
  },
  {
    COUNTYFP: "023",
    NAME: "Garrett",
    STATEFP: "24",
  },
  {
    COUNTYFP: "017",
    NAME: "Bay",
    STATEFP: "26",
  },
  {
    COUNTYFP: "111",
    NAME: "Midland",
    STATEFP: "26",
  },
  {
    COUNTYFP: "145",
    NAME: "Saginaw",
    STATEFP: "26",
  },
  {
    COUNTYFP: "021",
    NAME: "Berrien",
    STATEFP: "26",
  },
  {
    COUNTYFP: "027",
    NAME: "Cass",
    STATEFP: "26",
  },
  {
    COUNTYFP: "035",
    NAME: "Clare",
    STATEFP: "26",
  },
  {
    COUNTYFP: "153",
    NAME: "Schoolcraft",
    STATEFP: "26",
  },
  {
    COUNTYFP: "003",
    NAME: "Alger",
    STATEFP: "26",
  },
  {
    COUNTYFP: "123",
    NAME: "Newaygo",
    STATEFP: "26",
  },
  {
    COUNTYFP: "151",
    NAME: "Sanilac",
    STATEFP: "26",
  },
  {
    COUNTYFP: "071",
    NAME: "Iron",
    STATEFP: "26",
  },
  {
    COUNTYFP: "131",
    NAME: "Ontonagon",
    STATEFP: "26",
  },
  {
    COUNTYFP: "013",
    NAME: "Baraga",
    STATEFP: "26",
  },
  {
    COUNTYFP: "001",
    NAME: "Alcona",
    STATEFP: "26",
  },
  {
    COUNTYFP: "085",
    NAME: "Lake",
    STATEFP: "26",
  },
  {
    COUNTYFP: "009",
    NAME: "Antrim",
    STATEFP: "26",
  },
  {
    COUNTYFP: "143",
    NAME: "Roscommon",
    STATEFP: "26",
  },
  {
    COUNTYFP: "095",
    NAME: "Luce",
    STATEFP: "26",
  },
  {
    COUNTYFP: "053",
    NAME: "Gogebic",
    STATEFP: "26",
  },
  {
    COUNTYFP: "119",
    NAME: "Montmorency",
    STATEFP: "26",
  },
  {
    COUNTYFP: "135",
    NAME: "Oscoda",
    STATEFP: "26",
  },
  {
    COUNTYFP: "129",
    NAME: "Ogemaw",
    STATEFP: "26",
  },
  {
    COUNTYFP: "157",
    NAME: "Tuscola",
    STATEFP: "26",
  },
  {
    COUNTYFP: "127",
    NAME: "Oceana",
    STATEFP: "26",
  },
  {
    COUNTYFP: "141",
    NAME: "Presque Isle",
    STATEFP: "26",
  },
  {
    COUNTYFP: "137",
    NAME: "Otsego",
    STATEFP: "26",
  },
  {
    COUNTYFP: "063",
    NAME: "Huron",
    STATEFP: "26",
  },
  {
    COUNTYFP: "069",
    NAME: "Iosco",
    STATEFP: "26",
  },
  {
    COUNTYFP: "029",
    NAME: "Charlevoix",
    STATEFP: "26",
  },
  {
    COUNTYFP: "011",
    NAME: "Arenac",
    STATEFP: "26",
  },
  {
    COUNTYFP: "047",
    NAME: "Emmet",
    STATEFP: "26",
  },
  {
    COUNTYFP: "031",
    NAME: "Cheboygan",
    STATEFP: "26",
  },
  {
    COUNTYFP: "051",
    NAME: "Gladwin",
    STATEFP: "26",
  },
  {
    COUNTYFP: "039",
    NAME: "Crawford",
    STATEFP: "26",
  },
  {
    COUNTYFP: "097",
    NAME: "Mackinac",
    STATEFP: "26",
  },
  {
    COUNTYFP: "101",
    NAME: "Manistee",
    STATEFP: "26",
  },
  {
    COUNTYFP: "133",
    NAME: "Osceola",
    STATEFP: "26",
  },
  {
    COUNTYFP: "007",
    NAME: "Alpena",
    STATEFP: "26",
  },
  {
    COUNTYFP: "165",
    NAME: "Wexford",
    STATEFP: "26",
  },
  {
    COUNTYFP: "113",
    NAME: "Missaukee",
    STATEFP: "26",
  },
  {
    COUNTYFP: "023",
    NAME: "Branch",
    STATEFP: "26",
  },
  {
    COUNTYFP: "041",
    NAME: "Delta",
    STATEFP: "26",
  },
  {
    COUNTYFP: "059",
    NAME: "Hillsdale",
    STATEFP: "26",
  },
  {
    COUNTYFP: "083",
    NAME: "Keweenaw",
    STATEFP: "26",
  },
  {
    COUNTYFP: "061",
    NAME: "Houghton",
    STATEFP: "26",
  },
  {
    COUNTYFP: "043",
    NAME: "Dickinson",
    STATEFP: "26",
  },
  {
    COUNTYFP: "075",
    NAME: "Jackson",
    STATEFP: "26",
  },
  {
    COUNTYFP: "105",
    NAME: "Mason",
    STATEFP: "26",
  },
  {
    COUNTYFP: "109",
    NAME: "Menominee",
    STATEFP: "26",
  },
  {
    COUNTYFP: "103",
    NAME: "Marquette",
    STATEFP: "26",
  },
  {
    COUNTYFP: "033",
    NAME: "Chippewa",
    STATEFP: "26",
  },
  {
    COUNTYFP: "089",
    NAME: "Leelanau",
    STATEFP: "26",
  },
  {
    COUNTYFP: "079",
    NAME: "Kalkaska",
    STATEFP: "26",
  },
  {
    COUNTYFP: "019",
    NAME: "Benzie",
    STATEFP: "26",
  },
  {
    COUNTYFP: "055",
    NAME: "Grand Traverse",
    STATEFP: "26",
  },
  {
    COUNTYFP: "057",
    NAME: "Gratiot",
    STATEFP: "26",
  },
  {
    COUNTYFP: "073",
    NAME: "Isabella",
    STATEFP: "26",
  },
  {
    COUNTYFP: "025",
    NAME: "Calhoun",
    STATEFP: "26",
  },
  {
    COUNTYFP: "159",
    NAME: "Van Buren",
    STATEFP: "26",
  },
  {
    COUNTYFP: "077",
    NAME: "Kalamazoo",
    STATEFP: "26",
  },
  {
    COUNTYFP: "149",
    NAME: "St. Joseph",
    STATEFP: "26",
  },
  {
    COUNTYFP: "037",
    NAME: "Clinton",
    STATEFP: "26",
  },
  {
    COUNTYFP: "065",
    NAME: "Ingham",
    STATEFP: "26",
  },
  {
    COUNTYFP: "045",
    NAME: "Eaton",
    STATEFP: "26",
  },
  {
    COUNTYFP: "155",
    NAME: "Shiawassee",
    STATEFP: "26",
  },
  {
    COUNTYFP: "091",
    NAME: "Lenawee",
    STATEFP: "26",
  },
  {
    COUNTYFP: "161",
    NAME: "Washtenaw",
    STATEFP: "26",
  },
  {
    COUNTYFP: "163",
    NAME: "Wayne",
    STATEFP: "26",
  },
  {
    COUNTYFP: "087",
    NAME: "Lapeer",
    STATEFP: "26",
  },
  {
    COUNTYFP: "147",
    NAME: "St. Clair",
    STATEFP: "26",
  },
  {
    COUNTYFP: "093",
    NAME: "Livingston",
    STATEFP: "26",
  },
  {
    COUNTYFP: "099",
    NAME: "Macomb",
    STATEFP: "26",
  },
  {
    COUNTYFP: "125",
    NAME: "Oakland",
    STATEFP: "26",
  },
  {
    COUNTYFP: "049",
    NAME: "Genesee",
    STATEFP: "26",
  },
  {
    COUNTYFP: "115",
    NAME: "Monroe",
    STATEFP: "26",
  },
  {
    COUNTYFP: "107",
    NAME: "Mecosta",
    STATEFP: "26",
  },
  {
    COUNTYFP: "139",
    NAME: "Ottawa",
    STATEFP: "26",
  },
  {
    COUNTYFP: "015",
    NAME: "Barry",
    STATEFP: "26",
  },
  {
    COUNTYFP: "081",
    NAME: "Kent",
    STATEFP: "26",
  },
  {
    COUNTYFP: "117",
    NAME: "Montcalm",
    STATEFP: "26",
  },
  {
    COUNTYFP: "005",
    NAME: "Allegan",
    STATEFP: "26",
  },
  {
    COUNTYFP: "067",
    NAME: "Ionia",
    STATEFP: "26",
  },
  {
    COUNTYFP: "121",
    NAME: "Muskegon",
    STATEFP: "26",
  },
  {
    COUNTYFP: "073",
    NAME: "Lac qui Parle",
    STATEFP: "27",
  },
  {
    COUNTYFP: "153",
    NAME: "Todd",
    STATEFP: "27",
  },
  {
    COUNTYFP: "001",
    NAME: "Aitkin",
    STATEFP: "27",
  },
  {
    COUNTYFP: "057",
    NAME: "Hubbard",
    STATEFP: "27",
  },
  {
    COUNTYFP: "063",
    NAME: "Jackson",
    STATEFP: "27",
  },
  {
    COUNTYFP: "121",
    NAME: "Pope",
    STATEFP: "27",
  },
  {
    COUNTYFP: "133",
    NAME: "Rock",
    STATEFP: "27",
  },
  {
    COUNTYFP: "161",
    NAME: "Waseca",
    STATEFP: "27",
  },
  {
    COUNTYFP: "033",
    NAME: "Cottonwood",
    STATEFP: "27",
  },
  {
    COUNTYFP: "071",
    NAME: "Koochiching",
    STATEFP: "27",
  },
  {
    COUNTYFP: "165",
    NAME: "Watonwan",
    STATEFP: "27",
  },
  {
    COUNTYFP: "005",
    NAME: "Becker",
    STATEFP: "27",
  },
  {
    COUNTYFP: "107",
    NAME: "Norman",
    STATEFP: "27",
  },
  {
    COUNTYFP: "089",
    NAME: "Marshall",
    STATEFP: "27",
  },
  {
    COUNTYFP: "093",
    NAME: "Meeker",
    STATEFP: "27",
  },
  {
    COUNTYFP: "065",
    NAME: "Kanabec",
    STATEFP: "27",
  },
  {
    COUNTYFP: "077",
    NAME: "Lake of the Woods",
    STATEFP: "27",
  },
  {
    COUNTYFP: "081",
    NAME: "Lincoln",
    STATEFP: "27",
  },
  {
    COUNTYFP: "075",
    NAME: "Lake",
    STATEFP: "27",
  },
  {
    COUNTYFP: "101",
    NAME: "Murray",
    STATEFP: "27",
  },
  {
    COUNTYFP: "159",
    NAME: "Wadena",
    STATEFP: "27",
  },
  {
    COUNTYFP: "113",
    NAME: "Pennington",
    STATEFP: "27",
  },
  {
    COUNTYFP: "155",
    NAME: "Traverse",
    STATEFP: "27",
  },
  {
    COUNTYFP: "173",
    NAME: "Yellow Medicine",
    STATEFP: "27",
  },
  {
    COUNTYFP: "151",
    NAME: "Swift",
    STATEFP: "27",
  },
  {
    COUNTYFP: "125",
    NAME: "Red Lake",
    STATEFP: "27",
  },
  {
    COUNTYFP: "029",
    NAME: "Clearwater",
    STATEFP: "27",
  },
  {
    COUNTYFP: "011",
    NAME: "Big Stone",
    STATEFP: "27",
  },
  {
    COUNTYFP: "127",
    NAME: "Redwood",
    STATEFP: "27",
  },
  {
    COUNTYFP: "135",
    NAME: "Roseau",
    STATEFP: "27",
  },
  {
    COUNTYFP: "031",
    NAME: "Cook",
    STATEFP: "27",
  },
  {
    COUNTYFP: "051",
    NAME: "Grant",
    STATEFP: "27",
  },
  {
    COUNTYFP: "023",
    NAME: "Chippewa",
    STATEFP: "27",
  },
  {
    COUNTYFP: "043",
    NAME: "Faribault",
    STATEFP: "27",
  },
  {
    COUNTYFP: "115",
    NAME: "Pine",
    STATEFP: "27",
  },
  {
    COUNTYFP: "099",
    NAME: "Mower",
    STATEFP: "27",
  },
  {
    COUNTYFP: "045",
    NAME: "Fillmore",
    STATEFP: "27",
  },
  {
    COUNTYFP: "039",
    NAME: "Dodge",
    STATEFP: "27",
  },
  {
    COUNTYFP: "109",
    NAME: "Olmsted",
    STATEFP: "27",
  },
  {
    COUNTYFP: "157",
    NAME: "Wabasha",
    STATEFP: "27",
  },
  {
    COUNTYFP: "013",
    NAME: "Blue Earth",
    STATEFP: "27",
  },
  {
    COUNTYFP: "103",
    NAME: "Nicollet",
    STATEFP: "27",
  },
  {
    COUNTYFP: "015",
    NAME: "Brown",
    STATEFP: "27",
  },
  {
    COUNTYFP: "131",
    NAME: "Rice",
    STATEFP: "27",
  },
  {
    COUNTYFP: "085",
    NAME: "McLeod",
    STATEFP: "27",
  },
  {
    COUNTYFP: "095",
    NAME: "Mille Lacs",
    STATEFP: "27",
  },
  {
    COUNTYFP: "143",
    NAME: "Sibley",
    STATEFP: "27",
  },
  {
    COUNTYFP: "171",
    NAME: "Wright",
    STATEFP: "27",
  },
  {
    COUNTYFP: "139",
    NAME: "Scott",
    STATEFP: "27",
  },
  {
    COUNTYFP: "025",
    NAME: "Chisago",
    STATEFP: "27",
  },
  {
    COUNTYFP: "037",
    NAME: "Dakota",
    STATEFP: "27",
  },
  {
    COUNTYFP: "003",
    NAME: "Anoka",
    STATEFP: "27",
  },
  {
    COUNTYFP: "123",
    NAME: "Ramsey",
    STATEFP: "27",
  },
  {
    COUNTYFP: "059",
    NAME: "Isanti",
    STATEFP: "27",
  },
  {
    COUNTYFP: "163",
    NAME: "Washington",
    STATEFP: "27",
  },
  {
    COUNTYFP: "141",
    NAME: "Sherburne",
    STATEFP: "27",
  },
  {
    COUNTYFP: "079",
    NAME: "Le Sueur",
    STATEFP: "27",
  },
  {
    COUNTYFP: "019",
    NAME: "Carver",
    STATEFP: "27",
  },
  {
    COUNTYFP: "053",
    NAME: "Hennepin",
    STATEFP: "27",
  },
  {
    COUNTYFP: "049",
    NAME: "Goodhue",
    STATEFP: "27",
  },
  {
    COUNTYFP: "009",
    NAME: "Benton",
    STATEFP: "27",
  },
  {
    COUNTYFP: "145",
    NAME: "Stearns",
    STATEFP: "27",
  },
  {
    COUNTYFP: "027",
    NAME: "Clay",
    STATEFP: "27",
  },
  {
    COUNTYFP: "167",
    NAME: "Wilkin",
    STATEFP: "27",
  },
  {
    COUNTYFP: "149",
    NAME: "Stevens",
    STATEFP: "27",
  },
  {
    COUNTYFP: "069",
    NAME: "Kittson",
    STATEFP: "27",
  },
  {
    COUNTYFP: "097",
    NAME: "Morrison",
    STATEFP: "27",
  },
  {
    COUNTYFP: "117",
    NAME: "Pipestone",
    STATEFP: "27",
  },
  {
    COUNTYFP: "129",
    NAME: "Renville",
    STATEFP: "27",
  },
  {
    COUNTYFP: "087",
    NAME: "Mahnomen",
    STATEFP: "27",
  },
  {
    COUNTYFP: "047",
    NAME: "Freeborn",
    STATEFP: "27",
  },
  {
    COUNTYFP: "041",
    NAME: "Douglas",
    STATEFP: "27",
  },
  {
    COUNTYFP: "007",
    NAME: "Beltrami",
    STATEFP: "27",
  },
  {
    COUNTYFP: "021",
    NAME: "Cass",
    STATEFP: "27",
  },
  {
    COUNTYFP: "035",
    NAME: "Crow Wing",
    STATEFP: "27",
  },
  {
    COUNTYFP: "137",
    NAME: "St. Louis",
    STATEFP: "27",
  },
  {
    COUNTYFP: "017",
    NAME: "Carlton",
    STATEFP: "27",
  },
  {
    COUNTYFP: "091",
    NAME: "Martin",
    STATEFP: "27",
  },
  {
    COUNTYFP: "111",
    NAME: "Otter Tail",
    STATEFP: "27",
  },
  {
    COUNTYFP: "119",
    NAME: "Polk",
    STATEFP: "27",
  },
  {
    COUNTYFP: "061",
    NAME: "Itasca",
    STATEFP: "27",
  },
  {
    COUNTYFP: "055",
    NAME: "Houston",
    STATEFP: "27",
  },
  {
    COUNTYFP: "083",
    NAME: "Lyon",
    STATEFP: "27",
  },
  {
    COUNTYFP: "147",
    NAME: "Steele",
    STATEFP: "27",
  },
  {
    COUNTYFP: "067",
    NAME: "Kandiyohi",
    STATEFP: "27",
  },
  {
    COUNTYFP: "169",
    NAME: "Winona",
    STATEFP: "27",
  },
  {
    COUNTYFP: "105",
    NAME: "Nobles",
    STATEFP: "27",
  },
  {
    COUNTYFP: "109",
    NAME: "Pearl River",
    STATEFP: "28",
  },
  {
    COUNTYFP: "085",
    NAME: "Lincoln",
    STATEFP: "28",
  },
  {
    COUNTYFP: "127",
    NAME: "Simpson",
    STATEFP: "28",
  },
  {
    COUNTYFP: "121",
    NAME: "Rankin",
    STATEFP: "28",
  },
  {
    COUNTYFP: "163",
    NAME: "Yazoo",
    STATEFP: "28",
  },
  {
    COUNTYFP: "029",
    NAME: "Copiah",
    STATEFP: "28",
  },
  {
    COUNTYFP: "049",
    NAME: "Hinds",
    STATEFP: "28",
  },
  {
    COUNTYFP: "089",
    NAME: "Madison",
    STATEFP: "28",
  },
  {
    COUNTYFP: "149",
    NAME: "Warren",
    STATEFP: "28",
  },
  {
    COUNTYFP: "021",
    NAME: "Claiborne",
    STATEFP: "28",
  },
  {
    COUNTYFP: "009",
    NAME: "Benton",
    STATEFP: "28",
  },
  {
    COUNTYFP: "143",
    NAME: "Tunica",
    STATEFP: "28",
  },
  {
    COUNTYFP: "137",
    NAME: "Tate",
    STATEFP: "28",
  },
  {
    COUNTYFP: "033",
    NAME: "DeSoto",
    STATEFP: "28",
  },
  {
    COUNTYFP: "093",
    NAME: "Marshall",
    STATEFP: "28",
  },
  {
    COUNTYFP: "011",
    NAME: "Bolivar",
    STATEFP: "28",
  },
  {
    COUNTYFP: "133",
    NAME: "Sunflower",
    STATEFP: "28",
  },
  {
    COUNTYFP: "087",
    NAME: "Lowndes",
    STATEFP: "28",
  },
  {
    COUNTYFP: "025",
    NAME: "Clay",
    STATEFP: "28",
  },
  {
    COUNTYFP: "017",
    NAME: "Chickasaw",
    STATEFP: "28",
  },
  {
    COUNTYFP: "145",
    NAME: "Union",
    STATEFP: "28",
  },
  {
    COUNTYFP: "055",
    NAME: "Issaquena",
    STATEFP: "28",
  },
  {
    COUNTYFP: "097",
    NAME: "Montgomery",
    STATEFP: "28",
  },
  {
    COUNTYFP: "019",
    NAME: "Choctaw",
    STATEFP: "28",
  },
  {
    COUNTYFP: "139",
    NAME: "Tippah",
    STATEFP: "28",
  },
  {
    COUNTYFP: "101",
    NAME: "Newton",
    STATEFP: "28",
  },
  {
    COUNTYFP: "135",
    NAME: "Tallahatchie",
    STATEFP: "28",
  },
  {
    COUNTYFP: "125",
    NAME: "Sharkey",
    STATEFP: "28",
  },
  {
    COUNTYFP: "161",
    NAME: "Yalobusha",
    STATEFP: "28",
  },
  {
    COUNTYFP: "131",
    NAME: "Stone",
    STATEFP: "28",
  },
  {
    COUNTYFP: "091",
    NAME: "Marion",
    STATEFP: "28",
  },
  {
    COUNTYFP: "039",
    NAME: "George",
    STATEFP: "28",
  },
  {
    COUNTYFP: "095",
    NAME: "Monroe",
    STATEFP: "28",
  },
  {
    COUNTYFP: "123",
    NAME: "Scott",
    STATEFP: "28",
  },
  {
    COUNTYFP: "051",
    NAME: "Holmes",
    STATEFP: "28",
  },
  {
    COUNTYFP: "031",
    NAME: "Covington",
    STATEFP: "28",
  },
  {
    COUNTYFP: "077",
    NAME: "Lawrence",
    STATEFP: "28",
  },
  {
    COUNTYFP: "007",
    NAME: "Attala",
    STATEFP: "28",
  },
  {
    COUNTYFP: "117",
    NAME: "Prentiss",
    STATEFP: "28",
  },
  {
    COUNTYFP: "013",
    NAME: "Calhoun",
    STATEFP: "28",
  },
  {
    COUNTYFP: "041",
    NAME: "Greene",
    STATEFP: "28",
  },
  {
    COUNTYFP: "129",
    NAME: "Smith",
    STATEFP: "28",
  },
  {
    COUNTYFP: "147",
    NAME: "Walthall",
    STATEFP: "28",
  },
  {
    COUNTYFP: "065",
    NAME: "Jefferson Davis",
    STATEFP: "28",
  },
  {
    COUNTYFP: "155",
    NAME: "Webster",
    STATEFP: "28",
  },
  {
    COUNTYFP: "153",
    NAME: "Wayne",
    STATEFP: "28",
  },
  {
    COUNTYFP: "159",
    NAME: "Winston",
    STATEFP: "28",
  },
  {
    COUNTYFP: "053",
    NAME: "Humphreys",
    STATEFP: "28",
  },
  {
    COUNTYFP: "103",
    NAME: "Noxubee",
    STATEFP: "28",
  },
  {
    COUNTYFP: "107",
    NAME: "Panola",
    STATEFP: "28",
  },
  {
    COUNTYFP: "141",
    NAME: "Tishomingo",
    STATEFP: "28",
  },
  {
    COUNTYFP: "119",
    NAME: "Quitman",
    STATEFP: "28",
  },
  {
    COUNTYFP: "157",
    NAME: "Wilkinson",
    STATEFP: "28",
  },
  {
    COUNTYFP: "079",
    NAME: "Leake",
    STATEFP: "28",
  },
  {
    COUNTYFP: "037",
    NAME: "Franklin",
    STATEFP: "28",
  },
  {
    COUNTYFP: "099",
    NAME: "Neshoba",
    STATEFP: "28",
  },
  {
    COUNTYFP: "063",
    NAME: "Jefferson",
    STATEFP: "28",
  },
  {
    COUNTYFP: "027",
    NAME: "Coahoma",
    STATEFP: "28",
  },
  {
    COUNTYFP: "003",
    NAME: "Alcorn",
    STATEFP: "28",
  },
  {
    COUNTYFP: "151",
    NAME: "Washington",
    STATEFP: "28",
  },
  {
    COUNTYFP: "015",
    NAME: "Carroll",
    STATEFP: "28",
  },
  {
    COUNTYFP: "083",
    NAME: "Leflore",
    STATEFP: "28",
  },
  {
    COUNTYFP: "043",
    NAME: "Grenada",
    STATEFP: "28",
  },
  {
    COUNTYFP: "045",
    NAME: "Hancock",
    STATEFP: "28",
  },
  {
    COUNTYFP: "047",
    NAME: "Harrison",
    STATEFP: "28",
  },
  {
    COUNTYFP: "059",
    NAME: "Jackson",
    STATEFP: "28",
  },
  {
    COUNTYFP: "073",
    NAME: "Lamar",
    STATEFP: "28",
  },
  {
    COUNTYFP: "111",
    NAME: "Perry",
    STATEFP: "28",
  },
  {
    COUNTYFP: "035",
    NAME: "Forrest",
    STATEFP: "28",
  },
  {
    COUNTYFP: "061",
    NAME: "Jasper",
    STATEFP: "28",
  },
  {
    COUNTYFP: "067",
    NAME: "Jones",
    STATEFP: "28",
  },
  {
    COUNTYFP: "113",
    NAME: "Pike",
    STATEFP: "28",
  },
  {
    COUNTYFP: "005",
    NAME: "Amite",
    STATEFP: "28",
  },
  {
    COUNTYFP: "069",
    NAME: "Kemper",
    STATEFP: "28",
  },
  {
    COUNTYFP: "023",
    NAME: "Clarke",
    STATEFP: "28",
  },
  {
    COUNTYFP: "075",
    NAME: "Lauderdale",
    STATEFP: "28",
  },
  {
    COUNTYFP: "001",
    NAME: "Adams",
    STATEFP: "28",
  },
  {
    COUNTYFP: "071",
    NAME: "Lafayette",
    STATEFP: "28",
  },
  {
    COUNTYFP: "105",
    NAME: "Oktibbeha",
    STATEFP: "28",
  },
  {
    COUNTYFP: "115",
    NAME: "Pontotoc",
    STATEFP: "28",
  },
  {
    COUNTYFP: "081",
    NAME: "Lee",
    STATEFP: "28",
  },
  {
    COUNTYFP: "057",
    NAME: "Itawamba",
    STATEFP: "28",
  },
  {
    COUNTYFP: "187",
    NAME: "St. Francois",
    STATEFP: "29",
  },
  {
    COUNTYFP: "071",
    NAME: "Franklin",
    STATEFP: "29",
  },
  {
    COUNTYFP: "183",
    NAME: "St. Charles",
    STATEFP: "29",
  },
  {
    COUNTYFP: "219",
    NAME: "Warren",
    STATEFP: "29",
  },
  {
    COUNTYFP: "189",
    NAME: "St. Louis",
    STATEFP: "29",
  },
  {
    COUNTYFP: "099",
    NAME: "Jefferson",
    STATEFP: "29",
  },
  {
    COUNTYFP: "113",
    NAME: "Lincoln",
    STATEFP: "29",
  },
  {
    COUNTYFP: "209",
    NAME: "Stone",
    STATEFP: "29",
  },
  {
    COUNTYFP: "213",
    NAME: "Taney",
    STATEFP: "29",
  },
  {
    COUNTYFP: "043",
    NAME: "Christian",
    STATEFP: "29",
  },
  {
    COUNTYFP: "225",
    NAME: "Webster",
    STATEFP: "29",
  },
  {
    COUNTYFP: "059",
    NAME: "Dallas",
    STATEFP: "29",
  },
  {
    COUNTYFP: "167",
    NAME: "Polk",
    STATEFP: "29",
  },
  {
    COUNTYFP: "077",
    NAME: "Greene",
    STATEFP: "29",
  },
  {
    COUNTYFP: "173",
    NAME: "Ralls",
    STATEFP: "29",
  },
  {
    COUNTYFP: "127",
    NAME: "Marion",
    STATEFP: "29",
  },
  {
    COUNTYFP: "111",
    NAME: "Lewis",
    STATEFP: "29",
  },
  {
    COUNTYFP: "017",
    NAME: "Bollinger",
    STATEFP: "29",
  },
  {
    COUNTYFP: "031",
    NAME: "Cape Girardeau",
    STATEFP: "29",
  },
  {
    COUNTYFP: "201",
    NAME: "Scott",
    STATEFP: "29",
  },
  {
    COUNTYFP: "145",
    NAME: "Newton",
    STATEFP: "29",
  },
  {
    COUNTYFP: "097",
    NAME: "Jasper",
    STATEFP: "29",
  },
  {
    COUNTYFP: "037",
    NAME: "Cass",
    STATEFP: "29",
  },
  {
    COUNTYFP: "165",
    NAME: "Platte",
    STATEFP: "29",
  },
  {
    COUNTYFP: "177",
    NAME: "Ray",
    STATEFP: "29",
  },
  {
    COUNTYFP: "107",
    NAME: "Lafayette",
    STATEFP: "29",
  },
  {
    COUNTYFP: "025",
    NAME: "Caldwell",
    STATEFP: "29",
  },
  {
    COUNTYFP: "095",
    NAME: "Jackson",
    STATEFP: "29",
  },
  {
    COUNTYFP: "049",
    NAME: "Clinton",
    STATEFP: "29",
  },
  {
    COUNTYFP: "013",
    NAME: "Bates",
    STATEFP: "29",
  },
  {
    COUNTYFP: "047",
    NAME: "Clay",
    STATEFP: "29",
  },
  {
    COUNTYFP: "021",
    NAME: "Buchanan",
    STATEFP: "29",
  },
  {
    COUNTYFP: "003",
    NAME: "Andrew",
    STATEFP: "29",
  },
  {
    COUNTYFP: "063",
    NAME: "DeKalb",
    STATEFP: "29",
  },
  {
    COUNTYFP: "101",
    NAME: "Johnson",
    STATEFP: "29",
  },
  {
    COUNTYFP: "019",
    NAME: "Boone",
    STATEFP: "29",
  },
  {
    COUNTYFP: "007",
    NAME: "Audrain",
    STATEFP: "29",
  },
  {
    COUNTYFP: "175",
    NAME: "Randolph",
    STATEFP: "29",
  },
  {
    COUNTYFP: "083",
    NAME: "Henry",
    STATEFP: "29",
  },
  {
    COUNTYFP: "011",
    NAME: "Barton",
    STATEFP: "29",
  },
  {
    COUNTYFP: "103",
    NAME: "Knox",
    STATEFP: "29",
  },
  {
    COUNTYFP: "117",
    NAME: "Livingston",
    STATEFP: "29",
  },
  {
    COUNTYFP: "123",
    NAME: "Madison",
    STATEFP: "29",
  },
  {
    COUNTYFP: "125",
    NAME: "Maries",
    STATEFP: "29",
  },
  {
    COUNTYFP: "109",
    NAME: "Lawrence",
    STATEFP: "29",
  },
  {
    COUNTYFP: "179",
    NAME: "Reynolds",
    STATEFP: "29",
  },
  {
    COUNTYFP: "005",
    NAME: "Atchison",
    STATEFP: "29",
  },
  {
    COUNTYFP: "081",
    NAME: "Harrison",
    STATEFP: "29",
  },
  {
    COUNTYFP: "067",
    NAME: "Douglas",
    STATEFP: "29",
  },
  {
    COUNTYFP: "093",
    NAME: "Iron",
    STATEFP: "29",
  },
  {
    COUNTYFP: "079",
    NAME: "Grundy",
    STATEFP: "29",
  },
  {
    COUNTYFP: "163",
    NAME: "Pike",
    STATEFP: "29",
  },
  {
    COUNTYFP: "089",
    NAME: "Howard",
    STATEFP: "29",
  },
  {
    COUNTYFP: "221",
    NAME: "Washington",
    STATEFP: "29",
  },
  {
    COUNTYFP: "131",
    NAME: "Miller",
    STATEFP: "29",
  },
  {
    COUNTYFP: "139",
    NAME: "Montgomery",
    STATEFP: "29",
  },
  {
    COUNTYFP: "153",
    NAME: "Ozark",
    STATEFP: "29",
  },
  {
    COUNTYFP: "041",
    NAME: "Chariton",
    STATEFP: "29",
  },
  {
    COUNTYFP: "223",
    NAME: "Wayne",
    STATEFP: "29",
  },
  {
    COUNTYFP: "039",
    NAME: "Cedar",
    STATEFP: "29",
  },
  {
    COUNTYFP: "149",
    NAME: "Oregon",
    STATEFP: "29",
  },
  {
    COUNTYFP: "073",
    NAME: "Gasconade",
    STATEFP: "29",
  },
  {
    COUNTYFP: "087",
    NAME: "Holt",
    STATEFP: "29",
  },
  {
    COUNTYFP: "055",
    NAME: "Crawford",
    STATEFP: "29",
  },
  {
    COUNTYFP: "186",
    NAME: "Ste. Genevieve",
    STATEFP: "29",
  },
  {
    COUNTYFP: "227",
    NAME: "Worth",
    STATEFP: "29",
  },
  {
    COUNTYFP: "085",
    NAME: "Hickory",
    STATEFP: "29",
  },
  {
    COUNTYFP: "009",
    NAME: "Barry",
    STATEFP: "29",
  },
  {
    COUNTYFP: "181",
    NAME: "Ripley",
    STATEFP: "29",
  },
  {
    COUNTYFP: "207",
    NAME: "Stoddard",
    STATEFP: "29",
  },
  {
    COUNTYFP: "075",
    NAME: "Gentry",
    STATEFP: "29",
  },
  {
    COUNTYFP: "171",
    NAME: "Putnam",
    STATEFP: "29",
  },
  {
    COUNTYFP: "033",
    NAME: "Carroll",
    STATEFP: "29",
  },
  {
    COUNTYFP: "217",
    NAME: "Vernon",
    STATEFP: "29",
  },
  {
    COUNTYFP: "015",
    NAME: "Benton",
    STATEFP: "29",
  },
  {
    COUNTYFP: "065",
    NAME: "Dent",
    STATEFP: "29",
  },
  {
    COUNTYFP: "185",
    NAME: "St. Clair",
    STATEFP: "29",
  },
  {
    COUNTYFP: "129",
    NAME: "Mercer",
    STATEFP: "29",
  },
  {
    COUNTYFP: "137",
    NAME: "Monroe",
    STATEFP: "29",
  },
  {
    COUNTYFP: "155",
    NAME: "Pemiscot",
    STATEFP: "29",
  },
  {
    COUNTYFP: "143",
    NAME: "New Madrid",
    STATEFP: "29",
  },
  {
    COUNTYFP: "029",
    NAME: "Camden",
    STATEFP: "29",
  },
  {
    COUNTYFP: "229",
    NAME: "Wright",
    STATEFP: "29",
  },
  {
    COUNTYFP: "053",
    NAME: "Cooper",
    STATEFP: "29",
  },
  {
    COUNTYFP: "211",
    NAME: "Sullivan",
    STATEFP: "29",
  },
  {
    COUNTYFP: "115",
    NAME: "Linn",
    STATEFP: "29",
  },
  {
    COUNTYFP: "215",
    NAME: "Texas",
    STATEFP: "29",
  },
  {
    COUNTYFP: "141",
    NAME: "Morgan",
    STATEFP: "29",
  },
  {
    COUNTYFP: "035",
    NAME: "Carter",
    STATEFP: "29",
  },
  {
    COUNTYFP: "133",
    NAME: "Mississippi",
    STATEFP: "29",
  },
  {
    COUNTYFP: "121",
    NAME: "Macon",
    STATEFP: "29",
  },
  {
    COUNTYFP: "061",
    NAME: "Daviess",
    STATEFP: "29",
  },
  {
    COUNTYFP: "205",
    NAME: "Shelby",
    STATEFP: "29",
  },
  {
    COUNTYFP: "203",
    NAME: "Shannon",
    STATEFP: "29",
  },
  {
    COUNTYFP: "157",
    NAME: "Perry",
    STATEFP: "29",
  },
  {
    COUNTYFP: "057",
    NAME: "Dade",
    STATEFP: "29",
  },
  {
    COUNTYFP: "199",
    NAME: "Scotland",
    STATEFP: "29",
  },
  {
    COUNTYFP: "119",
    NAME: "McDonald",
    STATEFP: "29",
  },
  {
    COUNTYFP: "169",
    NAME: "Pulaski",
    STATEFP: "29",
  },
  {
    COUNTYFP: "045",
    NAME: "Clark",
    STATEFP: "29",
  },
  {
    COUNTYFP: "051",
    NAME: "Cole",
    STATEFP: "29",
  },
  {
    COUNTYFP: "151",
    NAME: "Osage",
    STATEFP: "29",
  },
  {
    COUNTYFP: "135",
    NAME: "Moniteau",
    STATEFP: "29",
  },
  {
    COUNTYFP: "027",
    NAME: "Callaway",
    STATEFP: "29",
  },
  {
    COUNTYFP: "069",
    NAME: "Dunklin",
    STATEFP: "29",
  },
  {
    COUNTYFP: "001",
    NAME: "Adair",
    STATEFP: "29",
  },
  {
    COUNTYFP: "197",
    NAME: "Schuyler",
    STATEFP: "29",
  },
  {
    COUNTYFP: "105",
    NAME: "Laclede",
    STATEFP: "29",
  },
  {
    COUNTYFP: "195",
    NAME: "Saline",
    STATEFP: "29",
  },
  {
    COUNTYFP: "147",
    NAME: "Nodaway",
    STATEFP: "29",
  },
  {
    COUNTYFP: "023",
    NAME: "Butler",
    STATEFP: "29",
  },
  {
    COUNTYFP: "161",
    NAME: "Phelps",
    STATEFP: "29",
  },
  {
    COUNTYFP: "159",
    NAME: "Pettis",
    STATEFP: "29",
  },
  {
    COUNTYFP: "091",
    NAME: "Howell",
    STATEFP: "29",
  },
  {
    COUNTYFP: "065",
    NAME: "Musselshell",
    STATEFP: "30",
  },
  {
    COUNTYFP: "015",
    NAME: "Chouteau",
    STATEFP: "30",
  },
  {
    COUNTYFP: "059",
    NAME: "Meagher",
    STATEFP: "30",
  },
  {
    COUNTYFP: "087",
    NAME: "Rosebud",
    STATEFP: "30",
  },
  {
    COUNTYFP: "097",
    NAME: "Sweet Grass",
    STATEFP: "30",
  },
  {
    COUNTYFP: "073",
    NAME: "Pondera",
    STATEFP: "30",
  },
  {
    COUNTYFP: "033",
    NAME: "Garfield",
    STATEFP: "30",
  },
  {
    COUNTYFP: "011",
    NAME: "Carter",
    STATEFP: "30",
  },
  {
    COUNTYFP: "051",
    NAME: "Liberty",
    STATEFP: "30",
  },
  {
    COUNTYFP: "027",
    NAME: "Fergus",
    STATEFP: "30",
  },
  {
    COUNTYFP: "007",
    NAME: "Broadwater",
    STATEFP: "30",
  },
  {
    COUNTYFP: "003",
    NAME: "Big Horn",
    STATEFP: "30",
  },
  {
    COUNTYFP: "089",
    NAME: "Sanders",
    STATEFP: "30",
  },
  {
    COUNTYFP: "053",
    NAME: "Lincoln",
    STATEFP: "30",
  },
  {
    COUNTYFP: "039",
    NAME: "Granite",
    STATEFP: "30",
  },
  {
    COUNTYFP: "017",
    NAME: "Custer",
    STATEFP: "30",
  },
  {
    COUNTYFP: "083",
    NAME: "Richland",
    STATEFP: "30",
  },
  {
    COUNTYFP: "109",
    NAME: "Wibaux",
    STATEFP: "30",
  },
  {
    COUNTYFP: "107",
    NAME: "Wheatland",
    STATEFP: "30",
  },
  {
    COUNTYFP: "081",
    NAME: "Ravalli",
    STATEFP: "30",
  },
  {
    COUNTYFP: "105",
    NAME: "Valley",
    STATEFP: "30",
  },
  {
    COUNTYFP: "069",
    NAME: "Petroleum",
    STATEFP: "30",
  },
  {
    COUNTYFP: "071",
    NAME: "Phillips",
    STATEFP: "30",
  },
  {
    COUNTYFP: "091",
    NAME: "Sheridan",
    STATEFP: "30",
  },
  {
    COUNTYFP: "019",
    NAME: "Daniels",
    STATEFP: "30",
  },
  {
    COUNTYFP: "079",
    NAME: "Prairie",
    STATEFP: "30",
  },
  {
    COUNTYFP: "057",
    NAME: "Madison",
    STATEFP: "30",
  },
  {
    COUNTYFP: "001",
    NAME: "Beaverhead",
    STATEFP: "30",
  },
  {
    COUNTYFP: "101",
    NAME: "Toole",
    STATEFP: "30",
  },
  {
    COUNTYFP: "005",
    NAME: "Blaine",
    STATEFP: "30",
  },
  {
    COUNTYFP: "045",
    NAME: "Judith Basin",
    STATEFP: "30",
  },
  {
    COUNTYFP: "077",
    NAME: "Powell",
    STATEFP: "30",
  },
  {
    COUNTYFP: "067",
    NAME: "Park",
    STATEFP: "30",
  },
  {
    COUNTYFP: "085",
    NAME: "Roosevelt",
    STATEFP: "30",
  },
  {
    COUNTYFP: "025",
    NAME: "Fallon",
    STATEFP: "30",
  },
  {
    COUNTYFP: "055",
    NAME: "McCone",
    STATEFP: "30",
  },
  {
    COUNTYFP: "095",
    NAME: "Stillwater",
    STATEFP: "30",
  },
  {
    COUNTYFP: "099",
    NAME: "Teton",
    STATEFP: "30",
  },
  {
    COUNTYFP: "021",
    NAME: "Dawson",
    STATEFP: "30",
  },
  {
    COUNTYFP: "075",
    NAME: "Powder River",
    STATEFP: "30",
  },
  {
    COUNTYFP: "035",
    NAME: "Glacier",
    STATEFP: "30",
  },
  {
    COUNTYFP: "047",
    NAME: "Lake",
    STATEFP: "30",
  },
  {
    COUNTYFP: "041",
    NAME: "Hill",
    STATEFP: "30",
  },
  {
    COUNTYFP: "103",
    NAME: "Treasure",
    STATEFP: "30",
  },
  {
    COUNTYFP: "061",
    NAME: "Mineral",
    STATEFP: "30",
  },
  {
    COUNTYFP: "037",
    NAME: "Golden Valley",
    STATEFP: "30",
  },
  {
    COUNTYFP: "111",
    NAME: "Yellowstone",
    STATEFP: "30",
  },
  {
    COUNTYFP: "009",
    NAME: "Carbon",
    STATEFP: "30",
  },
  {
    COUNTYFP: "031",
    NAME: "Gallatin",
    STATEFP: "30",
  },
  {
    COUNTYFP: "013",
    NAME: "Cascade",
    STATEFP: "30",
  },
  {
    COUNTYFP: "049",
    NAME: "Lewis and Clark",
    STATEFP: "30",
  },
  {
    COUNTYFP: "043",
    NAME: "Jefferson",
    STATEFP: "30",
  },
  {
    COUNTYFP: "029",
    NAME: "Flathead",
    STATEFP: "30",
  },
  {
    COUNTYFP: "063",
    NAME: "Missoula",
    STATEFP: "30",
  },
  {
    COUNTYFP: "043",
    NAME: "Dakota",
    STATEFP: "31",
  },
  {
    COUNTYFP: "051",
    NAME: "Dixon",
    STATEFP: "31",
  },
  {
    COUNTYFP: "053",
    NAME: "Dodge",
    STATEFP: "31",
  },
  {
    COUNTYFP: "025",
    NAME: "Cass",
    STATEFP: "31",
  },
  {
    COUNTYFP: "055",
    NAME: "Douglas",
    STATEFP: "31",
  },
  {
    COUNTYFP: "153",
    NAME: "Sarpy",
    STATEFP: "31",
  },
  {
    COUNTYFP: "155",
    NAME: "Saunders",
    STATEFP: "31",
  },
  {
    COUNTYFP: "177",
    NAME: "Washington",
    STATEFP: "31",
  },
  {
    COUNTYFP: "067",
    NAME: "Gage",
    STATEFP: "31",
  },
  {
    COUNTYFP: "109",
    NAME: "Lancaster",
    STATEFP: "31",
  },
  {
    COUNTYFP: "159",
    NAME: "Seward",
    STATEFP: "31",
  },
  {
    COUNTYFP: "139",
    NAME: "Pierce",
    STATEFP: "31",
  },
  {
    COUNTYFP: "119",
    NAME: "Madison",
    STATEFP: "31",
  },
  {
    COUNTYFP: "167",
    NAME: "Stanton",
    STATEFP: "31",
  },
  {
    COUNTYFP: "117",
    NAME: "McPherson",
    STATEFP: "31",
  },
  {
    COUNTYFP: "111",
    NAME: "Lincoln",
    STATEFP: "31",
  },
  {
    COUNTYFP: "113",
    NAME: "Logan",
    STATEFP: "31",
  },
  {
    COUNTYFP: "007",
    NAME: "Banner",
    STATEFP: "31",
  },
  {
    COUNTYFP: "157",
    NAME: "Scotts Bluff",
    STATEFP: "31",
  },
  {
    COUNTYFP: "165",
    NAME: "Sioux",
    STATEFP: "31",
  },
  {
    COUNTYFP: "039",
    NAME: "Cuming",
    STATEFP: "31",
  },
  {
    COUNTYFP: "129",
    NAME: "Nuckolls",
    STATEFP: "31",
  },
  {
    COUNTYFP: "101",
    NAME: "Keith",
    STATEFP: "31",
  },
  {
    COUNTYFP: "137",
    NAME: "Phelps",
    STATEFP: "31",
  },
  {
    COUNTYFP: "181",
    NAME: "Webster",
    STATEFP: "31",
  },
  {
    COUNTYFP: "015",
    NAME: "Boyd",
    STATEFP: "31",
  },
  {
    COUNTYFP: "171",
    NAME: "Thomas",
    STATEFP: "31",
  },
  {
    COUNTYFP: "089",
    NAME: "Holt",
    STATEFP: "31",
  },
  {
    COUNTYFP: "017",
    NAME: "Brown",
    STATEFP: "31",
  },
  {
    COUNTYFP: "103",
    NAME: "Keya Paha",
    STATEFP: "31",
  },
  {
    COUNTYFP: "077",
    NAME: "Greeley",
    STATEFP: "31",
  },
  {
    COUNTYFP: "095",
    NAME: "Jefferson",
    STATEFP: "31",
  },
  {
    COUNTYFP: "151",
    NAME: "Saline",
    STATEFP: "31",
  },
  {
    COUNTYFP: "057",
    NAME: "Dundy",
    STATEFP: "31",
  },
  {
    COUNTYFP: "131",
    NAME: "Otoe",
    STATEFP: "31",
  },
  {
    COUNTYFP: "087",
    NAME: "Hitchcock",
    STATEFP: "31",
  },
  {
    COUNTYFP: "105",
    NAME: "Kimball",
    STATEFP: "31",
  },
  {
    COUNTYFP: "127",
    NAME: "Nemaha",
    STATEFP: "31",
  },
  {
    COUNTYFP: "041",
    NAME: "Custer",
    STATEFP: "31",
  },
  {
    COUNTYFP: "143",
    NAME: "Polk",
    STATEFP: "31",
  },
  {
    COUNTYFP: "045",
    NAME: "Dawes",
    STATEFP: "31",
  },
  {
    COUNTYFP: "179",
    NAME: "Wayne",
    STATEFP: "31",
  },
  {
    COUNTYFP: "071",
    NAME: "Garfield",
    STATEFP: "31",
  },
  {
    COUNTYFP: "013",
    NAME: "Box Butte",
    STATEFP: "31",
  },
  {
    COUNTYFP: "173",
    NAME: "Thurston",
    STATEFP: "31",
  },
  {
    COUNTYFP: "011",
    NAME: "Boone",
    STATEFP: "31",
  },
  {
    COUNTYFP: "145",
    NAME: "Red Willow",
    STATEFP: "31",
  },
  {
    COUNTYFP: "149",
    NAME: "Rock",
    STATEFP: "31",
  },
  {
    COUNTYFP: "005",
    NAME: "Arthur",
    STATEFP: "31",
  },
  {
    COUNTYFP: "085",
    NAME: "Hayes",
    STATEFP: "31",
  },
  {
    COUNTYFP: "097",
    NAME: "Johnson",
    STATEFP: "31",
  },
  {
    COUNTYFP: "003",
    NAME: "Antelope",
    STATEFP: "31",
  },
  {
    COUNTYFP: "163",
    NAME: "Sherman",
    STATEFP: "31",
  },
  {
    COUNTYFP: "161",
    NAME: "Sheridan",
    STATEFP: "31",
  },
  {
    COUNTYFP: "133",
    NAME: "Pawnee",
    STATEFP: "31",
  },
  {
    COUNTYFP: "075",
    NAME: "Grant",
    STATEFP: "31",
  },
  {
    COUNTYFP: "021",
    NAME: "Burt",
    STATEFP: "31",
  },
  {
    COUNTYFP: "009",
    NAME: "Blaine",
    STATEFP: "31",
  },
  {
    COUNTYFP: "027",
    NAME: "Cedar",
    STATEFP: "31",
  },
  {
    COUNTYFP: "169",
    NAME: "Thayer",
    STATEFP: "31",
  },
  {
    COUNTYFP: "049",
    NAME: "Deuel",
    STATEFP: "31",
  },
  {
    COUNTYFP: "123",
    NAME: "Morrill",
    STATEFP: "31",
  },
  {
    COUNTYFP: "115",
    NAME: "Loup",
    STATEFP: "31",
  },
  {
    COUNTYFP: "063",
    NAME: "Frontier",
    STATEFP: "31",
  },
  {
    COUNTYFP: "125",
    NAME: "Nance",
    STATEFP: "31",
  },
  {
    COUNTYFP: "107",
    NAME: "Knox",
    STATEFP: "31",
  },
  {
    COUNTYFP: "135",
    NAME: "Perkins",
    STATEFP: "31",
  },
  {
    COUNTYFP: "037",
    NAME: "Colfax",
    STATEFP: "31",
  },
  {
    COUNTYFP: "023",
    NAME: "Butler",
    STATEFP: "31",
  },
  {
    COUNTYFP: "031",
    NAME: "Cherry",
    STATEFP: "31",
  },
  {
    COUNTYFP: "183",
    NAME: "Wheeler",
    STATEFP: "31",
  },
  {
    COUNTYFP: "061",
    NAME: "Franklin",
    STATEFP: "31",
  },
  {
    COUNTYFP: "029",
    NAME: "Chase",
    STATEFP: "31",
  },
  {
    COUNTYFP: "059",
    NAME: "Fillmore",
    STATEFP: "31",
  },
  {
    COUNTYFP: "185",
    NAME: "York",
    STATEFP: "31",
  },
  {
    COUNTYFP: "035",
    NAME: "Clay",
    STATEFP: "31",
  },
  {
    COUNTYFP: "033",
    NAME: "Cheyenne",
    STATEFP: "31",
  },
  {
    COUNTYFP: "069",
    NAME: "Garden",
    STATEFP: "31",
  },
  {
    COUNTYFP: "083",
    NAME: "Harlan",
    STATEFP: "31",
  },
  {
    COUNTYFP: "091",
    NAME: "Hooker",
    STATEFP: "31",
  },
  {
    COUNTYFP: "147",
    NAME: "Richardson",
    STATEFP: "31",
  },
  {
    COUNTYFP: "065",
    NAME: "Furnas",
    STATEFP: "31",
  },
  {
    COUNTYFP: "175",
    NAME: "Valley",
    STATEFP: "31",
  },
  {
    COUNTYFP: "141",
    NAME: "Platte",
    STATEFP: "31",
  },
  {
    COUNTYFP: "121",
    NAME: "Merrick",
    STATEFP: "31",
  },
  {
    COUNTYFP: "079",
    NAME: "Hall",
    STATEFP: "31",
  },
  {
    COUNTYFP: "081",
    NAME: "Hamilton",
    STATEFP: "31",
  },
  {
    COUNTYFP: "093",
    NAME: "Howard",
    STATEFP: "31",
  },
  {
    COUNTYFP: "001",
    NAME: "Adams",
    STATEFP: "31",
  },
  {
    COUNTYFP: "099",
    NAME: "Kearney",
    STATEFP: "31",
  },
  {
    COUNTYFP: "019",
    NAME: "Buffalo",
    STATEFP: "31",
  },
  {
    COUNTYFP: "073",
    NAME: "Gosper",
    STATEFP: "31",
  },
  {
    COUNTYFP: "047",
    NAME: "Dawson",
    STATEFP: "31",
  },
  {
    COUNTYFP: "019",
    NAME: "Lyon",
    STATEFP: "32",
  },
  {
    COUNTYFP: "005",
    NAME: "Douglas",
    STATEFP: "32",
  },
  {
    COUNTYFP: "031",
    NAME: "Washoe",
    STATEFP: "32",
  },
  {
    COUNTYFP: "029",
    NAME: "Storey",
    STATEFP: "32",
  },
  {
    COUNTYFP: "003",
    NAME: "Clark",
    STATEFP: "32",
  },
  {
    COUNTYFP: "023",
    NAME: "Nye",
    STATEFP: "32",
  },
  {
    COUNTYFP: "021",
    NAME: "Mineral",
    STATEFP: "32",
  },
  {
    COUNTYFP: "033",
    NAME: "White Pine",
    STATEFP: "32",
  },
  {
    COUNTYFP: "015",
    NAME: "Lander",
    STATEFP: "32",
  },
  {
    COUNTYFP: "017",
    NAME: "Lincoln",
    STATEFP: "32",
  },
  {
    COUNTYFP: "027",
    NAME: "Pershing",
    STATEFP: "32",
  },
  {
    COUNTYFP: "009",
    NAME: "Esmeralda",
    STATEFP: "32",
  },
  {
    COUNTYFP: "011",
    NAME: "Eureka",
    STATEFP: "32",
  },
  {
    COUNTYFP: "007",
    NAME: "Elko",
    STATEFP: "32",
  },
  {
    COUNTYFP: "001",
    NAME: "Churchill",
    STATEFP: "32",
  },
  {
    COUNTYFP: "013",
    NAME: "Humboldt",
    STATEFP: "32",
  },
  {
    COUNTYFP: "017",
    NAME: "Strafford",
    STATEFP: "33",
  },
  {
    COUNTYFP: "013",
    NAME: "Merrimack",
    STATEFP: "33",
  },
  {
    COUNTYFP: "001",
    NAME: "Belknap",
    STATEFP: "33",
  },
  {
    COUNTYFP: "003",
    NAME: "Carroll",
    STATEFP: "33",
  },
  {
    COUNTYFP: "007",
    NAME: "Coos",
    STATEFP: "33",
  },
  {
    COUNTYFP: "009",
    NAME: "Grafton",
    STATEFP: "33",
  },
  {
    COUNTYFP: "043",
    NAME: "Sandoval",
    STATEFP: "35",
  },
  {
    COUNTYFP: "061",
    NAME: "Valencia",
    STATEFP: "35",
  },
  {
    COUNTYFP: "057",
    NAME: "Torrance",
    STATEFP: "35",
  },
  {
    COUNTYFP: "001",
    NAME: "Bernalillo",
    STATEFP: "35",
  },
  {
    COUNTYFP: "039",
    NAME: "Rio Arriba",
    STATEFP: "35",
  },
  {
    COUNTYFP: "006",
    NAME: "Cibola",
    STATEFP: "35",
  },
  {
    COUNTYFP: "047",
    NAME: "San Miguel",
    STATEFP: "35",
  },
  {
    COUNTYFP: "028",
    NAME: "Los Alamos",
    STATEFP: "35",
  },
  {
    COUNTYFP: "049",
    NAME: "Santa Fe",
    STATEFP: "35",
  },
  {
    COUNTYFP: "011",
    NAME: "De Baca",
    STATEFP: "35",
  },
  {
    COUNTYFP: "003",
    NAME: "Catron",
    STATEFP: "35",
  },
  {
    COUNTYFP: "059",
    NAME: "Union",
    STATEFP: "35",
  },
  {
    COUNTYFP: "007",
    NAME: "Colfax",
    STATEFP: "35",
  },
  {
    COUNTYFP: "021",
    NAME: "Harding",
    STATEFP: "35",
  },
  {
    COUNTYFP: "023",
    NAME: "Hidalgo",
    STATEFP: "35",
  },
  {
    COUNTYFP: "053",
    NAME: "Socorro",
    STATEFP: "35",
  },
  {
    COUNTYFP: "033",
    NAME: "Mora",
    STATEFP: "35",
  },
  {
    COUNTYFP: "019",
    NAME: "Guadalupe",
    STATEFP: "35",
  },
  {
    COUNTYFP: "051",
    NAME: "Sierra",
    STATEFP: "35",
  },
  {
    COUNTYFP: "037",
    NAME: "Quay",
    STATEFP: "35",
  },
  {
    COUNTYFP: "035",
    NAME: "Otero",
    STATEFP: "35",
  },
  {
    COUNTYFP: "015",
    NAME: "Eddy",
    STATEFP: "35",
  },
  {
    COUNTYFP: "029",
    NAME: "Luna",
    STATEFP: "35",
  },
  {
    COUNTYFP: "045",
    NAME: "San Juan",
    STATEFP: "35",
  },
  {
    COUNTYFP: "031",
    NAME: "McKinley",
    STATEFP: "35",
  },
  {
    COUNTYFP: "025",
    NAME: "Lea",
    STATEFP: "35",
  },
  {
    COUNTYFP: "005",
    NAME: "Chaves",
    STATEFP: "35",
  },
  {
    COUNTYFP: "027",
    NAME: "Lincoln",
    STATEFP: "35",
  },
  {
    COUNTYFP: "017",
    NAME: "Grant",
    STATEFP: "35",
  },
  {
    COUNTYFP: "055",
    NAME: "Taos",
    STATEFP: "35",
  },
  {
    COUNTYFP: "009",
    NAME: "Curry",
    STATEFP: "35",
  },
  {
    COUNTYFP: "041",
    NAME: "Roosevelt",
    STATEFP: "35",
  },
  {
    COUNTYFP: "013",
    NAME: "Doña Ana",
    STATEFP: "35",
  },
  {
    COUNTYFP: "113",
    NAME: "Warren",
    STATEFP: "36",
  },
  {
    COUNTYFP: "115",
    NAME: "Washington",
    STATEFP: "36",
  },
  {
    COUNTYFP: "031",
    NAME: "Essex",
    STATEFP: "36",
  },
  {
    COUNTYFP: "041",
    NAME: "Hamilton",
    STATEFP: "36",
  },
  {
    COUNTYFP: "049",
    NAME: "Lewis",
    STATEFP: "36",
  },
  {
    COUNTYFP: "013",
    NAME: "Chautauqua",
    STATEFP: "36",
  },
  {
    COUNTYFP: "033",
    NAME: "Franklin",
    STATEFP: "36",
  },
  {
    COUNTYFP: "089",
    NAME: "St. Lawrence",
    STATEFP: "36",
  },
  {
    COUNTYFP: "019",
    NAME: "Clinton",
    STATEFP: "36",
  },
  {
    COUNTYFP: "043",
    NAME: "Herkimer",
    STATEFP: "36",
  },
  {
    COUNTYFP: "045",
    NAME: "Jefferson",
    STATEFP: "36",
  },
  {
    COUNTYFP: "037",
    NAME: "Chatham",
    STATEFP: "37",
  },
  {
    COUNTYFP: "115",
    NAME: "Madison",
    STATEFP: "37",
  },
  {
    COUNTYFP: "087",
    NAME: "Haywood",
    STATEFP: "37",
  },
  {
    COUNTYFP: "021",
    NAME: "Buncombe",
    STATEFP: "37",
  },
  {
    COUNTYFP: "089",
    NAME: "Henderson",
    STATEFP: "37",
  },
  {
    COUNTYFP: "175",
    NAME: "Transylvania",
    STATEFP: "37",
  },
  {
    COUNTYFP: "167",
    NAME: "Stanly",
    STATEFP: "37",
  },
  {
    COUNTYFP: "109",
    NAME: "Lincoln",
    STATEFP: "37",
  },
  {
    COUNTYFP: "159",
    NAME: "Rowan",
    STATEFP: "37",
  },
  {
    COUNTYFP: "025",
    NAME: "Cabarrus",
    STATEFP: "37",
  },
  {
    COUNTYFP: "097",
    NAME: "Iredell",
    STATEFP: "37",
  },
  {
    COUNTYFP: "071",
    NAME: "Gaston",
    STATEFP: "37",
  },
  {
    COUNTYFP: "179",
    NAME: "Union",
    STATEFP: "37",
  },
  {
    COUNTYFP: "119",
    NAME: "Mecklenburg",
    STATEFP: "37",
  },
  {
    COUNTYFP: "045",
    NAME: "Cleveland",
    STATEFP: "37",
  },
  {
    COUNTYFP: "005",
    NAME: "Alleghany",
    STATEFP: "37",
  },
  {
    COUNTYFP: "173",
    NAME: "Swain",
    STATEFP: "37",
  },
  {
    COUNTYFP: "011",
    NAME: "Avery",
    STATEFP: "37",
  },
  {
    COUNTYFP: "033",
    NAME: "Caswell",
    STATEFP: "37",
  },
  {
    COUNTYFP: "075",
    NAME: "Graham",
    STATEFP: "37",
  },
  {
    COUNTYFP: "007",
    NAME: "Anson",
    STATEFP: "37",
  },
  {
    COUNTYFP: "149",
    NAME: "Polk",
    STATEFP: "37",
  },
  {
    COUNTYFP: "039",
    NAME: "Cherokee",
    STATEFP: "37",
  },
  {
    COUNTYFP: "113",
    NAME: "Macon",
    STATEFP: "37",
  },
  {
    COUNTYFP: "009",
    NAME: "Ashe",
    STATEFP: "37",
  },
  {
    COUNTYFP: "123",
    NAME: "Montgomery",
    STATEFP: "37",
  },
  {
    COUNTYFP: "043",
    NAME: "Clay",
    STATEFP: "37",
  },
  {
    COUNTYFP: "121",
    NAME: "Mitchell",
    STATEFP: "37",
  },
  {
    COUNTYFP: "199",
    NAME: "Yancey",
    STATEFP: "37",
  },
  {
    COUNTYFP: "189",
    NAME: "Watauga",
    STATEFP: "37",
  },
  {
    COUNTYFP: "099",
    NAME: "Jackson",
    STATEFP: "37",
  },
  {
    COUNTYFP: "161",
    NAME: "Rutherford",
    STATEFP: "37",
  },
  {
    COUNTYFP: "193",
    NAME: "Wilkes",
    STATEFP: "37",
  },
  {
    COUNTYFP: "125",
    NAME: "Moore",
    STATEFP: "37",
  },
  {
    COUNTYFP: "153",
    NAME: "Richmond",
    STATEFP: "37",
  },
  {
    COUNTYFP: "093",
    NAME: "Hoke",
    STATEFP: "37",
  },
  {
    COUNTYFP: "165",
    NAME: "Scotland",
    STATEFP: "37",
  },
  {
    COUNTYFP: "155",
    NAME: "Robeson",
    STATEFP: "37",
  },
  {
    COUNTYFP: "001",
    NAME: "Alamance",
    STATEFP: "37",
  },
  {
    COUNTYFP: "151",
    NAME: "Randolph",
    STATEFP: "37",
  },
  {
    COUNTYFP: "081",
    NAME: "Guilford",
    STATEFP: "37",
  },
  {
    COUNTYFP: "157",
    NAME: "Rockingham",
    STATEFP: "37",
  },
  {
    COUNTYFP: "171",
    NAME: "Surry",
    STATEFP: "37",
  },
  {
    COUNTYFP: "057",
    NAME: "Davidson",
    STATEFP: "37",
  },
  {
    COUNTYFP: "169",
    NAME: "Stokes",
    STATEFP: "37",
  },
  {
    COUNTYFP: "067",
    NAME: "Forsyth",
    STATEFP: "37",
  },
  {
    COUNTYFP: "197",
    NAME: "Yadkin",
    STATEFP: "37",
  },
  {
    COUNTYFP: "059",
    NAME: "Davie",
    STATEFP: "37",
  },
  {
    COUNTYFP: "027",
    NAME: "Caldwell",
    STATEFP: "37",
  },
  {
    COUNTYFP: "003",
    NAME: "Alexander",
    STATEFP: "37",
  },
  {
    COUNTYFP: "035",
    NAME: "Catawba",
    STATEFP: "37",
  },
  {
    COUNTYFP: "023",
    NAME: "Burke",
    STATEFP: "37",
  },
  {
    COUNTYFP: "111",
    NAME: "McDowell",
    STATEFP: "37",
  },
  {
    COUNTYFP: "099",
    NAME: "Walsh",
    STATEFP: "38",
  },
  {
    COUNTYFP: "013",
    NAME: "Burke",
    STATEFP: "38",
  },
  {
    COUNTYFP: "071",
    NAME: "Ramsey",
    STATEFP: "38",
  },
  {
    COUNTYFP: "081",
    NAME: "Sargent",
    STATEFP: "38",
  },
  {
    COUNTYFP: "057",
    NAME: "Mercer",
    STATEFP: "38",
  },
  {
    COUNTYFP: "021",
    NAME: "Dickey",
    STATEFP: "38",
  },
  {
    COUNTYFP: "003",
    NAME: "Barnes",
    STATEFP: "38",
  },
  {
    COUNTYFP: "009",
    NAME: "Bottineau",
    STATEFP: "38",
  },
  {
    COUNTYFP: "005",
    NAME: "Benson",
    STATEFP: "38",
  },
  {
    COUNTYFP: "011",
    NAME: "Bowman",
    STATEFP: "38",
  },
  {
    COUNTYFP: "047",
    NAME: "Logan",
    STATEFP: "38",
  },
  {
    COUNTYFP: "029",
    NAME: "Emmons",
    STATEFP: "38",
  },
  {
    COUNTYFP: "083",
    NAME: "Sheridan",
    STATEFP: "38",
  },
  {
    COUNTYFP: "097",
    NAME: "Traill",
    STATEFP: "38",
  },
  {
    COUNTYFP: "045",
    NAME: "LaMoure",
    STATEFP: "38",
  },
  {
    COUNTYFP: "043",
    NAME: "Kidder",
    STATEFP: "38",
  },
  {
    COUNTYFP: "063",
    NAME: "Nelson",
    STATEFP: "38",
  },
  {
    COUNTYFP: "091",
    NAME: "Steele",
    STATEFP: "38",
  },
  {
    COUNTYFP: "103",
    NAME: "Wells",
    STATEFP: "38",
  },
  {
    COUNTYFP: "039",
    NAME: "Griggs",
    STATEFP: "38",
  },
  {
    COUNTYFP: "087",
    NAME: "Slope",
    STATEFP: "38",
  },
  {
    COUNTYFP: "023",
    NAME: "Divide",
    STATEFP: "38",
  },
  {
    COUNTYFP: "051",
    NAME: "McIntosh",
    STATEFP: "38",
  },
  {
    COUNTYFP: "001",
    NAME: "Adams",
    STATEFP: "38",
  },
  {
    COUNTYFP: "019",
    NAME: "Cavalier",
    STATEFP: "38",
  },
  {
    COUNTYFP: "007",
    NAME: "Billings",
    STATEFP: "38",
  },
  {
    COUNTYFP: "061",
    NAME: "Mountrail",
    STATEFP: "38",
  },
  {
    COUNTYFP: "055",
    NAME: "McLean",
    STATEFP: "38",
  },
  {
    COUNTYFP: "031",
    NAME: "Foster",
    STATEFP: "38",
  },
  {
    COUNTYFP: "067",
    NAME: "Pembina",
    STATEFP: "38",
  },
  {
    COUNTYFP: "069",
    NAME: "Pierce",
    STATEFP: "38",
  },
  {
    COUNTYFP: "027",
    NAME: "Eddy",
    STATEFP: "38",
  },
  {
    COUNTYFP: "041",
    NAME: "Hettinger",
    STATEFP: "38",
  },
  {
    COUNTYFP: "037",
    NAME: "Grant",
    STATEFP: "38",
  },
  {
    COUNTYFP: "053",
    NAME: "McKenzie",
    STATEFP: "38",
  },
  {
    COUNTYFP: "073",
    NAME: "Ransom",
    STATEFP: "38",
  },
  {
    COUNTYFP: "095",
    NAME: "Towner",
    STATEFP: "38",
  },
  {
    COUNTYFP: "033",
    NAME: "Golden Valley",
    STATEFP: "38",
  },
  {
    COUNTYFP: "025",
    NAME: "Dunn",
    STATEFP: "38",
  },
  {
    COUNTYFP: "079",
    NAME: "Rolette",
    STATEFP: "38",
  },
  {
    COUNTYFP: "085",
    NAME: "Sioux",
    STATEFP: "38",
  },
  {
    COUNTYFP: "015",
    NAME: "Burleigh",
    STATEFP: "38",
  },
  {
    COUNTYFP: "059",
    NAME: "Morton",
    STATEFP: "38",
  },
  {
    COUNTYFP: "065",
    NAME: "Oliver",
    STATEFP: "38",
  },
  {
    COUNTYFP: "089",
    NAME: "Stark",
    STATEFP: "38",
  },
  {
    COUNTYFP: "035",
    NAME: "Grand Forks",
    STATEFP: "38",
  },
  {
    COUNTYFP: "093",
    NAME: "Stutsman",
    STATEFP: "38",
  },
  {
    COUNTYFP: "101",
    NAME: "Ward",
    STATEFP: "38",
  },
  {
    COUNTYFP: "049",
    NAME: "McHenry",
    STATEFP: "38",
  },
  {
    COUNTYFP: "075",
    NAME: "Renville",
    STATEFP: "38",
  },
  {
    COUNTYFP: "105",
    NAME: "Williams",
    STATEFP: "38",
  },
  {
    COUNTYFP: "017",
    NAME: "Cass",
    STATEFP: "38",
  },
  {
    COUNTYFP: "077",
    NAME: "Richland",
    STATEFP: "38",
  },
  {
    COUNTYFP: "123",
    NAME: "Ottawa",
    STATEFP: "39",
  },
  {
    COUNTYFP: "051",
    NAME: "Fulton",
    STATEFP: "39",
  },
  {
    COUNTYFP: "095",
    NAME: "Lucas",
    STATEFP: "39",
  },
  {
    COUNTYFP: "173",
    NAME: "Wood",
    STATEFP: "39",
  },
  {
    COUNTYFP: "167",
    NAME: "Washington",
    STATEFP: "39",
  },
  {
    COUNTYFP: "081",
    NAME: "Jefferson",
    STATEFP: "39",
  },
  {
    COUNTYFP: "087",
    NAME: "Lawrence",
    STATEFP: "39",
  },
  {
    COUNTYFP: "145",
    NAME: "Scioto",
    STATEFP: "39",
  },
  {
    COUNTYFP: "029",
    NAME: "Columbiana",
    STATEFP: "39",
  },
  {
    COUNTYFP: "155",
    NAME: "Trumbull",
    STATEFP: "39",
  },
  {
    COUNTYFP: "099",
    NAME: "Mahoning",
    STATEFP: "39",
  },
  {
    COUNTYFP: "107",
    NAME: "Mercer",
    STATEFP: "39",
  },
  {
    COUNTYFP: "003",
    NAME: "Allen",
    STATEFP: "39",
  },
  {
    COUNTYFP: "161",
    NAME: "Van Wert",
    STATEFP: "39",
  },
  {
    COUNTYFP: "011",
    NAME: "Auglaize",
    STATEFP: "39",
  },
  {
    COUNTYFP: "005",
    NAME: "Ashland",
    STATEFP: "39",
  },
  {
    COUNTYFP: "033",
    NAME: "Crawford",
    STATEFP: "39",
  },
  {
    COUNTYFP: "139",
    NAME: "Richland",
    STATEFP: "39",
  },
  {
    COUNTYFP: "115",
    NAME: "Morgan",
    STATEFP: "39",
  },
  {
    COUNTYFP: "163",
    NAME: "Vinton",
    STATEFP: "39",
  },
  {
    COUNTYFP: "125",
    NAME: "Paulding",
    STATEFP: "39",
  },
  {
    COUNTYFP: "069",
    NAME: "Henry",
    STATEFP: "39",
  },
  {
    COUNTYFP: "131",
    NAME: "Pike",
    STATEFP: "39",
  },
  {
    COUNTYFP: "111",
    NAME: "Monroe",
    STATEFP: "39",
  },
  {
    COUNTYFP: "001",
    NAME: "Adams",
    STATEFP: "39",
  },
  {
    COUNTYFP: "067",
    NAME: "Harrison",
    STATEFP: "39",
  },
  {
    COUNTYFP: "135",
    NAME: "Preble",
    STATEFP: "39",
  },
  {
    COUNTYFP: "071",
    NAME: "Highland",
    STATEFP: "39",
  },
  {
    COUNTYFP: "171",
    NAME: "Williams",
    STATEFP: "39",
  },
  {
    COUNTYFP: "175",
    NAME: "Wyandot",
    STATEFP: "39",
  },
  {
    COUNTYFP: "075",
    NAME: "Holmes",
    STATEFP: "39",
  },
  {
    COUNTYFP: "065",
    NAME: "Hardin",
    STATEFP: "39",
  },
  {
    COUNTYFP: "121",
    NAME: "Noble",
    STATEFP: "39",
  },
  {
    COUNTYFP: "137",
    NAME: "Putnam",
    STATEFP: "39",
  },
  {
    COUNTYFP: "105",
    NAME: "Meigs",
    STATEFP: "39",
  },
  {
    COUNTYFP: "009",
    NAME: "Athens",
    STATEFP: "39",
  },
  {
    COUNTYFP: "031",
    NAME: "Coshocton",
    STATEFP: "39",
  },
  {
    COUNTYFP: "039",
    NAME: "Defiance",
    STATEFP: "39",
  },
  {
    COUNTYFP: "143",
    NAME: "Sandusky",
    STATEFP: "39",
  },
  {
    COUNTYFP: "079",
    NAME: "Jackson",
    STATEFP: "39",
  },
  {
    COUNTYFP: "053",
    NAME: "Gallia",
    STATEFP: "39",
  },
  {
    COUNTYFP: "013",
    NAME: "Belmont",
    STATEFP: "39",
  },
  {
    COUNTYFP: "169",
    NAME: "Wayne",
    STATEFP: "39",
  },
  {
    COUNTYFP: "017",
    NAME: "Butler",
    STATEFP: "39",
  },
  {
    COUNTYFP: "015",
    NAME: "Brown",
    STATEFP: "39",
  },
  {
    COUNTYFP: "165",
    NAME: "Warren",
    STATEFP: "39",
  },
  {
    COUNTYFP: "061",
    NAME: "Hamilton",
    STATEFP: "39",
  },
  {
    COUNTYFP: "025",
    NAME: "Clermont",
    STATEFP: "39",
  },
  {
    COUNTYFP: "027",
    NAME: "Clinton",
    STATEFP: "39",
  },
  {
    COUNTYFP: "133",
    NAME: "Portage",
    STATEFP: "39",
  },
  {
    COUNTYFP: "153",
    NAME: "Summit",
    STATEFP: "39",
  },
  {
    COUNTYFP: "007",
    NAME: "Ashtabula",
    STATEFP: "39",
  },
  {
    COUNTYFP: "151",
    NAME: "Stark",
    STATEFP: "39",
  },
  {
    COUNTYFP: "019",
    NAME: "Carroll",
    STATEFP: "39",
  },
  {
    COUNTYFP: "085",
    NAME: "Lake",
    STATEFP: "39",
  },
  {
    COUNTYFP: "035",
    NAME: "Cuyahoga",
    STATEFP: "39",
  },
  {
    COUNTYFP: "103",
    NAME: "Medina",
    STATEFP: "39",
  },
  {
    COUNTYFP: "093",
    NAME: "Lorain",
    STATEFP: "39",
  },
  {
    COUNTYFP: "055",
    NAME: "Geauga",
    STATEFP: "39",
  },
  {
    COUNTYFP: "157",
    NAME: "Tuscarawas",
    STATEFP: "39",
  },
  {
    COUNTYFP: "077",
    NAME: "Huron",
    STATEFP: "39",
  },
  {
    COUNTYFP: "043",
    NAME: "Erie",
    STATEFP: "39",
  },
  {
    COUNTYFP: "091",
    NAME: "Logan",
    STATEFP: "39",
  },
  {
    COUNTYFP: "059",
    NAME: "Guernsey",
    STATEFP: "39",
  },
  {
    COUNTYFP: "141",
    NAME: "Ross",
    STATEFP: "39",
  },
  {
    COUNTYFP: "129",
    NAME: "Pickaway",
    STATEFP: "39",
  },
  {
    COUNTYFP: "073",
    NAME: "Hocking",
    STATEFP: "39",
  },
  {
    COUNTYFP: "041",
    NAME: "Delaware",
    STATEFP: "39",
  },
  {
    COUNTYFP: "117",
    NAME: "Morrow",
    STATEFP: "39",
  },
  {
    COUNTYFP: "127",
    NAME: "Perry",
    STATEFP: "39",
  },
  {
    COUNTYFP: "159",
    NAME: "Union",
    STATEFP: "39",
  },
  {
    COUNTYFP: "045",
    NAME: "Fairfield",
    STATEFP: "39",
  },
  {
    COUNTYFP: "089",
    NAME: "Licking",
    STATEFP: "39",
  },
  {
    COUNTYFP: "097",
    NAME: "Madison",
    STATEFP: "39",
  },
  {
    COUNTYFP: "049",
    NAME: "Franklin",
    STATEFP: "39",
  },
  {
    COUNTYFP: "101",
    NAME: "Marion",
    STATEFP: "39",
  },
  {
    COUNTYFP: "083",
    NAME: "Knox",
    STATEFP: "39",
  },
  {
    COUNTYFP: "047",
    NAME: "Fayette",
    STATEFP: "39",
  },
  {
    COUNTYFP: "119",
    NAME: "Muskingum",
    STATEFP: "39",
  },
  {
    COUNTYFP: "109",
    NAME: "Miami",
    STATEFP: "39",
  },
  {
    COUNTYFP: "057",
    NAME: "Greene",
    STATEFP: "39",
  },
  {
    COUNTYFP: "113",
    NAME: "Montgomery",
    STATEFP: "39",
  },
  {
    COUNTYFP: "037",
    NAME: "Darke",
    STATEFP: "39",
  },
  {
    COUNTYFP: "149",
    NAME: "Shelby",
    STATEFP: "39",
  },
  {
    COUNTYFP: "023",
    NAME: "Clark",
    STATEFP: "39",
  },
  {
    COUNTYFP: "021",
    NAME: "Champaign",
    STATEFP: "39",
  },
  {
    COUNTYFP: "063",
    NAME: "Hancock",
    STATEFP: "39",
  },
  {
    COUNTYFP: "147",
    NAME: "Seneca",
    STATEFP: "39",
  },
  {
    COUNTYFP: "147",
    NAME: "Washington",
    STATEFP: "40",
  },
  {
    COUNTYFP: "101",
    NAME: "Muskogee",
    STATEFP: "40",
  },
  {
    COUNTYFP: "021",
    NAME: "Cherokee",
    STATEFP: "40",
  },
  {
    COUNTYFP: "131",
    NAME: "Rogers",
    STATEFP: "40",
  },
  {
    COUNTYFP: "111",
    NAME: "Okmulgee",
    STATEFP: "40",
  },
  {
    COUNTYFP: "037",
    NAME: "Creek",
    STATEFP: "40",
  },
  {
    COUNTYFP: "145",
    NAME: "Wagoner",
    STATEFP: "40",
  },
  {
    COUNTYFP: "113",
    NAME: "Osage",
    STATEFP: "40",
  },
  {
    COUNTYFP: "117",
    NAME: "Pawnee",
    STATEFP: "40",
  },
  {
    COUNTYFP: "143",
    NAME: "Tulsa",
    STATEFP: "40",
  },
  {
    COUNTYFP: "017",
    NAME: "Canadian",
    STATEFP: "40",
  },
  {
    COUNTYFP: "081",
    NAME: "Lincoln",
    STATEFP: "40",
  },
  {
    COUNTYFP: "109",
    NAME: "Oklahoma",
    STATEFP: "40",
  },
  {
    COUNTYFP: "027",
    NAME: "Cleveland",
    STATEFP: "40",
  },
  {
    COUNTYFP: "083",
    NAME: "Logan",
    STATEFP: "40",
  },
  {
    COUNTYFP: "051",
    NAME: "Grady",
    STATEFP: "40",
  },
  {
    COUNTYFP: "087",
    NAME: "McClain",
    STATEFP: "40",
  },
  {
    COUNTYFP: "125",
    NAME: "Pottawatomie",
    STATEFP: "40",
  },
  {
    COUNTYFP: "115",
    NAME: "Ottawa",
    STATEFP: "40",
  },
  {
    COUNTYFP: "001",
    NAME: "Adair",
    STATEFP: "40",
  },
  {
    COUNTYFP: "095",
    NAME: "Marshall",
    STATEFP: "40",
  },
  {
    COUNTYFP: "059",
    NAME: "Harper",
    STATEFP: "40",
  },
  {
    COUNTYFP: "003",
    NAME: "Alfalfa",
    STATEFP: "40",
  },
  {
    COUNTYFP: "063",
    NAME: "Hughes",
    STATEFP: "40",
  },
  {
    COUNTYFP: "015",
    NAME: "Caddo",
    STATEFP: "40",
  },
  {
    COUNTYFP: "097",
    NAME: "Mayes",
    STATEFP: "40",
  },
  {
    COUNTYFP: "029",
    NAME: "Coal",
    STATEFP: "40",
  },
  {
    COUNTYFP: "055",
    NAME: "Greer",
    STATEFP: "40",
  },
  {
    COUNTYFP: "089",
    NAME: "McCurtain",
    STATEFP: "40",
  },
  {
    COUNTYFP: "005",
    NAME: "Atoka",
    STATEFP: "40",
  },
  {
    COUNTYFP: "133",
    NAME: "Seminole",
    STATEFP: "40",
  },
  {
    COUNTYFP: "151",
    NAME: "Woods",
    STATEFP: "40",
  },
  {
    COUNTYFP: "057",
    NAME: "Harmon",
    STATEFP: "40",
  },
  {
    COUNTYFP: "011",
    NAME: "Blaine",
    STATEFP: "40",
  },
  {
    COUNTYFP: "075",
    NAME: "Kiowa",
    STATEFP: "40",
  },
  {
    COUNTYFP: "085",
    NAME: "Love",
    STATEFP: "40",
  },
  {
    COUNTYFP: "103",
    NAME: "Noble",
    STATEFP: "40",
  },
  {
    COUNTYFP: "149",
    NAME: "Washita",
    STATEFP: "40",
  },
  {
    COUNTYFP: "093",
    NAME: "Major",
    STATEFP: "40",
  },
  {
    COUNTYFP: "041",
    NAME: "Delaware",
    STATEFP: "40",
  },
  {
    COUNTYFP: "045",
    NAME: "Ellis",
    STATEFP: "40",
  },
  {
    COUNTYFP: "069",
    NAME: "Johnston",
    STATEFP: "40",
  },
  {
    COUNTYFP: "127",
    NAME: "Pushmataha",
    STATEFP: "40",
  },
  {
    COUNTYFP: "049",
    NAME: "Garvin",
    STATEFP: "40",
  },
  {
    COUNTYFP: "035",
    NAME: "Craig",
    STATEFP: "40",
  },
  {
    COUNTYFP: "141",
    NAME: "Tillman",
    STATEFP: "40",
  },
  {
    COUNTYFP: "099",
    NAME: "Murray",
    STATEFP: "40",
  },
  {
    COUNTYFP: "105",
    NAME: "Nowata",
    STATEFP: "40",
  },
  {
    COUNTYFP: "061",
    NAME: "Haskell",
    STATEFP: "40",
  },
  {
    COUNTYFP: "025",
    NAME: "Cimarron",
    STATEFP: "40",
  },
  {
    COUNTYFP: "067",
    NAME: "Jefferson",
    STATEFP: "40",
  },
  {
    COUNTYFP: "107",
    NAME: "Okfuskee",
    STATEFP: "40",
  },
  {
    COUNTYFP: "007",
    NAME: "Beaver",
    STATEFP: "40",
  },
  {
    COUNTYFP: "043",
    NAME: "Dewey",
    STATEFP: "40",
  },
  {
    COUNTYFP: "023",
    NAME: "Choctaw",
    STATEFP: "40",
  },
  {
    COUNTYFP: "129",
    NAME: "Roger Mills",
    STATEFP: "40",
  },
  {
    COUNTYFP: "077",
    NAME: "Latimer",
    STATEFP: "40",
  },
  {
    COUNTYFP: "091",
    NAME: "McIntosh",
    STATEFP: "40",
  },
  {
    COUNTYFP: "073",
    NAME: "Kingfisher",
    STATEFP: "40",
  },
  {
    COUNTYFP: "053",
    NAME: "Grant",
    STATEFP: "40",
  },
  {
    COUNTYFP: "123",
    NAME: "Pontotoc",
    STATEFP: "40",
  },
  {
    COUNTYFP: "065",
    NAME: "Jackson",
    STATEFP: "40",
  },
  {
    COUNTYFP: "019",
    NAME: "Carter",
    STATEFP: "40",
  },
  {
    COUNTYFP: "137",
    NAME: "Stephens",
    STATEFP: "40",
  },
  {
    COUNTYFP: "009",
    NAME: "Beckham",
    STATEFP: "40",
  },
  {
    COUNTYFP: "047",
    NAME: "Garfield",
    STATEFP: "40",
  },
  {
    COUNTYFP: "135",
    NAME: "Sequoyah",
    STATEFP: "40",
  },
  {
    COUNTYFP: "079",
    NAME: "Le Flore",
    STATEFP: "40",
  },
  {
    COUNTYFP: "139",
    NAME: "Texas",
    STATEFP: "40",
  },
  {
    COUNTYFP: "033",
    NAME: "Cotton",
    STATEFP: "40",
  },
  {
    COUNTYFP: "031",
    NAME: "Comanche",
    STATEFP: "40",
  },
  {
    COUNTYFP: "121",
    NAME: "Pittsburg",
    STATEFP: "40",
  },
  {
    COUNTYFP: "071",
    NAME: "Kay",
    STATEFP: "40",
  },
  {
    COUNTYFP: "119",
    NAME: "Payne",
    STATEFP: "40",
  },
  {
    COUNTYFP: "039",
    NAME: "Custer",
    STATEFP: "40",
  },
  {
    COUNTYFP: "153",
    NAME: "Woodward",
    STATEFP: "40",
  },
  {
    COUNTYFP: "013",
    NAME: "Bryan",
    STATEFP: "40",
  },
  {
    COUNTYFP: "043",
    NAME: "Linn",
    STATEFP: "41",
  },
  {
    COUNTYFP: "003",
    NAME: "Benton",
    STATEFP: "41",
  },
  {
    COUNTYFP: "005",
    NAME: "Clackamas",
    STATEFP: "41",
  },
  {
    COUNTYFP: "051",
    NAME: "Multnomah",
    STATEFP: "41",
  },
  {
    COUNTYFP: "009",
    NAME: "Columbia",
    STATEFP: "41",
  },
  {
    COUNTYFP: "067",
    NAME: "Washington",
    STATEFP: "41",
  },
  {
    COUNTYFP: "071",
    NAME: "Yamhill",
    STATEFP: "41",
  },
  {
    COUNTYFP: "047",
    NAME: "Marion",
    STATEFP: "41",
  },
  {
    COUNTYFP: "053",
    NAME: "Polk",
    STATEFP: "41",
  },
  {
    COUNTYFP: "017",
    NAME: "Deschutes",
    STATEFP: "41",
  },
  {
    COUNTYFP: "013",
    NAME: "Crook",
    STATEFP: "41",
  },
  {
    COUNTYFP: "045",
    NAME: "Malheur",
    STATEFP: "41",
  },
  {
    COUNTYFP: "033",
    NAME: "Josephine",
    STATEFP: "41",
  },
  {
    COUNTYFP: "029",
    NAME: "Jackson",
    STATEFP: "41",
  },
  {
    COUNTYFP: "063",
    NAME: "Wallowa",
    STATEFP: "41",
  },
  {
    COUNTYFP: "001",
    NAME: "Baker",
    STATEFP: "41",
  },
  {
    COUNTYFP: "023",
    NAME: "Grant",
    STATEFP: "41",
  },
  {
    COUNTYFP: "037",
    NAME: "Lake",
    STATEFP: "41",
  },
  {
    COUNTYFP: "069",
    NAME: "Wheeler",
    STATEFP: "41",
  },
  {
    COUNTYFP: "057",
    NAME: "Tillamook",
    STATEFP: "41",
  },
  {
    COUNTYFP: "025",
    NAME: "Harney",
    STATEFP: "41",
  },
  {
    COUNTYFP: "021",
    NAME: "Gilliam",
    STATEFP: "41",
  },
  {
    COUNTYFP: "031",
    NAME: "Jefferson",
    STATEFP: "41",
  },
  {
    COUNTYFP: "055",
    NAME: "Sherman",
    STATEFP: "41",
  },
  {
    COUNTYFP: "007",
    NAME: "Clatsop",
    STATEFP: "41",
  },
  {
    COUNTYFP: "015",
    NAME: "Curry",
    STATEFP: "41",
  },
  {
    COUNTYFP: "011",
    NAME: "Coos",
    STATEFP: "41",
  },
  {
    COUNTYFP: "039",
    NAME: "Lane",
    STATEFP: "41",
  },
  {
    COUNTYFP: "049",
    NAME: "Morrow",
    STATEFP: "41",
  },
  {
    COUNTYFP: "059",
    NAME: "Umatilla",
    STATEFP: "41",
  },
  {
    COUNTYFP: "027",
    NAME: "Hood River",
    STATEFP: "41",
  },
  {
    COUNTYFP: "035",
    NAME: "Klamath",
    STATEFP: "41",
  },
  {
    COUNTYFP: "061",
    NAME: "Union",
    STATEFP: "41",
  },
  {
    COUNTYFP: "041",
    NAME: "Lincoln",
    STATEFP: "41",
  },
  {
    COUNTYFP: "019",
    NAME: "Douglas",
    STATEFP: "41",
  },
  {
    COUNTYFP: "065",
    NAME: "Wasco",
    STATEFP: "41",
  },
  {
    COUNTYFP: "063",
    NAME: "Indiana",
    STATEFP: "42",
  },
  {
    COUNTYFP: "073",
    NAME: "Lawrence",
    STATEFP: "42",
  },
  {
    COUNTYFP: "007",
    NAME: "Beaver",
    STATEFP: "42",
  },
  {
    COUNTYFP: "019",
    NAME: "Butler",
    STATEFP: "42",
  },
  {
    COUNTYFP: "051",
    NAME: "Fayette",
    STATEFP: "42",
  },
  {
    COUNTYFP: "125",
    NAME: "Washington",
    STATEFP: "42",
  },
  {
    COUNTYFP: "005",
    NAME: "Armstrong",
    STATEFP: "42",
  },
  {
    COUNTYFP: "129",
    NAME: "Westmoreland",
    STATEFP: "42",
  },
  {
    COUNTYFP: "003",
    NAME: "Allegheny",
    STATEFP: "42",
  },
  {
    COUNTYFP: "085",
    NAME: "Mercer",
    STATEFP: "42",
  },
  {
    COUNTYFP: "111",
    NAME: "Somerset",
    STATEFP: "42",
  },
  {
    COUNTYFP: "053",
    NAME: "Forest",
    STATEFP: "42",
  },
  {
    COUNTYFP: "059",
    NAME: "Greene",
    STATEFP: "42",
  },
  {
    COUNTYFP: "031",
    NAME: "Clarion",
    STATEFP: "42",
  },
  {
    COUNTYFP: "049",
    NAME: "Erie",
    STATEFP: "42",
  },
  {
    COUNTYFP: "039",
    NAME: "Crawford",
    STATEFP: "42",
  },
  {
    COUNTYFP: "121",
    NAME: "Venango",
    STATEFP: "42",
  },
  {
    COUNTYFP: "123",
    NAME: "Warren",
    STATEFP: "42",
  },
  {
    COUNTYFP: "043",
    NAME: "Georgetown",
    STATEFP: "45",
  },
  {
    COUNTYFP: "023",
    NAME: "Chester",
    STATEFP: "45",
  },
  {
    COUNTYFP: "091",
    NAME: "York",
    STATEFP: "45",
  },
  {
    COUNTYFP: "057",
    NAME: "Lancaster",
    STATEFP: "45",
  },
  {
    COUNTYFP: "081",
    NAME: "Saluda",
    STATEFP: "45",
  },
  {
    COUNTYFP: "063",
    NAME: "Lexington",
    STATEFP: "45",
  },
  {
    COUNTYFP: "055",
    NAME: "Kershaw",
    STATEFP: "45",
  },
  {
    COUNTYFP: "079",
    NAME: "Richland",
    STATEFP: "45",
  },
  {
    COUNTYFP: "017",
    NAME: "Calhoun",
    STATEFP: "45",
  },
  {
    COUNTYFP: "039",
    NAME: "Fairfield",
    STATEFP: "45",
  },
  {
    COUNTYFP: "071",
    NAME: "Newberry",
    STATEFP: "45",
  },
  {
    COUNTYFP: "075",
    NAME: "Orangeburg",
    STATEFP: "45",
  },
  {
    COUNTYFP: "021",
    NAME: "Cherokee",
    STATEFP: "45",
  },
  {
    COUNTYFP: "059",
    NAME: "Laurens",
    STATEFP: "45",
  },
  {
    COUNTYFP: "007",
    NAME: "Anderson",
    STATEFP: "45",
  },
  {
    COUNTYFP: "077",
    NAME: "Pickens",
    STATEFP: "45",
  },
  {
    COUNTYFP: "045",
    NAME: "Greenville",
    STATEFP: "45",
  },
  {
    COUNTYFP: "047",
    NAME: "Greenwood",
    STATEFP: "45",
  },
  {
    COUNTYFP: "001",
    NAME: "Abbeville",
    STATEFP: "45",
  },
  {
    COUNTYFP: "073",
    NAME: "Oconee",
    STATEFP: "45",
  },
  {
    COUNTYFP: "083",
    NAME: "Spartanburg",
    STATEFP: "45",
  },
  {
    COUNTYFP: "087",
    NAME: "Union",
    STATEFP: "45",
  },
  {
    COUNTYFP: "089",
    NAME: "Williamsburg",
    STATEFP: "45",
  },
  {
    COUNTYFP: "009",
    NAME: "Bamberg",
    STATEFP: "45",
  },
  {
    COUNTYFP: "067",
    NAME: "Marion",
    STATEFP: "45",
  },
  {
    COUNTYFP: "011",
    NAME: "Barnwell",
    STATEFP: "45",
  },
  {
    COUNTYFP: "025",
    NAME: "Chesterfield",
    STATEFP: "45",
  },
  {
    COUNTYFP: "029",
    NAME: "Colleton",
    STATEFP: "45",
  },
  {
    COUNTYFP: "049",
    NAME: "Hampton",
    STATEFP: "45",
  },
  {
    COUNTYFP: "005",
    NAME: "Allendale",
    STATEFP: "45",
  },
  {
    COUNTYFP: "061",
    NAME: "Lee",
    STATEFP: "45",
  },
  {
    COUNTYFP: "027",
    NAME: "Clarendon",
    STATEFP: "45",
  },
  {
    COUNTYFP: "033",
    NAME: "Dillon",
    STATEFP: "45",
  },
  {
    COUNTYFP: "065",
    NAME: "McCormick",
    STATEFP: "45",
  },
  {
    COUNTYFP: "003",
    NAME: "Aiken",
    STATEFP: "45",
  },
  {
    COUNTYFP: "037",
    NAME: "Edgefield",
    STATEFP: "45",
  },
  {
    COUNTYFP: "069",
    NAME: "Marlboro",
    STATEFP: "45",
  },
  {
    COUNTYFP: "035",
    NAME: "Dorchester",
    STATEFP: "45",
  },
  {
    COUNTYFP: "015",
    NAME: "Berkeley",
    STATEFP: "45",
  },
  {
    COUNTYFP: "019",
    NAME: "Charleston",
    STATEFP: "45",
  },
  {
    COUNTYFP: "031",
    NAME: "Darlington",
    STATEFP: "45",
  },
  {
    COUNTYFP: "041",
    NAME: "Florence",
    STATEFP: "45",
  },
  {
    COUNTYFP: "013",
    NAME: "Beaufort",
    STATEFP: "45",
  },
  {
    COUNTYFP: "053",
    NAME: "Jasper",
    STATEFP: "45",
  },
  {
    COUNTYFP: "085",
    NAME: "Sumter",
    STATEFP: "45",
  },
  {
    COUNTYFP: "127",
    NAME: "Union",
    STATEFP: "46",
  },
  {
    COUNTYFP: "027",
    NAME: "Clay",
    STATEFP: "46",
  },
  {
    COUNTYFP: "033",
    NAME: "Custer",
    STATEFP: "46",
  },
  {
    COUNTYFP: "093",
    NAME: "Meade",
    STATEFP: "46",
  },
  {
    COUNTYFP: "103",
    NAME: "Pennington",
    STATEFP: "46",
  },
  {
    COUNTYFP: "081",
    NAME: "Lawrence",
    STATEFP: "46",
  },
  {
    COUNTYFP: "067",
    NAME: "Hutchinson",
    STATEFP: "46",
  },
  {
    COUNTYFP: "101",
    NAME: "Moody",
    STATEFP: "46",
  },
  {
    COUNTYFP: "043",
    NAME: "Douglas",
    STATEFP: "46",
  },
  {
    COUNTYFP: "039",
    NAME: "Deuel",
    STATEFP: "46",
  },
  {
    COUNTYFP: "025",
    NAME: "Clark",
    STATEFP: "46",
  },
  {
    COUNTYFP: "097",
    NAME: "Miner",
    STATEFP: "46",
  },
  {
    COUNTYFP: "073",
    NAME: "Jerauld",
    STATEFP: "46",
  },
  {
    COUNTYFP: "137",
    NAME: "Ziebach",
    STATEFP: "46",
  },
  {
    COUNTYFP: "015",
    NAME: "Brule",
    STATEFP: "46",
  },
  {
    COUNTYFP: "129",
    NAME: "Walworth",
    STATEFP: "46",
  },
  {
    COUNTYFP: "077",
    NAME: "Kingsbury",
    STATEFP: "46",
  },
  {
    COUNTYFP: "055",
    NAME: "Haakon",
    STATEFP: "46",
  },
  {
    COUNTYFP: "041",
    NAME: "Dewey",
    STATEFP: "46",
  },
  {
    COUNTYFP: "079",
    NAME: "Lake",
    STATEFP: "46",
  },
  {
    COUNTYFP: "085",
    NAME: "Lyman",
    STATEFP: "46",
  },
  {
    COUNTYFP: "071",
    NAME: "Jackson",
    STATEFP: "46",
  },
  {
    COUNTYFP: "075",
    NAME: "Jones",
    STATEFP: "46",
  },
  {
    COUNTYFP: "021",
    NAME: "Campbell",
    STATEFP: "46",
  },
  {
    COUNTYFP: "063",
    NAME: "Harding",
    STATEFP: "46",
  },
  {
    COUNTYFP: "009",
    NAME: "Bon Homme",
    STATEFP: "46",
  },
  {
    COUNTYFP: "007",
    NAME: "Bennett",
    STATEFP: "46",
  },
  {
    COUNTYFP: "109",
    NAME: "Roberts",
    STATEFP: "46",
  },
  {
    COUNTYFP: "121",
    NAME: "Todd",
    STATEFP: "46",
  },
  {
    COUNTYFP: "089",
    NAME: "McPherson",
    STATEFP: "46",
  },
  {
    COUNTYFP: "102",
    NAME: "Oglala Lakota",
    STATEFP: "46",
  },
  {
    COUNTYFP: "023",
    NAME: "Charles Mix",
    STATEFP: "46",
  },
  {
    COUNTYFP: "037",
    NAME: "Day",
    STATEFP: "46",
  },
  {
    COUNTYFP: "123",
    NAME: "Tripp",
    STATEFP: "46",
  },
  {
    COUNTYFP: "111",
    NAME: "Sanborn",
    STATEFP: "46",
  },
  {
    COUNTYFP: "031",
    NAME: "Corson",
    STATEFP: "46",
  },
  {
    COUNTYFP: "053",
    NAME: "Gregory",
    STATEFP: "46",
  },
  {
    COUNTYFP: "051",
    NAME: "Grant",
    STATEFP: "46",
  },
  {
    COUNTYFP: "091",
    NAME: "Marshall",
    STATEFP: "46",
  },
  {
    COUNTYFP: "003",
    NAME: "Aurora",
    STATEFP: "46",
  },
  {
    COUNTYFP: "105",
    NAME: "Perkins",
    STATEFP: "46",
  },
  {
    COUNTYFP: "017",
    NAME: "Buffalo",
    STATEFP: "46",
  },
  {
    COUNTYFP: "095",
    NAME: "Mellette",
    STATEFP: "46",
  },
  {
    COUNTYFP: "107",
    NAME: "Potter",
    STATEFP: "46",
  },
  {
    COUNTYFP: "047",
    NAME: "Fall River",
    STATEFP: "46",
  },
  {
    COUNTYFP: "069",
    NAME: "Hyde",
    STATEFP: "46",
  },
  {
    COUNTYFP: "057",
    NAME: "Hamlin",
    STATEFP: "46",
  },
  {
    COUNTYFP: "059",
    NAME: "Hand",
    STATEFP: "46",
  },
  {
    COUNTYFP: "115",
    NAME: "Spink",
    STATEFP: "46",
  },
  {
    COUNTYFP: "049",
    NAME: "Faulk",
    STATEFP: "46",
  },
  {
    COUNTYFP: "019",
    NAME: "Butte",
    STATEFP: "46",
  },
  {
    COUNTYFP: "013",
    NAME: "Brown",
    STATEFP: "46",
  },
  {
    COUNTYFP: "045",
    NAME: "Edmunds",
    STATEFP: "46",
  },
  {
    COUNTYFP: "011",
    NAME: "Brookings",
    STATEFP: "46",
  },
  {
    COUNTYFP: "005",
    NAME: "Beadle",
    STATEFP: "46",
  },
  {
    COUNTYFP: "061",
    NAME: "Hanson",
    STATEFP: "46",
  },
  {
    COUNTYFP: "035",
    NAME: "Davison",
    STATEFP: "46",
  },
  {
    COUNTYFP: "119",
    NAME: "Sully",
    STATEFP: "46",
  },
  {
    COUNTYFP: "117",
    NAME: "Stanley",
    STATEFP: "46",
  },
  {
    COUNTYFP: "065",
    NAME: "Hughes",
    STATEFP: "46",
  },
  {
    COUNTYFP: "099",
    NAME: "Minnehaha",
    STATEFP: "46",
  },
  {
    COUNTYFP: "087",
    NAME: "McCook",
    STATEFP: "46",
  },
  {
    COUNTYFP: "125",
    NAME: "Turner",
    STATEFP: "46",
  },
  {
    COUNTYFP: "083",
    NAME: "Lincoln",
    STATEFP: "46",
  },
  {
    COUNTYFP: "029",
    NAME: "Codington",
    STATEFP: "46",
  },
  {
    COUNTYFP: "135",
    NAME: "Yankton",
    STATEFP: "46",
  },
  {
    COUNTYFP: "099",
    NAME: "Lawrence",
    STATEFP: "47",
  },
  {
    COUNTYFP: "117",
    NAME: "Marshall",
    STATEFP: "47",
  },
  {
    COUNTYFP: "149",
    NAME: "Rutherford",
    STATEFP: "47",
  },
  {
    COUNTYFP: "159",
    NAME: "Smith",
    STATEFP: "47",
  },
  {
    COUNTYFP: "165",
    NAME: "Sumner",
    STATEFP: "47",
  },
  {
    COUNTYFP: "081",
    NAME: "Hickman",
    STATEFP: "47",
  },
  {
    COUNTYFP: "111",
    NAME: "Macon",
    STATEFP: "47",
  },
  {
    COUNTYFP: "043",
    NAME: "Dickson",
    STATEFP: "47",
  },
  {
    COUNTYFP: "187",
    NAME: "Williamson",
    STATEFP: "47",
  },
  {
    COUNTYFP: "015",
    NAME: "Cannon",
    STATEFP: "47",
  },
  {
    COUNTYFP: "021",
    NAME: "Cheatham",
    STATEFP: "47",
  },
  {
    COUNTYFP: "119",
    NAME: "Maury",
    STATEFP: "47",
  },
  {
    COUNTYFP: "147",
    NAME: "Robertson",
    STATEFP: "47",
  },
  {
    COUNTYFP: "189",
    NAME: "Wilson",
    STATEFP: "47",
  },
  {
    COUNTYFP: "003",
    NAME: "Bedford",
    STATEFP: "47",
  },
  {
    COUNTYFP: "107",
    NAME: "McMinn",
    STATEFP: "47",
  },
  {
    COUNTYFP: "065",
    NAME: "Hamilton",
    STATEFP: "47",
  },
  {
    COUNTYFP: "115",
    NAME: "Marion",
    STATEFP: "47",
  },
  {
    COUNTYFP: "153",
    NAME: "Sequatchie",
    STATEFP: "47",
  },
  {
    COUNTYFP: "011",
    NAME: "Bradley",
    STATEFP: "47",
  },
  {
    COUNTYFP: "139",
    NAME: "Polk",
    STATEFP: "47",
  },
  {
    COUNTYFP: "143",
    NAME: "Rhea",
    STATEFP: "47",
  },
  {
    COUNTYFP: "075",
    NAME: "Haywood",
    STATEFP: "47",
  },
  {
    COUNTYFP: "023",
    NAME: "Chester",
    STATEFP: "47",
  },
  {
    COUNTYFP: "033",
    NAME: "Crockett",
    STATEFP: "47",
  },
  {
    COUNTYFP: "113",
    NAME: "Madison",
    STATEFP: "47",
  },
  {
    COUNTYFP: "019",
    NAME: "Carter",
    STATEFP: "47",
  },
  {
    COUNTYFP: "179",
    NAME: "Washington",
    STATEFP: "47",
  },
  {
    COUNTYFP: "171",
    NAME: "Unicoi",
    STATEFP: "47",
  },
  {
    COUNTYFP: "073",
    NAME: "Hawkins",
    STATEFP: "47",
  },
  {
    COUNTYFP: "163",
    NAME: "Sullivan",
    STATEFP: "47",
  },
  {
    COUNTYFP: "129",
    NAME: "Morgan",
    STATEFP: "47",
  },
  {
    COUNTYFP: "013",
    NAME: "Campbell",
    STATEFP: "47",
  },
  {
    COUNTYFP: "105",
    NAME: "Loudon",
    STATEFP: "47",
  },
  {
    COUNTYFP: "173",
    NAME: "Union",
    STATEFP: "47",
  },
  {
    COUNTYFP: "009",
    NAME: "Blount",
    STATEFP: "47",
  },
  {
    COUNTYFP: "145",
    NAME: "Roane",
    STATEFP: "47",
  },
  {
    COUNTYFP: "093",
    NAME: "Knox",
    STATEFP: "47",
  },
  {
    COUNTYFP: "001",
    NAME: "Anderson",
    STATEFP: "47",
  },
  {
    COUNTYFP: "057",
    NAME: "Grainger",
    STATEFP: "47",
  },
  {
    COUNTYFP: "089",
    NAME: "Jefferson",
    STATEFP: "47",
  },
  {
    COUNTYFP: "063",
    NAME: "Hamblen",
    STATEFP: "47",
  },
  {
    COUNTYFP: "029",
    NAME: "Cocke",
    STATEFP: "47",
  },
  {
    COUNTYFP: "155",
    NAME: "Sevier",
    STATEFP: "47",
  },
  {
    COUNTYFP: "183",
    NAME: "Weakley",
    STATEFP: "47",
  },
  {
    COUNTYFP: "131",
    NAME: "Obion",
    STATEFP: "47",
  },
  {
    COUNTYFP: "167",
    NAME: "Tipton",
    STATEFP: "47",
  },
  {
    COUNTYFP: "047",
    NAME: "Fayette",
    STATEFP: "47",
  },
  {
    COUNTYFP: "157",
    NAME: "Shelby",
    STATEFP: "47",
  },
  {
    COUNTYFP: "185",
    NAME: "White",
    STATEFP: "47",
  },
  {
    COUNTYFP: "123",
    NAME: "Monroe",
    STATEFP: "47",
  },
  {
    COUNTYFP: "061",
    NAME: "Grundy",
    STATEFP: "47",
  },
  {
    COUNTYFP: "027",
    NAME: "Clay",
    STATEFP: "47",
  },
  {
    COUNTYFP: "097",
    NAME: "Lauderdale",
    STATEFP: "47",
  },
  {
    COUNTYFP: "041",
    NAME: "DeKalb",
    STATEFP: "47",
  },
  {
    COUNTYFP: "095",
    NAME: "Lake",
    STATEFP: "47",
  },
  {
    COUNTYFP: "161",
    NAME: "Stewart",
    STATEFP: "47",
  },
  {
    COUNTYFP: "069",
    NAME: "Hardeman",
    STATEFP: "47",
  },
  {
    COUNTYFP: "017",
    NAME: "Carroll",
    STATEFP: "47",
  },
  {
    COUNTYFP: "181",
    NAME: "Wayne",
    STATEFP: "47",
  },
  {
    COUNTYFP: "175",
    NAME: "Van Buren",
    STATEFP: "47",
  },
  {
    COUNTYFP: "083",
    NAME: "Houston",
    STATEFP: "47",
  },
  {
    COUNTYFP: "055",
    NAME: "Giles",
    STATEFP: "47",
  },
  {
    COUNTYFP: "085",
    NAME: "Humphreys",
    STATEFP: "47",
  },
  {
    COUNTYFP: "135",
    NAME: "Perry",
    STATEFP: "47",
  },
  {
    COUNTYFP: "067",
    NAME: "Hancock",
    STATEFP: "47",
  },
  {
    COUNTYFP: "071",
    NAME: "Hardin",
    STATEFP: "47",
  },
  {
    COUNTYFP: "025",
    NAME: "Claiborne",
    STATEFP: "47",
  },
  {
    COUNTYFP: "053",
    NAME: "Gibson",
    STATEFP: "47",
  },
  {
    COUNTYFP: "151",
    NAME: "Scott",
    STATEFP: "47",
  },
  {
    COUNTYFP: "039",
    NAME: "Decatur",
    STATEFP: "47",
  },
  {
    COUNTYFP: "101",
    NAME: "Lewis",
    STATEFP: "47",
  },
  {
    COUNTYFP: "121",
    NAME: "Meigs",
    STATEFP: "47",
  },
  {
    COUNTYFP: "103",
    NAME: "Lincoln",
    STATEFP: "47",
  },
  {
    COUNTYFP: "007",
    NAME: "Bledsoe",
    STATEFP: "47",
  },
  {
    COUNTYFP: "091",
    NAME: "Johnson",
    STATEFP: "47",
  },
  {
    COUNTYFP: "077",
    NAME: "Henderson",
    STATEFP: "47",
  },
  {
    COUNTYFP: "109",
    NAME: "McNairy",
    STATEFP: "47",
  },
  {
    COUNTYFP: "049",
    NAME: "Fentress",
    STATEFP: "47",
  },
  {
    COUNTYFP: "005",
    NAME: "Benton",
    STATEFP: "47",
  },
  {
    COUNTYFP: "137",
    NAME: "Pickett",
    STATEFP: "47",
  },
  {
    COUNTYFP: "125",
    NAME: "Montgomery",
    STATEFP: "47",
  },
  {
    COUNTYFP: "141",
    NAME: "Putnam",
    STATEFP: "47",
  },
  {
    COUNTYFP: "087",
    NAME: "Jackson",
    STATEFP: "47",
  },
  {
    COUNTYFP: "133",
    NAME: "Overton",
    STATEFP: "47",
  },
  {
    COUNTYFP: "035",
    NAME: "Cumberland",
    STATEFP: "47",
  },
  {
    COUNTYFP: "045",
    NAME: "Dyer",
    STATEFP: "47",
  },
  {
    COUNTYFP: "059",
    NAME: "Greene",
    STATEFP: "47",
  },
  {
    COUNTYFP: "177",
    NAME: "Warren",
    STATEFP: "47",
  },
  {
    COUNTYFP: "079",
    NAME: "Henry",
    STATEFP: "47",
  },
  {
    COUNTYFP: "031",
    NAME: "Coffee",
    STATEFP: "47",
  },
  {
    COUNTYFP: "051",
    NAME: "Franklin",
    STATEFP: "47",
  },
  {
    COUNTYFP: "073",
    NAME: "Cherokee",
    STATEFP: "48",
  },
  {
    COUNTYFP: "423",
    NAME: "Smith",
    STATEFP: "48",
  },
  {
    COUNTYFP: "057",
    NAME: "Calhoun",
    STATEFP: "48",
  },
  {
    COUNTYFP: "469",
    NAME: "Victoria",
    STATEFP: "48",
  },
  {
    COUNTYFP: "175",
    NAME: "Goliad",
    STATEFP: "48",
  },
  {
    COUNTYFP: "245",
    NAME: "Jefferson",
    STATEFP: "48",
  },
  {
    COUNTYFP: "351",
    NAME: "Newton",
    STATEFP: "48",
  },
  {
    COUNTYFP: "199",
    NAME: "Hardin",
    STATEFP: "48",
  },
  {
    COUNTYFP: "025",
    NAME: "Bee",
    STATEFP: "48",
  },
  {
    COUNTYFP: "173",
    NAME: "Glasscock",
    STATEFP: "48",
  },
  {
    COUNTYFP: "227",
    NAME: "Howard",
    STATEFP: "48",
  },
  {
    COUNTYFP: "049",
    NAME: "Brown",
    STATEFP: "48",
  },
  {
    COUNTYFP: "041",
    NAME: "Brazos",
    STATEFP: "48",
  },
  {
    COUNTYFP: "395",
    NAME: "Robertson",
    STATEFP: "48",
  },
  {
    COUNTYFP: "051",
    NAME: "Burleson",
    STATEFP: "48",
  },
  {
    COUNTYFP: "465",
    NAME: "Val Verde",
    STATEFP: "48",
  },
  {
    COUNTYFP: "341",
    NAME: "Moore",
    STATEFP: "48",
  },
  {
    COUNTYFP: "323",
    NAME: "Maverick",
    STATEFP: "48",
  },
  {
    COUNTYFP: "171",
    NAME: "Gillespie",
    STATEFP: "48",
  },
  {
    COUNTYFP: "117",
    NAME: "Deaf Smith",
    STATEFP: "48",
  },
  {
    COUNTYFP: "265",
    NAME: "Kerr",
    STATEFP: "48",
  },
  {
    COUNTYFP: "027",
    NAME: "Bell",
    STATEFP: "48",
  },
  {
    COUNTYFP: "099",
    NAME: "Coryell",
    STATEFP: "48",
  },
  {
    COUNTYFP: "281",
    NAME: "Lampasas",
    STATEFP: "48",
  },
  {
    COUNTYFP: "115",
    NAME: "Dawson",
    STATEFP: "48",
  },
  {
    COUNTYFP: "479",
    NAME: "Webb",
    STATEFP: "48",
  },
  {
    COUNTYFP: "005",
    NAME: "Angelina",
    STATEFP: "48",
  },
  {
    COUNTYFP: "449",
    NAME: "Titus",
    STATEFP: "48",
  },
  {
    COUNTYFP: "347",
    NAME: "Nacogdoches",
    STATEFP: "48",
  },
  {
    COUNTYFP: "001",
    NAME: "Anderson",
    STATEFP: "48",
  },
  {
    COUNTYFP: "179",
    NAME: "Gray",
    STATEFP: "48",
  },
  {
    COUNTYFP: "277",
    NAME: "Lamar",
    STATEFP: "48",
  },
  {
    COUNTYFP: "389",
    NAME: "Reeves",
    STATEFP: "48",
  },
  {
    COUNTYFP: "189",
    NAME: "Hale",
    STATEFP: "48",
  },
  {
    COUNTYFP: "235",
    NAME: "Irion",
    STATEFP: "48",
  },
  {
    COUNTYFP: "451",
    NAME: "Tom Green",
    STATEFP: "48",
  },
  {
    COUNTYFP: "019",
    NAME: "Bandera",
    STATEFP: "48",
  },
  {
    COUNTYFP: "029",
    NAME: "Bexar",
    STATEFP: "48",
  },
  {
    COUNTYFP: "091",
    NAME: "Comal",
    STATEFP: "48",
  },
  {
    COUNTYFP: "259",
    NAME: "Kendall",
    STATEFP: "48",
  },
  {
    COUNTYFP: "325",
    NAME: "Medina",
    STATEFP: "48",
  },
  {
    COUNTYFP: "187",
    NAME: "Guadalupe",
    STATEFP: "48",
  },
  {
    COUNTYFP: "013",
    NAME: "Atascosa",
    STATEFP: "48",
  },
  {
    COUNTYFP: "493",
    NAME: "Wilson",
    STATEFP: "48",
  },
  {
    COUNTYFP: "415",
    NAME: "Scurry",
    STATEFP: "48",
  },
  {
    COUNTYFP: "143",
    NAME: "Erath",
    STATEFP: "48",
  },
  {
    COUNTYFP: "353",
    NAME: "Nolan",
    STATEFP: "48",
  },
  {
    COUNTYFP: "037",
    NAME: "Bowie",
    STATEFP: "48",
  },
  {
    COUNTYFP: "463",
    NAME: "Uvalde",
    STATEFP: "48",
  },
  {
    COUNTYFP: "487",
    NAME: "Wilbarger",
    STATEFP: "48",
  },
  {
    COUNTYFP: "309",
    NAME: "McLennan",
    STATEFP: "48",
  },
  {
    COUNTYFP: "145",
    NAME: "Falls",
    STATEFP: "48",
  },
  {
    COUNTYFP: "077",
    NAME: "Clay",
    STATEFP: "48",
  },
  {
    COUNTYFP: "485",
    NAME: "Wichita",
    STATEFP: "48",
  },
  {
    COUNTYFP: "009",
    NAME: "Archer",
    STATEFP: "48",
  },
  {
    COUNTYFP: "505",
    NAME: "Zapata",
    STATEFP: "48",
  },
  {
    COUNTYFP: "011",
    NAME: "Armstrong",
    STATEFP: "48",
  },
  {
    COUNTYFP: "359",
    NAME: "Oldham",
    STATEFP: "48",
  },
  {
    COUNTYFP: "381",
    NAME: "Randall",
    STATEFP: "48",
  },
  {
    COUNTYFP: "375",
    NAME: "Potter",
    STATEFP: "48",
  },
  {
    COUNTYFP: "065",
    NAME: "Carson",
    STATEFP: "48",
  },
  {
    COUNTYFP: "233",
    NAME: "Hutchinson",
    STATEFP: "48",
  },
  {
    COUNTYFP: "061",
    NAME: "Cameron",
    STATEFP: "48",
  },
  {
    COUNTYFP: "489",
    NAME: "Willacy",
    STATEFP: "48",
  },
  {
    COUNTYFP: "491",
    NAME: "Williamson",
    STATEFP: "48",
  },
  {
    COUNTYFP: "453",
    NAME: "Travis",
    STATEFP: "48",
  },
  {
    COUNTYFP: "021",
    NAME: "Bastrop",
    STATEFP: "48",
  },
  {
    COUNTYFP: "361",
    NAME: "Orange",
    STATEFP: "48",
  },
  {
    COUNTYFP: "401",
    NAME: "Rusk",
    STATEFP: "48",
  },
  {
    COUNTYFP: "183",
    NAME: "Gregg",
    STATEFP: "48",
  },
  {
    COUNTYFP: "459",
    NAME: "Upshur",
    STATEFP: "48",
  },
  {
    COUNTYFP: "203",
    NAME: "Harrison",
    STATEFP: "48",
  },
  {
    COUNTYFP: "219",
    NAME: "Hockley",
    STATEFP: "48",
  },
  {
    COUNTYFP: "107",
    NAME: "Crosby",
    STATEFP: "48",
  },
  {
    COUNTYFP: "305",
    NAME: "Lynn",
    STATEFP: "48",
  },
  {
    COUNTYFP: "303",
    NAME: "Lubbock",
    STATEFP: "48",
  },
  {
    COUNTYFP: "215",
    NAME: "Hidalgo",
    STATEFP: "48",
  },
  {
    COUNTYFP: "427",
    NAME: "Starr",
    STATEFP: "48",
  },
  {
    COUNTYFP: "317",
    NAME: "Martin",
    STATEFP: "48",
  },
  {
    COUNTYFP: "329",
    NAME: "Midland",
    STATEFP: "48",
  },
  {
    COUNTYFP: "135",
    NAME: "Ector",
    STATEFP: "48",
  },
  {
    COUNTYFP: "249",
    NAME: "Jim Wells",
    STATEFP: "48",
  },
  {
    COUNTYFP: "007",
    NAME: "Aransas",
    STATEFP: "48",
  },
  {
    COUNTYFP: "409",
    NAME: "San Patricio",
    STATEFP: "48",
  },
  {
    COUNTYFP: "355",
    NAME: "Nueces",
    STATEFP: "48",
  },
  {
    COUNTYFP: "273",
    NAME: "Kleberg",
    STATEFP: "48",
  },
  {
    COUNTYFP: "261",
    NAME: "Kenedy",
    STATEFP: "48",
  },
  {
    COUNTYFP: "213",
    NAME: "Henderson",
    STATEFP: "48",
  },
  {
    COUNTYFP: "147",
    NAME: "Fannin",
    STATEFP: "48",
  },
  {
    COUNTYFP: "349",
    NAME: "Navarro",
    STATEFP: "48",
  },
  {
    COUNTYFP: "397",
    NAME: "Rockwall",
    STATEFP: "48",
  },
  {
    COUNTYFP: "367",
    NAME: "Parker",
    STATEFP: "48",
  },
  {
    COUNTYFP: "257",
    NAME: "Kaufman",
    STATEFP: "48",
  },
  {
    COUNTYFP: "251",
    NAME: "Johnson",
    STATEFP: "48",
  },
  {
    COUNTYFP: "439",
    NAME: "Tarrant",
    STATEFP: "48",
  },
  {
    COUNTYFP: "497",
    NAME: "Wise",
    STATEFP: "48",
  },
  {
    COUNTYFP: "139",
    NAME: "Ellis",
    STATEFP: "48",
  },
  {
    COUNTYFP: "231",
    NAME: "Hunt",
    STATEFP: "48",
  },
  {
    COUNTYFP: "221",
    NAME: "Hood",
    STATEFP: "48",
  },
  {
    COUNTYFP: "085",
    NAME: "Collin",
    STATEFP: "48",
  },
  {
    COUNTYFP: "121",
    NAME: "Denton",
    STATEFP: "48",
  },
  {
    COUNTYFP: "113",
    NAME: "Dallas",
    STATEFP: "48",
  },
  {
    COUNTYFP: "425",
    NAME: "Somervell",
    STATEFP: "48",
  },
  {
    COUNTYFP: "097",
    NAME: "Cooke",
    STATEFP: "48",
  },
  {
    COUNTYFP: "363",
    NAME: "Palo Pinto",
    STATEFP: "48",
  },
  {
    COUNTYFP: "181",
    NAME: "Grayson",
    STATEFP: "48",
  },
  {
    COUNTYFP: "223",
    NAME: "Hopkins",
    STATEFP: "48",
  },
  {
    COUNTYFP: "229",
    NAME: "Hudspeth",
    STATEFP: "48",
  },
  {
    COUNTYFP: "141",
    NAME: "El Paso",
    STATEFP: "48",
  },
  {
    COUNTYFP: "321",
    NAME: "Matagorda",
    STATEFP: "48",
  },
  {
    COUNTYFP: "477",
    NAME: "Washington",
    STATEFP: "48",
  },
  {
    COUNTYFP: "481",
    NAME: "Wharton",
    STATEFP: "48",
  },
  {
    COUNTYFP: "157",
    NAME: "Fort Bend",
    STATEFP: "48",
  },
  {
    COUNTYFP: "473",
    NAME: "Waller",
    STATEFP: "48",
  },
  {
    COUNTYFP: "167",
    NAME: "Galveston",
    STATEFP: "48",
  },
  {
    COUNTYFP: "201",
    NAME: "Harris",
    STATEFP: "48",
  },
  {
    COUNTYFP: "339",
    NAME: "Montgomery",
    STATEFP: "48",
  },
  {
    COUNTYFP: "291",
    NAME: "Liberty",
    STATEFP: "48",
  },
  {
    COUNTYFP: "071",
    NAME: "Chambers",
    STATEFP: "48",
  },
  {
    COUNTYFP: "039",
    NAME: "Brazoria",
    STATEFP: "48",
  },
  {
    COUNTYFP: "015",
    NAME: "Austin",
    STATEFP: "48",
  },
  {
    COUNTYFP: "471",
    NAME: "Walker",
    STATEFP: "48",
  },
  {
    COUNTYFP: "455",
    NAME: "Trinity",
    STATEFP: "48",
  },
  {
    COUNTYFP: "327",
    NAME: "Menard",
    STATEFP: "48",
  },
  {
    COUNTYFP: "177",
    NAME: "Gonzales",
    STATEFP: "48",
  },
  {
    COUNTYFP: "391",
    NAME: "Refugio",
    STATEFP: "48",
  },
  {
    COUNTYFP: "247",
    NAME: "Jim Hogg",
    STATEFP: "48",
  },
  {
    COUNTYFP: "127",
    NAME: "Dimmit",
    STATEFP: "48",
  },
  {
    COUNTYFP: "413",
    NAME: "Schleicher",
    STATEFP: "48",
  },
  {
    COUNTYFP: "119",
    NAME: "Delta",
    STATEFP: "48",
  },
  {
    COUNTYFP: "507",
    NAME: "Zavala",
    STATEFP: "48",
  },
  {
    COUNTYFP: "133",
    NAME: "Eastland",
    STATEFP: "48",
  },
  {
    COUNTYFP: "123",
    NAME: "DeWitt",
    STATEFP: "48",
  },
  {
    COUNTYFP: "289",
    NAME: "Leon",
    STATEFP: "48",
  },
  {
    COUNTYFP: "433",
    NAME: "Stonewall",
    STATEFP: "48",
  },
  {
    COUNTYFP: "311",
    NAME: "McMullen",
    STATEFP: "48",
  },
  {
    COUNTYFP: "435",
    NAME: "Sutton",
    STATEFP: "48",
  },
  {
    COUNTYFP: "271",
    NAME: "Kinney",
    STATEFP: "48",
  },
  {
    COUNTYFP: "149",
    NAME: "Fayette",
    STATEFP: "48",
  },
  {
    COUNTYFP: "045",
    NAME: "Briscoe",
    STATEFP: "48",
  },
  {
    COUNTYFP: "383",
    NAME: "Reagan",
    STATEFP: "48",
  },
  {
    COUNTYFP: "083",
    NAME: "Coleman",
    STATEFP: "48",
  },
  {
    COUNTYFP: "357",
    NAME: "Ochiltree",
    STATEFP: "48",
  },
  {
    COUNTYFP: "103",
    NAME: "Crane",
    STATEFP: "48",
  },
  {
    COUNTYFP: "333",
    NAME: "Mills",
    STATEFP: "48",
  },
  {
    COUNTYFP: "403",
    NAME: "Sabine",
    STATEFP: "48",
  },
  {
    COUNTYFP: "225",
    NAME: "Houston",
    STATEFP: "48",
  },
  {
    COUNTYFP: "461",
    NAME: "Upton",
    STATEFP: "48",
  },
  {
    COUNTYFP: "237",
    NAME: "Jack",
    STATEFP: "48",
  },
  {
    COUNTYFP: "211",
    NAME: "Hemphill",
    STATEFP: "48",
  },
  {
    COUNTYFP: "417",
    NAME: "Shackelford",
    STATEFP: "48",
  },
  {
    COUNTYFP: "407",
    NAME: "San Jacinto",
    STATEFP: "48",
  },
  {
    COUNTYFP: "153",
    NAME: "Floyd",
    STATEFP: "48",
  },
  {
    COUNTYFP: "255",
    NAME: "Karnes",
    STATEFP: "48",
  },
  {
    COUNTYFP: "131",
    NAME: "Duval",
    STATEFP: "48",
  },
  {
    COUNTYFP: "159",
    NAME: "Franklin",
    STATEFP: "48",
  },
  {
    COUNTYFP: "137",
    NAME: "Edwards",
    STATEFP: "48",
  },
  {
    COUNTYFP: "165",
    NAME: "Gaines",
    STATEFP: "48",
  },
  {
    COUNTYFP: "169",
    NAME: "Garza",
    STATEFP: "48",
  },
  {
    COUNTYFP: "369",
    NAME: "Parmer",
    STATEFP: "48",
  },
  {
    COUNTYFP: "445",
    NAME: "Terry",
    STATEFP: "48",
  },
  {
    COUNTYFP: "155",
    NAME: "Foard",
    STATEFP: "48",
  },
  {
    COUNTYFP: "385",
    NAME: "Real",
    STATEFP: "48",
  },
  {
    COUNTYFP: "275",
    NAME: "Knox",
    STATEFP: "48",
  },
  {
    COUNTYFP: "345",
    NAME: "Motley",
    STATEFP: "48",
  },
  {
    COUNTYFP: "457",
    NAME: "Tyler",
    STATEFP: "48",
  },
  {
    COUNTYFP: "377",
    NAME: "Presidio",
    STATEFP: "48",
  },
  {
    COUNTYFP: "371",
    NAME: "Pecos",
    STATEFP: "48",
  },
  {
    COUNTYFP: "239",
    NAME: "Jackson",
    STATEFP: "48",
  },
  {
    COUNTYFP: "437",
    NAME: "Swisher",
    STATEFP: "48",
  },
  {
    COUNTYFP: "431",
    NAME: "Sterling",
    STATEFP: "48",
  },
  {
    COUNTYFP: "495",
    NAME: "Winkler",
    STATEFP: "48",
  },
  {
    COUNTYFP: "163",
    NAME: "Frio",
    STATEFP: "48",
  },
  {
    COUNTYFP: "295",
    NAME: "Lipscomb",
    STATEFP: "48",
  },
  {
    COUNTYFP: "087",
    NAME: "Collingsworth",
    STATEFP: "48",
  },
  {
    COUNTYFP: "089",
    NAME: "Colorado",
    STATEFP: "48",
  },
  {
    COUNTYFP: "419",
    NAME: "Shelby",
    STATEFP: "48",
  },
  {
    COUNTYFP: "093",
    NAME: "Comanche",
    STATEFP: "48",
  },
  {
    COUNTYFP: "053",
    NAME: "Burnet",
    STATEFP: "48",
  },
  {
    COUNTYFP: "067",
    NAME: "Cass",
    STATEFP: "48",
  },
  {
    COUNTYFP: "079",
    NAME: "Cochran",
    STATEFP: "48",
  },
  {
    COUNTYFP: "467",
    NAME: "Van Zandt",
    STATEFP: "48",
  },
  {
    COUNTYFP: "129",
    NAME: "Donley",
    STATEFP: "48",
  },
  {
    COUNTYFP: "185",
    NAME: "Grimes",
    STATEFP: "48",
  },
  {
    COUNTYFP: "047",
    NAME: "Brooks",
    STATEFP: "48",
  },
  {
    COUNTYFP: "111",
    NAME: "Dallam",
    STATEFP: "48",
  },
  {
    COUNTYFP: "335",
    NAME: "Mitchell",
    STATEFP: "48",
  },
  {
    COUNTYFP: "499",
    NAME: "Wood",
    STATEFP: "48",
  },
  {
    COUNTYFP: "075",
    NAME: "Childress",
    STATEFP: "48",
  },
  {
    COUNTYFP: "243",
    NAME: "Jeff Davis",
    STATEFP: "48",
  },
  {
    COUNTYFP: "337",
    NAME: "Montague",
    STATEFP: "48",
  },
  {
    COUNTYFP: "207",
    NAME: "Haskell",
    STATEFP: "48",
  },
  {
    COUNTYFP: "151",
    NAME: "Fisher",
    STATEFP: "48",
  },
  {
    COUNTYFP: "095",
    NAME: "Concho",
    STATEFP: "48",
  },
  {
    COUNTYFP: "081",
    NAME: "Coke",
    STATEFP: "48",
  },
  {
    COUNTYFP: "475",
    NAME: "Ward",
    STATEFP: "48",
  },
  {
    COUNTYFP: "193",
    NAME: "Hamilton",
    STATEFP: "48",
  },
  {
    COUNTYFP: "429",
    NAME: "Stephens",
    STATEFP: "48",
  },
  {
    COUNTYFP: "285",
    NAME: "Lavaca",
    STATEFP: "48",
  },
  {
    COUNTYFP: "035",
    NAME: "Bosque",
    STATEFP: "48",
  },
  {
    COUNTYFP: "393",
    NAME: "Roberts",
    STATEFP: "48",
  },
  {
    COUNTYFP: "379",
    NAME: "Rains",
    STATEFP: "48",
  },
  {
    COUNTYFP: "343",
    NAME: "Morris",
    STATEFP: "48",
  },
  {
    COUNTYFP: "483",
    NAME: "Wheeler",
    STATEFP: "48",
  },
  {
    COUNTYFP: "031",
    NAME: "Blanco",
    STATEFP: "48",
  },
  {
    COUNTYFP: "365",
    NAME: "Panola",
    STATEFP: "48",
  },
  {
    COUNTYFP: "299",
    NAME: "Llano",
    STATEFP: "48",
  },
  {
    COUNTYFP: "319",
    NAME: "Mason",
    STATEFP: "48",
  },
  {
    COUNTYFP: "205",
    NAME: "Hartley",
    STATEFP: "48",
  },
  {
    COUNTYFP: "373",
    NAME: "Polk",
    STATEFP: "48",
  },
  {
    COUNTYFP: "101",
    NAME: "Cottle",
    STATEFP: "48",
  },
  {
    COUNTYFP: "503",
    NAME: "Young",
    STATEFP: "48",
  },
  {
    COUNTYFP: "287",
    NAME: "Lee",
    STATEFP: "48",
  },
  {
    COUNTYFP: "191",
    NAME: "Hall",
    STATEFP: "48",
  },
  {
    COUNTYFP: "023",
    NAME: "Baylor",
    STATEFP: "48",
  },
  {
    COUNTYFP: "405",
    NAME: "San Augustine",
    STATEFP: "48",
  },
  {
    COUNTYFP: "313",
    NAME: "Madison",
    STATEFP: "48",
  },
  {
    COUNTYFP: "331",
    NAME: "Milam",
    STATEFP: "48",
  },
  {
    COUNTYFP: "063",
    NAME: "Camp",
    STATEFP: "48",
  },
  {
    COUNTYFP: "161",
    NAME: "Freestone",
    STATEFP: "48",
  },
  {
    COUNTYFP: "399",
    NAME: "Runnels",
    STATEFP: "48",
  },
  {
    COUNTYFP: "443",
    NAME: "Terrell",
    STATEFP: "48",
  },
  {
    COUNTYFP: "315",
    NAME: "Marion",
    STATEFP: "48",
  },
  {
    COUNTYFP: "241",
    NAME: "Jasper",
    STATEFP: "48",
  },
  {
    COUNTYFP: "195",
    NAME: "Hansford",
    STATEFP: "48",
  },
  {
    COUNTYFP: "447",
    NAME: "Throckmorton",
    STATEFP: "48",
  },
  {
    COUNTYFP: "293",
    NAME: "Limestone",
    STATEFP: "48",
  },
  {
    COUNTYFP: "387",
    NAME: "Red River",
    STATEFP: "48",
  },
  {
    COUNTYFP: "197",
    NAME: "Hardeman",
    STATEFP: "48",
  },
  {
    COUNTYFP: "297",
    NAME: "Live Oak",
    STATEFP: "48",
  },
  {
    COUNTYFP: "421",
    NAME: "Sherman",
    STATEFP: "48",
  },
  {
    COUNTYFP: "017",
    NAME: "Bailey",
    STATEFP: "48",
  },
  {
    COUNTYFP: "109",
    NAME: "Culberson",
    STATEFP: "48",
  },
  {
    COUNTYFP: "267",
    NAME: "Kimble",
    STATEFP: "48",
  },
  {
    COUNTYFP: "307",
    NAME: "McCulloch",
    STATEFP: "48",
  },
  {
    COUNTYFP: "105",
    NAME: "Crockett",
    STATEFP: "48",
  },
  {
    COUNTYFP: "217",
    NAME: "Hill",
    STATEFP: "48",
  },
  {
    COUNTYFP: "263",
    NAME: "Kent",
    STATEFP: "48",
  },
  {
    COUNTYFP: "301",
    NAME: "Loving",
    STATEFP: "48",
  },
  {
    COUNTYFP: "125",
    NAME: "Dickens",
    STATEFP: "48",
  },
  {
    COUNTYFP: "283",
    NAME: "La Salle",
    STATEFP: "48",
  },
  {
    COUNTYFP: "279",
    NAME: "Lamb",
    STATEFP: "48",
  },
  {
    COUNTYFP: "269",
    NAME: "King",
    STATEFP: "48",
  },
  {
    COUNTYFP: "501",
    NAME: "Yoakum",
    STATEFP: "48",
  },
  {
    COUNTYFP: "033",
    NAME: "Borden",
    STATEFP: "48",
  },
  {
    COUNTYFP: "411",
    NAME: "San Saba",
    STATEFP: "48",
  },
  {
    COUNTYFP: "069",
    NAME: "Castro",
    STATEFP: "48",
  },
  {
    COUNTYFP: "043",
    NAME: "Brewster",
    STATEFP: "48",
  },
  {
    COUNTYFP: "253",
    NAME: "Jones",
    STATEFP: "48",
  },
  {
    COUNTYFP: "059",
    NAME: "Callahan",
    STATEFP: "48",
  },
  {
    COUNTYFP: "441",
    NAME: "Taylor",
    STATEFP: "48",
  },
  {
    COUNTYFP: "003",
    NAME: "Andrews",
    STATEFP: "48",
  },
  {
    COUNTYFP: "055",
    NAME: "Caldwell",
    STATEFP: "48",
  },
  {
    COUNTYFP: "209",
    NAME: "Hays",
    STATEFP: "48",
  },
  {
    COUNTYFP: "051",
    NAME: "Wasatch",
    STATEFP: "49",
  },
  {
    COUNTYFP: "011",
    NAME: "Davis",
    STATEFP: "49",
  },
  {
    COUNTYFP: "003",
    NAME: "Box Elder",
    STATEFP: "49",
  },
  {
    COUNTYFP: "029",
    NAME: "Morgan",
    STATEFP: "49",
  },
  {
    COUNTYFP: "057",
    NAME: "Weber",
    STATEFP: "49",
  },
  {
    COUNTYFP: "049",
    NAME: "Utah",
    STATEFP: "49",
  },
  {
    COUNTYFP: "023",
    NAME: "Juab",
    STATEFP: "49",
  },
  {
    COUNTYFP: "035",
    NAME: "Salt Lake",
    STATEFP: "49",
  },
  {
    COUNTYFP: "045",
    NAME: "Tooele",
    STATEFP: "49",
  },
  {
    COUNTYFP: "043",
    NAME: "Summit",
    STATEFP: "49",
  },
  {
    COUNTYFP: "033",
    NAME: "Rich",
    STATEFP: "49",
  },
  {
    COUNTYFP: "013",
    NAME: "Duchesne",
    STATEFP: "49",
  },
  {
    COUNTYFP: "027",
    NAME: "Millard",
    STATEFP: "49",
  },
  {
    COUNTYFP: "025",
    NAME: "Kane",
    STATEFP: "49",
  },
  {
    COUNTYFP: "041",
    NAME: "Sevier",
    STATEFP: "49",
  },
  {
    COUNTYFP: "017",
    NAME: "Garfield",
    STATEFP: "49",
  },
  {
    COUNTYFP: "031",
    NAME: "Piute",
    STATEFP: "49",
  },
  {
    COUNTYFP: "015",
    NAME: "Emery",
    STATEFP: "49",
  },
  {
    COUNTYFP: "009",
    NAME: "Daggett",
    STATEFP: "49",
  },
  {
    COUNTYFP: "037",
    NAME: "San Juan",
    STATEFP: "49",
  },
  {
    COUNTYFP: "019",
    NAME: "Grand",
    STATEFP: "49",
  },
  {
    COUNTYFP: "001",
    NAME: "Beaver",
    STATEFP: "49",
  },
  {
    COUNTYFP: "055",
    NAME: "Wayne",
    STATEFP: "49",
  },
  {
    COUNTYFP: "039",
    NAME: "Sanpete",
    STATEFP: "49",
  },
  {
    COUNTYFP: "021",
    NAME: "Iron",
    STATEFP: "49",
  },
  {
    COUNTYFP: "005",
    NAME: "Cache",
    STATEFP: "49",
  },
  {
    COUNTYFP: "007",
    NAME: "Carbon",
    STATEFP: "49",
  },
  {
    COUNTYFP: "053",
    NAME: "Washington",
    STATEFP: "49",
  },
  {
    COUNTYFP: "047",
    NAME: "Uintah",
    STATEFP: "49",
  },
  {
    COUNTYFP: "015",
    NAME: "Lamoille",
    STATEFP: "50",
  },
  {
    COUNTYFP: "001",
    NAME: "Addison",
    STATEFP: "50",
  },
  {
    COUNTYFP: "019",
    NAME: "Orleans",
    STATEFP: "50",
  },
  {
    COUNTYFP: "005",
    NAME: "Caledonia",
    STATEFP: "50",
  },
  {
    COUNTYFP: "023",
    NAME: "Washington",
    STATEFP: "50",
  },
  {
    COUNTYFP: "009",
    NAME: "Essex",
    STATEFP: "50",
  },
  {
    COUNTYFP: "011",
    NAME: "Franklin",
    STATEFP: "50",
  },
  {
    COUNTYFP: "013",
    NAME: "Grand Isle",
    STATEFP: "50",
  },
  {
    COUNTYFP: "007",
    NAME: "Chittenden",
    STATEFP: "50",
  },
  {
    COUNTYFP: "017",
    NAME: "Orange",
    STATEFP: "50",
  },
  {
    COUNTYFP: "027",
    NAME: "Windsor",
    STATEFP: "50",
  },
  {
    COUNTYFP: "021",
    NAME: "Rutland",
    STATEFP: "50",
  },
  {
    COUNTYFP: "167",
    NAME: "Russell",
    STATEFP: "51",
  },
  {
    COUNTYFP: "027",
    NAME: "Buchanan",
    STATEFP: "51",
  },
  {
    COUNTYFP: "005",
    NAME: "Alleghany",
    STATEFP: "51",
  },
  {
    COUNTYFP: "141",
    NAME: "Patrick",
    STATEFP: "51",
  },
  {
    COUNTYFP: "077",
    NAME: "Grayson",
    STATEFP: "51",
  },
  {
    COUNTYFP: "197",
    NAME: "Wythe",
    STATEFP: "51",
  },
  {
    COUNTYFP: "035",
    NAME: "Carroll",
    STATEFP: "51",
  },
  {
    COUNTYFP: "017",
    NAME: "Bath",
    STATEFP: "51",
  },
  {
    COUNTYFP: "173",
    NAME: "Smyth",
    STATEFP: "51",
  },
  {
    COUNTYFP: "021",
    NAME: "Bland",
    STATEFP: "51",
  },
  {
    COUNTYFP: "105",
    NAME: "Lee",
    STATEFP: "51",
  },
  {
    COUNTYFP: "091",
    NAME: "Highland",
    STATEFP: "51",
  },
  {
    COUNTYFP: "163",
    NAME: "Rockbridge",
    STATEFP: "51",
  },
  {
    COUNTYFP: "051",
    NAME: "Dickenson",
    STATEFP: "51",
  },
  {
    COUNTYFP: "195",
    NAME: "Wise",
    STATEFP: "51",
  },
  {
    COUNTYFP: "121",
    NAME: "Montgomery",
    STATEFP: "51",
  },
  {
    COUNTYFP: "063",
    NAME: "Floyd",
    STATEFP: "51",
  },
  {
    COUNTYFP: "071",
    NAME: "Giles",
    STATEFP: "51",
  },
  {
    COUNTYFP: "155",
    NAME: "Pulaski",
    STATEFP: "51",
  },
  {
    COUNTYFP: "185",
    NAME: "Tazewell",
    STATEFP: "51",
  },
  {
    COUNTYFP: "143",
    NAME: "Pittsylvania",
    STATEFP: "51",
  },
  {
    COUNTYFP: "009",
    NAME: "Amherst",
    STATEFP: "51",
  },
  {
    COUNTYFP: "019",
    NAME: "Bedford",
    STATEFP: "51",
  },
  {
    COUNTYFP: "031",
    NAME: "Campbell",
    STATEFP: "51",
  },
  {
    COUNTYFP: "089",
    NAME: "Henry",
    STATEFP: "51",
  },
  {
    COUNTYFP: "045",
    NAME: "Craig",
    STATEFP: "51",
  },
  {
    COUNTYFP: "067",
    NAME: "Franklin",
    STATEFP: "51",
  },
  {
    COUNTYFP: "161",
    NAME: "Roanoke",
    STATEFP: "51",
  },
  {
    COUNTYFP: "023",
    NAME: "Botetourt",
    STATEFP: "51",
  },
  {
    COUNTYFP: "169",
    NAME: "Scott",
    STATEFP: "51",
  },
  {
    COUNTYFP: "191",
    NAME: "Washington",
    STATEFP: "51",
  },
  {
    COUNTYFP: "015",
    NAME: "Augusta",
    STATEFP: "51",
  },
  {
    COUNTYFP: "035",
    NAME: "Kitsap",
    STATEFP: "53",
  },
  {
    COUNTYFP: "041",
    NAME: "Lewis",
    STATEFP: "53",
  },
  {
    COUNTYFP: "057",
    NAME: "Skagit",
    STATEFP: "53",
  },
  {
    COUNTYFP: "029",
    NAME: "Island",
    STATEFP: "53",
  },
  {
    COUNTYFP: "067",
    NAME: "Thurston",
    STATEFP: "53",
  },
  {
    COUNTYFP: "061",
    NAME: "Snohomish",
    STATEFP: "53",
  },
  {
    COUNTYFP: "053",
    NAME: "Pierce",
    STATEFP: "53",
  },
  {
    COUNTYFP: "033",
    NAME: "King",
    STATEFP: "53",
  },
  {
    COUNTYFP: "045",
    NAME: "Mason",
    STATEFP: "53",
  },
  {
    COUNTYFP: "063",
    NAME: "Spokane",
    STATEFP: "53",
  },
  {
    COUNTYFP: "065",
    NAME: "Stevens",
    STATEFP: "53",
  },
  {
    COUNTYFP: "051",
    NAME: "Pend Oreille",
    STATEFP: "53",
  },
  {
    COUNTYFP: "025",
    NAME: "Grant",
    STATEFP: "53",
  },
  {
    COUNTYFP: "001",
    NAME: "Adams",
    STATEFP: "53",
  },
  {
    COUNTYFP: "015",
    NAME: "Cowlitz",
    STATEFP: "53",
  },
  {
    COUNTYFP: "059",
    NAME: "Skamania",
    STATEFP: "53",
  },
  {
    COUNTYFP: "011",
    NAME: "Clark",
    STATEFP: "53",
  },
  {
    COUNTYFP: "075",
    NAME: "Whitman",
    STATEFP: "53",
  },
  {
    COUNTYFP: "069",
    NAME: "Wahkiakum",
    STATEFP: "53",
  },
  {
    COUNTYFP: "031",
    NAME: "Jefferson",
    STATEFP: "53",
  },
  {
    COUNTYFP: "047",
    NAME: "Okanogan",
    STATEFP: "53",
  },
  {
    COUNTYFP: "019",
    NAME: "Ferry",
    STATEFP: "53",
  },
  {
    COUNTYFP: "043",
    NAME: "Lincoln",
    STATEFP: "53",
  },
  {
    COUNTYFP: "023",
    NAME: "Garfield",
    STATEFP: "53",
  },
  {
    COUNTYFP: "049",
    NAME: "Pacific",
    STATEFP: "53",
  },
  {
    COUNTYFP: "039",
    NAME: "Klickitat",
    STATEFP: "53",
  },
  {
    COUNTYFP: "055",
    NAME: "San Juan",
    STATEFP: "53",
  },
  {
    COUNTYFP: "027",
    NAME: "Grays Harbor",
    STATEFP: "53",
  },
  {
    COUNTYFP: "073",
    NAME: "Whatcom",
    STATEFP: "53",
  },
  {
    COUNTYFP: "037",
    NAME: "Kittitas",
    STATEFP: "53",
  },
  {
    COUNTYFP: "005",
    NAME: "Benton",
    STATEFP: "53",
  },
  {
    COUNTYFP: "021",
    NAME: "Franklin",
    STATEFP: "53",
  },
  {
    COUNTYFP: "003",
    NAME: "Asotin",
    STATEFP: "53",
  },
  {
    COUNTYFP: "009",
    NAME: "Clallam",
    STATEFP: "53",
  },
  {
    COUNTYFP: "013",
    NAME: "Columbia",
    STATEFP: "53",
  },
  {
    COUNTYFP: "071",
    NAME: "Walla Walla",
    STATEFP: "53",
  },
  {
    COUNTYFP: "007",
    NAME: "Chelan",
    STATEFP: "53",
  },
  {
    COUNTYFP: "017",
    NAME: "Douglas",
    STATEFP: "53",
  },
  {
    COUNTYFP: "077",
    NAME: "Yakima",
    STATEFP: "53",
  },
  {
    COUNTYFP: "061",
    NAME: "Monongalia",
    STATEFP: "54",
  },
  {
    COUNTYFP: "077",
    NAME: "Preston",
    STATEFP: "54",
  },
  {
    COUNTYFP: "107",
    NAME: "Wood",
    STATEFP: "54",
  },
  {
    COUNTYFP: "105",
    NAME: "Wirt",
    STATEFP: "54",
  },
  {
    COUNTYFP: "029",
    NAME: "Hancock",
    STATEFP: "54",
  },
  {
    COUNTYFP: "009",
    NAME: "Brooke",
    STATEFP: "54",
  },
  {
    COUNTYFP: "075",
    NAME: "Pocahontas",
    STATEFP: "54",
  },
  {
    COUNTYFP: "103",
    NAME: "Wetzel",
    STATEFP: "54",
  },
  {
    COUNTYFP: "035",
    NAME: "Jackson",
    STATEFP: "54",
  },
  {
    COUNTYFP: "101",
    NAME: "Webster",
    STATEFP: "54",
  },
  {
    COUNTYFP: "047",
    NAME: "McDowell",
    STATEFP: "54",
  },
  {
    COUNTYFP: "001",
    NAME: "Barbour",
    STATEFP: "54",
  },
  {
    COUNTYFP: "093",
    NAME: "Tucker",
    STATEFP: "54",
  },
  {
    COUNTYFP: "073",
    NAME: "Pleasants",
    STATEFP: "54",
  },
  {
    COUNTYFP: "109",
    NAME: "Wyoming",
    STATEFP: "54",
  },
  {
    COUNTYFP: "007",
    NAME: "Braxton",
    STATEFP: "54",
  },
  {
    COUNTYFP: "087",
    NAME: "Roane",
    STATEFP: "54",
  },
  {
    COUNTYFP: "023",
    NAME: "Grant",
    STATEFP: "54",
  },
  {
    COUNTYFP: "063",
    NAME: "Monroe",
    STATEFP: "54",
  },
  {
    COUNTYFP: "055",
    NAME: "Mercer",
    STATEFP: "54",
  },
  {
    COUNTYFP: "033",
    NAME: "Harrison",
    STATEFP: "54",
  },
  {
    COUNTYFP: "017",
    NAME: "Doddridge",
    STATEFP: "54",
  },
  {
    COUNTYFP: "091",
    NAME: "Taylor",
    STATEFP: "54",
  },
  {
    COUNTYFP: "083",
    NAME: "Randolph",
    STATEFP: "54",
  },
  {
    COUNTYFP: "053",
    NAME: "Mason",
    STATEFP: "54",
  },
  {
    COUNTYFP: "051",
    NAME: "Marshall",
    STATEFP: "54",
  },
  {
    COUNTYFP: "069",
    NAME: "Ohio",
    STATEFP: "54",
  },
  {
    COUNTYFP: "005",
    NAME: "Boone",
    STATEFP: "54",
  },
  {
    COUNTYFP: "015",
    NAME: "Clay",
    STATEFP: "54",
  },
  {
    COUNTYFP: "039",
    NAME: "Kanawha",
    STATEFP: "54",
  },
  {
    COUNTYFP: "079",
    NAME: "Putnam",
    STATEFP: "54",
  },
  {
    COUNTYFP: "011",
    NAME: "Cabell",
    STATEFP: "54",
  },
  {
    COUNTYFP: "043",
    NAME: "Lincoln",
    STATEFP: "54",
  },
  {
    COUNTYFP: "099",
    NAME: "Wayne",
    STATEFP: "54",
  },
  {
    COUNTYFP: "045",
    NAME: "Logan",
    STATEFP: "54",
  },
  {
    COUNTYFP: "095",
    NAME: "Tyler",
    STATEFP: "54",
  },
  {
    COUNTYFP: "013",
    NAME: "Calhoun",
    STATEFP: "54",
  },
  {
    COUNTYFP: "041",
    NAME: "Lewis",
    STATEFP: "54",
  },
  {
    COUNTYFP: "059",
    NAME: "Mingo",
    STATEFP: "54",
  },
  {
    COUNTYFP: "025",
    NAME: "Greenbrier",
    STATEFP: "54",
  },
  {
    COUNTYFP: "085",
    NAME: "Ritchie",
    STATEFP: "54",
  },
  {
    COUNTYFP: "071",
    NAME: "Pendleton",
    STATEFP: "54",
  },
  {
    COUNTYFP: "089",
    NAME: "Summers",
    STATEFP: "54",
  },
  {
    COUNTYFP: "097",
    NAME: "Upshur",
    STATEFP: "54",
  },
  {
    COUNTYFP: "067",
    NAME: "Nicholas",
    STATEFP: "54",
  },
  {
    COUNTYFP: "021",
    NAME: "Gilmer",
    STATEFP: "54",
  },
  {
    COUNTYFP: "019",
    NAME: "Fayette",
    STATEFP: "54",
  },
  {
    COUNTYFP: "081",
    NAME: "Raleigh",
    STATEFP: "54",
  },
  {
    COUNTYFP: "049",
    NAME: "Marion",
    STATEFP: "54",
  },
  {
    COUNTYFP: "069",
    NAME: "Lincoln",
    STATEFP: "55",
  },
  {
    COUNTYFP: "097",
    NAME: "Portage",
    STATEFP: "55",
  },
  {
    COUNTYFP: "073",
    NAME: "Marathon",
    STATEFP: "55",
  },
  {
    COUNTYFP: "141",
    NAME: "Wood",
    STATEFP: "55",
  },
  {
    COUNTYFP: "053",
    NAME: "Jackson",
    STATEFP: "55",
  },
  {
    COUNTYFP: "047",
    NAME: "Green Lake",
    STATEFP: "55",
  },
  {
    COUNTYFP: "123",
    NAME: "Vernon",
    STATEFP: "55",
  },
  {
    COUNTYFP: "003",
    NAME: "Ashland",
    STATEFP: "55",
  },
  {
    COUNTYFP: "085",
    NAME: "Oneida",
    STATEFP: "55",
  },
  {
    COUNTYFP: "137",
    NAME: "Waushara",
    STATEFP: "55",
  },
  {
    COUNTYFP: "129",
    NAME: "Washburn",
    STATEFP: "55",
  },
  {
    COUNTYFP: "065",
    NAME: "Lafayette",
    STATEFP: "55",
  },
  {
    COUNTYFP: "135",
    NAME: "Waupaca",
    STATEFP: "55",
  },
  {
    COUNTYFP: "125",
    NAME: "Vilas",
    STATEFP: "55",
  },
  {
    COUNTYFP: "007",
    NAME: "Bayfield",
    STATEFP: "55",
  },
  {
    COUNTYFP: "067",
    NAME: "Langlade",
    STATEFP: "55",
  },
  {
    COUNTYFP: "023",
    NAME: "Crawford",
    STATEFP: "55",
  },
  {
    COUNTYFP: "041",
    NAME: "Forest",
    STATEFP: "55",
  },
  {
    COUNTYFP: "113",
    NAME: "Sawyer",
    STATEFP: "55",
  },
  {
    COUNTYFP: "121",
    NAME: "Trempealeau",
    STATEFP: "55",
  },
  {
    COUNTYFP: "095",
    NAME: "Polk",
    STATEFP: "55",
  },
  {
    COUNTYFP: "001",
    NAME: "Adams",
    STATEFP: "55",
  },
  {
    COUNTYFP: "119",
    NAME: "Taylor",
    STATEFP: "55",
  },
  {
    COUNTYFP: "005",
    NAME: "Barron",
    STATEFP: "55",
  },
  {
    COUNTYFP: "051",
    NAME: "Iron",
    STATEFP: "55",
  },
  {
    COUNTYFP: "081",
    NAME: "Monroe",
    STATEFP: "55",
  },
  {
    COUNTYFP: "019",
    NAME: "Clark",
    STATEFP: "55",
  },
  {
    COUNTYFP: "057",
    NAME: "Juneau",
    STATEFP: "55",
  },
  {
    COUNTYFP: "107",
    NAME: "Rusk",
    STATEFP: "55",
  },
  {
    COUNTYFP: "011",
    NAME: "Buffalo",
    STATEFP: "55",
  },
  {
    COUNTYFP: "029",
    NAME: "Door",
    STATEFP: "55",
  },
  {
    COUNTYFP: "013",
    NAME: "Burnett",
    STATEFP: "55",
  },
  {
    COUNTYFP: "077",
    NAME: "Marquette",
    STATEFP: "55",
  },
  {
    COUNTYFP: "103",
    NAME: "Richland",
    STATEFP: "55",
  },
  {
    COUNTYFP: "091",
    NAME: "Pepin",
    STATEFP: "55",
  },
  {
    COUNTYFP: "099",
    NAME: "Price",
    STATEFP: "55",
  },
  {
    COUNTYFP: "031",
    NAME: "Douglas",
    STATEFP: "55",
  },
  {
    COUNTYFP: "039",
    NAME: "Fond du Lac",
    STATEFP: "55",
  },
  {
    COUNTYFP: "037",
    NAME: "Florence",
    STATEFP: "55",
  },
  {
    COUNTYFP: "063",
    NAME: "La Crosse",
    STATEFP: "55",
  },
  {
    COUNTYFP: "071",
    NAME: "Manitowoc",
    STATEFP: "55",
  },
  {
    COUNTYFP: "075",
    NAME: "Marinette",
    STATEFP: "55",
  },
  {
    COUNTYFP: "043",
    NAME: "Grant",
    STATEFP: "55",
  },
  {
    COUNTYFP: "117",
    NAME: "Sheboygan",
    STATEFP: "55",
  },
  {
    COUNTYFP: "087",
    NAME: "Outagamie",
    STATEFP: "55",
  },
  {
    COUNTYFP: "015",
    NAME: "Calumet",
    STATEFP: "55",
  },
  {
    COUNTYFP: "139",
    NAME: "Winnebago",
    STATEFP: "55",
  },
  {
    COUNTYFP: "059",
    NAME: "Kenosha",
    STATEFP: "55",
  },
  {
    COUNTYFP: "111",
    NAME: "Sauk",
    STATEFP: "55",
  },
  {
    COUNTYFP: "105",
    NAME: "Rock",
    STATEFP: "55",
  },
  {
    COUNTYFP: "045",
    NAME: "Green",
    STATEFP: "55",
  },
  {
    COUNTYFP: "025",
    NAME: "Dane",
    STATEFP: "55",
  },
  {
    COUNTYFP: "021",
    NAME: "Columbia",
    STATEFP: "55",
  },
  {
    COUNTYFP: "049",
    NAME: "Iowa",
    STATEFP: "55",
  },
  {
    COUNTYFP: "027",
    NAME: "Dodge",
    STATEFP: "55",
  },
  {
    COUNTYFP: "079",
    NAME: "Milwaukee",
    STATEFP: "55",
  },
  {
    COUNTYFP: "089",
    NAME: "Ozaukee",
    STATEFP: "55",
  },
  {
    COUNTYFP: "131",
    NAME: "Washington",
    STATEFP: "55",
  },
  {
    COUNTYFP: "133",
    NAME: "Waukesha",
    STATEFP: "55",
  },
  {
    COUNTYFP: "101",
    NAME: "Racine",
    STATEFP: "55",
  },
  {
    COUNTYFP: "055",
    NAME: "Jefferson",
    STATEFP: "55",
  },
  {
    COUNTYFP: "127",
    NAME: "Walworth",
    STATEFP: "55",
  },
  {
    COUNTYFP: "093",
    NAME: "Pierce",
    STATEFP: "55",
  },
  {
    COUNTYFP: "109",
    NAME: "St. Croix",
    STATEFP: "55",
  },
  {
    COUNTYFP: "035",
    NAME: "Eau Claire",
    STATEFP: "55",
  },
  {
    COUNTYFP: "017",
    NAME: "Chippewa",
    STATEFP: "55",
  },
  {
    COUNTYFP: "033",
    NAME: "Dunn",
    STATEFP: "55",
  },
  {
    COUNTYFP: "061",
    NAME: "Kewaunee",
    STATEFP: "55",
  },
  {
    COUNTYFP: "083",
    NAME: "Oconto",
    STATEFP: "55",
  },
  {
    COUNTYFP: "009",
    NAME: "Brown",
    STATEFP: "55",
  },
  {
    COUNTYFP: "115",
    NAME: "Shawano",
    STATEFP: "55",
  },
  {
    COUNTYFP: "078",
    NAME: "Menominee",
    STATEFP: "55",
  },
  {
    COUNTYFP: "023",
    NAME: "Lincoln",
    STATEFP: "56",
  },
  {
    COUNTYFP: "003",
    NAME: "Big Horn",
    STATEFP: "56",
  },
  {
    COUNTYFP: "017",
    NAME: "Hot Springs",
    STATEFP: "56",
  },
  {
    COUNTYFP: "043",
    NAME: "Washakie",
    STATEFP: "56",
  },
  {
    COUNTYFP: "009",
    NAME: "Converse",
    STATEFP: "56",
  },
  {
    COUNTYFP: "011",
    NAME: "Crook",
    STATEFP: "56",
  },
  {
    COUNTYFP: "007",
    NAME: "Carbon",
    STATEFP: "56",
  },
  {
    COUNTYFP: "031",
    NAME: "Platte",
    STATEFP: "56",
  },
  {
    COUNTYFP: "035",
    NAME: "Sublette",
    STATEFP: "56",
  },
  {
    COUNTYFP: "015",
    NAME: "Goshen",
    STATEFP: "56",
  },
  {
    COUNTYFP: "045",
    NAME: "Weston",
    STATEFP: "56",
  },
  {
    COUNTYFP: "029",
    NAME: "Park",
    STATEFP: "56",
  },
  {
    COUNTYFP: "019",
    NAME: "Johnson",
    STATEFP: "56",
  },
  {
    COUNTYFP: "027",
    NAME: "Niobrara",
    STATEFP: "56",
  },
  {
    COUNTYFP: "025",
    NAME: "Natrona",
    STATEFP: "56",
  },
  {
    COUNTYFP: "021",
    NAME: "Laramie",
    STATEFP: "56",
  },
  {
    COUNTYFP: "041",
    NAME: "Uinta",
    STATEFP: "56",
  },
  {
    COUNTYFP: "005",
    NAME: "Campbell",
    STATEFP: "56",
  },
  {
    COUNTYFP: "039",
    NAME: "Teton",
    STATEFP: "56",
  },
  {
    COUNTYFP: "001",
    NAME: "Albany",
    STATEFP: "56",
  },
  {
    COUNTYFP: "013",
    NAME: "Fremont",
    STATEFP: "56",
  },
  {
    COUNTYFP: "037",
    NAME: "Sweetwater",
    STATEFP: "56",
  },
  {
    COUNTYFP: "033",
    NAME: "Sheridan",
    STATEFP: "56",
  },
  {
    COUNTYFP: "020",
    NAME: "Manu'a",
    STATEFP: "60",
  },
  {
    COUNTYFP: "010",
    NAME: "Eastern",
    STATEFP: "60",
  },
  {
    COUNTYFP: "050",
    NAME: "Western",
    STATEFP: "60",
  },
  {
    COUNTYFP: "100",
    NAME: "Rota",
    STATEFP: "69",
  },
  {
    COUNTYFP: "120",
    NAME: "Tinian",
    STATEFP: "69",
  },
  {
    COUNTYFP: "085",
    NAME: "Northern Islands",
    STATEFP: "69",
  },
  {
    COUNTYFP: "110",
    NAME: "Saipan",
    STATEFP: "69",
  },
  {
    COUNTYFP: "005",
    NAME: "Kalawao",
    STATEFP: "15",
  },
  {
    COUNTYFP: "040",
    NAME: "Swains Island",
    STATEFP: "60",
  },
  {
    COUNTYFP: "030",
    NAME: "Rose Island",
    STATEFP: "60",
  },
  {
    COUNTYFP: "010",
    NAME: "Guam",
    STATEFP: "66",
  },
  {
    COUNTYFP: "290",
    NAME: "Yukon-Koyukuk",
    STATEFP: "02",
  },
  {
    COUNTYFP: "198",
    NAME: "Prince of Wales-Hyder",
    STATEFP: "02",
  },
  {
    COUNTYFP: "240",
    NAME: "Southeast Fairbanks",
    STATEFP: "02",
  },
  {
    COUNTYFP: "261",
    NAME: "Valdez-Cordova",
    STATEFP: "02",
  },
  {
    COUNTYFP: "050",
    NAME: "Bethel",
    STATEFP: "02",
  },
  {
    COUNTYFP: "070",
    NAME: "Dillingham",
    STATEFP: "02",
  },
  {
    COUNTYFP: "105",
    NAME: "Hoonah-Angoon",
    STATEFP: "02",
  },
  {
    COUNTYFP: "158",
    NAME: "Kusilvak",
    STATEFP: "02",
  },
  {
    COUNTYFP: "180",
    NAME: "Nome",
    STATEFP: "02",
  },
  {
    COUNTYFP: "016",
    NAME: "Aleutians West",
    STATEFP: "02",
  },
  {
    COUNTYFP: "220",
    NAME: "Sitka",
    STATEFP: "02",
  },
  {
    COUNTYFP: "275",
    NAME: "Wrangell",
    STATEFP: "02",
  },
  {
    COUNTYFP: "020",
    NAME: "Anchorage",
    STATEFP: "02",
  },
  {
    COUNTYFP: "110",
    NAME: "Juneau",
    STATEFP: "02",
  },
  {
    COUNTYFP: "075",
    NAME: "San Francisco",
    STATEFP: "06",
  },
  {
    COUNTYFP: "031",
    NAME: "Denver",
    STATEFP: "08",
  },
  {
    COUNTYFP: "014",
    NAME: "Broomfield",
    STATEFP: "08",
  },
  {
    COUNTYFP: "031",
    NAME: "Duval",
    STATEFP: "12",
  },
  {
    COUNTYFP: "307",
    NAME: "Webster",
    STATEFP: "13",
  },
  {
    COUNTYFP: "245",
    NAME: "Richmond",
    STATEFP: "13",
  },
  {
    COUNTYFP: "239",
    NAME: "Quitman",
    STATEFP: "13",
  },
  {
    COUNTYFP: "101",
    NAME: "Echols",
    STATEFP: "13",
  },
  {
    COUNTYFP: "059",
    NAME: "Clarke",
    STATEFP: "13",
  },
  {
    COUNTYFP: "021",
    NAME: "Bibb",
    STATEFP: "13",
  },
  {
    COUNTYFP: "053",
    NAME: "Chattahoochee",
    STATEFP: "13",
  },
  {
    COUNTYFP: "215",
    NAME: "Muscogee",
    STATEFP: "13",
  },
  {
    COUNTYFP: "003",
    NAME: "Honolulu",
    STATEFP: "15",
  },
  {
    COUNTYFP: "097",
    NAME: "Marion",
    STATEFP: "18",
  },
  {
    COUNTYFP: "071",
    NAME: "Greeley",
    STATEFP: "20",
  },
  {
    COUNTYFP: "209",
    NAME: "Wyandotte",
    STATEFP: "20",
  },
  {
    COUNTYFP: "067",
    NAME: "Fayette",
    STATEFP: "21",
  },
  {
    COUNTYFP: "111",
    NAME: "Jefferson",
    STATEFP: "21",
  },
  {
    COUNTYFP: "033",
    NAME: "East Baton Rouge",
    STATEFP: "22",
  },
  {
    COUNTYFP: "109",
    NAME: "Terrebonne",
    STATEFP: "22",
  },
  {
    COUNTYFP: "071",
    NAME: "Orleans",
    STATEFP: "22",
  },
  {
    COUNTYFP: "055",
    NAME: "Lafayette",
    STATEFP: "22",
  },
  {
    COUNTYFP: "023",
    NAME: "Deer Lodge",
    STATEFP: "30",
  },
  {
    COUNTYFP: "093",
    NAME: "Silver Bow",
    STATEFP: "30",
  },
  {
    COUNTYFP: "169",
    NAME: "Trousdale",
    STATEFP: "47",
  },
  {
    COUNTYFP: "037",
    NAME: "Davidson",
    STATEFP: "47",
  },
  {
    COUNTYFP: "127",
    NAME: "Moore",
    STATEFP: "47",
  },
  {
    COUNTYFP: "033",
    NAME: "Clearfield",
    STATEFP: "42",
  },
  {
    COUNTYFP: "027",
    NAME: "Centre",
    STATEFP: "42",
  },
  {
    COUNTYFP: "011",
    NAME: "Cayuga",
    STATEFP: "36",
  },
  {
    COUNTYFP: "075",
    NAME: "Oswego",
    STATEFP: "36",
  },
  {
    COUNTYFP: "053",
    NAME: "Madison",
    STATEFP: "36",
  },
  {
    COUNTYFP: "067",
    NAME: "Onondaga",
    STATEFP: "36",
  },
  {
    COUNTYFP: "029",
    NAME: "Camden",
    STATEFP: "37",
  },
  {
    COUNTYFP: "139",
    NAME: "Pasquotank",
    STATEFP: "37",
  },
  {
    COUNTYFP: "143",
    NAME: "Perquimans",
    STATEFP: "37",
  },
  {
    COUNTYFP: "177",
    NAME: "Tyrrell",
    STATEFP: "37",
  },
  {
    COUNTYFP: "055",
    NAME: "Dare",
    STATEFP: "37",
  },
  {
    COUNTYFP: "073",
    NAME: "Gates",
    STATEFP: "37",
  },
  {
    COUNTYFP: "053",
    NAME: "Currituck",
    STATEFP: "37",
  },
  {
    COUNTYFP: "095",
    NAME: "James City",
    STATEFP: "51",
  },
  {
    COUNTYFP: "073",
    NAME: "Gloucester",
    STATEFP: "51",
  },
  {
    COUNTYFP: "093",
    NAME: "Isle of Wight",
    STATEFP: "51",
  },
  {
    COUNTYFP: "199",
    NAME: "York",
    STATEFP: "51",
  },
  {
    COUNTYFP: "115",
    NAME: "Mathews",
    STATEFP: "51",
  },
  {
    COUNTYFP: "005",
    NAME: "Baltimore",
    STATEFP: "24",
  },
  {
    COUNTYFP: "013",
    NAME: "Carroll",
    STATEFP: "24",
  },
  {
    COUNTYFP: "003",
    NAME: "Anne Arundel",
    STATEFP: "24",
  },
  {
    COUNTYFP: "027",
    NAME: "Howard",
    STATEFP: "24",
  },
  {
    COUNTYFP: "035",
    NAME: "Queen Anne's",
    STATEFP: "24",
  },
  {
    COUNTYFP: "025",
    NAME: "Harford",
    STATEFP: "24",
  },
  {
    COUNTYFP: "037",
    NAME: "St. Mary's",
    STATEFP: "24",
  },
  {
    COUNTYFP: "019",
    NAME: "Dorchester",
    STATEFP: "24",
  },
  {
    COUNTYFP: "041",
    NAME: "Talbot",
    STATEFP: "24",
  },
  {
    COUNTYFP: "043",
    NAME: "Washington",
    STATEFP: "24",
  },
  {
    COUNTYFP: "009",
    NAME: "Calvert",
    STATEFP: "24",
  },
  {
    COUNTYFP: "021",
    NAME: "Frederick",
    STATEFP: "24",
  },
  {
    COUNTYFP: "033",
    NAME: "Prince George's",
    STATEFP: "24",
  },
  {
    COUNTYFP: "031",
    NAME: "Montgomery",
    STATEFP: "24",
  },
  {
    COUNTYFP: "017",
    NAME: "Charles",
    STATEFP: "24",
  },
  {
    COUNTYFP: "055",
    NAME: "Franklin",
    STATEFP: "42",
  },
  {
    COUNTYFP: "179",
    NAME: "Stafford",
    STATEFP: "51",
  },
  {
    COUNTYFP: "157",
    NAME: "Rappahannock",
    STATEFP: "51",
  },
  {
    COUNTYFP: "061",
    NAME: "Fauquier",
    STATEFP: "51",
  },
  {
    COUNTYFP: "153",
    NAME: "Prince William",
    STATEFP: "51",
  },
  {
    COUNTYFP: "013",
    NAME: "Arlington",
    STATEFP: "51",
  },
  {
    COUNTYFP: "059",
    NAME: "Fairfax",
    STATEFP: "51",
  },
  {
    COUNTYFP: "107",
    NAME: "Loudoun",
    STATEFP: "51",
  },
  {
    COUNTYFP: "047",
    NAME: "Culpeper",
    STATEFP: "51",
  },
  {
    COUNTYFP: "187",
    NAME: "Warren",
    STATEFP: "51",
  },
  {
    COUNTYFP: "177",
    NAME: "Spotsylvania",
    STATEFP: "51",
  },
  {
    COUNTYFP: "043",
    NAME: "Clarke",
    STATEFP: "51",
  },
  {
    COUNTYFP: "069",
    NAME: "Frederick",
    STATEFP: "51",
  },
  {
    COUNTYFP: "003",
    NAME: "Berkeley",
    STATEFP: "54",
  },
  {
    COUNTYFP: "037",
    NAME: "Jefferson",
    STATEFP: "54",
  },
  {
    COUNTYFP: "027",
    NAME: "Hampshire",
    STATEFP: "54",
  },
  {
    COUNTYFP: "035",
    NAME: "Clinton",
    STATEFP: "42",
  },
  {
    COUNTYFP: "081",
    NAME: "Lycoming",
    STATEFP: "42",
  },
  {
    COUNTYFP: "011",
    NAME: "Caroline",
    STATEFP: "24",
  },
  {
    COUNTYFP: "029",
    NAME: "Kent",
    STATEFP: "24",
  },
  {
    COUNTYFP: "001",
    NAME: "Allegany",
    STATEFP: "24",
  },
  {
    COUNTYFP: "047",
    NAME: "Worcester",
    STATEFP: "24",
  },
  {
    COUNTYFP: "045",
    NAME: "Wicomico",
    STATEFP: "24",
  },
  {
    COUNTYFP: "039",
    NAME: "Somerset",
    STATEFP: "24",
  },
  {
    COUNTYFP: "007",
    NAME: "Dukes",
    STATEFP: "25",
  },
  {
    COUNTYFP: "019",
    NAME: "Brunswick",
    STATEFP: "37",
  },
  {
    COUNTYFP: "051",
    NAME: "Horry",
    STATEFP: "45",
  },
  {
    COUNTYFP: "031",
    NAME: "Carteret",
    STATEFP: "37",
  },
  {
    COUNTYFP: "137",
    NAME: "Pamlico",
    STATEFP: "37",
  },
  {
    COUNTYFP: "049",
    NAME: "Craven",
    STATEFP: "37",
  },
  {
    COUNTYFP: "103",
    NAME: "Jones",
    STATEFP: "37",
  },
  {
    COUNTYFP: "041",
    NAME: "Warren",
    STATEFP: "34",
  },
  {
    COUNTYFP: "037",
    NAME: "Sussex",
    STATEFP: "34",
  },
  {
    COUNTYFP: "039",
    NAME: "Union",
    STATEFP: "34",
  },
  {
    COUNTYFP: "023",
    NAME: "Middlesex",
    STATEFP: "34",
  },
  {
    COUNTYFP: "017",
    NAME: "Hudson",
    STATEFP: "34",
  },
  {
    COUNTYFP: "025",
    NAME: "Monmouth",
    STATEFP: "34",
  },
  {
    COUNTYFP: "035",
    NAME: "Somerset",
    STATEFP: "34",
  },
  {
    COUNTYFP: "029",
    NAME: "Ocean",
    STATEFP: "34",
  },
  {
    COUNTYFP: "019",
    NAME: "Hunterdon",
    STATEFP: "34",
  },
  {
    COUNTYFP: "027",
    NAME: "Morris",
    STATEFP: "34",
  },
  {
    COUNTYFP: "013",
    NAME: "Essex",
    STATEFP: "34",
  },
  {
    COUNTYFP: "003",
    NAME: "Bergen",
    STATEFP: "34",
  },
  {
    COUNTYFP: "031",
    NAME: "Passaic",
    STATEFP: "34",
  },
  {
    COUNTYFP: "021",
    NAME: "Mercer",
    STATEFP: "34",
  },
  {
    COUNTYFP: "111",
    NAME: "Ulster",
    STATEFP: "36",
  },
  {
    COUNTYFP: "103",
    NAME: "Suffolk",
    STATEFP: "36",
  },
  {
    COUNTYFP: "027",
    NAME: "Dutchess",
    STATEFP: "36",
  },
  {
    COUNTYFP: "059",
    NAME: "Nassau",
    STATEFP: "36",
  },
  {
    COUNTYFP: "119",
    NAME: "Westchester",
    STATEFP: "36",
  },
  {
    COUNTYFP: "079",
    NAME: "Putnam",
    STATEFP: "36",
  },
  {
    COUNTYFP: "087",
    NAME: "Rockland",
    STATEFP: "36",
  },
  {
    COUNTYFP: "071",
    NAME: "Orange",
    STATEFP: "36",
  },
  {
    COUNTYFP: "025",
    NAME: "Carbon",
    STATEFP: "42",
  },
  {
    COUNTYFP: "077",
    NAME: "Lehigh",
    STATEFP: "42",
  },
  {
    COUNTYFP: "095",
    NAME: "Northampton",
    STATEFP: "42",
  },
  {
    COUNTYFP: "089",
    NAME: "Monroe",
    STATEFP: "42",
  },
  {
    COUNTYFP: "103",
    NAME: "Pike",
    STATEFP: "42",
  },
  {
    COUNTYFP: "001",
    NAME: "Kent",
    STATEFP: "10",
  },
  {
    COUNTYFP: "003",
    NAME: "New Castle",
    STATEFP: "10",
  },
  {
    COUNTYFP: "015",
    NAME: "Cecil",
    STATEFP: "24",
  },
  {
    COUNTYFP: "001",
    NAME: "Atlantic",
    STATEFP: "34",
  },
  {
    COUNTYFP: "009",
    NAME: "Cape May",
    STATEFP: "34",
  },
  {
    COUNTYFP: "007",
    NAME: "Camden",
    STATEFP: "34",
  },
  {
    COUNTYFP: "005",
    NAME: "Burlington",
    STATEFP: "34",
  },
  {
    COUNTYFP: "015",
    NAME: "Gloucester",
    STATEFP: "34",
  },
  {
    COUNTYFP: "033",
    NAME: "Salem",
    STATEFP: "34",
  },
  {
    COUNTYFP: "011",
    NAME: "Cumberland",
    STATEFP: "34",
  },
  {
    COUNTYFP: "029",
    NAME: "Chester",
    STATEFP: "42",
  },
  {
    COUNTYFP: "091",
    NAME: "Montgomery",
    STATEFP: "42",
  },
  {
    COUNTYFP: "045",
    NAME: "Delaware",
    STATEFP: "42",
  },
  {
    COUNTYFP: "017",
    NAME: "Bucks",
    STATEFP: "42",
  },
  {
    COUNTYFP: "011",
    NAME: "Berks",
    STATEFP: "42",
  },
  {
    COUNTYFP: "085",
    NAME: "Harnett",
    STATEFP: "37",
  },
  {
    COUNTYFP: "063",
    NAME: "Durham",
    STATEFP: "37",
  },
  {
    COUNTYFP: "145",
    NAME: "Person",
    STATEFP: "37",
  },
  {
    COUNTYFP: "135",
    NAME: "Orange",
    STATEFP: "37",
  },
  {
    COUNTYFP: "181",
    NAME: "Vance",
    STATEFP: "37",
  },
  {
    COUNTYFP: "077",
    NAME: "Granville",
    STATEFP: "37",
  },
  {
    COUNTYFP: "069",
    NAME: "Franklin",
    STATEFP: "37",
  },
  {
    COUNTYFP: "101",
    NAME: "Johnston",
    STATEFP: "37",
  },
  {
    COUNTYFP: "183",
    NAME: "Wake",
    STATEFP: "37",
  },
  {
    COUNTYFP: "105",
    NAME: "Lee",
    STATEFP: "37",
  },
  {
    COUNTYFP: "037",
    NAME: "Genesee",
    STATEFP: "36",
  },
  {
    COUNTYFP: "069",
    NAME: "Ontario",
    STATEFP: "36",
  },
  {
    COUNTYFP: "073",
    NAME: "Orleans",
    STATEFP: "36",
  },
  {
    COUNTYFP: "051",
    NAME: "Livingston",
    STATEFP: "36",
  },
  {
    COUNTYFP: "123",
    NAME: "Yates",
    STATEFP: "36",
  },
  {
    COUNTYFP: "055",
    NAME: "Monroe",
    STATEFP: "36",
  },
  {
    COUNTYFP: "117",
    NAME: "Wayne",
    STATEFP: "36",
  },
  {
    COUNTYFP: "099",
    NAME: "Seneca",
    STATEFP: "36",
  },
  {
    COUNTYFP: "131",
    NAME: "Northampton",
    STATEFP: "37",
  },
  {
    COUNTYFP: "083",
    NAME: "Halifax",
    STATEFP: "37",
  },
  {
    COUNTYFP: "127",
    NAME: "Nash",
    STATEFP: "37",
  },
  {
    COUNTYFP: "065",
    NAME: "Edgecombe",
    STATEFP: "37",
  },
  {
    COUNTYFP: "195",
    NAME: "Wilson",
    STATEFP: "37",
  },
  {
    COUNTYFP: "023",
    NAME: "Cameron",
    STATEFP: "42",
  },
  {
    COUNTYFP: "057",
    NAME: "Fulton",
    STATEFP: "42",
  },
  {
    COUNTYFP: "025",
    NAME: "Windham",
    STATEFP: "50",
  },
  {
    COUNTYFP: "003",
    NAME: "Bennington",
    STATEFP: "50",
  },
  {
    COUNTYFP: "181",
    NAME: "Surry",
    STATEFP: "51",
  },
  {
    COUNTYFP: "097",
    NAME: "King and Queen",
    STATEFP: "51",
  },
  {
    COUNTYFP: "119",
    NAME: "Middlesex",
    STATEFP: "51",
  },
  {
    COUNTYFP: "057",
    NAME: "Essex",
    STATEFP: "51",
  },
  {
    COUNTYFP: "133",
    NAME: "Northumberland",
    STATEFP: "51",
  },
  {
    COUNTYFP: "137",
    NAME: "Orange",
    STATEFP: "51",
  },
  {
    COUNTYFP: "113",
    NAME: "Madison",
    STATEFP: "51",
  },
  {
    COUNTYFP: "111",
    NAME: "Lunenburg",
    STATEFP: "51",
  },
  {
    COUNTYFP: "037",
    NAME: "Charlotte",
    STATEFP: "51",
  },
  {
    COUNTYFP: "049",
    NAME: "Cumberland",
    STATEFP: "51",
  },
  {
    COUNTYFP: "083",
    NAME: "Halifax",
    STATEFP: "51",
  },
  {
    COUNTYFP: "171",
    NAME: "Shenandoah",
    STATEFP: "51",
  },
  {
    COUNTYFP: "175",
    NAME: "Southampton",
    STATEFP: "51",
  },
  {
    COUNTYFP: "131",
    NAME: "Northampton",
    STATEFP: "51",
  },
  {
    COUNTYFP: "025",
    NAME: "Brunswick",
    STATEFP: "51",
  },
  {
    COUNTYFP: "103",
    NAME: "Lancaster",
    STATEFP: "51",
  },
  {
    COUNTYFP: "159",
    NAME: "Richmond",
    STATEFP: "51",
  },
  {
    COUNTYFP: "117",
    NAME: "Mecklenburg",
    STATEFP: "51",
  },
  {
    COUNTYFP: "001",
    NAME: "Accomack",
    STATEFP: "51",
  },
  {
    COUNTYFP: "081",
    NAME: "Greensville",
    STATEFP: "51",
  },
  {
    COUNTYFP: "139",
    NAME: "Page",
    STATEFP: "51",
  },
  {
    COUNTYFP: "193",
    NAME: "Westmoreland",
    STATEFP: "51",
  },
  {
    COUNTYFP: "135",
    NAME: "Nottoway",
    STATEFP: "51",
  },
  {
    COUNTYFP: "099",
    NAME: "King George",
    STATEFP: "51",
  },
  {
    COUNTYFP: "147",
    NAME: "Prince Edward",
    STATEFP: "51",
  },
  {
    COUNTYFP: "109",
    NAME: "Louisa",
    STATEFP: "51",
  },
  {
    COUNTYFP: "029",
    NAME: "Buckingham",
    STATEFP: "51",
  },
  {
    COUNTYFP: "079",
    NAME: "Greene",
    STATEFP: "51",
  },
  {
    COUNTYFP: "003",
    NAME: "Albemarle",
    STATEFP: "51",
  },
  {
    COUNTYFP: "125",
    NAME: "Nelson",
    STATEFP: "51",
  },
  {
    COUNTYFP: "065",
    NAME: "Fluvanna",
    STATEFP: "51",
  },
  {
    COUNTYFP: "011",
    NAME: "Appomattox",
    STATEFP: "51",
  },
  {
    COUNTYFP: "085",
    NAME: "Hanover",
    STATEFP: "51",
  },
  {
    COUNTYFP: "145",
    NAME: "Powhatan",
    STATEFP: "51",
  },
  {
    COUNTYFP: "075",
    NAME: "Goochland",
    STATEFP: "51",
  },
  {
    COUNTYFP: "101",
    NAME: "King William",
    STATEFP: "51",
  },
  {
    COUNTYFP: "087",
    NAME: "Henrico",
    STATEFP: "51",
  },
  {
    COUNTYFP: "127",
    NAME: "New Kent",
    STATEFP: "51",
  },
  {
    COUNTYFP: "036",
    NAME: "Charles City",
    STATEFP: "51",
  },
  {
    COUNTYFP: "183",
    NAME: "Sussex",
    STATEFP: "51",
  },
  {
    COUNTYFP: "041",
    NAME: "Chesterfield",
    STATEFP: "51",
  },
  {
    COUNTYFP: "149",
    NAME: "Prince George",
    STATEFP: "51",
  },
  {
    COUNTYFP: "033",
    NAME: "Caroline",
    STATEFP: "51",
  },
  {
    COUNTYFP: "053",
    NAME: "Dinwiddie",
    STATEFP: "51",
  },
  {
    COUNTYFP: "007",
    NAME: "Amelia",
    STATEFP: "51",
  },
  {
    COUNTYFP: "031",
    NAME: "Hardy",
    STATEFP: "54",
  },
  {
    COUNTYFP: "057",
    NAME: "Mineral",
    STATEFP: "54",
  },
  {
    COUNTYFP: "091",
    NAME: "Saratoga",
    STATEFP: "36",
  },
  {
    COUNTYFP: "001",
    NAME: "Albany",
    STATEFP: "36",
  },
  {
    COUNTYFP: "093",
    NAME: "Schenectady",
    STATEFP: "36",
  },
  {
    COUNTYFP: "095",
    NAME: "Schoharie",
    STATEFP: "36",
  },
  {
    COUNTYFP: "083",
    NAME: "Rensselaer",
    STATEFP: "36",
  },
  {
    COUNTYFP: "057",
    NAME: "Montgomery",
    STATEFP: "36",
  },
  {
    COUNTYFP: "035",
    NAME: "Fulton",
    STATEFP: "36",
  },
  {
    COUNTYFP: "021",
    NAME: "Columbia",
    STATEFP: "36",
  },
  {
    COUNTYFP: "037",
    NAME: "Columbia",
    STATEFP: "42",
  },
  {
    COUNTYFP: "093",
    NAME: "Montour",
    STATEFP: "42",
  },
  {
    COUNTYFP: "119",
    NAME: "Union",
    STATEFP: "42",
  },
  {
    COUNTYFP: "109",
    NAME: "Snyder",
    STATEFP: "42",
  },
  {
    COUNTYFP: "097",
    NAME: "Northumberland",
    STATEFP: "42",
  },
  {
    COUNTYFP: "001",
    NAME: "Barnstable",
    STATEFP: "25",
  },
  {
    COUNTYFP: "021",
    NAME: "Norfolk",
    STATEFP: "25",
  },
  {
    COUNTYFP: "023",
    NAME: "Plymouth",
    STATEFP: "25",
  },
  {
    COUNTYFP: "005",
    NAME: "Bristol",
    STATEFP: "25",
  },
  {
    COUNTYFP: "015",
    NAME: "Rockingham",
    STATEFP: "33",
  },
  {
    COUNTYFP: "011",
    NAME: "Hillsborough",
    STATEFP: "33",
  },
  {
    COUNTYFP: "029",
    NAME: "Erie",
    STATEFP: "36",
  },
  {
    COUNTYFP: "063",
    NAME: "Niagara",
    STATEFP: "36",
  },
  {
    COUNTYFP: "009",
    NAME: "Cattaraugus",
    STATEFP: "36",
  },
  {
    COUNTYFP: "005",
    NAME: "Sussex",
    STATEFP: "10",
  },
  {
    COUNTYFP: "065",
    NAME: "Morgan",
    STATEFP: "54",
  },
  {
    COUNTYFP: "023",
    NAME: "Cortland",
    STATEFP: "36",
  },
  {
    COUNTYFP: "109",
    NAME: "Tompkins",
    STATEFP: "36",
  },
  {
    COUNTYFP: "021",
    NAME: "Cambria",
    STATEFP: "42",
  },
  {
    COUNTYFP: "019",
    NAME: "Sullivan",
    STATEFP: "33",
  },
  {
    COUNTYFP: "005",
    NAME: "Cheshire",
    STATEFP: "33",
  },
  {
    COUNTYFP: "003",
    NAME: "Allegany",
    STATEFP: "36",
  },
  {
    COUNTYFP: "097",
    NAME: "Schuyler",
    STATEFP: "36",
  },
  {
    COUNTYFP: "039",
    NAME: "Greene",
    STATEFP: "36",
  },
  {
    COUNTYFP: "105",
    NAME: "Sullivan",
    STATEFP: "36",
  },
  {
    COUNTYFP: "025",
    NAME: "Delaware",
    STATEFP: "36",
  },
  {
    COUNTYFP: "121",
    NAME: "Wyoming",
    STATEFP: "36",
  },
  {
    COUNTYFP: "017",
    NAME: "Chenango",
    STATEFP: "36",
  },
  {
    COUNTYFP: "107",
    NAME: "Tioga",
    STATEFP: "36",
  },
  {
    COUNTYFP: "007",
    NAME: "Broome",
    STATEFP: "36",
  },
  {
    COUNTYFP: "077",
    NAME: "Otsego",
    STATEFP: "36",
  },
  {
    COUNTYFP: "065",
    NAME: "Oneida",
    STATEFP: "36",
  },
  {
    COUNTYFP: "163",
    NAME: "Sampson",
    STATEFP: "37",
  },
  {
    COUNTYFP: "185",
    NAME: "Warren",
    STATEFP: "37",
  },
  {
    COUNTYFP: "187",
    NAME: "Washington",
    STATEFP: "37",
  },
  {
    COUNTYFP: "061",
    NAME: "Duplin",
    STATEFP: "37",
  },
  {
    COUNTYFP: "091",
    NAME: "Hertford",
    STATEFP: "37",
  },
  {
    COUNTYFP: "017",
    NAME: "Bladen",
    STATEFP: "37",
  },
  {
    COUNTYFP: "095",
    NAME: "Hyde",
    STATEFP: "37",
  },
  {
    COUNTYFP: "015",
    NAME: "Bertie",
    STATEFP: "37",
  },
  {
    COUNTYFP: "079",
    NAME: "Greene",
    STATEFP: "37",
  },
  {
    COUNTYFP: "041",
    NAME: "Chowan",
    STATEFP: "37",
  },
  {
    COUNTYFP: "117",
    NAME: "Martin",
    STATEFP: "37",
  },
  {
    COUNTYFP: "047",
    NAME: "Columbus",
    STATEFP: "37",
  },
  {
    COUNTYFP: "191",
    NAME: "Wayne",
    STATEFP: "37",
  },
  {
    COUNTYFP: "133",
    NAME: "Onslow",
    STATEFP: "37",
  },
  {
    COUNTYFP: "107",
    NAME: "Lenoir",
    STATEFP: "37",
  },
  {
    COUNTYFP: "129",
    NAME: "New Hanover",
    STATEFP: "37",
  },
  {
    COUNTYFP: "141",
    NAME: "Pender",
    STATEFP: "37",
  },
  {
    COUNTYFP: "117",
    NAME: "Tioga",
    STATEFP: "42",
  },
  {
    COUNTYFP: "127",
    NAME: "Wayne",
    STATEFP: "42",
  },
  {
    COUNTYFP: "065",
    NAME: "Jefferson",
    STATEFP: "42",
  },
  {
    COUNTYFP: "101",
    NAME: "Steuben",
    STATEFP: "36",
  },
  {
    COUNTYFP: "015",
    NAME: "Chemung",
    STATEFP: "36",
  },
  {
    COUNTYFP: "051",
    NAME: "Cumberland",
    STATEFP: "37",
  },
  {
    COUNTYFP: "147",
    NAME: "Pitt",
    STATEFP: "37",
  },
  {
    COUNTYFP: "013",
    NAME: "Beaufort",
    STATEFP: "37",
  },
  {
    COUNTYFP: "001",
    NAME: "Adams",
    STATEFP: "42",
  },
  {
    COUNTYFP: "043",
    NAME: "Dauphin",
    STATEFP: "42",
  },
  {
    COUNTYFP: "099",
    NAME: "Perry",
    STATEFP: "42",
  },
  {
    COUNTYFP: "041",
    NAME: "Cumberland",
    STATEFP: "42",
  },
  {
    COUNTYFP: "075",
    NAME: "Lebanon",
    STATEFP: "42",
  },
  {
    COUNTYFP: "133",
    NAME: "York",
    STATEFP: "42",
  },
  {
    COUNTYFP: "165",
    NAME: "Rockingham",
    STATEFP: "51",
  },
  {
    COUNTYFP: "009",
    NAME: "Bedford",
    STATEFP: "42",
  },
  {
    COUNTYFP: "113",
    NAME: "Sullivan",
    STATEFP: "42",
  },
  {
    COUNTYFP: "067",
    NAME: "Juniata",
    STATEFP: "42",
  },
  {
    COUNTYFP: "115",
    NAME: "Susquehanna",
    STATEFP: "42",
  },
  {
    COUNTYFP: "105",
    NAME: "Potter",
    STATEFP: "42",
  },
  {
    COUNTYFP: "013",
    NAME: "Blair",
    STATEFP: "42",
  },
  {
    COUNTYFP: "083",
    NAME: "McKean",
    STATEFP: "42",
  },
  {
    COUNTYFP: "061",
    NAME: "Huntingdon",
    STATEFP: "42",
  },
  {
    COUNTYFP: "071",
    NAME: "Lancaster",
    STATEFP: "42",
  },
  {
    COUNTYFP: "087",
    NAME: "Mifflin",
    STATEFP: "42",
  },
  {
    COUNTYFP: "107",
    NAME: "Schuylkill",
    STATEFP: "42",
  },
  {
    COUNTYFP: "047",
    NAME: "Elk",
    STATEFP: "42",
  },
  {
    COUNTYFP: "015",
    NAME: "Bradford",
    STATEFP: "42",
  },
  {
    COUNTYFP: "069",
    NAME: "Lackawanna",
    STATEFP: "42",
  },
  {
    COUNTYFP: "131",
    NAME: "Wyoming",
    STATEFP: "42",
  },
  {
    COUNTYFP: "079",
    NAME: "Luzerne",
    STATEFP: "42",
  },
  {
    COUNTYFP: "115",
    NAME: "Quebradillas",
    STATEFP: "72",
  },
  {
    COUNTYFP: "065",
    NAME: "Hatillo",
    STATEFP: "72",
  },
  {
    COUNTYFP: "013",
    NAME: "Arecibo",
    STATEFP: "72",
  },
  {
    COUNTYFP: "027",
    NAME: "Camuy",
    STATEFP: "72",
  },
  {
    COUNTYFP: "123",
    NAME: "Salinas",
    STATEFP: "72",
  },
  {
    COUNTYFP: "109",
    NAME: "Patillas",
    STATEFP: "72",
  },
  {
    COUNTYFP: "057",
    NAME: "Guayama",
    STATEFP: "72",
  },
  {
    COUNTYFP: "015",
    NAME: "Arroyo",
    STATEFP: "72",
  },
  {
    COUNTYFP: "085",
    NAME: "Las Piedras",
    STATEFP: "72",
  },
  {
    COUNTYFP: "105",
    NAME: "Naranjito",
    STATEFP: "72",
  },
  {
    COUNTYFP: "053",
    NAME: "Fajardo",
    STATEFP: "72",
  },
  {
    COUNTYFP: "151",
    NAME: "Yabucoa",
    STATEFP: "72",
  },
  {
    COUNTYFP: "127",
    NAME: "San Juan",
    STATEFP: "72",
  },
  {
    COUNTYFP: "051",
    NAME: "Dorado",
    STATEFP: "72",
  },
  {
    COUNTYFP: "039",
    NAME: "Ciales",
    STATEFP: "72",
  },
  {
    COUNTYFP: "139",
    NAME: "Trujillo Alto",
    STATEFP: "72",
  },
  {
    COUNTYFP: "029",
    NAME: "Canóvanas",
    STATEFP: "72",
  },
  {
    COUNTYFP: "103",
    NAME: "Naguabo",
    STATEFP: "72",
  },
  {
    COUNTYFP: "019",
    NAME: "Barranquitas",
    STATEFP: "72",
  },
  {
    COUNTYFP: "009",
    NAME: "Aibonito",
    STATEFP: "72",
  },
  {
    COUNTYFP: "021",
    NAME: "Bayamón",
    STATEFP: "72",
  },
  {
    COUNTYFP: "145",
    NAME: "Vega Baja",
    STATEFP: "72",
  },
  {
    COUNTYFP: "069",
    NAME: "Humacao",
    STATEFP: "72",
  },
  {
    COUNTYFP: "077",
    NAME: "Juncos",
    STATEFP: "72",
  },
  {
    COUNTYFP: "037",
    NAME: "Ceiba",
    STATEFP: "72",
  },
  {
    COUNTYFP: "047",
    NAME: "Corozal",
    STATEFP: "72",
  },
  {
    COUNTYFP: "107",
    NAME: "Orocovis",
    STATEFP: "72",
  },
  {
    COUNTYFP: "129",
    NAME: "San Lorenzo",
    STATEFP: "72",
  },
  {
    COUNTYFP: "135",
    NAME: "Toa Alta",
    STATEFP: "72",
  },
  {
    COUNTYFP: "095",
    NAME: "Maunabo",
    STATEFP: "72",
  },
  {
    COUNTYFP: "091",
    NAME: "Manatí",
    STATEFP: "72",
  },
  {
    COUNTYFP: "087",
    NAME: "Loíza",
    STATEFP: "72",
  },
  {
    COUNTYFP: "041",
    NAME: "Cidra",
    STATEFP: "72",
  },
  {
    COUNTYFP: "063",
    NAME: "Gurabo",
    STATEFP: "72",
  },
  {
    COUNTYFP: "089",
    NAME: "Luquillo",
    STATEFP: "72",
  },
  {
    COUNTYFP: "143",
    NAME: "Vega Alta",
    STATEFP: "72",
  },
  {
    COUNTYFP: "137",
    NAME: "Toa Baja",
    STATEFP: "72",
  },
  {
    COUNTYFP: "061",
    NAME: "Guaynabo",
    STATEFP: "72",
  },
  {
    COUNTYFP: "017",
    NAME: "Barceloneta",
    STATEFP: "72",
  },
  {
    COUNTYFP: "035",
    NAME: "Cayey",
    STATEFP: "72",
  },
  {
    COUNTYFP: "031",
    NAME: "Carolina",
    STATEFP: "72",
  },
  {
    COUNTYFP: "054",
    NAME: "Florida",
    STATEFP: "72",
  },
  {
    COUNTYFP: "025",
    NAME: "Caguas",
    STATEFP: "72",
  },
  {
    COUNTYFP: "119",
    NAME: "Río Grande",
    STATEFP: "72",
  },
  {
    COUNTYFP: "045",
    NAME: "Comerío",
    STATEFP: "72",
  },
  {
    COUNTYFP: "007",
    NAME: "Aguas Buenas",
    STATEFP: "72",
  },
  {
    COUNTYFP: "033",
    NAME: "Cataño",
    STATEFP: "72",
  },
  {
    COUNTYFP: "101",
    NAME: "Morovis",
    STATEFP: "72",
  },
  {
    COUNTYFP: "001",
    NAME: "Adjuntas",
    STATEFP: "72",
  },
  {
    COUNTYFP: "043",
    NAME: "Coamo",
    STATEFP: "72",
  },
  {
    COUNTYFP: "055",
    NAME: "Guánica",
    STATEFP: "72",
  },
  {
    COUNTYFP: "153",
    NAME: "Yauco",
    STATEFP: "72",
  },
  {
    COUNTYFP: "111",
    NAME: "Peñuelas",
    STATEFP: "72",
  },
  {
    COUNTYFP: "113",
    NAME: "Ponce",
    STATEFP: "72",
  },
  {
    COUNTYFP: "059",
    NAME: "Guayanilla",
    STATEFP: "72",
  },
  {
    COUNTYFP: "149",
    NAME: "Villalba",
    STATEFP: "72",
  },
  {
    COUNTYFP: "075",
    NAME: "Juana Díaz",
    STATEFP: "72",
  },
  {
    COUNTYFP: "133",
    NAME: "Santa Isabel",
    STATEFP: "72",
  },
  {
    COUNTYFP: "049",
    NAME: "Culebra",
    STATEFP: "72",
  },
  {
    COUNTYFP: "093",
    NAME: "Maricao",
    STATEFP: "72",
  },
  {
    COUNTYFP: "147",
    NAME: "Vieques",
    STATEFP: "72",
  },
  {
    COUNTYFP: "083",
    NAME: "Las Marías",
    STATEFP: "72",
  },
  {
    COUNTYFP: "003",
    NAME: "Aguada",
    STATEFP: "72",
  },
  {
    COUNTYFP: "081",
    NAME: "Lares",
    STATEFP: "72",
  },
  {
    COUNTYFP: "005",
    NAME: "Aguadilla",
    STATEFP: "72",
  },
  {
    COUNTYFP: "117",
    NAME: "Rincón",
    STATEFP: "72",
  },
  {
    COUNTYFP: "099",
    NAME: "Moca",
    STATEFP: "72",
  },
  {
    COUNTYFP: "011",
    NAME: "Añasco",
    STATEFP: "72",
  },
  {
    COUNTYFP: "131",
    NAME: "San Sebastián",
    STATEFP: "72",
  },
  {
    COUNTYFP: "141",
    NAME: "Utuado",
    STATEFP: "72",
  },
  {
    COUNTYFP: "071",
    NAME: "Isabela",
    STATEFP: "72",
  },
  {
    COUNTYFP: "073",
    NAME: "Jayuya",
    STATEFP: "72",
  },
  {
    COUNTYFP: "067",
    NAME: "Hormigueros",
    STATEFP: "72",
  },
  {
    COUNTYFP: "097",
    NAME: "Mayagüez",
    STATEFP: "72",
  },
  {
    COUNTYFP: "121",
    NAME: "Sabana Grande",
    STATEFP: "72",
  },
  {
    COUNTYFP: "023",
    NAME: "Cabo Rojo",
    STATEFP: "72",
  },
  {
    COUNTYFP: "125",
    NAME: "San Germán",
    STATEFP: "72",
  },
  {
    COUNTYFP: "079",
    NAME: "Lajas",
    STATEFP: "72",
  },
  {
    COUNTYFP: "085",
    NAME: "Richmond",
    STATEFP: "36",
  },
  {
    COUNTYFP: "005",
    NAME: "Bronx",
    STATEFP: "36",
  },
  {
    COUNTYFP: "081",
    NAME: "Queens",
    STATEFP: "36",
  },
  {
    COUNTYFP: "047",
    NAME: "Kings",
    STATEFP: "36",
  },
  {
    COUNTYFP: "061",
    NAME: "New York",
    STATEFP: "36",
  },
  {
    COUNTYFP: "101",
    NAME: "Philadelphia",
    STATEFP: "42",
  },
  {
    COUNTYFP: "001",
    NAME: "District of Columbia",
    STATEFP: "11",
  },
  {
    COUNTYFP: "735",
    NAME: "Poquoson",
    STATEFP: "51",
  },
  {
    COUNTYFP: "550",
    NAME: "Chesapeake",
    STATEFP: "51",
  },
  {
    COUNTYFP: "700",
    NAME: "Newport News",
    STATEFP: "51",
  },
  {
    COUNTYFP: "740",
    NAME: "Portsmouth",
    STATEFP: "51",
  },
  {
    COUNTYFP: "800",
    NAME: "Suffolk",
    STATEFP: "51",
  },
  {
    COUNTYFP: "650",
    NAME: "Hampton",
    STATEFP: "51",
  },
  {
    COUNTYFP: "810",
    NAME: "Virginia Beach",
    STATEFP: "51",
  },
  {
    COUNTYFP: "710",
    NAME: "Norfolk",
    STATEFP: "51",
  },
  {
    COUNTYFP: "830",
    NAME: "Williamsburg",
    STATEFP: "51",
  },
  {
    COUNTYFP: "510",
    NAME: "Baltimore",
    STATEFP: "24",
  },
  {
    COUNTYFP: "510",
    NAME: "Alexandria",
    STATEFP: "51",
  },
  {
    COUNTYFP: "610",
    NAME: "Falls Church",
    STATEFP: "51",
  },
  {
    COUNTYFP: "600",
    NAME: "Fairfax",
    STATEFP: "51",
  },
  {
    COUNTYFP: "685",
    NAME: "Manassas Park",
    STATEFP: "51",
  },
  {
    COUNTYFP: "683",
    NAME: "Manassas",
    STATEFP: "51",
  },
  {
    COUNTYFP: "630",
    NAME: "Fredericksburg",
    STATEFP: "51",
  },
  {
    COUNTYFP: "840",
    NAME: "Winchester",
    STATEFP: "51",
  },
  {
    COUNTYFP: "595",
    NAME: "Emporia",
    STATEFP: "51",
  },
  {
    COUNTYFP: "620",
    NAME: "Franklin",
    STATEFP: "51",
  },
  {
    COUNTYFP: "540",
    NAME: "Charlottesville",
    STATEFP: "51",
  },
  {
    COUNTYFP: "680",
    NAME: "Lynchburg",
    STATEFP: "51",
  },
  {
    COUNTYFP: "760",
    NAME: "Richmond",
    STATEFP: "51",
  },
  {
    COUNTYFP: "670",
    NAME: "Hopewell",
    STATEFP: "51",
  },
  {
    COUNTYFP: "730",
    NAME: "Petersburg",
    STATEFP: "51",
  },
  {
    COUNTYFP: "570",
    NAME: "Colonial Heights",
    STATEFP: "51",
  },
  {
    COUNTYFP: "660",
    NAME: "Harrisonburg",
    STATEFP: "51",
  },
  {
    COUNTYFP: "820",
    NAME: "Waynesboro",
    STATEFP: "51",
  },
  {
    COUNTYFP: "790",
    NAME: "Staunton",
    STATEFP: "51",
  },
  {
    COUNTYFP: "011",
    NAME: "Franklin",
    STATEFP: "25",
  },
  {
    COUNTYFP: "015",
    NAME: "Hampshire",
    STATEFP: "25",
  },
  {
    COUNTYFP: "013",
    NAME: "Hampden",
    STATEFP: "25",
  },
  {
    COUNTYFP: "019",
    NAME: "Nantucket",
    STATEFP: "25",
  },
  {
    COUNTYFP: "003",
    NAME: "Berkshire",
    STATEFP: "25",
  },
  {
    COUNTYFP: "001",
    NAME: "Fairfield",
    STATEFP: "09",
  },
  {
    COUNTYFP: "009",
    NAME: "New Haven",
    STATEFP: "09",
  },
  {
    COUNTYFP: "005",
    NAME: "Litchfield",
    STATEFP: "09",
  },
  {
    COUNTYFP: "015",
    NAME: "Windham",
    STATEFP: "09",
  },
  {
    COUNTYFP: "025",
    NAME: "Suffolk",
    STATEFP: "25",
  },
  {
    COUNTYFP: "017",
    NAME: "Middlesex",
    STATEFP: "25",
  },
  {
    COUNTYFP: "009",
    NAME: "Essex",
    STATEFP: "25",
  },
  {
    COUNTYFP: "027",
    NAME: "Worcester",
    STATEFP: "25",
  },
  {
    COUNTYFP: "009",
    NAME: "Washington",
    STATEFP: "44",
  },
  {
    COUNTYFP: "007",
    NAME: "Providence",
    STATEFP: "44",
  },
  {
    COUNTYFP: "001",
    NAME: "Bristol",
    STATEFP: "44",
  },
  {
    COUNTYFP: "005",
    NAME: "Newport",
    STATEFP: "44",
  },
  {
    COUNTYFP: "003",
    NAME: "Kent",
    STATEFP: "44",
  },
  {
    COUNTYFP: "007",
    NAME: "Middlesex",
    STATEFP: "09",
  },
  {
    COUNTYFP: "013",
    NAME: "Tolland",
    STATEFP: "09",
  },
  {
    COUNTYFP: "003",
    NAME: "Hartford",
    STATEFP: "09",
  },
  {
    COUNTYFP: "011",
    NAME: "New London",
    STATEFP: "09",
  },
  {
    COUNTYFP: "030",
    NAME: "St. Thomas",
    STATEFP: "78",
  },
  {
    COUNTYFP: "010",
    NAME: "St. Croix",
    STATEFP: "78",
  },
  {
    COUNTYFP: "020",
    NAME: "St. John",
    STATEFP: "78",
  },
];
let ndvi_palette = [
  "#8400A8",
  "#4C0073",
  "#4C0073",
  "#4C0073",
  "#4C0073",
  "#343434",
  "#343434",
  "#343434",
  "#343434",
  "#730000",
  "#730000",
  "#730000",
  "#730000",
  "#A80000",
  "#A80000",
  "#A80000",
  "#A80000",
  "#E64C00",
  "#E64C00",
  "#E64C00",
  "#FFAA00",
  "#FFAA00",
  "#FFAA00",
  "#FFD37F",
  "#FFD37F",
  "#FFD37F",
  "#FFFF00",
  "#FFFF00",
  "#FFFF00",
  "#FFFFBE",
  "#FFFFBE",
  "#FFFFBE",
  "#D2D2D2",
  "#D2D2D2",
  "#D2D2D2",
  "#6EBFFF",
  "#6EBFFF",
  "#6EBFFF",
  "#6EBFFF",
  "#6EBFFF",
  "#6EBFFF",
  "#6EBFFF",
  "#6EBFFF",
  "#6EBFFF",
  "#0070FF",
  "#0070FF",
  "#0070FF",
  "#0070FF",
  "#0070FF",
  "#0000FF",
  "#0000FF",
  "#0000FF",
  "#0000FF",
  "#0000FF",
  "#0000FF",
  "#0000FF",
  "#0000FF",
  "#0000FF",
  "#0000FF",
  "#0000FF",
  "#0000FF",
  "#0000FF",
  "#0000FF",
  "#0000FF",
  "#0000FF",
  "#000096",
];

const sld_intervals_ndvi = `<RasterSymbolizer>
<ColorMap type="intervals" extended="false" >
<ColorMapEntry color="#000096" quantity="70" />
<ColorMapEntry color="#000096" quantity="69" />
<ColorMapEntry color="#000096" quantity="68" />
<ColorMapEntry color="#000096" quantity="67" />
<ColorMapEntry color="#000096" quantity="66" />
<ColorMapEntry color="#000096" quantity="65" />
<ColorMapEntry color="#000096" quantity="64" />
<ColorMapEntry color="#000096" quantity="63" />
<ColorMapEntry color="#000096" quantity="62" />
<ColorMapEntry color="#000096" quantity="62" />
<ColorMapEntry color="#000096" quantity="61" />
<ColorMapEntry color="#000096" quantity="60" />
<ColorMapEntry color="#000096" quantity="59" />
<ColorMapEntry color="#000096" quantity="58" />
<ColorMapEntry color="#000096" quantity="57" />
<ColorMapEntry color="#000096" quantity="56" />
<ColorMapEntry color="#000096" quantity="55" />
<ColorMapEntry color="#000096" quantity="54" />
<ColorMapEntry color="#000096" quantity="53" />
<ColorMapEntry color="#000096" quantity="52" />
<ColorMapEntry color="#000096" quantity="52" />
<ColorMapEntry color="#000096" quantity="51" />
<ColorMapEntry color="#000096" quantity="50" />
<ColorMapEntry color="#000096" quantity="49" />
<ColorMapEntry color="#000096" quantity="48" />
<ColorMapEntry color="#000096" quantity="47" />
<ColorMapEntry color="#000096" quantity="46" />
<ColorMapEntry color="#000096" quantity="45" />
<ColorMapEntry color="#000096" quantity="44" />
<ColorMapEntry color="#000096" quantity="43" />
<ColorMapEntry color="#000096" quantity="42" />
<ColorMapEntry color="#000096" quantity="42" />
<ColorMapEntry color="#000096" quantity="41" />
<ColorMapEntry color="#000096" quantity="40" />
<ColorMapEntry color="#000096" quantity="39" />
<ColorMapEntry color="#000096" quantity="38" />
<ColorMapEntry color="#000096" quantity="37" />
<ColorMapEntry color="#000096" quantity="36" />
<ColorMapEntry color="#000096" quantity="35" />
<ColorMapEntry color="#000096" quantity="34" />
<ColorMapEntry color="#000096" quantity="33" />
<ColorMapEntry color="#000096" quantity="32" />
<ColorMapEntry color="#000096" quantity="31" />
<ColorMapEntry color="#000096" quantity="30" />
<ColorMapEntry color="#000096" quantity="29" />
<ColorMapEntry color="#000096" quantity="28" />
<ColorMapEntry color="#000096" quantity="27" />
<ColorMapEntry color="#000096" quantity="26" />
<ColorMapEntry color="#0000FF" quantity="25" />
<ColorMapEntry color="#0000FF" quantity="24" />
<ColorMapEntry color="#0000FF" quantity="23" />
<ColorMapEntry color="#0000FF" quantity="22" />
<ColorMapEntry color="#0000FF" quantity="22" />
<ColorMapEntry color="#0000FF" quantity="21" />
<ColorMapEntry color="#0000FF" quantity="20" />
<ColorMapEntry color="#0000FF" quantity="19" />
<ColorMapEntry color="#0000FF" quantity="18" />
<ColorMapEntry color="#0000FF" quantity="17" />
<ColorMapEntry color="#0000FF" quantity="16" />
<ColorMapEntry color="#0000FF" quantity="15" />
<ColorMapEntry color="#0000FF" quantity="14" />
<ColorMapEntry color="#0000FF" quantity="13" />
<ColorMapEntry color="#0000FF" quantity="12" />
<ColorMapEntry color="#0000FF" quantity="11" />
<ColorMapEntry color="#0070FF" quantity="10" />
<ColorMapEntry color="#0070FF" quantity="09" />
<ColorMapEntry color="#0070FF" quantity="08" />
<ColorMapEntry color="#0070FF" quantity="07" />
<ColorMapEntry color="#0070FF" quantity="06" />
<ColorMapEntry color="#6EBFFF" quantity="05" />
<ColorMapEntry color="#6EBFFF" quantity="04" />
<ColorMapEntry color="#6EBFFF" quantity="03" />
<ColorMapEntry color="#6EBFFF" quantity="02" />
<ColorMapEntry color="#6EBFFF" quantity="01" />
<ColorMapEntry color="#6EBFFF" quantity="00" />
<ColorMapEntry color="#6EBFFF" quantity="-01" />
<ColorMapEntry color="#6EBFFF" quantity="-02" />
<ColorMapEntry color="#6EBFFF" quantity="-03" />
<ColorMapEntry color="#D2D2D2" quantity="-04" />
<ColorMapEntry color="#D2D2D2" quantity="-05" />
<ColorMapEntry color="#D2D2D2" quantity="-06" />
<ColorMapEntry color="#FFFFBE" quantity="-07" />
<ColorMapEntry color="#FFFFBE" quantity="-08" />
<ColorMapEntry color="#FFFFBE" quantity="-09" />
<ColorMapEntry color="#FFFF00" quantity="-10" />
<ColorMapEntry color="#FFFF00" quantity="-11" />
<ColorMapEntry color="#FFFF00" quantity="-12" />
<ColorMapEntry color="#FFD37F" quantity="-13" />
<ColorMapEntry color="#FFD37F" quantity="-14" />
<ColorMapEntry color="#FFD37F" quantity="-15" />
<ColorMapEntry color="#FFAA00" quantity="-16" />
<ColorMapEntry color="#FFAA00" quantity="-17" />
<ColorMapEntry color="#FFAA00" quantity="-18" />
<ColorMapEntry color="#E64C00" quantity="-19" />
<ColorMapEntry color="#E64C00" quantity="-20" />
<ColorMapEntry color="#E64C00" quantity="-21" />
<ColorMapEntry color="#A80000" quantity="-22" />
<ColorMapEntry color="#A80000" quantity="-23" />
<ColorMapEntry color="#A80000" quantity="-24" />
<ColorMapEntry color="#A80000" quantity="-25" />
<ColorMapEntry color="#730000" quantity="-26" />
<ColorMapEntry color="#730000" quantity="-27" />
<ColorMapEntry color="#730000" quantity="-28" />
<ColorMapEntry color="#730000" quantity="-29" />
<ColorMapEntry color="#343434" quantity="-30" />
<ColorMapEntry color="#343434" quantity="-31" />
<ColorMapEntry color="#343434" quantity="-32" />
<ColorMapEntry color="#343434" quantity="-33" />
<ColorMapEntry color="#4C0073" quantity="-34" />
<ColorMapEntry color="#4C0073" quantity="-35" />
<ColorMapEntry color="#4C0073" quantity="-36" />
<ColorMapEntry color="#4C0073" quantity="-37" />
<ColorMapEntry color="#8400A8" quantity="-38" />
<ColorMapEntry color="#8400A8" quantity="-39" />
<ColorMapEntry color="#8400A8" quantity="-40" />
<ColorMapEntry color="#8400A8" quantity="-41" />
<ColorMapEntry color="#8400A8" quantity="-42" />
<ColorMapEntry color="#8400A8" quantity="-43" />
<ColorMapEntry color="#8400A8" quantity="-44" />
<ColorMapEntry color="#8400A8" quantity="-45" />
<ColorMapEntry color="#8400A8" quantity="-46" />
<ColorMapEntry color="#8400A8" quantity="-47" />
<ColorMapEntry color="#8400A8" quantity="-48" />
<ColorMapEntry color="#8400A8" quantity="-49" />
<ColorMapEntry color="#8400A8" quantity="-50" />
<ColorMapEntry color="#8400A8" quantity="-51" />
<ColorMapEntry color="#8400A8" quantity="-52" />
<ColorMapEntry color="#8400A8" quantity="-53" />
<ColorMapEntry color="#8400A8" quantity="-54" />
<ColorMapEntry color="#8400A8" quantity="-55" />
<ColorMapEntry color="#8400A8" quantity="-56" />
<ColorMapEntry color="#8400A8" quantity="-57" />
<ColorMapEntry color="#8400A8" quantity="-58" />
<ColorMapEntry color="#8400A8" quantity="-59" />
<ColorMapEntry color="#8400A8" quantity="-60" />
<ColorMapEntry color="#8400A8" quantity="-61" />
<ColorMapEntry color="#8400A8" quantity="-62" />
<ColorMapEntry color="#8400A8" quantity="-63" />
<ColorMapEntry color="#8400A8" quantity="-64" />
<ColorMapEntry color="#8400A8" quantity="-65" />
<ColorMapEntry color="#8400A8" quantity="-66" />
<ColorMapEntry color="#8400A8" quantity="-67" />
<ColorMapEntry color="#8400A8" quantity="-68" />
<ColorMapEntry color="#8400A8" quantity="-69" />
<ColorMapEntry color="#8400A8" quantity="-70" />
</ColorMap>
</RasterSymbolizer>`;
