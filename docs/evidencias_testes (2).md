# Evidências de testes

> Os prints estão na pasta `docs/prints/` e o nome do arquivo está citado em cada linha.

## 1. Validação W3C (https://validator.w3.org/)

| Página | Resultado | Print |
|---|---|---|
| index.html | Sem erros nem avisos | prints/w3c-index.png |
| sobre.html | [CONFIRMAR: resultado do print] | prints/w3c-sobre.png |
| projetos.html | [CONFIRMAR: resultado do print] | prints/w3c-projetos.png |
| impacto.html | [CONFIRMAR: resultado do print] | prints/w3c-impacto.png |
| acessibilidade.html | [CONFIRMAR: resultado do print] | prints/w3c-acessibilidade.png |
| galeria.html | [CONFIRMAR: resultado do print] | prints/w3c-galeria.png |
| midia.html | [CONFIRMAR: resultado do print] | prints/w3c-midia.png |
| noticias.html | [CONFIRMAR: resultado do print] | prints/w3c-noticias.png |
| contato.html | [CONFIRMAR: resultado do print] | prints/w3c-contato.png |
| orcamento_hospedagem.html | [CONFIRMAR: resultado do print] | prints/w3c-orcamento.png |
| comunidade.html | [CONFIRMAR: resultado do print] | prints/w3c-comunidade.png |
| css/style.css (https://jigsaw.w3.org/css-validator/) | [CONFIRMAR: resultado do print] | prints/w3c-css.png |

## 2. Navegação

- [ ] Todos os links do menu abrem a página certa.
- [ ] A página atual aparece destacada no menu.
- [ ] Links "Nesta página" levam à seção certa.
- [ ] Nenhum link quebrado.

## 3. Formulários

| Teste | Esperado | Resultado |
|---|---|---|
| Enviar vazio | Avisa os campos obrigatórios | OK: não envia com campos obrigatórios em branco |
| E-mail sem @ | Avisa e-mail inválido | OK: exige e-mail válido |
| Telefone sem DDD | Avisa pelo pattern | OK: exige DDD (Coleta) |
| CEP com letras | Avisa pelo pattern | OK: exige CEP válido (Coleta) |
| Data no passado | Não aceita (coleta) | OK: datas passadas bloqueadas |
| Quantidade 0 ou acima do máximo | Avisa pelo min/max | OK: campo obrigatório exige valor acima de 0; campo opcional (Contato) funciona normalmente |
| Tudo certo | Mostra mensagem de sucesso | OK: envio concluído e mensagem recebida no Gmail |

## 4. Acessibilidade

| Teste | Ferramenta | Resultado |
|---|---|---|
| Navegar o site todo só com teclado | Teclado | [CONFIRMAR: testado?] |
| Foco sempre visível | Teclado | [CONFIRMAR: testado?] |
| Leitor de tela lê títulos, links e campos | [PREENCHER: NVDA / TalkBack] | [PREENCHER] |
| Imagens com alt descritivo | axe-core | [CONFIRMAR: resultado da análise] |
| Contraste mínimo AA | axe-core (WCAG 2.1 AA) | [CONFIRMAR: resultado da análise] |
| Alto contraste e aumento do texto | Navegador | [CONFIRMAR: testado a 180%?] |
| Vídeo com legenda e áudio com transcrição | Navegador | OK: vídeo com legenda gravada; áudio com transcrição na página Mídia |
| Nota de acessibilidade do Lighthouse | Chrome DevTools | 100 (print: prints/lighthouse.png) |

## 5. Responsividade

| Dispositivo | Largura | Resultado | Print |
|---|---|---|---|
| Celular | 375 px | [PREENCHER: o que foi verificado no print] | prints/celular.png |
| Tablet | 768 px | [PREENCHER: o que foi verificado no print] | prints/tablet.png |
| Computador | 1366 px | [PREENCHER: o que foi verificado no print] | prints/computador.png |
