import { ReactNode } from "react";

import { useTranslation } from "next-i18next";

export default function SelectNetwork({children}: { children?: ReactNode}) {
  const { t } = useTranslation(["bounty"]);
  return (
    <div className="mt-2">
      <h5>{t("steps.select-network")}</h5>
      <p className="text-gray-200">
      {t("descriptions.select-network")}
      </p>
      <div className="col-md-6">
        {children}
      </div>  
    </div>
  );
}
