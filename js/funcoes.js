/*carrega o select com a lista de deputados do estado em forma de select-html*/
function carregarComboDeputadosPorEstado(estado, select) {
    select.options.length = 0;
    criarOptionHtml("Selecione...", 0, select);
     var query = '../deputado/deputado/Dep_Lista.asp?Legislatura=54&Partido=QQ&SX=QQ&Todos=None&condic=QQ&forma=lista&UF=' + estado;
    chamadaAjaxPadrao(query, function(data) {
        var deputados = $(data).find("#content");
        var lista = deputados.find("ul li a");
        lista.each(function (i) {
            var nome = $(lista[i]).find("b");
            if(nome[0] != undefined ) {
                criarOptionHtml(nome[0].textContent, extrairIdDeputadoDaURL(lista[i].getAttribute("href")), select);
            }
        });
    });
}

/*Obtem as informacoes do deputado e adiciona na div de destino*/
function obtemInformacoesDeputado(idDeputado) {
    var divDetalhes = document.getElementById("detalhe");
    var divPresenca = document.getElementById("presenca");
    var divNoticias = document.getElementById("noticias");
    var divTwitter = document.getElementById("twitter");
    var divFacebook = document.getElementById("facebook");
    criarObjetoDeputado(idDeputado, divDetalhes, divPresenca, divNoticias, divTwitter, divFacebook);
}

function criaDetalhesDeputado(deputado, divDestino) {
    divDestino.innerHTML = "";
    var tabela = document.createElement("table");
    var foto = document.createElement("img");
    foto.src = deputado.foto;
    foto.setAttribute("style", "float:left");
    adicionaLinhaTabela(tabela, ["Nome:", deputado.nome]);
    adicionaLinhaTabela(tabela, ["Aniversário:", deputado.aniversario]);
    adicionaLinhaTabela(tabela, ["Profissao:", deputado.profissao]);
    adicionaLinhaTabela(tabela, ["Partido:", deputado.partido]);
    adicionaLinhaTabela(tabela, ["Telefone:", deputado.telefone]);
    adicionaLinhaTabela(tabela, ["Fax:", deputado.fax]);
    divDestino.appendChild(foto);
    divDestino.appendChild(tabela);
}

function criarObjetoDeputado(idDeputado, divDestino, divPresenca, divNoticias, divTwitter, divFacebook) {
    var queryConsulta = "dep_Detalhe.asp?id=" + idDeputado;
    var query = '../deputado/deputado/' + queryConsulta;
    chamadaAjaxPadrao(query, function(data) {
        var deputado = {};
        deputado.id = idDeputado;
        deputado.foto = $(data).find("img.image-left")[0].src;
        var indiceMatricula = data.indexOf("nuMatricula=") + 12;
        deputado.matricula = data.substring(indiceMatricula, data.indexOf("&", indiceMatricula));
        obterPercentalPresentaDeputado(deputado.matricula, divPresenca);
        var detalhe = $(data).find("ul.visualNoMarker");
        var chegouFim = false;
        detalhe.each(function(i) {
            if (chegouFim == true) return false;
            var linha = $(detalhe[i]).find("li");
            for(var j = 0; j < linha.length; j++) {
                var conteudo = linha[j].textContent;
                if (conteudo == "Biografia ") {chegouFim = true;break;}
                switch(j) {
                    case 0: {deputado.nome = conteudo.substring(conteudo.indexOf("Nome civil:")+11, conteudo.length);break;}
                    case 1: {deputado.aniversario = conteudo.substring(conteudo.indexOf(":")+1, conteudo.indexOf("-"));
                             deputado.profissao = conteudo.substring(conteudo.indexOf("-")+12, conteudo.length);break;}
                    case 2: {deputado.partido = conteudo.substring(conteudo.indexOf("Partido/UF:")+11, conteudo.length);break;}
                    case 3: {deputado.telefone = conteudo.substring(conteudo.indexOf("Telefone:")+9, conteudo.indexOf("- "));
                             deputado.fax = conteudo.substring(conteudo.indexOf(" F")+5, conteudo.length);break;}
                    case 4: {deputado.legislaturas = conteudo.substring(conteudo.indexOf("Legislaturas:")+13, conteudo.length);break;}
                }
            }
            return true;
        });
        criaDetalhesDeputado(deputado, divDestino);
        var nomeDeputado = $("#deputado").find(":selected").text();
        nomeDeputado = removerAcento(nomeDeputado.trim());
        nomeDeputado = replaceAll(nomeDeputado, " ", "+");
        deputado.nomeComum = "Deputado+" + nomeDeputado;
        obterNoticias(deputado.nomeComum, divNoticias);
        obterTwitter(deputado.nomeComum, divTwitter);
        obterFacebook(deputado.nomeComum, divFacebook);
        carregarProjetos(deputado.id);
    });
}

function obterPercentalPresentaDeputado(matriculaDeputado, divPresenca) {
    //TODO    
    var queryConsulta = "RelPresencaPlenario.asp?nuLegislatura=54&dtInicio=01/01/2012&dtFim=28/09/2012&nuMatricula="+ matriculaDeputado;
    //var queryConsulta = "presenca.html?nuLegislatura=54&dtInicio=01/01/2012&dtFim=28/09/2012&nuMatricula="+ matriculaDeputado;
    var query = '../deputado/deputado/' + queryConsulta;
    divPresenca.innerHTML = "";
    chamadaAjaxPadrao(query, function(data) {
        var informacoesTabela = $(data).find("table.tabela-2");
        var lista = informacoesTabela.find("tbody tr td");
        var presenca = lista[5].textContent;
        divPresenca.innerHTML = presenca;
    });
}

