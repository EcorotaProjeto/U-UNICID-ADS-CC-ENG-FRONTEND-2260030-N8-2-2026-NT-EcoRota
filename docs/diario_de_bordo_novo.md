# Diário de bordo: EcoRota Acessível

> Registro das decisões, aprendizados e dificuldades da equipe, do início da conversa com a IA até a entrega. As datas vêm do histórico de commits do GitHub. Quando uma atividade não tem commit, a data é a da conversa. A equipe deve revisar o texto e ajustar com as próprias palavras.

## [09/11/2026] Entrega da 2ª etapa e documentação

- **O que fizemos:** finalizamos o escopo (`docs/escopo.md`) e o PDF dele, atualizamos o `melhorias_mvp.md` e preenchemos as linhas de NVDA e TalkBack em `evidencias_testes.md`. Subimos a versão final do site e do zip da entrega.
- **Dificuldade:** a entrega estava marcada para o início da aula de 09/11 e ficou atrasada, com desconto de 0,50 por dia de atraso, conforme a atividade.
- **Decisão:** a documentação passou a ser a fonte da verdade. Textos que não tinham base no projeto foram marcados como `[PREENCHER]` em vez de inventados.
- **Aprendizado:** conferir os números e os testes com dados reais, e não com o que parece correto.

## [10/11/2026] Vídeo, podcast e validação de formulários

- **O que fizemos:** o podcast ganhou transcrição completa na página Mídia. A miniatura do vídeo (`poster-video.png`) foi recortada e enviada. Criamos o `telefone.js`, que valida o telefone com código do país e DDD.
- **Dificuldade:** o arquivo da miniatura foi enviado com o nome `Poster-video.png`, com maiúscula, e a página não encontrava a imagem. No GitHub, o nome é sensível a maiúsculas. O `telefone.js` também foi enviado para a raiz em vez da pasta `js/`, e a validação não funcionou até ser movido.
- **Decisão:** o campo de telefone passou a ser um único componente, com país, DDD e número. Antes eram três campos soltos.
- **Aprendizado:** antes de subir um arquivo, conferir o nome exato e a pasta de destino.

## [12/11/2026] Arquivos apagados no `main`

- **O que fizemos:** a equipe reorganizou o repositório e trocou a API de IA do chat, de Claude para Gemini (`api/chat.js`). Também renomeamos o `index.html` e movemos o `mascote.js` para `js/`.
- **Dificuldade:** em 12/11 o `js/script.js` foi apagado do `main` (commit `8411a81`), mas as 11 páginas continuavam chamando esse arquivo. Com isso, o site perdeu a validação dos formulários, o CEP, o rascunho salvo, o painel de acessibilidade e a busca de pontos.
- **Decisão:** antes de apagar um arquivo, conferir se alguma página ainda o usa.
- **Aprendizado:** remover um arquivo compartilhado quebra o site inteiro sem gerar erro visível para quem está editando.

## [13/11/2026] Restauração de arquivos

- **O que fizemos:** a equipe subiu novamente os arquivos que faltavam (três uploads, entre 19h33 e 19h39).
- **Dificuldade:** o site ficou dependente de uploads manuais pelo GitHub, o que facilita erros de versão.

## [16/11/2026] Acessibilidade: do painel aos comandos de voz

Este foi o dia mais longo do projeto. Sequência do que foi feito:

1. **Restauração do `js/script.js`.** A equipe subiu o arquivo de volta, com o mesmo conteúdo de antes (conferido por hash).
2. **Novos recursos no painel.** Espaçamento de leitura, botões maiores (48px) e pausar animações. Testados no navegador em computador e celular.
3. **Mascote com lápis.** Criamos a animação `write` a partir do desenho enviado pela equipe e adicionamos ao sprite do Equinho.
4. **Comandos de voz.** Escrever em campos ("escreva ... no campo ..."), trocar de campo, ler campo e página, ir para outra página, enviar com confirmação falada e desligar.
5. **Preencher formulário por voz.** O Equinho pergunta cada campo em voz alta, espera o "pronto" para seguir e aceita "corrigir" e "pular".
6. **Pedido vindo do chat.** A IA passou a reconhecer o pedido de preenchimento. Como ela ainda recusava às vezes, o próprio Equinho passou a tratar esse pedido antes de chamar a IA.
7. **Microfone sempre ligado.** O modo "Mãos livres" do Equinho foi removido, porque ficava em conflito com o comando de voz da página.
8. **README e zip.** README reescrito do zero, com a equipe, as páginas, os recursos novos e as limitações. Zip com a versão atual para a entrega.

- **Decisões principais:**
  - O formulário nunca é enviado por comando de voz sem confirmação falada.
  - A voz e o microfone só começam por pedido ou pelo comando ligado pela própria pessoa.
  - O Equinho não inventa dados pessoais: quem responde é sempre a pessoa.
  - O áudio do comando de voz é processado pelo reconhecimento do próprio navegador. O site não grava nem envia a voz para os servidores da equipe.
- **Dificuldades:**
  - Dois reconhecimentos de voz (o do Equinho e o do comando de página) disputavam o microfone e davam erro.
  - A fala do Equinho era cortada quando outra fala começava, porque o código de voz cancelava a fala anterior.
  - Depois de uma resposta, o Equinho avançava sozinho para o próximo campo, e palavras soltas podiam ser gravadas no campo.
  - Os uploads da equipe e as mudanças feitas por mim em paralelo geraram conflitos. Por isso, o zip final foi montado a partir da versão atual do `main`.
  - Em páginas sem formulário, o pedido de preenchimento se perdia ao mudar de página. Passou a ser guardado e retomado na página de Contato.
- **Aprendizado:** testes com fala simulada encontram muitos erros, mas não substituem o teste com voz real.
- **Pendências:**
  - Testar os comandos de voz com pessoas que usam o site só pela voz.
  - Confirmar as legendas do vídeo da página Mídia (a tag `<track>` está vazia).
  - Corrigir o texto da página Acessibilidade, que cita uma versão em linguagem simples que ainda não existe.
  - Testes de zoom a 180% e de alto contraste, que ainda estão marcados como pendentes.
  - Avaliar a inclusão de Libras (vídeo com intérprete ou VLibras). Não foi possível testar o VLibras no ambiente de trabalho.

## Uso de IA neste projeto

- **Ferramenta:** Claude, usado para revisar código, escrever os recursos de acessibilidade, montar a documentação e fazer testes automatizados no navegador.
- **O que foi conferido pela equipe:** todo texto e todo código foram revisados pelos integrantes antes de subir. Os testes de voz precisam ser feitos com pessoas reais.
