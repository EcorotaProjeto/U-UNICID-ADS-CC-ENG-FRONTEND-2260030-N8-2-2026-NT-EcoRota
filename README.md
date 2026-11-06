# EcoRota Acessível

Site sobre descarte correto de lixo eletrônico, com acessibilidade para pessoas com deficiência.
Atividade AV A1 (Projeto de Site, 2ª entrega) da disciplina de Front-End do Curso Superior de Informática da UNICID.

## Links

- Site publicado: https://ecorota-seven.vercel.app
- Repositório: https://github.com/EcoRotaProjeto/U-UNICID-ADS-CC-ENG-FRONTEND-2260030-N8-2-2026-NT-EcoRota
- Pasta do projeto: arquivo `EcoRota.zip`

## Equipe EcoLogic

| Nome | RGM |
|---|---|---|
| Caio Nabuosuke | 047646675 |
| Eduarda Amorim | 47575689 |
| Guilherme Couto | 47827149 |
| Henrique de Medeiros | 47636718 |
| Jenifer Rufino | 47556986 |
| Pedro Pinheiro | 47617110 |

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

## Escolpo

_Documento de Escopo - Projeto EcoRota_

### 1. Identificação
  Nome da equipe: Ecologic.
  Nome do projeto/site: EcoRota.
  Integrantes: Caio Nabosuke, Eduarda Amorim, Guilherme Couto, Henrique de Medeiros, Jenifer Freire Rufino, Pedro Pinheiro. 
  Data: 23 de setembro de 2026.
  Professor/disciplina: Prof. Paulo Fratta/ Desenvolvimento Front-End para Web.
  
### 2. Contexto e Justificativa </h3>
  *Qual problema social ou ambiental o site aborda?* O site aborda o descarte inadequado de lixo eletrônico e a falta de informação sobre a reciclagem de componentes metálicos.
  
  *Por que esse tema é relevante?* O descarte incorreto de eletrônicos libera substâncias tóxicas na natureza. A reciclagem de metais (como alumínio e cobre) evita a mineração predatória e gera uma economia massiva de energia (chegando a 95% no caso do alumínio), minimizando a pegada de carbono.
  
  *Qual a relação com sustentabilidade e impacto social?* Promove a economia circular, preserva os recursos naturais e conscientiza a sociedade sobre o consumo responsável, alinhando-se aos Objetivos de Desenvolvimento Sustentável (ODS) da ONU.

### 3. Objetivos
  _Geral:_ Informar e engajar a população sobre a importância da reciclagem de lixo eletrônico, fornecendo caminhos práticos para o descarte ecológico.
  
  _Específicos:_
  
  - Educar os usuários sobre os impactos ambientais dos metais presentes nos eletrônicos;
  
  - Mapear e indicar pelo menos 5 pontos de coleta de lixo eletrônico certificados;
  
  - Apresentar um guia prático em passos de como preparar os aparelhos antes do descarte (ex: apagar dados, separar baterias);
  
  - Disponibilizar um canal de contato acessível para tirar dúvidas.

### 4. Público-Alvo
  _Quem vai acessar o site?_ Pessoas comuns que possuem eletrônicos quebrados ou defasados em casa, além de estudantes e pequenas empresas buscando soluções de descarte.
  
  _Faixa etária, localização, necessidades específicas:_ O site será destinado a qualquer pessoa que consuma ou utilize tecnologia, independentemente da idade, com foco inicial de mapeamento para residentes na Zona Norte/SP.
  O site atenderá usuários que dependem de leitores de tela (deficiência visual), navegação via teclado (deficiência motora) e exigem alto contraste (baixa visão ou daltonismo).

### 5. Escopo Funcional
  Lista das 10 páginas e suas funções:
  - Início: Visão geral do projeto, destaques de conteúdo e chamadas para ação.
  - Sobre: Página que apresentará o projeto EcoRota, seus objetivos, o motivo da criação do site e os integrantes da equipe.
  - Projetos: Página destinada a apresentar projetos e ações relacionados ao descarte, reciclagem e reaproveitamento de eletrônicos.
  - Impacto: Página que explicará os impactos causados pelo descarte incorreto de eletrônicos e a importância da reciclagem.
  - Acessibilidade: Página com informações e recursos para facilitar a utilização do site. O site terá recursos como: Aumentar o tamanho do texto; Diminuir o tamanho do texto; Ativar alto contraste; Recurso de leitura por voz; Navegação simples.
  - Galeria: Página com imagens relacionadas ao projeto e ao descarte de eletrônicos.Poderá apresentar imagens de aparelhos, reciclagem, pontos de coleta e ações relacionadas ao projeto.
  - Mídia: Página destinada a vídeos e outros materiais informativos relacionados ao desperdício de eletrônicos e à reciclagem.
  - Notícias: Página para apresentar notícias e informações relacionadas à tecnologia, reciclagem, meio ambiente e descarte de eletrônicos.
  - Comunidade: Página destinada à participação dos usuários. Poderá apresentar dicas, sugestões, relatos e informações compartilhadas pela comunidade.
  - Contato:Página para o usuário entrar em contato com a equipe. Terá um formulário simples com campos como: Nome; E-mail; Assunto; Mensagem. 
  - Orçamento: Página destinada a apresentar uma estimativa simples dos custos relacionados ao desenvolvimento e manutenção do projeto.
  - Navegação e Recursos adicionais: Menu de navegação principal (header) padronizado em todas as páginas e rodapé (footer) com links rápidos.

