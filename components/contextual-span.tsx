import { ReactNode, SVGProps, useState } from "react";

import clsx from "clsx";

import CloseIcon from "assets/icons/close-icon";
import InfoIconEmpty from "assets/icons/info-icon-empty";
import SuccessIcon from "assets/icons/success-icon";
import WarningIcon from "assets/icons/warning-icon";

import Button from "components/button";
import If from "components/If";
import { FlexColumn, FlexRow } from "components/profile/wallet-balance";

interface ContextualSpanProps {
  children: ReactNode;
  context: "success" | "danger" | "warning" | "info" | "primary";
  color?: string;
  className?: string;
  classNameIcon?: string;
  isAlert?: boolean;
}

export function ContextualSpan({
  children,
  context,
  color,
  className = "",
  isAlert,
  classNameIcon
}: ContextualSpanProps) {
  const [visible, setVisible] = useState(true);

  const contextColor = color || context;
  const CLASSES = clsx([
    "p family-Regular font-weight-medium border-radius-4 align-items-center mx-0",
    `text-${contextColor} ${className}`,
    isAlert && `bg-${contextColor}-25 p-3 border border-${contextColor} border-radius-8 justify-content-between`
  ]);

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

  function hide() {
    setVisible(false);
  }

  if (isAlert && !visible)
    return <></>;

  return(
    <FlexRow className={CLASSES}>
      <FlexRow className="align-items-center">
        <span className={`mr-1 svg-${contextColor} ${classNameIcon}`}>
          <Icon width={12} height={12} />
        </span>

        {children}
      </FlexRow>

      <If condition={isAlert}>
        <FlexColumn>
          <Button
            transparent
            onClick={hide}
            className={`svg-${contextColor} p-0 not-svg`}
          >
            <CloseIcon width={10} height={10} />
          </Button>
        </FlexColumn>
      </If>
    </FlexRow>
  );
}