import { useTranslation } from "next-i18next";

import Button from "components/button";
import ContractButton from "components/contract-button";
import ResponsiveWrapper from "components/responsive-wrapper";

export default function FooterButtons({
  handleBack,
  handleCreate,
  disabledCreate,
  isLoadingCreate,
}: {
  handleBack: () => void;
  handleCreate: () => void;
  disabledCreate?: boolean;
  isLoadingCreate?: boolean;
}) {
  const { t } = useTranslation(["common", "deliverable"]);

  return (
    <>
      <div className="col-6 mx-0 pe-3">
        <Button className="col-12 bounty-outline-button" onClick={handleBack}>
          {t("actions.cancel")}
        </Button>
      </div>

      <div className="col-6 mx-0 ps-3">
        <ContractButton
          className="col-12 bounty-button"
          onClick={handleCreate}
          disabled={disabledCreate}
          isLoading={isLoadingCreate}
        >
          <ResponsiveWrapper xs={true} md={false}>
            {t("common:misc.create")}
          </ResponsiveWrapper>
          <ResponsiveWrapper xs={false} md={true}>
            {t("deliverable:actions.create.title")}
          </ResponsiveWrapper>
        </ContractButton>
      </div>
    </>
  );
}
