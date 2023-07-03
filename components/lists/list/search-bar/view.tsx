import { ChangeEvent, KeyboardEvent } from "react";
import { FormControl, InputGroup } from "react-bootstrap";

import CloseIcon from "assets/icons/close-icon";
import SearchIcon from "assets/icons/search-icon";

import Button from "components/button";
import If from "components/If";

import { SortOption } from "types/components";

interface ListSearchBarProps {
  searchString: string;
  placeholder: string;
  sortOptions?: SortOption[];
  hasFilter: boolean;
  onSearchClick: () => void;
  onSearchInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onEnterPressed: (e: KeyboardEvent) => void;
  onClearSearch: () => void;
}

export default function ListSearchBar({
  searchString,
  placeholder,
  hasFilter,
  onSearchClick,
  onSearchInputChange,
  onEnterPressed,
  onClearSearch,
}: ListSearchBarProps) {
  return (
    <InputGroup className="border-radius-8">
      <InputGroup.Text className="cursor-pointer" onClick={onSearchClick}>
        <SearchIcon />
      </InputGroup.Text>

      <FormControl
        value={searchString}
        onChange={onSearchInputChange}
        className="p-2"
        placeholder={placeholder}
        onKeyDown={onEnterPressed}
      />

      <If condition={hasFilter}>
        <Button
          className="bg-gray-900 border-0 py-0 px-3 rounded-0"
          onClick={onClearSearch}
        >
          <CloseIcon width={10} height={10} />
        </Button>
      </If>
    </InputGroup>
  );
}
