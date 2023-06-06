var CustomCircleMarker = L.CircleMarker.extend({
  options: {
    className: 'city' // Add a custom class to the marker element
  }
});


// Read the data from the CSV file
d3.csv("data.csv").then(function(data) {
  //console.log(data)
  // Extract the unique cities from the data
  var cities = d3.map(data, function(d){return d.city;});

  cities = [...new Set(cities)]

  // Add the markers for each city
  cities.forEach(function(city) {
    var cityData = data.filter(function(d) { return d.city == city; });
    var firstDataPoint = cityData[0];
    var marker = new CustomCircleMarker([firstDataPoint.lat, firstDataPoint.lng], { city: city, radius: 10, fillOpacity: 0, color: "black", weight: 1, opacity: 0.5 }).addTo(map);

    // Add interaction between the map and chart
    marker.on("mouseover", function() {
      highlightLine(city);
    }).on("mouseout", function() {
      unhighlightLine();
    });
  });

  // Define the scales for the chart
  var x = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return new Date(d.year); }))
    .range([50, 450]);

  var y = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d.value)])
    .range([450, 50]);

    // Define the line generator for the chart
    var line = d3.line()
      .x(function(d) { return x(new Date(d.year)); })
      .y(function(d) { return y(+d.value); });

    // Draw the lines for each city on the chart
    var chart = d3.select("#chart")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", [0, 0, 500, 500])
      .append("g");

    // Add the x-axis to the chart
    chart.append("g")
      .attr("transform", "translate(0, " + y.range()[0] + ")")
      .call(d3.axisBottom(x));

    // Add the y-axis to the chart
    chart.append("g")
      .attr("transform", "translate(" + x.range()[0] + ", 0)")
      .call(d3.axisLeft(y));


    // Define an array of colors
    var colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33"];

    // Define the colors for the lines
    var colorScale = d3.scaleOrdinal()
      .domain(cities)
      .range(d3.schemeCategory10);

    cities.forEach(function(city, i) {
      var cityData = data.filter(function(d) { return d.city == city; });
      chart.append("path")
        .datum(cityData)
        .attr("fill", "none")
        .attr("class", "line")
        .attr("d", line)
        .attr("stroke", colorScale(city))
        .attr("opacity", 0.5)
        .attr("stroke-width", 1)
        .on("mouseover", function() {
            highlightLine(city);
        })
        .on("mouseout", function() {
            unhighlightLine();
        });

    });

    function highlightLine(city) {
      d3.selectAll(".line")
        .attr("stroke-width", function(d) {
          return d[0].city === city ? 3 : 1;
        })
        .attr("opacity", function(d) {
          return d[0].city === city ? 2 : 0.5;
        });
      // Find the circle marker for the selected city and highlight it
      var selectedMarker = null;
      map.eachLayer(function(layer) {
        // if (layer instanceof L.CircleMarker) {
        //   layer.openTooltip();
        //   console.log(layer.getTooltip())
        // }
        if (layer instanceof L.CircleMarker && layer.options.city && layer.options.city == city) {
          layer.bindTooltip(city, {permanent: true, className: "city-label"}).openTooltip();
          layer.setStyle({ fillOpacity: 0.5 });
        }
      });

      // // If tooltip is not open, store city name in variable for later use
      // if (!selectedMarker.getTooltip().isOpen() & selectedMarker != null) {
      //   highlightedCity = city;
      // }
      //
      // // Update chart when tooltip is opened
      // selectedMarker.on("tooltipopen", function() {
      //   var city = this.getTooltip().getContent();
      //   highlightLine(city);
      // });
    }

    function unhighlightLine() {
      d3.selectAll(".line")
        .attr("stroke-width", 1)
        .attr("opacity", 0.5);

      map.eachLayer(function(layer) {
          if (layer instanceof L.CircleMarker) {
            layer.setStyle({ fillOpacity: 0 });
            layer.closeTooltip();
          }
      });
    }

});
