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
    var length = geometry.getLength()
    if (length > 1000){
        length = (length / 1000).toFixed(2) + " km"
    } else {
        length = length.toFixed(2) + " m"
    }

    form.elements['distance'].value=length 
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
        //console.log(JSON.stringify(resp_json));
        var listaFeat=jsonAnswerDataToListElements(resp_json);
   
        var linjedata= {
            "type": "FeatureCollection",
            "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::4326" }},

            "features": listaFeat
        };

        vectorSource.addFeatures( (new ol.format.GeoJSON()).readFeatures(linjedata));
        
        //console.log(JSON.stringify(linjedata));
        //console.log(vectorSource)
        //console.log(layerRuta)
        
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
        alert("Geolocation is not supported by your browser")
      return;
    }
  
    function success(position) {
        var latitude  = position.coords.latitude;
        var longitude = position.coords.longitude;
        var coords = ol.proj.fromLonLat([longitude,latitude]);
        map.getView().animate({center: coords, zoom: 13});
    }
  
    function error() {
        alert("Error")
        }
    
    navigator.geolocation.getCurrentPosition(success, error);
}

//------------------------------------

function postRun() {
    var form = document.getElementById("sendrun");
    coords=form.elements['coordinates'].value;
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
    var dist = form.elements["distance"].value
    var dist2 = dist.substr(0, dist.length-2)
    console.log(dist2)

    data=JSON.stringify ({
        distance: dist2,
        description: form.elements["description"].value,
        routename: form.elements["routename"].value,
        cityarea: form.elements["cityarea"].value,
        terrain: form.elements["terrain"].value,
        private: form.elements["private"].value,
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
    document.getElementById("drawpath").disabled = true;
    
}
//-------------------------------
function snapRoute(evt){


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
                width: 4
            })
        })
        );

    }
          
    var form = document.getElementById("sendrun");
    coords=form.elements['coordinates'].value;
    console.log(coords)
    var res = coords.split(",");
    console.log(res)

    for (i = 0; i < res.length; i=i+2){
        coords = res[i] +","+ (res[i+1])
         console.log(coords)
         findNearestMarker(coords);
    }

    document.getElementById("snap").disabled = true;
}

//-------------------------------

geoFindMe()
loadroads();
document.getElementById("postrun").addEventListener("click", postRun);
document.getElementById("resetform").addEventListener("click", resetForm);
document.getElementById("drawpath").addEventListener("click", drawRoute);
document.getElementById("snap").addEventListener("click", snapRoute);

