var vectorSource = new ol.source.Vector({});

var layerRuta = new ol.layer.Vector({
    source: vectorSource,
    title: "Pinpoints",
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'white',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.1)'
        })
    })
});

var drawSource = new ol.source.Vector();
    
var styleFunction = function(feature) {
    var geometry = feature.getGeometry();
    var coordinates = geometry.getCoordinates();
    var styles = [
        new ol.style.Style({
            stroke: new ol.style.Stroke({
            color: '#0003db',
            width: 3
            })
        })
    ];
    
    var form = document.getElementById("sendrun");
    form.elements['distance'].value=geometry.getLength()
    form.elements['coordinates'].value=coordinates
       
    return styles;
};
    
var vector = new ol.layer.Vector({
    source: drawSource,
    style: styleFunction
});

var map = new ol.Map({
    layers: [new ol.layer.Tile({ source: new ol.source.OSM() }),layerRuta, vector],
    target: document.getElementById('map'),
    view: new ol.View({
        projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 3
    })
});

//------------------------------

function loadroads(evt){
    var req = $.ajax ({
        url: "http://localhost:3000/loadroads",
        type: "GET",
    });
    
    req.done(function(resp_json) {
        console.log(JSON.stringify(resp_json));
        var listaFeat=jsonAnswerDataToListElements(resp_json);
   
        var linjedata= {
            "type": "FeatureCollection",
            "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::4326" }},

            "features": listaFeat
        };

        vectorSource.addFeatures( (new ol.format.GeoJSON()).readFeatures(linjedata));
        
        console.log(JSON.stringify(linjedata));
        console.log(vectorSource)
        console.log(layerRuta)
        
    });
}

//----------------------------------------------------

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
        map.getView().animate({center: coords, zoom: 13});
    }
  
    function error() {
        output.innerHTML = "Unable to retrieve your location";
    }
  
    output.innerHTML = "<p>Locating…</p>";
  
    navigator.geolocation.getCurrentPosition(success, error);
}

//------------------------------------

function postRun() {
    var form = document.getElementById("sendrun");
    data=JSON.stringify ({
        distance: form.elements[0].value,
        description: form.elements[1].value,
        routename: form.elements[2].value,
        cityarea: form.elements[3].value,
        terrain: form.elements[4].value,
        private: form.elements[5].value,
        coordinates: form.elements[6].value
    })
    alert("all good")
	
	var req = $.ajax ({
        url: "http://localhost:3000/postrun",
        type: "POST",
        cache: false,
        contentType: "application/json",
        data: data
    });
    
    req.done(function(resp_json) {
        alert(resp_json)
    });
    resetForm()
    drawRoute(false)
}

//----------------------------------------

function resetForm(){
    document.getElementById("sendrun").reset();  
    drawSource.clear();  
}

//------------------------------------------------

function drawRoute(evt){
    
    map.addInteraction(new ol.interaction.Draw({
        source: drawSource,
        type: 'LineString',
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: '#0003db',
              lineDash: [10, 10],
              width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                  color: 'rgba(0, 0, 0, 0.7)'
                })
            })
        })
    }));

    var modify = new ol.interaction.Modify({source: drawSource});     //Gör så att den ritade linjen går att ändra i efterhand 
    map.addInteraction(modify);
    document.getElementById("draw").disabled = true;
}
//-------------------------------
function snapRoute(evt){

    //----------------Kod som ej funkar--

    // drawingManager.addListener('polylinecomplete', function(poly) {
    //     var path = poly.getPath();
    //     polylines.push(poly);
    //     placeIdArray = [];
    //     runSnapToRoad(path);
    //   });

    //   function runSnapToRoad(path) {
    //     var pathValues = [];
    //     for (var i = 0; i < path.getLength(); i++) {
    //       pathValues.push(path.getAt(i).toUrlValue());
    //     }
      
    //     $.get('https://roads.googleapis.com/v1/snapToRoads', {
    //       interpolate: true,
    //       key: apiKey,
    //       path: pathValues.join('|')
    //     }, function(data) {
    //       processSnapToRoadResponse(data);
    //       drawSnappedPolyline();
    //       getAndDrawSpeedLimits();
    //     });
    //   }

    //   function processSnapToRoadResponse(data) {
    //     snappedCoordinates = [];
    //     placeIdArray = [];
    //     for (var i = 0; i < data.snappedPoints.length; i++) {
    //       var latlng = new google.maps.LatLng(
    //           data.snappedPoints[i].location.latitude,
    //           data.snappedPoints[i].location.longitude);
    //       snappedCoordinates.push(latlng);
    //       placeIdArray.push(data.snappedPoints[i].placeId);
    //     }
    //   }
      
    //   // Draws the snapped polyline (after processing snap-to-road response).
    //   function drawSnappedPolyline() {
    //     var snappedPolyline = new google.maps.Polyline({
    //       path: snappedCoordinates,
    //       strokeColor: 'black',
    //       strokeWeight: 3
    //     });
      
    //     snappedPolyline.setMap(map);
    //     polylines.push(snappedPolyline);
    //   }

    /////////

    function findNearestMarker(coords) {
         
         var source = layerRuta.getSource();
         var Allfeatures = source.getFeatures();

        var feature = layerRuta.getSource().getClosestFeatureToCoordinate(coords);

        // get all objects added to the map

        feature.setStyle(new ol.style.Style ({
            fill: new ol.style.Fill({
                color: '#db5300'
            }),
            stroke: new ol.style.Stroke({
                color: '#db5300',
                width: 2
            })
        })
        );
    }
      
    map.on('singleclick', function(evt) {
        var coords = (evt.coordinate);
        findNearestMarker(coords);
    },  false);

    document.getElementById("snap").disabled = true;
}

//-------------------------------

geoFindMe()
loadroads();
document.getElementById("postrun").addEventListener("click", postRun);
document.getElementById("resetform").addEventListener("click", resetForm);
document.getElementById("draw").addEventListener("click", drawRoute);
document.getElementById("snap").addEventListener("click", snapRoute);

