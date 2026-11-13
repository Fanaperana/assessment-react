import type { Product } from '../types/product'

export const productFixture: Product = {
  id: 1,
  title: 'Demo Phone',
  description: 'A useful phone',
  category: 'smartphones',
  price: 100,
  discountPercentage: 10,
  rating: 4.5,
  stock: 5,
  thumbnail: 'https://example.test/phone.png',
  images: ['https://example.test/phone.png'],
}
