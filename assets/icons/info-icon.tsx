import { SVGProps } from "react";

export default function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" color="white" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32ZM16 14.4C16.8837 14.4 17.6 15.1163 17.6 16V22.4C17.6 23.2837 16.8837 24 16 24C15.1163 24 14.4 23.2837 14.4 22.4V16C14.4 15.1163 15.1163 14.4 16 14.4ZM16 8C15.1163 8 14.4 8.71634 14.4 9.6C14.4 10.4837 15.1163 11.2 16 11.2H16.016C16.8997 11.2 17.616 10.4837 17.616 9.6C17.616 8.71634 16.8997 8 16.016 8H16Z" fill="currentColor" />
    </svg>
  )
}

