import { SVGProps } from "react";

export default function SuccessIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" color="white" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16ZM24.2089 14.0418C24.8948 13.4846 24.999 12.4769 24.4418 11.7911C23.8846 11.1052 22.8769 11.001 22.1911 11.5582L13.5011 18.6188L10.7667 15.7051C10.162 15.0607 9.14945 15.0286 8.5051 15.6333C7.86075 16.238 7.8286 17.2506 8.4333 17.8949L12.1871 21.8949C12.7616 22.507 13.7113 22.5711 14.3628 22.0418L24.2089 14.0418Z" fill="currentColor"/>
    </svg>
  )
}

