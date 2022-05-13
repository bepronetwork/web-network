import Select, { Props } from "react-select";

export default function ReactSelect(params: Props) {
  return (
    <Select
      className="react-select-container"
      classNamePrefix="react-select"
      {...params}
    />
  );
}
