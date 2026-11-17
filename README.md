# EcoRota Acessível

Site sobre o descarte correto de lixo eletrônico e o reaproveitamento de aparelhos, feito para ser usado por pessoas com deficiência visual, auditiva, motora e cognitiva.

Atividade AV A1 (Projeto de Site, 2ª entrega), disciplina de Front-End, Curso Superior de Informática, UNICID.

## Links

- Site publicado: https://ecorota-seven.vercel.app
- Repositório: https://github.com/EcoRotaProjeto/U-UNICID-ADS-CC-ENG-FRONTEND-2260030-N8-2-2026-NT-EcoRota
- Arquivo da entrega: `EcoRota.zip`

## Equipe EcoLogic

| Nome | RGM |
|---|---|
| Caio Nabuosuke | 47646675 |
| Eduarda Amorim | 47575689 |
| Guilherme Couto | 47827149 |
| Henrique de Medeiros | 47636718 |
| Jenifer Rufino | 47556986 |
| Pedro Pinheiro | 47617110 |

## Objetivos

- Informar onde e como descartar lixo eletrônico com segurança.
- Oferecer coleta em casa para quem tem dificuldade de locomoção.
- Incentivar a doação de aparelhos que ainda funcionam para escolas e projetos sociais.
- Criar uma comunidade para troca e doação de peças.
- Ser um site acessível a todas as pessoas, seguindo a WCAG 2.1 nível AA.

O documento completo do projeto (contexto, público, escopo, cronograma e riscos) está em `docs/escopo.md`.

## Recursos de acessibilidade

O painel no topo de todas as páginas reúne as opções de acessibilidade:

| Necessidade | Recurso |
|---|---|
| Visual | Aumentar e diminuir o texto (A+ e A−), alto contraste, espaçamento de leitura e leitura da página em voz alta (Pausar, Continuar e Parar) |
| Motora / física | Botões maiores (mínimo de 48px), link para pular direto ao conteúdo, navegação completa pelo teclado e comandos de voz |
| Cognitiva | Pausar animações, mensagens de erro com instrução do que corrigir, textos em linguagem simples e rascunho salvo no formulário |
| Auditiva | Transcrição do podcast na página Mídia, vídeo com legendas gravadas e avisos visuais nos formulários |

### Comando de voz

Pelo painel, o microfone fica ligado por padrão em todas as páginas. Ele pode ser desligado pelo botão "Comando de voz" ou dizendo "desligar comandos". A escolha fica salva no navegador.

Comandos principais:

- `ajuda`: lista os comandos.
- `campo nome`: vai para o campo e lê o nome e o conteúdo.
- `escreva (Seu nome)`: escreve no campo atual. Também funciona com `escreva ... no campo nome`.
- `próximo campo` e `campo anterior`: troca de campo.
- `ler campo`, `limpar campo` e `ler página`.
- `ir para projetos`: vai para outra página do menu.
- `enviar formulário`, seguido de `confirmar envio` ou `cancelar`. O formulário nunca é enviado sem confirmação falada.
- Pontuação falada: "vírgula", "ponto", "ponto de interrogação", "ponto de exclamação" e "nova linha".

### Preencher formulário por voz

Dizendo "preencher formulário", o site pergunta cada campo na ordem da página:

- A pessoa responde com o valor. Em e-mails, diz "arroba" no lugar do @.
- Em listas, o site lê as opções e a pessoa escolhe uma.
- Em autorizações, diz "marcar".
- Em datas, diz a data por extenso, por exemplo "10 de dezembro de 2026".
- Depois de anotar, o site espera a pessoa dizer "pronto" para seguir. Com "corrigir", pergunta o campo de novo. Com "pular", passa para o próximo. Com "parar preenchimento", interrompe.

Se a pessoa pedir isso em uma página sem formulário, o site leva para Contato e começa lá.

### Equinho, o assistente

O Equinho é o mascote do site. Ele responde perguntas pelo chat, aponta os elementos da página e pode levar a pessoa para outra página. Suas respostas são geradas pela IA do Gemini, pelo arquivo `api/chat.js`, que roda na Vercel. Quando a pessoa pede para preencher um formulário, o próprio Equinho cuida do pedido, sem depender da IA.

## Páginas

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Apresentação, resumo do tema e menu principal |
| `sobre.html` | História, missão, visão e valores |
| `projetos.html` | Coleta em casa (endereço pelo CEP), pontos de descarte com busca e mapa, e doação |
| `impacto.html` | Dados, tabelas e resultados |
| `acessibilidade.html` | Medidas de inclusão e explicação dos recursos do site |
| `galeria.html` | Imagens com legendas e fontes |
| `midia.html` | Vídeo com legendas, podcast com transcrição e mapa |
| `noticias.html` | Notícias e artigos, com filtro |
| `contato.html` | Formulário validado, campo de telefone com DDD e equipe |
| `orcamento_hospedagem.html` | Comparativo de hospedagem e domínio |
| `comunidade.html` | Comunidade EcoRecicla, com contas e publicações no Firebase |

