import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import { useAppState } from "contexts/app-state";

import { formatStringToCurrency } from "helpers/formatNumber";

import { Delegation } from "interfaces/curators";
import { DelegationExtended } from "interfaces/oracles-state";

import DelegationsView from "./view";

interface DelegationsProps {
  type?: "toMe" | "toOthers";
  delegations?: Delegation[];
  variant?: "network" | "multi-network";
  tokenColor?: string;
}

type JoinedDelegation = Delegation | DelegationExtended;

export default function Delegations({
  type = "toMe",
  delegations,
  variant = "network",
  tokenColor,
}: DelegationsProps) {
  const { t } = useTranslation(["common", "profile", "my-oracles"]);

  const { state } = useAppState();

  const walletDelegations = (delegations ||
    state.currentUser?.balance?.oracles?.delegations ||
    []) as JoinedDelegation[];
  const totalAmountDelegations = walletDelegations
    .reduce((acc, delegation) => BigNumber(delegation.amount).plus(acc),
            BigNumber(0))
    .toFixed();

  const votesSymbol = t("token-votes", {
    token: state.Service?.network?.active?.networkToken.symbol,
  });

  const renderInfo = {
    toMe: {
      title: t("profile:deletaged-to-me"),
      description: t("my-oracles:descriptions.oracles-delegated-to-me", {
        token: state.Service?.network?.active?.networkToken?.symbol,
      }),
      total: undefined,
      delegations: walletDelegations || [
        state.currentUser?.balance?.oracles?.delegatedByOthers || 0,
      ],
    },
    toOthers: {
      title: t("profile:deletaged-to-others"),
      total: formatStringToCurrency(totalAmountDelegations),
      description: t("my-oracles:descriptions.oracles-delegated-to-others", {
        token: state.Service?.network?.active?.networkToken?.symbol,
      }),
      delegations:
        walletDelegations ||
        state.currentUser?.balance?.oracles?.delegations ||
        [],
    },
  };

  const networkTokenName =
    state.Service?.network?.active?.networkToken?.name || t("profile:oracle-name-placeholder");

  return (
    <DelegationsView
      type={type}
      variant={variant}
      tokenColor={tokenColor}
      renderInfo={renderInfo}
      votesSymbol={votesSymbol}
      networkTokenName={networkTokenName}
    />
  );
}
