export function formatCurrency(n?: number, currency = 'USD') {
  if (n === undefined || n === null || isNaN(n)) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n);
}
export function formatPct(n?: number) {
  if (n === undefined || n === null || isNaN(n)) return '-';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}
