import { ReactElement } from "react";

import { useTranslation } from "next-i18next";

import ArrowLeft from "assets/icons/arrow-left";
import ArrowUpRight from "assets/icons/arrow-up-right";

export default function PageItemView({
  goToNetwork,
  clearNetwork,
  name,
  children,
}: {
  goToNetwork: () => void;
  clearNetwork: () => void;
  name: string;
  children: ReactElement;
}) {
  const { t } = useTranslation(["profile"]);

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-gray-850">
        <div className="cursor-pointer ms-4 me-3" onClick={clearNetwork}>
          <ArrowLeft width={12} height={12} />
        </div>
        <span className="h3 text-truncate">{name}</span>
      </div>
      <div className="col-12 mb-4">
        <div
          className={`
            d-flex justify-content-center align-items-center py-2 cursor-pointer 
            border border-gray-700 bg-gray-850 border-radius-4
            `}
          onClick={goToNetwork}
        >
          <span className="me-2">{t("profile:go-to-network")}</span>
          <ArrowUpRight width={14} height={14} />
        </div>
      </div>
      {children}
    </div>
  );
}
