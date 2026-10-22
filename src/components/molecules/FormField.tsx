import type { ReactNode } from 'react'

type FormFieldProps = {
  id: string
  label: string
  children: ReactNode
}

export function FormField({ id, label, children }: FormFieldProps) {
  return <label className="form-field" htmlFor={id}>{label}{children}</label>
}
