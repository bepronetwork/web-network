import React from "react";

interface GithubInfoProps {
  parent: 'list' | 'modal' | 'hero'
  variant: 'user' | 'repository'
  label: string
  onClick?: () => void 
}

export default function GithubInfo({
  parent,
  variant,
  label,
  onClick = () => {}
} : GithubInfoProps) {
  function getClassName() {
    let append = ''

    if (['list', 'modal'].includes(parent)) {
      append += ' bg-transparent text-truncate '

      if (variant === 'user') append += ' text-white text-white-hover border-gray border-white-hover bg-white-10-hover ' 

      if (variant === 'repository') append += ' text-primary text-white-hover border-primary bg-30-hover ' 
    } else if (parent === 'hero') {
      if (variant === 'repository') append += ' bg-white text-primary ' 
    }

    return ' github-info caption-small ' + append
  }

  return <div className={getClassName()} onClick={(e) => (e.stopPropagation(), onClick())}><span>{label}</span></div>
}
