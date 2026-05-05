// ─── Countries & Currencies ───────────────────────────────────────────────────

export type CountryCode = 'US' | 'IN' | 'NG';
export type CurrencyCode = 'USD' | 'INR' | 'NGN';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  country: CountryCode;
  flag: string;
  name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', country: 'US', flag: '🇺🇸', name: 'US Dollar' },
  INR: { code: 'INR', symbol: '₹', country: 'IN', flag: '🇮🇳', name: 'Indian Rupee' },
  NGN: { code: 'NGN', symbol: '₦', country: 'NG', flag: '🇳🇬', name: 'Nigerian Naira' },
};

// ─── Accounts ─────────────────────────────────────────────────────────────────

export type AccountType = 'checking' | 'savings' | 'credit' | 'cash' | 'investment' | 'crypto' | 'custom';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  balance: number; // stored in native currency
  color: string;
  icon?: string;
  customTypeName?: string; // if type === 'custom'
  createdAt: string;
  notes?: string;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // in native currency of the account
  currency: CurrencyCode;
  accountId: string;
  toAccountId?: string; // for transfers
  category: string;
  description: string;
  date: string; // ISO string
  isRecurring: boolean;
  recurringInterval?: 'weekly' | 'biweekly' | 'monthly';
  tags?: string[];
  createdAt: string;
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export interface Budget {
  id: string;
  category: string;
  limit: number; // in USD
  period: 'monthly';
  color: string;
  icon: string;
}

// ─── Pay Tracker ──────────────────────────────────────────────────────────────

export interface PaySchedule {
  startDate: string; // first payday ISO date
  amount: number; // USD
  fixedExpenses: FixedExpense[];
  savingsTarget: number; // USD per cycle
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number; // USD
  category: string;
}

export interface PayCycle {
  id: string;
  startDate: string;
  endDate: string;
  expectedPay: number;
  actualPay?: number;
  transactions: string[]; // transaction IDs
  notes?: string;
}

// ─── Dad's Debt ───────────────────────────────────────────────────────────────

export interface DebtPayment {
  id: string;
  amount: number;
  currency: CurrencyCode;
  date: string;
  notes?: string;
}

export interface DadDebt {
  totalOwed: number;
  currency: CurrencyCode;
  dateBorrowed: string;
  description: string;
  payments: DebtPayment[];
  notes?: string;
}

// ─── Exchange Rates ───────────────────────────────────────────────────────────

export interface ExchangeRates {
  base: 'USD';
  rates: Record<CurrencyCode, number>; // how many of X = 1 USD
  lastUpdated: string;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export type LifeStage = 'student' | 'working' | 'investor';
export type Theme = 'light' | 'dark';

export interface AppSettings {
  theme: Theme;
  lifeStage: LifeStage;
  sessionTimeoutMinutes: number;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface Category {
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'both';
}

export const DEFAULT_CATEGORIES: Category[] = [
  { name: 'Food & Dining', icon: '🍔', color: '#f97316', type: 'expense' },
  { name: 'Transport', icon: '🚗', color: '#3b82f6', type: 'expense' },
  { name: 'Housing', icon: '🏠', color: '#8b5cf6', type: 'expense' },
  { name: 'Utilities', icon: '💡', color: '#eab308', type: 'expense' },
  { name: 'Health', icon: '🏥', color: '#ef4444', type: 'expense' },
  { name: 'Education', icon: '📚', color: '#06b6d4', type: 'expense' },
  { name: 'Entertainment', icon: '🎮', color: '#ec4899', type: 'expense' },
  { name: 'Shopping', icon: '🛍️', color: '#f59e0b', type: 'expense' },
  { name: 'Subscriptions', icon: '📺', color: '#6366f1', type: 'expense' },
  { name: 'Savings', icon: '🏦', color: '#22c55e', type: 'expense' },
  { name: 'Salary', icon: '💼', color: '#14b8a6', type: 'income' },
  { name: 'Freelance', icon: '💻', color: '#a855f7', type: 'income' },
  { name: 'Gift', icon: '🎁', color: '#f43f5e', type: 'income' },
  { name: 'Other', icon: '📦', color: '#6b7280', type: 'both' },
];

// ─── Full App State (what gets encrypted) ────────────────────────────────────

export interface AppData {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  paySchedule: PaySchedule | null;
  payCycles: PayCycle[];
  dadDebt: DadDebt | null;
  settings: AppSettings;
  exchangeRates: ExchangeRates | null;
  version: string;
}
