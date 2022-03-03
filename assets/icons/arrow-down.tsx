import { SVGProps } from 'react'

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
        d="M11.6402 0.231804C12.0645 0.585368 12.1218 1.21593 11.7682 1.64021L6.76825 7.64021C6.57825 7.8682 6.2968 8.00002 6.00002 8.00002C5.70324 8.00002 5.4218 7.8682 5.2318 7.64021L0.231804 1.64021C-0.12176 1.21593 -0.0644366 0.585368 0.359841 0.231804C0.784118 -0.12176 1.41468 -0.0644362 1.76825 0.359841L6.00002 5.43798L10.2318 0.359841C10.5854 -0.0644357 11.2159 -0.12176 11.6402 0.231804Z"
        fill="white"
      />
    </svg>
  )
}
