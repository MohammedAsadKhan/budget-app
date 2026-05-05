import React, { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, Search, X } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils/currency';
import { Transaction, TransactionType, CurrencyCode, DEFAULT_CATEGORIES, CURRENCIES } from '../types';

export default function Transactions() {
  const { transactions, accounts, addTransaction } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ type: 'expense' as TransactionType, amount: '', currency: 'USD' as CurrencyCode, accountId: '', category: 'Food & Dining', description: '', date: new Date().toISOString().split('T')[0], isRecurring: false });

  const filtered = transactions.filter((t) =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.accountId) return;
    addTransaction({ ...form, amount: parseFloat(form.amount), tags: [] });
    setForm({ type: 'expense', amount: '', currency: 'USD', accountId: '', category: 'Food & Dining', description: '', date: new Date().toISOString().split('T')[0], isRecurring: false });
    setShowForm(false);
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Transactions</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> Add
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-brand-500/30 rounded-2xl p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white">New Transaction</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5 block">Type</label>
              <div className="flex gap-2">
                {(['income', 'expense', 'transfer'] as TransactionType[]).map((t) => (
                  <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors
                      ${form.type === t ? 'bg-brand-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5 block">Amount</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 text-sm" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5 block">Currency</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as CurrencyCode })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm">
                {Object.values(CURRENCIES).map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5 block">Account</label>
              <select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm" required>
                <option value="">Select account...</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5 block">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm">
                {DEFAULT_CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5 block">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm" required />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5 block">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What was this for?" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 text-sm" required />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="flex-1 bg-brand-500 hover:bg-brand-400 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">Save Transaction</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-2.5 rounded-xl transition-colors text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions..." className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 text-sm" />
      </div>

      {/* List */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">No transactions found.</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filtered.map((tx) => {
              const cat = DEFAULT_CATEGORIES.find((c) => c.name === tx.category);
              return (
                <div key={tx.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base ${tx.type === 'income' ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                      {cat?.icon ?? (tx.type === 'income' ? '💰' : '💸')}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{tx.description}</p>
                      <p className="text-gray-500 text-xs">{tx.category} · {new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-mono font-semibold text-sm ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
