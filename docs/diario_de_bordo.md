# Diário de bordo: EcoRota Acessível

> Registre aqui as decisões, aprendizados e dificuldades da equipe. As entradas abaixo resumem decisões já tomadas no projeto; ajuste as datas e o texto com as palavras da equipe.

## [PREENCHER: data] Primeira versão

- **O que fizemos:** primeira página com abas, pergunta "Você é PcD?" e leitura em voz.
- **Decisão:** revisamos a ideia de perguntar se a pessoa é PcD.
- **Aprendizado:** acessibilidade deve estar disponível para todos, sem exigir identificação. Deficiência também é dado pessoal sensível (LGPD).

## [PREENCHER: data] Correções de acessibilidade

- **O que fizemos:** painel de acessibilidade para todos (tamanho do texto, alto contraste, voz), navegação por teclado e foco visível.
- **Decisão:** a leitura em voz só começa quando a pessoa pede, para não atrapalhar leitores de tela.
- **Dificuldade:** o aumento de fonte não afetava todos os elementos; resolvemos usando unidades rem.

## [PREENCHER: data] Pontos de descarte e pesquisa

- **O que fizemos:** lista de pontos reais em São Paulo, mapa e pesquisa por CEP, estado, cidade, bairro e endereço.
- **Aprendizado:** uso da API ViaCEP para preencher o endereço a partir do CEP.

## [PREENCHER: data] Comunidade EcoRecicla

- **O que fizemos:** integração da comunidade ao site.
- **Dificuldade:** o Tailwind mudava o visual das outras páginas; limitamos o Tailwind à área da comunidade.
- **Decisão:** a classificação por IA foi trocada por uma classificação por palavras-chave, porque dependia de uma chave de API.

## [PREENCHER: data] Divisão em 10 páginas

- **O que fizemos:** separamos o site nas 10 páginas pedidas na atividade, com CSS e JS em arquivos próprios.
- **Aprendizado:** [PREENCHER]
- **Dificuldade:** [PREENCHER]

## [PREENCHER: data] Testes e validação

- **O que fizemos:** [PREENCHER]
- **Problemas encontrados:** [PREENCHER]
- **Como resolvemos:** [PREENCHER]

## [PREENCHER: data] Firebase na comunidade

- **O que fizemos:** contas reais com e-mail e senha (Firebase Authentication) e publicações e votos salvos na nuvem (Cloud Firestore), atualizando em tempo real para todos.
- **Decisão:** se o Firebase não estiver configurado ou sem internet, a comunidade continua funcionando em modo demonstração, salvando no navegador.
- **Segurança:** as regras do Firestore (`docs/firestore.rules`) garantem que só quem está logado publica, que só o autor exclui a própria publicação e que cada voto muda o contador de 1 em 1.
- **Aprendizado:** a configuração do Firebase não é secreta; a proteção dos dados vem das regras do banco.
