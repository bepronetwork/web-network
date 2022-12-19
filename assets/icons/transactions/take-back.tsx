import * as React from "react";
import { SVGProps } from "react";

export function TakeBackIcon(props: SVGProps<SVGSVGElement>){
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M11 12L6 17L1 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path 
        d="M17 1H10C8.93913 1 7.92172 1.42143 7.17157 2.17157C6.42143 2.92172 6 3.93913 6 5V17"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
