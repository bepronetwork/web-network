import React, { SVGProps, memo } from "react";

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 46 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M44 44L33.85 33.85M39.3333 20.6667C39.3333 30.976 30.9759 39.3333 20.6666 39.3333C10.3573 39.3333 2 30.976 2 20.6667C2 10.3574 10.3573 2 20.6666 2C30.9759 2 39.3333 10.3574 39.3333 20.6667Z"
        stroke="#C4C7D3"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default memo(SearchIcon);
