import { SVGProps } from "react";

export default function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_728_14396)">
        <path
          d="M5 14.3488V7C5 6.73478 5.10536 6.48043 5.29289 6.29289C5.48043 6.10536 5.73478 6 6 6H26C26.2652 6 26.5196 6.10536 26.7071 6.29289C26.8946 6.48043 27 6.73478 27 7V14.3462C27 24.8687 18.0863 28.355 16.3075 28.9463C16.1083 29.015 15.8917 29.015 15.6925 28.9463C13.9138 28.3575 5 24.875 5 14.3488Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 17L14 20L21 13"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_728_14396">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
