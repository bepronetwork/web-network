import { SVGProps } from "react";

export default function EthereumIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
        fill="#627EEA"
      />
      <path
        d="M8.24902 2V6.435L11.9975 8.11L8.24902 2Z"
        fill="white"
        fillOpacity="0.602"
      />
      <path d="M8.249 2L4.5 8.11L8.249 6.435V2Z" fill="white" />
      <path
        d="M8.24902 10.984V13.9975L12 8.80801L8.24902 10.984Z"
        fill="white"
        fillOpacity="0.602"
      />
      <path
        d="M8.249 13.9975V10.9835L4.5 8.80801L8.249 13.9975Z"
        fill="white"
      />
      <path
        d="M8.24902 10.2865L11.9975 8.11L8.24902 6.436V10.2865Z"
        fill="white"
        fillOpacity="0.2"
      />
      <path
        d="M4.5 8.11L8.249 10.2865V6.436L4.5 8.11Z"
        fill="white"
        fillOpacity="0.602"
      />
    </svg>
  )
}

