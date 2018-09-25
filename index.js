var map = new ol.Map({
    layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
    target: document.getElementById('map'),
    view: new ol.View({
        center: [0, 0],
        zoom: 3
    })
});

loadPins();
//felixxen

var popup = new ol.Overlay({
    element: document.getElementById('popup')
});

map.addOverlay(popup);

map.on('dblclick', function(evt) {
    var coordinate = evt.coordinate;
    popup.setPosition(coordinate);
    document.getElementById("lon").value =coordinate[0];
    document.getElementById("lat").value =coordinate[1];
    var marker = new ol.Overlay({
        position: coordinate,
        positioning: 'center-center',
        element: document.getElementById('marker'),
        stopEvent: false
    });
    map.addOverlay(marker);

});

function postPin(evt) {
    lon=document.getElementById("lon").value;
    lat=document.getElementById("lat").value;
    desc=document.getElementById("desc").value;
    //addMarker(coords);
    data=JSON.stringify ({
        lon: lon,
        lat: lat,
        desc: desc
    })

    var req = $.ajax ({
        url: "http://localhost:3000/pin",
        type: "POST",
        cache: false,
        contentType: "application/json",
        data: data
    });

    req.done(function(data) {
        alert(data)
    });
}
function loadPins(evt){
    var req = $.ajax ({
        url: "http://localhost:3000/loadpins",
        type: "GET",
    });
    
    req.done(function(resp_json) {
        console.log(JSON.stringify(resp_json));
        var listaFeat=jsonAnswerDataToListElements(resp_json);
   
        var pointdata= {
            "type": "FeatureCollection",
            "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3857" }},

            "features": listaFeat
        };
        
   
        console.log(JSON.stringify(pointdata));
        var vectorSource = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(pointdata)
        });

        console.log(vectorSource)
        var white = [255, 255, 255, 1];
        var blue = [0, 153, 255, 1];
        var red = [255,0,0,1];

        var layerRuta = new ol.layer.Vector({
            source: vectorSource,
            title: "Pinpoints",
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 3 * 2,
                    fill: new ol.style.Fill({
                      color: blue
                    }),
                    stroke: new ol.style.Stroke({
                      color: white,
                      width: 3 / 2
                    })
                }),
            })
        });
        console.log(layerRuta)
        map.addLayer(layerRuta);

        function findNearestMarker(coords) {
            var source = layerRuta.getSource();
            var Allfeatures = source.getFeatures();

            for (var f of Allfeatures) {
                f.setStyle(null)
            }

           var feature = layerRuta.getSource().getClosestFeatureToCoordinate(coords);
            // get all objects added to the map
            feature.setStyle(new ol.style.Style ({
                image: new ol.style.Circle({
                    radius: 3 * 2,
                    fill: new ol.style.Fill({
                      color: blue
                    }),
                    stroke: new ol.style.Stroke({
                      color: red,
                      width: 3 / 2
                    })
                })
            }));

        }
          
        map.on('singleclick', function(evt) {
            var coords = (evt.coordinate);
            findNearestMarker(coords);
        },  false);
    });
}


function jsonAnswerDataToListElements(json_answer){
    data=json_answer;
    var n=data.length;
    var r=[]
    for( var i = 0; i <n; ++i ) {
        var row = data[i];
        var geomJson = $.parseJSON(row.st_asgeojson);
        r.push(geomJson);
    }
    return r;
}
//Find my position
function geoFindMe() {
    var output = document.getElementById("out");
  
    if (!navigator.geolocation){
      output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
      return;
    }
  
    function success(position) {
        var latitude  = position.coords.latitude;
        var longitude = position.coords.longitude;
        output.innerHTML = '<p>Latitude is ' + latitude + '° <br>Longitude is ' + longitude + '°</p>';
        var coords = ol.proj.fromLonLat([longitude,latitude]);
        map.getView().animate({center: coords, zoom: 10});
        x=coords[0]
        y=coords[1]

        data=JSON.stringify ({
            x: x,
            y: y,
        })
    
        var req = $.ajax ({
            url: "http://localhost:3000/myposition",
            type: "POST",
            cache: false,
            contentType: "application/json",
            data: data
        });
    
        req.done(function(data) {
            alert(data)
        });

    }
  
    function error() {
        output.innerHTML = "Unable to retrieve your location";
    }
  
    output.innerHTML = "<p>Locating…</p>";
  
    navigator.geolocation.getCurrentPosition(success, error);
}

function myFunction() {
    setInterval(function(){ geoFindMe() }, 60000);
}

document.getElementById("findloc").addEventListener("click", geoFindMe);
document.getElementById("postPin").addEventListener("click", postPin);
geoFindMe()
myFunction()
