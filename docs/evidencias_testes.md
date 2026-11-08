# Evidências de testes

> Os prints estão na pasta `docs/prints/` e o nome do arquivo está citado em cada linha.

## 1. Validação W3C (https://validator.w3.org/)

| Página | Resultado | Print |
|---|---|---|
| index.html | Sem erros nem avisos | prints/w3c-index.png |
| sobre.html | Sem erros nem avisos | prints/w3c-sobre.png |
| projetos.html | Sem erros nem avisos | prints/w3c-projetos.png |
| impacto.html | Sem erros nem avisos | prints/w3c-impacto.png |
| acessibilidade.html | Sem erros nem avisos | prints/w3c-acessibilidade.png |
| galeria.html | Sem erros nem avisos | prints/w3c-galeria.png |
| midia.html | Sem erros nem avisos | prints/w3c-midia.png |
| noticias.html | Sem erros nem avisos | prints/w3c-noticias.png |
| contato.html | Sem erros nem avisos | prints/w3c-contato.png |
| orcamento_hospedagem.html | Sem erros nem avisos | prints/w3c-orcamento.png |
| comunidade.html | Sem erros nem avisos | prints/w3c-comunidade.png |
| css/style.css (https://jigsaw.w3.org/css-validator/) | Sem erros (2 alertas de aviso, não são erros) | prints/w3c-css.png |

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
| Navegar o site todo só com teclado | Teclado | REALIZADO: Navegação em perfeito estado somente pelo teclado |
| Foco sempre visível | Teclado | REALIZADO: foco visível nos itens do menu, nos campos do formulário e nos botões |
| Leitor de tela lê títulos, links e campos | NVDA e TalkBack | REALIZADO: Ambos Funcionam Perfeitamente |
| Imagens com alt descritivo | axe-core 4.13.0 (extensão axe DevTools), página de contato | REALIZADO: 0 problemas encontrados |
| Contraste mínimo AA | axe-core (WCAG 2.1 AA) | REALIZADO: com zoom de 180%, o texto aumenta e nenhum conteúdo fica cortado ou sobreposto |
| Alto contraste e aumento do texto | Navegador | NÃO REALIZADO: teste de zoom a 180% pendente |
| Vídeo com legenda e áudio com transcrição | Navegador | OK: vídeo com legenda gravada; áudio com transcrição na página Mídia |
| Nota de acessibilidade do Lighthouse | Chrome DevTools | REALIZADO: nota 100 (print: prints/lighthouse.png) |

## 5. Responsividade

| Dispositivo | Largura | Resultado | Print |
|---|---|---|---|
| Celular | 375 px | NÃO DESCRITO: print presente, análise pendente | prints/celular.png |
| Tablet | 768 px | NÃO DESCRITO: print presente, análise pendente | prints/tablet.png |
| Computador | 1366 px | NÃO DESCRITO: print presente, análise pendente | prints/computador.png |
