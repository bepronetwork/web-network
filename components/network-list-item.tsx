import getConfig from "next/config";

import NetworkLogo from "components/network-logo";
import PullRequestLabels from "components/pull-request-labels";

import { formatNumberToNScale } from "helpers/formatNumber";

import { Network } from "interfaces/network";

const { publicRuntimeConfig } = getConfig();
interface NetworkListItemProps {
  network: Network;
  tokenSymbolDefault: string;
  handleRedirect: () => void;
}

export default function NetworkListItem({
  network,
  tokenSymbolDefault,
  handleRedirect
}: NetworkListItemProps) {

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
          {formatNumberToNScale(network?.totalBounties)}
        </span>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-center">
        <span className="caption-medium text-white">
          {formatNumberToNScale(network?.openBounties)}
        </span>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-center gap-20">
        <span className="caption-medium text-white ml-3">
          {formatNumberToNScale(network?.tokensLocked)}
        </span>

        <span
          className="caption-medium mr-2 text-blue"
        >
          ${network?.networkToken?.symbol || tokenSymbolDefault}
        </span>
      </div>
    </div>
  );
}
