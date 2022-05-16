import { components } from "react-select";

export default function IconSingleValue(props) {
  const { SingleValue } = components;

  return(
    <SingleValue {...props} className="d-flex flex-row justify-content-between align-items-center">
      <span>
        {
          props.data.preIcon && 
          <span className="mr-1">
            {props.data.preIcon}
          </span>
        }
        
        {props.children}
      </span>

      {
       props.data.postIcon && 
        <span>
          {props.data.postIcon}
        </span>
      }
   </SingleValue>
  );
}