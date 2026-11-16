/*
 * Escrita por voz (ditado) nos formulários do EcoRota.
 *
 * Cada campo de texto ganha um botão "Ditar". A pessoa clica (ou aperta Enter
 * no botão), fala, e o texto vai para o campo. Também é possível ditar a
 * pontuação: "vírgula", "ponto", "ponto de interrogação", "ponto de
 * exclamação" e "nova linha".
 *
 * Usa o reconhecimento de voz do navegador (Chrome, Edge e Chrome no Android).
 * O Firefox e alguns navegadores não têm essa função: nesse caso o botão não
 * aparece e um aviso é mostrado no painel de acessibilidade.
 *
 * O áudio é processado pelo navegador, conforme a configuração dele; este
 * script não grava nem envia a voz para o EcoRota.
 */
(function () {
    'use strict';

    const Reconhecimento = window.SpeechRecognition || window.webkitSpeechRecognition;
    const campos = Array.from(document.querySelectorAll(
        'form textarea, form input[type="text"], form input[type="email"], form input[type="search"], form input:not([type])'
    )).filter(function (campo) {
        return !campo.readOnly && !campo.disabled && !campo.closest('[hidden]') && !campo.hasAttribute('data-sem-ditado');
    });

    /* Região para anunciar o que está acontecendo aos leitores de tela */
    const aviso = document.createElement('p');
    aviso.className = 'sr-only';
    aviso.setAttribute('role', 'status');
    aviso.setAttribute('aria-live', 'polite');
    document.body.appendChild(aviso);
    function anunciar(texto) {
        aviso.textContent = '';
        setTimeout(function () { aviso.textContent = texto; }, 60);
    }

    /* Sem suporte: explica no painel, sem criar botões que não funcionam */
    if (!Reconhecimento) {
        const grupo = document.querySelector('#painel-acessibilidade .grupo-controles');
        if (grupo && campos.length) {
            const nota = document.createElement('p');
            nota.className = 'nota-voz';
            nota.textContent = 'Escrita por voz: indisponível neste navegador. Use Chrome, Edge ou o Chrome do celular.';
            grupo.parentNode.appendChild(nota);
        }
        return;
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
        // Remove espaço antes de sinais de pontuação ditados
        return saida.replace(/\s+([,.?!])/g, '$1').replace(/[ \t]+\n/g, '\n');
    }

    let ativo = null; // { campo, botao, rec, base }

    function parar(motivo) {
        if (!ativo) return;
        const atual = ativo;
        ativo = null;
        atual.botao.setAttribute('aria-pressed', 'false');
        atual.botao.textContent = 'Ditar';
        try { atual.rec.stop(); } catch (e) { /* já parado */ }
        if (motivo) anunciar(motivo);
    }

    function iniciar(campo, botao) {
        parar();
        const rec = new Reconhecimento();
        rec.lang = 'pt-BR';
        rec.interimResults = true;
        rec.continuous = true;
        const base = campo.value ? campo.value.replace(/\s*$/, ' ') : '';
        ativo = { campo: campo, botao: botao, rec: rec, base: base };

        botao.setAttribute('aria-pressed', 'true');
        botao.textContent = 'Parar ditado';
        anunciar('Ditado ativo no campo ' + nomeDoCampo(campo) + '. Fale normalmente.');

        let finais = '';
        rec.onresult = function (evento) {
            let interino = '';
            for (let i = evento.resultIndex; i < evento.results.length; i++) {
                const trecho = evento.results[i][0].transcript;
                if (evento.results[i].isFinal) finais += trecho + ' ';
                else interino += trecho;
            }
            campo.value = base + comPontuacao(finais + interino).trim();
            campo.dispatchEvent(new Event('input', { bubbles: true }));
        };
        rec.onerror = function (evento) {
            const mensagens = {
                'not-allowed': 'Permissão do microfone negada. Libere o microfone nas configurações do navegador.',
                'service-not-allowed': 'Permissão do microfone negada. Libere o microfone nas configurações do navegador.',
                'no-speech': 'Nenhuma fala detectada. Clique em Ditar e tente de novo.',
                'audio-capture': 'Microfone não encontrado.'
            };
            parar(mensagens[evento.error] || 'Não foi possível ditar agora. Tente de novo.');
        };
        rec.onend = function () {
            if (ativo && ativo.rec === rec) parar('Ditado encerrado.');
        };
        try {
            rec.start();
        } catch (e) {
            parar('Não foi possível iniciar o ditado. Tente de novo.');
        }
    }

    function nomeDoCampo(campo) {
        const rotulo = campo.labels && campo.labels[0];
        return rotulo ? rotulo.textContent.replace(/\s+/g, ' ').trim() : 'de texto';
    }

    campos.forEach(function (campo, n) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'botao-ditar';
        botao.textContent = 'Ditar';
        botao.setAttribute('aria-pressed', 'false');
        botao.setAttribute('aria-label', 'Ditar texto no campo ' + nomeDoCampo(campo));
        botao.id = 'ditar-' + n;

        botao.addEventListener('click', function () {
            if (ativo && ativo.botao === botao) parar('Ditado parado.');
            else iniciar(campo, botao);
        });
        campo.insertAdjacentElement('afterend', botao);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && ativo) parar('Ditado parado.');
    });

    /* ---------- Comando de voz: "escreva ... no campo ..." ----------
     * Modo separado do ditado. Com ele ligado, o navegador escuta
     * continuamente e executa:
     *   "escreva <texto>"                  -> escreve no último campo clicado
     *   "escreva <texto> no campo <nome>"  -> escreve no campo com esse nome
     *   "limpar campo"                     -> apaga o último campo usado
     *   "próximo campo"                    -> vai para o campo seguinte
     * O formulário nunca é enviado por comando de voz.
     */
    const COMANDO_ESCREVA = /^escreva\s+(.+?)(?:\s+(?:no|na)\s+campo\s+(.+))?$/i;
    let ultimoCampo = null;
    let comandosLigados = false;
    let recComando = null;

    document.addEventListener('focusin', function (e) {
        if (campos.indexOf(e.target) !== -1) ultimoCampo = e.target;
    });

    function semAcento(texto) {
        return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function campoPorNome(nome) {
        const alvo = semAcento(nome);
        return campos.find(function (c) { return semAcento(nomeDoCampo(c)).indexOf(alvo) !== -1; }) || null;
    }

    function mascoteEscrevendo(ligado) {
        const m = document.querySelector('mascote-ia');
        try { if (m && typeof m.tocar === 'function') m.tocar(ligado ? 'write' : 'idle'); } catch (e) { /* sem mascote */ }
    }

    function executarComando(fala) {
        const texto = fala.trim();
        const n = semAcento(texto);

        if (n === 'limpar campo' || n === 'proximo campo') {
            if (!ultimoCampo) { anunciar('Clique em um campo antes de dar esse comando.'); return; }
            if (n === 'limpar campo') {
                ultimoCampo.value = '';
                ultimoCampo.dispatchEvent(new Event('input', { bubbles: true }));
                anunciar('Campo ' + nomeDoCampo(ultimoCampo) + ' limpo.');
            } else {
                const i = campos.indexOf(ultimoCampo);
                const proximo = campos[(i + 1) % campos.length];
                proximo.focus();
                anunciar('Campo ' + nomeDoCampo(proximo) + '.');
            }
            return;
        }

        const m = texto.match(COMANDO_ESCREVA);
        if (!m) return; // fala que não é comando é ignorada

        const conteudo = m[1];
        const nomeDito = m[2] ? m[2].replace(/[.,!?]+$/, '') : null;
        const alvo = nomeDito ? campoPorNome(nomeDito) : ultimoCampo;
        if (!alvo) {
            anunciar(nomeDito ? 'Não encontrei o campo ' + nomeDito + '.' : 'Clique em um campo antes de dar esse comando.');
            return;
        }

        const anterior = alvo.value ? alvo.value.trimEnd() + ' ' : '';
        alvo.value = anterior + comPontuacao(conteudo).trim();
        alvo.dispatchEvent(new Event('input', { bubbles: true }));
        alvo.focus();
        ultimoCampo = alvo;

        mascoteEscrevendo(true);
        setTimeout(function () { mascoteEscrevendo(false); }, 2000);
        anunciar('Escrito no campo ' + nomeDoCampo(alvo) + '.');
    }

    let botaoComando = null;

    function iniciarEscuta() {
        if (!comandosLigados) return;
        const rec = new Reconhecimento();
        recComando = rec;
        rec.lang = 'pt-BR';
        rec.continuous = true;
        rec.interimResults = false;
        rec.onresult = function (evento) {
            for (let i = evento.resultIndex; i < evento.results.length; i++) {
                if (evento.results[i].isFinal) executarComando(evento.results[i][0].transcript);
            }
        };
        rec.onerror = function (evento) {
            if (evento.error === 'not-allowed' || evento.error === 'service-not-allowed') {
                desligarComandos('Permissão do microfone negada. Libere o microfone nas configurações do navegador.');
            }
        };
        rec.onend = function () {
            // O navegador encerra a escuta após um silêncio: religa enquanto o modo estiver ligado
            if (comandosLigados && recComando === rec) iniciarEscuta();
        };
        try {
            rec.start();
        } catch (e) {
            desligarComandos('Não foi possível iniciar os comandos de voz.');
        }
    }

    function ligarComandos() {
        comandosLigados = true;
        botaoComando.setAttribute('aria-pressed', 'true');
        botaoComando.textContent = 'Parar comando de voz';
        anunciar('Comando de voz ativo. Diga, por exemplo: escreva olá no campo nome.');
        iniciarEscuta();
    }

    function desligarComandos(motivo) {
        comandosLigados = false;
        const r = recComando;
        recComando = null;
        if (r) { try { r.stop(); } catch (e) { /* já parado */ } }
        if (botaoComando) {
            botaoComando.setAttribute('aria-pressed', 'false');
            botaoComando.textContent = 'Comando de voz';
        }
        mascoteEscrevendo(false);
        if (motivo) anunciar(motivo);
    }

    const grupoVoz = document.querySelector('#painel-acessibilidade .grupo-controles');
    if (grupoVoz && campos.length) {
        botaoComando = document.createElement('button');
        botaoComando.type = 'button';
        botaoComando.id = 'btnComandoVoz';
        botaoComando.textContent = 'Comando de voz';
        botaoComando.setAttribute('aria-pressed', 'false');
        grupoVoz.appendChild(botaoComando);
        botaoComando.addEventListener('click', function () {
            if (comandosLigados) desligarComandos('Comando de voz desligado.');
            else ligarComandos();
        });
    }
})();
