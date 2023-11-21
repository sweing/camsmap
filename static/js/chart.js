let markerSet = false
let pathSelections = []; // Array to store path selections


function linechart(data, indexType, yearType, monthType, chartElement = "chart-raw") {
  let winner = [];
  const parseDate = d3.timeParse("%Y-%m-%d");
  var CustomCircleMarker = L.CircleMarker.extend({
      options: {
        className: 'city' // Add a custom class to the marker element
      }
    });

  //var indexType = document.getElementById('chart-type').value;
  let xTickFormat = "%Y"

  if(indexType == "Yearly Index Challenge") {
    xTickFormat = "%b"
    let currentYear = d3.max(data, d => parseDate(d.year).getFullYear());
    data = data.filter(d => parseDate(d.year).getFullYear() === parseInt(yearType));
    data.forEach(item => {
      winner.push(item.winner_year);
    });

    winner = [...new Set(winner)];

    if (winner[0] !== null) {
      winner = winner  + " wins!"
    }
    
  }
  if(indexType == "Monthly Index Challenge") {
    xTickFormat = "%d"
    const currentDate = d3.max(data, d => parseDate(d.year));
    const currentMonth = parseInt(monthType)-1;
    const currentYear = parseInt(yearType);
    data = data.filter(d => {
      const date = parseDate(d.year);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    data.forEach(item => {
      winner.push(item.winner_month);
    });

    winner = [...new Set(winner)];
    if (winner[0] !== null) {
      winner = winner  + " wins!"
    }
  }

  chart =  LineChart(data, {
    x: d => parseDate(d.year),
    y: d => d[indexType],
    z: d => d.city,
    lat: d => d.lat,
    lng: d => d.lng,
    width: document.getElementById(chartElement).offsetWidth,
    height: 400,
    color: "steelblue",
    winner: winner,
    //yLabel: "Nitrogen dioxide, composite 1-to-3-year-moving-averages (60/30/10)",
    //voronoi: true // if true, show Voronoi overlay

  })

  function LineChart(data, {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => +y, // given d in data, returns the (quantitative) y-value
    z = () => 1, // given d in data, returns the (categorical) z-value
    lat = lat,
    lng = lng,
    title, // given d in data, returns the title text
    defined, // for gaps in data
    curve = d3.curveLinear, // method of interpolation between points
    marginTop = 20, // top margin, in pixels
    marginRight = 10, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 45, // left margin, in pixels
    width = 640, // outer width, in pixels
    height = 300, // outer height, in pixels
    xType = d3.scaleUtc, // type of x-scale
    xDomain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    zDomain, // array of z-values
    color = "currentColor", // stroke color of line, as a constant or a function of *z*
    strokeLinecap, // stroke line cap of line
    strokeLinejoin, // stroke line join of line
    strokeWidth = 1.5, // stroke width of line
    strokeOpacity, // stroke opacity of line
    mixBlendMode = "multiply", // blend mode of lines
    winner = "",
    voronoi // show a Voronoi overlay? (for debugging)
  } = {}) {
    // Compute values.

    // Check if data exists
    if (data.length === 0) {
      d3.select("#" + chartElement)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text("Data not available yet!");
      return; // Return from the function
    }
    if (indexType === "Raw" || indexType === "365d moving average" || indexType === "Composite moving average") {
      yLabel = "Surface concentration [µg/m³]";
    }
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const Z = d3.map(data, z);
    const LAT = d3.map(data, lat);
    const LNG = d3. map(data, lng);
    const O = d3.map(data, d => d);
    if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
    const D = d3.map(data, defined);

    // Compute default domains, and unique the z-domain.
    if (xDomain === undefined) xDomain = d3.extent(X);
    if (yDomain === undefined) yDomain = d3.extent(Y);
    if (zDomain === undefined) zDomain = Z;
    zDomain = new d3.InternSet(zDomain);

    // Omit any data not present in the z-domain.
    const I = d3.range(X.length).filter(i => zDomain.has(Z[i]));

    // Construct scales and axes.
    const xScale = xType(xDomain, xRange);
    const yScale = yType(yDomain, yRange);
    const xAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0).tickFormat(d3.timeFormat(xTickFormat));
    const yAxis = d3.axisLeft(yScale).ticks(height / 60, yFormat);

    // Compute titles.
    const T = title === undefined ? Z : title === null ? null : d3.map(data, title);

    // Construct a line generator.
    const line = d3.line()
        .defined(i => D[i])
        .curve(curve)
        .x(i => xScale(X[i]))
        .y(i => yScale(Y[i]));

    const svg = d3.select("#" + chartElement)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .style("-webkit-tap-highlight-color", "transparent")
        .on("pointerenter", pointerentered)
        .on("pointermove", pointermoved)
        .on("pointerleave", pointerleft)
        .on("touchstart", event => event.preventDefault());
        

    // An optional Voronoi display (for fun).
    if (voronoi) svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("d", d3.Delaunay
          .from(I, i => xScale(X[i]), i => yScale(Y[i]))
          .voronoi([0, 0, width, height])
          .render());

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(voronoi ? () => {} : g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 12)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel));

    // Add the "Winner" text in the middle of the chart
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", marginTop+10)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .text(winner)
      .transition()
      .style("font-size", "50px").delay(1000).duration(1000);

    const path = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", typeof color === "string" ? color : null)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
      .selectAll("path")
      .data(d3.group(I, i => Z[i]))
      .join("path")
        .style("mix-blend-mode", mixBlendMode)
        .attr("stroke", typeof color === "function" ? ([z]) => color(z) : null)
        .attr("d", ([, I]) => line(I));

    const dot = svg.append("g")
        .attr("display", "none");

    dot.append("circle")
        .attr("r", 2.5);

    dot.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("y", -20);

    pathSelections.push(path); // Add path selection to the array

    cities = [...new Set(Z)]
      // Add  the markers for each city
    cities.forEach(function(city) {
      var cityData = data.filter(function(d) { return d.city == city; });
      var firstDataPoint = cityData[0];
      if(!markerSet){
        var marker = new CustomCircleMarker([firstDataPoint.lat, firstDataPoint.lng], { city: city, radius: 10, fillOpacity: 0, color: "black", weight: 2, opacity: 0.5 }).addTo(map);
      } else {
        var marker = new CustomCircleMarker([firstDataPoint.lat, firstDataPoint.lng], { city: city, radius: 10, fillOpacity: 0, color: "black", weight: 2, opacity: 0 }).addTo(map);
      }
      
      // Add interaction between the map and chart
      marker.on("mouseover", function() {
        pointerentered()

        pathSelections.forEach(function (pathSelection) {
          pathSelection
            .style("stroke", ([z]) => city === z ? null : "#ddd")
            .filter(([z]) => city === z)
            .raise();
        });

        //path.style("stroke", ([z]) => city === z ? null : "#ddd").filter(([z]) => city === z).raise();
        if (T) dot.select("text").text(null);
        dot.attr("transform", null);

        map.eachLayer(function(layer) {
            if (layer instanceof L.CircleMarker) {
                layer.setStyle({ fillOpacity: 0 });
                layer.closeTooltip();
            }
            if (layer instanceof L.CircleMarker && layer.options.city && layer.options.city == city) {
                layer.bindTooltip(city, {permanent: true, className: "city-label"}).openTooltip();
                layer.setStyle({ fillOpacity: 0.5 });
            }
        });      
      }).on("mouseout", function() {
        pointerleft();
      });
    });
    
    function pointermoved(event) {
      const [xm, ym] = d3.pointer(event);
      const i = d3.least(I, i => Math.hypot(xScale(X[i]) - xm, yScale(Y[i]) - ym)); // closest point
      let lat = LAT[i];
      let lng = LNG[i];
      let zoom = map.getZoom();
      
      /*map.flyTo([lat, lng], zoom, {
        animate: true,
        duration: 1.5
      });*/

      //path.style("stroke", ([z]) => Z[i] === z ? null : "#ddd").filter(([z]) => Z[i] === z).raise();
      pathSelections.forEach(function (pathSelection) {
          pathSelection
            .style("stroke", ([z]) => Z[i] === z ? null : "#ddd").filter(([z]) => Z[i] === z).raise();
      });

      dot.attr("transform", `translate(${xScale(X[i])},${yScale(Y[i])})`);
      if (T) dot.select("text").text(T[i]);
      svg.property("value", O[i]).dispatch("input", {bubbles: true});

      map.eachLayer(function(layer) {
          if (layer instanceof L.CircleMarker) {
              layer.setStyle({ fillOpacity: 0 });
              layer.closeTooltip();
          }
          if (layer instanceof L.CircleMarker && layer.options.city && layer.options.city == Z[i]) {
              layer.bindTooltip(Z[i], {permanent: true, className: "city-label"}).openTooltip();
              layer.setStyle({ fillOpacity: 0.5 });
          }
      });
    }

    function pointerentered() {
      //path.style("mix-blend-mode", null).style("stroke", "#ddd");
      pathSelections.forEach(function (pathSelection) {
          pathSelection
            .style("mix-blend-mode", null).style("stroke", "#ddd");
      });
      dot.attr("display", null);
    }

    function pointerleft() {
      pathSelections.forEach(function (pathSelection) {
          pathSelection
            .style("mix-blend-mode", mixBlendMode).style("stroke", null);
      });
      dot.attr("display", "none");
      svg.node().value = null;
      svg.dispatch("input", {bubbles: true});
      map.eachLayer(function(layer) {
            if (layer instanceof L.CircleMarker) {
              layer.setStyle({ fillOpacity: 0 });
              layer.closeTooltip();
            }
      });
    }

    return Object.assign(svg.node(), {value: null});
  }

  markerSet = true
}