import * as React from "react";
import { SVGProps } from "react";

export function TakeBackIcon(props: SVGProps<SVGSVGElement>){
  return (
    <svg
      width={18}
      height={18}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="m11 12-5 5-5-5"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 1h-7a4 4 0 0 0-4 4v12"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
  </svg>
  );
}
