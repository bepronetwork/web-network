import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import ListSortView from "components/lists/sort/view";

import { CustomDropdownItem, SortOption } from "types/components";

import useBreakPoint from "x-hooks/use-breakpoint";

interface ListSortProps {
  defaultOptionIndex?: number;
  options: SortOption[];
  labelLineBreak?: boolean;
  asSelect?: boolean;
  index?: number;
  updateIndex?: (e: number) => void;
}

export default function ListSort({
  defaultOptionIndex = 0,
  options,
  labelLineBreak,
  asSelect,
  index,
  updateIndex
}: ListSortProps) {
  const router = useRouter();

  const [selectedIndex, setSelectedIndex] = useState<number>();
  const [componentVersion, setComponentVersion] = useState<string>();

  const { isDesktopView } = useBreakPoint();

  const { sortBy, order } = router.query;

  function handleSelectChange(newValue) {

    const currentIndex = options?.findIndex(option => option.sortBy === newValue.sortBy && 
      option.order === newValue.order)

    updateIndex ? updateIndex(currentIndex) : setSelectedIndex(currentIndex);

    if(!updateIndex) {
      const query = {
        ...router.query,
        sortBy: newValue.sortBy,
        order: newValue.order,
        page: "1"
      };
  
      router.push({ pathname: router.pathname, query }, router.asPath, { shallow: false, scroll: false });
    }
  }
  console.log('update', index, selectedIndex)
  function getDefaultValue(): SortOption {
    if (sortBy && order) {
      const optionExists = options.find((option) => option.sortBy === sortBy && option.order === order);

      if (optionExists) return optionExists;
    }

    return options[defaultOptionIndex];
  }

  function optionsToDropdownItems(): CustomDropdownItem[] {
    return options?.map(option => ({
      content: option?.label,
      onClick: () => handleSelectChange(option)
    }));
  }

  useEffect(() => {
    setComponentVersion(isDesktopView ? "desktop" : "mobile");
  }, [isDesktopView]);

  return (
    <ListSortView
      defaultOption={getDefaultValue()}
      options={options}
      onChange={handleSelectChange}
      dropdownItems={optionsToDropdownItems()}
      labelLineBreak={labelLineBreak}
      asSelect={asSelect}
      selectedIndex={updateIndex ? index : selectedIndex}
      componentVersion={componentVersion}
    />
  );
}
