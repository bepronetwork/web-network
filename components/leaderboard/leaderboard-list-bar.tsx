import { useTranslation } from "next-i18next";

export default function LeaderBoardListBar() {
  const { t } = useTranslation("council");

  const columns = [
    {
      label: "Address",
      column: 3,
    },
    {
      label: "GithubHandle",
      column: 3,
    },
    {
      label: "NFTS",
      column: 3,
    },
    {
      label: "Actions",
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
