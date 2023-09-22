import {useTranslation} from "next-i18next";

import PlusIcon from "assets/icons/plus-icon";

import MultiActionButton from "components/common/buttons/multi-action/view";
import If from "components/If";
import InternalLink from "components/internal-link";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";

interface Action {
  label: string;
  onClick: () => void;
}

interface CreateNetworkBountyButtonViewProps {
  isOnNetwork: boolean;
  actions: Action[];
}

export default function CreateNetworkBountyButtonView({
  isOnNetwork,
  actions
}: CreateNetworkBountyButtonViewProps) {
  const { t } = useTranslation("common");

  return(
    <ReadOnlyButtonWrapper>
      <If 
        condition={isOnNetwork}
        otherwise={
          <MultiActionButton
            label={t("misc.create")}
            className="read-only-button w-100"
            icon={<PlusIcon />}
            actions={actions}
          />
        }
      >
        <InternalLink
          href={"/create-bounty"}
          icon={<PlusIcon />}
          label={t("main-nav.new-bounty") as string}
          iconBefore
          uppercase
        />
      </If>
  </ReadOnlyButtonWrapper>
  );
}