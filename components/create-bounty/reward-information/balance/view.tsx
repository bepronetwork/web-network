import { useTranslation } from "next-i18next";

export default function RewardInformationBalanceView({
  amount,
  symbol,
}: {
  amount: string;
  symbol: string;
}) {
  const { t } = useTranslation(["common", "bounty"]);

  return (
    <div className="text-truncate">
      <span className="text-gray">{t("bounty:balance")}</span> {amount}{" "}
      {symbol || t("common:misc.token")}
    </div>
  );
}
