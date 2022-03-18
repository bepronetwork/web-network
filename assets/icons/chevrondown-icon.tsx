import { SVGProps } from "react";

export default function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 26 18"
      fill="none"
      color="white"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M25.2203 0.50224C26.1396 1.26829 26.2638 2.63451 25.4978 3.55377L14.6645 16.5537C14.2528 17.0477 13.643 17.3333 13 17.3333C12.357 17.3333 11.7472 17.0477 11.3355 16.5537L0.50224 3.55377C-0.263812 2.63451 -0.139612 1.26829 0.779652 0.502239C1.69892 -0.263813 3.06513 -0.139611 3.83118 0.779652L13 11.7822L22.1688 0.779652C22.9349 -0.13961 24.3011 -0.263812 25.2203 0.50224Z"
        fill="currentColor"
      />
    </svg>
  );
}
