function obterLocalizacaoGeografica() {
    var x;
    var y;
    if(geo_position_js.init()) {
        geo_position_js.getCurrentPosition( function (p) {
            x = p.coords.latitude;
            y = p.coords.longitude;
            obterPrevisaoTempo({"latitude" : x, "longitude" : y});
        }, function(p) {},{
            enableHighAccuracy:true
        });
    }
    return {
        "latitude" : x, 
        "longitude" : y
    };
}

function chamadaAjaxPadrao(query, callBack) {
    $.ajax({
        url: query,
        dataType: "html",
        success: callBack
    });
}

function obterPrevisaoTempo(localizacao) {
    var URL = "http://openweathermap.org/data/2.1/find/city?lat=" + localizacao.latitude + "&lon=" + localizacao.longitude + "&cnt=4";
    
    chamadaAjaxPadrao(URL, function(json) {
        var infoCidade = json.list[0];
        alert(infoCidade);
    });
    
    
/*var info = {
        "message":"Model=GFS-OWM, ",
        "cod":"200",
        "calctime":0.012,
        "cnt":10,
        "list":[{
            "id":6730265,
            "name":"Obolensk",
            "coord":{
                "lon":37.224483,
                "lat":54.977409
            },
            "distance":14.54,
            "main":{
                "temp":272.15,
                "temp_min":272.14,
                "temp_max":272.65,
                "pressure":998.48,
                "humidity":96.6
            },
            "dt":1352412792,
            "wind":{
                "speed":2.25,
                "deg":225,
                "gust":3.6
            },
            "clouds":{
                "all":0
            },
            "weather":[{
                "id":800,
                "main":"Clear",
                "description":"sky is clear",
                "icon":"02n"
            }]
        },{
            "id":541235,
            "name":"Kremenki",
            "coord":{
                "lon":37.12611,
                "lat":54.884998
            },
            "distance":15.113,
            "main":{
                "temp":272.15,
                "temp_min":272.14,
                "temp_max":272.65,
                "pressure":998.48,
                "humidity":96.6
            },
            "dt":1352413079,
            "wind":{
                "speed":2.25,
                "deg":225,
                "gust":3.6
            },
            "clouds":{
                "all":0
            },
            "weather":[{
                "id":800,
                "main":"Clear",
                "description":"sky is clear",
                "icon":"02n"
            }]
        },{
            "id":462792,
            "name":"Zhukovo",
            "coord":{
                "lon":36.744019,
                "lat":55.03178
            },
            "distance":16.698,
            "main":{
                "temp":272.3,
                "temp_min":272.27,
                "temp_max":272.57,
                "pressure":997.94,
                "humidity":96.8
            },
            "dt":1352413084,
            "wind":{
                "speed":2.05,
                "deg":222,
                "gust":3.1
            },
            "clouds":{
                "all":1
            },
            "weather":[{
                "id":800,
                "main":"Clear",
                "description":"sky is clear",
                "icon":"02n"
            }]
        },{
            "id":504576,
            "name":"Protvino",
            "coord":{
                "lon":37.217781,
                "lat":54.86639
            },
            "distance":20.354,
            "main":{
                "temp":272.15,
                "temp_min":272.14,
                "temp_max":272.65,
                "pressure":998.48,
                "humidity":96.6
            },
            "dt":1352413298,
            "wind":{
                "speed":2.25,
                "deg":225,
                "gust":3.6
            },
            "clouds":{
                "all":0
            },
            "weather":[{
                "id":800,
                "main":"Clear",
                "description":"sky is clear",
                "icon":"02n"
            }]
        },{
            "id":577856,
            "name":"Belousovo",
            "coord":{
                "lon":36.673199,
                "lat":55.095001
            },
            "distance":23.345,
            "main":{
                "temp":272.3,
                "temp_min":272.27,
                "temp_max":272.57,
                "pressure":997.94,
                "humidity":96.8
            },
            "dt":1352412978,
            "wind":{
                "speed":2.05,
                "deg":222,
                "gust":3.1
            },
            "clouds":{
                "all":1
            },
            "weather":[{
                "id":800,
                "main":"Clear",
                "description":"sky is clear",
                "icon":"02n"
            }]
        },{
            "id":504798,
            "name":"Proletarskiy",
            "coord":{
                "lon":37.39019,
                "lat":55.02219
            },
            "distance":25.001,
            "main":{
                "temp":272.11,
                "temp_min":272.09,
                "temp_max":272.77,
                "pressure":997.97,
                "humidity":96.2
            },
            "dt":1352412595,
            "wind":{
                "speed":2.64,
                "deg":229,
                "gust":4.1
            },
            "clouds":{
                "all":0
            },
            "weather":[{
                "id":800,
                "main":"Clear",
                "description":"sky is clear",
                "icon":"02n"
            }]
        },{
            "id":516436,
            "name":"Obninsk",
            "coord":{
                "lon":36.610279,
                "lat":55.096943
            },
            "distance":27.065,
            "main":{
                "temp":272.3,
                "temp_min":272.27,
                "temp_max":272.57,
                "pressure":997.94,
                "humidity":96.8
            },
            "dt":1352413389,
            "wind":{
                "speed":2.05,
                "deg":222,
                "gust":3.1
            },
            "clouds":{
                "all":1
            },
            "weather":[{
                "id":800,
                "main":"Clear",
                "description":"sky is clear",
                "icon":"02n"
            }]
        },{
            "id":496527,
            "name":"Serpukhov",
            "coord":{
                "lon":37.410831,
                "lat":54.921391
            },
            "distance":27.646,
            "main":{
                "temp":272.11,
                "temp_min":272.09,
                "temp_max":272.77,
                "pressure":997.97,
                "humidity":96.2
            },
            "dt":1352413396,
            "wind":{
                "speed":2.64,
                "deg":229,
                "gust":4.1
            },
            "clouds":{
                "all":0
            },
            "weather":[{
                "id":800,
                "main":"Clear",
                "description":"sky is clear",
                "icon":"02n"
            }]
        },{
            "id":579529,
            "name":"Balabanovo",
            "coord":{
                "lon":36.660599,
                "lat":55.18161
            },
            "distance":29.568,
            "main":{
                "temp":272.3,
                "temp_min":272.27,
                "temp_max":272.57,
                "pressure":997.94,
                "humidity":96.8
            },
            "dt":1352413235,
            "wind":{
                "speed":2.05,
                "deg":222,
                "gust":3.1
            },
            "clouds":{
                "all":1
            },
            "weather":[{
                "id":800,
                "main":"Clear",
                "description":"sky is clear",
                "icon":"02n"
            }]
        },{
            "id":484287,
            "name":"Tarusa",
            "coord":{
                "lon":37.176666,
                "lat":54.723331
            },
            "distance":32.776,
            "main":{
                "temp":272.84,
                "temp_min":272.68,
                "temp_max":272.89,
                "pressure":994.29,
                "humidity":97.8
            },
            "dt":1352413030,
            "wind":{
                "speed":2.19,
                "deg":217,
                "gust":3.4
            },
            "clouds":{
                "all":2
            },
            "weather":[{
                "id":800,
                "main":"Clear",
                "description":"sky is clear",
                "icon":"02n"
            }]
        }]
    }*/
}