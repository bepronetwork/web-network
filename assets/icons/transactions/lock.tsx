import * as React from "react";
import { SVGProps } from "react";

export function LockIcon(props: SVGProps<SVGSVGElement>){
  return (
    <svg
      width={20}
      height={22}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M17 10H3a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2ZM5 10V6a5 5 0 1 1 10 0v4"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
  </svg>
  );
}
