// line.js is javascript to run for line.html
// produces an interactive line chart
// Matthew Finnegan, 10698485

window.onload = function() {


  const margin = {
    top: 50,
    bottom: 50,
    left: 100,
    right: 100
  }

  const w = window.innerWidth - margin.left - margin.right; // Use the window's width
  const h = window.innerHeight - margin.top - margin.bottom; // Use the window's height

  const r = 200; //radius
  const color = d3.scaleOrdinal(d3.schemeCategory10); // color scale

  var svg = addLineSVG();
  var pieSvg = addPieSVG();

  // load toyota's data as default
  d3.json("data/toyota.json").then(function(data) {

    var tool_tip = addTip();

    svg.call(tool_tip);

    var xDomain = getDomain(data, "x");
    var yDomain = getDomain(data, "y");

    var xScale =
      d3.scaleLinear()
      .domain(xDomain)
      .range([0, w]);

    var yScale =
      d3.scaleLinear()
      .domain(yDomain)
      .range([h, 0]);

    let axes = getAxes();

    var xAxis = axes[0];
    var yAxis = axes[1];

    // put the axes on the svg
    xAxis.call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    yAxis.call(d3.axisLeft(yScale));

    var line = d3.line()
      .x(function(d, i) {
        return xScale(d.year);
      })
      .y(function(d) {
        return yScale(d.models.total);
      })
      .curve(d3.curveCatmullRom);

    loadInitialLine();

    loadInitialPie();

    addLineLabels();

    d3.selectAll(".m") // when clicked in dropdown
      .on("click", function() {
        var sort = this.getAttribute("value");
        updateLine(sort);
      })

    function loadInitialLine() {
      svg.append("path")
        .datum(data) // Binds data to the line
        .attr("class", "line") // Assign a class for styling
        .attr("d", line); // Calls the line generator

      svg.selectAll(".dot")
        .data(data)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function(d, i) {
          return xScale(d.year)
        })
        .attr("cy", function(d) {
          return yScale(d.models.total)
        })
        .attr("r", 5)
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide)
        .on('click', function(d) {
          updatePie(d);
          var elmnt = document.getElementById("pietip");
          elmnt.scrollIntoView();
        })

        updateTitle("Toyota")
    }

    function loadInitialPie() {
      // initially load first datapoints pie chart
      let yearNumbers = Object.values(data[0].models);
      let yearModels = Object.keys(data[0].models);
      let modelList = [];
      let total = 0;

      yearModels.forEach(function(entry, i) {
        tempObj = {};
        if (entry == "total") {
          total = yearNumbers[i];
        } else {
          tempObj = {
            name: entry,
            amount: yearNumbers[i]
          };
          modelList.push(tempObj)
        }
      })

      let year = data[0].year

      var pieData = d3.pie()
        .sort(null)
        .value(function(d) {
          return d.amount;
        })
        (modelList)

      let segments = d3.arc()
        .innerRadius(r / 2)
        .outerRadius(r)

      var sections = pieSvg.append("g")
        .attr("id", "pie")
        .selectAll("path").data(pieData);

      sections.enter().append("path")
        .attr("class", "slice")
        .attr("d", segments)
        .attr("fill", function(d) {
          return color(d.data.amount);
        })
        .on("mouseover", function(d) {
          name = d.data.name
          amount = d.data.amount
          d3.select("#tt-name")
            .text(function(d, i) {
              return "Model: " + name;
            })

          d3.select("#tt-amount")
            .text(function(d, i) {
              return "Amount sold: " + amount;
            })
        })
        .on("mouseout", function(d) {
          d3.select("#tt-name")
            .text("Model: ")

          d3.select("#tt-amount")
            .text("Amount sold: ")
        })

        updatePieYear("2007")
    }

    function updateLine(sort) {
      newDataPath = "data/" + sort + ".json";
      brand = sort.charAt(0).toUpperCase() + sort.slice(1);

      d3.json(newDataPath).then(function(newData) {

        var xDomain = getDomain(newData, "x");
        var yDomain = getDomain(newData, "y");

        var newXScale =
          d3.scaleLinear()
          .domain(xDomain)
          .range([0, w]);

        var newYScale =
          d3.scaleLinear()
          .domain(yDomain)
          .range([h, 0]);

        // put the axes on the svg
        xAxis.call(d3.axisBottom(newXScale).tickFormat(d3.format("d")));
        yAxis.call(d3.axisLeft(newYScale));

        var newLine = d3.line()
          .x(function(d, i) {
            return newXScale(d.year);
          })
          .y(function(d) {
            return newYScale(d.models.total);
          })
          .curve(d3.curveCatmullRom)

        d3.selectAll(".line")
          .remove()

        svg.append("path")
          .datum(newData) // 10. Binds data to the line
          .attr("class", "line") // Assign a class for styling
          .attr("d", newLine); // 11. Calls the line generator

        var new_dots = svg.selectAll(".dot")
          .data(newData);

        new_dots
          .exit()
          .remove()

        new_dots
          .enter().append("circle")
          .attr("class", "dot")
          .merge(new_dots)
          .attr("class", "dot") // Assign a class for styling
          .attr("cx", function(d, i) {
            return newXScale(d.year)
          })
          .attr("cy", function(d) {
            return newYScale(d.models.total)
          })
          .attr("r", 5)
          .on('mouseover', tool_tip.show)
          .on('mouseout', tool_tip.hide)
          .on('click', function(d) {
            updatePie(d);
            var elmnt = document.getElementById("pietip");
            elmnt.scrollIntoView();
          })

          updateTitle(brand)
      });
    }

    function updatePie(d) {
      let yearNumbers = Object.values(d.models);
      let yearModels = Object.keys(d.models);
      let modelList = [];
      let total = 0;

      yearModels.forEach(function(entry, i) {

        tempObj = {};
        if (entry == "total") {
          total = yearNumbers[i];
        } else {
          tempObj = {
            name: entry,
            amount: yearNumbers[i]
          };
          modelList.push(tempObj)
        }
      })

      let year = d.year

      var pieData = d3.pie()
        .sort(null)
        .value(function(d) {
          return d.amount;
        })
        (modelList)

      let segments = d3.arc()
        .innerRadius(r / 2)
        .outerRadius(r)

      d3.selectAll("#pie")
        .remove()

      var sections = pieSvg.append("g")
        .attr("id", "pie")
        .selectAll("path")
        .data(pieData);

      sections.enter().append("path")
        .attr("class", "slice")
        .attr("d", segments)
        .attr("fill", function(d) {
          return color(d.data.amount);
        })
        .on("mouseover", function(d) {
          name = d.data.name
          amount = d.data.amount
          d3.select("#tt-name")
            .text(function(d, i) {
              return "Model: " + name;
            })

          d3.select("#tt-amount")
            .text(function(d, i) {
              return "Amount sold: " + amount;
            })
        })
        .on("mouseout", function(d) {
          d3.select("#tt-name")
            .text("Model: ")

          d3.select("#tt-amount")
            .text("Amount sold: ")
        })

        updatePieYear(year)

    }

    function addLineLabels() {
      chart = d3.select("#linechart")

      chart
      .append("text")
      .attr("class", "xtext")
      .attr("x", w - margin.right)
      .attr("y", h - 5)
      .attr("text-anchor", "middle")
      .text("Year");

      chart
      .append("text")
      .attr("class", "ytext")
      .attr("x", -230)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Amount of cars sold");

    }

    function updateTitle(brand) {
      svg.selectAll(".title")
      .remove()

      svg.append("text")
        .attr("class", "title")
        .attr("font-size", "20px")
        .attr("x", w / 2)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .text(function(){
          return "Sales for " + brand;
        })
    }

    function updatePieYear(year) {
      chart = d3.select("#piechart")

      chart.select(".pieyear")
      .remove();

      chart.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("class", "pieyear")
      .attr("text-anchor", "middle")
      .text("data for " + year);
    }
  })

  function addLineSVG() {
    return d3.select(".chart").append("svg")
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom)
      .append("g")
      .attr("id", "linechart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }

  function addPieSVG() {
    return d3.select(".linked").append("svg")
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom)
      .append("g")
      .attr("id", "piechart")
      .attr("transform", "translate(" + (window.innerWidth / 2) + "," + (r + margin.top) + ")");
  }

  function addTip() {
    return d3.tip()
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html(function(d) { // return what the tool tip will show
        return "Year: " + d.year + "<br/>" +
          "Total amount sold: " + d.models.total;
      });
  }

  function getDomain(data, axis) {
    if (axis == "x") {
      domain = d3.extent(data, d => d.year);

      return domain;
    } else if (axis == "y") {
      domain = d3.extent(data, d => d.models.total);

      return [domain[0] - 1000, domain[1] + 1000];
    }
  }

  // add the axes
  function getAxes() {
    // determine x-axis with appropriate padding
    let xAxis = svg.append("g")
      .attr("class", "axis")
      // .tickFormat(d3.format("d"))
      .attr("transform", "translate(0," + h + ")")

    // determine y-axis with appropriate padding
    let yAxis = svg.append("g")
      .attr("class", "axis")

    return [xAxis, yAxis]
  }

}
