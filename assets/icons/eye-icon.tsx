import { SVGProps } from "react";

export default function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="1" y="0.5" width="23" height="23" rx="3.5" fill="#2E2F38" />
      <g clipPath="url(#clip0_1270_16847)">
        <path
          d="M12.5 7.5C7.5 7.5 5.5 12 5.5 12C5.5 12 7.5 16.5 12.5 16.5C17.5 16.5 19.5 12 19.5 12C19.5 12 17.5 7.5 12.5 7.5Z"
          stroke="#F1F1F4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.5 14.5C13.8807 14.5 15 13.3807 15 12C15 10.6193 13.8807 9.5 12.5 9.5C11.1193 9.5 10 10.6193 10 12C10 13.3807 11.1193 14.5 12.5 14.5Z"
          stroke="#F1F1F4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <rect x="1" y="0.5" width="23" height="23" rx="3.5" stroke="#454654" />
      <defs>
        <clipPath id="clip0_1270_16847">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(4.5 4)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
