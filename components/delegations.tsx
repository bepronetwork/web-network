import BigNumber from "bignumber.js";
import clsx from "clsx";
import {useTranslation} from "next-i18next";

import DelegationItem from "components/delegation-item";
import Indicator from "components/indicator";
import InfoTooltip from "components/info-tooltip";
import {FlexRow} from "components/profile/wallet-balance";

import {useAppState} from "contexts/app-state";

import {formatStringToCurrency} from "helpers/formatNumber";

import { Delegation } from "interfaces/curators";
import { DelegationExtended } from "interfaces/oracles-state";

import TokenSymbolView from "./common/token-symbol/view";

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
  tokenColor
} : DelegationsProps) {
  const { t } = useTranslation(["common", "profile", "my-oracles"]);

  const {state} = useAppState();

  const walletDelegations =
    (delegations || state.currentUser?.balance?.oracles?.delegations || []) as JoinedDelegation[];
  const totalAmountDelegations =
    walletDelegations.reduce((acc, delegation) => BigNumber(delegation.amount).plus(acc), BigNumber(0)).toFixed();

  const votesSymbol = t("token-votes", { token: state.Service?.network?.active?.networkToken.symbol })

  const renderInfo = {
    toMe: {
      title: t("profile:deletaged-to-me"),
      description:
        t("my-oracles:descriptions.oracles-delegated-to-me", {
          token: state.Service?.network?.active?.networkToken?.symbol
        }),
      total: undefined,
      delegations: walletDelegations || [ state.currentUser?.balance?.oracles?.delegatedByOthers || 0 ]
    },
    toOthers: {
      title: t("profile:deletaged-to-others"),
      total: formatStringToCurrency(totalAmountDelegations),
      description:
             t("my-oracles:descriptions.oracles-delegated-to-others", {
              token: state.Service?.network?.active?.networkToken?.symbol
             }),
      delegations: walletDelegations || state.currentUser?.balance?.oracles?.delegations || []
    }
  };

  const oracleToken = {
    symbol: state.Service?.network?.active?.networkToken?.symbol || t("misc.token"),
    name: state.Service?.network?.active?.networkToken?.name || t("profile:oracle-name-placeholder"),
    icon: <Indicator bg={tokenColor || state.Service?.network?.active?.colors?.primary} size="lg" />
  };

  const networkTokenName = state.Service?.network?.active?.networkToken?.name || oracleToken.name;

  function getTextColorProps() {
    if (tokenColor)
      return {
        style: {
          color: tokenColor
        }
      };

    return {
      className: "text-primary"
    };
  }

  return (
    <div className="mb-3">
      <FlexRow className="mb-3 justify-content-between align-items-center">
        <span className="h4 family-Regular text-white font-weight-500">
        {renderInfo[type].title}
        </span>

        <FlexRow className={clsx([
          "d-flex justify-content-center align-items-center gap-2 caption-large",
          "text-white bg-gray-900 py-2 px-3 border-radius-4 border border-gray-800 font-weight-medium"
        ])}>
          <span>
            {formatStringToCurrency(renderInfo[type].total)}
          </span>

          <TokenSymbolView name={votesSymbol} {...getTextColorProps()} />

          <InfoTooltip
            description={renderInfo[type].description}
            secondaryIcon
          />
        </FlexRow>
      </FlexRow>

      <div className="row">
        <div className="col">
          { (type === "toOthers" && !renderInfo[type].delegations?.length) && t("my-oracles:errors.no-delegates") }

          { (type === "toMe" || !!renderInfo[type].delegations?.length) &&
            renderInfo[type].delegations.map(delegation =>
              <DelegationItem
                key={`delegation-${delegation.id}-${delegation.to}`}
                type={type}
                delegation={type === "toMe" ? {amount: delegation} : delegation}
                tokenName={networkTokenName}
                variant={variant}
                tokenColor={tokenColor}
              />)
          }
        </div>
      </div>
    </div>
  );
}
