import { SVGProps } from "react";

export default function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clip-path="url(#clip0_1192_15816)">
    <path d="M11.5 4.5H2.5V13.5H11.5V4.5Z" stroke="#ECEEFC" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.5 2.5H13.5V11.5" stroke="#ECEEFC" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
    <clipPath id="clip0_1192_15816">
    <rect width="16" height="16" fill="white"/>
    </clipPath>
    </defs>
  </svg>
  );
}
