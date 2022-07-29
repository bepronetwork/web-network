import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

import { kebabCase } from "lodash";
import { useTranslation } from "next-i18next";

import WebThreeUnavailable from "assets/web3-unavailable";

import Button from "./button";

export default function WebThreeDialog() {
  const [show, setShow] = useState<boolean>(false);
  const { t } = useTranslation("common");

  function handleClickTryAgain() {
    window.location.reload();
  }

  useEffect(() => {
    setShow(!window?.ethereum);
  }, []);

  if(show)
    return (
      <div className="container-fluid vw-100 vh-100 bg-image bg-main-image">
        <Modal
          centered
          aria-labelledby={`${kebabCase("WebThreeDialog")}-modal`}
          aria-describedby={`${kebabCase("WebThreeDialog")}-modal`}
          show={show}
        >
          <Modal.Header>
            <Modal.Title>{t("modals.web3-dialog.title")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="caption-small text-warning text-center">
              {t("modals.web3-dialog.eth-not-available")}
            </p>
            <div className="d-flex flex-column align-items-center">
              <WebThreeUnavailable />
              <p className="p mb-0 mt-4 text-center fs-small">
                {t("modals.web3-dialog.message")}
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <a
              className="text-decoration-none"
              href="https://metamask.io/download.html"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Button color="dark-gray">{t("actions.install")}</Button>
            </a>
            <Button onClick={handleClickTryAgain}>
              {t("actions.try-again")}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  return null;
}
