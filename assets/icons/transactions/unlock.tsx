import * as React from "react";
import { SVGProps } from "react";

export function UnlockIcon(props: SVGProps<SVGSVGElement>){
  return (
    <svg width="20" height="23" viewBox="0 0 20 23" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path 
        d={`M17 10.005H3C1.89543 10.005 1 10.9004 1 12.005V19.005C1 20.1096 1.89543 21.005 3 21.005H17C18.1046
        21.005 19 20.1096 19 19.005V12.005C19 10.9004 18.1046 10.005 17 10.005Z`}
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path 
        d={`M5 10.005V6.00504C4.99876 4.76508 5.45828 3.5689 6.28938 2.6487C7.12047 1.7285 8.26383 1.14994 9.49751
        1.02533C10.7312 0.900712 11.9671 1.23894 12.9655 1.97435C13.9638 2.70976 14.6533 3.78988 14.9 5.00504`}
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
