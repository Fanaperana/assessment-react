import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Spinner } from './components/Feedback'
import { Layout } from './components/Layout'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import { CartPage } from './pages/CartPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ProductListPage } from './pages/ProductListPage'
import { NotFoundPage, OrderSuccessPage } from './pages/StaticPages'

const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })))

export default function App() {
  return <ThemeProvider><CartProvider><BrowserRouter><Routes><Route element={<Layout />}><Route index element={<ProductListPage />} /><Route path="products/:id" element={<ProductDetailPage />} /><Route path="cart" element={<CartPage />} /><Route path="checkout" element={<Suspense fallback={<Spinner label="Loading checkout…" />}><CheckoutPage /></Suspense>} /><Route path="order/success" element={<OrderSuccessPage />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes></BrowserRouter></CartProvider></ThemeProvider>
}
