# Recebimento Onhold - LRJ07 📦

Sistema web profissional para controle de recebimento, triagem e registro de coletas operacionais (Logística Shopee Xpress - Hub LRJ07).

---

## 🚀 Funcionalidades

- **Identificação do Colaborador**: Acesso simples com troca rápida de operador diretamente pelo painel (sem perder o histórico lançado).
- **Controle de Turnos**: Alternância instantânea entre turnos **AM** (Manhã) e **DDP** (Tarde/Noite).
- **Validação de Código de Barras**: Validação estrita de **15 caracteres** para coletores e leitores de código de barras, com aviso sonoro e visual imediato.
- **Modo Unitário**: Bipagem unitária de alta velocidade com classificação rápida de status.
- **Modo em Lote (Multi)**: Processamento e sanitização de centenas de códigos colados ou escaneados em sequência.
- **Classificação de Status Operacionais**:
  - `SOC`
  - `Roteirizar`
  - `Avariado`
  - `Volumoso` *(com sub-classificação: Caixa Grande, Saco Grande, Peso Elevado, Formato Irregular, Pacote Longo, Outro)*
  - `Item Voando`
  - `Duplicidade`
  - `Interceptado`
- **Tabela em Tempo Real**: Histórico de bipagens com ordenação, data, hora, turno, código, status, detalhes e colaborador responsável.
- **Exportação de Relatórios**: Botão dedicado para download da planilha em **Excel (`.xlsx`)** com todas as colunas formatadas.
- **Sincronização em Nuvem (Google Sheets)**: Envio assíncrono em segundo plano para planilha de controle via Google Apps Script.
- **Persistência Local**: Dados gravados no navegador (`localStorage`), garantindo segurança contra quedas de conexão ou recarregamento acidental da página.

---

## 🛠️ Tecnologias Utilizadas

- **React 19** + **TypeScript**
- **Vite** (Build tool e servidor ultrarrápido)
- **XLSX** (Exportação de relatórios em Excel)
- **Web Audio API** (Bipes sonoros para coletores)

---

## 💻 Como Executar Localmente

1. **Instalar as dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Gerar build de produção:**
   ```bash
   npm run build
   ```

---

## 🔄 Como Atualizar o Repositório no GitHub

**Não é necessário excluir o repositório existente!** Você pode simplesmente atualizar o repositório atual (`Andchiesa/coleta_onhold`).

### Opção 1: Via Terminal / Git no seu computador

Se você já tem a pasta clonada no seu computador:

```bash
# 1. Copie os novos arquivos para a pasta do projeto
# 2. Abra o terminal na pasta e execute:
git add .
git commit -m "feat: atualiza layout, validação de 15 dígitos, troca de usuário e exportação excel"
git push origin main
```

### Opção 2: Se for publicar do zero por cima do repositório existente

```bash
git remote set-url origin https://github.com/Andchiesa/coleta_onhold.git
git add .
git commit -m "refactor: migra para React/TypeScript com layout oficial LRJ07"
git branch -M main
git push -u origin main --force
```
