import DotsThreeIcon from "assets/icons/dots-three-icon";

import CustomDropdown from "components/common/custom-dropdown/view";
import NativeSelectWrapper from "components/common/native-select-wrapper/view";

import { CustomDropdownItem } from "types/components";

interface MoreActionsDropdownProps {
  actions: CustomDropdownItem[];
}

export default function MoreActionsDropdown({
  actions,
}: MoreActionsDropdownProps) {

  function actionsToOptions(_actions) {
    return _actions?.map((action, index) => ({
      value: index,
      label: action.content,
    }));
  }

  function onNativeChange(selectedOption) {
    if (!actions?.length) return;
    
    const action = actions[selectedOption.value];

    action?.onClick();
  }

  return(
    <NativeSelectWrapper
      options={actionsToOptions(actions)}
      onChange={onNativeChange}
    >
      <CustomDropdown
        items={actions}
        bg="light"
        size="sm"
        btnContent={
          <DotsThreeIcon />
        }
        withoutArrow
      />
    </NativeSelectWrapper>
  );
}