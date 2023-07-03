import { SVGProps } from "react";

export default function HamburgerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#clip0_792_9891)">
        <path d="M5 16.3384H27" stroke="#73758C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 8.33841H27" stroke="#73758C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 24.3384H27" stroke="#73758C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_792_9891">
        <rect width="32" height="32" fill="white" transform="translate(0 0.338409)"/>
        </clipPath>
      </defs>
    </svg>
  );
}
