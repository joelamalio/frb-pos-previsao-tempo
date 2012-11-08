function obterLocalizacaoGeografica() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(p) {
            var x = position.coords.latitude;
            var y = position.coords.longitude;
            obterPrevisaoTempo({
                "latitude" : x, 
                "longitude" : y
            });
        }, function(p) {});
    }
}

function obterPrevisaoTempo(localizacao) {
    //    var query = "http://openweathermap.org/data/2.1/find/city?lat=" + localizacao.latitude + "&lon=" + localizacao.longitude + "&cnt=4";
    var query = "http://openweathermap.org/data/2.1/find/city?lat=" + -12.986828 + "&lon=" + -38.484421 + "&cnt=4";
    
    $.ajax({
        url: query,
        dataType: "json",
        success: function (json) {
            var infoCidade = json.list[0];
            alert(infoCidade);
        }
    }); 
}