import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import OracleIcon from "assets/icons/oracle-icon";

import DelegationItem from "components/delegation-item";

import {formatStringToCurrency} from "helpers/formatNumber";

import {useAppState} from "../contexts/app-state";
import InfoTooltip from "./info-tooltip";
import {FlexRow} from "./profile/wallet-balance";

interface DelegationsProps {
  type?: "toMe" | "toOthers";
}

export default function Delegations({
  type = "toMe"
} : DelegationsProps) {
  const { t } = useTranslation(["common", "profile", "my-oracles"]);

  const {state} = useAppState();
  const walletDelegations = state.currentUser?.balance?.oracles?.delegations || [];

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
    symbol: t("$oracles", { token: state.Service?.network?.active?.networkToken?.symbol }),
    name: t("profile:oracle-name-placeholder"),
    icon: <OracleIcon />
  };

  const networkTokenName = state.Service?.network?.active?.networkToken?.name || oracleToken.name;

  return (
    <div className="mb-3">
      <FlexRow className="mb-3 justify-content-between align-items-center">
        <span className="h4 family-Regular text-white font-weight-medium">
          <span className="mr-1">{renderInfo[type].title}</span>
          <InfoTooltip
            description={renderInfo[type].description}
            secondaryIcon
          />
        </span>

        { renderInfo[type].total !== undefined && 
          <FlexRow className="align-items-center">
            <span className="caption-large text-white mr-2 font-weight-medium">{t("misc.total")}</span>
            <span className="caption-large text-white bg-dark-gray py-2 px-3 rounded-3 font-weight-medium">
              {formatStringToCurrency(renderInfo[type].total)}
            </span>
          </FlexRow>
        }
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
