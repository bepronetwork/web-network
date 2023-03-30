import { SVGProps } from "react";

export default function CheckCircle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="108"
      height="108"
      viewBox="0 0 108 108"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M72.5625 43.875L47.7984 67.5L35.4375 55.6875"
        stroke="#4250E4"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M54 94.5C76.3675 94.5 94.5 76.3675 94.5 54C94.5 31.6325 76.3675 13.5 54 13.5C31.6325 13.5 13.5 31.6325 13.5 54C13.5 76.3675 31.6325 94.5 54 94.5Z"
        stroke="#4250E4"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
