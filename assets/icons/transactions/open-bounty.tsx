import * as React from "react";
import { SVGProps } from "react";

export function OpenBountyIcon(props: SVGProps<SVGSVGElement>) {
  return(
    <svg
      width={20}
      height={23}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d={`M19 14.998v-8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4a2 2 0 0 0-1 1.73v8a2 2 0 
        0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z`}
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m1.27 5.958 8.73 5.05 8.73-5.05M10 21.078v-10.08"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
