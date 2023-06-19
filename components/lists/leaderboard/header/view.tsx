import { useTranslation } from "next-i18next";

export default function LeaderBoardListHeader() {
  const { t } = useTranslation("leaderboard");

  const columns = [
    t("table.address"),
    t("table.github-handle"),
    t("table.nfts"),
    t("table.actions"),
  ];

  function renderListBarColumn(label, key: number) {
    return (
      <div
        key={`${key}-${label}`}
        className="col d-flex flex-row justify-content-center align-items-center text-gray"
      >
        <span className="caption-medium mr-1">{label}</span>
      </div>
    );
  }

  return (
    <div className="row pb-0 pt-2 mx-0 mb-2 svg-with-text-color">
      {columns.map(renderListBarColumn)}
    </div>
  );
}
