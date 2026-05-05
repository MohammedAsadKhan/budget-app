import React, { useState } from 'react';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { hashPassword, verifyPassword, saveAuthHash, getAuthHash, isFirstTime, createSession } from '../security/crypto';
import { useStore } from '../store';

export default function AuthScreen() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const firstTime = isFirstTime();
  const { loadData, setAuthenticated } = useStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (firstTime) {
        if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
        if (password !== confirm) { setError('Passwords do not match'); return; }
        const hash = await hashPassword(password);
        saveAuthHash(hash);
        createSession(password);
        loadData(password);
      } else {
        const hash = getAuthHash();
        if (!hash) { setError('Auth data missing. Please refresh.'); return; }
        const valid = await verifyPassword(password, hash);
        if (!valid) { setError('Incorrect password'); return; }
        createSession(password);
        const ok = loadData(password);
        if (!ok) { setError('Failed to decrypt data. Wrong password?'); return; }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 font-body">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 mb-4">
            <ShieldCheck className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">MoFinance</h1>
          <p className="text-gray-400 text-sm mt-1">
            {firstTime ? 'Set up your secure vault' : 'Enter your password to continue'}
          </p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={firstTime ? 'Create a strong password' : 'Your password'}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {firstTime && (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 active:scale-95 text-sm"
          >
            {loading ? 'Verifying...' : firstTime ? 'Create Vault' : 'Unlock'}
          </button>

          {firstTime && (
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Your data is encrypted with AES-256 and never leaves your device.
              <br />
              <span className="text-red-400">If you forget your password, your data cannot be recovered.</span>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
