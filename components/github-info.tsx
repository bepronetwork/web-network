import React from "react";

export default function GithubInfo({bgColor = `transparent`, color, value, onClicked = () => {}, hoverTextColor = ``, borderColor = undefined, textTruncate = false}) {

  function getClassName() {
    return [
      `bg-${bgColor} caption-small px-1 rounded border border-2 text-uppercase fs-smallest`,
      hoverTextColor ? `bg-${color}-hover text-${hoverTextColor}-hover` : ``,
      `border-${borderColor && borderColor || color} text-${color}`,
      textTruncate ? `text-truncate`: ``
    ].join(` `);
  }

  return <div className={getClassName()} onClick={(e) => hoverTextColor && (e.stopPropagation(), onClicked())}><span>{value}</span></div>
}
