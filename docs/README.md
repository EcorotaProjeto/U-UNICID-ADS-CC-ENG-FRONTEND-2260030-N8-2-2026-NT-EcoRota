# EcoRota Acessível

Site sobre descarte correto de lixo eletrônico, com acessibilidade para pessoas com deficiência.
Atividade AV A1 (Projeto de Site, 2ª entrega) da disciplina de Front-End do Curso Superior de Informática da UNICID.

> Procure por `[PREENCHER` nos arquivos para achar tudo o que falta completar.

## Links

- Site publicado: https://ecorota-seven.vercel.app
- Repositório: https://github.com/EcoRotaProjeto/U-UNICID-ADS-CC-ENG-FRONTEND-2260030-N8-2-2026-NT-EcoRota
- Pasta do projeto: arquivo `EcoRota.zip`

## Equipe EcoLogic

| Nome | RGM | Função |
|---|---|---|
| Caio Nabuosuke | 047646675 | Lider e desenvolvedor Principal |
| Eduarda Amorim | 47575689 | Criação dos Slides e Validação do Escopo|
| Guilherme Couto | 47827149 | Criação do Esqueleto do Site |
| Henrique de Medeiros | 47636718 | Tester do site e Funcionalidades |
| Jenifer Rufino | 47556986 | Criação do Escopo |
| Pedro Pinheiro | 47617110 | Auxiliar de Desenvolvimento |

## Tema

Sustentabilidade e impacto social: descarte correto e reaproveitamento de eletrônicos, com inclusão de pessoas com deficiência (coleta em casa e site acessível).

## Objetivos

- Informar onde e como descartar lixo eletrônico com segurança.
- Oferecer coleta em casa para quem tem dificuldade de locomoção.
- Incentivar a doação de aparelhos que ainda funcionam para escolas e projetos sociais.
- Criar uma comunidade para troca e doação de peças.
- Ser um site acessível a todas as pessoas (WCAG 2.1 nível AA).

## Páginas

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Apresentação, resumo do tema e menu principal |
| `sobre.html` | História, missão, visão e valores |
| `projetos.html` | Coleta em casa, pontos de descarte, doação e comunidade |
| `impacto.html` | Dados, tabelas e resultados |
| `acessibilidade.html` | Medidas de inclusão para pessoas com deficiência |
| `galeria.html` | Imagens com legendas e fontes |
| `midia.html` | Vídeo, áudio e iframe |
| `noticias.html` | Notícias e artigos |
| `contato.html` | Dados fictícios, formulário validado e membros da equipe |
| `orcamento_hospedagem.html` | Comparativo de hospedagem e domínio |
| `comunidade.html` | Página extra: comunidade EcoRecicla |

## Estrutura de pastas

```
EcoRota/
├── index.html e as outras páginas
├── css/style.css          estilos de todas as páginas
├── js/script.js           acessibilidade, formulários, CEP e busca de pontos
├── js/comunidade.js       comunidade EcoRecicla
├── js/firebase-config.js  configuração do Firebase (sem segredos: a proteção é feita pelas regras)
├── img/                   imagens da galeria e capa do vídeo
├── assets/                vídeo e áudio da página Mídia
└── docs/                  documentação
```

No repositório do GitHub, o site está em um único arquivo, `index.html`, que reúne todas as páginas (o menu leva a cada seção pelo endereço com `#`). Esse é o arquivo publicado no Vercel.

## Como abrir

Abra o arquivo `index.html` no navegador, ou acesse o site publicado. Mapa, preenchimento por CEP, comunidade e Firebase precisam de internet. A comunidade usa o Firebase do projeto `ecorota-6f64d`, e o domínio do site precisa estar autorizado em Authentication > Domínios autorizados.

## Tecnologias

- HTML5, CSS3 e JavaScript: validação do formulário com mensagens de erro, rascunho salvo no localStorage, filtro de notícias e alto contraste.
- Tailwind CSS (só na página da comunidade), Phosphor Icons, Google Maps e ViaCEP.
- Firebase (Authentication e Cloud Firestore) para contas e publicações da comunidade. Veja `docs/firebase_configuracao.md`.
- Ferramentas: [PREENCHER: ex.: VS Code, Git e GitHub, W3C Validator, WAVE].

## Créditos

- Dados de lixo eletrônico: Global E-waste Monitor 2024 (ONU: ITU e UNITAR).
- Reciclagem de metais: BIR (Bureau of International Recycling), USGS, EuRIC e World Steel Association.
- Lista de pontos de descarte: Sucata Digital, cooperativas e universidades de São Paulo.
- Imagens: [PREENCHER: fonte de cada imagem da galeria].
