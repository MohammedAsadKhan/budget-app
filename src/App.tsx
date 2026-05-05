import React, { useState, useEffect } from 'react';
import './index.css';
import { useStore } from './store';
import { getSession, refreshSession } from './security/crypto';
import AuthScreen from './pages/AuthScreen';
import Sidebar, { Page } from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import PayTracker from './pages/PayTracker';
import DadsDebt from './pages/DadsDebt';
import { Budgets, Reports, Settings } from './pages/OtherPages';

export default function App() {
  const { isAuthenticated, settings, resetData } = useStore();
  const [page, setPage] = useState<Page>('dashboard');

  useEffect(() => {
    if (!isAuthenticated) return;
    const handler = () => refreshSession();
    window.addEventListener('mousemove', handler);
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('mousemove', handler);
      window.removeEventListener('keydown', handler);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      const session = getSession();
      if (!session) resetData();
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, resetData]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  if (!isAuthenticated) return <AuthScreen />;

  function renderPage() {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'accounts': return <Accounts />;
      case 'transactions': return <Transactions />;
      case 'pay-tracker': return <PayTracker />;
      case 'budgets': return <Budgets />;
      case 'dads-debt': return <DadsDebt />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  }

  return (
    <div className={`flex min-h-screen font-body ${settings.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar current={page} onNavigate={setPage} />
      <main className="flex-1 overflow-y-auto">{renderPage()}</main>
    </div>
  );
}
