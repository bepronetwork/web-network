import { components } from "react-select";

import clsx from "clsx";

export default function IconSingleValue(props) {
  const { SingleValue } = components;

  return(
    <SingleValue
      {...props}
      className={clsx([
        "d-flex flex-row align-items-center",
        props.data.justify && `justify-content-${props.data.justify}` || ""
      ])}
    >
      { props.data.preIcon &&
        <span className="mr-1">
          {props.data.preIcon}
        </span>
      }

      <span className="text-truncate text-uppercase">
        {props.children}
      </span>

      { props.data.postIcon &&
        <span>
          {props.data.postIcon}
        </span>
      }
   </SingleValue>
  );
}