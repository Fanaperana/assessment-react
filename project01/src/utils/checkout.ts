export interface CheckoutValues {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  paymentMethod: 'card' | 'cash'
  cardNumber: string
  expiry: string
  cvc: string
}

export type CheckoutField = keyof CheckoutValues
export type CheckoutErrors = Partial<Record<CheckoutField, string>>

export const initialCheckoutValues: CheckoutValues = {
  fullName: '', email: '', phone: '', address: '', city: '', postalCode: '',
  paymentMethod: 'card', cardNumber: '', expiry: '', cvc: '',
}

export function validateCheckout(values: CheckoutValues): CheckoutErrors {
  const errors: CheckoutErrors = {}
  if (values.fullName.trim().length < 2) errors.fullName = 'Enter your full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter a valid email address.'
  if (!/^\+?[\d\s().-]{7,20}$/.test(values.phone.trim())) errors.phone = 'Enter a valid phone number.'
  if (values.address.trim().length < 5) errors.address = 'Enter your street address.'
  if (values.city.trim().length < 2) errors.city = 'Enter your city.'
  if (!/^[A-Za-z0-9 -]{3,12}$/.test(values.postalCode.trim())) errors.postalCode = 'Enter a valid postal code.'
  if (values.paymentMethod === 'card') {
    if (!/^\d{13,19}$/.test(values.cardNumber.replaceAll(' ', ''))) errors.cardNumber = 'Enter a valid card number (13–19 digits).'
    const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(values.expiry)
    if (!match || new Date(2000 + Number(match[2]), Number(match[1])) <= new Date()) errors.expiry = 'Enter a future expiry date (MM/YY).'
    if (!/^\d{3,4}$/.test(values.cvc)) errors.cvc = 'Enter a valid CVC.'
  }
  return errors
}
