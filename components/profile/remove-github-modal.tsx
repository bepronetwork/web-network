import { useContext, useState } from "react";
import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import Modal from "components/modal";
import { WarningSpan } from "components/warning-span";

import {AppStateContext, useAppState} from "contexts/app-state";
import { toastError } from "contexts/reducers/change-toaster";

import useApi from "x-hooks/use-api";

interface RemoveGithubAccountProps {
  show: boolean;
  githubLogin: string;
  walletAddress: string;
  onCloseClick: () => void;
  disconnectGithub: () => void;
}

function RemoveGithubAccount({
  show,
  githubLogin,
  walletAddress,
  onCloseClick,
  disconnectGithub
} : RemoveGithubAccountProps) {
  const { t } = useTranslation(["profile", "common"]);
  const router = useRouter();
  const [isExecuting, setIsExecuting] = useState(false);

  const { resetUser } = useApi();
  const { dispatch } = useAppState();
  
  const SpanPrimary = ({ text }) => <span className="text-primary">{text}</span>;

  function handleClickRemove() {
    setIsExecuting(true);

    resetUser(walletAddress, githubLogin)
      .then(() => {
        return disconnectGithub();
      })
      .then(() => router.push("/connect-account"))
      .catch(error => {
        if (error?.response?.status === 409) {
          const message = {
            PULL_REQUESTS_OPEN: t("modals.remove-github.errors.pull-requests-open")
          };

          dispatch(toastError(message[error.response.data], t("modals.remove-github.errors.failed-to-remove")));
        } else 
          dispatch(toastError(t("modals.remove-github.errors.check-requirements"), 
                              t("modals.remove-github.errors.failed-to-remove")));
      }).finally(()=> setIsExecuting(false))
  }

  return(
    <Modal
      show={show}
      okLabel={t("common:actions.remove")}
      okColor="danger"
      cancelLabel={t("common:actions.cancel")}
      title={t("modals.remove-github.title")}
      onCloseClick={onCloseClick}
      onOkClick={handleClickRemove}
      isExecuting={isExecuting}
    >
      <Row>
        <Col>
          <Row className="text-center mb-4">
            <span className="family-Regular font-weight-medium text-white">
              {t("common:actions.remove")}{" "}
              <SpanPrimary text={githubLogin} />{" "}
              {t("modals.remove-github.account-from-wallet")}{" "}
              <SpanPrimary text={walletAddress} />
            </span>
          </Row>

          <WarningSpan
            text={t("modals.remove-github.warnings.pull-requests")}
          />
        </Col>
      </Row>
    </Modal>
  );
}

export { RemoveGithubAccount };