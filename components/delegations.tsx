import BigNumber from "bignumber.js";
import clsx from "clsx";
import {useTranslation} from "next-i18next";

import DelegationItem from "components/delegation-item";
import Indicator from "components/indicator";
import InfoTooltip from "components/info-tooltip";
import {FlexRow} from "components/profile/wallet-balance";

import {useAppState} from "contexts/app-state";

import {formatStringToCurrency} from "helpers/formatNumber";

interface DelegationsProps {
  type?: "toMe" | "toOthers";
}

export default function Delegations({
  type = "toMe"
} : DelegationsProps) {
  const { t } = useTranslation(["common", "profile", "my-oracles"]);

  const {state} = useAppState();
  const walletDelegations = state.currentUser?.balance?.oracles?.delegations || [];

  const votesSymbol = t("token-votes", { token: state.Service?.network?.active?.networkToken.symbol })

  const renderInfo = {
    toMe: {
      title: t("profile:deletaged-to-me"),
      description:
        t("my-oracles:descriptions.oracles-delegated-to-me", {
          token: state.Service?.network?.active?.networkToken?.symbol
        }),
      total: undefined,
      delegations: [ state.currentUser?.balance?.oracles?.delegatedByOthers || 0 ]
    },
    toOthers: {
      title: t("profile:deletaged-to-others"),
      total: formatStringToCurrency(walletDelegations.reduce((acc, delegation) =>
        delegation.amount.plus(acc), BigNumber(0)).toFixed()),
      description:
             t("my-oracles:descriptions.oracles-delegated-to-others", {
              token: state.Service?.network?.active?.networkToken?.symbol
             }),
      delegations: state.currentUser?.balance?.oracles?.delegations || []
    }
  };

  const oracleToken = {
    symbol: state.Service?.network?.active?.networkToken?.symbol || t("misc.token"),
    name: state.Service?.network?.active?.networkToken?.name || t("profile:oracle-name-placeholder"),
    icon: <Indicator bg={state.Service?.network?.active?.colors?.primary} size="lg" />
  };

  const networkTokenName = state.Service?.network?.active?.networkToken?.name || oracleToken.name;

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

          <span className="text-primary">
            {votesSymbol}
          </span>

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
              />)
          }
        </div>
      </div>
    </div>
  );
}
