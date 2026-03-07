# 🚀 Guia de Integração de APIs - PiresQK Barbearia (VERSÃO GRATUITA)

Este documento descreve como configurar todas as integrações de APIs externas **GRATUITAS** para transformar seu projeto em produção.

---

## 📋 Checklist Rápido - Serviços Gratuitos

- [x] Supabase ✅ (JÁ CONFIGURADO - 500MB/mês grátis)
- [x] Google Maps Embed ✅ (ILIMITADO e gratuito)
- [ ] Twilio WhatsApp Sandbox (GRATUITO para testes)
- [ ] SendGrid Free (100 emails/dia grátis)
- [ ] Mercado Pago (GRATUITO no Brasil)
- [ ] Firebase Push (10k notificações/dia grátis)
- [ ] Google OAuth (GRATUITO)
- [ ] Facebook OAuth (GRATUITO)

---

## 1️⃣ SUPABASE ✅ (PRONTO)

✅ **Já está configurado no `.env`**

**Arquivo:** `.env`
```
VITE_SUPABASE_URL=https://wibwysbyxgdhmtdarjeif.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

**Funcionalidades:**
- 💾 Cloud Storage para backups automáticos
- 🖼️ Upload de fotos/vídeos da galeria
- 🔄 Sincronização de dados com nuvem

---

## 2️⃣ GOOGLE MAPS EMBED (ILIMITADO E GRATUITO)

### Como Obter a Chave:

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou use existente
3. **IMPORTANTE:** Ative apenas a `Maps Embed API` (não a JavaScript API)
4. Crie uma credencial do tipo "API Key"
5. **NÃO** restrinja a chave (deixe sem restrições para embed funcionar)
6. Copie a chave

### Configurar no `.env`:

```env
VITE_GOOGLE_MAPS_EMBED_API_KEY=AIzaSyD...sua_chave_aqui...
```

### Vantagens da Embed API:
- ✅ **GRATUITA E ILIMITADA** - Sem custos por carregamento
- ✅ **Mais simples** - Apenas iframe, sem JavaScript complexo
- ✅ **Mais confiável** - Menos chances de erro
- ✅ **Responsiva** - Adapta automaticamente ao tamanho

### Como Funciona:
- Mapa é carregado via iframe do Google
- Mostra localização da barbearia
- Overlay com informações da empresa
- Zoom e controles padrão do Google

### Testar:
Acesse: `http://localhost:5173/contact`

---

## 3️⃣ TWILIO WHATSAPP SANDBOX (GRATUITO PARA TESTES)

### Como Obter:

