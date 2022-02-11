import React from "react";

interface GithubInfoProps {
  label: string
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  variant: 'user' | 'repository'
  parent: 'list' | 'modal' | 'hero'
}

export default function GithubInfo({
  label,
  parent,
  variant,
  disabled,
  active = false,
  onClick = () => {}
} : GithubInfoProps) {

  function handleClick(event) {
    event.stopPropagation()

    if(!disabled) onClick()
  }

  function getClassName() {
    const hover = active ? '' : '-hover'
    let append = ''

    if (disabled) append += ' text-white border-danger bg-danger-10 cursor-now-allowed'
    else if (['list', 'modal'].includes(parent)) {
      append += ' cursor-pointer bg-transparent text-truncate '

      if (variant === 'user') append += ' text-white text-white-hover border-gray border-white-hover bg-white-10-hover ' 

      if (variant === 'repository') append += ` text-primary border-primary text-white${hover} bg-30${hover} `
    } else if (parent === 'hero') {
      if (variant === 'repository') append += ' cursor-pointer bg-white text-primary ' 
    }

    return ' github-info caption-small ' + append
  }

  return <div key={label} className={getClassName()} onClick={handleClick}><span>{label}</span></div>
}
