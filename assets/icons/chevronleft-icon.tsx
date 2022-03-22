import { SVGProps } from "react";

export default function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 18 26"
      fill="none"
      color="white"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.4978 25.2203C16.7318 26.1396 15.3656 26.2638 14.4463 25.4978L1.44634 14.6645C0.95236 14.2528 0.666748 13.643 0.666748 13C0.666748 12.357 0.95236 11.7472 1.44634 11.3355L14.4463 0.50224C15.3656 -0.263812 16.7318 -0.139612 17.4978 0.779652C18.2639 1.69892 18.1397 3.06513 17.2204 3.83118L6.21783 13L17.2204 22.1688C18.1397 22.9349 18.2639 24.3011 17.4978 25.2203Z"
        fill="currentColor"
      />
    </svg>
  );
}
