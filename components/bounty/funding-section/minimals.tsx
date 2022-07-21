import { Col, Row } from "react-bootstrap";

import { formatNumberToCurrency } from "helpers/formatNumber";

export const RowCenterBetween = ({ children }) => 
    <Row className="align-items-center justify-content-between">
      {children}
    </Row>;
  
export const ColAuto = ({ children }) => <Col xs="auto">{children}</Col>;

export const CaptionMedium = ({ text }) => 
  <span className="caption-medium text-gray-70 font-weight-normal">{text}</span>;

export const Amount = ({ amount = 0, symbol = undefined, className = "" }) => 
  <span className={`h4 family-Regular ${className || "text-white"}`}>
    {formatNumberToCurrency(amount)}
    {symbol && <span className="ml-1 caption-medium text-primary">${symbol}</span>}
  </span>;

export const RowWithTwoColumns = ({ col1, col2 = undefined }) => 
  <RowCenterBetween>
    <ColAuto>
      {col1}
    </ColAuto>

    { col2 && 
      <ColAuto>
        {col2}
      </ColAuto>
    }
  </RowCenterBetween>;