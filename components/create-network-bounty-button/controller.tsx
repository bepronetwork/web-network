import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import CreateNetworkBountyButtonView from "components/create-network-bounty-button/view";

interface CreateNetworkBountyButtonProps {
  actionCallBack?: () => void;
}

export default function CreateNetworkBountyButton({
  actionCallBack,
}: CreateNetworkBountyButtonProps) {
  const { t } = useTranslation("common");
  const { pathname, push } = useRouter();

  const isOnNetwork = pathname?.includes("[network]");

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
    isOnNetwork={isOnNetwork}
    actions={actions}
  />;
}