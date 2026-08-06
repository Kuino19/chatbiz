# ChatBiz 🚀

**WhatsApp Commerce SaaS** — Automate orders, manage inventory, and collect payments directly inside WhatsApp.

Built for Nigerian businesses with Naira pricing, Twilio + Meta WhatsApp Cloud API support.

---

## ✨ Features

- 🤖 **24/7 WhatsApp Bot** — customers browse, order, and checkout via chat
- 📦 **Product Catalog** — manage products with inline editing, stock tracking, low-stock alerts
- 💳 **Payment Verification** — customers send payment proof, you approve in one click
- 📊 **Analytics Dashboard** — revenue, recent orders, top products
- 📄 **PDF Invoices** — auto-generated for every order
- 🔔 **Order Notifications** — Twilio WhatsApp alerts to customers on status changes
- ⚙️ **Settings** — webhook URL helpers, Meta API config, Test Bot UI

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | SQLite via Prisma + better-sqlite3 |
| Auth | NextAuth v5 (credentials) |
| WhatsApp | Twilio Sandbox + Meta WhatsApp Cloud API |
| PDF | pdfkit |
| Styling | Vanilla CSS Modules |

---

## 🚀 Getting Started

### 1. Clone and install
```bash
git clone https://github.com/Kuino19/chatbiz.git
cd chatbiz
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Fill in your values in `.env`.

### 3. Set up the database
```bash
npx prisma migrate dev --name init
```

### 4. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📡 WhatsApp Integration

### Twilio Sandbox (Testing)
1. Set your webhook URL in Twilio Console → Messaging → WhatsApp → Sandbox:
   ```
   https://your-domain.com/api/twilio/webhook
   ```
2. Set method to **HTTP POST**

### Meta Cloud API (Production)
1. Set webhook URL in Meta Developer Portal:
   ```
   https://your-domain.com/api/whatsapp/webhook
   ```
2. Save your Phone Number ID and Access Token in **Dashboard → Settings**

---

## 🌍 Deployment

Recommended: **Railway** (supports SQLite out of the box)

```bash
railway login
railway init
railway up
```

Set all env vars from `.env.example` in the Railway dashboard.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/                # Auth pages
│   ├── register/
│   ├── dashboard/
│   │   ├── page.tsx          # Stats & overview
│   │   ├── products/         # Product catalog management
│   │   ├── orders/           # Order management
│   │   └── settings/         # WhatsApp API config
│   └── api/
│       ├── twilio/webhook/   # Twilio incoming messages
│       └── whatsapp/webhook/ # Meta Cloud API messages
├── lib/
│   ├── whatsapp.ts           # Bot conversation logic
│   ├── twilio.ts             # Twilio client
│   └── pdf.ts                # Invoice generation
└── hooks/
    └── useToast.ts           # Toast notifications
```

---

## 📄 License

MIT
