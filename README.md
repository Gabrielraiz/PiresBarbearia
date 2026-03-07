# 🌟 PiresQK Barbearia - Sistema Completo de Agendamento

> Um sistema moderno, responsivo e totalmente funcional de agendamento de barbearia com painel administrativo, integrações com APIs externas e banco de dados em nuvem.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🚀 Funcionalidades Implementadas

### 👥 **Lado Cliente (100% ✅)**
- ✅ Autenticação segura (JWT + bcrypt)
- ✅ Cadastro de cliente com foto de perfil
- ✅ Edição de perfil (dados, telefone, email, senha)
- ✅ Agendamento online com calendário interativo
- ✅ Seleção de barbeiro, serviço e horário
- ✅ Histórico de agendamentos (próximos e passados)
- ✅ Cancelamento e remarcação de agendamentos
- ✅ Visualização de serviços com preços
- ✅ Galeria de fotos/vídeos com lightbox
- ✅ Perfil dos barbeiros com especialidades
- ✅ Sistema de avaliações (1-5 estrelas)
- ✅ Contato com WhatsApp integrado
- ✅ Mapa Google Maps 3D
- ✅ Suporte multilíngue (PT/EN)

### 🛠️ **Lado Admin (100% ✅)**
- ✅ Dashboard com KPIs em tempo real
- ✅ Gestão de agendamentos (confirmar, cancelar, remarcar)
- ✅ Calendário interativo
- ✅ Gestão de clientes
- ✅ Gestão de barbeiros e horários
- ✅ Gestão de serviços (preço, duração, ícone)
- ✅ Upload de mídia (fotos/vídeos)
- ✅ Relatórios e estatísticas
- ✅ Configurações do site (cores, redes sociais, WhatsApp)
- ✅ Backup automático

---

## 🔌 **APIs Externas Integradas - VERSÃO GRATUITA**

