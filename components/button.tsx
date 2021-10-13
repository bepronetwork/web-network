import React, {ButtonHTMLAttributes} from 'react';

interface IButtonProps extends  ButtonHTMLAttributes<HTMLButtonElement>{
  color?: string;
  outline?: boolean;
  transparent?: boolean;
  rounded?: boolean;
}
const Button: React.FC<IButtonProps> = ({children, color = "primary", outline, transparent, rounded, className = ``,...rest}) => {
  const getClass = (): string =>{
    let type = `btn-${outline? `outline-${color}`: color}`
    let textColor = !outline && color !== 'white'&& 'text-white bg-opacity-100'
    let append = className;
    
    if(transparent)
      append += ' bg-transparent border-transparent bg-opac-hover'

    if (rounded)
      append += ` circle-2 p-0`;

    if(outline)
      append += ` bg-opac-hover-25`
    
    return `btn ${type} ${textColor} d-flex align-items-center justify-content-center shadow-none ${append}`
  }
  return <>
    <button className={getClass()} {...rest}>{children}</button>
  </>
}

export default Button;