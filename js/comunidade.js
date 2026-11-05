/* =========================================================
   EcoRota - Comunidade EcoRecicla (usado só em comunidade.html)

   Com o Firebase configurado (js/firebase-config.js):
     - contas reais com e-mail e senha (Firebase Authentication)
     - postagens e votos salvos na nuvem (Cloud Firestore), em tempo real
   Sem o Firebase (ou sem internet): modo demonstração, com tudo
   salvo só no navegador.
   ========================================================= */
(function () {
    const modulos = [
        { id: 'Geral', icon: 'ph-house', label: 'Início / Geral' },
        { id: 'Venda', icon: 'ph-tag', label: 'Vendas & Peças' },
        { id: 'Doacao', icon: 'ph-gift', label: 'Doações Solidárias' },
        { id: 'Busca', icon: 'ph-magnifying-glass-plus', label: 'Procurando Peças' },
        { id: 'Agendamento', icon: 'ph-calendar-plus', label: 'Agendar Coleta' },
        { id: 'Cooperativas', icon: 'ph-handshake', label: 'Cooperativas' },
        { id: 'Impacto', icon: 'ph-users', label: 'Impacto Social' },
        { id: 'Acessibilidade', icon: 'ph-wheelchair', label: 'Acessibilidade' },
        { id: 'Legislacao', icon: 'ph-scales', label: 'Legislação e Leis' },
        { id: 'Duvidas', icon: 'ph-question', label: 'Dúvidas Frequentes' }
    ];

    const HORA = 3600000, DIA = 24 * HORA;

    function postsIniciais() {
        const agora = Date.now();
        return [
            { id: 1, author: 'Carlos_Hardware', criadoEm: agora - 2 * HORA, type: 'VENDA', categoria: 'Venda', votes: 14,
              title: 'Placa Mãe LGA 1155 com defeito no soquete',
              description: 'Estou vendendo para quem retira peças ou sabe consertar. Capacitor estufado. Acompanha espelho. R$ 30,00.',
              tags: ['Placa Mãe', 'Defeito', 'Sucata'] },
            { id: 5, author: 'MariaSilva', criadoEm: agora - 3 * HORA, type: 'DOAÇÃO', categoria: 'Doacao', votes: 23,
              title: 'Pentes de memória DDR3 de 4 GB funcionando',
              description: 'Tenho dois pentes de memória DDR3 de 4 GB que tirei de um computador antigo. Funcionam normalmente. Doação para quem precisar, retirada no Tatuapé.',
              tags: ['Memória', 'DDR3', 'Funcionando'] },
            { id: 2, author: 'CoopRecicla_SP', criadoEm: agora - 5 * HORA, type: 'DOAÇÃO', categoria: 'Doacao', votes: 42,
              title: 'Lote de Gabinetes antigos',
              description: 'Temos cerca de 15 gabinetes ATX sem fonte. Perfeitos para projetos de Casemod ou para venda de metal. Retirada gratuita na zona leste.',
              tags: ['Gabinete', 'Lote', 'Metal'] },
            { id: 3, author: 'ONG_InclusaoDigital', criadoEm: agora - DIA, type: 'BUSCA', categoria: 'Busca', votes: 89,
              title: 'Precisamos de monitores LCD/LED funcionando',
              description: 'Nossa ONG está montando um laboratório para crianças. Conseguimos as CPUs, mas faltam 5 monitores. Alguém possui para doação ou preço acessível?',
              tags: ['Monitor', 'Projeto Social', 'Urgente'] },
            { id: 4, author: 'EcoAdmin', criadoEm: agora - 2 * DIA, type: 'INFORMATIVO', categoria: 'Acessibilidade', votes: 156,
              title: 'Como funciona a Coleta em Casa',
              description: 'Quem tem dificuldade de locomoção pode pedir a coleta gratuita de lixo eletrônico pesado em casa. Veja a página Projetos, no menu do site.',
              tags: ['Acessibilidade', 'Logística'] }
        ];
    }

    /* ---------- Dados salvos no navegador (modo demonstração) ---------- */
    function ler(chave, padrao) {
        try { const v = localStorage.getItem('ecorecicla-' + chave); return v === null ? padrao : JSON.parse(v); }
        catch (e) { return padrao; }
    }
    function gravar(chave, valor) {
        try { localStorage.setItem('ecorecicla-' + chave, JSON.stringify(valor)); } catch (e) {}
    }

    /* ---------- Firebase: liga se a configuração foi preenchida ---------- */
    const config = window.FIREBASE_CONFIG;
    let usarFirebase = Boolean(window.firebase && config && config.apiKey && config.apiKey.indexOf('COLE') === -1);
    let auth = null;
    let db = null;
    if (usarFirebase) {
        try {
            if (!firebase.apps.length) firebase.initializeApp(config);
            auth = firebase.auth();
            auth.useDeviceLanguage();
            db = firebase.firestore();
        } catch (erro) {
            console.error('Firebase não iniciou:', erro);
            usarFirebase = false;
        }
    }

    // Publicações de exemplo: aparecem sempre (no modo nuvem, marcadas como exemplo)
    const exemplos = postsIniciais().map(function (p) {
        return Object.assign({}, p, { id: 'ex-' + p.id, exemplo: true });
    });

    let postsLocais = ler('posts', null);
    if (!Array.isArray(postsLocais)) postsLocais = postsIniciais();
    let postsNuvem = [];
    let votosLocais = ler('votos', {}) || {};
    let votosNuvem = {};
    let usuario = null; // { uid, nome, email }
    let categoriaAtual = 'Geral';
    let termoBusca = '';

    const $ = function (id) { return document.getElementById(id); };
    const menu = $('com-menu');
    const seletorForum = $('com-forum-select');
    const feed = $('com-feed');
    const tituloFeed = $('com-titulo-feed');
    const aviso = $('com-aviso');
    const contagem = $('com-contagem');
    const campoPost = $('com-post-input');
    const campoBusca = $('com-busca');

    // Evita que texto digitado vire HTML na página
    function esc(texto) {
        return String(texto).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function semAcento(t) {
        return (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }

    function tempoRelativo(ms) {
        const d = Date.now() - ms;
        if (d < 60000) return 'Agora mesmo';
        if (d < HORA) return Math.floor(d / 60000) + ' min atrás';
        if (d < DIA) { const h = Math.floor(d / HORA); return h + (h === 1 ? ' hora atrás' : ' horas atrás'); }
        const dias = Math.floor(d / DIA);
        return dias === 1 ? 'Ontem' : dias + ' dias atrás';
    }

    function getColorBadge(type) {
        switch (type) {
            case 'VENDA': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'DOAÇÃO': return 'bg-green-100 text-green-800 border-green-200';
            case 'BUSCA': return 'bg-red-100 text-red-800 border-red-200';
            case 'INFORMATIVO': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }

    /* ---------- Menu de fóruns ---------- */
    function renderizarMenu() {
        menu.innerHTML = modulos.map(function (mod) {
            const ativo = categoriaAtual === mod.id;
            const extra = mod.id === 'Agendamento' ? '' : ' aria-pressed="' + ativo + '"';
            return '<li><button type="button" data-modulo="' + mod.id + '"' + extra +
                ' class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 transition-colors ' +
                (ativo ? 'bg-gray-100 border-r-4 border-primary text-primary font-bold' : '') + '">' +
                '<i class="ph ' + mod.icon + ' text-xl ' + (ativo ? 'text-accent' : 'text-gray-400') + '" aria-hidden="true"></i>' +
                mod.label + '</button></li>';
        }).join('');

        seletorForum.innerHTML = modulos.map(function (mod) {
            return '<option value="' + mod.id + '"' + (categoriaAtual === mod.id ? ' selected' : '') + '>' + mod.label + '</option>';
        }).join('');
    }

    function abrirModulo(id) {
        // "Agendar Coleta" leva para o formulário de coleta em projetos.html
        if (id === 'Agendamento') {
            window.location.href = 'projetos.html#coleta';
            return;
        }
        categoriaAtual = id;
        renderizarMenu();
        renderizarFeed();
    }

    menu.addEventListener('click', function (e) {
        const botao = e.target.closest('[data-modulo]');
        if (botao) abrirModulo(botao.dataset.modulo);
    });

    seletorForum.addEventListener('change', function () { abrirModulo(seletorForum.value); });
    $('com-logo').addEventListener('click', function () { abrirModulo('Geral'); });

    const status = $('com-status');

    function todasPublicacoes() {
        return usarFirebase ? postsNuvem.concat(exemplos) : postsLocais;
    }

    function meuVoto(post) {
        if (usarFirebase && !post.exemplo) return votosNuvem[post.id] || 0;
        return votosLocais[post.id] || 0;
    }

    function ehMeu(post) {
        return Boolean(usuario && post.autorUid && post.autorUid === usuario.uid);
    }

    /* ---------- Feed ---------- */
    function renderizarFeed() {
        tituloFeed.textContent = (modulos.find(function (m) { return m.id === categoriaAtual; }) || {}).label || 'Geral';
        const termo = semAcento(termoBusca.trim());

        const lista = todasPublicacoes()
            .filter(function (p) { return categoriaAtual === 'Geral' || p.categoria === categoriaAtual; })
            .filter(function (p) {
                return !termo || semAcento([p.title, p.description, p.author, (p.tags || []).join(' ')].join(' ')).includes(termo);
            })
            .sort(function (a, b) { return b.criadoEm - a.criadoEm; });

        contagem.textContent = (lista.length === 1 ? '1 publicação' : lista.length + ' publicações') +
            (termo ? ' para a busca ' + termoBusca.trim() : '');

        if (!lista.length) {
            feed.innerHTML =
                '<div class="bg-white rounded-lg border border-gray-300 p-8 text-center text-gray-600 shadow-sm">' +
                '<i class="ph ph-ghost text-4xl mb-2 text-gray-300" aria-hidden="true"></i>' +
                '<p>' + (termo ? 'Nenhuma postagem encontrada para essa busca.' : 'Nenhuma postagem nesta categoria ainda.') + '</p>' +
                '<p class="text-sm mt-2">Seja o primeiro a postar!</p></div>';
            atualizarPontos();
            return;
        }

        feed.innerHTML = lista.map(function (post) {
            const meu = meuVoto(post);
            const total = usarFirebase && !post.exemplo ? post.votes : post.votes + meu;
            const idTitulo = 'com-post-' + post.id;
            const rotuloExemplo = post.exemplo ? '<span class="bg-gray-100 text-gray-700 px-1.5 rounded border border-gray-300">exemplo</span>' : '';
            const excluir = ehMeu(post)
                ? '<button type="button" data-excluir="' + post.id + '" class="flex items-center gap-1 text-xs font-bold text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"><i class="ph ph-trash text-lg" aria-hidden="true"></i> Excluir<span class="sr-only"> a publicação ' + esc(post.title) + '</span></button>'
                : '';
            return '' +
            '<article data-post="' + post.id + '" aria-labelledby="' + idTitulo + '" class="bg-white rounded-lg border border-gray-300 flex overflow-hidden shadow-sm hover:border-gray-400 transition-colors">' +
                '<div class="w-10 bg-gray-50 flex flex-col items-center py-2 gap-1 flex-shrink-0 border-r border-gray-100">' +
                    '<button type="button" data-voto="1" aria-pressed="' + (meu === 1) + '" aria-label="Votar positivamente" class="' + (meu === 1 ? 'text-accent' : 'text-gray-500') + ' hover:text-accent hover:bg-gray-200 rounded p-1 transition-colors"><i class="' + (meu === 1 ? 'ph-fill' : 'ph-bold') + ' ph-arrow-fat-up" aria-hidden="true"></i></button>' +
                    '<span class="text-xs font-bold text-gray-800">' + total + '<span class="sr-only"> votos</span></span>' +
                    '<button type="button" data-voto="-1" aria-pressed="' + (meu === -1) + '" aria-label="Votar negativamente" class="' + (meu === -1 ? 'text-red-600' : 'text-gray-500') + ' hover:text-red-600 hover:bg-gray-200 rounded p-1 transition-colors"><i class="' + (meu === -1 ? 'ph-fill' : 'ph-bold') + ' ph-arrow-fat-down" aria-hidden="true"></i></button>' +
                '</div>' +
                '<div class="p-3 w-full min-w-0">' +
                    '<div class="flex items-center gap-2 text-xs text-gray-600 mb-1 flex-wrap">' +
                        '<span class="font-bold text-primary">@' + esc(post.author) + '</span>' +
                        '<span aria-hidden="true">•</span>' +
                        '<span>' + tempoRelativo(post.criadoEm) + '</span>' + rotuloExemplo +
                    '</div>' +
                    '<div class="mb-2">' +
                        '<span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold border mb-1 ' + getColorBadge(post.type) + '">' + esc(post.type) + '</span>' +
                        '<h3 id="' + idTitulo + '" class="text-lg font-bold text-gray-900 leading-tight mb-1">' + esc(post.title) + '</h3>' +
                        '<p class="text-sm text-gray-700">' + esc(post.description) + '</p>' +
                    '</div>' +
                    '<div class="flex items-center gap-4 mt-3 flex-wrap">' +
                        '<button type="button" class="flex items-center gap-1 text-xs font-bold text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors"><i class="ph ph-chat-teardrop text-lg" aria-hidden="true"></i> Comentar</button>' +
                        '<button type="button" class="flex items-center gap-1 text-xs font-bold text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors"><i class="ph ph-share-network text-lg" aria-hidden="true"></i> Compartilhar</button>' +
                        excluir +
                        '<ul class="ml-auto flex gap-1 flex-wrap" aria-label="Etiquetas">' +
                            (post.tags || []).map(function (tag) {
                                return '<li class="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-1 rounded border border-gray-200">#' + esc(tag) + '</li>';
                            }).join('') +
                        '</ul>' +
                    '</div>' +
                '</div>' +
            '</article>';
        }).join('');
        atualizarPontos();
    }

    /* ---------- Votos ---------- */
    feed.addEventListener('click', async function (e) {
        const botaoExcluir = e.target.closest('[data-excluir]');
        if (botaoExcluir) { excluirPost(botaoExcluir.dataset.excluir); return; }

        const botao = e.target.closest('[data-voto]');
        if (!botao) return;
        const id = botao.closest('[data-post]').dataset.post;
        const direcao = Number(botao.dataset.voto);
        const post = todasPublicacoes().find(function (p) { return String(p.id) === id; });
        if (!post) return;

        if (usarFirebase && !post.exemplo) {
            if (!usuario) { mostrarAviso('Entre na sua conta para votar.', true); abrirConta('entrar'); return; }
            await votarNaNuvem(id, direcao);
        } else {
            votosLocais[id] = votosLocais[id] === direcao ? 0 : direcao;
            gravar('votos', votosLocais);
            renderizarFeed();
        }
        const mesmo = feed.querySelector('[data-post="' + id + '"] [data-voto="' + direcao + '"]');
        if (mesmo) mesmo.focus();
    });

    async function votarNaNuvem(id, direcao) {
        const postRef = db.collection('posts').doc(id);
        const votoRef = db.collection('usuarios').doc(usuario.uid).collection('votos').doc(id);
        try {
            let novo = 0;
            await db.runTransaction(async function (t) {
                const voto = await t.get(votoRef);
                const atual = voto.exists ? voto.data().valor : 0;
                novo = atual === direcao ? 0 : direcao;
                t.update(postRef, { votes: firebase.firestore.FieldValue.increment(novo - atual) });
                if (novo) t.set(votoRef, { valor: novo });
                else t.delete(votoRef);
            });
            votosNuvem[id] = novo;
            renderizarFeed();
        } catch (erro) {
            console.error(erro);
            mostrarAviso('Não foi possível registrar o voto. Tente de novo.', true);
        }
    }

    async function carregarMeusVotos() {
        votosNuvem = {};
        if (!usarFirebase || !usuario) return;
        try {
            const snap = await db.collection('usuarios').doc(usuario.uid).collection('votos').get();
            snap.forEach(function (d) { votosNuvem[d.id] = d.data().valor; });
        } catch (erro) { console.error(erro); }
        renderizarFeed();
    }

    /* ---------- Excluir a própria publicação ---------- */
    async function excluirPost(id) {
        const post = todasPublicacoes().find(function (p) { return String(p.id) === id; });
        if (!post || !ehMeu(post)) return;
        if (!window.confirm('Excluir a publicação "' + post.title + '"? Isso não pode ser desfeito.')) return;
        if (usarFirebase) {
            try { await db.collection('posts').doc(id).delete(); mostrarAviso('Publicação excluída.'); }
            catch (erro) { console.error(erro); mostrarAviso('Não foi possível excluir. Tente de novo.', true); }
        } else {
            postsLocais = postsLocais.filter(function (p) { return String(p.id) !== id; });
            gravar('posts', postsLocais);
            renderizarFeed();
            mostrarAviso('Publicação excluída.');
        }
        tituloFeed.focus();
    }

    /* ---------- Busca do cabeçalho ---------- */
    let espera;
    campoBusca.addEventListener('input', function () {
        clearTimeout(espera);
        espera = setTimeout(function () { termoBusca = campoBusca.value; renderizarFeed(); }, 400);
    });

    $('com-ver-oferta').addEventListener('click', function () {
        campoBusca.value = 'DDR3';
        termoBusca = 'DDR3';
        categoriaAtual = 'Geral';
        renderizarMenu();
        renderizarFeed();
        tituloFeed.focus();
    });

    /* ---------- Organização automática da postagem ----------
       Lê o texto e descobre o tipo, o título e as etiquetas
       (substitui a IA, que precisava de uma chave de API). */
    const PALAVRAS_TAGS = [
        ['placa de video', 'Placa de Vídeo'], ['placa mae', 'Placa Mãe'], ['memoria', 'Memória'], ['ram', 'Memória'],
        ['ddr3', 'DDR3'], ['ddr4', 'DDR4'], ['processador', 'Processador'], ['monitor', 'Monitor'],
        ['gabinete', 'Gabinete'], ['fonte', 'Fonte'], ['ssd', 'SSD'], ['hd', 'HD'], ['notebook', 'Notebook'],
        ['celular', 'Celular'], ['teclado', 'Teclado'], ['mouse', 'Mouse'], ['impressora', 'Impressora'],
        ['bateria', 'Bateria'], ['cabo', 'Cabos'], ['gtx', 'GPU'], ['rtx', 'GPU'], ['cooperativa', 'Cooperativa']
    ];

    function organizarPostagem(texto) {
        const t = semAcento(texto);
        let type = 'INFORMATIVO';
        let categoria = categoriaAtual === 'Geral' ? 'Geral' : categoriaAtual;

        if (/(procur|preciso|busco|alguem tem|alguem possui|quero comprar|compro )/.test(t)) { type = 'BUSCA'; categoria = 'Busca'; }
        else if (/(vend|r\$)/.test(t)) { type = 'VENDA'; categoria = 'Venda'; }
        else if (/(doa|doo |de graca|gratis|gratuit)/.test(t)) { type = 'DOAÇÃO'; categoria = 'Doacao'; }

        const tags = [];
        PALAVRAS_TAGS.forEach(function (par) {
            const regex = new RegExp('\\b' + par[0] + '\\b');
            if (regex.test(t) && tags.indexOf(par[1]) === -1) tags.push(par[1]);
        });
        if (/(quebrad|defeito|nao funciona|queimad)/.test(t)) tags.push('Defeito');
        else if (/funciona/.test(t)) tags.push('Funcionando');
        if (!tags.length) tags.push('Hardware');

        let title = texto.split(/[.!?\n]/)[0].trim();
        title = title.charAt(0).toUpperCase() + title.slice(1);
        if (title.length > 80) title = title.slice(0, 77).trim() + '...';

        return { type: type, categoria: categoria, title: title, tags: tags.slice(0, 3) };
    }

    /* ---------- Avisos ---------- */
    function mostrarAviso(texto, erro) {
        aviso.className = 'mt-3 text-xs font-bold ' + (erro ? 'text-red-700' : 'text-primary');
        aviso.textContent = texto;
    }

    /* ---------- Publicar ---------- */
    const btnPostar = $('com-btn-postar');
    btnPostar.addEventListener('click', async function () {
        if (!usuario) {
            mostrarAviso('Entre na sua conta para postar.', true);
            abrirConta('entrar');
            return;
        }
        const texto = campoPost.value.trim();
        if (!texto) {
            mostrarAviso('Escreva o que você tem ou precisa antes de postar.', true);
            campoPost.focus();
            return;
        }

        const dados = organizarPostagem(texto);
        const novo = {
            author: usuario.nome,
            autorUid: usuario.uid,
            type: dados.type,
            categoria: dados.categoria,
            title: dados.title,
            description: texto.slice(0, 1000),
            tags: dados.tags
        };

        btnPostar.disabled = true;
        try {
            if (usarFirebase) {
                await db.collection('posts').add(Object.assign({}, novo, {
                    votes: 0,
                    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
                }));
            } else {
                postsLocais.unshift(Object.assign({}, novo, { id: Date.now(), votes: 1, criadoEm: Date.now() }));
                gravar('posts', postsLocais);
            }
            campoPost.value = '';
            campoBusca.value = '';
            termoBusca = '';
            if (categoriaAtual !== 'Geral') categoriaAtual = dados.categoria;
            renderizarMenu();
            renderizarFeed();
            mostrarAviso('Postagem publicada como ' + dados.type + (usarFirebase ? ' e salva na nuvem.' : '.'));
        } catch (erro) {
            console.error(erro);
            mostrarAviso('Não foi possível publicar. Verifique a internet e tente de novo.', true);
        } finally {
            btnPostar.disabled = false;
        }
    });

    /* ---------- Contas ---------- */
    const dialogo = $('com-conta');
    const formConta = $('com-form-conta');
    const campoNome = $('com-nome');
    const campoEmail = $('com-conta-email');
    const campoSenha = $('com-conta-senha');
    const campoConfirmar = $('com-conta-confirmar');
    const erroConta = $('com-conta-erro');
    let modoConta = 'entrar';
    let ultimoFoco = null;

    function iniciais(nome) {
        return (nome || '?').split(/[\s_.]+/).filter(Boolean).slice(0, 2).map(function (p) { return p[0]; }).join('').toUpperCase();
    }

    function atualizarPontos() {
        if (!usuario) return;
        const meus = todasPublicacoes().filter(ehMeu);
        const pontos = meus.reduce(function (soma, p) { return soma + 10 + Math.max(0, p.votes); }, 0);
        $('com-perfil-pontos').textContent = pontos;
    }

    function atualizarPerfil() {
        const logado = Boolean(usuario);
        $('com-entrar-botoes').classList.toggle('hidden', logado);
        $('com-perfil').classList.toggle('hidden', !logado);
        $('com-perfil').classList.toggle('flex', logado);
        if (logado) {
            $('com-perfil-nome').textContent = usuario.nome;
            $('com-perfil-avatar').textContent = iniciais(usuario.nome);
            atualizarPontos();
        }
        atualizarStatus();
        renderizarFeed();
    }

    function atualizarStatus() {
        const quem = usuario ? ' Você entrou como ' + usuario.nome + '.' : '';
        status.innerHTML = usarFirebase
            ? '<i class="ph ph-cloud-check text-lg text-primary" aria-hidden="true"></i> Conectado ao Firebase: contas e publicações ficam salvas na nuvem.' + esc(quem)
            : '<i class="ph ph-info text-lg text-primary" aria-hidden="true"></i> Modo demonstração: as contas e publicações ficam salvas só neste navegador.' + esc(quem);
    }

    function definirModo(modo) {
        modoConta = modo;
        const criar = modo === 'criar';
        $('com-conta-titulo').textContent = criar ? 'Criar conta' : 'Entrar';
        $('com-conta-enviar').textContent = criar ? 'Criar conta' : 'Entrar';
        $('com-troca-texto').textContent = criar ? 'Já tem conta?' : 'Ainda não tem conta?';
        $('com-trocar-modo').textContent = criar ? 'Entrar' : 'Criar conta';
        // Campos escondidos ficam desativados para não bloquear o envio
        $('com-grupo-nome').hidden = !criar;
        campoNome.disabled = !criar;
        campoNome.required = criar;
        $('com-grupo-confirmar').hidden = !criar;
        campoConfirmar.disabled = !criar;
        campoConfirmar.required = criar;
        campoSenha.autocomplete = criar ? 'new-password' : 'current-password';
        $('com-grupo-esqueci').hidden = criar || !usarFirebase;
        erroConta.textContent = '';
    }

    function abrirConta(modo) {
        ultimoFoco = document.activeElement;
        definirModo(modo);
        formConta.reset();
        if (typeof dialogo.showModal === 'function') dialogo.showModal();
        else dialogo.setAttribute('open', '');
        (modo === 'criar' ? campoNome : campoEmail).focus();
    }

    function fecharConta() {
        if (typeof dialogo.close === 'function') dialogo.close();
        else dialogo.removeAttribute('open');
    }

    dialogo.addEventListener('close', function () {
        if (ultimoFoco && document.contains(ultimoFoco)) ultimoFoco.focus();
    });

    $('com-abrir-entrar').addEventListener('click', function () { abrirConta('entrar'); });
    $('com-abrir-criar').addEventListener('click', function () { abrirConta('criar'); });
    $('com-conta-cancelar').addEventListener('click', fecharConta);
    $('com-trocar-modo').addEventListener('click', function () {
        definirModo(modoConta === 'criar' ? 'entrar' : 'criar');
        (modoConta === 'criar' ? campoNome : campoEmail).focus();
    });

    function mensagemErro(erro) {
        const mensagens = {
            'auth/email-already-in-use': 'Já existe uma conta com esse e-mail. Tente entrar.',
            'auth/invalid-email': 'O e-mail não é válido.',
            'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
            'auth/invalid-credential': 'E-mail ou senha incorretos.',
            'auth/wrong-password': 'E-mail ou senha incorretos.',
            'auth/user-not-found': 'E-mail ou senha incorretos.',
            'auth/too-many-requests': 'Muitas tentativas. Espere alguns minutos e tente de novo.',
            'auth/network-request-failed': 'Sem conexão com a internet.',
            'auth/operation-not-allowed': 'O login por e-mail e senha não está ativado no Firebase.'
        };
        return mensagens[erro && erro.code] || 'Algo deu errado. Tente de novo.';
    }

    formConta.addEventListener('submit', async function (e) {
        e.preventDefault();
        erroConta.textContent = '';
        const email = campoEmail.value.trim();
        const senha = campoSenha.value;
        const nome = campoNome.value.trim();

        if (modoConta === 'criar' && senha !== campoConfirmar.value) {
            erroConta.textContent = 'As senhas não são iguais.';
            campoConfirmar.focus();
            return;
        }

        const botao = $('com-conta-enviar');
        botao.disabled = true;
        try {
            if (usarFirebase) {
                if (modoConta === 'criar') {
                    const cred = await auth.createUserWithEmailAndPassword(email, senha);
                    await cred.user.updateProfile({ displayName: nome });
                    await db.collection('usuarios').doc(cred.user.uid).set({
                        nome: nome,
                        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    usuario = { uid: cred.user.uid, nome: nome, email: email };
                    atualizarPerfil();
                } else {
                    await auth.signInWithEmailAndPassword(email, senha);
                }
            } else {
                // Demonstração: guarda só o nome no navegador (nenhuma senha é salva)
                const contas = ler('contas', {});
                if (modoConta === 'criar') contas[email] = { nome: nome };
                const nomeSalvo = (contas[email] && contas[email].nome) || email.split('@')[0];
                gravar('contas', contas);
                usuario = { uid: 'local-' + email, nome: nomeSalvo, email: email };
                gravar('sessao', usuario);
                atualizarPerfil();
            }
            fecharConta();
            campoPost.focus();
            mostrarAviso(modoConta === 'criar' ? 'Conta criada. Boas-vindas à comunidade!' : 'Você entrou na sua conta.');
        } catch (erro) {
            console.error(erro);
            erroConta.textContent = mensagemErro(erro);
        } finally {
            botao.disabled = false;
        }
    });

    $('com-esqueci').addEventListener('click', async function () {
        const email = campoEmail.value.trim();
        if (!email) {
            erroConta.textContent = 'Digite seu e-mail acima para receber o link de nova senha.';
            campoEmail.focus();
            return;
        }
        try {
            await auth.sendPasswordResetEmail(email);
            erroConta.textContent = 'Se existir uma conta com esse e-mail, enviamos um link para criar uma nova senha.';
        } catch (erro) {
            erroConta.textContent = mensagemErro(erro);
        }
    });

    $('com-sair').addEventListener('click', async function () {
        if (usarFirebase) {
            await auth.signOut();
        } else {
            usuario = null;
            gravar('sessao', null);
            atualizarPerfil();
        }
        mostrarAviso('Você saiu da conta.');
        $('com-abrir-entrar').focus();
    });

    /* ---------- Início ---------- */
    renderizarMenu();

    if (usarFirebase) {
        auth.onAuthStateChanged(function (user) {
            usuario = user ? { uid: user.uid, nome: user.displayName || (user.email || '').split('@')[0], email: user.email } : null;
            atualizarPerfil();
            carregarMeusVotos();
        });
        // Publicações em tempo real: quando alguém posta, aparece para todos
        db.collection('posts').orderBy('criadoEm', 'desc').limit(100).onSnapshot(function (snap) {
            postsNuvem = snap.docs.map(function (d) {
                const x = d.data();
                return {
                    id: d.id,
                    author: x.author,
                    autorUid: x.autorUid,
                    type: x.type,
                    categoria: x.categoria,
                    title: x.title,
                    description: x.description,
                    tags: x.tags || [],
                    votes: x.votes || 0,
                    criadoEm: x.criadoEm ? x.criadoEm.toMillis() : Date.now()
                };
            });
            renderizarFeed();
        }, function (erro) {
            console.error(erro);
            status.textContent = 'Não foi possível carregar as publicações da nuvem. Confira se as regras do Firestore foram publicadas.';
        });
    } else {
        usuario = ler('sessao', null);
        atualizarPerfil();
    }
})();
