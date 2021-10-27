import { SVGProps } from "react";

export default function SpinnerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" color="white" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M15.2337 0C11.2789 0.189103 7.38704 1.83827 4.43501 4.9278C-1.67143 11.3186 -1.44385 21.4525 4.94332 27.5624C11.3305 33.6724 21.4586 33.4447 27.565 27.0538C30.6966 23.7764 32.1623 19.5145 31.9858 15.3158L27.9949 15.6408C28.085 18.7391 26.9836 21.8707 24.6737 24.2881C20.0939 29.0812 12.4979 29.252 7.70749 24.6695C2.91711 20.0871 2.74643 12.4867 7.32626 7.69355C9.37935 5.54483 12.0386 4.32504 14.7795 4.04598L15.2337 0Z" fill="currentColor" />
    </svg>
  )
}
