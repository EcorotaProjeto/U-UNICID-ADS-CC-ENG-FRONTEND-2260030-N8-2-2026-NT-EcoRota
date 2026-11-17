# Escopo do Projeto: EcoRota Acessível

> Versão atualizada em 16/11/2026. A versão original é de 09/11/2026. As mudanças estão marcadas em **Atualização** nas seções correspondentes.

## 1. Identificação

- **Nome da equipe:** EcoLogic
- **Nome do projeto/site:** EcoRota Acessível
- **Integrantes:** Caio Nabuosuke (RGM 047646675); Eduarda Amorim (RGM 47575689); Guilherme Couto (RGM 47827149); Henrique de Medeiros (RGM 47636718); Jenifer Rufino (RGM 47556986); Pedro Pinheiro (RGM 47617110)
- **Data de criação:** 15/09/2026
- **Última atualização:** 16/11/2026
- **Professor(a)/disciplina:** Prof. Paulo Fratta / Front-End (turma ADS/Noite)

## 2. Contexto e justificativa

- **Problema:** o lixo eletrônico cresce muito mais rápido que a reciclagem. Em 2022, o mundo gerou 62 milhões de toneladas, e só 22,3% foi coletado e reciclado corretamente (Global E-waste Monitor 2024). Muitas pessoas não sabem onde descartar, e quem tem dificuldade de locomoção não consegue levar aparelhos até um ponto de coleta.
- **Relevância:** eletrônicos descartados no lixo comum contaminam solo e água, e materiais valiosos são desperdiçados.
- **Relação com sustentabilidade e impacto social:** o site incentiva o descarte correto e o reuso (sustentabilidade) e garante acesso a pessoas com deficiência, além de doar aparelhos a escolas e projetos sociais (impacto social).

## 3. Objetivos

- **Geral:** facilitar o descarte correto e o reaproveitamento de eletrônicos, de forma acessível a todas as pessoas.
- **Específicos (mensuráveis):**
  1. Publicar um site com 11 páginas navegáveis e validar o HTML e o CSS no W3C Validator.
  2. Listar pelo menos 14 pontos de descarte em São Paulo, com busca por CEP, bairro e cidade.
  3. Oferecer 3 formulários validados: coleta em casa, doação e contato.
  4. Atender aos critérios da WCAG 2.1 nível AA verificados na página de evidências de testes.
  5. **Atualização:** oferecer recursos de acessibilidade para pessoas com deficiência visual, auditiva, motora e cognitiva, incluindo comandos de voz para quem não consegue usar as mãos.

## 4. Público-alvo

- Moradores de São Paulo que querem descartar ou doar eletrônicos.
- Faixa etária: sem faixa etária definida.
- **Público prioritário:** pessoas com deficiência (visual, auditiva, motora e intelectual) e pessoas com dificuldade de locomoção.
- Escolas, ONGs e cooperativas que recebem aparelhos.

## 5. Escopo funcional

| Página | Função |
|---|---|
| index.html | Apresentação e menu principal |
| sobre.html | História, missão, visão e valores |
| projetos.html | Coleta em casa (endereço pelo CEP), pontos de descarte com busca e mapa, doação |
| impacto.html | Dados e resultados em tabelas |
| acessibilidade.html | Recursos de acessibilidade e como usar |
| galeria.html | Imagens com legenda e fonte |
| midia.html | Vídeo, áudio com transcrição e mapa (iframe) |
| noticias.html | Artigos sobre descarte correto |
| contato.html | Contato, formulário validado e equipe |
| orcamento_hospedagem.html | Comparativo de hospedagem e domínio |
| comunidade.html (extra) | Comunidade EcoRecicla para troca e doação de peças |

Navegação principal presente em todas as páginas, com indicação da página atual.

**Atualização: recursos presentes em todas as páginas**

- **Painel de acessibilidade:** aumentar e diminuir o texto (A+ e A−), alto contraste, espaçamento de leitura, botões maiores (48px), pausar animações e leitura da página em voz alta.
- **Comandos de voz:** ligados por padrão, com comandos para escrever em campos, trocar de campo, ler campo e página, ir para outra página e enviar o formulário com confirmação falada.
- **Preenchimento por voz:** o Equinho pergunta cada campo do formulário, espera a pessoa dizer "pronto" e aceita "corrigir" e "pular".
- **Equinho, o assistente:** responde perguntas pelo chat, aponta elementos da página e leva a pessoa para outra página. As respostas são geradas por IA (Gemini) pelo arquivo `api/chat.js`.

## 6. Escopo não funcional

