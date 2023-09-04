import { ReactNode, useState } from "react";
import { Col, Collapse, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import ArrowDown from "assets/icons/arrow-down";
import ArrowUp from "assets/icons/arrow-up";

import Button from "components/button";

interface CollapsableProps {
  headerTitle?: string;
  labelShow?: string | ReactNode;
  labelHide?: string | ReactNode;
  labelColor?: string;
  activeColor?: string;
  children: ReactNode,
  className?: string;
  containerClassName?: string;
  isCollapsed?: boolean;
}

export default function Collapsable({
  headerTitle = "",
  labelShow = undefined,
  labelHide = undefined,
  labelColor = "primary",
  activeColor = "primary",
  children,
  className = "",
  containerClassName = "",
  isCollapsed = false
}: CollapsableProps) {
  const { t } = useTranslation("common");

  const [isOpen, setIsOpen] = useState(!isCollapsed);

  const icon = isOpen && <ArrowUp width={2.33} height={1.22} /> || <ArrowDown width={2.33} height={1.22} />;
  const label = isOpen ? labelHide || t("actions.hide") : labelShow || t("actions.show");
  const color = isOpen ? activeColor : labelColor;

  const switchOpen = () => setIsOpen(previous => !previous);

  return(
    <div className={containerClassName}>
      <Row className="align-items-center justify-content-between p-0 mx-0">
        <Col className="p-0">
          <span className="caption-medium font-weight-medium text-white">
            {headerTitle}
          </span>
        </Col>
        
        <Col xs="auto" className="p-0">
          <Button 
            onClick={switchOpen} 
            textClass={`p-0 text-${color} max-width-content font-weight-normal`} 
            transparent
          >
            {label}
            <span className={`ml-1 svg-${color}`}>{icon}</span>
          </Button>
        </Col>
      </Row>

      <Collapse in={isOpen}>
      <Row className={`bg-dark border-radius-8 justify-content-center align-items-center ${className}`}>
          {children}
        </Row> 
      </Collapse>
    </div>
  );
}