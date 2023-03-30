import { ReactNode } from "react";

import { useTranslation } from "next-i18next";

import Button from "components/button";

export default function CreateBountyRewardInfo({
  isFunding = false,
  updateIsFunding,
  children,
}: {
  isFunding?: boolean;
  updateIsFunding?: (e: boolean) => void;
  children: ReactNode;
}) {
  const { t } = useTranslation(["bounty"]);

  return (
    <div className="mt-2">
      <h5>{t("steps.reward")}</h5>
      <div className="text-gray">
        {t("descriptions.reward")}
        <p className="mt-2 ms-1">{t("descriptions.reward-1")}</p>
        <p className="ms-1">{t("descriptions.reward-2")}</p>
      </div>

      <>
        <div className="d-flex">
          <label>{t("fields.reward-type")}</label>
          <div className="mx-1 text-danger">*</div>
        </div>
        <div className="d-flex mt-1">
          <Button
            className={!isFunding ? "bounty-button" : "bounty-outline-button"}
            onClick={() => updateIsFunding(false)}
          >
            {t("self-fund")}
          </Button>
          <Button
            className={isFunding ? "bounty-button" : "bounty-outline-button"}
            onClick={() => updateIsFunding(true)}
          >
            {t("seek-funding")}
          </Button>
        </div>
      </>
      <>{children}</>
    </div>
  );
}