## Estrutura de pastas

```
EcoRota/
├── index.html e as outras páginas (11 HTML)
├── api/
│   └── chat.js                 backend do Equinho (IA, roda na Vercel)
├── css/
│   └── style.css               estilos de todas as páginas
├── js/
│   ├── script.js               formulários, CEP, busca de pontos e menu
│   ├── acessibilidade.js       painel, comandos de voz e preenchimento por voz
│   ├── escrita-voz.js          ditado nos campos de texto
│   ├── mascote.js              Equinho, o assistente
│   ├── telefone.js             campo de telefone com DDD
│   ├── comunidade.js           comunidade EcoRecicla
│   └── firebase-config.js      configuração do Firebase (sem segredos: a proteção é feita pelas regras)
├── sprites/
│   ├── mascote.png             quadros de animação do Equinho
│   └── mascote.json            índice dos quadros e das animações
├── img/                        imagens da galeria, logo e capa do vídeo
├── assets/                     vídeo e áudio da página Mídia
└── docs/                       documentação
```

## Como abrir

- **Site publicado:** basta acessar o link. Não precisa de configuração.
- **No computador:** rode um servidor local na pasta do projeto, por exemplo com `python3 -m http.server`, e acesse `http://localhost:8000`. Abrir o arquivo direto no navegador (`file://`) impede o carregamento do sprite do Equinho.
- **Chat do Equinho:** precisa da variável `GEMINI_API_KEY` configurada no painel da Vercel. Sem ela, o Equinho usa uma resposta reserva, sem IA.
- **Comunidade:** usa o Firebase do projeto `ecorota-6f64d`. O domínio do site precisa estar autorizado em Authentication > Domínios autorizados. Veja `docs/firebase_configuracao.md`.
- **Mapa, CEP e formulários:** usam Google Maps, ViaCEP e Formspree, e precisam de internet.

## Tecnologias

- HTML5, CSS3 e JavaScript puro.
- Web Speech API do navegador, para reconhecimento e síntese de voz.
- Tailwind CSS e Phosphor Icons, só na página da comunidade.
- Google Maps, ViaCEP e Formspree.
- Firebase (Authentication e Cloud Firestore) para a comunidade.
- Vercel para hospedagem e para a função `api/chat.js`.
- Gemini, para as respostas do Equinho.
- Aseprite, para os quadros do Equinho.
- Ferramentas de trabalho: VS Code, Git, GitHub, W3C Validator, Lighthouse, axe-core e Chrome DevTools.

## Testes de acessibilidade

- Lighthouse com nota 100 em acessibilidade.
- Leitura com NVDA (computador) e TalkBack (celular).
- Navegação completa pelo teclado, com foco visível.
- axe-core (WCAG 2.1 AA) na página de contato, sem problemas encontrados.
- Pendente, segundo `docs/evidencias_testes.md`: teste de zoom a 180% e de alto contraste.
- Os resultados estão em `docs/evidencias_testes.md`.

Os comandos de voz e o preenchimento por voz foram testados com fala simulada. Ainda precisam de teste com voz real, em Chrome e Edge, com pessoas que usam o site só pela voz.

## Limitações conhecidas

- Comandos de voz funcionam só no Chrome, no Edge e no Chrome do Android. No Firefox, o recurso não aparece.
- Na primeira vez, o navegador pede permissão para usar o microfone.
- O áudio do comando de voz é processado pelo serviço de reconhecimento do próprio navegador.
- Ainda não há tradução para Libras.

## Créditos

- Dados de lixo eletrônico: Global E-waste Monitor 2024 (ONU: ITU e UNITAR).
- Reciclagem de metais: BIR (Bureau of International Recycling), USGS, EuRIC e World Steel Association.
- Lista de pontos de descarte: Sucata Digital, cooperativas e universidades de São Paulo.

## Documentação

A pasta `docs/` tem:

- `escopo.md`: escopo, público, cronograma e riscos.
- `evidencias_testes.md`: resultados dos testes de acessibilidade.
- `melhorias_mvp.md`: melhorias feitas a partir do MVP.
- `firebase_configuracao.md` e `firestore.rules`: configuração do Firebase e regras de segurança.
- `orcamento_hospedagem.md`: comparativo de hospedagem e domínio.
- `entrega_integrantes.txt`: participação de cada integrante.
- `diario_de_bordo.md`: registro do andamento do projeto.
- `prints/`: capturas de tela do site em computador, tablet e celular.
