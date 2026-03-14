# 🗂️ Guia de Instalação — Galeria App
## Do zero ao ar em ~20 minutos, sem programar

---

## PASSO 1 — Criar conta no Supabase (banco de dados + login)

1. Acesse **https://supabase.com** e clique em **Start for free**
2. Crie uma conta (pode usar o Google)
3. Clique em **New Project**
4. Preencha:
   - **Name:** galeria
   - **Database Password:** escolha uma senha forte (guarde em algum lugar)
   - **Region:** South America (São Paulo)
5. Clique em **Create new project** e aguarde ~1 minuto

---

## PASSO 2 — Configurar o banco de dados

1. No menu esquerdo, clique em **SQL Editor**
2. Clique em **+ New query**
3. Abra o arquivo `supabase-setup.sql` (que está junto com esses arquivos)
4. Copie **todo** o conteúdo e cole na caixa do SQL Editor
5. Clique em **Run** (botão verde, canto inferior direito)
6. Deve aparecer "Success. No rows returned"

---

## PASSO 3 — Criar o bucket de fotos

1. No menu esquerdo, clique em **Storage**
2. Clique em **New bucket**
3. Nome: `photos`
4. Marque a opção **Public bucket** ✅
5. Clique em **Save**

---

## PASSO 4 — Pegar suas credenciais do Supabase

1. No menu esquerdo, clique em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Você vai ver dois valores importantes:
   - **Project URL** → algo como `https://xyzxyz.supabase.co`
   - **anon public** key → uma chave longa começando com `eyJ...`
4. **Guarde os dois valores** — você vai precisar no próximo passo

---

## PASSO 5 — Criar conta no GitHub (para guardar o código)

1. Acesse **https://github.com** e crie uma conta gratuita
2. Após logar, clique no **+** no canto superior direito → **New repository**
3. Nome: `galeria-app`
4. Deixe como **Public** e clique em **Create repository**

---

## PASSO 6 — Fazer upload do código

1. Na página do repositório que acabou de criar, clique em **uploading an existing file**
2. Arraste a pasta `galeria` inteira para lá, OU clique em "choose your files" e selecione todos os arquivos
3. ⚠️ **Importante:** você precisa criar a estrutura de pastas manualmente no GitHub:
   - Mais fácil: use o **GitHub Desktop** (https://desktop.github.com) — é visual e sem comandos
   - Instale o GitHub Desktop, faça login, clone o repositório vazio, copie os arquivos da pasta `galeria` para dentro, e faça "Commit" + "Push"
4. Clique em **Commit changes**

---

## PASSO 7 — Deploy no Vercel

1. Acesse **https://vercel.com** e clique em **Sign up** → use sua conta do GitHub
2. Clique em **Add New Project**
3. Selecione o repositório `galeria-app` e clique em **Import**
4. Em **Environment Variables**, clique em **Add** e adicione:
   - Key: `VITE_SUPABASE_URL` → Value: a Project URL do Passo 4
   - Key: `VITE_SUPABASE_ANON_KEY` → Value: a anon key do Passo 4
5. Clique em **Deploy**
6. Aguarde ~1 minuto ☕

---

## PASSO 8 — Testar!

1. O Vercel vai te dar um link como `https://galeria-app-xyz.vercel.app`
2. Acesse o link, crie uma conta, faça upload de fotos e teste o slideshow!

---

## ✅ O que você tem agora (Fase 1)

- [x] Login e cadastro com e-mail/senha
- [x] Recuperação de senha por e-mail
- [x] Dashboard com seus álbuns
- [x] Criar e apagar álbuns
- [x] Upload de fotos (arraste ou clique)
- [x] Visualização em grade
- [x] **Modo apresentação** com:
  - Transições: Fade, Slide, Zoom
  - Velocidade ajustável (1.5s a 10s)
  - Controle por teclado (← →, Espaço, Esc)
  - Play/Pause automático

## 🔜 Próximas fases

- Fase 2: Mais transições, ordem das fotos, modo quiosque (esconde a barra)
- Fase 3: Compartilhar álbuns com outras pessoas

---

## 🆘 Problemas?

Me mande uma mensagem descrevendo o que aconteceu e eu ajudo!
