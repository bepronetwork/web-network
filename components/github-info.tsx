import React from "react";

interface GithubInfoProps {
  parent: 'list' | 'modal' | 'hero'
  variant: 'user' | 'repository'
  label: string
  active?: boolean
  onClick?: () => void 
}

export default function GithubInfo({
  parent,
  variant,
  label,
  active = false,
  onClick = () => {}
} : GithubInfoProps) {
  function getClassName() {
    const hover = active ? '' : '-hover'
    let append = ''

    if (['list', 'modal'].includes(parent)) {
      append += ' bg-transparent text-truncate '

      if (variant === 'user') append += ' text-white text-white-hover border-gray border-white-hover bg-white-10-hover ' 

      if (variant === 'repository') append += ` text-primary border-primary text-white${hover} bg-30${hover} `
    } else if (parent === 'hero') {
      if (variant === 'repository') append += ' bg-white text-primary ' 
    }

    return ' github-info caption-small cursor-pointer ' + append
  }

  return <div className={getClassName()} onClick={(e) => (e.stopPropagation(), onClick())}><span>{label}</span></div>
}
