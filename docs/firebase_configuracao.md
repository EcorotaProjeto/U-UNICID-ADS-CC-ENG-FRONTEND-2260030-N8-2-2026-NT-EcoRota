# Como ligar o Firebase na comunidade EcoRecicla

> **Situação:** conectado ao projeto `ecorota-6f64d` (plano Spark). Firestore criado com as regras de `docs/firestore.rules` e login por e-mail e senha ativado.

Sem o Firebase, a comunidade funciona em **modo demonstração** (tudo salvo só no navegador).
Com ele, as **contas** ficam no Firebase Authentication e as **publicações e votos** no Cloud Firestore, e todo mundo vê as mesmas publicações, em tempo real.

O plano gratuito (Spark) é suficiente para o projeto.

## 1. Criar o projeto

1. Acesse https://console.firebase.google.com e entre com uma conta Google.
2. Clique em **Adicionar projeto**, dê o nome `ecorota` e pode desativar o Google Analytics.

## 2. Ativar as contas (Authentication)

1. No menu da esquerda: **Criação > Authentication > Vamos começar**.
2. Na aba **Método de login**, escolha **E-mail/senha**, ative a primeira opção e salve.

## 3. Criar o banco de dados (Firestore)

1. No menu: **Criação > Firestore Database > Criar banco de dados**.
2. Escolha a região **southamerica-east1 (São Paulo)**.
3. Escolha **Iniciar no modo de produção**.
4. Abra a aba **Regras**, apague o que estiver lá, cole todo o conteúdo do arquivo `docs/firestore.rules` e clique em **Publicar**.

## 4. Conectar o site ao projeto

1. Na página inicial do projeto, clique no ícone **`</>`** (Web), dê o apelido `EcoRota` e registre o app (não precisa marcar o Hosting).
2. Copie os valores do bloco `firebaseConfig` que aparece.
3. Abra `js/firebase-config.js` e troque cada `"COLE_AQUI"` pelo valor correspondente.

Esses valores **não são secretos**: eles ficam visíveis no site de qualquer forma. Quem protege os dados são as regras do passo 3.

## 5. Liberar o endereço do site

Em **Authentication > Configurações > Domínios autorizados**, adicione o endereço onde o site vai ficar, por exemplo `seu-usuario.github.io`.

## 6. Testar

- O ideal é abrir o site publicado (GitHub Pages) ou por um servidor local, como a extensão **Live Server** do VS Code. Abrindo o arquivo direto do computador (`file:///`), alguns navegadores bloqueiam o login.
- Na comunidade, a faixa abaixo do cabeçalho deve mostrar: **"Conectado ao Firebase: contas e publicações ficam salvas na nuvem."**
- Crie uma conta, publique algo e confira em **Firestore Database > Dados**: devem aparecer as coleções `usuarios` e `posts`. As contas aparecem em **Authentication > Usuários**.

## Como os dados ficam organizados

| Coleção | O que guarda | Quem pode ler | Quem pode escrever |
|---|---|---|---|
| `posts` | Publicações: autor, tipo, fórum, título, texto, etiquetas, votos e data | Todo mundo | Quem está logado cria; só o autor exclui; votos mudam de 1 em 1 |
| `usuarios/{id}` | Nome de usuário da conta | Só o dono | Só o dono |
| `usuarios/{id}/votos` | Em quais publicações a pessoa votou | Só o dono | Só o dono |

As **senhas nunca passam pelo nosso código nem ficam no Firestore**: quem cuida delas é o Firebase Authentication.
