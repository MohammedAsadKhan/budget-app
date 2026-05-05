import React, { useState } from 'react';
import { Heart, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils/currency';
import { CURRENCIES, CurrencyCode } from '../types';

export default function DadsDebt() {
  const { dadDebt, setDadDebt, addDebtPayment, deleteDebtPayment } = useStore();
  const [setupMode, setSetupMode] = useState(!dadDebt);
  const [setupData, setSetupData] = useState({ totalOwed: '', currency: 'USD' as CurrencyCode, dateBorrowed: '', description: '', notes: '' });
  const [paymentData, setPaymentData] = useState({ amount: '', currency: 'USD' as CurrencyCode, date: new Date().toISOString().split('T')[0], notes: '' });
  const [showPayment, setShowPayment] = useState(false);

  function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setDadDebt({
      totalOwed: parseFloat(setupData.totalOwed),
      currency: setupData.currency,
      dateBorrowed: setupData.dateBorrowed,
      description: setupData.description,
      notes: setupData.notes,
    });
    setSetupMode(false);
  }

  function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    addDebtPayment({ amount: parseFloat(paymentData.amount), currency: paymentData.currency, date: paymentData.date, notes: paymentData.notes });
    setPaymentData({ amount: '', currency: 'USD', date: new Date().toISOString().split('T')[0], notes: '' });
    setShowPayment(false);
  }

  if (setupMode || !dadDebt) {
    return (
      <div className="p-6 max-w-lg mx-auto animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-red-500/15 flex items-center justify-center">
            <Heart size={20} className="text-red-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Dad's Debt</h1>
            <p className="text-gray-400 text-sm">Track what you owe your dad</p>
          </div>
        </div>
        <form onSubmit={handleSetup} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Total Amount Owed</label>
            <input type="number" value={setupData.totalOwed} onChange={(e) => setSetupData({ ...setupData, totalOwed: e.target.value })}
              placeholder="e.g. 500" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Currency</label>
            <select value={setupData.currency} onChange={(e) => setSetupData({ ...setupData, currency: e.target.value as CurrencyCode })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500">
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Date Borrowed</label>
            <input type="date" value={setupData.dateBorrowed} onChange={(e) => setSetupData({ ...setupData, dateBorrowed: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">What It Was For</label>
            <input value={setupData.description} onChange={(e) => setSetupData({ ...setupData, description: e.target.value })}
              placeholder="e.g. Tuition, emergency, etc." className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Notes (optional)</label>
            <textarea value={setupData.notes} onChange={(e) => setSetupData({ ...setupData, notes: e.target.value })}
              placeholder="Any extra details..." rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 resize-none" />
          </div>
          <button type="submit" className="w-full bg-red-500/80 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-colors">Save Debt</button>
        </form>
      </div>
    );
  }

  const totalPaid = dadDebt.payments.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, dadDebt.totalOwed - totalPaid);
  const pctPaid = Math.min(100, (totalPaid / dadDebt.totalOwed) * 100);
  const isPaidOff = remaining <= 0;

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-500/15 flex items-center justify-center">
            <Heart size={20} className="text-red-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Dad's Debt</h1>
            <p className="text-gray-400 text-sm">{dadDebt.description}</p>
          </div>
        </div>
        <button onClick={() => setSetupMode(true)} className="text-xs text-gray-500 hover:text-brand-400 transition-colors">Edit</button>
      </div>

      {/* Main Card */}
      <div className={`relative rounded-2xl p-6 overflow-hidden border ${isPaidOff ? 'bg-green-900/20 border-green-500/30' : 'bg-gray-900 border-gray-800'}`}>
        {isPaidOff && (
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={20} className="text-green-400" />
            <span className="text-green-400 font-semibold">Fully Paid Off! 🎉</span>
          </div>
        )}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Original</p>
            <p className="font-display text-2xl font-bold text-white mt-1">{formatCurrency(dadDebt.totalOwed, dadDebt.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Paid</p>
            <p className="font-display text-2xl font-bold text-green-400 mt-1">{formatCurrency(totalPaid, dadDebt.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Remaining</p>
            <p className={`font-display text-2xl font-bold mt-1 ${isPaidOff ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(remaining, dadDebt.currency)}</p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Repayment progress</span>
            <span>{pctPaid.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-green-500 rounded-full transition-all duration-700" style={{ width: `${pctPaid}%` }} />
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">Borrowed on {new Date(dadDebt.dateBorrowed).toLocaleDateString()}</p>
        {dadDebt.notes && <p className="text-xs text-gray-400 mt-1 italic">"{dadDebt.notes}"</p>}
      </div>

      {/* Add Payment */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-white">Payment History</h2>
          {!isPaidOff && (
            <button onClick={() => setShowPayment(!showPayment)} className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors">
              <Plus size={16} /> Log Payment
            </button>
          )}
        </div>

        {showPayment && (
          <form onSubmit={handlePayment} className="mb-4 bg-gray-800/50 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={paymentData.amount} onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                placeholder="Amount" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-500" required />
              <select value={paymentData.currency} onChange={(e) => setPaymentData({ ...paymentData, currency: e.target.value as CurrencyCode })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500">
                {Object.values(CURRENCIES).map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
              </select>
            </div>
            <input type="date" value={paymentData.date} onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500" required />
            <input value={paymentData.notes} onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              placeholder="Notes (optional)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-500" />
            <button type="submit" className="w-full bg-brand-500 text-white text-sm py-2 rounded-lg hover:bg-brand-400 transition-colors font-semibold">Log Payment</button>
          </form>
        )}

        {dadDebt.payments.length === 0 ? (
          <p className="text-gray-500 text-sm">No payments logged yet.</p>
        ) : (
          <div className="space-y-2">
            {[...dadDebt.payments].reverse().map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{formatCurrency(p.amount, p.currency)}</p>
                  <p className="text-gray-500 text-xs">{new Date(p.date).toLocaleDateString()}{p.notes ? ` · ${p.notes}` : ''}</p>
                </div>
                <button onClick={() => deleteDebtPayment(p.id)} className="text-gray-600 hover:text-red-400 transition-colors p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
