import { useTranslation } from "next-i18next";

import Indicator from "components/indicator";

import { useAppState } from "contexts/app-state";

export default function useOracleToken() {
  const { t } = useTranslation(["common", "profile"]);

  const { state } = useAppState();

  const oracleToken = {
    symbol:
      state.Service?.network?.active?.networkToken?.symbol || t("misc.token"),
    name:
      state.Service?.network?.active?.networkToken?.name ||
      t("profile:oracle-name-placeholder"),
    icon: (
      <Indicator
        bg={state.Service?.network?.active?.colors?.primary}
        size="lg"
      />
    ),
  };

  return {
    currentOracleToken: oracleToken,
    name: oracleToken.name,
    symbol: oracleToken.symbol,
    icon: oracleToken.icon
  };
}
