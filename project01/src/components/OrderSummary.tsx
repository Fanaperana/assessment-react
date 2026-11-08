import type { ReactNode } from 'react'

export function OrderSummary({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="order-summary">
      <h2>{title}</h2>
      {children}
    </aside>
  )
}
