import { ReactNode, SVGProps } from "react";

import clsx from "clsx";

import CloseIcon from "assets/icons/close-icon";
import InfoIconEmpty from "assets/icons/info-icon-empty";
import SuccessIcon from "assets/icons/success-icon";
import WarningIcon from "assets/icons/warning-icon";

import { FlexRow } from "components/profile/wallet-balance";

interface ContextualSpanProps {
  children: ReactNode;
  context: "success" | "danger" | "warning" | "info" | "primary";
  color?: string;
  className?: string;
  isAlert?: boolean;
}

export function ContextualSpan({ children, context, color, className = "", isAlert } : ContextualSpanProps) {
  const contextColor = color || context;
  const CLASSES = clsx("p family-Regular font-weight-medium border-radius-4 align-items-center mx-0 px-1", 
                       `text-${contextColor} ${className}`,
                       isAlert && `bg-${contextColor}-25 py-2 border border-${contextColor}`);

  const Icon = (props: SVGProps<SVGSVGElement>) => {
    const icons = {
      success: SuccessIcon,
      danger: CloseIcon,
      warning: WarningIcon,
      info: InfoIconEmpty,
      primary: WarningIcon
    };

    return icons[context](props);
  };

  return(
    <FlexRow className={CLASSES}>
      <span className={`mr-1 svg-${contextColor}`}>
        <Icon width={12} height={12} />
      </span>
      {children}
    </FlexRow>
  );
}