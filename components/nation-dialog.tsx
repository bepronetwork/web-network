import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

import { kebabCase } from "lodash";
import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import BeProBlue from "assets/icons/bepro-blue";


import useApi from "x-hooks/use-api";

export default function NationDialog({ children }) {
  const {publicRuntimeConfig} = getConfig();
  const [isBlock, setBlock] = useState<boolean>(false);
  const { getClientNation } = useApi();
  const { t } = useTranslation("common");
  const [country, setCountry] = useState<string>();

  useEffect(() => {
    getClientNation()
      .then((data) => {
        if (
          data.countryCode &&
          publicRuntimeConfig?.countryCodeBlocked?.indexOf(data.countryCode) === -1
        )
          return;

        setCountry(data.country || String(t("modals.nation-dialog.your-country")));
        setBlock(true);
      })
  }, []);

  if (isBlock) {
    return (
      <div className="container-fluid vw-100 vh-100 bg-image bg-main-image">
        <Modal
          centered
          aria-labelledby={`${kebabCase("NationDialog")}-modal`}
          aria-describedby={`${kebabCase("NationDialog")}-modal`}
          id="nation-dialog-modal"
          show={true}
        >
          <Modal.Header>
            <Modal.Title>
              <BeProBlue width={40} height={40} />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex flex-column mt-2 align-items-center text-whit">
              <p className="p text-white mb-2 text-center fs-9 white-space-wrap">
                {t("modals.nation-dialog.at-the-moment", { country })}
              </p>
              <a
                target="_blank"
                href="https://www.bepro.network/terms-and-conditions"
                className="mb-2 text-center text-white-50 text-decoration-none text-uppercase fs-8"
                rel="noreferrer"
              >
                {t("modals.nation-dialog.excluded")}
              </a>
              <p className="p text-wrap mb-2 text-center fs-8">
                {t("modals.nation-dialog.further")}
              </p>
              <a
                className="family-inter text-uppercase text-blue-dark text-decoration-none fs-8"
                href="mailto: general@bepro.network"
              >
                {t("modals.nation-dialog.email")}
              </a>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }

  return <>{children}</>;
}
