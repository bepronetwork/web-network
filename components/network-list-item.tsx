import NetworkLogo from "components/network-logo";
import PullRequestLabels from "components/pull-request-labels";

import {formatNumberToNScale} from "helpers/formatNumber";

import {Network} from "interfaces/network";

import {useAppState} from "../contexts/app-state";

interface NetworkListItemProps {
  network: Network;
  tokenSymbolDefault: string;
  handleRedirect: (networkName: string) => void;
}

export default function NetworkListItem({
                                          network,
                                          tokenSymbolDefault,
  handleRedirect
}: NetworkListItemProps) {
  const {state: {Settings: settings}} = useAppState();

  const Spinner = () => <span className="spinner-border spinner-border-xs ml-1" />;
  const isNotUndefined = value => value !== undefined;

  function onClick() {
    handleRedirect(network?.name);
  }

  return (
    <div className="list-item p-20 d-flex flex-row" onClick={onClick}>
      <div className="col-3">
        <div className="d-flex flex-row align-items-center gap-20">
          <NetworkLogo
            src={`${settings?.urls?.ipfs}/${network?.logoIcon}`}
            alt={`${network?.name} logo`}
            isBepro={network?.name.toLowerCase() === 'bepro'}
          />

          <span className="caption-medium text-white">{network?.name}</span>

          {(network?.isClosed && <PullRequestLabels label="closed" />) || ""}
        </div>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-center">
        <span className="caption-medium text-white">
          {isNotUndefined(network?.countIssues) ? formatNumberToNScale(network?.countIssues, 0) : <Spinner />}
        </span>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-center">
        <span className="caption-medium text-white">
          {isNotUndefined(network?.countOpenIssues) ? formatNumberToNScale(network?.countOpenIssues, 0) : <Spinner />}
        </span>
      </div>

      <div className="col-3 d-flex flex-row align-items-center justify-content-center gap-20">
        <span className="caption-medium text-white ml-3">
        {isNotUndefined(network?.totalValueLock) ? (
            formatNumberToNScale(network?.totalValueLock.toFixed())
          ) : (
            <Spinner />
          )}
        </span>

        <span
          className="caption-medium mr-2 text-blue"
        >
          {network?.networkToken?.symbol || tokenSymbolDefault}
        </span>
      </div>
    </div>
  );
}
