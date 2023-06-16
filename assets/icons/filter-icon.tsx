import { memo } from "react";

function FilterIcon() {
  return (
    <svg
      width="16"
      height="17"
      viewBox="0 0 16 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_871_9953)">
        <path
          d="M4 8.33838H12"
          stroke="#D5D6DD"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1.5 5.33838H14.5"
          stroke="#D5D6DD"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 11.3384H9.5"
          stroke="#D5D6DD"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_871_9953">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0 0.338379)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

export default memo(FilterIcon);
