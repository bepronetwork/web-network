import { Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import ConnectGithub from "components/connect-github";
import { WarningSpan } from "components/warning-span";

export default function WarningGithub() {
  const { t } = useTranslation(["custom-network"]);

  return (
    <Row className="mb-3">
      <WarningSpan text={t("warning-connect-github")} />
      <ConnectGithub />
    </Row>
  );
}
