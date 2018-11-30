// scatter.js is javascript to run for scatter.html
// produces a scatter plot
// Matthew Finnegan, 10698485

window.onload = function() {
  var womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
  var consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"
  var requests = [d3.json(womenInScience), d3.json(consConf)];

  var w = 1000; // width
  var h = 500; //height

  var svg = appendSVG();

  // parse the data
  Promise.all(requests).then(function(response) {
    let response0 = response[0];
    console.log(response0)
    let response1 = response[1];
    console.log(response1)

    let data = transformResponse(response0, response1);

    console.log(data)

  }).catch(function(e) {
    throw (e);
  });

  // preprocess the data
  function transformResponse(set1, set2) {
    let dataHere1 = set1.dataSets[0].series;  // access data property of set1
    let dataHere2 = set2.dataSets[0].series;  // access data property of set2

    // access variables in the response and save length for later
    let series = set1.structure.dimensions.series;

    // set up array of variables and array of lengths
    let varArray = [];

    series.forEach(function(serie) {
      varArray.push(serie);
    });

    // get the time periods in the dataset
    let observation = set2.structure.dimensions.observation[0];

    // add time periods to the variables, but since it's not included in the
    // 0:0:0 format it's not included in the array of lengths
    varArray.push(observation);

    // create array with all possible combinations of the 0:0:0 format
    let strings1 = Object.keys(dataHere1);

    // set up output array, an array of objects, each containing a single datapoint
    // and the descriptors for that datapoint
    let dataArray = [];

    // for each string that we created
    strings1.forEach(function(string, stringIndex) {
      // for each observation and its index
      observation.values.forEach(function(obs, index) {
        let data1 = dataHere1[string].observations[index];
        let data2 = dataHere2[stringIndex+":0:0"].observations[index];
        if (data1 != undefined) {

          // set up temporary object
          let tempObj = {};

          tempString = string.split(":");
          tempString.forEach(function(s, indexi) {
            tempObj[varArray[indexi].name] = varArray[indexi].values[s].name;
          });

          // every datapoint has a time and ofcourse a datapoint
          tempObj["time"] = obs.name;
          // tempObj["datapoint"] = datax[0];
          tempObj["datapoint"] = {women: data1[0], conf:data2[0]};
          dataArray.push(tempObj);
        }
      });
    });

    // // return the finished product!
    return dataArray;
  }

  // appends and svg to the body
  function appendSVG() {
    d3.select("body").append("div")
      .attr("class", "chart")
      .style("text-align", "center")

    // append svg element to divs with chart class
    return d3.select(".chart").append("svg")
      .attr("width", w)
      .attr("height", h);
  }

  function getDomain(array){
    return d3.extent(array.map(function(item) {
      return (item.datapoint);
    }))
  }

};
