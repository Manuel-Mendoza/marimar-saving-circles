/**
 * Format large numbers with units (K for thousand, M for million)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    // Millions
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (num >= 1000) {
    // Thousands
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    // Less than 1000, format normally
    return num.toLocaleString();
  }
}

/**
 * Format currency amount with proper Venezuelan formatting
 */
export function formatCurrency(amount: number, currency: 'VES' | 'USD' = 'VES'): string {
  const formattedNumber = formatNumber(amount);

  if (currency === 'VES') {
    return `Bs. ${formattedNumber}`;
  } else {
    return `$${formattedNumber}`;
  }
}
