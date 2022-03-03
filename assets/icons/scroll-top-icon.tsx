import React, { SVGProps, memo } from 'react'

function ScrollTopIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="14" cy="14" r="13.5" fill="#151720" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.61313 16.9306C9.28313 16.6556 9.23855 16.1652 9.51354 15.8352L13.4024 11.1685C13.5502 10.9912 13.7691 10.8887 13.9999 10.8887C14.2308 10.8887 14.4497 10.9912 14.5974 11.1685L18.4863 15.8352C18.7613 16.1652 18.7167 16.6556 18.3867 16.9306C18.0568 17.2056 17.5663 17.161 17.2913 16.831L13.9999 12.8814L10.7086 16.831C10.4336 17.161 9.94312 17.2056 9.61313 16.9306Z"
        fill="white"
      />
    </svg>
  )
}

export default memo(ScrollTopIcon)
