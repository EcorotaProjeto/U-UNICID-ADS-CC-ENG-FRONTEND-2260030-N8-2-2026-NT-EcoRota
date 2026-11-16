/*
 * Recursos de acessibilidade do EcoRota (painel no topo das páginas).
 * Acrescenta três opções ao painel já existente, sem alterar os botões que
 * o script.js controla (tamanho do texto, alto contraste e leitura em voz).
 *
 *  - Espaçamento de leitura: letras e linhas mais afastadas (dislexia, baixa
 *    visão, défice cognitivo).
 *  - Alvos de toque maiores: botões e links com pelo menos 48px (deficiência
 *    física, motora ou tremor).
 *  - Pausar animações: para o movimento da página e do mascote (sensibilidade
 *    a movimento, atenção e distração). Abre já pausado se o sistema pedir
 *    redução de movimento.
 *
 * As escolhas ficam salvas no navegador. Se o armazenamento não existir ou
 * estiver bloqueado, as opções continuam funcionando na sessão atual.
 */
(function () {
    'use strict';

    const grupo = document.querySelector('#painel-acessibilidade .grupo-controles');
    if (!grupo) return;

    const OPCOES = [
        {
            classe: 'espacamento-leitura',
            chave: 'ecorota-espacamento',
            rotulo: 'Espaçamento de leitura',
            id: 'btnEspacamento'
        },
        {
            classe: 'alvos-grandes',
            chave: 'ecorota-alvos',
            rotulo: 'Botões maiores',
            id: 'btnAlvos'
        },
        {
            classe: 'sem-animacao',
            chave: 'ecorota-animacao',
            rotulo: 'Pausar animações',
            id: 'btnAnimacao',
            padrao: function () {
                return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            }
        }
    ];

    function ler(chave) {
        try { return window.localStorage.getItem(chave); } catch (e) { return null; }
    }

    function gravar(chave, valor) {
        try { window.localStorage.setItem(chave, valor); } catch (e) { /* sem armazenamento: ignora */ }
    }

    function aplicar(opcao, ativo) {
        document.documentElement.classList.toggle(opcao.classe, ativo);
        const botao = document.getElementById(opcao.id);
        if (botao) botao.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    }

    OPCOES.forEach(function (opcao) {
        const salvo = ler(opcao.chave);
        const ativo = salvo !== null ? salvo === '1' : (opcao.padrao ? opcao.padrao() : false);

        const botao = document.createElement('button');
        botao.type = 'button';
        botao.id = opcao.id;
        botao.textContent = opcao.rotulo;
        botao.setAttribute('aria-pressed', 'false');
        grupo.appendChild(botao);

        aplicar(opcao, ativo);

        botao.addEventListener('click', function () {
            const novo = !document.documentElement.classList.contains(opcao.classe);
            aplicar(opcao, novo);
            gravar(opcao.chave, novo ? '1' : '0');
        });
    });

    /* ---------- Comando de voz, sem usar as mãos ----------
     * Pensado para quem não pode usar mouse, teclado ou tela.
     * Quando ligado, começa sozinho em todas as páginas (a pessoa só liga uma vez).
     * O navegador pede permissão do microfone na primeira vez.
     *
     * Comandos:
     *   ajuda                              -> lista os comandos
     *   escreva <texto>                    -> escreve no campo atual
     *   escreva <texto> no campo <nome>    -> escreve no campo com esse nome
     *   campo <nome>                       -> vai para o campo e lê o nome e o conteúdo
     *   próximo campo / campo anterior     -> troca de campo
     *   ler campo                          -> lê o campo atual
     *   limpar campo                       -> apaga o campo atual
     *   ler página                         -> lê o conteúdo principal
     *   ir para <página>                   -> vai para uma página do menu
     *   enviar formulário                  -> pede confirmação
     *   confirmar envio / cancelar         -> confirma ou cancela o envio
     *   desligar comandos                  -> desliga a escuta
     * Enquanto o site fala, os comandos são ignorados, para não ouvir a própria voz.
     */
    const ReconhecimentoVoz = window.SpeechRecognition || window.webkitSpeechRecognition;
    const CHAVE_VOZ = 'ecorota-comando-voz';
    const sintese = window.speechSynthesis || null;
    const AJUDA = 'Comandos: escreva texto; escreva texto no campo nome; campo nome; próximo campo; campo anterior; ler campo; limpar campo; ler página; ir para projetos; enviar formulário; confirmar envio; cancelar; desligar comandos.';

    let vozLigada = false;
    let recVoz = null;
    let falando = false;
    let ultimoCampo = null;
    let envioPendente = null;
    let botaoVoz = null;

    const avisoVoz = document.createElement('p');
    avisoVoz.className = 'sr-only';
    avisoVoz.setAttribute('role', 'status');
    avisoVoz.setAttribute('aria-live', 'polite');
    document.body.appendChild(avisoVoz);

    function semAcento(texto) {
        return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function nomeCampo(c) {
        const rotulo = c.labels && c.labels[0];
        const texto = rotulo ? rotulo.textContent : (c.getAttribute('aria-label') || c.placeholder || 'campo sem nome');
        return texto.replace(/\((obrigatório|opcional)\)/gi, '').replace(/\s+/g, ' ').trim();
    }

    function camposDoFormulario() {
        return Array.from(document.querySelectorAll(
            'form input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]):not([type=reset]), form textarea'
        )).filter(function (c) { return !c.readOnly && !c.disabled && c.offsetParent !== null; });
    }

    function dizer(texto) {
        if (!sintese) return;
        try {
            sintese.cancel();
            const fala = new SpeechSynthesisUtterance(texto);
            fala.lang = 'pt-BR';
            falando = true;
            // Segurança: se o navegador não avisar o fim da fala, libera os comandos depois do tempo estimado
            clearTimeout(dizer.prazo);
            dizer.prazo = setTimeout(function () { falando = false; }, 2000 + texto.length * 80);
            fala.onend = function () { falando = false; clearTimeout(dizer.prazo); };
            fala.onerror = function () { falando = false; clearTimeout(dizer.prazo); };
            sintese.speak(fala);
        } catch (e) { falando = false; }
    }

    function avisar(texto) {
        avisoVoz.textContent = '';
        setTimeout(function () { avisoVoz.textContent = texto; }, 60);
        dizer(texto);
    }

    function mascoteEscrevendo(ligado) {
        const m = document.querySelector('mascote-ia');
        try { if (m && typeof m.tocar === 'function') m.tocar(ligado ? 'write' : 'idle'); } catch (e) { /* sem mascote */ }
    }

    const PONTUACAO = [
        [/\bponto de interroga(ção|cao)\b/gi, '?'],
        [/\bponto de exclama(ção|cao)\b/gi, '!'],
        [/\bnova linha\b/gi, '\n'],
        [/\bponto final\b/gi, '.'],
        [/\bponto\b/gi, '.'],
        [/\bvírgula\b/gi, ','],
        [/\bvirgula\b/gi, ',']
    ];
    function comPontuacao(texto) {
        let saida = texto;
        PONTUACAO.forEach(function (par) { saida = saida.replace(par[0], par[1]); });
        return saida.replace(/\s+([,.?!])/g, '$1').replace(/[ \t]+\n/g, '\n');
    }

    function encontrarCampo(nome) {
        const alvo = semAcento(nome.replace(/[.,!?]+$/, ''));
        return camposDoFormulario().find(function (c) { return semAcento(nomeCampo(c)).indexOf(alvo) !== -1; }) || null;
    }

    function focar(campo) {
        ultimoCampo = campo;
        campo.focus();
    }

    function lerCampo(campo) {
        return nomeCampo(campo) + '. ' + (campo.value ? 'Preenchido com: ' + campo.value : 'Vazio.');
    }

    function irParaPagina(nome) {
        const alvo = semAcento(nome);
        const link = Array.from(document.querySelectorAll('.menu-principal a, nav a'))
            .find(function (a) { return semAcento(a.textContent).indexOf(alvo) !== -1; });
        if (!link) return avisar('Não encontrei a página ' + nome + '.');
        avisar('Indo para ' + link.textContent.trim() + '.');
        setTimeout(function () { link.click(); }, 1200);
    }


    /* ---------- Preencher o formulário inteiro por voz ---------- */
    let preenchendo = null; // { lista, i }
    const GLOBAIS = ['ajuda', 'desligar comandos', 'desligar comando de voz', 'confirmar envio', 'cancelar',
        'enviar formulario', 'parar preenchimento', 'parar de preencher', 'pular', 'pule'];
    const MESES = { janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6,
        julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12 };

    function camposParaPreencher() {
        return Array.from(document.querySelectorAll('form input, form textarea, form select')).filter(function (c) {
            if (['hidden', 'submit', 'button', 'reset', 'radio', 'file', 'image'].indexOf(c.type) !== -1) return false;
            return !c.readOnly && !c.disabled && c.offsetParent !== null;
        });
    }

    function perguntarCampo(intro) {
        const p = preenchendo;
        if (!p) return;
        if (p.i >= p.lista.length) {
            preenchendo = null;
            return avisar('Formulário preenchido. Diga: enviar formulário, para revisar o envio.');
        }
        const c = p.lista[p.i];
        focar(c);
        const rotulo = c.labels && c.labels[0] ? c.labels[0].textContent : '';
        const obrigatorio = /obrigat/i.test(rotulo) ? ' Obrigatório.' : '';
        let extra = '';
        if (c.tagName === 'SELECT') {
            const opcoes = Array.from(c.options).filter(function (o) { return o.value; }).map(function (o) { return o.text.trim(); });
            extra = ' Opções: ' + opcoes.join('; ') + '.';
        } else if (c.type === 'checkbox') {
            extra = ' Diga marcar para aceitar, ou não para deixar sem marcar.';
        } else if (c.type === 'date') {
            extra = ' Diga a data, por exemplo: 10 de dezembro de 2026.';
        }
        avisar((intro ? intro + ' ' : '') + 'Campo ' + (p.i + 1) + ' de ' + p.lista.length + ': ' +
            nomeCampo(c) + '.' + obrigatorio + extra + ' Diga o valor, ou pular.');
    }

    // Tenta gravar a fala no campo. Devolve false se não entendeu.
    function responder(c, fala) {
        const f = fala.replace(/[.!?]+$/, '').trim();
        const n = semAcento(f);
        const avisarMudanca = function () { c.dispatchEvent(new Event('input', { bubbles: true })); c.dispatchEvent(new Event('change', { bubbles: true })); };

        if (c.tagName === 'SELECT') {
            const opcao = Array.from(c.options).find(function (o) { return o.value && semAcento(o.text).indexOf(n) !== -1; });
            if (!opcao) return false;
            c.value = opcao.value;
            avisarMudanca();
            return true;
        }
        if (c.type === 'checkbox') {
            if (/^(marcar|sim|aceito|aceitar|autorizo|autorizar)/.test(n)) { c.checked = true; avisarMudanca(); return true; }
            if (n === 'nao') { c.checked = false; avisarMudanca(); return true; }
            return false;
        }
        if (c.type === 'date') {
            const m = n.match(/(\d{1,2}) de ([a-z]+) de (\d{4})/);
            if (!m || !MESES[m[2]]) return false;
            c.value = m[3] + '-' + String(MESES[m[2]]).padStart(2, '0') + '-' + String(m[1]).padStart(2, '0');
            avisarMudanca();
            return true;
        }
        let valor = comPontuacao(f);
        if (c.type === 'email') valor = valor.replace(/\s+/g, '').replace(/arroba/gi, '@');
        c.value = valor;
        avisarMudanca();
        return true;
    }

    function executarComando(fala) {
        const texto = fala.trim().replace(/[.!?]+$/, '');
        const n = semAcento(texto);

        if (preenchendo && GLOBAIS.indexOf(n) === -1) {
            const c = preenchendo.lista[preenchendo.i];
            if (!responder(c, texto)) return avisar('Não entendi. Diga o valor de novo, ou pular.');
            preenchendo.i++;
            return perguntarCampo();
        }
        if (preenchendo && (n === 'pular' || n === 'pule')) {
            preenchendo.i++;
            return perguntarCampo();
        }
        if (preenchendo && (n === 'parar preenchimento' || n === 'parar de preencher')) {
            preenchendo = null;
            return avisar('Preenchimento interrompido.');
        }
        if (/^preencher( o)? formulario$/.test(n)) {
            const lista = camposParaPreencher();
            if (!lista.length) return avisar('Esta página não tem formulário para preencher.');
            preenchendo = { lista: lista, i: 0 };
            return perguntarCampo('Vou perguntar cada campo. Diga o valor de cada um. Para pular, diga pular. Para parar, diga parar preenchimento.');
        }

        if (n === 'ajuda') return avisar(AJUDA);
        if (n === 'desligar comandos' || n === 'desligar comando de voz') return desligarVoz('Comandos de voz desligados.');
        if (n === 'cancelar') { envioPendente = null; return avisar('Envio cancelado.'); }
        if (n === 'confirmar envio') {
            if (!envioPendente) return avisar('Não há envio para confirmar.');
            const formulario = envioPendente;
            envioPendente = null;
            avisar('Enviando.');
            return formulario.requestSubmit();
        }
        if (n === 'enviar formulario') {
            const formulario = document.querySelector('form');
            if (!formulario) return avisar('Esta página não tem formulário.');
            envioPendente = formulario;
            return avisar('Para confirmar o envio, diga: confirmar envio. Para cancelar, diga: cancelar.');
        }
        if (n === 'ler pagina') {
            const principal = document.querySelector('main') || document.body;
            return avisar(principal.innerText.replace(/\s+/g, ' ').slice(0, 1500));
        }
        if (n === 'ler campo') {
            return ultimoCampo ? avisar(lerCampo(ultimoCampo)) : avisar('Nenhum campo selecionado. Diga: campo, e o nome do campo.');
        }
        if (n === 'limpar campo') {
            if (!ultimoCampo) return avisar('Nenhum campo selecionado.');
            ultimoCampo.value = '';
            ultimoCampo.dispatchEvent(new Event('input', { bubbles: true }));
            return avisar('Campo ' + nomeCampo(ultimoCampo) + ' limpo.');
        }
        if (n === 'proximo campo' || n === 'campo seguinte' || n === 'campo anterior') {
            const campos = camposDoFormulario();
            if (!campos.length) return avisar('Esta página não tem campos.');
            const i = campos.indexOf(ultimoCampo);
            const passo = n === 'campo anterior' ? -1 : 1;
            const novo = campos[(i + passo + campos.length) % campos.length];
            focar(novo);
            return avisar(lerCampo(novo));
        }

        const escreva = texto.match(/^escreva\s+(.+?)(?:\s+(?:no|na)\s+campo\s+(.+))?$/i);
        if (escreva) {
            const alvo = escreva[2] ? encontrarCampo(escreva[2]) : ultimoCampo;
            if (!alvo) return avisar(escreva[2] ? 'Não encontrei o campo ' + escreva[2] + '.' : 'Diga o campo primeiro: campo, e o nome do campo.');
            const anterior = alvo.value ? alvo.value.trimEnd() + ' ' : '';
            alvo.value = anterior + comPontuacao(escreva[1]).trim();
            alvo.dispatchEvent(new Event('input', { bubbles: true }));
            focar(alvo);
            mascoteEscrevendo(true);
            setTimeout(function () { mascoteEscrevendo(false); }, 2000);
            return avisar('Escrito no campo ' + nomeCampo(alvo) + '.');
        }

        const campo = texto.match(/^(?:ir para o campo|ir para campo|campo)\s+(.+)$/i);
        if (campo) {
            const alvo = encontrarCampo(campo[1]);
            if (!alvo) return avisar('Não encontrei o campo ' + campo[1] + '.');
            focar(alvo);
            return avisar(lerCampo(alvo));
        }

        const ir = texto.match(/^ir para\s+(.+)$/i);
        if (ir) return irParaPagina(ir[1]);
        // Fala que não é comando é ignorada
    }

    function iniciarEscuta() {
        if (!vozLigada || !ReconhecimentoVoz) return;
        const rec = new ReconhecimentoVoz();
        recVoz = rec;
        rec.lang = 'pt-BR';
        rec.continuous = true;
        rec.interimResults = false;
        rec.onresult = function (evento) {
            if (falando) return;
            for (let i = evento.resultIndex; i < evento.results.length; i++) {
                if (evento.results[i].isFinal) executarComando(evento.results[i][0].transcript);
            }
        };
        rec.onerror = function (evento) {
            if (evento.error === 'not-allowed' || evento.error === 'service-not-allowed') {
                desligarVoz('Permissão do microfone negada. Libere o microfone nas configurações do navegador.', true);
            }
        };
        rec.onend = function () {
            // O navegador encerra a escuta após um silêncio: religa enquanto estiver ligado
            if (vozLigada && recVoz === rec) iniciarEscuta();
        };
        try {
            rec.start();
        } catch (e) {
            desligarVoz('Não foi possível iniciar o comando de voz.', true);
        }
    }

    function ligarVoz(anunciar) {
        vozLigada = true;
        if (botaoVoz) {
            botaoVoz.setAttribute('aria-pressed', 'true');
            botaoVoz.textContent = 'Parar comando de voz';
        }
        try { window.localStorage.setItem(CHAVE_VOZ, '1'); } catch (e) { /* sem armazenamento */ }
        if (anunciar) avisar('Comando de voz ativo. Diga ajuda para ouvir os comandos.');
        iniciarEscuta();
    }

    function desligarVoz(motivo, manterPreferencia) {
        vozLigada = false;
        const r = recVoz;
        recVoz = null;
        if (r) { try { r.stop(); } catch (e) { /* já parado */ } }
        if (botaoVoz) {
            botaoVoz.setAttribute('aria-pressed', 'false');
            botaoVoz.textContent = 'Comando de voz';
        }
        if (!manterPreferencia) {
            try { window.localStorage.setItem(CHAVE_VOZ, '0'); } catch (e) { /* sem armazenamento */ }
        }
        mascoteEscrevendo(false);
        if (motivo) avisar(motivo);
    }

    if (ReconhecimentoVoz && camposDoFormulario().length) {
        document.addEventListener('focusin', function (e) {
            if (e.target && e.target.matches && e.target.matches('form input, form textarea')) ultimoCampo = e.target;
        });

        botaoVoz = document.createElement('button');
        botaoVoz.type = 'button';
        botaoVoz.id = 'btnComandoVoz';
        botaoVoz.textContent = 'Comando de voz';
        botaoVoz.setAttribute('aria-pressed', 'false');
        grupo.appendChild(botaoVoz);
        botaoVoz.addEventListener('click', function () {
            if (vozLigada) desligarVoz('Comando de voz desligado.');
            else ligarVoz(true);
        });

        let salvo = null;
        try { salvo = window.localStorage.getItem(CHAVE_VOZ); } catch (e) { salvo = null; }
        if (salvo === '1') ligarVoz(false);
    }

    /* ---------- Pedido vindo do Equinho (chat) ---------- */
    window.addEventListener('ecorota:comando', function (e) {
        if (!ReconhecimentoVoz) return avisar('Para preencher por voz, use o Chrome ou o Edge.');
        if (!vozLigada) ligarVoz(false);
        if (!camposParaPreencher().length) {
            avisar('Esta página não tem formulário. Vou te levar para a página de Contato.');
            return irParaPagina('contato');
        }
        executarComando(String(e.detail || ''));
    });
})();
