# Diário de bordo: EcoRota Acessível

> Registro das decisões, aprendizados e dificuldades da equipe. As entradas foram redigidas a partir do que o projeto passou; a equipe deve revisar o texto, completar as datas e ajustar com as próprias palavras.

## [15/09/2026] Primeira versão

- **O que fizemos:** primeira versão do site, com abas, a pergunta "Você é PcD?" e leitura em voz.
- **Decisão:** revisamos a ideia de perguntar se a pessoa é PcD.
- **Aprendizado:** a acessibilidade deve estar disponível para todos, sem exigir identificação. A deficiência também é dado pessoal sensível (LGPD).

## [17/09/2026] Correções de acessibilidade

- **O que fizemos:** painel de acessibilidade para todos (tamanho do texto, alto contraste e voz), navegação por teclado e foco visível.
- **Decisão:** a leitura em voz só começa quando a pessoa pede, para não atrapalhar leitores de tela.
- **Dificuldade:** o aumento de fonte não afetava todos os elementos. Resolvemos usando unidades `rem`.

## [18/09/2026] Pontos de descarte e pesquisa

- **O que fizemos:** lista de pontos reais em São Paulo, mapa e pesquisa por CEP, estado, cidade, bairro e endereço.
- **Aprendizado:** a API ViaCEP preenche o endereço a partir do CEP, o que reduz erros de digitação.

## [21/09/2026] Comunidade EcoRecicla

- **O que fizemos:** integração da comunidade ao site.
- **Dificuldade:** o Tailwind mudava o visual das outras páginas. Limitamos o Tailwind à área da comunidade.
- **Decisão:** a classificação por IA foi trocada por uma classificação por palavras-chave, porque dependia de uma chave de API.

## [22/09/2026] Divisão em 11 páginas

- **O que fizemos:** separamos o site em 11 páginas (a atividade pede 10, e a equipe incluiu a Comunidade), com CSS e JS em arquivos próprios.
- **Aprendizado:** páginas separadas facilitam a manutenção, mas o menu e o rodapé precisam ser iguais em todas.
- **Dificuldade:** manter os links e o menu consistentes sempre que uma página mudava de nome ou de lugar.

## [20/10/2026] Publicação e versão de arquivo único

- **O que fizemos:** o site foi publicado no Vercel e reunido em um único arquivo (`index.html`), que contém todas as páginas, com os textos, o vídeo e o áudio.
- **Decisão:** o arquivo único facilita a publicação, porque não depende de pastas extras no servidor. A versão com pastas continua no pacote do projeto.
- **Dificuldade:** a página abria só com o conteúdo principal quando o servidor não encontrava a pasta `css/`. Conferimos os caminhos e reunimos tudo em um arquivo.
- **Aprendizado:** o domínio do site precisa estar autorizado no Firebase para o login da comunidade funcionar fora do computador.

## [04/11/2026] Mídia: vídeo e podcast

- **O que fizemos:** vídeo e podcast da equipe na página Mídia, com títulos e transcrição do conteúdo falado.
- **Decisão:** o vídeo foi comprimido para 720p, para a página carregar mais rápido. O podcast foi convertido para MP3.
- **Aprendizado:** conteúdo com áudio precisa de transcrição para pessoas surdas, e o vídeo precisa de legenda.

## [06/11/2026] Testes e validação

- **O que fizemos:** testamos o fluxo do Firebase com uma simulação (criar conta, publicar, votar e modo demonstração sem internet).
- **Problemas encontrados:** o ambiente de desenvolvimento não tinha acesso aos serviços do Google, então não foi possível testar o Firebase real por lá. Também percebemos que abrir o arquivo direto pelo navegador (`file:///`) pode bloquear o login.
- **Como resolvemos:** usamos a simulação para validar a lógica e pedimos que a equipe testasse no navegador. Para o login, orientamos a abrir o site pelo Live Server ou pelo endereço publicado.

## [27/09/2026] Firebase na comunidade

- **O que fizemos:** contas reais com e-mail e senha (Firebase Authentication) e publicações e votos salvos na nuvem (Cloud Firestore), atualizando em tempo real para todos.
- **Decisão:** se o Firebase não estiver configurado ou sem internet, a comunidade continua funcionando em modo demonstração, salvando no navegador.
- **Segurança:** as regras do Firestore (`docs/firestore.rules`) garantem que só quem está logado publica, que só o autor exclui a própria publicação e que cada voto muda o contador de 1 em 1.
- **Aprendizado:** a configuração do Firebase não é secreta. A proteção dos dados vem das regras do banco.

## Uso de IA

- **Ferramenta:** Claude (assistente de IA), usado para escrever e revisar o código, depurar erros, montar a configuração do Firebase e revisar a documentação.
- **Prompts usados:** ["Com base a atividade, qual tema deveríamos seguir?", "Faça o site responsivo para todos os aparelhos", "Deixe o site mais acessivel com base as exigencias da w3c accessibility"]
- **Aceito:** a estrutura das regras do Firestore, revisada depois pela equipe.
- **Corrigido:** o diálogo de conta ficou centralizado de forma errada por causa do reset de margens; o atributo `hidden` foi sobrescrito por classes de layout e foi corrigido com uma regra específica.
- **Recusado:** a sugestão de classificar os pontos de descarte por IA, porque dependia de uma chave de API. Trocamos por palavras-chave.
