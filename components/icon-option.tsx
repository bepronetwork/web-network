import { components } from "react-select";

export default function IconOption(props) {
  const { Option } = components;

  return(
    <Option {...props} className="d-flex flex-row justify-content-between">
      <span>
        {
          props.data.preIcon && 
          <span className="mr-1">
            {props.data.preIcon}
          </span>
        }
        
        {props.data.label}
      </span>

      {
       props.data.postIcon && 
        <span>
          {props.data.postIcon}
        </span>
      }
   </Option>
  );
}