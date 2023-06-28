import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import ChainBadge from "components/chain-badge";
import ResponsiveListItem from "components/common/responsive-list-item/view";
import NetworkLogo from "components/network-logo";
import PullRequestLabels from "components/pull-request/labels/controller";

import { useAppState } from "contexts/app-state";

import { formatNumberToNScale } from "helpers/formatNumber";

import { Network } from "interfaces/network";

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
  const columns = [
    {
      label: t("label", { count: totalBounties }),
      secondaryLabel: formatNumberToNScale(totalBounties, 0),
      breakpoints: { xs: false, md: true },
      
    },
    {
      label: `${t("status.open")} ${t("label", { count: openBounties })}`,
      secondaryLabel: formatNumberToNScale(openBounties || 0, 0),
      breakpoints: { xs: false, md: true },
      
    },
    {
      label: t("common:tokens-locked"),
      secondaryLabel: formatNumberToNScale(BigNumber(network?.tokensLocked || 0).toFixed()),
      breakpoints: { xs: false, lg: true },
      currency: network?.networkToken?.symbol || tokenSymbolDefault,
      
    },
  ];

  function onClick() {
    const chainName = findSupportedChain({ chainId: +network?.chain_id})?.chainShortName?.toLowerCase();

    handleRedirect(network?.name, chainName);
  }

  return (
    <ResponsiveListItem
      onClick={onClick}
      icon={
        <NetworkLogo
          src={`${settings?.urls?.ipfs}/${network?.logoIcon}`}
          alt={`${network?.name} logo`}
          isBepro={network?.name.toLowerCase() === 'bepro'}
          noBg
        />
      }
      label={network?.name}
      secondaryLabel={network?.isClosed ? <PullRequestLabels label="closed" /> : null}
      thirdLabel={
        <ChainBadge chain={network?.chain} transparent />
      }
      columns={columns}
    />
  );
}
