import { Row } from "react-bootstrap";

import InfoIconEmpty from "assets/icons/info-icon-empty";

function WarningSpan({ text } : { text: string; }) {
  return(
    <Row className="p family-Regular font-weight-medium svg-warning text-warning border-radius-4 mt-2">
      <span>
        <span className="mr-1">
          <InfoIconEmpty width={12} height={12} />
        </span>
        {text}
      </span>
    </Row>
  );
}

export { WarningSpan };