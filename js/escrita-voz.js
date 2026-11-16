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

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && ativo) parar('Ditado parado.');
    });

})();
