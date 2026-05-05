import React from 'react';
import { LayoutDashboard, Wallet, ArrowLeftRight, Calendar, PieChart, HandHeart, BarChart3, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { clearSession } from '../../security/crypto';
import { useStore } from '../../store';

export type Page = 'dashboard' | 'accounts' | 'transactions' | 'pay-tracker' | 'budgets' | 'dads-debt' | 'reports' | 'settings';

interface Props {
  current: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { id: Page; label: string; icon: React.FC<any>; accent?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'accounts', label: 'Accounts', icon: Wallet, accent: 'text-brand-400' },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, accent: 'text-accent-orange' },
  { id: 'pay-tracker', label: 'Pay Tracker', icon: Calendar, accent: 'text-accent-purple' },
  { id: 'budgets', label: 'Budgets', icon: PieChart, accent: 'text-accent-yellow' },
  { id: 'dads-debt', label: "Dad's Debt", icon: HandHeart, accent: 'text-accent-red' },
  { id: 'reports', label: 'Reports', icon: BarChart3, accent: 'text-accent-green' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ current, onNavigate }: Props) {
  const { resetData } = useStore();

  function handleLogout() {
    clearSession();
    resetData();
  }

  return (
    <aside className="w-60 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg leading-tight">MoFinance</div>
            <div className="text-xs text-gray-500">Personal Vault</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon, accent }) => {
          const active = current === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-brand-500/15 text-brand-300 border border-brand-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
            >
              <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? 'text-brand-400' : accent ?? 'text-gray-500'}`} size={18} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut size={18} className="shrink-0" />
          Lock App
        </button>
      </div>
    </aside>
  );
}
