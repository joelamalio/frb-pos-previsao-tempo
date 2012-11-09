$(document).ready(function($) {
    obterPrevisaoDoTempoPorGeolocalizacao();
});

function converterKelvinEmCelsius(valor) {
    var TEMP_KELVIN = 273.15;
    return valor - TEMP_KELVIN;
}

function removerAcentuacao(texto) {
    texto = texto.replace(new RegExp('[ÁÀÂÃ]','gi'), 'A');
    texto = texto.replace(new RegExp('[ÉÈÊ]','gi'), 'E');
    texto = texto.replace(new RegExp('[ÍÌÎ]','gi'), 'I');
    texto = texto.replace(new RegExp('[ÓÒÔÕ]','gi'), 'O');
    texto = texto.replace(new RegExp('[ÚÙÛ]','gi'), 'U');
    texto = texto.replace(new RegExp('[Ç]','gi'), 'C');
    return texto;
}

function efeitoAjaxPadrao(query, callBack) {
    $.ajax({
        url: query,
        dataType: "html",
        success: callBack,
        beforeSend: function(){
            $('.loader').css({
                display:"block"
            });
        },
        complete: function(){
            $('.loader').css({
                display:"none"
            });
        }
    });     
}

function atualizarLatitudeELongitude(latitude, longitude) {
    var latitudeInput = $("#latitude");
    var longitudeInput = $("#longitude");   
    //console.log('Latitude | ' + e.coords.latitude);
    //console.log('Longitude | ' + e.coords.longitude);
    latitudeInput.val(latitude);            
    latitudeInput.attr("size", latitudeInput.val().length * 1.2);
    longitudeInput.val(longitude);
    longitudeInput.attr("size", longitudeInput.val().length * 1.2);
}

function atualizarDiv(cidade) {
    var divPrevisaoAtual = document.getElementById("previsao_atual");
    divPrevisaoAtual.innerHTML = "";
    var tabela = document.createElement("table");
    //var foto = document.createElement("img");
    //foto.src = deputado.foto;
    //foto.setAttribute("style", "float:left");
    $("#nome_cidade").val(cidade.name);
    adicionaLinhaTabela(tabela, ["Data: ", cidade.date]);
    adicionaLinhaTabela(tabela, ["Cidade: ", cidade.name]);
    adicionaLinhaTabela(tabela, ["Logintude: ", cidade.coord.lat]);
    adicionaLinhaTabela(tabela, ["Latitude: ", cidade.coord.lon]);
    adicionaLinhaTabela(tabela, ["Temperatura (Celsius): ", converterKelvinEmCelsius(cidade.main.temp)]);
    adicionaLinhaTabela(tabela, ["Temperatura Máxima(Celsius): ", converterKelvinEmCelsius(cidade.main.temp_max)]);
    adicionaLinhaTabela(tabela, ["Temperatura Mínima(Celsius): ", converterKelvinEmCelsius(cidade.main.temp_min)]);
    adicionaLinhaTabela(tabela, ["Previsão do Tempo: ", cidade.clouds]);
    
    divPrevisaoAtual.appendChild(tabela);
}

function adicionaLinhaTabela(tabela, informacao) {
    var tr = document.createElement("tr");
    var isLabelValue = informacao.length == 2;
    for(var i = 0; i < informacao.length; i++) {
        var td = document.createElement("td");
        td.innerHTML = (i == 0 && isLabelValue) ? "<b>" + informacao[i] + "</b>":  informacao[i];
        if(i == 0 && isLabelValue) {
            td.setAttribute("style", "text-align: right");
        }
        tr.appendChild(td);
    }
    tabela.appendChild(tr);
}

function obterPrevisaoDoTempoPorGeolocalizacao() {
    if(navigator.geolocation) {
        //console.log(navigator.geolocation);
        navigator.geolocation.getCurrentPosition(function(e) {
            var latitude = e.coords.latitude;
            var longitude = e.coords.longitude;
            atualizarLatitudeELongitude(latitude, longitude);
            obterCidadePorLatitudeELongitude(latitude, longitude);
        });
    } else {
        alert('Desculpe, mas seu navegador não suporta Geolocalização.');
    }
}

function obterPrevisaoDoTempoPorNomeDaCidade() {
    var nomeCidade = $("#nome_cidade");
    var query = "/googlemaps?address=" + removerAcentuacao(nomeCidade.val()) + "&sensor=true";
    console.log('Query | ' + query);
    
    $.ajax({
        url: query,
        dataType: "json",
        success: function (json) {
            var coordenada = json.results[0].geometry.location;
            var latitude = coordenada.lat;
            var longitude = coordenada.lng;
            console.log('Latitude | ' + latitude);
            console.log('Longitude | ' + longitude);
            atualizarLatitudeELongitude(latitude, longitude);
            obterCidadePorLatitudeELongitude(latitude, longitude);
        }
    });
}

function obterPrevisaoDoTempoPorIdDaCidade(id) {
    var query = "/openweathermap_weather/" + id + "?type=json";
    console.log('Query | ' + query);
    
    $.ajax({
        url: query,
        dataType: "json",
        success: function (json) {
            var cidade = json;
            atualizarDiv(cidade);
        }
    });
}

function obterHistoricoDaPrevisaoDoTempoPorIdDaCidade(id) {
    var query = "/openweathermap_history?" + id + "type=day";
    console.log('Query | ' + query);
    
    $.ajax({
        url: query,
        dataType: "json",
        success: function (json) {
            var cidade = json.list[0];
            atualizarDiv(cidade);
        }
    }); 
}

function obterCidadePorLatitudeELongitude(latitude, longitude) {
    var query = "/openweathermap_find?lat=" + latitude + "&lon=" + longitude + "&cnt=1";
    console.log('Query | ' + query);
    
    $.ajax({
        url: query,
        dataType: "json",
        success: function (json) {
            var cidade = json.list[0];
            obterPrevisaoDoTempoPorIdDaCidade(cidade.id);
        }
    });
}
