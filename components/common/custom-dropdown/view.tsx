import { ReactNode } from "react";
import { Dropdown } from "react-bootstrap";

import ArrowDown from "assets/icons/arrow-down";

import If from "components/If";

import { CustomDropdownItem } from "types/components";

interface CustomDropdownProps {
  btnContent: ReactNode;
  items: CustomDropdownItem[];
  withoutArrow?: boolean;
  bg?: "dark" | "light";
  size?: "sm" | "md";
}

export default function CustomDropdown({
  btnContent,
  items,
  withoutArrow,
  bg = "dark",
  size = "md",
}: CustomDropdownProps) {
  return(
    <Dropdown
      align="end"
      className={`custom-dropdown ${bg}`}
    >
      <Dropdown.Toggle className={`not-svg ${size === "sm" ? "p-0" : ""}`}>
        {btnContent}
        <If condition={!withoutArrow}>
          <ArrowDown />
        </If>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {items?.map(({ content, onClick }, index) => 
          <Dropdown.Item 
            key={`c-drop-${index}`} 
            onClick={onClick}
          >
            {content}
          </Dropdown.Item>)}
      </Dropdown.Menu>
    </Dropdown>
  );
}