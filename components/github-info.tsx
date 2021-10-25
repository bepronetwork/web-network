import React from "react";

export default function GithubInfo({bgColor = `transparent`, color, value, onClicked = () => {}, hoverTextColor = ``}) {

  function getClassName() {
    return [
      `bg-${bgColor} smallCaption text-uppercase px-1 rounded border border-2 text-uppercase fs-smallest`,
      hoverTextColor ? `bg-${color}-hover text-${hoverTextColor}-hover` : ``,
      `border-${color} text-${color}`
    ].join(` `);
  }

  return <div className={getClassName()} onClick={(e) => hoverTextColor && (e.stopPropagation(), onClicked())}><span>{value}</span></div>
}
