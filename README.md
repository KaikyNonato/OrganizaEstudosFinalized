# 📚 OrganizaEstudos

O **OrganizaEstudos** é uma plataforma Full-Stack projetada para revolucionar a forma como estudantes gerenciam sua rotina acadêmica. A aplicação integra gestão de matérias, anexos de PDFs, cronograma semanal, técnica Pomodoro e um sistema inteligente de revisões espaçadas (24h, 7 dias e 30 dias) para maximizar a retenção de conteúdo.

## 🗺️ Mapa de Rotas (URLs)

Abaixo está a lista de todas as páginas e rotas disponíveis na aplicação:

| Rota / URL | Descrição da Tela | Nível de Acesso |
| :--- | :--- | :--- |
| `/` | Dashboard (Página Inicial com métricas e agenda do dia) | Autenticado |
| `/login` | Acesso à plataforma | Público |
| `/signup` | Cadastro de novos usuários | Público |
| `/verify-email` | Validação de conta via código OTP de 6 dígitos | Público |
| `/forgot-password` | Solicitação de link para recuperação de senha | Público |
| `/reset-password/:token` | Tela segura para criação de uma nova senha | Público |
| `/materias` | Gestão de matérias, assuntos e upload de PDFs | Autenticado |
| `/revisoes` | Painel inteligente de revisões (24h, 7 dias e 30 dias) | Autenticado |
| `/cronograma` | Organização da grade semanal de horários de estudo | Autenticado |
| `/pomodoro` | Cronômetro de Foco, Pausa Curta e Pausa Longa | Autenticado |
| `/perfil` | Visualização dos dados da conta e status de verificação | Autenticado |
| `/update-user` | Edição dos dados do perfil do usuário | Autenticado |
| `/view-pdf/:subjectId/:publicId` | Visualizador interno e protegido de arquivos PDF | Autenticado |
| `/admin` | Painel de controle gerencial e visão global de usuários | Admin |

---

## ✨ Funcionalidades

### 🔐 Autenticação e Segurança

* 
**Cadastro e Login Seguros:** Senhas criptografadas (Bcrypt) e autenticação via JWT armazenado em cookies HTTP-Only.


* 
**Verificação em Duas Etapas (OTP):** Confirmação de conta via código de 6 dígitos enviado por e-mail.


* 
**Recuperação de Senha:** Fluxo completo para redefinição de senhas com links expiráveis.


* **Visualizador de PDF Blindado:** Os arquivos (PDFs) armazenados na nuvem são acessados através de um *Proxy* no backend, gerando URLs temporárias (`Blob`) no frontend para impedir acessos não autorizados ou compartilhamento de links.

### 📊 Dashboard (Visão Geral)

* Métricas em tempo real de matérias, assuntos pendentes/concluídos e tempo total de estudo.
* Barra de progresso visual de conclusão de estudos.
* Resumo da agenda do dia e links rápidos personalizáveis pelo usuário.

### 📘 Gestão de Matérias e Assuntos

* Criação de matérias com tags de cores personalizadas.
* Adição de assuntos com suporte a upload de até 3 arquivos PDF por tópico (armazenados no Cloudinary).
* Reordenação e mudança de status (Pendente/Concluído).

### 🔄 Revisões Espaçadas Automáticas

* O sistema agenda automaticamente revisões para **24 horas, 7 dias e 30 dias** após a conclusão de um assunto.
* Painel dedicado com cronômetro regressivo inteligente (calcula o tempo restante até as 23:59 da data alvo e exibe alertas de atraso).

### 📅 Cronograma Semanal

* Organização de blocos de horários por dia da semana (Domingo a Sábado).
* Prevenção de conflito de horários (o backend não permite sobreposição de matérias).


* Integração inteligente: sugere o próximo assunto a ser estudado na matéria escolhida e possui um atalho para iniciar o Pomodoro.

### ⏱️ Pomodoro Timer

* Modos integrados: Foco, Pausa Curta e Pausa Longa (tempos personalizáveis).
* Ao finalizar uma sessão de foco, o tempo é automaticamente contabilizado nas métricas do usuário.

### 👑 Painel Administrativo

* Rota protegida exclusiva para Administradores.
* Listagem de usuários com dados de uso (horas estudadas, número de assuntos e arquivos).


* Visualização em árvore do conteúdo dos usuários (para suporte técnico) e gerenciamento de permissões.

---

## 🚀 Tecnologias Utilizadas

### Frontend

* **[React 19](https://react.dev/)** + **[Vite](https://vitejs.dev/)**
* **[Tailwind CSS v4](https://tailwindcss.com/)** + **[DaisyUI](https://daisyui.com/)** (Estilização e Componentes)
* **[Zustand](https://zustand-demo.pmnd.rs/)** (Gerenciamento de Estado Global)
* **[Framer Motion](https://www.framer.com/motion/)** (Animações e Transições)
* **[React Router DOM](https://reactrouter.com/)** (Navegação)
* **[Axios](https://axios-http.com/)** (Comunicação com a API)
* **[Lucide React](https://lucide.dev/)** (Ícones)

### Backend

* **[Node.js](https://nodejs.org/)** + **[Express](https://expressjs.com/)**
* **[MongoDB](https://www.mongodb.com/)** + **[Mongoose](https://mongoosejs.com/)** (Banco de Dados e ORM)
* 
**[JSON Web Tokens (JWT)](https://jwt.io/)** (Autenticação via Cookies) 


* 
**[Cloudinary](https://cloudinary.com/)** (Armazenamento de PDFs em Nuvem) 


* 
**[Nodemailer](https://nodemailer.com/)** (Envio de E-mails Transacionais) 


* 
**[Bcryptjs](https://www.npmjs.com/package/bcryptjs)** (Criptografia de Senhas) 



---

## 📦 Como rodar o projeto localmente

### Pré-requisitos

* [Node.js](https://nodejs.org/en/download/) (v18 ou superior)
* [MongoDB](https://www.mongodb.com/try/download/community) (Local ou Atlas)
* Conta no [Cloudinary](https://cloudinary.com/) (para upload de arquivos)
* Conta de e-mail configurada para SMTP (ex: Gmail com App Passwords ou Mailtrap)

### 1. Clonando o Repositório

```bash
git clone https://github.com/KaikyNonato/PROJETO-BASE-MERN.git
cd OrganizaEstudos

```

### 2. Configurando o Backend

```bash
cd backend
npm install

```

Crie um arquivo `.env` na raiz da pasta `backend` com as seguintes variáveis:

```env
PORT=5000
MONGO_URL=sua_connection_string_do_mongodb
JWT_SECRET=sua_chave_secreta_jwt
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Configurações do Cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret

# Configurações do Nodemailer
NODEMAILER_EMAIL=seu_email_de_envio@gmail.com
NODEMAILER_PASSWORD=sua_senha_de_app_do_gmail
NODEMAILER_NAME=OrganizaEstudos

```

Inicie o servidor do backend:

```bash
npm run dev

```

### 3. Configurando o Frontend

Abra um novo terminal e navegue para a pasta do frontend:

```bash
cd frontend
npm install

```

Inicie a aplicação React:

```bash
npm run dev

```

A aplicação estará rodando em `http://localhost:5173`.

---

## 📄 Licença

Este projeto está sob a licença [MIT](https://choosealicense.com/licenses/mit/). Sinta-se livre para usar, modificar e distribuir conforme necessário.

---

Feito por Kaiky Nonato (https://github.com/KaikyNonato)

---