### 6. Escopo Não Funcional
  _Acessibilidade:_ Uso rigoroso de atributos alt em imagens, validação de contraste de cores, suporte completo à navegação por teclado e marcações ARIA para leitores de tela.
  
  _Sustentabilidade:_ Design minimalista para economizar processamento e energia, escolha de provedor de hospedagem verde (se aplicável), e forte otimização de imagens (uso de SVG e WebP).
  
  _Responsividade:_ Abordagem Mobile First, garantindo fluidez e adaptação perfeita entre telas de celular, tablet e desktop via media queries.
  
  _Desempenho:_ Estrutura de HTML limpa e semântica, arquivos CSS e JS minificados para carregamento rápido.
  SEO básico: Implementação de tags `<title>`, `<meta name="description">` exclusivas por página e uso hierárquico correto das tags de título (`<h1>` a `<h6>`).

### 7. Mapa do Site
  • Início
  
  • Sobre
  
  • Projetos
  
  • Impacto
  
  • Acessibilidade
  
  • Galeria
  
  • Mídia
  
  • Notícias
  
  • Comunidade
  
  • Contato
  
  • Orçamento

### 8. Conteúdo e Identidade Visual
  _Tom de voz:_ Educativo, inspirador, claro, e sem jargões excessivamente técnicos, buscando gerar empatia e ação.
  
  _Cores Principais:_ Baseadas na paleta do projeto, remetendo à tecnologia e natureza.
  
  _Primária:_ #004958 (Azul/Verde escuro);
  
  _Secundária:_ #1a636e (Tom intermediário);

 _Destaque (Accent):_ #27B1A1 (Verde água para botões e links).
  
  _Tipografia:_ Fontes sem serifa limpas e de alta legibilidade.
  
  _Fontes das imagens:_ Serão utilizados gráficos autorais desenvolvidos pela equipe e fotografias retiradas de bancos de imagens gratuitos, e livres de direitos (ex: Unsplash, Pexels), com a devida indicação de fonte.

### 9. Tecnologias e Ferramentas
  _Linguagens:_ HTML5, CSS3 e JavaScript.
  
  _Ferramentas de Desenvolvimento:_ Visual Studio Code (VS Code).
  
  _Controle de Versão:_ Git e GitHub.
  
  _Validação:_ W3C Markup Validation Service e ferramentas como Lighthouse para auditoria de acessibilidade.

### 10. Cronograma e Divisão de Tarefas
  _Setembro:_ Definição e entrega do Escopo; Criação dos Wireframes/Interface.
  
  _Outubro:_ Desenvolvimento do código Front-end (Estruturação HTML e Estilização CSS das 10 páginas).
  
  _Novembro:_ Implementação de JavaScript básico, testes rigorosos de acessibilidade e responsividade e ajustes finais e apresentação do site finalizado para a classe.
  Funções:
  
  • _Documentação:_ Eduarda Amorim e Jennifer Rufino;
  
  • _Criação do Site:_ Caio Kenji;
  
  • _Auxiliar:_ Henrique de Medeiros e Guilherme Couto;
  
  • _Apresentação:_ Pedro Pinheiro.
  
  • _Gestão:_ Utilização do Trello para acompanhamento no formato Kanban (A Fazer, Fazendo, Concluído).

### 11. Riscos e Restrições
  _O que pode atrasar a entrega:_ Dificuldades técnicas ou curva de aprendizado durante a implementação do layout no código, possíveis desencontros de horário entre os membros da equipe.
  
  _Restrições:_ O projeto é limitado aos conhecimentos práticos e teóricos exigidos até o 2º semestre do curso. O foco rigoroso deve se manter na entrega da interface front-end funcional, sem a exigência de um banco de dados real no back-end no momento.

### 12. Critérios de Aceitação
  - O site possuir exatamente 10 páginas navegáveis interligadas;
  
  - O código HTML e CSS deve passar sem erros críticos no validador W3C;
  
  - As regras de acessibilidade (WCAG básicas) e responsividade devem funcionar nos testes práticos;
  
  - O formulário da página de Contato deve possuir validação front-end (avisos de campos obrigatórios).

### 13. Aprovação
_Responsável pela validação do escopo: Eduarda Amorim de Almeida_

_Data de aprovação: 23 / 09 / 2026_
