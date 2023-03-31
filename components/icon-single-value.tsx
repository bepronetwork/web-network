import { components } from "react-select";

export default function IconSingleValue(props) {
  const { SingleValue } = components;

  return(
    <SingleValue
      {...props}
      className={`d-flex flex-row align-items-center ${props.data.spaceBetween && "justify-content-between" || ""}`}
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