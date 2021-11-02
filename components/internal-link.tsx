import { ReactNode } from 'react'
import { GetStaticProps } from 'next'
import Link, { LinkProps } from 'next/link'

import Button, { ButtonProps } from './button'

interface InternalLinkProps extends LinkProps, ButtonProps {
  children: ReactNode | ReactNode[]
  active?: boolean
  component?: 'a' |  'button',
  variant?: 'nav' | 'regular'
}

export default function InternalLink({
  children,
  active = false,
  component = 'button',
  variant = 'regular',
  ...props
}: InternalLinkProps) {
  const {
    href,
    as,
    replace,
    scroll,
    shallow,
    passHref,
    prefetch,
    locale,
    color,
    outline,
    transparent,
    rounded,
    upperCase,
    className
  } = props

  const isNav = variant === 'nav'
  const classes = `${className} ${isNav && 'p-0'} ${!active && 'opacity-75 opacity-100-hover'}`

  const linkProps: LinkProps = {
    href,
    as,
    replace,
    scroll,
    shallow,
    passHref,
    prefetch,
    locale
  }
  const buttonProps: ButtonProps = {
    color,
    outline,
    transparent,
    rounded,
    upperCase
  }

  function renderMatchingComponent() {
    if (component === 'button') return <Button className={classes} {...buttonProps}>{children}</Button>
    
    return <a href={linkProps.href.toString()} className={classes}>{children}</a>
  }

  return (
    <Link {...linkProps}>
      {renderMatchingComponent()}
    </Link>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  }
}
