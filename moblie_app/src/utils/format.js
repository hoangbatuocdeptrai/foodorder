export const formatCurrencyVND = (amount) => {
  const numeric = Number(amount);
  if (isNaN(numeric)) return amount;
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(numeric);
  } catch (err) {
    // Fallback for environments without Intl support
    return `${numeric.toLocaleString('vi-VN')} ₫`;
  }
}; 