import { SVGProps } from "react";

export default function DoubleArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16.5 13.5L19.5 16.5L16.5 19.5"
        stroke="#C7C8D1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 16.5L19.5 16.5"
        stroke="#C7C8D1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 10.5L4.5 7.5L7.5 4.5"
        stroke="#C7C8D1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 7.5L4.5 7.5"
        stroke="#C7C8D1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
