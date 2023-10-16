import {useEffect, useState} from "react";
import Select, {Props as ReactSelectProps} from 'react-select';

import {useTranslation} from "next-i18next";

export type DropdownOption = {
  label: string;
  value: string;
}

interface DropDownProps extends ReactSelectProps {
  label?: string
  options: DropdownOption[],
  onSelected?: (option: DropdownOption | DropdownOption[]) => void,
}

export default function DropDown({
  label,
  options: defaultOptions,
  onSelected,
  className,
  ...props
}: DropDownProps) {
  const { t } = useTranslation("common");

  const [option, setOption] = useState<DropdownOption>();
  const [options, setOptions] = useState<DropdownOption[]>(defaultOptions || []);

  const handleChange = (newValue) => {
    setOption(newValue);
    onSelected?.(newValue)
  };

  useEffect(()=> setOptions(defaultOptions) ,[defaultOptions])

  return (
    <div className="form-group">
      {label ?<label className="caption-small mb-2">{label || t("misc.token")}</label> : null} 
      <Select
        isSearchable={false}
        className={`react-select-container ${className || ""}`}
        classNamePrefix="react-select"
        isMulti
        onChange={handleChange}
        options={options}
        value={option}
        {...props}
      />
    </div>
  );
}
