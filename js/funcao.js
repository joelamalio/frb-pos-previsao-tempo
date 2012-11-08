function obterLocalizacaoGeografica() {
    var x;
    var y;
    if(geo_position_js.init()) {
        geo_position_js.getCurrentPosition( function (p) {
            x = p.coords.latitude;
            y = p.coords.longitude;
        }, function(p) {},{
            enableHighAccuracy:true
        });
    }
    return {
        "latitude" : x, 
        "longitude" : y
    };
}