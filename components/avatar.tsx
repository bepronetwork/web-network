import React from "react";

export default function Avatar({
  userLogin,
  className,
  src,
}: {
  userLogin: string;
  className?: string;
  src?: string
}): JSX.Element {
  return (
    <img
      className={`avatar circle-3 ${className}`}
      src={ src || `https://github.com/${userLogin}.png`}
    />
  );
}
