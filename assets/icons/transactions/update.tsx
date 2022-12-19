import { SVGProps } from "react";

export default function UpdateIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M23 1.99768V7.99768H17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1 17.9977V11.9977H7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path 
        d={`M3.51 6.99763C4.01717 5.56442 4.87913 4.28304 6.01547 3.27305C7.1518 2.26307 8.52547 1.5574 10.0083 
        1.22189C11.4911 0.886385 13.0348 0.931975 14.4952 1.35441C15.9556 1.77684 17.2853 2.56235 18.36 3.63763L23
        7.99763M1 11.9976L5.64 16.3576C6.71475 17.4329 8.04437 18.2184 9.50481 18.6409C10.9652 19.0633 12.5089
        19.1089 13.9917 18.7734C15.4745 18.4379 16.8482 17.7322 17.9845 16.7222C19.1209 15.7122 19.9828 14.4308
        20.49 12.9976`}
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
