import { useTranslation } from "next-i18next";

import ContractButton from "components/contract-button";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";

export default function DeliverableButton({
  withLockIcon,
  isLoading,
  disabled,
  onClick,
  className,
  type
}: {
  withLockIcon?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type: "cancel" | "review" | "ready-review"
}) {
  const { t } = useTranslation([ "common" ,"deliverable"]);

  const Labels = {
    'cancel': t("common:actions.cancel"),
    'review': t("common:actions.make-a-review"),
    'ready-review': t("deliverable:actions.make-ready.title")
  }

  return (
    <ReadOnlyButtonWrapper>
      <ContractButton
        className={`read-only-button text-nowrap ${className}`}
        onClick={onClick}
        disabled={disabled}
        isLoading={isLoading}
        withLockIcon={withLockIcon}
      >
        {Labels[type]}
      </ContractButton>
    </ReadOnlyButtonWrapper>
  );
}
