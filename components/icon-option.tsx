import { components } from "react-select";

export default function IconOption(props) {
  const { Option } = components;

  return(
    <Option {...props} className={
      `d-flex bg-none flex-row justify-content-between 
      ${props.data.isDisabled ? 'bg-transparent-hover text-ligth-gray' : ''}
    `}>
      <span>
        {
          props.data.preIcon &&
          <span className="mr-1">
            {props.data.preIcon}
          </span>
        }

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
    </Option>
  );
}