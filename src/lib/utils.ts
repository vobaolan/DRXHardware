export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0 đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(num).replace('₫', 'đ');
}

export function calculateDiscountPercent(originalPrice: number, discountPrice: number): number {
  if (!originalPrice || originalPrice <= discountPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}
