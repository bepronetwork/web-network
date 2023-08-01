import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import ContractButton from "components/contract-button";
import If from "components/If";

interface SubmitButtonProps {
  isMobile?: boolean;
  isVisible?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

export default function SubmitButton({
  isMobile,
  isVisible,
  isDisabled,
  onClick,
}: SubmitButtonProps) {
  const { t } = useTranslation("common");

  return(
    <If condition={isVisible}>
      <Col
        xs={isMobile ? "12" : "auto"}
        className={isMobile ? "d-block d-xl-none" : "d-none d-xl-block"}
      >
        <Row className="mx-0">
          <ContractButton
            disabled={isDisabled}
            onClick={onClick}
          >
            {t("misc.save-changes")}
          </ContractButton>
        </Row>
      </Col>
    </If>
  );
}