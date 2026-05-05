import React, { useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, Calendar, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, toUSD, fetchExchangeRates, isRatesStale, getTransferRate } from '../utils/currency';
import { getCurrentCycle, getDaysRemaining, getCycleTransactions, getCycleSpent, getCycleHealthScore, getDaysElapsed, getDaysInCycle, getHealthLabel } from '../utils/payTracker';
import { CURRENCIES, CurrencyCode } from '../types';

export default function Dashboard() {
  const { accounts, transactions, exchangeRates, paySchedule, settings, setExchangeRates } = useStore();

  useEffect(() => {
    async function refresh() {
      if (!exchangeRates || isRatesStale(exchangeRates.lastUpdated)) {
        const rates = await fetchExchangeRates();
        if (rates) setExchangeRates(rates);
      }
    }
    refresh();
  }, []);

  const rates = exchangeRates;

  // Net worth in USD
  const netWorthUSD = rates
    ? accounts.reduce((sum, acc) => sum + toUSD(acc.balance, acc.currency, rates), 0)
    : 0;

  // This month income/expense
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthTxs = transactions.filter((t) => new Date(t.date) >= monthStart);
  const monthIncome = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Pay cycle
  const cycle = paySchedule ? getCurrentCycle(paySchedule) : null;
  const daysLeft = cycle ? getDaysRemaining(cycle.end) : null;
  const cycleTxs = cycle ? getCycleTransactions(transactions, cycle.start, cycle.end) : [];
  const cycleSpent = getCycleSpent(cycleTxs);
  const daysElapsed = cycle ? getDaysElapsed(cycle.start) : 0;
  const totalDays = cycle ? getDaysInCycle(cycle) : 14;
  const healthScore = paySchedule ? getCycleHealthScore(cycleSpent, paySchedule, daysElapsed, totalDays) : null;
  const health = healthScore !== null ? getHealthLabel(healthScore) : null;

  // Group accounts by country
  const usdAccounts = accounts.filter((a) => a.currency === 'USD');
  const inrAccounts = accounts.filter((a) => a.currency === 'INR');
  const ngnAccounts = accounts.filter((a) => a.currency === 'NGN');

  const recentTxs = transactions.slice(0, 5);

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {rates && (
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <RefreshCw size={11} />
            Rates updated {new Date(rates.lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Net Worth Hero */}
      <div className="relative bg-gradient-to-br from-brand-900/40 to-gray-900 border border-brand-500/20 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Total Net Worth</p>
        <p className="font-display text-5xl font-bold text-white mt-2 animate-count-up">
          {formatCurrency(netWorthUSD, 'USD')}
        </p>
        <div className="flex gap-6 mt-4">
          {rates && inrAccounts.length > 0 && (
            <div className="text-sm">
              <span className="text-gray-500">🇮🇳 India </span>
              <span className="text-white font-mono">
                {formatCurrency(inrAccounts.reduce((s, a) => s + a.balance, 0), 'INR')}
              </span>
              <span className="text-gray-500 ml-1">
                (≈{formatCurrency(inrAccounts.reduce((s, a) => s + toUSD(a.balance, 'INR', rates), 0), 'USD')})
              </span>
            </div>
          )}
          {rates && ngnAccounts.length > 0 && (
            <div className="text-sm">
              <span className="text-gray-500">🇳🇬 Nigeria </span>
              <span className="text-white font-mono">
                {formatCurrency(ngnAccounts.reduce((s, a) => s + a.balance, 0), 'NGN')}
              </span>
              <span className="text-gray-500 ml-1">
                (≈{formatCurrency(ngnAccounts.reduce((s, a) => s + toUSD(a.balance, 'NGN', rates), 0), 'USD')})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Income This Month"
          value={formatCurrency(monthIncome, 'USD')}
          icon={<TrendingUp size={18} />}
          color="text-accent-green"
          bg="bg-green-500/10"
        />
        <StatCard
          label="Spent This Month"
          value={formatCurrency(monthExpense, 'USD')}
          icon={<TrendingDown size={18} />}
          color="text-accent-red"
          bg="bg-red-500/10"
        />
        <StatCard
          label="Accounts"
          value={String(accounts.length)}
          icon={<Wallet size={18} />}
          color="text-brand-400"
          bg="bg-brand-500/10"
        />
        {daysLeft !== null ? (
          <StatCard
            label="Days to Payday"
            value={String(daysLeft)}
            icon={<Calendar size={18} />}
            color="text-accent-purple"
            bg="bg-purple-500/10"
            sub={health ? `${health.emoji} ${health.label} (${healthScore}/100)` : undefined}
          />
        ) : (
          <StatCard
            label="Pay Tracker"
            value="Not Set"
            icon={<Calendar size={18} />}
            color="text-gray-500"
            bg="bg-gray-800"
          />
        )}
      </div>

      {/* Exchange Rates Strip */}
      {rates && (inrAccounts.length > 0 || ngnAccounts.length > 0) && (
        <div className="flex gap-4 flex-wrap">
          {inrAccounts.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm flex items-center gap-2">
              <span>🇮🇳</span>
              <span className="text-gray-400">Transfer rate:</span>
              <span className="font-mono text-brand-300">{getTransferRate('INR', rates)}</span>
            </div>
          )}
          {ngnAccounts.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm flex items-center gap-2">
              <span>🇳🇬</span>
              <span className="text-gray-400">Transfer rate:</span>
              <span className="font-mono text-brand-300">{getTransferRate('NGN', rates)}</span>
            </div>
          )}
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="font-display font-semibold text-white">Recent Transactions</h2>
          <span className="text-xs text-gray-500">{transactions.length} total</span>
        </div>
        {recentTxs.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-500 text-sm">
            No transactions yet. Add one in the Transactions page.
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {recentTxs.map((tx) => (
              <div key={tx.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                    ${tx.type === 'income' ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                    {tx.type === 'income' ? <ArrowUpRight size={14} className="text-green-400" /> : <ArrowDownRight size={14} className="text-red-400" />}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, bg, sub }: {
  label: string; value: string; icon: React.ReactNode; color: string; bg: string; sub?: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 animate-slide-up">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center ${color} mb-3`}>
        {icon}
      </div>
      <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className="font-display text-2xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}
