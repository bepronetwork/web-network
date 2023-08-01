import { ReactNode, SVGProps, useState } from "react";

import clsx from "clsx";

import CloseIcon from "assets/icons/close-icon";
import InfoIconEmpty from "assets/icons/info-icon-empty";
import SuccessIcon from "assets/icons/success-icon";
import WarningIcon from "assets/icons/warning-icon";

import Button from "components/button";
import If from "components/If";

import { FlexColumn, FlexRow } from "./common/flex-box/view";

interface ContextualSpanProps {
  children: ReactNode;
  context: "success" | "danger" | "warning" | "info" | "primary";
  color?: string;
  className?: string;
  classNameIcon?: string;
  isAlert?: boolean;
  isDismissable?: boolean;
  icon?: boolean;
  classNameChildren?: string;
}

export function ContextualSpan({
  children,
  context,
  color,
  className = "",
  isAlert,
  classNameIcon,
  isDismissable = false,
  icon = true,
  classNameChildren,
}: ContextualSpanProps) {
  const [visible, setVisible] = useState(true);

  const contextColor = color || context;
  const CLASSES = clsx([
    `p family-Regular ${icon ? 'font-weight-500 align-items-center' : 'font-weight-400'} border-radius-4`,
    isAlert ? "mx-0" : "px-0",
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

  if (isAlert && isDismissable && !visible)
    return <></>;

  return(
    <FlexRow className={CLASSES}>
      <FlexColumn>
        <FlexRow className={`${icon ? 'align-items-center': 'align-items-start'}`}>
          <div>
            {icon ? (
              <span className={`mr-1 svg-${contextColor} ${classNameIcon}`}>
                <Icon width={12} height={12} />
              </span>
            ) : (
              <div className={`ball-sm bg-${context} me-2 mt-2`} />
            )}
          </div>
          <div className={`col-12 ${classNameChildren}`}>
            {children}  
          </div>
        </FlexRow>
      </FlexColumn>

      <If condition={isAlert && isDismissable}>
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