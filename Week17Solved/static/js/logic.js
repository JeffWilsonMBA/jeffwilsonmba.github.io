var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(earthquakeURL, function(data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .6,
        color: "#000",
        stroke: true,
        weight: .8
    })
  }
  });


  Map(earthquakes);
}


function Map(earthquakes) {

    // Define map layers
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoiY2Fwd2lsc29uIiwiYSI6ImNqaXhmcGE0MDNlZ3QzcXA4ZG5peTBweXMifQ.bqehGRuvWdNV81GfWMvKng");
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoiY2Fwd2lsc29uIiwiYSI6ImNqaXhmcGE0MDNlZ3QzcXA4ZG5peTBweXMifQ.bqehGRuvWdNV81GfWMvKng");

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoiY2Fwd2lsc29uIiwiYSI6ImNqaXhmcGE0MDNlZ3QzcXA4ZG5peTBweXMifQ.bqehGRuvWdNV81GfWMvKng");
  
    // Bring in baseMaps 
    var baseMaps = {
      "Outdoors": outdoors,
      "Satellite": satellite,
      "Dark Map": darkmap
    };

    // Creat tectonic plate layer
    var tectonicPlates = new L.LayerGroup();

    // Create overlays
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": tectonicPlates
    };

    // Create map
    var myMap = L.map("map", {
      center: [
        37.09, -95.71],
      zoom: 3.00,
      layers: [outdoors, earthquakes, tectonicPlates]
    }); 

    // Add Tectonic data
    d3.json(tectonicURL, function(plateData) {
      // Add geoJSON data to tectonicplates layer
      L.geoJson(plateData, {
        color: "red",
        weight: 2
      })
      .addTo(tectonicPlates);
  });

  
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

  //Create legend
  var legend = L.control({position: 'bottomleft'});

    legend.onAdd = function(myMap){
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

  // loop through density intervals
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(myMap);
}
   

  //Create color range for the circle 
  function getColor(d){
    return d > 5 ? "#a54500":
    d  > 4 ? "#cc5500":
    d > 3 ? "#ff6f08":
    d > 2 ? "#ff9143":
    d > 1 ? "#ffb37e":
             "#ffcca5";
  }

  //Change the maginutde of the earthquake 
  function getRadius(value){
    return value*25000
  }