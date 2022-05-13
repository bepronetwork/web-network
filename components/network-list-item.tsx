import { useContext, useEffect } from "react";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";
import { useRouter } from "next/router";

import NetworkLogo from "components/network-logo";
import PullRequestLabels from "components/pull-request-labels";

import { ApplicationContext } from "contexts/application";
import { changeNetworksSummary } from "contexts/reducers/change-networks-summary";

import { handleNetworkAddress } from "helpers/custom-network";
import { formatNumberToNScale } from "helpers/formatNumber";

import { INetwork } from "interfaces/network";

import { BeproService } from "services/bepro-service";

import useNetwork from "x-hooks/use-network";
const { publicRuntimeConfig } = getConfig()
interface NetworkListItemProps {
  network: INetwork;
  redirectToHome?: boolean;
  updateNetworkParameter?: (networkName, parameter, value) => void;
}

export default function NetworkListItem({
  network,
  redirectToHome = false,
  updateNetworkParameter,
}: NetworkListItemProps) {
  const router = useRouter();
  const { t } = useTranslation("common");

  const { getURLWithNetwork } = useNetwork();

  const { dispatch } = useContext(ApplicationContext);

  function handleRedirect() {
    const url = redirectToHome ? "/" : "/account/my-network/settings";

    router.push(getURLWithNetwork(url, {
        network: network.name
    }));
  }

  useEffect(() => {
    BeproService.getSettlerTokenData(handleNetworkAddress(network))
      .then(({symbol}) => {
        updateNetworkParameter(network.name, "tokenName", symbol);
      })
      .catch(console.log);

    BeproService.getTotalSettlerLocked(handleNetworkAddress(network))
      .then((amount) => {
        updateNetworkParameter(network.name, "tokensLocked", amount);
      })
      .catch(console.log);

    BeproService.getOpenBounties(handleNetworkAddress(network))
      .then((quantity) => {
        updateNetworkParameter(network.name, "openBounties", quantity);
      })
      .catch(console.log);

    BeproService.getBountiesCount(handleNetworkAddress(network))
      .then((quantity) => {
        updateNetworkParameter(network.name, "totalBounties", quantity);

        dispatch(changeNetworksSummary({
          label: "bounties",
          amount: quantity,
          action: "add"
        }));
      })
      .catch(console.log);
  }, []);

  return (
    <div className="list-item p-20 d-flex flex-row" onClick={handleRedirect}>
      <div className="col-3">
        <div className="d-flex flex-row align-items-center gap-20">
          <NetworkLogo
            src={`${publicRuntimeConfig?.ipfsUrl}/${network?.logoIcon}`}
            alt={`${network?.name} logo`}
            isBepro={network?.name === publicRuntimeConfig?.networkConfig?.networkName}
          />

          <span className="caption-medium text-white">{network?.name}</span>

          {(network?.isClosed && <PullRequestLabels label="closed" />) || ""}
        </div>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-center">
        <span className="caption-medium text-white">
          {network.totalBounties !== undefined
            ? formatNumberToNScale(network.totalBounties)
            : "-"}
        </span>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-center">
        <span className="caption-medium text-white">
          {network.openBounties !== undefined
            ? formatNumberToNScale(network.openBounties)
            : "-"}
        </span>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-center gap-20">
        <span className="caption-medium text-white ml-3">
          {network.tokensLocked !== undefined
            ? formatNumberToNScale(network.tokensLocked)
            : "-"}
        </span>

        <span
          className={`caption-medium mr-2 ${
            network?.name === publicRuntimeConfig?.networkConfig?.networkName ? "text-blue" : ""
          }`}
          style={{ color: `${network?.colors?.primary}` }}
        >
          ${network.tokenName || t("misc.token")}
        </span>
      </div>
    </div>
  );
}
