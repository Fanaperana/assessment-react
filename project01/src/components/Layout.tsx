import { Link, NavLink, Outlet } from 'react-router'
import { useCart } from '../hooks/useCart'
import { useTheme } from '../hooks/useTheme'
import { Button } from './Button'

export function Layout() {
  const { count } = useCart()
  const { theme, toggleTheme } = useTheme()
  return <div className="site-shell">
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to="/" aria-label="ShopLite home"><span className="brand-mark">S</span>ShopLite<span className="brand-dot">.</span></Link>
        <nav aria-label="Main navigation"><NavLink to="/" end>Shop</NavLink><NavLink to="/cart">Cart <span className="cart-count" aria-label={`${count} items`}>{count}</span></NavLink></nav>
        <Button variant="secondary" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>{theme === 'light' ? '☾' : '☀'} <span>{theme === 'light' ? 'Dark' : 'Light'}</span></Button>
      </div>
    </header>
    <main id="main-content" className="container main-content"><Outlet /></main>
    <footer className="site-footer"><div className="container footer-inner"><span>ShopLite · A demo storefront</span><span>Explore, discover, enjoy.</span></div></footer>
  </div>
}