- **Acessibilidade:** textos alternativos, contraste AA, alto contraste, ajuste do tamanho do texto, espaçamento de leitura, navegação por teclado, link para pular ao conteúdo, compatibilidade com leitores de tela, ARIA quando necessário, legendas e transcrições.
- **Atualização: acessibilidade por voz:** os comandos de voz usam o reconhecimento do próprio navegador. Funcionam no Chrome, no Edge e no Chrome do Android. O Firefox não tem essa função, e nesse caso o recurso não aparece.
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
- **Mascote:** o Equinho, desenhado pela equipe, com animações de repouso, fala, apontar, pensar e escrever (com lápis).
- **Fontes:** dados com fonte indicada; imagens com autoria na galeria ("acervo da equipe EcoRota, 2026").

## 9. Tecnologias e ferramentas

- **Linguagens:** HTML5, CSS3 e JavaScript.
- **Atualização: recursos do navegador:** Web Speech API (reconhecimento e síntese de voz).
- **Atualização: serviços:** Vercel (hospedagem e função `api/chat.js`), Gemini (IA do Equinho), Firebase (Authentication e Cloud Firestore, para a comunidade), Formspree (formulários), Google Maps e ViaCEP.
- **Ferramentas de desenvolvimento:** VS Code, Claude (IA), Aseprite (animações do Equinho).
- **Controle de versão:** Git e GitHub.
- **Validação e testes:** W3C Markup Validator e W3C CSS Validator, Lighthouse, axe-core (extensão axe DevTools), NVDA (computador), TalkBack (celular) e Chrome DevTools.

## 10. Cronograma e divisão de tarefas

| Etapa | Data | Responsável |
|---|---|---|
| Escopo | 06/11/2026 | Eduarda Amorim |
| Estrutura HTML das páginas | 15/09/2026 | Caio Nabuosuke |
| CSS e identidade visual | 15/09/2026 | Caio Nabuosuke |
| Conteúdo e imagens | 22/09/2026 | Henrique de Medeiros |
| Testes de acessibilidade e validação | 07/11/2026 | Henrique de Medeiros, Guilherme Couto, Pedro Pinheiro |
| Documentação e entrega | 09/11/2026 | Eduarda Amorim, Jenifer Rufino, Caio Nabuosuke |
| **Atualização:** recursos de acessibilidade e comandos de voz | 10/11/2026 a 16/11/2026 | A definir pela equipe |
| **Atualização:** revisão da documentação e do zip da entrega | 16/11/2026 | A definir pela equipe |

Ferramenta de gestão: GitHub, com commits para acompanhar as alterações do projeto.

## 11. Riscos e restrições

- Prazo curto e conciliação com outras disciplinas.
- Pouca experiência da equipe com acessibilidade e validação W3C.
- Mapa, CEP, comunidade, chat do Equinho e formulários dependem de serviços externos e de internet.
- **Atualização:** os comandos de voz dependem do navegador. Funcionam só no Chrome, no Edge e no Chrome do Android.
- **Atualização:** o áudio dos comandos de voz é processado pelo serviço de reconhecimento do navegador. O site não grava nem envia a voz para os servidores da equipe.
- **Atualização:** o chat do Equinho precisa da chave da API do Gemini configurada na Vercel. Sem a chave, ele responde com uma resposta reserva, sem IA.
- **Atualização:** arquivos enviados manualmente pelo GitHub podem gerar erros de nome, pasta ou versão. Antes de remover um arquivo, é preciso conferir se alguma página ainda o usa.

## 12. Critérios de aceitação

- 11 páginas navegáveis e interligadas.
- Formulários com validação HTML5 (required, email, tel, date, number, pattern, label for) e validação em JavaScript.
- Vídeo, áudio e iframe funcionando.
- Acessibilidade aplicada e testada.
- Código sem erros no W3C Validator.
- Documentação completa na pasta `docs`.
- **Atualização: situação em 16/11/2026:**
  - Concluído: painel de acessibilidade em todas as páginas, comandos de voz e preenchimento por voz, testados com fala simulada.
  -teste com voz real, em Chrome e Edge, com pessoas que usam o site só pela voz.
  -teste de zoom a 180% e de alto contraste, segundo `docs/evidencias_testes.md`.
  -confirmar as legendas do vídeo da página Mídia (a tag `<track>` está vazia).
  -validação W3C atualizada após as mudanças de 16/11/2026.

## 13. Aprovação

- **Responsável pela validação:** Eduarda Amorim
- **Data da última aprovação:** 16/11/2026
