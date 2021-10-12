import React from "react";

export default function GithubInfo({color, value, onClicked = () => {}, hoverTextColor = ``}) {

  function getClassName() {
    return [
      `bg-transparent smallCaption text-uppercase px-1 rounded border border-2 text-uppercase fs-smallest`,
      hoverTextColor ? `bg-${color}-hover text-${hoverTextColor}-hover` : ``,
      `border-${color} text-${color}`
    ].join(` `);
  }

  return <div className={getClassName()} onClick={(e) => hoverTextColor && (e.stopPropagation(), onClicked())}><strong>{value}</strong></div>
}
