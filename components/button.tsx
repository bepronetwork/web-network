import React, {ButtonHTMLAttributes} from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string;
  outline?: boolean;
  transparent?: boolean;
  rounded?: boolean;
  upperCase?: boolean;
}

export default function Button({
                                 children,
                                 color = 'primary',
                                 outline,
                                 transparent,
                                 rounded,
                                 className = ``,
                                 ...rest
                               }: ButtonProps) {

  function getClass(): string {
    const type = `btn-${outline ? `outline-${color}` : color}`
    const textColor = !outline && color !== 'white' && 'text-white bg-opacity-100' || ``
    let append = className;

    if (transparent)
      append += ' bg-transparent border-transparent'

    if (rounded)
      append += ` circle-2 p-0`;

    if (outline)
      append += ` bg-opac-hover-25`

    return `btn ${type} ${textColor} d-flex align-items-center justify-content-center text-uppercase shadow-none ${append}`
  }

  return <>
    <button className={getClass()} {...rest}>{children}</button>
  </>
}
