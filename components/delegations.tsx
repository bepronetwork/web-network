import { useEffect } from "react";

import { useTranslation } from "next-i18next";

import OracleIcon from "assets/icons/oracle-icon";

import DelegationItem from "components/delegation-item";

import { useAuthentication } from "contexts/authentication";
import { useNetwork } from "contexts/network";

import { formatNumberToCurrency } from "helpers/formatNumber";

import InfoTooltip from "./info-tooltip";
import { FlexRow } from "./profile/wallet-balance";

interface DelegationsProps {
  type?: "toMe" | "toOthers";
}

export default function Delegations({
  type = "toMe"
} : DelegationsProps) {
  const { t } = useTranslation(["common", "profile", "my-oracles"]);

  const { activeNetwork } = useNetwork();
  const { wallet, updateWalletBalance } = useAuthentication();

  const renderInfo = {
    toMe: {
      title: t("profile:deletaged-to-me"),
      description: t("my-oracles:descriptions.oracles-delegated-to-me"),
      total: undefined,
      delegations: [ wallet?.balance?.oracles?.delegatedByOthers || 0 ]
    },
    toOthers: {
      title: t("profile:deletaged-to-others"),
      description: t("my-oracles:descriptions.oracles-delegated-to-others"),
      total: wallet?.balance?.oracles?.delegations?.reduce((acc, delegation) => acc + delegation.amount, 0),
      delegations: wallet?.balance?.oracles?.delegations || []
    }
  };

  const oracleToken = {
    symbol: t("$oracles"),
    name: t("profile:oracle-name-placeholder"),
    icon: <OracleIcon />
  };

  const networkTokenName = activeNetwork?.networkToken?.name || oracleToken.name;

  useEffect(() => {
    if (!wallet?.address) return;
    updateWalletBalance();
  }, [wallet?.address]);

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
              {formatNumberToCurrency(renderInfo[type].total)}
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
                type={type}
                delegation={delegation} 
                tokenName={networkTokenName}
              />)
          }
        </div>
      </div>
    </div>
  );
}