function carregarProjetos(idDeputado) {
    var query = '../deputado/sileg/Prop_lista.asp?Limite=N&Autor=' + idDeputado;
    //var query = '../deputado/sileg/projetos.html?Limite=N&Autor=' + idDeputado;
    var ajax = new XMLHttpRequest();
    ajax.open('GET', query, true);
    ajax.onreadystatechange = function() {
        if(ajax.readyState == 4) {
            var divProjetos = document.getElementById("projetos");
            divProjetos.innerHTML = "";
            var tabela = document.createElement("table");
            var projetos = $(ajax.responseText).find("tbody.coresAlternadas");
            var linha = "";
            projetos.each(function(i) {
                linha += $(projetos[i]).html();
            });
            tabela.innerHTML = linha;
            divProjetos.appendChild(tabela);
        }
    };
    ajax.send(null);
}

function obterNoticias(nomeDeputado, divNoticias) {
    divNoticias.innerHTML = "";
    
    var query = "../news/news?v=1.0&q=" + nomeDeputado;
//    var query = "../news/news.txt";
    $.ajax({
        url: query,
        dataType: "json",
        success: function (json) {
            var tabela = document.createElement("table");
                tabela.innerHTML = "";
                tabela.setAttribute("class", "news");
            for(var i = 0; i < json.responseData.results.length; i++) {
                var noticia = json.responseData.results[i];
                adicionarNoticia(tabela, noticia);
            }
            divNoticias.appendChild(tabela);
        }
    }); 
}


function obterFacebook(nomeDeputado, divFacebook) {
    divFacebook.innerHTML = "";
    var query = "../face/search?type=POST&q=" + nomeDeputado;
    $.ajax({
        url: query,
        dataType: "json",
        success: function (json) {
            var tabela = document.createElement("table");
            tabela.innerHTML = "";
            tabela.setAttribute("class", "news");
            for(var i = 0; i < json.data.length; i++) {
                var facePost = json.data[i];
                adicionarFacebook(tabela, facePost);
            }
            divFacebook.appendChild(tabela);
        }
    }); 
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
        var conteudo = facePost.caption;
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

function obterTwitter(nomeDeputado, divNoticias) {
    divNoticias.innerHTML = "";
    var query = "../twitter/search.json?&q=" + nomeDeputado;
    //var query = "../twitter/twitter.txt";
    $.ajax({
        url: query,
        dataType: "json",
        success: function (json) {
            var tabela = document.createElement("table");
            tabela.innerHTML = "";
            tabela.setAttribute("class", "news");
            for(var i = 0; i < json.results.length; i++) {
                var twitte = json.results[i];
                adicionarTwitte(tabela, twitte);
            }
            divNoticias.appendChild(tabela);
        }
    }); 
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

function adicionarNoticia(tabela, noticia) {
    if(noticia != undefined) {
        var imagem;
        if(noticia.image != undefined) {
            imagem = noticia.image.url;
        } else {
            imagem = "images/noticia.jpg"
        }
        var titulo = noticia.title;
        var conteudo = noticia.content;
        var link = noticia.url;
        var tr = document.createElement("tr");
        var tdImg = document.createElement("td");
        tdImg.innerHTML = '<img style="align: left;" width="60" height="60" src="'+ imagem +'"/>';
        tr.appendChild(tdImg);
        var tdNoticia = document.createElement("td");
        var linkDecoded = decodeURIComponent(link);
        tdNoticia.innerHTML = '<strong><a href="' + linkDecoded + '" target="_blank">' + titulo + '</a></strong><br/><span>'+ conteudo + '</span>';
        tr.appendChild(tdNoticia);
        tabela.appendChild(tr);
    }
}

function adicionaLinhaTabela(tabela, conteudoColunas) {
    var tr = document.createElement("tr");
    var isLabelValue = conteudoColunas.length == 2;
    for(var i = 0; i < conteudoColunas.length; i++) {
        var td = document.createElement("td");
        td.innerHTML = i==0&&isLabelValue ? "<b>" + conteudoColunas[i] + "</b>":  conteudoColunas[i];
        if(i==0&&isLabelValue) td.setAttribute("style", "text-align: right");
        tr.appendChild(td);
    }
    tabela.appendChild(tr);
}

function criarOptionHtml(text, id, select) {
    var option = document.createElement("option");
    option.value = id != null ? id : text;
    option.text = text;
    if(select != null) {
        select.appendChild(option);
        return null;
    } else {
        return option;
    }
}

function extrairIdDeputadoDaURL(url) {
    return url.substring(url.indexOf("=")+1, url.length);
}

function chamadaAjaxPadrao(query, callBack) {
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

function replaceAll(string, token, newtoken) {
    while (string.indexOf(token) != -1) {
        string = string.replace(token, newtoken);
    }
    return string;
}

function removerAcento(text) {
    text = text.replace(new RegExp('[ÁÀÂÃ]','gi'), 'A');
    text = text.replace(new RegExp('[ÉÈÊ]','gi'), 'E');
    text = text.replace(new RegExp('[ÍÌÎ]','gi'), 'I');
    text = text.replace(new RegExp('[ÓÒÔÕ]','gi'), 'O');
    text = text.replace(new RegExp('[ÚÙÛ]','gi'), 'U');
    text = text.replace(new RegExp('[Ç]','gi'), 'C');
    return text;
}