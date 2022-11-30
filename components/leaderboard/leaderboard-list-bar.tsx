import { useTranslation } from "next-i18next";

export default function LeaderBoardListBar() {
  const { t } = useTranslation("leaderboard");

  const columns = [
    {
      label: t("table.address"),
      column: 3,
    },
    {
      label: t("table.github-handle"),
      column: 3,
    },
    {
      label: t("table.nfts"),
      column: 3,
    },
    {
      label: t("table.actions"),
      column: 3,
    },
  ];

  function renderListBarColumn({ label, column }: { label: string; column: number },
                               key: number) {
    return (
      <div
        key={`${key}-${label}`}
        className={`col-${column} d-flex flex-row justify-content-center cursor-pointer align-items-center 
        text-light-gray text-gray-hover`}
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
