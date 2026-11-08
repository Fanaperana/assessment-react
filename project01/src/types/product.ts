// Shape of a product returned by https://dummyjson.com/products
// Add more fields here if you need them.
export interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  brand?: string
  thumbnail: string
  images: string[]
}

export interface ProductListResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}
