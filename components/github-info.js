import React from "react";

export default function GithubInfo({color, value}) {
  return <div className={`bg-transparent smallCaption text-uppercase px-1 rounded border border-2 border-${color} text-${color} text-uppercase fs-smallest`}>
    <strong>{value}</strong>
  </div>
}