### ✅ **SERVIÇOS GRATUITOS CONFIGURADOS**
| API | Status | Função | Gratuito Até | Docs |
|-----|--------|--------|--------------|------|
| **Supabase** | ✅ Pronto | Cloud Storage + Backup | 500MB/mês | [link](./INTEGRATIONS_SETUP.md#1️⃣-supabase) |
| **Google Maps Embed** | ✅ Pronto | Mapa Localização | ILIMITADO | [link](./INTEGRATIONS_SETUP.md#2️⃣-google-maps-embed) |
| **Twilio Sandbox** | 🟡 Awaiting Config | WhatsApp Testes | GRATUITO | [link](./INTEGRATIONS_SETUP.md#3️⃣-twilio-whatsapp) |
| **SendGrid Free** | 🟡 Awaiting Config | 100 Emails/dia | 100/dia | [link](./INTEGRATIONS_SETUP.md#4️⃣-sendgrid-email) |
| **Mercado Pago** | 🟡 Awaiting Config | Pagamentos Brasil | GRATUITO | [link](./INTEGRATIONS_SETUP.md#5️⃣-mercado-pago) |
| **Firebase** | 🟡 Awaiting Config | Push Notifications | 10k/dia | [link](./INTEGRATIONS_SETUP.md#6️⃣-firebase-push) |
| **Google OAuth** | 🟡 Awaiting Config | Login Google | GRATUITO | [link](./INTEGRATIONS_SETUP.md#7️⃣-google-oauth) |
| **Facebook OAuth** | 🟡 Awaiting Config | Login Facebook | GRATUITO | [link](./INTEGRATIONS_SETUP.md#8️⃣-facebook-oauth) |

### 🎯 **ESTRATÉGIA DE CUSTOS**
```
Mês 1-3: Tudo gratuito (0 reais)
Mês 4+: Apenas WhatsApp (~R$ 50-100/mês se 1.000 mensagens)
Mês 6+: SendGrid (~R$ 100/mês se >100 emails/dia)
```

---

## 💻 **Stack Tecnológico**

### **Frontend**
- React 18.3 + React DOM
- React Router v6 (navegação)
- Vite v5 (build tool)
- Tailwind CSS (styling)
- Axios (HTTP client)
- React Calendar (calendário)
- Date-fns (datas)

### **Backend**
- Node.js + Express
- sql.js (banco de dados local)
- JWT (autenticação)
- bcryptjs (criptografia)
- Multer (upload de arquivos)
- CORS (segurança)

### **Cloud & Integrações**
- Supabase (database + storage)
- Google Maps Embed (gratuito e ilimitado)
- Twilio WhatsApp Sandbox (gratuito)
- SendGrid Free (100 emails/dia grátis)
- Mercado Pago (gratuito no Brasil)
- Firebase (10k push/dia grátis)
- Google OAuth (gratuito)
- Facebook OAuth (gratuito)

---

## 🎯 **Começar Rápido**

### **Requisitos**
- Node.js ≥ 16
- npm ou yarn

### **Instalação**

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/piresqk-barbearia.git
cd piresqk-barbearia

# 2. Instalar dependências gerais
npm install

# 3. Instalar dependências do cliente
cd client && npm install && cd ..

# 4. Criar arquivo .env (copiar de .env.example)
cp .env.example .env
```

### **Configurar APIs Externas**

Leia o guia completo em [`INTEGRATIONS_SETUP.md`](./INTEGRATIONS_SETUP.md)

**Resumo dos Serviços Gratuitos:**
1. **Google Maps Embed**: Obter API Key no [Google Cloud](https://console.cloud.google.com) (ILIMITADO e gratuito)
2. **Twilio Sandbox**: Configurar em [twilio.com](https://twilio.com) (gratuito para testes)
3. **SendGrid Free**: Configurar em [sendgrid.com](https://sendgrid.com) (100 emails/dia grátis)
4. **Mercado Pago**: Configurar em [mercadopago.com.br](https://www.mercadopago.com.br/developers) (gratuito no Brasil)
5. **Firebase**: Configurar em [firebase.google.com](https://firebase.google.com) (10k notificações/dia grátis)

### **Rodar o Projeto**

```bash
# Desenvolvimento (servidor + cliente com hot reload)
npm run dev

# Ou use os scripts batch no Windows
.\dev.bat          # Abre 2 abas (server + client)
.\start.bat        # Produção

# Apenas servidor
npm run server

# Apenas cliente
npm run client

# Build para produção
npm run build
```

### **Acessar o App**

- 🌐 **Cliente:** http://localhost:5173
- 🔧 **Admin:** http://localhost:5173/admin/login
- 🖥️ **API:** http://localhost:3001/api

### **Credenciais Padrão Admin**
- **Email:** `pireskqk@gmail.com`
- **Senha:** `Yuri2209`

💡 **Alterar credenciais:** Acesse `/admin/setup`

---

## 📁 **Estrutura do Projeto**

```
PiresQKBarbearia/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── pages/                   # Páginas (Home, Booking, etc)
│   │   ├── components/              # Componentes reutilizáveis
│   │   ├── contexts/                # Context API (Auth, Settings)
│   │   ├── lib/                     # Utilitários (Supabase, etc)
│   │   └── App.jsx                  # Roteador principal
│   └── package.json
│
├── server/                          # Backend Node.js
│   ├── routes/                      # Rotas da API
│   ├── integrations/                # Integrações externas
│   │   ├── whatsapp.js
│   │   ├── sendgrid.js
│   │   ├── stripe.js
│   │   ├── firebase.js
│   │   ├── oauth.js
│   │   └── supabase.js
│   ├── middleware/                  # Middlewares (auth, etc)
│   ├── database.js                  # sql.js
│   └── server.js                    # Servidor Express
│
├── uploads/                         # Arquivos enviados (fotos/vídeos)
├── .env                             # Variáveis de ambiente (não commitar)
├── .env.example                     # Template de .env
├── INTEGRATIONS_SETUP.md           # Guia de configuração de APIs
└── package.json                     # Dependências gerais
```

---

## 🔐 **Segurança**

- ✅ Autenticação JWT com expiração de 7 dias
- ✅ Senhas criptografadas com bcryptjs
- ✅ CORS configurado para localhost
- ✅ Validação de entrada em todas as rotas
- ✅ Chaves de API em `.env` (não em Git)
- ✅ Middleware de autenticação em rotas protegidas
- ⚠️ HTTPS obrigatório em produção

---

## 📊 **Status do Desenvolvimento**

| Funcionalidade | Status | Data |
|---|---|---|
| Core (Auth, CRUD) | ✅ Completo | Mar 2024 |
| UI/UX (Tailwind) | ✅ Completo | Mar 2024 |
| Banco de Dados | ✅ Completo | Mar 2024 |
| **Google Maps Embed (GRATUITO)** | ✅ Implementado | Mar 2024 |
| Supabase Integration | ✅ Implementado | Mar 2024 |
| **Mercado Pago (GRATUITO)** | ✅ Implementado | Mar 2024 |
| WhatsApp (Twilio Sandbox) | 🟡 Pronto, awaiting key | Mar 2024 |
| Email (SendGrid Free) | 🟡 Pronto, awaiting key | Mar 2024 |
| Push Notifications (Firebase) | 🟡 Pronto, awaiting key | Mar 2024 |
| Social Login (Google/Facebook) | 🟡 Pronto, awaiting key | Mar 2024 |
| Cloud Backup | ✅ Implementado | Mar 2024 |

---

## 🐛 **Troubleshooting**

### **Porta 3001 ou 5173 em uso?**
```bash
# Mudar porta no .env
PORT=3002
```

### **Erro de CORS?**
Verifique se `http://localhost:5173` está em `corsOptions` no `server.js`

### **Banco de dados não salva?**
A database é um arquivo `barbearia.db` na raiz. Se deletou, será recriado na próxima execução.

### **Não recebe WhatsApp/Email?**
Leia a seção correspondente em `INTEGRATIONS_SETUP.md`

---

## 📞 **Contato & Suporte**

- 📧 **Email:** piresqkcortes@gmail.com
- 💬 **WhatsApp:** +55 (49) 99918-3044
- 🌐 **Instagram:** @piresqkcortes
- 🔗 **Facebook:** PiresQK Barbearia

---

## 📜 **Licença**

MIT License - Você é livre para usar, modificar e distribuir este projeto.

---

## 🙏 **Créditos**

Desenvolvido com ❤️ para PiresQK Barbearia

**Tech Stack:** React + Node.js + sql.js + Supabase + APIs Modernas

---

**Última atualização:** 7 de Março de 2024 - Versão 100% Gratuita 🚀
