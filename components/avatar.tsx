import React from "react";

export default function Avatar({
  userLogin,
  className,
}: {
  userLogin: string;
  className?: string;
}): JSX.Element {
  return (
    <img
      className={`avatar circle-3 ${className}`}
      src={`https://github.com/${userLogin}.png`}
    />
  );
}
