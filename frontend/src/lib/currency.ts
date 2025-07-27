export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  minimumFractionDigits: number;
  maximumFractionDigits: number;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    locale: 'ja-JP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    locale: 'en-CA',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    locale: 'en-AU',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  
  // Handle NaN, null, or undefined amounts
  if (isNaN(amount) || amount === null || amount === undefined) {
    console.warn('formatCurrency received invalid amount:', amount);
    return `${currency.symbol}0.00`;
  }
  
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.minimumFractionDigits,
      maximumFractionDigits: currency.maximumFractionDigits,
    }).format(amount);
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    const formattedAmount = amount.toFixed(currency.maximumFractionDigits);
    return `${currency.symbol}${formattedAmount}`;
  }
};

export const formatCurrencyCompact = (amount: number, currencyCode: string = 'USD'): string => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      notation: 'compact',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(amount);
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    if (amount >= 1000000) {
      return `${currency.symbol}${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${currency.symbol}${(amount / 1000).toFixed(1)}K`;
    } else {
      return formatCurrency(amount, currencyCode);
    }
  }
};

export const getCurrencySymbol = (currencyCode: string = 'USD'): string => {
  // Handle undefined, null, or empty currency code
  if (!currencyCode || typeof currencyCode !== 'string') {
    console.warn('Invalid currency code provided:', currencyCode);
    return CURRENCIES.USD.symbol;
  }
  
  const currency = CURRENCIES[currencyCode.toUpperCase()];
  if (!currency) {
    console.warn('Unsupported currency code:', currencyCode);
    return CURRENCIES.USD.symbol;
  }
  
  return currency.symbol;
};

export const getCurrencyName = (currencyCode: string = 'USD'): string => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  return currency.name;
};

export const getCurrencyOptions = () => {
  return Object.values(CURRENCIES).map(currency => ({
    value: currency.code,
    label: `${currency.name} (${currency.symbol})`,
  }));
}; 