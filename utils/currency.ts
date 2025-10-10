export const availableCurrencies = [
  // European currencies
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  { code: 'BAM', symbol: 'KM', name: 'Bosnia and Herzegovina Convertible Mark' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },

  // Asian currencies
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },

  // African currencies
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'EGP', symbol: '£', name: 'Egyptian Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
  { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar' },
  { code: 'DZD', symbol: 'دج', name: 'Algerian Dinar' },

  // American currencies
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso' },

  // Other major currencies
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
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
    'CHF': 'de-CH',
    'PLN': 'pl-PL',
    'CZK': 'cs-CZ',
    'HUF': 'hu-HU',
    'RON': 'ro-RO',
    'BAM': 'bs-BA',
    'BGN': 'bg-BG',
    'HRK': 'hr-HR',
    'RUB': 'ru-RU',
    'CNY': 'zh-CN',
    'JPY': 'ja-JP',
    'KRW': 'ko-KR',
    'INR': 'hi-IN',
    'TRY': 'tr-TR',
    'SAR': 'ar-SA',
    'AED': 'ar-AE',
    'THB': 'th-TH',
    'SGD': 'en-SG',
    'MYR': 'ms-MY',
    'IDR': 'id-ID',
    'PHP': 'fil-PH',
    'VND': 'vi-VN',
    'ZAR': 'en-ZA',
    'EGP': 'ar-EG',
    'NGN': 'en-NG',
    'KES': 'en-KE',
    'MAD': 'ar-MA',
    'TND': 'ar-TN',
    'DZD': 'ar-DZ',
    'CAD': 'en-CA',
    'MXN': 'es-MX',
    'BRL': 'pt-BR',
    'ARS': 'es-AR',
    'CLP': 'es-CL',
    'AUD': 'en-AU',
    'NZD': 'en-NZ',
  };

  const locale = localeMap[currencyCode] || 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(amount);
}