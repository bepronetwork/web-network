import * as React from "react";
import { SVGProps } from "react";

export function DelegateIcon(props: SVGProps<SVGSVGElement>){
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M7 6L12 1L17 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path 
        d="M1 17H8C9.06087 17 10.0783 16.5786 10.8284 15.8284C11.5786 15.0783 12 14.0609 12 13V1" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
