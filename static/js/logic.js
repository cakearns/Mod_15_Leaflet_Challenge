var worldCoord = [0, 0];
var zoomlevel = 3;

function createMap(highlayer, medlayer, lowlayer, tectoniclayer)
{
    var streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

// grayscale layer
    var grayscale = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
});

//terrain layer
    var terrain = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

    var baseMap = {"Street Map": streetmap, "Grayscale": grayscale, "Terrain": terrain
    }
    //overlay maps
    var overlaymaps = {"High Magnitude Earthquake": highlayer, "Medium Magntitude Layer": medlayer, "Low Magnitude Earthquakes": lowlayer, "Tectonic Plates": tectoniclayer}

    var map = L.map("map", {center: worldCoord, zoom: zoomlevel, layers: [streetmap, highlayer, medlayer, lowlayer, tectoniclayer]})

    //legend
    var legend = L.control({position: "bottomright"})

    legend.onAdd = function()
    {
        var div = L.DomUtil.create("div", "info legend");
        var intervals = [-10, 10, 30, 50, 70, 90];
        var colors = [
            '#00FF00',
            '#66ff00',
            '#ccff00',
            '#FFCC00',
            '#ff6600',
            '#FF0000']

        for(var i=0; i<intervals.length; i++)
            {
            div.innerHTML += "<i style='background: " + colors[i] + "'></i>" 
            + intervals[i] + (intervals[i+1]  ? ' &ndash; ' + intervals[i+1] + ' <br>': '+')
            }
            return div;
        }          
        
    legend.addTo(map)
    
    L.control.layers(baseMap, overlaymaps, {collapsed:false,}).addTo(map)
        
}

//Create Markers

function createMarkers(data)
{
    var quakeinfo = data.features
    highMag = []
    medMag = []
    lowMag = []

    for(i=0; i<quakeinfo.length; i++){
        lat = quakeinfo[i].geometry.coordinates[1]
        lng = quakeinfo[i].geometry.coordinates[0]

       var quakeradius = (quakeinfo[i].properties.mag)*15000

       if(quakeinfo[i].geometry.coordinates[2]>90)
       quakecolor = '#FF0000'
       else if(quakeinfo[i].geometry.coordinates[2]>70)
       quakecolor = '#ff6600'
       else if(quakeinfo[i].geometry.coordinates[2]>50)
       quakecolor = '#FFCC00'
       else if(quakeinfo[i].geometry.coordinates[2]>30)
       quakecolor = '#ccff00'
       else if(quakeinfo[i].geometry.coordinates[2]>10)
       quakecolor = '#66ff00'
       else 
       quakecolor = '#00FF00'

        
       var quakearea = L.circle([lat, lng], {fillOpacity: .4,
        color: quakecolor,
        fillColor: quakecolor,
        radius: quakeradius,
        weight: 1
       }).bindPopup(`<h2> ${quakeinfo[i].properties.place}</h2><hr>
       <h3> Date: ${new Date(quakeinfo[i].properties.time)}</h3>
        <h3>Depth: ${quakeinfo[i].geometry.coordinates[2]}</h3>
        <h3>Magnitude: ${quakeinfo[i].properties.mag}`)

        if(quakeinfo[i].properties.mag>6)
        highMag.push(quakearea)
        else if(quakeinfo[i].properties.mag>3.5)
        medMag.push(quakearea)
        else lowMag.push(quakearea)
    }

    var highlayer = L.layerGroup(highMag)
    var medlayer = L.layerGroup(medMag)
    var lowlayer = L.layerGroup(lowMag)
    createMap(highlayer, medlayer, lowlayer, tectoniclayer)
}

//tectonic layer
d3.json('PB2002_boundaries.json').then(
    function(ldata){
       tectoniclayer = L.geoJson(ldata, {
            color: 'orange',
            weight: 2
        })
    
    },
    createMarkers
)

// Perform call for earthquake information
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson').then(
    // function(data){
    //     console.log(data)
    // },
    createMarkers
)




