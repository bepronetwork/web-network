import { ReactNode } from "react";

import { useTranslation } from "next-i18next";

import ResponsiveWrapper from "components/responsive-wrapper";

interface CardProps {
  currentStep: number;
  maxSteps: number;
  children: ReactNode;
}
export default function CreateBountyCard({
  currentStep,
  maxSteps,
  children,
}: CardProps) {
  const { t } = useTranslation(["bounty"]);

  return (
    <>
      <ResponsiveWrapper className="mx-3 flex-column" xs={true} md={false}>
        <span className="text-gray">
          {t("bounty:step-of", {
            currentStep,
            maxSteps,
          })}
        </span>
        {children}
      </ResponsiveWrapper>
      <ResponsiveWrapper
        className="mx-2 flex-column bg-gray-900 p-4 border-radius-4 border border-gray-850"
        xs={false}
        md={true}
      >
        <span className="text-gray">
          {t("bounty:step-of", {
            currentStep,
            maxSteps,
          })}
        </span>
        {children}
      </ResponsiveWrapper>
    </>
  );
}
