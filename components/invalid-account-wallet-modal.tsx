import { useTranslation } from "next-i18next";
import Image from "next/image";

import ErrorMarkIcon from "assets/icons/errormark-icon";
import metamaskLogo from "assets/metamask.png";

import Avatar from "components/avatar";
import Modal from "components/modal";

import { truncateAddress } from "helpers/truncate-address";

export default function InvalidAccountWalletModal({ user, wallet, isVisible }) {
  const { t } = useTranslation("common");

  return (
    <Modal
      centerTitle
      size="lg"
      show={isVisible}
      title={t("modals.invalid-account-wallet.title")}>
      <div>
        <div className="d-flex justify-content-center mb-2 mx-2 text-center flex-column mb-4">
          <p className="caption-small text-gray">
          {t("modals.invalid-account-wallet.description")}
          </p>
        </div>

        <div className="row gx-3 connect-account">
          <div className="col-6">
            <div
              className={`button-connect border bg-dark 
                border-danger d-flex justify-content-between p-3 align-items-center`}
            >
              <div>
                <Avatar src={user?.image} userLogin={user?.login || "null"} />{" "}
                <span className="ms-2">{user?.name || user?.login}</span>
              </div>

              <ErrorMarkIcon />
            </div>
          </div>
          <div className="col-6">
            <div
              className={`button-connect border bg-dark 
                border-danger d-flex justify-content-between p-3 align-items-center`}
            >
              <div>
                <Image src={metamaskLogo} width={15} height={15} />{" "}
                <span className="ms-2">
                  {wallet?.address && truncateAddress(wallet?.address)}
                </span>
              </div>
              <ErrorMarkIcon />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
