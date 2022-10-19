import { useContext, useEffect } from "react";

import { useTranslation } from "next-i18next";

import Indicator from "components/indicator";

import { ApplicationContext } from "contexts/application";
import { useDAO } from "contexts/dao";
import { changeNetwork } from "contexts/reducers/change-network";
import { changeNetworkId } from "contexts/reducers/change-network-id";
import { useSettings } from "contexts/settings";

import { NetworkColors } from "interfaces/enums/network-colors";

export default function NetworkIdentifier() {
  const {
    state: { network },
    dispatch
  } = useContext(ApplicationContext);
  const { t } = useTranslation("common");

  const { settings } = useSettings();
  const { service: DAOService } = useDAO();

  function updateNetwork() {
    if (!DAOService) return;

    const chainId = window?.ethereum?.chainId;
    
    dispatch(changeNetworkId(+chainId));
    dispatch(changeNetwork((settings?.chainIds && settings?.chainIds[+chainId] || t("misc.unkown"))?.toLowerCase()));
  }

  useEffect(updateNetwork, [DAOService]);

  return (
    (network && (
      <div className="ml-2 bg-transparent p-0 d-flex flex-row align-items-center justify-content-center">
        <Indicator bg={NetworkColors[network] || "gray"} />
        <span className="caption-small text-white-50 ">
          {network}
        </span>
      </div>
    )) || <></>
  );
}
