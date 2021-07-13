import Select from "react-select";

export default function ReactSelect(params: any) {
  return (
    <Select
      className="react-select-container"
      classNamePrefix="react-select"
      {...params}
    />
  );
}
