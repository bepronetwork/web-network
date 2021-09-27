import { SVGProps } from "react";
const ArrowGoTo: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M1.13791 1.94254C0.693544 1.94254 0.333313 1.58231 0.333313 1.13794C0.333313 0.693574 0.693544 0.333344 1.13791 0.333344H8.86205C9.30641 0.333344 9.66665 0.693574 9.66665 1.13794V8.86208C9.66665 9.30645 9.30641 9.66668 8.86205 9.66668C8.41768 9.66668 8.05745 9.30645 8.05745 8.86208V3.08041L1.70685 9.43101C1.39263 9.74523 0.883189 9.74523 0.568974 9.43101C0.254759 9.1168 0.254759 8.60736 0.568974 8.29314L6.91958 1.94254H1.13791Z" fill="currentColor"/>
    </svg>
  );
}

export default ArrowGoTo;
