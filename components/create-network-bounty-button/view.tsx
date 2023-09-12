import {useTranslation} from "next-i18next";

import PlusIcon from "assets/icons/plus-icon";

import MultiActionButton from "components/common/buttons/multi-action/view";
import If from "components/If";
import InternalLink from "components/internal-link";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import {useSession} from "next-auth/react";
import {CustomSession} from "../../interfaces/custom-session";
import {UserRoleUtils} from "../../server/utils/jwt";

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
  const session = useSession();

  const userCanCreateBounties =
    (session?.data as CustomSession)?.user?.roles
      ? UserRoleUtils.hasCreateBountyRole((session?.data as CustomSession)?.user?.roles)
      : true // if no session roles are found we will let the normal flow deal with an unauthenticated user


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
        <If condition={userCanCreateBounties}>
          <InternalLink
            href={"/create-bounty"}
            icon={<PlusIcon />}
            label={t("main-nav.new-bounty") as string}
            iconBefore
            uppercase
          />
        </If>
      </If>
  </ReadOnlyButtonWrapper>
  );
}