# Escopo do Projeto: EcoRota Acessível

## 1. Identificação

- **Nome da equipe:** EcoLogic
- **Nome do projeto/site:** EcoRota Acessível
- **Integrantes:** Caio Nabuosuke (RGM 047646675); Eduarda Amorim (RGM 47575689); Guilherme Couto (RGM 47827149); Henrique de Medeiros (RGM 47636718); Jenifer Rufino (RGM 47556986); Pedro Pinheiro (RGM 47617110)
- **Data:** [PREENCHER]
- **Professor(a)/disciplina:** Prof. Paulo Fratta / Front-End (turma ADS/Noite)

## 2. Contexto e justificativa

- **Problema:** o lixo eletrônico cresce muito mais rápido que a reciclagem. Em 2022, o mundo gerou 62 milhões de toneladas, e só 22,3% foi coletado e reciclado corretamente (Global E-waste Monitor 2024). Muitas pessoas não sabem onde descartar, e quem tem dificuldade de locomoção não consegue levar aparelhos até um ponto de coleta.
- **Relevância:** eletrônicos descartados no lixo comum contaminam solo e água, e materiais valiosos são desperdiçados.
- **Relação com sustentabilidade e impacto social:** o site incentiva o descarte correto e o reuso (sustentabilidade) e garante acesso a pessoas com deficiência, além de doar aparelhos a escolas e projetos sociais (impacto social).

## 3. Objetivos

- **Geral:** facilitar o descarte correto e o reaproveitamento de eletrônicos, de forma acessível a todas as pessoas.
- **Específicos (mensuráveis):**
  1. Publicar um site com 11 páginas navegáveis e sem erros no W3C Validator.
  2. Listar pelo menos 14 pontos de descarte em São Paulo, com busca por CEP, bairro e cidade.
  3. Oferecer 3 formulários validados: coleta em casa, doação e contato.
  4. Atender aos critérios da WCAG 2.1 nível AA verificados na página de evidências de testes.
  5. [PREENCHER: outro objetivo da equipe]

## 4. Público-alvo

- Moradores de São Paulo que querem descartar ou doar eletrônicos.
- Faixa etária: [PREENCHER: ex.: a partir de 16 anos, incluindo pessoas idosas].
- **Público prioritário:** pessoas com deficiência (visual, auditiva, motora e intelectual) e pessoas com dificuldade de locomoção.
- Escolas, ONGs e cooperativas que recebem aparelhos.

## 5. Escopo funcional

| Página | Função |
|---|---|
| index.html | Apresentação e menu principal |
| sobre.html | História, missão, visão e valores |
| projetos.html | Coleta em casa, pontos de descarte com busca e mapa, doação |
| impacto.html | Dados e resultados em tabelas |
| acessibilidade.html | Recursos de acessibilidade e como usar |
| galeria.html | Imagens com legenda e fonte |
| midia.html | Vídeo com legenda, áudio com transcrição e mapa (iframe) |
| noticias.html | Artigos sobre descarte correto |
| contato.html | Contato, formulário validado e equipe |
| orcamento_hospedagem.html | Comparativo de hospedagem e domínio |
| comunidade.html (extra) | Fórum para troca e doação de peças |

Navegação principal presente em todas as páginas, com indicação da página atual.

## 6. Escopo não funcional

- **Acessibilidade:** textos alternativos, contraste AA, modo alto contraste, ajuste do tamanho do texto, navegação por teclado, link para pular ao conteúdo, compatibilidade com leitores de tela, ARIA quando necessário, legendas e transcrições.
- **Sustentabilidade:** conteúdo educativo, hospedagem verde na escolha do orçamento, imagens leves.
- **Responsividade:** celular, tablet e computador.
- **Desempenho:** imagens otimizadas, CSS e JS em arquivos separados, carregamento tardio (lazy) de imagens e mapas.
- **SEO básico:** título e meta descrição em cada página, hierarquia de títulos h1 a h3.

## 7. Mapa do site

```
index.html
├── sobre.html
├── projetos.html
│   ├── #coleta
│   ├── #pontos
│   ├── #doacao
│   └── comunidade.html
├── impacto.html
├── acessibilidade.html
├── galeria.html
├── midia.html
├── noticias.html
├── contato.html (#equipe)
└── orcamento_hospedagem.html
```

Todas as páginas se ligam pelo menu principal; o rodapé leva a Acessibilidade, Contato e Orçamento.

## 8. Conteúdo e identidade visual

- **Tom de voz:** simples, direto e acolhedor.
- **Cores:** verde (#2e7d32 e #1b5e20) para sustentabilidade, azul (#01579b) para ações de coleta, fundo verde-claro (#f0f7f0).
- **Tipografia:** Arial (alta legibilidade); Inter na comunidade.
- **Logotipo:** criado pela equipe. Um alfinete de mapa verde (a "rota" até o descarte certo) com duas folhas (sustentabilidade) cujas nervuras terminam em pontos, como trilhas de circuito (eletrônicos). Aparece no cabeçalho, no rodapé e como ícone da aba do navegador. Arquivos: `img/logo.png`, `img/favicon.png` e `img/icone-180.png`.
- **Fontes:** dados com fonte indicada; imagens com autoria na galeria.

## 9. Tecnologias e ferramentas

HTML5, CSS3, JavaScript, [PREENCHER: editor, controle de versão, validadores].

## 10. Cronograma e divisão de tarefas

| Etapa | Data | Responsável |
|---|---|---|
| Escopo | [PREENCHER] | [PREENCHER] |
| Estrutura HTML das páginas | [PREENCHER] | [PREENCHER] |
| CSS e identidade visual | [PREENCHER] | [PREENCHER] |
| Conteúdo e imagens | [PREENCHER] | [PREENCHER] |
| Testes de acessibilidade e validação | [PREENCHER] | [PREENCHER] |
| Documentação e entrega | [PREENCHER] | [PREENCHER] |

Ferramenta de gestão: [PREENCHER: ex.: Trello, Notion].

## 11. Riscos e restrições

- Prazo curto e conciliação com outras disciplinas.
- Pouca experiência da equipe com acessibilidade e validação W3C.
- Mapa, CEP e comunidade dependem de serviços externos e de internet.
- [PREENCHER: outros riscos]

## 12. Critérios de aceitação

- 11 páginas navegáveis e interligadas.
- Formulários com validação HTML5 (required, email, tel, date, number, pattern, label for).
- Vídeo, áudio e iframe funcionando.
- Acessibilidade aplicada e testada.
- Código sem erros no W3C Validator.
- Documentação completa na pasta /docs.

## 13. Aprovação

- **Responsável pela validação:** [PREENCHER]
- **Data:** [PREENCHER]
- **Assinatura:** [PREENCHER]
