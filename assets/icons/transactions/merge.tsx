import { SVGProps } from "react";

export default function MergeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={20}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 19V7a9 9 0 0 0 9 9"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
