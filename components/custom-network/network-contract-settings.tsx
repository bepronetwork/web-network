import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import InputNumber from "components/input-number";

import { useNetwork } from "contexts/network";
import { useNetworkSettings } from "contexts/network-settings";

import { formatNumberToCurrency } from "helpers/formatNumber";

const { publicRuntimeConfig } = getConfig();

const MAX_PERCENTAGE_FOR_DISPUTE = +publicRuntimeConfig?.networkConfig?.disputesPercentage;
const MIN_DRAFT_TIME = +publicRuntimeConfig?.networkConfig?.reedemTime?.min;
const MAX_DRAFT_TIME = +publicRuntimeConfig?.networkConfig?.reedemTime?.max;
const MIN_DISPUTE_TIME = +publicRuntimeConfig?.networkConfig?.disputableTime?.min;
const MAX_DISPUTE_TIME = +publicRuntimeConfig?.networkConfig?.disputableTime?.max;
const MIN_COUNCIL_AMOUNT = +publicRuntimeConfig?.networkConfig?.councilAmount?.min;
const MAX_COUNCIL_AMOUNT = +publicRuntimeConfig?.networkConfig?.councilAmount?.max;

export default function NetworkContractSettings() {
  const { t } = useTranslation(["common", "custom-network"]);
  const { fields, settings } = useNetworkSettings();
  const { activeNetwork } = useNetwork()
  
  const handleDraftTimeChange = ({ floatValue: value }) => fields.parameter.setter({ label: "draftTime", value });
  const handleDisputeTimeChange = 
    ({ floatValue: value }) => fields.parameter.setter({ label: "disputableTime", value });
  const handleCouncilAmountChange = 
    ({ floatValue: value }) => fields.parameter.setter({ label: "councilAmount", value });
  const handlePercentageForDisputeChange = 
    ({ floatValue: value }) => fields.parameter.setter({ label: "percentageNeededForDispute", value });

  const networkTokenSymbol = activeNetwork?.networkToken?.symbol || t("misc.$token");

  const parameterInputs = [
    { 
      label: t("custom-network:dispute-time"), 
      description: t("custom-network:errors.dispute-time", {
        min: MIN_DISPUTE_TIME,
        max: formatNumberToCurrency(MAX_DISPUTE_TIME, 0)
      }),
      symbol: t("misc.seconds"), 
      value: settings?.parameters?.disputableTime?.value,
      error: settings?.parameters?.disputableTime?.validated === false,
      onChange: handleDisputeTimeChange
    },
    { 
      label: t("custom-network:percentage-for-dispute"), 
      description: t("custom-network:errors.percentage-for-dispute", {
        max: MAX_PERCENTAGE_FOR_DISPUTE 
      }),
      symbol: "%", 
      value: settings?.parameters?.percentageNeededForDispute?.value,
      error: settings?.parameters?.percentageNeededForDispute?.validated === false,
      onChange: handlePercentageForDisputeChange
    },
    { 
      label: t("custom-network:redeem-time"), 
      description: t("custom-network:errors.redeem-time", {
        min: MIN_DRAFT_TIME,
        max: formatNumberToCurrency(MAX_DRAFT_TIME, 0)
      }),
      symbol: t("misc.seconds"), 
      value: settings?.parameters?.draftTime?.value,
      error: settings?.parameters?.draftTime?.validated === false,
      onChange: handleDraftTimeChange
    },
    { 
      label: t("custom-network:council-amount"), 
      description: t("custom-network:errors.council-amount", {
        token: networkTokenSymbol,
        min: formatNumberToCurrency(MIN_COUNCIL_AMOUNT, 0),
        max: formatNumberToCurrency(MAX_COUNCIL_AMOUNT, 0)
      }),
      symbol: "BEPRO", 
      value: settings?.parameters?.councilAmount?.value,
      error: settings?.parameters?.councilAmount?.validated === false,
      onChange: handleCouncilAmountChange
    }
  ];
  
  return (
    <>
      <div className="d-flex flex-row px-3 border-radius-8 justify-content-center gap-20 mb-2">
      {
        parameterInputs.map(({ label, description, symbol, value, error, onChange }) => 
        <div className="form-group col">
            <InputNumber
              classSymbol={"text-primary"}
              symbol={symbol}
              value={value}
              label={label}
              description={description}
              min={0}
              placeholder={"0"}
              onValueChange={onChange}
              error={error}
              thousandSeparator
            />
        </div>)
        }
      </div>
    </>
  );
}
