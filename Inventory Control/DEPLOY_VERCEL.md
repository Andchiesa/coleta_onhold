# Como Hospedar seu Projeto na Vercel (Sem Instalar Nada)

Como você não tem o Git ou Node.js instalados, o jeito mais fácil é usar o site do GitHub para guardar seus arquivos e conectar com a Vercel.

## Passo 1: Preparar os Arquivos
Certifique-se de que sua pasta `Inventory Control` tem estes arquivos:
- `index.html`
- `css/styles.css`
- `js/app.js`
- `README.md`

## Passo 2: Colocar no GitHub
1.  Crie uma conta no [GitHub.com](https://github.com) (se não tiver).
2.  Clique no **+** no canto superior direito e selecione **New repository**.
3.  Nomeie como `controle-logistica` (ou o que preferir).
4.  Deixe como **Public** ou **Private** (ambos funcionam).
5.  Clique em **Create repository**.
6.  Na próxima tela, procure o link pequeno: **"uploading an existing file"**.
7.  Arraste todos os seus arquivos (`index.html`, pasta `css`, pasta `js`) para a área de upload.
    *   *Dica:* Para pastas, você pode arrastar a pasta inteira ou criar as pastas manualmente no GitHub se precisar, mas arrastar geralmente funciona.
8.  Aguarde o upload e clique em **Commit changes**.

## Passo 3: Conectar na Vercel
1.  Crie uma conta na [Vercel.com](https://vercel.com) e faça login com seu **GitHub**.
2.  No painel (Dashboard), clique em **Add New...** > **Project**.
3.  Você verá uma lista dos seus repositórios do GitHub. Encontre o `controle-logistica` e clique em **Import**.
4.  Na tela de configuração ("Configure Project"), você não precisa mudar nada.
5.  Clique em **Deploy**.

## Pronto!
Em alguns segundos, a Vercel vai te dar um link (ex: `controle-logistica.vercel.app`) que você pode mandar para toda a sua equipe. O site vai funcionar no celular e no computador de todos.
