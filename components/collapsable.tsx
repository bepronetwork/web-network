import { useState } from "react";
import { Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import ArrowDown from "assets/icons/arrow-down";
import ArrowUp from "assets/icons/arrow-up";

import Button from "components/button";

export default function Collapsable({
  labelShow = undefined,
  labelHide = undefined,
  labelColor = "primary",
  activeColor = "primary",
  children,
  className = ""
}) {
  const { t } = useTranslation("common");

  const [isOpen, setIsOpen] = useState(false);

  const icon = isOpen && <ArrowUp width={2.33} height={1.22} /> || <ArrowDown width={2.33} height={1.22} />;
  const label = isOpen ? labelHide || t("actions.hide") : labelShow || t("actions.show");
  const color = isOpen ? activeColor : labelColor;

  const switchOpen = () => setIsOpen(previous => !previous);

  return(
    <>
      <Row className="justify-content-end px-0 mx-0">
        <Button 
          onClick={switchOpen} 
          textClass={`px-0 text-${color} max-width-content font-weight-normal`} 
          transparent
        >
          {label}
          <span className={`ml-1 svg-${color}`}>{icon}</span>
        </Button>
      </Row>

      { isOpen && 
        <Row className={`bg-dark mx-0 border-radius-8 p-3 justify-content-center align-items-center ${className}`}>
          {children}
        </Row> 
      }
    </>
  );
}