import {useTranslation} from "next-i18next";
import Image from "next/image";
import {useRouter} from "next/router";

import ErrorMarkIcon from "assets/icons/errormark-icon";
import metamaskLogo from "assets/metamask.png";

import Avatar from "components/avatar";
import Button from "components/button";
import Modal from "components/modal";

import {useAppState} from "contexts/app-state";

import {truncateAddress} from "helpers/truncate-address";

import { MatchAccountsStatus } from "interfaces/enums/api";

import { useAuthentication } from "x-hooks/use-authentication";

export default function InvalidAccountWalletModal() {
  const {asPath} = useRouter();

  const { t } = useTranslation("common");

  const { 
    state:{
      currentUser,
      spinners:{
        matching
      }
    }
  } = useAppState();

  const { signOut } = useAuthentication();

  const show = [
    currentUser?.match === MatchAccountsStatus.MISMATCH, 
    currentUser?.login,
    currentUser?.walletAddress,
    !asPath.includes(`connect-account`),
    !matching
  ].every(condition=> condition);

  function handleSignOut() {
    signOut();
  }

  return (
    <Modal
      centerTitle
      size="lg"
      show={show}
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
                <Avatar userLogin={currentUser?.login || "null"} />{" "}
                <span className="ms-2">{currentUser?.handle || currentUser?.login}</span>
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
                  {currentUser?.walletAddress && truncateAddress(currentUser?.walletAddress || '')}
                </span>
              </div>
              <ErrorMarkIcon />
            </div>
          </div>
        </div>

        <div className="row justify-content-center align-items-center mt-3">
          <div className="col-auto">
            <Button
              onClick={handleSignOut}
            >
              {t("actions.disconnect")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
