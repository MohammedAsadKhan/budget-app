import { create } from 'zustand';
import { AppData, Account, Transaction, Budget, PaySchedule, PayCycle, DadDebt, DebtPayment, AppSettings, ExchangeRates, FixedExpense } from '../types';
import { saveEncryptedData, loadEncryptedData, getSessionPassword } from '../security/crypto';

const DEFAULT_DATA: AppData = {
  accounts: [],
  transactions: [],
  budgets: [],
  paySchedule: null,
  payCycles: [],
  dadDebt: null,
  settings: {
    theme: 'dark',
    lifeStage: 'student',
    sessionTimeoutMinutes: 30,
  },
  exchangeRates: null,
  version: '1.0.0',
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface AppStore extends AppData {
  // Auth
  isAuthenticated: boolean;
  setAuthenticated: (val: boolean) => void;

  // Data lifecycle
  loadData: (password: string) => boolean;
  persistData: () => void;
  resetData: () => void;

  // Accounts
  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Budgets
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Pay Tracker
  setPaySchedule: (schedule: PaySchedule) => void;
  addPayCycle: (cycle: Omit<PayCycle, 'id'>) => void;
  updatePayCycle: (id: string, updates: Partial<PayCycle>) => void;
  addFixedExpense: (expense: Omit<FixedExpense, 'id'>) => void;
  removeFixedExpense: (id: string) => void;

  // Dad's Debt
  setDadDebt: (debt: Omit<DadDebt, 'payments'>) => void;
  addDebtPayment: (payment: Omit<DebtPayment, 'id'>) => void;
  deleteDebtPayment: (id: string) => void;

  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Exchange Rates
  setExchangeRates: (rates: ExchangeRates) => void;
}

export const useStore = create<AppStore>((set, get) => ({
  ...DEFAULT_DATA,
  isAuthenticated: false,

  setAuthenticated: (val) => set({ isAuthenticated: val }),

  loadData: (password) => {
    const raw = loadEncryptedData(password);
    if (!raw) {
      // First time — start fresh
      set({ ...DEFAULT_DATA, isAuthenticated: true });
      return true;
    }
    try {
      const data = raw as AppData;
      set({ ...DEFAULT_DATA, ...data, isAuthenticated: true });
      return true;
    } catch {
      return false;
    }
  },

  persistData: () => {
    const password = getSessionPassword();
    if (!password) return;
    const { isAuthenticated, setAuthenticated, loadData, persistData, resetData,
      addAccount, updateAccount, deleteAccount,
      addTransaction, updateTransaction, deleteTransaction,
      addBudget, updateBudget, deleteBudget,
      setPaySchedule, addPayCycle, updatePayCycle, addFixedExpense, removeFixedExpense,
      setDadDebt, addDebtPayment, deleteDebtPayment,
      updateSettings, setExchangeRates,
      ...data } = get();
    saveEncryptedData(data, password);
  },

  resetData: () => set({ ...DEFAULT_DATA, isAuthenticated: false }),

  // ─── Accounts ───────────────────────────────────────────────────────────────

  addAccount: (account) => {
    const newAccount: Account = { ...account, id: generateId(), createdAt: new Date().toISOString() };
    set((s) => ({ accounts: [...s.accounts, newAccount] }));
    get().persistData();
  },

  updateAccount: (id, updates) => {
    set((s) => ({ accounts: s.accounts.map((a) => a.id === id ? { ...a, ...updates } : a) }));
    get().persistData();
  },

  deleteAccount: (id) => {
    set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) }));
    get().persistData();
  },

  // ─── Transactions ────────────────────────────────────────────────────────────

  addTransaction: (tx) => {
    const newTx: Transaction = { ...tx, id: generateId(), createdAt: new Date().toISOString() };
    set((s) => ({ transactions: [newTx, ...s.transactions] }));
    // update account balance
    const account = get().accounts.find((a) => a.id === tx.accountId);
    if (account) {
      const delta = tx.type === 'income' ? tx.amount : -tx.amount;
      get().updateAccount(tx.accountId, { balance: account.balance + delta });
    }
    get().persistData();
  },

  updateTransaction: (id, updates) => {
    set((s) => ({ transactions: s.transactions.map((t) => t.id === id ? { ...t, ...updates } : t) }));
    get().persistData();
  },

  deleteTransaction: (id) => {
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
    get().persistData();
  },

  // ─── Budgets ─────────────────────────────────────────────────────────────────

  addBudget: (budget) => {
    set((s) => ({ budgets: [...s.budgets, { ...budget, id: generateId() }] }));
    get().persistData();
  },

  updateBudget: (id, updates) => {
    set((s) => ({ budgets: s.budgets.map((b) => b.id === id ? { ...b, ...updates } : b) }));
    get().persistData();
  },

  deleteBudget: (id) => {
    set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) }));
    get().persistData();
  },

  // ─── Pay Tracker ─────────────────────────────────────────────────────────────

  setPaySchedule: (schedule) => {
    set({ paySchedule: schedule });
    get().persistData();
  },

  addPayCycle: (cycle) => {
    set((s) => ({ payCycles: [...s.payCycles, { ...cycle, id: generateId() }] }));
    get().persistData();
  },

  updatePayCycle: (id, updates) => {
    set((s) => ({ payCycles: s.payCycles.map((c) => c.id === id ? { ...c, ...updates } : c) }));
    get().persistData();
  },

  addFixedExpense: (expense) => {
    const newExp: FixedExpense = { ...expense, id: generateId() };
    set((s) => ({
      paySchedule: s.paySchedule
        ? { ...s.paySchedule, fixedExpenses: [...s.paySchedule.fixedExpenses, newExp] }
        : s.paySchedule,
    }));
    get().persistData();
  },

  removeFixedExpense: (id) => {
    set((s) => ({
      paySchedule: s.paySchedule
        ? { ...s.paySchedule, fixedExpenses: s.paySchedule.fixedExpenses.filter((e) => e.id !== id) }
        : s.paySchedule,
    }));
    get().persistData();
  },

  // ─── Dad's Debt ──────────────────────────────────────────────────────────────

  setDadDebt: (debt) => {
    set((s) => ({ dadDebt: { ...debt, payments: s.dadDebt?.payments ?? [] } }));
    get().persistData();
  },

  addDebtPayment: (payment) => {
    const newPayment: DebtPayment = { ...payment, id: generateId() };
    set((s) => ({
      dadDebt: s.dadDebt ? { ...s.dadDebt, payments: [...s.dadDebt.payments, newPayment] } : s.dadDebt,
    }));
    get().persistData();
  },

  deleteDebtPayment: (id) => {
    set((s) => ({
      dadDebt: s.dadDebt
        ? { ...s.dadDebt, payments: s.dadDebt.payments.filter((p) => p.id !== id) }
        : s.dadDebt,
    }));
    get().persistData();
  },

  // ─── Settings ────────────────────────────────────────────────────────────────

  updateSettings: (updates) => {
    set((s) => ({ settings: { ...s.settings, ...updates } }));
    get().persistData();
  },

  // ─── Exchange Rates ───────────────────────────────────────────────────────────

  setExchangeRates: (rates) => {
    set({ exchangeRates: rates });
    get().persistData();
  },
}));
