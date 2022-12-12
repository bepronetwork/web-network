import * as React from "react";
import { SVGProps } from "react";

export function ApprovalIcon(props: SVGProps<SVGSVGElement>){
  return (
    <svg
      width={22}
      height={22}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d={`M6 21H3a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3m7-2V4a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 
        0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H13Z`}
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
  </svg>
  );
}
