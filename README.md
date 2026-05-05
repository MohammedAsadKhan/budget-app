# 💰 MoFinance

> A secure, full-featured personal budgeting web app — built to grow with you from student life to long-term wealth building.

MoFinance is a **100% local, encrypted** budgeting tool. No accounts, no subscriptions, no cloud. Your financial data lives on your device, locked behind AES-256 encryption and a bcrypt-hashed password only you know.

Built as a software engineering portfolio project using React, TypeScript, and Tailwind CSS.

---

## ✨ Features

### 🔐 Security First
- AES-256-CBC encryption with PBKDF2 key derivation (10,000 iterations)
- bcrypt password hashing with 12 salt rounds — password never stored in plain text
- Session auto-locks after 30 minutes of inactivity
- Encrypted `.enc` backup export — useless without your password
- Zero cloud, zero backend, zero data leaks

### 🌍 Multi-Currency Support
- Track accounts in **USD 🇺🇸**, **INR 🇮🇳**, and **NGN 🇳🇬**
- Live exchange rates fetched automatically
- Non-USD accounts display local balance + USD equivalent + live transfer rate

### 📆 Biweekly Pay Tracker
- Built around a biweekly pay schedule
- Cycle timeline bar showing exactly where you are in the period
- Health score (0–100) based on spending vs budget
- Daily spend rate vs max daily budget
- Week 1 vs Week 2 breakdown chart
- Savings streak counter across cycles
- Fixed expense management per cycle

### 🏦 Accounts
- Checking, savings, credit, cash, investment, crypto, and custom types
- Grouped by country with per-group totals
- Live USD equivalent for foreign accounts

### 💸 Transactions
- Log income, expenses, and transfers
- Category system with icons
- Search and filter

### 📊 Budgets
- Monthly spending limits per category
- Live progress bars with over-budget alerts

### 👨‍👧 Dad's Debt
- Dedicated page to track money owed to family
- Payment history with repayment progress
- No interest tracking (halal ✅)

### 📈 Reports
- 6-month income vs expense bar chart
- Spending by category pie chart
- Net savings trend line chart

### ⚙️ Settings
- Dark / Light mode toggle
- Life stage mode: Student → Working → Investor
- Encrypted data export and import
- Full data reset

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React + TypeScript |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Charts | Recharts |
| Encryption | crypto-js (AES-256 + PBKDF2) |
| Password Hashing | bcryptjs |
| Exchange Rates | exchangerate-api.com |

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/mofinance.git
cd mofinance

# Install dependencies
npm install

# Start the dev server
npm start
```

Open http://localhost:3000 in your browser. On first launch you'll be prompted to create a master password — this encrypts all your data.

> ⚠️ If you forget your password, your data cannot be recovered. There is no reset.

---

## 📁 Project Structure

```
src/
├── security/        # AES-256 encryption, bcrypt hashing, session management
├── store/           # Zustand global state with automatic encrypted persistence
├── types/           # TypeScript interfaces for all app data
├── utils/           # Currency conversion, pay cycle calculations
├── pages/           # Dashboard, Accounts, Transactions, PayTracker, Budgets, etc.
└── components/
    ├── layout/      # Sidebar navigation
    └── ui/          # Reusable UI components
```

---

## 🔒 How the Security Works

1. On first launch, you create a password. It is hashed with **bcrypt** (12 rounds) and stored — the plain password is never saved anywhere.
2. Every time you make a change, the full app state is serialized to JSON, encrypted with **AES-256-CBC**, and written to localStorage. The encryption key is derived from your password using **PBKDF2** with a random salt.
3. On login, your password is verified against the bcrypt hash, then used to derive the decryption key. If the password is wrong, the data cannot be decrypted.
4. Your session lives in sessionStorage (cleared when the tab closes) and expires after 30 minutes of inactivity.

---

## 📄 License

MIT
