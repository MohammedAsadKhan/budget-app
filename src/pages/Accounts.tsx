import React, { useState } from 'react';
import { Plus, Wallet, TrendingUp, Trash2, Edit2, X } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, toUSD, getTransferRate } from '../utils/currency';
import { Account, AccountType, CurrencyCode, CURRENCIES } from '../types';

const ACCOUNT_TYPES: { value: AccountType; label: string; icon: string }[] = [
  { value: 'checking', label: 'Checking', icon: '🏦' },
  { value: 'savings', label: 'Savings', icon: '💰' },
  { value: 'credit', label: 'Credit Card', icon: '💳' },
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'investment', label: 'Investment', icon: '📈' },
  { value: 'crypto', label: 'Crypto', icon: '₿' },
  { value: 'custom', label: 'Custom', icon: '🗂️' },
];

const COLORS = ['#14b8a6', '#a855f7', '#f97316', '#eab308', '#ef4444', '#22c55e', '#3b82f6', '#ec4899'];

export default function Accounts() {
  const { accounts, exchangeRates, addAccount, deleteAccount } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'checking' as AccountType, currency: 'USD' as CurrencyCode, balance: '', color: COLORS[0], notes: '', customTypeName: '' });

  const rates = exchangeRates;

  const totalUSD = rates ? accounts.reduce((s, a) => s + toUSD(a.balance, a.currency, rates), 0) : 0;

  // Group by country
  const grouped = {
    '🇺🇸 USA': accounts.filter((a) => a.currency === 'USD'),
    '🇮🇳 India': accounts.filter((a) => a.currency === 'INR'),
    '🇳🇬 Nigeria': accounts.filter((a) => a.currency === 'NGN'),
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addAccount({ name: form.name, type: form.type, currency: form.currency, balance: parseFloat(form.balance) || 0, color: form.color, notes: form.notes, customTypeName: form.customTypeName });
    setForm({ name: '', type: 'checking', currency: 'USD', balance: '', color: COLORS[0], notes: '', customTypeName: '' });
    setShowForm(false);
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Accounts</h1>
          <p className="text-gray-400 text-sm mt-0.5">Net worth: <span className="text-white font-mono font-semibold">{formatCurrency(totalUSD, 'USD')}</span></p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> Add Account
        </button>
      </div>

      {/* Add Account Form */}
      {showForm && (
        <div className="bg-gray-900 border border-brand-500/30 rounded-2xl p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white">New Account</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5 block">Account Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Chase Checking" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 text-sm" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5 block">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as AccountType })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm">
                {ACCOUNT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5 block">Currency</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as CurrencyCode })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm">
                {Object.values(CURRENCIES).map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
              </select>
            </div>
            {form.type === 'custom' && (
              <div className="col-span-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5 block">Custom Type Name</label>
                <input value={form.customTypeName} onChange={(e) => setForm({ ...form, customTypeName: e.target.value })}
                  placeholder="e.g. Mobile Money" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 text-sm" />
              </div>
            )}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5 block">Current Balance</label>
              <input type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })}
                placeholder="0.00" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5 block">Color</label>
              <div className="flex gap-2 flex-wrap pt-1">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                    className={`w-6 h-6 rounded-full transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : ''}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="col-span-2 flex gap-3 pt-1">
              <button type="submit" className="flex-1 bg-brand-500 hover:bg-brand-400 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">Add Account</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-2.5 rounded-xl transition-colors text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts grouped by country */}
      {Object.entries(grouped).map(([country, accs]) => {
        if (accs.length === 0) return null;
        const currency = accs[0].currency;
        const totalLocal = accs.reduce((s, a) => s + a.balance, 0);
        const totalUSDGroup = rates ? accs.reduce((s, a) => s + toUSD(a.balance, a.currency, rates), 0) : 0;
        const transferRate = rates && currency !== 'USD' ? getTransferRate(currency, rates) : null;

        return (
          <div key={country}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-gray-300">{country}</h2>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-mono text-white">{formatCurrency(totalLocal, currency)}</span>
                {currency !== 'USD' && rates && (
                  <>
                    <span className="text-gray-500">≈ {formatCurrency(totalUSDGroup, 'USD')}</span>
                    {transferRate && <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">{transferRate}</span>}
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {accs.map((account) => (
                <AccountCard key={account.id} account={account} rates={rates} onDelete={() => deleteAccount(account.id)} />
              ))}
            </div>
          </div>
        );
      })}

      {accounts.length === 0 && !showForm && (
        <div className="text-center py-16 text-gray-500">
          <Wallet size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No accounts yet. Add your first one above.</p>
        </div>
      )}
    </div>
  );
}

function AccountCard({ account, rates, onDelete }: { account: Account; rates: any; onDelete: () => void }) {
  const usdVal = rates ? toUSD(account.balance, account.currency, rates) : null;
  const typeInfo = ACCOUNT_TYPES.find((t) => t.value === account.type);

  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-4 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: account.color + '22' }}>
            {typeInfo?.icon}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{account.name}</p>
            <p className="text-gray-500 text-xs">{account.type === 'custom' ? account.customTypeName : typeInfo?.label}</p>
          </div>
        </div>
        <button onClick={onDelete} className="text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1">
          <Trash2 size={14} />
        </button>
      </div>
      <p className="font-display font-bold text-xl text-white">{formatCurrency(account.balance, account.currency)}</p>
      {account.currency !== 'USD' && usdVal !== null && (
        <p className="text-gray-500 text-xs mt-0.5 font-mono">≈ {formatCurrency(usdVal, 'USD')}</p>
      )}
      <div className="w-full h-0.5 rounded-full mt-3" style={{ background: account.color + '60' }} />
    </div>
  );
}
