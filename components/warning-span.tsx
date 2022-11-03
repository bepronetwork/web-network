import { ReactNode } from "react";
import { Row } from "react-bootstrap";

import InfoIconEmpty from "assets/icons/info-icon-empty";
import WarningIcon from "assets/icons/warning-icon";

interface WarningSpanProps {
  text: string | ReactNode;
  type?: "warning" | "danger";
}

function WarningSpan({ text, type = "warning" } : WarningSpanProps) {
  const Icon = type === "warning" ? InfoIconEmpty : WarningIcon;
  return(
    <Row className={`p family-Regular font-weight-medium svg-${type} text-${type} border-radius-4 mt-2`}>
      <span>
        <span className="mr-1">
          <Icon width={12} height={12} />
        </span>
        {text}
      </span>
    </Row>
  );
}

export { WarningSpan };