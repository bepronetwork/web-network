import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function Avatar({
  userLogin,
  className,
  src,
  tooltip = false,
  border = false
}: {
  userLogin: string;
  className?: string;
  src?: string;
  tooltip?: boolean;
  border?: boolean;
}) {
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
        className={`avatar circle-3 ${border && "border-avatar"} ${className}`}
        src={src || `https://github.com/${userLogin}.png`}
      />
    </OverlayTrigger>
  );
}
