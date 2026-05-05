import { PaySchedule, PayCycle, Transaction } from '../types';

export function getCurrentCycle(schedule: PaySchedule): { start: Date; end: Date } {
  const start = new Date(schedule.startDate);
  const now = new Date();
  const cycleMs = 14 * 24 * 60 * 60 * 1000; // 14 days

  const elapsed = now.getTime() - start.getTime();
  const cyclesPassed = Math.floor(elapsed / cycleMs);

  const cycleStart = new Date(start.getTime() + cyclesPassed * cycleMs);
  const cycleEnd = new Date(cycleStart.getTime() + cycleMs - 1);

  return { start: cycleStart, end: cycleEnd };
}

export function getDaysInCycle(cycle: { start: Date; end: Date }): number {
  return Math.round((cycle.end.getTime() - cycle.start.getTime()) / (24 * 60 * 60 * 1000));
}

export function getDaysRemaining(cycleEnd: Date): number {
  const now = new Date();
  return Math.max(0, Math.ceil((cycleEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
}

export function getDaysElapsed(cycleStart: Date): number {
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - cycleStart.getTime()) / (24 * 60 * 60 * 1000)));
}

export function getCycleTransactions(
  transactions: Transaction[],
  cycleStart: Date,
  cycleEnd: Date
): Transaction[] {
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= cycleStart && d <= cycleEnd && t.type === 'expense';
  });
}

export function getCycleSpent(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

export function getCycleSaved(schedule: PaySchedule, spent: number): number {
  const fixedTotal = schedule.fixedExpenses.reduce((s, e) => s + e.amount, 0);
  return schedule.amount - fixedTotal - spent;
}

export function getDailySpendRate(spent: number, daysElapsed: number): number {
  return daysElapsed > 0 ? spent / daysElapsed : 0;
}

export function getMaxDailyBudget(schedule: PaySchedule, daysRemaining: number): number {
  const fixedTotal = schedule.fixedExpenses.reduce((s, e) => s + e.amount, 0);
  const available = schedule.amount - fixedTotal - schedule.savingsTarget;
  return daysRemaining > 0 ? available / 14 : 0; // per day budget
}

export function getCycleHealthScore(
  spent: number,
  schedule: PaySchedule,
  daysElapsed: number,
  totalDays: number
): number {
  const fixedTotal = schedule.fixedExpenses.reduce((s, e) => s + e.amount, 0);
  const spendableBudget = schedule.amount - fixedTotal - schedule.savingsTarget;
  const expectedSpentByNow = (daysElapsed / totalDays) * spendableBudget;

  if (spendableBudget <= 0) return 50;

  const ratio = spent / Math.max(expectedSpentByNow, 1);
  // 100 = perfect, 0 = severely over
  const score = Math.max(0, Math.min(100, Math.round(100 - (ratio - 1) * 100)));
  return score;
}

export function getHealthLabel(score: number): { label: string; color: string; emoji: string } {
  if (score >= 80) return { label: 'Excellent', color: '#22c55e', emoji: '🏆' };
  if (score >= 60) return { label: 'Good', color: '#14b8a6', emoji: '✅' };
  if (score >= 40) return { label: 'Watch Out', color: '#eab308', emoji: '⚠️' };
  if (score >= 20) return { label: 'At Risk', color: '#f97316', emoji: '🔥' };
  return { label: 'Over Budget', color: '#ef4444', emoji: '🚨' };
}

export function getWeeklyBreakdown(
  transactions: Transaction[],
  cycleStart: Date
): { week1: number; week2: number } {
  const week1End = new Date(cycleStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  let week1 = 0;
  let week2 = 0;
  transactions.forEach((t) => {
    const d = new Date(t.date);
    if (d < week1End) week1 += t.amount;
    else week2 += t.amount;
  });
  return { week1, week2 };
}

export function getNextPayday(schedule: PaySchedule): Date {
  const { end } = getCurrentCycle(schedule);
  return new Date(end.getTime() + 1);
}
