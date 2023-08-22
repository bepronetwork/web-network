import { useTranslation } from "next-i18next";

import EyeIcon from "assets/icons/eye-icon";
import EyeSlashIcon from "assets/icons/eye-slash-icon";

import CustomDropdown from "components/common/custom-dropdown/view";

interface CommentSettingsViewProps {
  onHideClick: () => void;
  isGovernor: boolean;
  hidden: boolean;
}

export default function CommentSettingsView({
  onHideClick,
  isGovernor,
  hidden,
}: CommentSettingsViewProps) {
  const { t } = useTranslation(["common", "pull-request", "bounty"]);

  const items = [
    {
      ...(isGovernor
        ? {
            content: (
              <div className="cursor-pointer">
                {hidden ? <EyeIcon /> : <EyeSlashIcon />}{" "}
                {t("common:actions.hide")}
              </div>
            ),
            onClick: onHideClick,
        }
        : null),
    },
  ];

  return (
    <CustomDropdown
      btnContent={<div className="p-settings">. . .</div>}
      items={items}
      withoutArrow={true}
      bg="light"
      className="settings-dropdown"
    />
  );
}
