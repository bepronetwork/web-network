import {useTranslation} from "next-i18next";

import {Divider} from "../../../../divider";

import NetworkTabContainer from "../../tab-container/view";
import PermissionInput from "../../../../common/inputs/permission-input/permission-input";
import PermissionListItem from "../../../../common/lists/permission-list/permission-list-item";

interface NetworkPermissionsViewProps {
  domain: string;
  domains: string[];
  onChangeDomain: (v: string) => void;
  handleAddDomain: () => void;
  handleRemoveDomain: (v: string) => void;
}

export default function NetworkPermissionsView({
  domain,
  domains,
  onChangeDomain,
  handleAddDomain,
  handleRemoveDomain,
}: NetworkPermissionsViewProps) {
  const { t } = useTranslation(["custom-network"]);
  
  return (
    <NetworkTabContainer>
      <div className="d-flex flex-column my-4">
        <span>{t("steps.permissions.domains.title")}</span>
        <p className="mt-2 text-gray-200">
            {t("steps.permissions.domains.description")}
        </p>
        <PermissionInput
          value={domain}
          onChange={onChangeDomain}
          onClickAdd={handleAddDomain}
          placeholder={t("steps.permissions.domains.placeholder")}
          disabledButton={!domain}
        />
        {domains?.length > 0 ? (
          <div className="d-flex flex-column mt-4">
            <span className="mb-4">{t("steps.permissions.domains.list")}</span>
            {domains.map((value, key) => (
              <PermissionListItem
                value={value}
                id={key}
                onTrashClick={handleRemoveDomain}
              />
            ))}
          </div>
        ) : null}
      </div>
      <Divider bg="gray-800" />
    </NetworkTabContainer>
  );
}
