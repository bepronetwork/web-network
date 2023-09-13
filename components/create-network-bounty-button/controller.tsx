import {useSession} from "next-auth/react";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import CreateNetworkBountyButtonView from "components/create-network-bounty-button/view";

import {CustomSession} from "../../interfaces/custom-session";
import {UserRoleUtils} from "../../server/utils/jwt";

interface CreateNetworkBountyButtonProps {
  actionCallBack?: () => void;
  networkId: number,
}

export default function CreateNetworkBountyButton({
  actionCallBack,
  networkId,
}: CreateNetworkBountyButtonProps) {
  const { t } = useTranslation("common");
  const { pathname, push } = useRouter();

  const isOnNetwork = pathname?.includes("[network]");

  const session = useSession();

  const userCanCreateBounties =
    (session?.data as CustomSession)?.user?.roles
      ? UserRoleUtils.hasCreateBountyRole((session?.data as CustomSession)?.user?.roles, networkId)
      : true // if no session roles are found we will let the normal flow deal with an unauthenticated user

  function onClick(url) {
    return () => {
      push(url);
      actionCallBack?.();
    }
  }

  const actions = [
    { label: t("misc.bounty"), onClick: onClick("/create-bounty") },
    { label: t("misc.network"), onClick: onClick("/new-network") },
  ];

  return <CreateNetworkBountyButtonView
    userCanCreateBounties={isOnNetwork ? userCanCreateBounties : true}
    isOnNetwork={isOnNetwork}
    actions={actions}
  />;
}