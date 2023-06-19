import { SVGProps } from "react";

export default function ArrowDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.0134 0.988885C11.3905 1.30316 11.4414 1.86367 11.1272 2.2408L6.68272 7.57413C6.51384 7.7768 6.26366 7.89397 5.99986 7.89397C5.73605 7.89397 5.48588 7.77679 5.317 7.57413L0.872552 2.2408C0.558273 1.86367 0.609227 1.30316 0.986362 0.988885C1.3635 0.674606 1.924 0.72556 2.23828 1.1027L5.99986 5.61659L9.76144 1.1027C10.0757 0.725561 10.6362 0.674606 11.0134 0.988885Z"
        fill="#454654"
      />
    </svg>
  );
}
