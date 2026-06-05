# SDR Checker 🔍

Sistema para sua SDR verificar se um arquiteto já é cliente da empresa.

---

## Como fazer o deploy (passo a passo)

### 1. Criar conta no GitHub
- Acesse: https://github.com
- Clique em "Sign up" e crie sua conta gratuita

### 2. Criar um repositório no GitHub
- Após logar, clique no "+" no canto superior direito → "New repository"
- Nome: `sdr-checker`
- Deixe como "Public"
- Clique em "Create repository"

### 3. Fazer upload dos arquivos
- Na página do repositório, clique em "uploading an existing file"
- Arraste TODOS os arquivos desta pasta para lá
- Clique em "Commit changes"

### 4. Criar conta no Vercel
- Acesse: https://vercel.com
- Clique em "Sign Up" → "Continue with GitHub"
- Autorize o Vercel a acessar sua conta GitHub

### 5. Fazer o deploy
- No Vercel, clique em "Add New Project"
- Selecione o repositório `sdr-checker`
- Clique em "Deploy"
- Aguarde ~2 minutos

### 6. Criar o banco de dados (Vercel KV)
- No painel do seu projeto no Vercel, vá em "Storage"
- Clique em "Create Database" → escolha "KV"
- Dê um nome (ex: `sdr-db`) e clique em "Create"
- Clique em "Connect to Project" para vincular ao seu app

### 7. Pronto! 🎉
- O Vercel vai te dar um link tipo: `https://sdr-checker.vercel.app`
- Compartilhe esse link com sua SDR
- Os dados ficam salvos permanentemente no banco de dados

---

## Funcionalidades

- **Verificar em massa**: Cole vários links de uma vez (um por linha)
- **Adicionar em massa**: Importe de planilha colando os dados
- **Gerenciar**: Buscar e excluir clientes da base
- **Formatos aceitos**: @handle, instagram.com/perfil, URL completa

## Suporte
Em caso de dúvidas, volte ao Claude e descreva o erro que apareceu.
