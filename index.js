var vectorSource = new ol.source.Vector({});

var layerRuta = new ol.layer.Vector({
    source: vectorSource,
    title: "Pinpoints",
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'red',
            width: 3
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.1)'
        })
    })
});


var map = new ol.Map({
    layers: [new ol.layer.Tile({ source: new ol.source.OSM() }), layerRuta],
    target: document.getElementById('map'),
    view: new ol.View({
        projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 3
    })
});

loadroads();

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

        console.log(vectorSource)
        var white = [255, 255, 255, 1];
        var blue = [0, 153, 255, 1];
        var red = [255,0,0,1];

        console.log(layerRuta)

        function findNearestMarker(coords) {
            var source = layerRuta.getSource();
            var Allfeatures = source.getFeatures();

            for (var f of Allfeatures) {
                f.setStyle(null)
            }

           var feature = layerRuta.getSource().getClosestFeatureToCoordinate(coords);
           //ändra styling för highlight
            // get all objects added to the map
            feature.setStyle(new ol.style.Style ({
                    fill: new ol.style.Fill({
                      color: blue
                    }),
                    stroke: new ol.style.Stroke({
                      color: red,
                      width: 3 / 2
                    })
                })
            );

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

    }
  
    function error() {
        output.innerHTML = "Unable to retrieve your location";
    }
  
    output.innerHTML = "<p>Locating…</p>";
  
    navigator.geolocation.getCurrentPosition(success, error);
}

function postRun() {
    var form = document.getElementById("sendrun");
    coords=form.elements[6].value;
    var res = coords.split(",");
    var n = res.length;
    var sc =''
    for (i = 0; i < n-1; i++) {
         x=res[i];
         y=res[i+1];
         sc=sc + x + ' ' + y + ',';
    }

    var newStr = sc.slice(0, sc.length-1);
    console.log(newStr)
    
    data=JSON.stringify ({
        distance: form.elements[0].value,
        description: form.elements[1].value,
        routename: form.elements[2].value,
        cityarea: form.elements[3].value,
        terrain: form.elements[4].value,
        private: form.elements[5].value,
        coords: newStr
    })
	
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
}

function resetForm(){
	document.getElementById("sendrun").reset();	
}

function drawRoute(evt){
    var source = new ol.source.Vector();
     var styleFunction = function(feature) {
      var geometry = feature.getGeometry();
      var coordinates = geometry.getCoordinates();
       var styles = [
         // linestring
         new ol.style.Style({
           stroke: new ol.style.Stroke({
             color: '#3138ff',
             width: 3
           })
         })
       ];
    
       geometry.forEachSegment(function(start, end) {
         var dx = end[0] - start[0];
         var dy = end[1] - start[1];
         styles.push(new ol.style.Style({
           geometry: new ol.geom.Point(end),
         }));
       });
       var form = document.getElementById("sendrun");
       form.elements['distance'].value=geometry.getLength()
       form.elements['coordinates'].value=coordinates
       
    
       return styles;
     };
    
     var vector = new ol.layer.Vector({
       source: source,
       style: styleFunction
     });
      map.addLayer(vector);
    
      map.addInteraction(new ol.interaction.Draw({
        source: source,
        type: 'LineString'
    }));
    var modify = new ol.interaction.Modify({source: source});     //Gör så att den ritade linjen går att ändra i efterhand 
    map.addInteraction(modify);
}


geoFindMe()
document.getElementById("postrun").addEventListener("click", postRun);
document.getElementById("resetform").addEventListener("click", resetForm);
document.getElementById("draw").addEventListener("click", drawRoute);




