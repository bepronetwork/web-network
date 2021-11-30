import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { UrlObject } from 'url'

interface InternalLinkProps {
  href: string | UrlObject
  label?: string | number
  className?: string
  transparent?: boolean
  nav?: boolean
  active?: boolean
  icon?: ReactNode
  uppercase?: boolean
  iconBefore?: boolean
  activeClass?: string
}

export default function InternalLink({
  className = '',
  nav = false,
  transparent = false,
  active = false,
  iconBefore = false,
  uppercase = false,
  activeClass,
  ...props
}: InternalLinkProps) {
  const { asPath } = useRouter()

  function getClasses(): string {
    const isActive = asPath === props.href || active

    let classes = `${className}`

    if (!isActive && nav)
      classes += ' opacity-75 opacity-100-hover '

    if (isActive && nav && activeClass)
      classes += ' ' + activeClass

    if (transparent || nav)
      classes += ' bg-transparent border-transparent '

    if (uppercase)
      classes += ' text-uppercase '

    return `btn btn-primary text-white bg-opacity-100 d-flex align-items-center justify-content-center text-decoration-none shadow-none ${classes}`
  }

  return (
    <Link href={props.href} passHref>
      <a className={getClasses()}>
        {(iconBefore && props.icon) || ``}
        {props.label && <span>{props.label}</span> || ``}
        {(!iconBefore && props.icon) || ``}
      </a>
    </Link>
  )
}
