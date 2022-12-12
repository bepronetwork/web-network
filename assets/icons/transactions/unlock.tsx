import * as React from "react";
import { SVGProps } from "react";

export function UnlockIcon(props: SVGProps<SVGSVGElement>){
  return (
    <svg
      width={20}
      height={23}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M17 10.005H3a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2ZM5 10.005v-4a5 5 0 0 1 9.9-1"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
  </svg>
  );
}
