import { useTranslation } from "next-i18next";

export default function CuratorListBar() {
  const { t } = useTranslation("council");

  const columns = [
    {
      label: t("council-table.address"),
      column: 2,
    },
    {
      label: t("council-table.closed-proposals"),
      column: 2,
    },
    {
      label: t("council-table.disputed-proposals"),
      column: 2,
    },
    {
      label: t("council-table.disputes"),
      column: 2,
    },
    {
      label: t("council-table.total-votes"),
      column: 2,
    },
    {
      label: t("council-table.actions"),
      column: 2,
    },
  ];

  function renderListBarColumn({label, column}: {label: string, column: number}, key: number) {
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
