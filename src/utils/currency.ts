import { ExchangeRates, CurrencyCode } from '../types';

const API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function fetchExchangeRates(): Promise<ExchangeRates | null> {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Rate fetch failed');
    const json = await res.json();
    return {
      base: 'USD',
      rates: {
        USD: 1,
        INR: json.rates.INR,
        NGN: json.rates.NGN,
      },
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function isRatesStale(lastUpdated: string): boolean {
  return Date.now() - new Date(lastUpdated).getTime() > CACHE_DURATION;
}

export function toUSD(amount: number, currency: CurrencyCode, rates: ExchangeRates): number {
  if (currency === 'USD') return amount;
  const rate = rates.rates[currency];
  return rate ? amount / rate : 0;
}

export function fromUSD(amount: number, currency: CurrencyCode, rates: ExchangeRates): number {
  if (currency === 'USD') return amount;
  return amount * rates.rates[currency];
}

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const symbols: Record<CurrencyCode, string> = { USD: '$', INR: '₹', NGN: '₦' };
  const locales: Record<CurrencyCode, string> = { USD: 'en-US', INR: 'en-IN', NGN: 'en-NG' };
  return new Intl.NumberFormat(locales[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getTransferRate(currency: CurrencyCode, rates: ExchangeRates): string {
  if (currency === 'USD') return '';
  const rate = rates.rates[currency];
  const symbols: Record<CurrencyCode, string> = { USD: '$', INR: '₹', NGN: '₦' };
  return `${symbols[currency]}1 = $${(1 / rate).toFixed(6)}`;
}
