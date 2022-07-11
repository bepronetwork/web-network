import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

import { SizeOptions } from "interfaces/utils";

export default function Avatar({
  userLogin,
  className,
  src,
  tooltip = false,
  border = false,
  size = "sm"
}: {
  userLogin: string;
  className?: string;
  src?: string;
  tooltip?: boolean;
  border?: boolean;
  size?: SizeOptions;
}) {
  const SIZES = {
    sm: 3,
    md: 4,
    lg: 5
  }
  if (userLogin || src)
    return (
      <OverlayTrigger
        key="right"
        placement="right"
        overlay={
          (tooltip && <Tooltip id={"tooltip-right"}>@{userLogin}</Tooltip>) || (
            <></>
          )
        }
      >
        <img
          className={`avatar circle-${SIZES[size]} ${border && "border-avatar" || ""} ${className}`}
          src={src || `https://github.com/${userLogin}.png`}
        />
      </OverlayTrigger>
    );

  return <></>;
}
