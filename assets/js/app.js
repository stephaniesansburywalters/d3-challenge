function makeResponsive() {

  var svgArea = d3.select("body").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
  }

  var svgWidth = window.innerWidth*0.8;
  var svgHeight = svgWidth*0.65;
  
  // circle and text size are changed based on window resizing
  var circleR = svgWidth*0.012; 
  var textsize = parseInt(svgWidth*0.009);
  
  var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 80
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;
  
  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
  
  // Append an SVG group
  var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
  // Initial Params
  var chosenXAxis = "poverty";
  var chosenYAxis ="healthcare";

  // function used for updating x-scale var upon click on axis label
  function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);

  return xLinearScale;
  }

  // function used for updating y-scale var upon click on axis label
  function yScale(censusData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
      d3.max(censusData, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);

  return yLinearScale;
  }
  
  // function used for updating xAxis var upon click on axis label
  function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
  }
  
  // function used for updating yAxis var upon click on axis label
  function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
  }
  
  // function used for updating circles group and text group with a transition to
  // new circles
  function renderCircles(circlesGroup, newXScale, newYScale,chosenXAxis,chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
  }

  function renderText(textGroup, newXScale, newYScale,chosenXAxis,chosenYAxis) {

      textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
        
  return textGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis,circlesGroup) {

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      if (chosenXAxis === "income"){
        return (`${d.state},${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]} USD<br>${chosenYAxis}: ${d[chosenYAxis]}%`); 
    
      } else if (chosenXAxis === "age"){
        return (`${d.state},${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]}<br>${chosenYAxis}: ${d[chosenYAxis]}%`); 
      }    
      else {
        return (`${d.state},${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]}%<br>${chosenYAxis}: ${d[chosenYAxis]}%`); 
      }
      });
      
     
  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(d) {
    toolTip.show(d,this);
    })
    .on("mouseout", function(d, index) {
      toolTip.hide(d);
    });
  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(censusData) {
  // parse data
  censusData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;

      data.smokes = +data.smokes;
      data.age = +data.age;

      data.income = +data.income;
      data.obesity = +data.obesity;

      data.abbr = data.abbr;
  });
  
  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);
  
  // Create y scale function
  var yLinearScale = yScale(censusData, chosenYAxis);

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// append x axis
var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

// append y axis
var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  .call(leftAxis);

// append initial circles and text
var circlesGroup = chartGroup.selectAll("circle")
  .data(censusData)
  .enter()
  .append("circle")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d[chosenYAxis]))
  .attr("r", circleR)
  .attr("fill", "#00d5ff");

var textGroup = chartGroup.selectAll("text")
  .exit() //before enter(), to clear cache
  .data(censusData)
  .enter()
  .append("text")
  .text(d => d.abbr)
  .attr("x", d => xLinearScale(d[chosenXAxis]))
  .attr("y", d => yLinearScale(d[chosenYAxis]))
  .attr("font-size", textsize+"px")
  .attr("text-anchor", "middle")
  .style("fill","black")
  .attr("class","stateText");

circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);

// Create group for x-axis labels
var labelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);

var povertyLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("class","axis-text-x")
  .attr("value", "poverty") 
  .classed("active", true)
  .text("In Poverty (%)");

var ageLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("class","axis-text-x")
  .attr("value", "age") 
  .classed("inactive", true)
  .text("Age (Median)");

var incomeLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 60)
  .attr("class","axis-text-x")
  .attr("value", "income") 
  .classed("inactive", true)
  .text("Income (Median)");

// Create group for y-axis labels

var ylabelsGroup = chartGroup.append("g");

var healthcareLabel = ylabelsGroup.append("text")
  .attr("transform", `translate(-40,${height / 2})rotate(-90)`)
  .attr("dy", "1em")
  .attr("class","axis-text-y")
  .classed("axis-text", true)
  .attr("value", "healthcare") 
  .classed("active", true)
  .text("Lack of Healthcare (%)");

var smokesLabel = ylabelsGroup.append("text")
  .attr("transform", `translate(-60,${height / 2})rotate(-90)`)
  .attr("dy", "1em")
  .attr("class","axis-text-y")
  .attr("value", "smokes") 
  .classed("inactive", true)
  .text("Smokes (%)");

var obesityLabel = ylabelsGroup.append("text")
  .attr("transform", `translate(-80,${height / 2})rotate(-90)`)
  .attr("dy", "1em")
  .attr("class","axis-text-y")
  .attr("value", "obesity") 
  .classed("inactive", true)
  .text("Obesity (%)");

// x axis labels event listener
labelsGroup.selectAll(".axis-text-x")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;

      console.log(chosenXAxis)

      // updates x scale for new data
      xLinearScale = xScale(censusData, chosenXAxis);
      // updates y scale for new data
      yLinearScale = yScale(censusData, chosenYAxis);

      // updates x axis with transition
      xAxis = renderXAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

      textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);

      // changes classes to change bold text
      if (chosenXAxis === "age") {
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
          
      }
      else if (chosenXAxis === "poverty")
       {
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
        
      }
      else {
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", true)
          .classed("inactive", false);
      }

    }
  });


// y axis labels event listener
ylabelsGroup.selectAll(".axis-text-y")
  .on("click", function() {
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

   // replaces chosenYAxis with value
    chosenYAxis = value;

    console.log(chosenYAxis)

   // updates x scale for new data
   xLinearScale = xScale(censusData, chosenXAxis);
   // updates y scale for new data
   yLinearScale = yScale(censusData, chosenYAxis);
   // updates Y axis with transition
   yAxis = renderYAxes(yLinearScale, yAxis);

   // updates circles with new x values
   circlesGroup = renderCircles(circlesGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

   textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

   // updates tooltips with new info
   circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);

     
   if (chosenYAxis === "healthcare") {
    healthcareLabel
      .classed("active", true)
      .classed("inactive", false);
    smokesLabel
      .classed("active", false)
      .classed("inactive", true);
    obesityLabel
      .classed("active", false)
      .classed("inactive", true);
  
    }
    else if (chosenYAxis === "smokes")
   {
    healthcareLabel
      .classed("active", false)
      .classed("inactive", true);
    smokesLabel
      .classed("active", true)
      .classed("inactive", false);
    obesityLabel
      .classed("active", false)
      .classed("inactive", true);
    } 
    else {
    healthcareLabel
      .classed("active", false)
      .classed("inactive", true);
    smokesLabel
      .classed("active", false)
      .classed("inactive", true);
    obesityLabel
      .classed("active", true)
      .classed("inactive", false);   
     }
  }
});
});

}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);