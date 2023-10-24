import { useState } from "react";
import { FormCheck } from "react-bootstrap";

import { IssueFilterBoxParams } from "interfaces/filters";

export default function IssueFilterBox({
  title,
  options = [],
  onChange,
  type = "radio",
  className = "",
  filterPlaceholder = ""
}: IssueFilterBoxParams) {
  const [search, setSearch] = useState("");

  function filterSearch(option) {
    return option?.label?.search(search) > -1;
  }

  function getKey(title, value) {
    return title.replace(" ", "").toLowerCase().concat(value);
  }

  return (
    <div className={`filter-box px-2 pt-2 bg-gray-850 ${className}`}>
      <div
        className={`text-uppercase caption text-white mn-2 p-2 ${
          (!filterPlaceholder && "pb-3") || ""
        } filter-header`}
      >
        {title}
      </div>
      {(filterPlaceholder && (
        <div className="mt-3">
          <input
            value={search}
            onChange={(e) => setSearch(e?.target?.value)}
            type="text"
            className="form-control"
            placeholder={filterPlaceholder}
          />
        </div>
      )) ||
        ""}
      <div
        className={`bg-gray-850 mxn-2 px-2 filter-content ${
          (filterPlaceholder && "filter-search") || ""
        }`}
      >
        {options.filter(filterSearch).map((option) => (
          <FormCheck
            className="py-1 p-small-bold"
            key={getKey(title, option.value)}
            name={title.replace(" ", "")}
            type={type}
            label={option.label}
            id={getKey(title, option.value)}
            checked={option.checked}
            onChange={(e) => onChange(option, e.target.checked)}
          />
        ))}
      </div>
    </div>
  );
}
