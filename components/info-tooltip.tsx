import { OverlayTrigger, Popover } from "react-bootstrap";

import InfoIcon from "assets/icons/info-icon";
import InfoIconEmpty from "assets/icons/info-icon-empty";

export default function InfoTooltip({
  description = "",
  secondaryIcon = false,
}) {
  const popover = (
    <Popover id="popover-tabbed-description" className="p-2 bg-white">
      <Popover.Body
        as="p"
        className="p-small-bold m-0 py-0 px-2 text-light-gray"
      >
        {description}
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger placement="bottom" overlay={popover}>
      <span className="d-flex align-items-center text-gray-500">
        {!secondaryIcon ? (
          <InfoIcon
            width={14}
            height={14}
            color="gray-500"
            className="info"
          />
        ) : (
          <InfoIconEmpty
            width={14}
            height={14}
            color="gray-500"
            className="empty-info"
          />
        )}
      </span>
    </OverlayTrigger>
  );
}
