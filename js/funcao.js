$(document).ready(function() {
    obterGeolocalizacao();
});

function converterKelvinEmCelsius(valor) {
    var TEMP_KELVIN = 273.15;
    return valor - TEMP_KELVIN;
}

function removerAcentuacao(texto) {
    texto = texto.replace(new RegExp(' ','gi'), '+');
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

function atualizarDiv(cidade) {
    var divPrevisaoAtual = document.getElementById("previsao_atual");
    divPrevisaoAtual.innerHTML = "";
    var tabela = document.createElement("table");
    var fotoCondicao = document.createElement("img");
    $("#nome_cidade").val(cidade.name);
    adicionaLinhaTabela(tabela, ["Data: ", cidade.date]);
    adicionaLinhaTabela(tabela, ["Cidade: ", cidade.name]);
    adicionaLinhaTabela(tabela, ["Logintude: ", cidade.coord.lat]);
    adicionaLinhaTabela(tabela, ["Latitude: ", cidade.coord.lon]);
    adicionaLinhaTabela(tabela, ["Temperatura (Celsius): ", converterKelvinEmCelsius(cidade.main.temp)]);
    adicionaLinhaTabela(tabela, ["Temperatura Máxima (Celsius): ", converterKelvinEmCelsius(cidade.main.temp_max)]);
    adicionaLinhaTabela(tabela, ["Temperatura Mínima (Celsius): ", converterKelvinEmCelsius(cidade.main.temp_min)]);
    adicionarImagemNaTabela(tabela, "Condição do Tempo: ", cidade.img);
    
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

function adicionarImagemNaTabela(tabela, titulo, imagem) {
        var tr = document.createElement("tr");
        var tdTitulo = document.createElement("td");
        var tdImg = document.createElement("td");
        tdTitulo.innerHTML = "<b>" + titulo + "</b>";
        tdTitulo.setAttribute("style", "text-align: right");
        tdImg.innerHTML = '<img src="'+ imagem +'"/>';
        tr.appendChild(tdTitulo);
        tr.appendChild(tdImg);
        tabela.appendChild(tr);
}

function obterGeolocalizacao() {
    console.log(navigator.geolocation);
    if(navigator.geolocation) {    
        navigator.geolocation.getCurrentPosition(function(e) {
            var latitude = e.coords.latitude;
            var longitude = e.coords.longitude;
            setCoordenadasDaCidade(latitude, longitude);
            obterPrevisaoDoTempoPorGeolocalizacao();
        });
    } else {
        alert('Desculpe, mas seu navegador não suporta Geolocalização.');
    }
}

function setCoordenadasDaCidade(latitude, longitude) {
    var input = $("#latitude_longitude_cidade");
    var valor = latitude + ";" + longitude
    console.log("Atualizando campo -> latitude_longitude_cidade = " + valor);
    input.val(valor);
}

function setIdDaCidade(id) {
    var input = $("#id_cidade");
    console.log("Atualizando campo -> id = " + id);
    input.val(id);
}

function obterPrevisaoDoTempoPorGeolocalizacao() {
    var input = $("#latitude_longitude_cidade");
    var valores = input.val().split(";");
    var latitude = valores[0];
    var longitude = valores[1];
    obterCidadePorCoordenadas(latitude, longitude);
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
            setCoordenadasDaCidade(latitude, longitude);
            obterCidadePorCoordenadas(latitude, longitude);
        }
    });
}

function obterPrevisaoDoTempoPorIdDaCidade(id) {
    var query = "/openweathermap_weather/" + id + "?type=json";
    console.log("Requisição -> " + query);
    
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
    console.log("Requisição -> " + query);
    
    $.ajax({
        url: query,
        dataType: "json",
        success: function (json) {
            var cidade = json.list[0];
            atualizarDiv(cidade);
        }
    }); 
}

function obterCidadePorCoordenadas(latitude, longitude) {
    var query = "/openweathermap_find?lat=" + latitude + "&lon=" + longitude + "&cnt=1";
    console.log("Requisição -> " + query);
    
    $.ajax({
        url: query,
        dataType: "json",
        success: function (json) {
            var cidade = json.list[0];
            setIdDaCidade(cidade.id);
            obterPrevisaoDoTempoPorIdDaCidade(cidade.id);
        }
    });
}
