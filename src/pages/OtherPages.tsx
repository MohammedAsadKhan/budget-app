import React, { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils/currency';
import { Budget, DEFAULT_CATEGORIES } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LineChart, Line } from 'recharts';

// ─── Budgets ──────────────────────────────────────────────────────────────────

export function Budgets() {
  const { budgets, transactions, addBudget, deleteBudget } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'Food & Dining', limit: '', color: '#14b8a6', icon: '🍔' });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  function getSpent(category: string) {
    return transactions
      .filter((t) => t.type === 'expense' && t.category === category && new Date(t.date) >= monthStart)
      .reduce((s, t) => s + t.amount, 0);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cat = DEFAULT_CATEGORIES.find((c) => c.name === form.category);
    addBudget({ category: form.category, limit: parseFloat(form.limit), color: cat?.color ?? form.color, icon: cat?.icon ?? '📦', period: 'monthly' });
    setForm({ category: 'Food & Dining', limit: '', color: '#14b8a6', icon: '🍔' });
    setShowForm(false);
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">Budgets</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> Add Budget
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-brand-500/30 rounded-2xl p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white">New Budget</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5 block">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand-500 text-sm">
                  {DEFAULT_CATEGORIES.filter((c) => c.type !== 'income').map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5 block">Monthly Limit (USD)</label>
                <input type="number" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })}
                  placeholder="e.g. 300" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 text-sm" required />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-brand-500 hover:bg-brand-400 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">Save Budget</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-800 text-gray-300 font-semibold py-2.5 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {budgets.length === 0 && !showForm ? (
        <div className="py-12 text-center text-gray-500 text-sm">No budgets set. Add one to start tracking.</div>
      ) : (
        <div className="space-y-3">
          {budgets.map((b) => {
            const spent = getSpent(b.category);
            const pct = Math.min(100, (spent / b.limit) * 100);
            const over = spent > b.limit;
            return (
              <div key={b.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{b.icon}</span>
                    <span className="text-white font-medium text-sm">{b.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-sm font-semibold ${over ? 'text-red-400' : 'text-white'}`}>
                      {formatCurrency(spent, 'USD')} <span className="text-gray-500 font-normal">/ {formatCurrency(b.limit, 'USD')}</span>
                    </span>
                    <button onClick={() => deleteBudget(b.id)} className="text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: over ? '#ef4444' : b.color }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-xs ${over ? 'text-red-400' : 'text-gray-500'}`}>{over ? `Over by ${formatCurrency(spent - b.limit, 'USD')}` : `${formatCurrency(b.limit - spent, 'USD')} remaining`}</span>
                  <span className="text-xs text-gray-500">{pct.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export function Reports() {
  const { transactions } = useStore();

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { month: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), month_num: d.getMonth() };
  });

  const monthlyData = last6Months.map(({ month, year, month_num }) => {
    const income = transactions.filter((t) => t.type === 'income' && new Date(t.date).getMonth() === month_num && new Date(t.date).getFullYear() === year).reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === 'expense' && new Date(t.date).getMonth() === month_num && new Date(t.date).getFullYear() === year).reduce((s, t) => s + t.amount, 0);
    return { month, income, expense, saved: income - expense };
  });

  const categoryData = DEFAULT_CATEGORIES.filter((c) => c.type !== 'income').map((cat) => ({
    name: cat.name,
    value: transactions.filter((t) => t.type === 'expense' && t.category === cat.name).reduce((s, t) => s + t.amount, 0),
    color: cat.color,
    icon: cat.icon,
  })).filter((c) => c.value > 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-4xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-white">Reports</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="font-display font-semibold text-white mb-4">Income vs Expenses (6 months)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData}>
            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }} formatter={(v: any) => [`$${Number(v).toFixed(0)}`, '']} />
            <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white mb-4">Spending by Category</h2>
          {categoryData.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No expense data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }} formatter={(v: any) => [`$${v.toFixed(2)}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="font-display font-semibold text-white mb-4">Net Savings Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }} formatter={(v: any) => [`$${v.toFixed(0)}`, 'Saved']} />
              <Line type="monotone" dataKey="saved" stroke="#14b8a6" strokeWidth={2} dot={{ fill: '#14b8a6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function Settings() {
  const { settings, updateSettings, resetData } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-white">Settings</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl divide-y divide-gray-800">
        {/* Theme */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium">Theme</p>
            <p className="text-gray-500 text-xs">Light or dark mode</p>
          </div>
          <div className="flex gap-2">
            {(['dark', 'light'] as const).map((t) => (
              <button key={t} onClick={() => updateSettings({ theme: t })}
                className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${settings.theme === t ? 'bg-brand-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Life Stage */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium">Life Stage</p>
            <p className="text-gray-500 text-xs">Adjusts budget recommendations</p>
          </div>
          <div className="flex gap-2">
            {(['student', 'working', 'investor'] as const).map((s) => (
              <button key={s} onClick={() => updateSettings({ lifeStage: s })}
                className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${settings.lifeStage === s ? 'bg-brand-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-5">
        <h2 className="text-red-400 font-semibold mb-3">Danger Zone</h2>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-sm transition-colors">
            Reset All Data
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-300 text-sm">This will permanently delete all your data. Are you sure?</p>
            <div className="flex gap-3">
              <button onClick={() => { resetData(); localStorage.clear(); sessionStorage.clear(); }} className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">Yes, Delete Everything</button>
              <button onClick={() => setConfirmReset(false)} className="bg-gray-800 text-gray-300 px-4 py-2 rounded-xl text-sm transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