1. Acesse [Twilio.com](https://www.twilio.com/)
2. Crie uma conta gratuita
3. Vá para "Messaging" → "Try it out" → "WhatsApp"
4. Configure o WhatsApp Sandbox
5. Pegue seu `Account SID`, `Auth Token` e número WhatsApp

### Configurar no `.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+1234567890
```

### Limitações Gratuitas:
- ✅ **GRATUITO** para desenvolvimento e testes
- ✅ Até 1.000 mensagens/mês
- ✅ Apenas para números verificados no sandbox
- ⚠️ Para produção: ~US$ 0,005–0,07 por mensagem

### Como Funciona:
- Quando um agendamento é criado → WhatsApp automático para o cliente
- Quando um agendamento é confirmado → Notificação via WhatsApp

### Testar:
```bash
curl -X POST http://localhost:3001/api/appointments/create \
  -H "Content-Type: application/json" \
  -d '{"client_id":1,"service_id":1,"barber_id":1,"date":"2024-03-15","time":"14:00"}'
```

---

## 4️⃣ SENDGRID FREE (100 EMAILS/DIA GRÁTIS)

### Como Obter:

1. Acesse [SendGrid.com](https://sendgrid.com/)
2. Crie uma conta gratuita
3. Vá para Settings → API Keys
4. Crie uma nova chave
5. Verifique seu email para confirmação

### Configurar no `.env`:

```env
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@piresqk.com
```

### Limites Gratuitos:
- ✅ **100 emails/dia** grátis
- ✅ Depois: planos a partir de US$ 15/mês
- ✅ Sem limite de contatos

### Como Funciona:
- Confirmação de agendamento por email
- Emails de lembrete 24h antes
- Notificação de cancelamento

---

## 5️⃣ MERCADO PAGO (GRATUITO NO BRASIL)

### Como Obter:

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Crie uma conta (use sua conta Mercado Pago existente)
3. Vá para "Suas integrações" → "Nova aplicação"
4. Escolha "Pagamentos" como tipo
5. Pegue as credenciais de teste

### Configurar no `.env`:

```env
VITE_MERCADO_PAGO_PUBLIC_KEY=TEST_your_public_key
MERCADO_PAGO_ACCESS_TOKEN=TEST_your_access_token
```

### Vantagens no Brasil:
- ✅ **GRATUITO** - Sem mensalidade
- ✅ **PIX gratuito** - Principal método de pagamento brasileiro
- ✅ **Cartão de crédito** - Taxas competitivas
- ✅ **Checkout transparente** - Integração fácil

### Métodos de Pagamento:
- 💳 **Cartão de Crédito** (Visa, Mastercard, etc.)
- 📱 **PIX** (pagamento instantâneo brasileiro)
- 💰 **Boleto** (para pagamentos parcelados)

### Como Funciona:
- Cliente paga no agendamento
- Agendamento é confirmado após pagamento
- Recibos automáticos por email

### Testar com Cartão:
- Número: `5031 4332 1540 6351`
- Data: Qualquer data futura
- CVC: `123`
- Nome: Qualquer nome

---

## 6️⃣ FIREBASE PUSH NOTIFICATIONS (10K/DIA GRÁTIS)

### Como Obter:

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Vá para Configurações → Contas de Serviço
4. Gere uma nova chave privada JSON
5. Copie os dados

### Configurar no `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@seu-projeto.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
```

### Limites Gratuitos:
- ✅ **10.000 notificações/dia** grátis
- ✅ **Sem custo** para push notifications
- ⚠️ Pago apenas se usar outros serviços (Firestore, Hosting)

### Como Funciona:
- Notificação push antes do agendamento
- Alertas de cancelamento
- Lembretes automáticos

---

## 7️⃣ GOOGLE OAUTH (GRATUITO)

### Como Obter:

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Vá para Credenciais
3. Crie uma credencial do tipo "ID de Cliente de Aplicação da Web"
4. Adicione URIs autorizadas:
   - `http://localhost:5173`
   - `http://localhost:5173/login`
5. Copie o Client ID

### Configurar no `.env`:

```env
VITE_GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
```

### Limites Gratuitos:
- ✅ **GRATUITO** - Sem custos
- ⚠️ Limite de ~10.000 requisições/dia por projeto

---

## 8️⃣ FACEBOOK OAUTH (GRATUITO)

### Como Obter:

1. Acesse [Meta Developers](https://developers.facebook.com/)
2. Crie um app
3. Vá para Configuração → Básico
4. Copie o App ID

### Configurar no `.env`:

```env
VITE_FACEBOOK_APP_ID=seu_facebook_app_id
```

### Limites Gratuitos:
- ✅ **GRATUITO** - Sem custos diretos
- ⚠️ Limite de requisições por app

---

## 🔧 Instalar Todas as Dependências

Se ainda não instalou, rode:

```bash
cd PiresQKBarbearia
npm install twilio @sendgrid/mail mercadopago firebase-admin google-auth-library
```

---

## 📝 Atualizar `.env` com Suas Credenciais Gratuitas

Crie na raiz do projeto um arquivo `.env` com:

```env
# SUPABASE CONFIG (JÁ CONFIGURADO)
VITE_SUPABASE_URL=https://wibwysbyxgdhmtdarjeif.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# GOOGLE MAPS EMBED - GRATUITO E ILIMITADO
VITE_GOOGLE_MAPS_EMBED_API_KEY=AIzaSyD...

# TWILIO WHATSAPP SANDBOX - GRATUITO
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=+1234567890

# SENDGRID FREE - 100 EMAILS/DIA GRATUITOS
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@piresqk.com

# MERCADO PAGO - GRATUITO NO BRASIL
VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-...
MERCADO_PAGO_ACCESS_TOKEN=TEST-...

# FIREBASE - 10K PUSH/DIA GRATUITOS
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
FIREBASE_CLIENT_EMAIL=...

# GOOGLE AUTH - GRATUITO
VITE_GOOGLE_CLIENT_ID=...apps.googleusercontent.com

# FACEBOOK AUTH - GRATUITO
VITE_FACEBOOK_APP_ID=...
```

---

## 🚀 Testar Integrações Gratuitas

### 1. Google Maps Embed
Acesse: `http://localhost:5173/contact`

### 2. WhatsApp (Sandbox)
```bash
curl -X POST http://localhost:3001/api/appointments/1/send-whatsapp \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Email (SendGrid Free)
```bash
curl -X POST http://localhost:3001/api/appointments/1/send-email \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Mercado Pago
Acesse: `http://localhost:5173/booking` e complete o agendamento

### 5. Push Notifications
Registre seu dispositivo e aguarde notificação

---

## 💡 Dicas para Serviços Gratuitos

1. **Google Maps Embed** é a melhor opção - gratuita e ilimitada
2. **Mercado Pago** é perfeito para o Brasil - sem custos
3. **SendGrid Free** dá 100 emails/dia - suficiente para começar
4. **Twilio Sandbox** é gratuito para desenvolvimento
5. **Firebase** é gratuito para push notifications
6. **OAuth** (Google/Facebook) são gratuitos

### Estratégia de Custos:
```
Mês 1-3: Tudo gratuito
Mês 4+: Apenas WhatsApp (~R$ 50-100/mês se 1.000 mensagens)
Mês 6+: SendGrid (~R$ 100/mês se >100 emails/dia)
```

---

## 🐛 Troubleshooting - Versão Gratuita

### **Google Maps não carrega?**
- Verifique se ativou apenas "Maps Embed API" (não JavaScript API)
- Deixe a chave sem restrições para testes

### **Mercado Pago não funciona?**
- Use sempre as credenciais de TESTE
- Para produção, remova "TEST-" das chaves

### **SendGrid bloqueia emails?**
- Use sempre o mesmo domínio de envio
- Verifique se o email do destinatário existe

### **Twilio WhatsApp não envia?**
- Sandbox só funciona para números verificados
- Para produção, precisa de aprovação do WhatsApp Business

---

## 📞 Support

Para dúvidas sobre configurações gratuitas, consulte:

- **Supabase:** https://supabase.com/docs
- **Google Maps:** https://developers.google.com/maps/documentation/embed
- **Mercado Pago:** https://www.mercadopago.com.br/developers
- **SendGrid:** https://docs.sendgrid.com/
- **Twilio:** https://www.twilio.com/docs/whatsapp

---

**PiresQK Barbearia © 2024 - Versão 100% Gratuita** 💛
