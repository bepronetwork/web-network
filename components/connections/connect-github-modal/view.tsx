import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import GithubImage from "components/github-image";
import Modal from "components/modal";

interface ConnectGithubAccountViewProps {
  show: boolean;
  onCloseClick: () => void;
  onOkClick: () => void;
  isLoading: boolean;
}

export default function ConnectGithubAccountView({
  show,
  onOkClick,
  onCloseClick,
  isLoading
}: ConnectGithubAccountViewProps) {
  const { t } = useTranslation(["profile", "common"]);

  return (
    <Modal
      show={show}
      okLabel={
        <div className="d-flex align-items-center">
          {t("actions.change-handle")}
          <div className="ms-2">
            <GithubImage  opacity={1} />
          </div>
        </div>
      }
      cancelLabel={t("common:actions.cancel")}
      title={t("modals.connect-github.title")}
      onCloseClick={onCloseClick}
      onOkClick={onOkClick}
      isExecuting={isLoading}
    >
      <Row>
        <Col>
          <Row className="text-center">
            <span className="family-Regular font-weight-medium text-white">
              {t("modals.connect-github.description")}
            </span>
          </Row>
        </Col>
      </Row>
    </Modal>
  );
}
