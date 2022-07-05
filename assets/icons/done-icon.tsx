import { SVGProps } from "react";

export default function DoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="10"
      height="8"
      viewBox="0 0 10 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9 1.10742L3.5 6.60742L1 4.10742"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
