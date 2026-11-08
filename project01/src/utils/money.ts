export const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

export const discountedPrice = (price: number, discountPercentage: number) =>
  price * (1 - discountPercentage / 100)
