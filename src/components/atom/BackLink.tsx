import type { AnchorHTMLAttributes, ReactNode } from 'react'

type BackLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
  children: ReactNode
}

export function BackLink({ href, children, className = '', ...props }: BackLinkProps) {
  return <a className={`back-link ${className}`.trim()} href={href} {...props}>{children}</a>
}
