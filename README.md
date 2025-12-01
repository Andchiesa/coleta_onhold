# Recebimento Onhold - LRJ07

Aplicação web para controle de recebimento e registro de coletas (Logística).

## Funcionalidades

*   **Login Simples**: Acesso via nome de usuário.
*   **Modo Unitário**: Escaneamento de códigos de 15 dígitos com validação e categorização de status (SOC, Roteirizar, Avariado, etc.).
*   **Modo em Lote**: Processamento de múltiplos códigos simultaneamente via caixa de texto ou leitor de código de barras.
*   **Histórico Local**: Os dados são salvos no navegador (LocalStorage), persistindo mesmo após recarregar a página.
*   **Exportação CSV**: Exportação dos registros para planilha Excel/CSV.
*   **Design Responsivo**: Interface moderna e adaptável (Desktop/Mobile).

## Como Usar

1.  Abra o arquivo `index.html` no seu navegador.
2.  Insira seu nome para iniciar o turno.
3.  Escolha o modo de operação (Unitário ou Em Lote).
4.  Realize as bipsagens e classifique os itens.
5.  Ao final, clique em "Exportar CSV" para salvar o relatório.

## Instalação / Deploy

Este projeto é composto por arquivos estáticos (HTML, CSS, JS). Para compartilhar com outros usuários, você pode:

1.  **Vercel / Netlify**: Faça upload desta pasta para criar um link público.
2.  **Servidor Web**: Hospede os arquivos em qualquer servidor web estático.

## Estrutura de Arquivos

*   `index.html`: Estrutura principal.
*   `css/styles.css`: Estilos e design.
*   `js/app.js`: Lógica da aplicação.
