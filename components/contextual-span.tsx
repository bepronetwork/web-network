import { ReactNode, SVGProps } from "react";
import { Row } from "react-bootstrap";

import CloseIcon from "assets/icons/close-icon";
import InfoIconEmpty from "assets/icons/info-icon-empty";
import SuccessIcon from "assets/icons/success-icon";
import WarningIcon from "assets/icons/warning-icon";

interface ContextualSpanProps {
  children: ReactNode;
  context: "success" | "danger" | "warning" | "info";
  color?: string;
}

export function ContextualSpan({ children, context, color } : ContextualSpanProps) {
  const contextColor = color || context;
  const CLASSES = 
    `p family-Regular font-weight-medium svg-${contextColor} text-${contextColor} border-radius-4`;

  const Icon = (props: SVGProps<SVGSVGElement>) => {
    const icons = {
      success: SuccessIcon,
      danger: CloseIcon,
      warning: WarningIcon,
      info: InfoIconEmpty
    };

    return icons[context](props);
  };

  return(
    <Row className={CLASSES}>
      <span className="px-0">
        <span className="mr-1">
          <Icon width={12} height={12} />
        </span>
        {children}
      </span>
    </Row>
  );
}