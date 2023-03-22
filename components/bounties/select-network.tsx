import { useTranslation } from "next-i18next";

import ReactSelect from "components/react-select";

export default function SelectNetwork() {
  const { t } = useTranslation("common");

  return(
    <div className="d-flex align-items-center">
      <span className="caption text-gray-500 text-nowrap mr-1 font-weight-normal">
        {t("misc.network")}
      </span>

      <ReactSelect
        placeholder="Select a network"
      />
    </div>
  );
}