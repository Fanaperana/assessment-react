import type { ChangeEvent } from 'react'
import type { CheckoutField as FieldName } from '../utils/checkout'

export interface FieldDefinition {
  key: Exclude<FieldName, 'paymentMethod'>
  label: string
  type?: string
  autoComplete?: string
}

interface CheckoutFieldProps {
  field: FieldDefinition
  value: string
  error?: string
  disabled: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onBlur: (event: ChangeEvent<HTMLInputElement>) => void
}

export function CheckoutField({
  field,
  value,
  error,
  disabled,
  onChange,
  onBlur,
}: CheckoutFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={field.key}>{field.label}</label>
      <input
        id={field.key}
        name={field.key}
        type={field.type ?? 'text'}
        autoComplete={field.autoComplete}
        inputMode={field.key === 'cardNumber' || field.key === 'cvc' ? 'numeric' : undefined}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${field.key}-error` : undefined}
        disabled={disabled}
      />
      {error && (
        <span className="field-error" id={`${field.key}-error`}>
          {error}
        </span>
      )}
    </div>
  )
}
