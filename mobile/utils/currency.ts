export const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export const getCurrencySymbol = (code: string | undefined): string => {
    const currency = CURRENCIES.find(c => c.code === code);
    return currency ? currency.symbol : '₹'; // Default to INR if not found
};

export const formatCurrency = (amount: number, code: string | undefined): string => {
    const symbol = getCurrencySymbol(code);
    return `${symbol}${amount.toLocaleString()}`;
};
