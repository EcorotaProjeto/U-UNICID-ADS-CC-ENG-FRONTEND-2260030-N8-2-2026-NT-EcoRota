/* =========================================================
   EcoRota - Script principal (usado por todas as páginas)
   O site funciona sem JavaScript; este arquivo só acrescenta
   recursos extras (tamanho do texto, contraste, voz, CEP, busca).
   ========================================================= */
(function () {
    const raiz = document.documentElement;

    /* ---------- Preferências salvas no navegador ---------- */
    function salvar(chave, valor) {
        try { localStorage.setItem('ecorota-' + chave, JSON.stringify(valor)); } catch (e) {}
    }

    function carregar(chave, padrao) {
        try {
            const v = localStorage.getItem('ecorota-' + chave);
            return v === null ? padrao : JSON.parse(v);
        } catch (e) {
            return padrao;
        }
    }

    /* ---------- Avisos para leitores de tela ---------- */
    const avisos = document.getElementById('avisos');
    function anunciar(texto) {
        if (!avisos) return;
        avisos.textContent = '';
        setTimeout(function () { avisos.textContent = texto; }, 60);
    }

    /* ---------- Tamanho do texto ---------- */
    const ESCALA_MIN = 1.0;
    const ESCALA_MAX = 1.8;
    let escala = carregar('escala', 1.0);
    if (typeof escala !== 'number' || escala < ESCALA_MIN || escala > ESCALA_MAX) escala = 1.0;

    const indicadorFonte = document.getElementById('indicadorFonte');
    function aplicarFonte() {
        const porcentagem = Math.round(escala * 100);
        raiz.style.fontSize = porcentagem + '%';
        if (indicadorFonte) indicadorFonte.textContent = porcentagem + '%';
    }

    function mudarFonte(direcao) {
        const nova = Math.round((escala + direcao * 0.1) * 10) / 10;
        if (nova < ESCALA_MIN || nova > ESCALA_MAX) {
            anunciar(direcao > 0 ? 'O texto já está no tamanho máximo' : 'O texto já está no tamanho mínimo');
            return;
        }
        escala = nova;
        aplicarFonte();
        salvar('escala', escala);
        anunciar('Tamanho do texto: ' + Math.round(escala * 100) + ' por cento');
    }

    const btnMais = document.getElementById('btnFonteMais');
    const btnMenos = document.getElementById('btnFonteMenos');
    if (btnMais) btnMais.addEventListener('click', function () { mudarFonte(1); });
    if (btnMenos) btnMenos.addEventListener('click', function () { mudarFonte(-1); });

    /* ---------- Alto contraste ---------- */
    const btnContraste = document.getElementById('btnContraste');
    function aplicarContraste(ativo) {
        raiz.classList.toggle('alto-contraste', ativo);
        if (btnContraste) btnContraste.setAttribute('aria-pressed', String(ativo));
    }

    if (btnContraste) {
        btnContraste.addEventListener('click', function () {
            const ativo = !raiz.classList.contains('alto-contraste');
            aplicarContraste(ativo);
            salvar('contraste', ativo);
            anunciar(ativo ? 'Alto contraste ativado' : 'Alto contraste desativado');
        });
    }

    /* ---------- Leitura em voz (sempre iniciada pela pessoa) ---------- */
    const vozSuportada = 'speechSynthesis' in window;
    const sintese = vozSuportada ? window.speechSynthesis : null;

    function falar(texto) {
        if (!vozSuportada) return;
        sintese.cancel();
        const msg = new SpeechSynthesisUtterance(texto);
        msg.lang = 'pt-BR';
        sintese.speak(msg);
    }

    function textoDaPagina() {
        const principal = document.querySelector('main');
        if (!principal) return '';
        return Array.from(principal.querySelectorAll('h1, h2, h3, p, li, caption, figcaption'))
            .filter(function (el) { return !el.closest('form, .nao-ler, [hidden]'); })
            .map(function (el) { return el.innerText.trim(); })
            .filter(Boolean)
            .join('. ');
    }

    if (!vozSuportada) {
        document.querySelectorAll('.controle-voz').forEach(function (el) { el.hidden = true; });
    } else {
        document.querySelectorAll('[data-ouvir]').forEach(function (b) {
            b.addEventListener('click', function () { falar(textoDaPagina()); });
        });
        const ligar = function (id, acao) {
            const b = document.getElementById(id);
            if (b) b.addEventListener('click', acao);
        };
        ligar('btnPausar', function () { sintese.pause(); });
        ligar('btnContinuar', function () { sintese.resume(); });
        ligar('btnParar', function () { sintese.cancel(); });
    }

    /* ---------- Formulários ----------
       A validação é a do próprio HTML5 (required, type, pattern, min, max).
       O evento "submit" só acontece quando tudo está válido; aqui só
       mostramos a mensagem de sucesso, porque o site ainda não tem servidor. */
    document.querySelectorAll('form[data-formulario]').forEach(function (form) {
        const status = form.querySelector('.status-form');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            // TODO: enviar os dados para um servidor, por exemplo:
            // fetch('https://seu-servidor/api', { method: 'POST', body: new FormData(form) })
            if (status) status.textContent = form.dataset.sucesso || 'Enviado com sucesso.';
            form.reset();
        });
    });

    // Data mínima = hoje, nos campos de data marcados com data-a-partir-de-hoje
    const hoje = new Date();
    const hojeISO = new Date(hoje.getTime() - hoje.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    document.querySelectorAll('input[type="date"][data-a-partir-de-hoje]').forEach(function (campo) {
        campo.min = hojeISO;
    });

    /* ---------- CEP: preenche o endereço pelo ViaCEP ----------
       Uso: <input data-cep data-rua="idCampoRua" data-bairro="..." data-cidade="..." data-uf="..."> */
    function soDigitos(texto) {
        return (texto || '').replace(/\D/g, '');
    }

    document.querySelectorAll('input[data-cep]').forEach(function (campoCep) {
        const statusCep = document.getElementById(campoCep.id + '-status');
        let ultimo = '';

        campoCep.addEventListener('input', async function () {
            const cep = soDigitos(campoCep.value);
            if (cep.length !== 8 || cep === ultimo) return;
            ultimo = cep;
            campoCep.value = cep.slice(0, 5) + '-' + cep.slice(5);
            if (statusCep) statusCep.textContent = 'Buscando CEP...';
            try {
                const resposta = await fetch('https://viacep.com.br/ws/' + cep + '/json/');
                const dados = await resposta.json();
                if (dados.erro) {
                    if (statusCep) statusCep.textContent = 'CEP não encontrado. Confira os números.';
                    return;
                }
                const preencher = function (atributo, valor) {
                    const alvo = document.getElementById(campoCep.dataset[atributo] || '');
                    if (alvo && valor) alvo.value = valor;
                };
                preencher('rua', dados.logradouro);
                preencher('bairro', dados.bairro);
                preencher('cidade', dados.localidade);
                preencher('uf', dados.uf);
                if (statusCep) {
                    statusCep.textContent = 'Endereço encontrado: ' +
                        [dados.logradouro, dados.bairro, dados.localidade + ' - ' + dados.uf].filter(Boolean).join(', ') + '.';
                }
            } catch (erro) {
                if (statusCep) statusCep.textContent = 'Não foi possível buscar o CEP agora. Preencha o endereço manualmente.';
            }
        });
    });

    /* ---------- Pontos de descarte (projetos.html) ---------- */
    const listaPontos = document.getElementById('listaPontos');
    if (listaPontos) iniciarPontos();

    function iniciarPontos() {
        const pontos = [
            { nome: 'Coopere Centro', endereco: 'Av. do Estado, 300 - Bom Retiro', regiao: 'Centro', horario: 'Segunda a sábado, 7h30 às 19h' },
            { nome: 'Ponto Cambuci', endereco: 'Av. do Estado, 5460 - Cambuci', regiao: 'Centro', horario: 'Segunda a sexta, 7h às 19h', telefone: '(11) 3340-4663' },
            { nome: 'Ponto Aclimação', endereco: 'R. José Getúlio, 78 - Aclimação', regiao: 'Centro', horario: 'Segunda a sexta, 9h às 17h', telefone: '(11) 2146-2603' },
            { nome: 'Ponto Mooca', endereco: 'R. Tabajaras, 439 - Mooca', regiao: 'Zona Leste', horario: 'Segunda a sexta, 8h às 18h', telefone: '(11) 4200-0880', cep: '03121-010' },
            { nome: 'Ponto Tatuapé', endereco: 'Av. Celso Garcia, 4638 - Tatuapé', regiao: 'Zona Leste', horario: 'Segunda a sexta, 7h às 19h', telefone: '(11) 4095-6557' },
            { nome: 'Ponto Vila Formosa (Acuruí)', endereco: 'Rua Acuruí, 700 - Vila Formosa', regiao: 'Zona Leste', horario: 'Segunda a sexta, 9h às 17h', telefone: '(11) 2673-3014' },
            { nome: 'Ponto Vila Formosa (Templários)', endereco: 'Rua Templários, 192 - Vila Formosa', regiao: 'Zona Leste', horario: 'Segunda a quinta, 8h às 18h; sexta, 8h às 17h', telefone: '(11) 2604-2273' },
            { nome: 'Ponto Jardim Avelino', endereco: 'Rua Lydia Ferrari Magnoli, 108 - Jardim Avelino', regiao: 'Zona Leste', horario: 'Segunda a sexta, 9h às 17h', telefone: '(11) 2345-7860' },
            { nome: 'Ponto Cidade Líder', endereco: 'Avenida Líder, 2810 - Cidade Líder', regiao: 'Zona Leste', horario: 'Segunda a sexta, 9h às 17h', telefone: '(11) 97389-5065' },
            { nome: 'Ponto Lapa', endereco: 'Av. Embaixador Macedo Soares, 977 - Lapa', regiao: 'Zona Oeste', horario: 'Segunda a sexta, 7h às 19h', telefone: '(11) 2348-4663' },
            { nome: 'Ponto Vila Hamburguesa', endereco: 'Av. Queiroz Filho, 1700 - Vila Hamburguesa', regiao: 'Zona Oeste', horario: 'Aberto 24 horas', telefone: '(11) 4302-5842' },
            { nome: 'CEDIR-USP (equipamentos de informática)', endereco: 'Av. Professor Luciano Gualberto, 71 - Cidade Universitária', regiao: 'Zona Oeste', horario: 'Segunda a sexta, 8h às 18h, com agendamento', telefone: '(11) 3091-6454' },
            { nome: 'Ponto Vila Fanton', endereco: 'R. Bernardo José de Lorena, s/n - Vila Fanton', regiao: 'Zona Norte', horario: 'Todos os dias, 7h às 22h', telefone: '(11) 3915-8751', cep: '05203-200' },
            { nome: 'Ponto Vila Andrade', endereco: 'Av. Giovanni Gronchi, 5930 - Vila Andrade', regiao: 'Zona Sul', horario: 'Ligue para confirmar o horário' }
        ];

        pontos.forEach(function (p) {
            p.uf = 'SP';
            p.cidade = 'São Paulo';
            p.bairro = p.endereco.split(' - ')[1] || '';
            p.cep = p.cep || '';
        });

        const formBusca = document.getElementById('formBusca');
        const filtroRegiao = document.getElementById('filtroRegiao');
        const contagemPontos = document.getElementById('contagemPontos');
        const mapaPontos = document.getElementById('mapaPontos');
        const mapaLegenda = document.getElementById('mapaLegenda');
        const linkBuscaMapa = document.getElementById('linkBuscaMapa');
        const campo = function (id) { return document.getElementById(id); };
        const MAPA_PADRAO = mapaPontos ? mapaPontos.src : '';
        let busca = {};

        function normalizar(texto) {
            return (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .toLowerCase().replace(/[.,\-\/]/g, ' ').replace(/\s+/g, ' ').trim();
        }

        function normalizarRua(texto) {
            return normalizar(texto)
                .replace(/\b(rua|r|avenida|av|travessa|tv|alameda|al|praca|pca|estrada|estr|rodovia|rod)\b/g, '')
                .replace(/\s+/g, ' ').trim();
        }

        function criar(tag, classe, texto) {
            const el = document.createElement(tag);
            if (classe) el.className = classe;
            if (texto) el.textContent = texto;
            return el;
        }

        function enderecoCompleto(p) {
            return p.endereco + ', São Paulo - SP';
        }

        function passa(p, c, regiao, completo) {
            if (regiao !== 'todas' && p.regiao !== regiao) return false;
            if (c.uf && p.uf !== c.uf) return false;
            if (c.cidade && !normalizar(p.cidade).includes(normalizar(c.cidade))) return false;
            if (!completo) return true;
            if (c.bairro && !normalizar(p.bairro).includes(normalizar(c.bairro))) return false;
            if (c.endereco && !normalizarRua(p.endereco).includes(normalizarRua(c.endereco))) return false;
            if (c.cep && !c.bairro && !c.cidade && !c.endereco) {
                if (soDigitos(p.cep).slice(0, 5) !== c.cep.slice(0, 5)) return false;
            }
            return true;
        }

        function descrever(c) {
            return [c.endereco, c.bairro, c.cidade, c.uf, c.cep].filter(Boolean).join(', ');
        }

        function mostrarNoMapa(p) {
            if (!mapaPontos) return;
            mapaPontos.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(enderecoCompleto(p)) + '&output=embed';
            mapaPontos.title = 'Mapa: ' + p.nome;
            mapaLegenda.textContent = 'O mapa mostra: ' + p.nome + ', ' + p.endereco + '.';
            anunciar('Mapa atualizado para ' + p.nome);
            mapaPontos.scrollIntoView({ block: 'center' });
        }

        function renderizar() {
            const regiao = filtroRegiao.value;
            const temBusca = Boolean(descrever(busca));
            let filtrados = pontos.filter(function (p) { return passa(p, busca, regiao, true); });
            let mensagem = '';

            if (!filtrados.length && temBusca) {
                filtrados = pontos.filter(function (p) { return passa(p, busca, regiao, false); });
                mensagem = filtrados.length
                    ? 'Nenhum ponto da lista fica exatamente nesse bairro ou endereço. Veja no mapa os mais próximos ou outros pontos da cidade abaixo. '
                    : 'Ainda não temos pontos cadastrados nesse local. O mapa mostra pontos de descarte perto do endereço pesquisado. ';
            }

            listaPontos.innerHTML = '';
            filtrados.forEach(function (p) {
                const li = criar('li', 'ponto');
                li.appendChild(criar('h3', '', p.nome));
                li.appendChild(criar('p', 'regiao', p.regiao + ' - ' + p.cidade + '/' + p.uf));
                li.appendChild(criar('p', '', 'Endereço: ' + p.endereco + (p.cep ? ' - CEP ' + p.cep : '')));
                li.appendChild(criar('p', '', 'Horário: ' + p.horario));
                if (p.telefone) {
                    const tel = criar('p', '');
                    const link = criar('a', '', p.telefone);
                    link.href = 'tel:+55' + soDigitos(p.telefone);
                    tel.append('Telefone: ', link);
                    li.appendChild(tel);
                }
                const acoes = criar('div', 'acoes-ponto');
                const btnMapa = criar('button', 'botao-secundario', 'Mostrar no mapa');
                btnMapa.type = 'button';
                btnMapa.setAttribute('aria-label', 'Mostrar ' + p.nome + ' no mapa');
                btnMapa.addEventListener('click', function () { mostrarNoMapa(p); });
                acoes.appendChild(btnMapa);
                const rota = criar('a', 'botao-secundario', 'Como chegar');
                rota.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(enderecoCompleto(p));
                rota.target = '_blank';
                rota.rel = 'noopener';
                rota.appendChild(criar('span', 'sr-only', ' até ' + p.nome + ' (abre em nova aba)'));
                const icone = criar('span', 'icone-externo', '↗');
                icone.setAttribute('aria-hidden', 'true');
                rota.appendChild(icone);
                acoes.appendChild(rota);
                li.appendChild(acoes);
                listaPontos.appendChild(li);
            });

            const n = filtrados.length;
            const contagem = n === 0 ? '' : (n === 1 ? 'Mostrando 1 ponto.' : 'Mostrando ' + n + ' pontos.');
            contagemPontos.textContent = mensagem + contagem;
        }

        function atualizarMapa() {
            if (!mapaPontos) return;
            const local = descrever(busca);
            if (!local) {
                mapaPontos.src = MAPA_PADRAO;
                mapaLegenda.textContent = 'O mapa mostra pontos de descarte em São Paulo.';
                linkBuscaMapa.hidden = true;
                return;
            }
            const consulta = 'descarte de lixo eletrônico perto de ' + local;
            mapaPontos.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(consulta) + '&output=embed';
            mapaPontos.title = 'Mapa: pontos de descarte perto de ' + local;
            mapaLegenda.textContent = 'O mapa mostra pontos de descarte perto de: ' + local + '.';
            linkBuscaMapa.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(consulta);
            linkBuscaMapa.hidden = false;
        }

        formBusca.addEventListener('submit', function (e) {
            e.preventDefault();
            busca = {
                cep: soDigitos(campo('busca-cep').value),
                uf: campo('busca-estado').value,
                cidade: campo('busca-cidade').value.trim(),
                bairro: campo('busca-bairro').value.trim(),
                endereco: campo('busca-endereco').value.trim()
            };
            if (busca.cep.length !== 8) busca.cep = '';
            renderizar();
            atualizarMapa();
            salvar('regiao', filtroRegiao.value);
        });

        formBusca.addEventListener('reset', function () {
            setTimeout(function () {
                busca = {};
                const status = document.getElementById('busca-cep-status');
                if (status) status.textContent = 'Exemplo: 03121-010';
                renderizar();
                atualizarMapa();
                salvar('regiao', 'todas');
                anunciar('Pesquisa limpa. Mostrando todos os pontos.');
            }, 0);
        });

        filtroRegiao.addEventListener('change', function () {
            renderizar();
            salvar('regiao', filtroRegiao.value);
        });

        const regiaoSalva = carregar('regiao', 'todas');
        if (filtroRegiao.querySelector('option[value="' + regiaoSalva + '"]')) filtroRegiao.value = regiaoSalva;
        renderizar();
    }

    /* ---------- Datas relativas nas notícias ("há 3 dias") ---------- */
    document.querySelectorAll('time[data-relativo]').forEach(function (t) {
        const partes = t.getAttribute('datetime').split('-').map(Number);
        const data = new Date(partes[0], partes[1] - 1, partes[2]);
        const hojeZero = new Date();
        hojeZero.setHours(0, 0, 0, 0);
        const dias = Math.round((hojeZero - data) / 86400000);
        let texto;
        if (dias <= 0) texto = 'hoje';
        else if (dias === 1) texto = 'ontem';
        else if (dias < 7) texto = 'há ' + dias + ' dias';
        else if (dias < 30) { const s = Math.floor(dias / 7); texto = 'há ' + s + (s === 1 ? ' semana' : ' semanas'); }
        else if (dias < 365) { const m = Math.floor(dias / 30); texto = 'há ' + m + (m === 1 ? ' mês' : ' meses'); }
        else { const a = Math.floor(dias / 365); texto = 'há ' + a + (a === 1 ? ' ano' : ' anos'); }
        t.title = t.textContent;
        t.textContent = texto;
    });

    /* ---------- Inicialização ---------- */
    aplicarFonte();
    aplicarContraste(carregar('contraste', false));
})();
