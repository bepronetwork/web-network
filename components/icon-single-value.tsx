import { components } from "react-select";

export default function IconSingleValue(props) {
  const { SingleValue } = components;

  return(
    <SingleValue {...props} className="d-flex flex-row align-items-center">
      { props.data.preIcon &&
        <span className="mr-1">
          {props.data.preIcon}
        </span>
      }

      <span className="text-truncate">
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