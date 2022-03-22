import { Modal } from "react-bootstrap";

import { kebabCase } from "lodash";
import { useTranslation } from "next-i18next";

export default function MobileInformation() {
  const { t } = useTranslation("common");

  return (
    <div>
      <Modal
        centered
        backdrop={false}
        aria-labelledby={`${kebabCase("Mobile-Information")}-modal`}
        aria-describedby={`${kebabCase("Mobile-Information")}-modal`}
        show={true}
      >
        <Modal.Header>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column align-items-center">
            <span className="material-icons text-blue">info</span>
            <p className="text-white mb-0 mt-4 text-center">
              {t("modals.mobile-information.our-web-application")}
            </p>
            <p className="text-white mb-0 mt-4 text-center">
              {t("modals.mobile-information.if-you-want")}
            </p>
            <p className="text-white mb-0 mt-4 text-center">
              {t("modals.mobile-information.stay-updated")}
            </p>
            <a href="https://www.bepro.network/">@bepronet</a>
          </div>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    </div>
  );
}
