import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { components } from "react-select";

export default function IconOption(props) {
  const { Option } = components;

  const popover = props.data.tooltip ? (
    <Tooltip id={`tooltip-${props.label}`}>
      {props.data.tooltip}
    </Tooltip>
  ) : <></>;

  return(
    <Option {...props} className={
      `d-flex bg-none flex-row align-items-center
      ${props.data.isDisabled ? 'bg-transparent-hover text-light-gray' : ''}
    `}>
      <OverlayTrigger key={`overlay-${props.label}`} placement="right" overlay={popover}>
        <div
          className={`
            text-truncate text-uppercase d-flex bg-none flex-row align-items-center
            ${props.data.spaceBetween && "justify-content-between w-100" || ""}
          `}
        >
          { props.data.preIcon &&
            <span className="mr-1">
              {props.data.preIcon}
            </span>
          }

          <span className="text-overflow-ellipsis">
            {props.data.label}
          </span>

          <span>
            {
              (props.data.isDisabled && props.data.disabledIcon) &&
              <span className="me-2">
                {props.data.disabledIcon}
              </span>
            }

            {
              props.data.postIcon &&
              <span>
                {props.data.postIcon}
              </span>
            }
          </span>
        </div>
      </OverlayTrigger>
    </Option>
  );
}