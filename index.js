//--------------------------------------------------

 var map = new ol.Map({
    layers: [new ol.layer.Tile({ source: new ol.source.OSM() })],
    target: document.getElementById('map'),
    view: new ol.View({
        center: [2015491.5618235283, 8289494.729588233],
        zoom: 7
    })
  });

loadPins();

//-------------Functions--------------------------------

function drawRoute(evt){
    var source = new ol.source.Vector();

    var styleFunction = function(feature) {
      var geometry = feature.getGeometry();
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

    //popup (dyker upp vid dubbelklick)
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
}

//--------------Laddar gamla pins från databasen, inte några rutter----------------

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
            "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::4326" }},

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
          
    });
}

//-----------------------------------------

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

//--------------------------------------------------

document.getElementById("draw").addEventListener("click", drawRoute);

