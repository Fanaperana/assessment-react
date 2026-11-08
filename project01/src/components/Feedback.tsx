import type { ReactNode } from 'react'
import { Button } from './Button'

export interface SpinnerProps { label?: string }
export function Spinner({ label = 'Loading…' }: SpinnerProps) {
  return <div className="feedback" role="status"><span className="spinner" aria-hidden="true" />{label}</div>
}

export interface ErrorMessageProps { message: string; onRetry: () => void }
export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return <div className="feedback" role="alert"><p>{message}</p><Button onClick={onRetry}>Try again</Button></div>
}

export interface EmptyStateProps { title: string; children?: ReactNode }
export function EmptyState({ title, children }: EmptyStateProps) {
  return <div className="feedback"><h2>{title}</h2>{children}</div>
}
