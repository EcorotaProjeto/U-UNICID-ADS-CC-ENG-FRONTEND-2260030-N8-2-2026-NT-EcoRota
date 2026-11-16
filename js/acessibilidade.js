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
})();
