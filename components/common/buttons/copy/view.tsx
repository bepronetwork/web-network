import { useRef } from "react";
import { Overlay, Popover } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import CopyIcon from "assets/icons/copy-icon";

import Button from "components/button";

import { CopyButtonProps } from "types/components";

interface CopyButtonViewProps extends CopyButtonProps {
  onClick: () => void;
  showPopOver: boolean;
}

export default function CopyButtonView({
  value,
  popOverLabel,
  onClick,
  showPopOver,
}: CopyButtonViewProps) {
  const { t } = useTranslation("common");

  const ref = useRef(null);

  return(
    <div ref={ref}>
      <Button
        onClick={onClick}
        color="gray-800"
        textClass="text-gray-50"
        className="border-radius-4 p-1 border-gray-700 not-svg"
      >
        <CopyIcon />
      </Button>

      <Overlay
        show={showPopOver}
        placement="top"
        container={ref}
        containerPadding={20}
        target={ref.current}
      >
        <Popover id={`popover-copy-${value}`} key={value}>
          <Popover.Body className="p-small text-black">
            <strong>{popOverLabel || t("misc.copied")}</strong>
          </Popover.Body>
        </Popover>
      </Overlay>
    </div>
  );
}