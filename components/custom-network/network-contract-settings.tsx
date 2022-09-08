import { useTranslation } from "next-i18next";

import NetworkParameterInput from "components/custom-network/network-parameter-input";

import { useNetwork } from "contexts/network";
import { useNetworkSettings } from "contexts/network-settings";

import { formatNumberToCurrency } from "helpers/formatNumber";

export default function NetworkContractSettings() {
  const { t } = useTranslation(["common", "custom-network"]);

  const { activeNetwork } = useNetwork()
  const { fields, settings, LIMITS } = useNetworkSettings();
  
  const handleDraftTimeChange = value => fields.parameter.setter({ label: "draftTime", value });
  const handleDisputeTimeChange = 
    value => fields.parameter.setter({ label: "disputableTime", value });
  const handleCouncilAmountChange = 
    value => fields.parameter.setter({ label: "councilAmount", value });
  const handlePercentageForDisputeChange = 
    value => fields.parameter.setter({ label: "percentageNeededForDispute", value });

  const networkTokenSymbol = activeNetwork?.networkToken?.symbol || t("misc.$token");

  const parameterInputs = [
    { 
      label: t("custom-network:dispute-time"), 
      description: t("custom-network:errors.dispute-time", {
        min: LIMITS?.disputableTime?.min,
        max: formatNumberToCurrency(LIMITS?.disputableTime?.max, 0)
      }),
      symbol: t("misc.seconds"), 
      value: settings?.parameters?.disputableTime?.value,
      error: settings?.parameters?.disputableTime?.validated === false,
      decimals: 0,
      onChange: handleDisputeTimeChange
    },
    { 
      label: t("custom-network:percentage-for-dispute"), 
      description: t("custom-network:errors.percentage-for-dispute", {
        max: LIMITS?.percentageNeededForDispute?.max 
      }),
      symbol: "%", 
      value: settings?.parameters?.percentageNeededForDispute?.value,
      error: settings?.parameters?.percentageNeededForDispute?.validated === false,
      onChange: handlePercentageForDisputeChange
    },
    { 
      label: t("custom-network:redeem-time"), 
      description: t("custom-network:errors.redeem-time", {
        min: LIMITS?.draftTime?.min,
        max: formatNumberToCurrency(LIMITS?.draftTime?.max, 0)
      }),
      symbol: t("misc.seconds"), 
      value: settings?.parameters?.draftTime?.value,
      error: settings?.parameters?.draftTime?.validated === false,
      decimals: 0,
      onChange: handleDraftTimeChange
    },
    { 
      label: t("custom-network:council-amount"), 
      description: t("custom-network:errors.council-amount", {
        token: networkTokenSymbol,
        min: formatNumberToCurrency(LIMITS?.councilAmount?.min, 0),
        max: formatNumberToCurrency(LIMITS?.councilAmount?.max, 0)
      }),
      symbol: "BEPRO", 
      value: settings?.parameters?.councilAmount?.value,
      error: settings?.parameters?.councilAmount?.validated === false,
      onChange: handleCouncilAmountChange
    }
  ];
  
  return (
    <div className="d-flex flex-row border-radius-8 justify-content-center gap-20 mt-2">
      { parameterInputs.map(input => <NetworkParameterInput  key={input.label} {...input} />) }
    </div>
  );
}
