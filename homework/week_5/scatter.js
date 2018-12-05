// scatter.js is javascript to run for scatter.html
// produces a scatter plot
// Matthew Finnegan, 10698485

window.onload = function() {
  var womenInScience = "https://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
  var consConf = "https://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"
  var requests = [d3.json(womenInScience), d3.json(consConf)];

  var margins = {
    top: 40,
    bottom: 20,
    left: 150,
    right: 150
  }

  var w = 1000 - margins.left - margins.right; // width
  var h = 500 - margins.top - margins.bottom; //height

  // map countries to colors
  var countries = {
    France: "215,48,39",
    Germany: "252,141,89",
    Korea: "254,224,144",
    Netherlands: "224,243,248",
    Portugal: "145,191,219",
    UK: "69,117,180"
  };

  var svg = appendSVG();

  Promise.all(requests).then(function(response) {
    // parse the data
    let response0 = response[0];
    let response1 = response[1];
    var data = transformResponse(response0, response1);

    var tool_tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html(function(d) { // return what the tool tip will show
        return "Country: " + d.Country + "<br/>" +
          "Pct of women researchers: " + d.datapoint.women.toFixed(2) + "<br/>" +
          "Consumer confidence: " + d.datapoint.conf + "<br/>" +
          "Year: " + d.time;
      });

    svg.call(tool_tip);

    // determine domains for both sets
    let xDomain = getDomain(data, "conf");
    let yDomain = getDomain(data, "women");

    let xRange = [0, w];
    let yRange = [h, 0];

    // compute the scales
    let xScale = d3.scaleLinear()
      .domain(xDomain)
      .range(xRange);

    let yScale = d3.scaleLinear()
      .domain(yDomain)
      .range(yRange);

    let axes = getAxes();

    var xAxis = axes[0];
    var yAxis = axes[1];

    // put the axes on the svg
    xAxis.call(d3.axisBottom(xScale));
    yAxis.call(d3.axisLeft(yScale));

    appendLegend();

    addText();

    // create dots for each datapoint
    let dots = svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.datapoint.conf))
      .attr("cy", d => yScale(d.datapoint.women))
      .attr("r", 9)
      .attr("fill", function(d, i) {
        // fill dot according to country
        c = d.Country;
        c = c.split(" ");

        if (c[0] == "United") {
          c[0] = "UK";
        }
        return "rgb(" + countries[c[0]] + ")";
      })
      .on('mouseover', tool_tip.show)
      .on('mouseout', tool_tip.hide);

    d3.selectAll(".m") // when clicked in dropdown
      .on("click", function() {
        var sort = this.getAttribute("value");
        let newData = []

        // create new data array with specified objects to look at
        if (sort == "all") {
          newData = data; // take all data points
        } else {
          data.forEach(function(entry) {
            if (sort == entry.Country) {
              newData.push(entry) // take all objects where countries match
            } else if (sort == entry.time) {
              newData.push(entry) // take all objects where time matches
            }
          })
        }

        // determine new domains and scales
        let xDomain = getDomain(newData, "conf");

        let xRange = [0, w];

        let newXScale = d3.scaleLinear()
          .domain(xDomain)
          .range(xRange);

        var new_dots = svg.selectAll("circle.dot")
          .data(newData);

        new_dots
          .exit()
          .transition()
          .ease(d3.easeCircleIn)
          .duration(500)
          .attr("r", 0)
          .remove();

        // create dots for eachn new datapoint
        new_dots
          .enter().append("circle")
          .attr("class", "dot")
          .merge(new_dots)
          .attr("fill", function(d, i) {
            c = d.Country;
            c = c.split(" ");
            if (c[0] == "United") {
              c[0] = "UK";
            }
            return "rgb(" + countries[c[0]] + ")";
          })
          .transition()
          .ease(d3.easeCircleIn)
          .duration(300)
          .attr("cx", d => newXScale(d.datapoint.conf))
          .attr("cy", d => yScale(d.datapoint.women))
          .attr("r", 9)

        new_dots
          .on('mouseover', tool_tip.show)
          .on('mouseout', tool_tip.hide)

        xAxis.call(d3.axisBottom(newXScale)); // call new x-axis

      });

    addSource()

  }).catch(function(e) {
    throw (e);
  });

  // add the axes
  function getAxes() {
    // determine x-axis with appropriate padding
    let xAxis = svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + h + ")")

    // determine y-axis with appropriate padding
    let yAxis = svg.append("g")
      .attr("class", "axis")

    return [xAxis, yAxis]
  }

  // preprocess the data
  function transformResponse(set1, set2) {
    let dataHere1 = set1.dataSets[0].series; // access data property of set1
    let dataHere2 = set2.dataSets[0].series; // access data property of set2

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
        let data2 = dataHere2[stringIndex + ":0:0"].observations[index];
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
          tempObj["datapoint"] = {
            women: data1[0],
            conf: data2[0]
          };
          dataArray.push(tempObj);
        }
      });
    });
    // // return the finished product!
    return dataArray;
  }

  // appends svg to the body
  function appendSVG() {
    // append svg element to body
    return d3.select(".chart").append("svg")
      .attr("id", "svg")
      .attr("width", w + margins.left + margins.right)
      .attr("height", h + margins.top + margins.bottom)
      .append("g")
      .attr("id", "scatterplot")
      .attr("transform", "translate(" + margins.left + "," + margins.top + ")");
  }

  // adds legend to svg
  function appendLegend() {
    var legend = svg.selectAll(".legend")
      .data(Object.keys(countries))
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) {
        return "translate(0," + i * 20 + ")";
      });

    legend.append("rect")
      .attr("x", w + 20)
      .attr("y", 0)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d, i) {
        return "rgb(" + Object.values(countries)[i] + ")";
      });

    legend.append("text")
      .attr("x", w + 40)
      .attr("y", 15)
      .text(function(d) {
        return d;
      });
  }

  // add labels and title to graph
  function addText() {
    svg.append("text")
      .attr("class", "xtext")
      .attr("x", w - margins.right)
      .attr("y", h - 5)
      .attr("text-anchor", "middle")
      .text("Consumer confidence");

    svg.append("text")
      .attr("class", "ytext")
      .attr("x", -230)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("% of women in science from total amount of researchers");

    svg.append("text")
      .attr("class", "title")
      .attr("x", w / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text("% of women in science against consumer confidence per country")
  }

  // gets the domain for required data
  function getDomain(array, value) {
    if (value == "women") {
      domain = d3.extent(array, d => d.datapoint.women);
      return [0, domain[1] + 5];
    } else if (value == "conf") {
      domain = d3.extent(array, d => d.datapoint.conf);
      return [domain[0] - 0.5, domain[1] + 0.5];
    }
  }

  // add source text
  function addSource() {
    d3.select(".source").append("p")
      .text("Sources: ")
      .append("p")
      .append("a")
      .attr("href", "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015")
      .text("Women in science")

    d3.select(".source").append("p")
      .append("a")
      .attr("href", "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015")
      .text("Consumer confidence")
  }
}
