// Define the control that will contain the chart
var chartControl = L.Control.extend({
  options: {
    position: 'topright',
    backgroundColor: 'rgba(255, 255, 255, 0.6)'
  },
  onAdd: function (map) {
    // Create the container for the chart
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    container.id = 'chart-container';
    container.style.backgroundColor = this.options.backgroundColor;
    // Add the chart element to the container
    // var chartElement = document.getElementById('chart');
    // container.appendChild(chartElement);
    //container.style.opacity = 1;
    // Prevent clicks on the chart from propagating to the map
    // L.DomEvent.disableClickPropagation(container);

    return container;
  }
});

// Set up the Leaflet map
var map = L.map('map', {zoomControl: false}).setView([52.5200, 13.4050], 6);

//map.addControl(new chartControl());

// Add the tile layer (map tiles from OpenStreetMap)
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', {
        minZoom: 0,
        maxZoom: 10,
        tms: false,
        attribution: ''
}).addTo(map);

L.control.zoom({
    position: 'topleft'
}).addTo(map);


// LEGEND
let no2Legend = `<div class="card align-self-center"><div class="card-body"><div id="legend">`;
no2Legend += `<div class="scale">`;
no2Legend += `<div id="gradient-bar"></div>`;
no2Legend += `<div class="indicator" style="top: -5px">250</div>`;
no2Legend += `<div class="indicator" style="top: 15px">200</div>`;
no2Legend += `<div class="indicator" style="top: 35px">150</div>`;
no2Legend += `<div class="indicator" style="top: 55px">100</div>`;
no2Legend += `<div class="indicator" style="top: 75px">50</div>`;
no2Legend += `<div class="indicator" style="top: 95px">0</div>`;
no2Legend += `<div class="indicator" style="top: 30px; left: 45px; writing-mode: vertical-rl; transform: rotate(-180deg);">μmol m⁻²</div>`;
no2Legend += `</div></div></div></div>`;



L.tileLayer('https://raw.githubusercontent.com/decarbnow/data/master/layers/no2/tiles/test/2/{z}/{x}/{y}.png', {
  minZoom: 0,
  maxZoom: 10,
  maxNativeZoom: 6,
  opacity: 0.6,
  tms: false
}).addTo(map);

let legend = null;
legend = L.control({ position: "bottomright" });
                    legend.onAdd = function(map) {
                        var div = L.DomUtil.create("div", "legend");
                        div.innerHTML = no2Legend;
                        return div;
                    };
                    legend.addTo(map);