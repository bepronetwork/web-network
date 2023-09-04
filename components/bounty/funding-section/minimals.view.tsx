import { Col, Row } from "react-bootstrap";

import BigNumber from "bignumber.js";

import { formatNumberToCurrency, formatStringToCurrency } from "helpers/formatNumber";

export const RowCenterBetween = ({ children, className = "" }) => 
    <Row className={`align-items-center justify-content-between ${className}`}>
      {children}
    </Row>;
  
export const ColAuto = ({ children, className="" }) => <Col xs="auto" className={className}>{children}</Col>;

export const CaptionMedium = ({ text, color = "gray-70" }) => 
  <span className={`caption-medium text-${color} font-weight-normal`}>{text}</span>;

export const CaptionLarge = ({ text, color = "gray-70" }) => 
  <span className={`caption-large text-${color} font-weight-normal`}>{text}</span>;

export const Amount = ({ 
  amount = 0, 
  symbol = undefined, 
  symbolColor = "primary", 
  className = undefined, 
  type = "currency" 
}: {
  amount: number | string;
  symbol?: string;
  symbolColor?: string;
  className?: string;
  type?: "currency" | "percent";
}) => 
  <span className={`d-flex align-items-center family-Regular ${className || "h4 text-white"}`}>
    {type === "currency" && formatStringToCurrency(BigNumber(amount).toFixed())}
    
    {type === "percent" && `${formatNumberToCurrency(amount, { maximumFractionDigits: 4 })}%`}

    {(type === "currency" && symbol) && 
      <span className={`ml-1 ${ className && "caption-small" || "caption-medium"} text-${symbolColor}`}>
        {symbol}
      </span>
    }
  </span>;

export const RowWithTwoColumns = ({
  col1,
  col2 = undefined,
  filler = false,
  className = "",
  classNameCol2 = undefined,
}) => (
  <RowCenterBetween className={className}>
    <ColAuto>{col1}</ColAuto>

    {filler && (
      <ColAuto className="flex-grow-1">
        <div className="border-bottom-dashed border-disabled"></div>
      </ColAuto>
    )}

    {col2 && <ColAuto className={classNameCol2}>{col2}</ColAuto>}
  </RowCenterBetween>
);