import NetworkTabContainer from "../../tab-container/view";
import Translation from "../../../../translation";
import PermissionInput from "../../../../common/inputs/permission-input/permission-input";
import If from "../../../../If";
import PermissionListItem from "../../../../common/lists/permission-list/permission-list-item";
import {Spinner} from "react-bootstrap";

type AllowListViewProps = {
  allowList: string[],
  value: string,
  isLoading?: boolean,
  onTrashClick(address: string): void,
  onValueChange(newValue: string): void,
  onAddClick(): void,
  error: "" | "not-address" | "already-exists",
}

export default function AllowListView({value, onValueChange, onAddClick, allowList, onTrashClick, error, isLoading}: AllowListViewProps) {

  return <NetworkTabContainer>
    <div className="d-flex flex-column my-4">
      <span>
        <Translation ns="custom-network" label="steps.permissions.allow-list.title" />
      </span>
      <p className="mt-2 text-gray-200">
        <Translation ns="custom-network" label="steps.permissions.allow-list.description" />
      </p>
      <PermissionInput error={(value && error) && <Translation ns="custom-network" label={`steps.permissions.allow-list.error.${error}`} />}
                       value={value}
                       placeholder="0xYourAllowedAddress"
                       onChange={onValueChange}
                       onClickAdd={onAddClick} />
      <If condition={isLoading}>
        <div className="d-flex flex-column mt-4">
          <div className="col-md-5 col-12 text-center">
            <Spinner animation={"border"} />
          </div>
        </div>
      </If>
      <If condition={allowList?.length > 0 && !isLoading}>
        <>
          <div className="d-flex flex-column mt-4">
            {allowList.map((address, index) =>
              <PermissionListItem value={address} id={index} onTrashClick={onTrashClick} />)}
          </div>
        </>
      </If>
    </div>
  </NetworkTabContainer>
}