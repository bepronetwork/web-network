import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import NetworkParameterInput from "components/custom-network/network-parameter-input";

import {useAppState} from "contexts/app-state";
import {useNetworkSettings} from "contexts/network-settings";

import { SMALL_TOKEN_SYMBOL_LENGTH } from "helpers/constants";
import {formatNumberToCurrency, formatNumberToNScale} from "helpers/formatNumber";
import { NETWORK_LIMITS } from "helpers/network";

export default function NetworkContractSettings() {
  const { t } = useTranslation(["common", "custom-network"]);

  const { state } = useAppState();
  const { fields, settings } = useNetworkSettings();

  const onChange = (label) => (value) => fields.parameter.setter({label, value});

  const networkTokenSymbol = state.Service?.network?.active?.networkToken?.symbol || t("misc.$token");
  const totalNetworkToken = BigNumber(state.Service?.network?.amounts?.totalNetworkToken);

  const formatOptions = { maximumFractionDigits: 0 };

  const parameterInputs = [
    { 
      label: t("custom-network:dispute-time"), 
      description: t("custom-network:errors.dispute-time", {
        min: NETWORK_LIMITS.disputableTime.min,
        max: formatNumberToCurrency(NETWORK_LIMITS.disputableTime.max, formatOptions)
      }),
      symbol: t("misc.seconds"), 
      value: settings?.parameters?.disputableTime?.value,
      error: settings?.parameters?.disputableTime?.validated === false,
      decimals: 0,
      onChange: onChange("disputableTime")
    },
    { 
      label: t("custom-network:percentage-for-dispute"), 
      description: t("custom-network:errors.percentage-for-dispute", NETWORK_LIMITS.percentageNeededForDispute),
      symbol: "%", 
      value: settings?.parameters?.percentageNeededForDispute?.value,
      error: settings?.parameters?.percentageNeededForDispute?.validated === false,
      onChange: onChange("percentageNeededForDispute")
    },
    { 
      label: t("custom-network:redeem-time"), 
      description: t("custom-network:errors.redeem-time", {
        min: NETWORK_LIMITS.draftTime.min,
        max: formatNumberToCurrency(NETWORK_LIMITS.draftTime.max, formatOptions)
      }),
      symbol: t("misc.seconds"), 
      value: settings?.parameters?.draftTime?.value,
      error: settings?.parameters?.draftTime?.validated === false,
      decimals: 0,
      onChange: onChange("draftTime")
    },
    { 
      label: t("custom-network:council-amount"), 
      description: t("custom-network:errors.council-amount", {
        token: networkTokenSymbol,
        min: formatNumberToCurrency(NETWORK_LIMITS.councilAmount.min, formatOptions),
        max: formatNumberToCurrency(NETWORK_LIMITS.councilAmount.max, formatOptions)
      }),
      symbol: networkTokenSymbol || "Token", 
      value: settings?.parameters?.councilAmount?.value,
      error: settings?.parameters?.councilAmount?.validated === false,
      onChange: onChange("councilAmount")
    },
    { 
      label: t("custom-network:cancelable-time.label"), 
      description: t("custom-network:cancelable-time.description", {
        min: formatNumberToCurrency(NETWORK_LIMITS.cancelableTime.min, formatOptions)
      }),
      symbol: t("misc.seconds"), 
      value: settings?.parameters?.cancelableTime?.value,
      error: settings?.parameters?.cancelableTime?.validated === false,
      decimals: 0,
      onChange: onChange("cancelableTime")
    },
    { 
      label: t("custom-network:oracle-exchange-rate.label"), 
      description: t("custom-network:oracle-exchange-rate.description", NETWORK_LIMITS.oracleExchangeRate),
      symbol: "", 
      value: settings?.parameters?.oracleExchangeRate?.value,
      error: settings?.parameters?.oracleExchangeRate?.validated === false,
      decimals: 0,
      onChange: onChange("oracleExchangeRate"),
      disabled: totalNetworkToken.gt(0),
      helperText: totalNetworkToken.gt(0) ? t("custom-network:oracle-exchange-rate.unable-to-change", {
        amount: formatNumberToNScale(totalNetworkToken.toFixed()),
        symbol:
          networkTokenSymbol?.length > SMALL_TOKEN_SYMBOL_LENGTH
            ? `${networkTokenSymbol.slice(0, SMALL_TOKEN_SYMBOL_LENGTH)}...`
            : networkTokenSymbol,
      }) : ""
    },
    { 
      label: t("custom-network:merger-fee.label"), 
      description: t("custom-network:merger-fee.description", NETWORK_LIMITS.mergeCreatorFeeShare),
      symbol: "%", 
      value: settings?.parameters?.mergeCreatorFeeShare?.value,
      error: settings?.parameters?.mergeCreatorFeeShare?.validated === false,
      decimals: 4,
      onChange: onChange("mergeCreatorFeeShare")
    },
    { 
      label: t("custom-network:proposer-fee.label"), 
      description: t("custom-network:proposer-fee.description", NETWORK_LIMITS.proposerFeeShare),
      symbol: "%", 
      value: settings?.parameters?.proposerFeeShare?.value,
      error: settings?.parameters?.proposerFeeShare?.validated === false,
      decimals: 4,
      onChange: onChange("proposerFeeShare")
    }
  ];
  
  return (
    <div className="row mt-2 gy-3">
      { parameterInputs.map(input => <NetworkParameterInput  key={input.label} {...input} />) }
    </div>
  );
}
