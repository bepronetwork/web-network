import { SVGProps, memo } from "react";

function OpenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="10"
      height="12"
      viewBox="0 0 10 12"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M0.977714 2C0.437738 2 0 2.43774 0 2.97771C0 3.51769 0.437738 3.95543 0.977714 3.95543H6.66188L0.286366 10.3309C-0.0954552 10.7128 -0.0954552 11.3318 0.286366 11.7136C0.668187 12.0955 1.28724 12.0955 1.66906 11.7136L8.04457 5.33813V11.0223C8.04457 11.5623 8.48231 12 9.02229 12C9.56226 12 10 11.5623 10 11.0223V2.97771C10 2.43774 9.56226 2 9.02229 2H0.977714Z"
        fill="#C4C7D3"
      />
    </svg>
  );
}

export default memo(OpenIcon);
