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
        dataType: "json",
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
        $('.loader').css({
            display:"block"
        });
        navigator.geolocation.getCurrentPosition(function(e) {
            var latitude = e.coords.latitude;
            var longitude = e.coords.longitude;
            setCoordenadasDaCidade(latitude, longitude);
            obterPrevisaoDoTempoPorGeolocalizacao();
        });
        $('.loader').css({
            display:"none"
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
    var nomeCidade = $("#nome_cidade");
    var valores = input.val().split(";");
    var latitude = valores[0];
    var longitude = valores[1];
    obterCidadePorCoordenadas(latitude, longitude);
    
}

function obterPrevisaoDoTempoPorNomeDaCidade() {
    var nomeCidade = $("#nome_cidade");
    var query = "/googlemaps?address=" + removerAcentuacao(nomeCidade.val()) + "&sensor=true";
    console.log('Query | ' + query);
    
    efeitoAjaxPadrao(query,
        function (json) {
            var coordenada = json.results[0].geometry.location;
            var latitude = coordenada.lat;
            var longitude = coordenada.lng;
            console.log('Latitude | ' + latitude);
            console.log('Longitude | ' + longitude);
            setCoordenadasDaCidade(latitude, longitude);
            obterCidadePorCoordenadas(latitude, longitude);
        }
    );
}

function obterPrevisaoDoTempoPorIdDaCidade(id) {
    var query = "/openweathermap_weather/" + id + "?type=json";
    console.log("Requisição -> " + query);
    
    efeitoAjaxPadrao(query,
        function (json) {
            var cidade = json;
            var id = $("#id_cidade").val();
            atualizarDiv(cidade);
            //obterHistoricoDaPrevisaoDoTempoPorIdDaCidade(id);
        }
    );
}

function obterHistoricoDaPrevisaoDoTempoPorIdDaCidade(id) {
    var query = "/openweathermap_history/" + id + "?type=day";
    console.log("Requisição -> " + query);
    
    efeitoAjaxPadrao(query,
        function (json) {
            var cidade = json.list[0];
            atualizarDiv(cidade);
        }
    ); 
}

function obterCidadePorCoordenadas(latitude, longitude) {
    var query = "/openweathermap_find?lat=" + latitude + "&lon=" + longitude + "&cnt=1";
    console.log("Requisição -> " + query);
    
    efeitoAjaxPadrao(query,
        function (json) {
            var cidade = json.list[0];
            setIdDaCidade(cidade.id);
            obterPrevisaoDoTempoPorIdDaCidade(cidade.id);
            obterFacebook(cidade.name);
            obterTwitter(cidade.name);
        }
    );
}


/* Facebook e Twitter*/
function obterFacebook(cidade) {
    var divFacebook = document.getElementById("facebook");
    var consulta = cidade + " clima temperatura ";
    
    consulta = replaceAll(consulta, " ", "+");
    
    divFacebook.innerHTML = "";
    var query = "../facebook/search?type=POST&q=" + consulta;
    efeitoAjaxPadrao(query,
        function (json) {
            var tabela = document.createElement("table");
            tabela.innerHTML = "";
            tabela.setAttribute("class", "news");
            for(var i = 0; i < json.data.length; i++) {
                var facePost = json.data[i];
                adicionarFacebook(tabela, facePost);
            }
            divFacebook.appendChild(tabela);
        }
    );
}
function adicionarFacebook(tabela, facePost) {
    
    if(facePost != undefined) {
        var imagem;
        if(facePost.picture != undefined) {
            imagem = facePost.picture;
        } else {
            imagem = "images/noticia.jpg"
        }
        var titulo = facePost.from.name;
        
        var conteudo;
        if(facePost.message != undefined || facePost.caption != undefined) {
            if(facePost.message != undefined && facePost.caption == undefined) {
                conteudo = facePost.message;
            } else if(facePost.message == undefined && facePost.caption != undefined) {
                conteudo = facePost.caption;
            } else {
                if(facePost.message.lenght <= facePost.caption.lenght) {
                    conteudo = facePost.message;
                } else {
                    conteudo = facePost.caption;
                }
            }
        } else {
            return;
        }
        var link = facePost.link;
        var tr = document.createElement("tr");
        var tdImg = document.createElement("td");
        tdImg.innerHTML = '<img style="align: left;" width="60" height="60" src="'+ imagem +'"/>';
        tr.appendChild(tdImg);
        var tdFace = document.createElement("td");
        var linkDecoded = decodeURIComponent(link);
        tdFace.innerHTML = '<strong><a href="' + linkDecoded + '" target="_blank">' + titulo + '</a></strong><br/><span>'+ conteudo + '</span>';
        tr.appendChild(tdFace);
        tabela.appendChild(tr);
    }
}

function obterTwitter(cidade) {
    
    var divTwitter = document.getElementById("twitter");
    var consulta = "previsao do tempo em " + cidade;
    
    consulta = replaceAll(consulta, " ", "+");
    
    divTwitter.innerHTML = "";
    var query = "../twitter/search.json?&q=" + consulta;
    efeitoAjaxPadrao(query,
        function (json) {
            var tabela = document.createElement("table");
            tabela.innerHTML = "";
            tabela.setAttribute("class", "news");
            for(var i = 0; i < json.results.length; i++) {
                var twitte = json.results[i];
                adicionarTwitte(tabela, twitte);
            }
            divTwitter.appendChild(tabela);
        }
    );
}

function adicionarTwitte(tabela, twitte) {
    if(twitte != undefined) {
        var imagem;
        if(twitte.profile_image_url != undefined) {
            imagem = twitte.profile_image_url;
        } else {
            imagem = "images/noticia.jpg"
        }
        var titulo = "@" + twitte.from_user;
        var conteudo = twitte.text;
        var tr = document.createElement("tr");
        var tdImg = document.createElement("td");
        tdImg.innerHTML = '<img style="align: left;" width="60" height="60" src="'+ imagem +'"/>';
        tr.appendChild(tdImg);
        var tdTwitte = document.createElement("td");
        tdTwitte.innerHTML = '<strong>' + titulo + '</strong><br/><span>'+ textoToLink(conteudo) + '</span>';
        tr.appendChild(tdTwitte);
        tabela.appendChild(tr);
    }
}

function textoToLink(conteudo) {
    var texto = "" + conteudo;
    var indice = texto.indexOf("http://t.co/");
    if(indice != undefined && indice >= 0) {
        var subStr = texto.substring(indice+12, texto.length);
        var indiceFimLink = subStr.indexOf(" ", indice+12);
        if(indiceFimLink <= 0) indiceFimLink = texto.length;
        var link = texto.substring(indice, indiceFimLink);
        var a = '<a href="' + link + '" target="_blank">' + link + '</a>';
        if(link.length > 10)
            texto = texto.replace(link, a);
    }
    return texto;
}

function replaceAll(string, token, newtoken) {
    while (string.indexOf(token) != -1) {
        string = string.replace(token, newtoken);
    }
    return string;
}
