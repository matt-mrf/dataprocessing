window.onload = function() {


  const margin = {
    top: 40,
    bottom: 20,
    left: 100,
    right: 100
  }

  const w = window.innerWidth - margin.left - margin.right // Use the window's width
  const h = window.innerHeight - margin.top - margin.bottom; // Use the window's height

  var svg = d3.select(".chart").append("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json("data/data.json").then(function(data) {

    var xDomain = d3.extent(data, d => d.year)
    var yDomain = d3.extent(data, d => d.models.total)

    var xScale = d3.scaleLinear()
      .domain(xDomain) // input
      .range([0, w]);

    var yScale = d3.scaleLinear()
      .domain(yDomain)
      .range([h, 0]);

    var line = d3.line()
      .x(function(d, i) {
        return xScale(d.year);
      })
      .y(function(d) {
        return yScale(d.models.total);
      })
    .curve(d3.curveCatmullRom)

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      // .tickFormat(d3.format("d"))
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale));


    svg.append("path")
      .datum(data) // 10. Binds data to the line
      .attr("class", "line") // Assign a class for styling
      .attr("d", line); // 11. Calls the line generator

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
      .attr("r", 3)

  })
}
