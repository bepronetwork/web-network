import { ReactNode } from "react";
import { Dropdown } from "react-bootstrap";

import ArrowDown from "assets/icons/arrow-down";

import { CustomDropdownItem } from "types/components";

interface CustomDropdownProps {
  btnContent: ReactNode;
  items: CustomDropdownItem[];
}

export default function CustomDropdown({
  btnContent,
  items,
}: CustomDropdownProps) {
  return(
    <Dropdown className="custom-dropdown">
      <Dropdown.Toggle className="not-svg">
        {btnContent}
        <ArrowDown />
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