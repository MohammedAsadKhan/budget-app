import React, { useState } from 'react';
import { Calendar, Zap, TrendingDown, PiggyBank, Clock, Plus, Trash2, Trophy, Flame } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils/currency';
import { getCurrentCycle, getDaysRemaining, getDaysElapsed, getDaysInCycle, getCycleTransactions, getCycleSpent, getCycleHealthScore, getHealthLabel, getDailySpendRate, getMaxDailyBudget, getWeeklyBreakdown, getNextPayday } from '../utils/payTracker';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PaySchedule, FixedExpense } from '../types';

export default function PayTracker() {
  const { paySchedule, transactions, payCycles, setPaySchedule, addFixedExpense, removeFixedExpense } = useStore();
  const [setupMode, setSetupMode] = useState(!paySchedule);
  const [setupData, setSetupData] = useState({ startDate: '', amount: '', savingsTarget: '' });
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: 'Housing' });
  const [showAddExpense, setShowAddExpense] = useState(false);

  function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setPaySchedule({
      startDate: setupData.startDate,
      amount: parseFloat(setupData.amount),
      savingsTarget: parseFloat(setupData.savingsTarget) || 0,
      fixedExpenses: [],
    });
    setSetupMode(false);
  }

  function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    addFixedExpense({ name: newExpense.name, amount: parseFloat(newExpense.amount), category: newExpense.category });
    setNewExpense({ name: '', amount: '', category: 'Housing' });
    setShowAddExpense(false);
  }

  if (setupMode || !paySchedule) {
    return <SetupScreen setupData={setupData} setSetupData={setSetupData} onSubmit={handleSetup} />;
  }

  const cycle = getCurrentCycle(paySchedule);
  const daysElapsed = getDaysElapsed(cycle.start);
  const daysLeft = getDaysRemaining(cycle.end);
  const totalDays = getDaysInCycle(cycle);
  const progress = Math.min(100, (daysElapsed / totalDays) * 100);

  const cycleTxs = getCycleTransactions(transactions, cycle.start, cycle.end);
  const spent = getCycleSpent(cycleTxs);
  const fixedTotal = paySchedule.fixedExpenses.reduce((s, e) => s + e.amount, 0);
  const spendable = paySchedule.amount - fixedTotal - paySchedule.savingsTarget;
  const remaining = Math.max(0, spendable - spent);
  const saved = paySchedule.amount - fixedTotal - spent;

  const healthScore = getCycleHealthScore(spent, paySchedule, daysElapsed, totalDays);
  const health = getHealthLabel(healthScore);
  const dailyRate = getDailySpendRate(spent, daysElapsed);
  const maxDaily = getMaxDailyBudget(paySchedule, daysLeft);
  const nextPayday = getNextPayday(paySchedule);
  const { week1, week2 } = getWeeklyBreakdown(cycleTxs, cycle.start);

  // Savings streak (simplified: count cycles where saved >= target)
  const streak = payCycles.filter((c) => {
    const cTxs = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= new Date(c.startDate) && d <= new Date(c.endDate) && t.type === 'expense';
    });
    const cSpent = getCycleSpent(cTxs);
    const cSaved = paySchedule.amount - fixedTotal - cSpent;
    return cSaved >= paySchedule.savingsTarget;
  }).length;

  const weeklyData = [
    { name: 'Week 1', spent: week1, budget: spendable / 2 },
    { name: 'Week 2', spent: week2, budget: spendable / 2 },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Pay Tracker</h1>
          <p className="text-gray-400 text-sm mt-0.5">Biweekly cycle · {formatCurrency(paySchedule.amount, 'USD')} per pay</p>
        </div>
        <button onClick={() => setSetupMode(true)} className="text-xs text-gray-500 hover:text-brand-400 transition-colors">Edit Setup</button>
      </div>

      {/* Cycle Timeline */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Current Cycle</p>
            <p className="text-white font-medium mt-0.5">
              {cycle.start.toLocaleDateString()} → {cycle.end.toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Next payday</p>
            <p className="text-brand-300 font-mono font-bold text-lg">{daysLeft}d</p>
          </div>
        </div>
        {/* Timeline Bar */}
        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-brand-500 to-brand-300 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-gray-500">
          <span>Day {daysElapsed}</span>
          <span>{Math.round(progress)}% through cycle</span>
          <span>Day {totalDays}</span>
        </div>
      </div>

      {/* Health Score + Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Score */}
        <div className="col-span-2 lg:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center">
          <div className="relative w-20 h-20 mb-2">
            <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#1f2937" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke={health.color} strokeWidth="8"
                strokeDasharray={`${(healthScore / 100) * 201} 201`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-white text-xl">{healthScore}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">Health</p>
          <p className="font-semibold mt-0.5" style={{ color: health.color }}>{health.emoji} {health.label}</p>
        </div>

        <PayStatCard icon={<TrendingDown size={18} />} label="Spent" value={formatCurrency(spent, 'USD')} sub={`of ${formatCurrency(spendable, 'USD')} spendable`} color="text-accent-red" bg="bg-red-500/10" />
        <PayStatCard icon={<Clock size={18} />} label="Daily Rate" value={`$${dailyRate.toFixed(0)}/day`} sub={`Max $${maxDaily.toFixed(0)}/day`} color={dailyRate > maxDaily ? 'text-accent-red' : 'text-accent-green'} bg={dailyRate > maxDaily ? 'bg-red-500/10' : 'bg-green-500/10'} />
        <PayStatCard icon={<PiggyBank size={18} />} label="Remaining" value={formatCurrency(remaining, 'USD')} sub={`Target: ${formatCurrency(paySchedule.savingsTarget, 'USD')}`} color="text-brand-400" bg="bg-brand-500/10" />
      </div>

      {/* Spend progress bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
        <h2 className="font-display font-semibold text-white text-sm">Cycle Budget Breakdown</h2>
        <BudgetBar label="Fixed Expenses" amount={fixedTotal} total={paySchedule.amount} color="bg-accent-purple" />
        <BudgetBar label="Spent (Variable)" amount={spent} total={paySchedule.amount} color="bg-accent-orange" />
        <BudgetBar label="Savings Target" amount={paySchedule.savingsTarget} total={paySchedule.amount} color="bg-accent-green" />
        <BudgetBar label="Remaining" amount={remaining} total={paySchedule.amount} color="bg-brand-500" />
      </div>

      {/* Weekly Breakdown Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="font-display font-semibold text-white mb-4">Weekly Breakdown</h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklyData} barGap={8}>
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, fontSize: 12 }}
              formatter={(val: any) => [`$${val.toFixed(0)}`, '']}
            />
            <Bar dataKey="budget" name="Budget" fill="#1f2937" radius={[6, 6, 0, 0]} />
            <Bar dataKey="spent" name="Spent" radius={[6, 6, 0, 0]}>
              {weeklyData.map((entry, i) => (
                <Cell key={i} fill={entry.spent > entry.budget ? '#ef4444' : '#14b8a6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Savings Streak + Fixed Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Streak */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={18} className="text-accent-yellow" />
            <h2 className="font-display font-semibold text-white">Savings Streak</h2>
          </div>
          <div className="flex items-end gap-2 mt-3">
            <span className="font-display text-5xl font-bold text-accent-yellow">{streak}</span>
            <span className="text-gray-400 mb-2">cycles in a row</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Hit your savings goal of {formatCurrency(paySchedule.savingsTarget, 'USD')} per cycle to keep the streak alive</p>
        </div>

        {/* Fixed Expenses */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-accent-orange" />
              <h2 className="font-display font-semibold text-white">Fixed Expenses</h2>
            </div>
            <button onClick={() => setShowAddExpense(!showAddExpense)} className="text-brand-400 hover:text-brand-300 transition-colors">
              <Plus size={18} />
            </button>
          </div>
          {showAddExpense && (
            <form onSubmit={handleAddExpense} className="mb-3 space-y-2 bg-gray-800/50 rounded-xl p-3">
              <input value={newExpense.name} onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                placeholder="Name (e.g. Rent)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-500" required />
              <input type="number" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="Amount (USD)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-500" required />
              <button type="submit" className="w-full bg-brand-500 text-white text-sm py-2 rounded-lg hover:bg-brand-400 transition-colors">Add</button>
            </form>
          )}
          <div className="space-y-2">
            {paySchedule.fixedExpenses.length === 0 ? (
              <p className="text-gray-500 text-sm">No fixed expenses yet</p>
            ) : (
              paySchedule.fixedExpenses.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{exp.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-white">{formatCurrency(exp.amount, 'USD')}</span>
                    <button onClick={() => removeFixedExpense(exp.id)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
          {paySchedule.fixedExpenses.length > 0 && (
            <div className="border-t border-gray-800 mt-3 pt-3 flex justify-between">
              <span className="text-gray-400 text-sm font-medium">Total Fixed</span>
              <span className="font-mono text-white font-bold">{formatCurrency(fixedTotal, 'USD')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PayStatCard({ icon, label, value, sub, color, bg }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string; bg: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center ${color} mb-3`}>{icon}</div>
      <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className="font-display text-xl font-bold text-white mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
    </div>
  );
}

function BudgetBar({ label, amount, total, color }: { label: string; amount: number; total: number; color: string }) {
  const pct = total > 0 ? Math.min(100, (amount / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-mono text-white">{formatCurrency(amount, 'USD')} <span className="text-gray-500">({pct.toFixed(0)}%)</span></span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SetupScreen({ setupData, setSetupData, onSubmit }: { setupData: any; setSetupData: any; onSubmit: any }) {
  return (
    <div className="p-6 max-w-lg mx-auto animate-slide-up">
      <h1 className="font-display text-2xl font-bold text-white mb-1">Set Up Pay Tracker</h1>
      <p className="text-gray-400 text-sm mb-6">Enter your biweekly pay schedule to start tracking.</p>
      <form onSubmit={onSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">First Payday Date</label>
          <input type="date" value={setupData.startDate} onChange={(e) => setSetupData({ ...setupData, startDate: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500" required />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Pay Amount (USD)</label>
          <input type="number" value={setupData.amount} onChange={(e) => setSetupData({ ...setupData, amount: e.target.value })}
            placeholder="e.g. 1200" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500" required />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Savings Target per Cycle (USD)</label>
          <input type="number" value={setupData.savingsTarget} onChange={(e) => setSetupData({ ...setupData, savingsTarget: e.target.value })}
            placeholder="e.g. 200" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500" />
        </div>
        <button type="submit" className="w-full bg-brand-500 hover:bg-brand-400 text-white font-semibold py-3 rounded-xl transition-colors">Start Tracking</button>
      </form>
    </div>
  );
}
