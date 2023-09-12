import NetworkTabContainer from "../../tab-container/view";
import Translation from "../../../../translation";
import PermissionInput from "../../../../common/inputs/permission-input/permission-input";
import If from "../../../../If";
import PermissionListItem from "../../../../common/lists/permission-list/permission-list-item";

type AllowListViewProps = {
  allowList: string[],
  value: string,
  onTrashClick(address: string): void,
  onValueChange(newValue: string): void,
  onAddClick(): void,
  error: "" | "not-address" | "already-exists"
}

export default function AllowListView({value, onValueChange, onAddClick, allowList, onTrashClick, error}: AllowListViewProps) {
  return <NetworkTabContainer>
    <div className="d-flex flex-column my-4">
      <span>
        <Translation ns="custom-network" label="steps.permissions.allow-list.title" />
      </span>
      <p className="mt-2 text-gray-200">
        <Translation ns="custom-network" label="steps.permissions.allow-list.description" />
      </p>
      <PermissionInput error={<Translation ns="custom-network" label={`steps.permissions.allow-list.error.${error}`} />}
                       hint={<Translation ns="custom-network" label="steps.permissions.allow-list.hint" />}
                       value={value}
                       onChange={onValueChange}
                       onClickAdd={onAddClick} />
      <If condition={allowList.length > 0}>
        <>
          <div className="d-flex flex-column mt-4">
            <span className="mb-4">
              <Translation ns="custom-network" label="steps.permissions.allow-list.list" />
            </span>
            {allowList.map((address, index) =>
              <PermissionListItem value={address} id={index} onTrashClick={onTrashClick} />)}
          </div>
        </>
      </If>
    </div>
  </NetworkTabContainer>
}