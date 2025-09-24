export const availableCurrencies = [
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
];

export function getCurrencySymbol(currencyCode: string): string {
  const currency = availableCurrencies.find(c => c.code === currencyCode);
  return currency?.symbol || currencyCode;
}

export function formatCurrency(amount: number, currencyCode: string = 'SEK'): string {
  // Map currency codes to locale identifiers for proper formatting
  const localeMap: { [key: string]: string } = {
    'SEK': 'sv-SE',
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
    'NOK': 'nb-NO',
    'DKK': 'da-DK',
  };

  const locale = localeMap[currencyCode] || 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(amount);
}