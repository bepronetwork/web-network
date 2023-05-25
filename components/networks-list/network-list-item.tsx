import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import ChainBadge from "components/chain-badge";
import NetworkLogo from "components/network-logo";
import ItemAmount from "components/networks-list/item-amount";
import PullRequestLabels from "components/pull-request-labels";

import {useAppState} from "contexts/app-state";

import {formatNumberToNScale} from "helpers/formatNumber";

import {Network} from "interfaces/network";

import useChain from "x-hooks/use-chain";

interface NetworkListItemProps {
  network: Network;
  tokenSymbolDefault: string;
  handleRedirect: (networkName: string, chainName: string) => void;
}

export default function NetworkListItem({
  network,
  tokenSymbolDefault,
  handleRedirect
}: NetworkListItemProps) {
  const { t } = useTranslation(["bounty", "common"]);

  const { findSupportedChain } = useChain();
  const { state: { Settings: settings } } = useAppState();

  const totalBounties = +(network?.totalIssues || 0);
  const openBounties = +(network?.totalOpenIssues || 0);

  function onClick() {
    const chainName = findSupportedChain({ chainId: +network?.chain_id})?.chainShortName?.toLowerCase();

    handleRedirect(network?.name, chainName);
  }

  return (
    <div 
      className="list-item p-3 row border-radius-8 border border-gray-850 bg-gray-900 cursor-pointer" 
      onClick={onClick}
    >
      <div className="col-sm-12 col-md">
        <div className="row align-items-center">
          <div className="col-auto">
            <NetworkLogo
              src={`${settings?.urls?.ipfs}/${network?.logoIcon}`}
              alt={`${network?.name} logo`}
              isBepro={network?.name.toLowerCase() === 'bepro'}
              noBg
            />
          </div>

          <div className="col-auto px-0">
            <div className="row align-items-center mb-1">
              <div className="col-auto">
                <span className="caption-small font-weight-medium text-white">{network?.name}</span>
              </div>

              {network?.isClosed && 
                <div className="col-auto px-0">
                  <PullRequestLabels label="closed" />
                </div>
              }
            </div>

            <ChainBadge chain={network?.chain} transparent />

            <div className="col-auto d-flex flex-row align-items-center d-md-none mt-1">
              <ItemAmount
                label={t("label", { count: totalBounties })}
                amount={formatNumberToNScale(totalBounties, 0)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="col-xs-12 col-md d-flex flex-row align-items-center d-none d-md-flex">
        <ItemAmount
          label={t("label", { count: totalBounties })}
          amount={formatNumberToNScale(totalBounties, 0)}
        />
      </div>

      <div className="col d-flex flex-row align-items-center d-none d-md-flex">
        <ItemAmount
          label={`${t("status.open")} ${t("label", { count: openBounties })}`}
          amount={formatNumberToNScale(openBounties || 0, 0)}
        />
      </div>

      <div className="col d-flex flex-row align-items-center d-none d-lg-flex">
        <ItemAmount
          label={t("common:tokens-locked")}
          amount={formatNumberToNScale(BigNumber(network?.tokensLocked || 0).toFixed())}
          currency={network?.networkToken?.symbol || tokenSymbolDefault}
        />
      </div>
    </div>
  );
}
