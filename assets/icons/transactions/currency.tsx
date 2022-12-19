import { SVGProps } from "react";

export default function CurrencyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="24" viewBox="0 0 14 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M7 1V23" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path 
        d={`M12 5H4.5C3.57174 5 2.6815 5.36875 2.02513 6.02513C1.36875 6.6815 1 7.57174 1 8.5C1 9.42826
        1.36875 10.3185 2.02513 10.9749C2.6815 11.6313 3.57174 12 4.5 12H9.5C10.4283 12 11.3185 12.3687
        11.9749 13.0251C12.6313 13.6815 13 14.5717 13 15.5C13 16.4283 12.6313 17.3185 11.9749
        17.9749C11.3185 18.6313 10.4283 19 9.5 19H1`}
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
