# Evidências de testes

> Salve os prints na pasta `docs/prints/` e cite o nome do arquivo em cada linha.

## 1. Validação W3C (https://validator.w3.org/)

| Página | Resultado | Print |
|---|---|---|
| index.html | Sem erros | prints/w3c-index.png |
| sobre.html | Sem erros | prints/w3c-sobre.png |
| projetos.html | Sem erros | prints/w3c-projetos.png |
| impacto.html | Sem erros | prints/w3c-impacto.png |
| acessibilidade.html | Sem erros | prints/w3c-acessibilidade.png |
| galeria.html | Sem erros | prints/w3c-galeria.png |
| midia.html | Sem erros | prints/w3c-midia.png |
| noticias.html | Sem erros | prints/w3c-noticias.png |
| contato.html | Sem erros | prints/w3c-contato.png |
| orcamento_hospedagem.html | Sem erros | prints/w3c-orcamento.png |
| comunidade.html | Sem erros | prints/w3c-comunidade.png |
| css/style.css (https://jigsaw.w3.org/css-validator/) | Sem erros | prints/w3c-css.png |

## 2. Navegação

- [ ] Todos os links do menu abrem a página certa.
- [ ] A página atual aparece destacada no menu.
- [ ] Links "Nesta página" levam à seção certa.
- [ ] Nenhum link quebrado.

## 3. Formulários

| Teste | Esperado | Resultado |
|---|---|---|
| Enviar vazio | Avisa os campos obrigatórios | [PREENCHER] |
| E-mail sem @ | Avisa e-mail inválido | [PREENCHER] |
| Telefone sem DDD | Avisa pelo pattern | [PREENCHER] |
| CEP com letras | Avisa pelo pattern | [PREENCHER] |
| Data no passado | Não aceita (coleta) | [PREENCHER] |
| Quantidade 0 ou acima do máximo | Avisa pelo min/max | [PREENCHER] |
| Tudo certo | Mostra mensagem de sucesso | [PREENCHER] |

## 4. Acessibilidade

Teste automático com axe-core (regras WCAG 2.1 A e AA) em todas as páginas, em 1366 px e 375 px: 3 problemas encontrados (contraste de 2 textos da Comunidade e tabelas sem rolagem pelo teclado no celular), todos corrigidos. Resultado final: nenhuma falha.


| Teste | Ferramenta | Resultado |
|---|---|---|
| Navegar o site todo só com teclado | Teclado | OK: "Pular para o conteúdo" no 1º Tab; formulário enviado e resumos de notícias abertos sem mouse |
| Foco sempre visível | Teclado | OK em todos os 39 itens focáveis da página Contato (o campo de data foi corrigido) |
| Leitor de tela lê títulos, links e campos | [PREENCHER: NVDA / TalkBack] | [PREENCHER] |
| Imagens com alt descritivo | axe-core | OK em todas as páginas |
| Contraste mínimo AA | axe-core (WCAG 2.1 AA) | 2 falhas na Comunidade, corrigidas; depois, nenhuma falha |
| Alto contraste e aumento do texto | Navegador | OK a 180% em 1366 px e 375 px (e-mail longo e textos da Comunidade saíam da tela no celular; corrigido) |
| Vídeo com legenda e áudio com transcrição | Navegador | [PREENCHER] |
| Nota de acessibilidade do Lighthouse | Chrome DevTools | [PREENCHER] |

## 5. Responsividade

| Dispositivo | Largura | Resultado | Print |
|---|---|---|---|
| Celular | 375 px | [PREENCHER] | prints/celular.png |
| Tablet | 768 px | [PREENCHER] | prints/tablet.png |
| Computador | 1366 px | [PREENCHER] | prints/computador.png |
