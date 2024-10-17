// Initialize the map
const map = L.map('map').setView([37.7749, -122.4194], 5); // Center map at San Francisco

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

// Function to set marker size based on earthquake magnitude
function getRadius(magnitude) {
    return magnitude * 4;  // Adjust size scaling factor as needed
}

// Function to set marker color based on earthquake depth
function getColor(depth) {
    return depth > 90 ? '#800026' :
           depth > 70 ? '#BD0026' :
           depth > 50 ? '#E31A1C' :
           depth > 30 ? '#FC4E2A' :
           depth > 10 ? '#FD8D3C' :
                        '#FFEDA0';
}

// Function to create legend
function createLegend() {
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        const depths = [0, 10, 30, 50, 70, 90];
        const colors = ['#FFEDA0', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];

        div.innerHTML = '<h4>Depth (km)</h4>';

        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                `<i style="background:${colors[i]}"></i> ${depths[i]}${(depths[i + 1] ? '&ndash;' + depths[i + 1] : '+')}<br>`;
        }
        return div;
    };
    legend.addTo(map);
}

// Function to bind popups to each marker
function bindPopup(feature, layer) {
    if (feature.properties && feature.properties.place) {
        layer.bindPopup(
            `<strong>Location:</strong> ${feature.properties.place}<br>
             <strong>Magnitude:</strong> ${feature.properties.mag}<br>
             <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`
        );
    }
}

 // Fetch earthquake data from the USGS GeoJSON API using D3
 d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
 .then(function(data) {
     // Add the earthquake data to the map as circle markers
     L.geoJSON(data, {
         pointToLayer: function (feature, latlng) {
             const magnitude = feature.properties.mag;
             const depth = feature.geometry.coordinates[2]; // depth is the 3rd coordinate
             return L.circleMarker(latlng, {
                 radius: getRadius(magnitude),  // Size based on magnitude
                 fillColor: getColor(depth),    // Color based on depth
                 color: '#000',
                 weight: 1,
                 opacity: 1,
                 fillOpacity: 0.8
             });
         },
         onEachFeature: bindPopup // Attach popups to each marker
     }).addTo(map);

     // Add the legend to the map
     createLegend();
 })
 .catch(function(error) {
     console.error('Error loading the GeoJSON data: ', error);
 });
