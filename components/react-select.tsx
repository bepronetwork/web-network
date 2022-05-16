import Select from "react-select";

 //TODO: Need to rework components to be able to use Props correctly { Props }
export default function ReactSelect(params: any) { // eslint-disable-line 
  return (
    <Select
      className="react-select-container"
      classNamePrefix="react-select"
      {...params}
    />
  );
}
