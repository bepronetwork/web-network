import Avatar from "components/avatar";
import Button from "components/button";
import Modal from "components/modal";
import { truncateAddress } from "helpers/truncate-address";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";

import ErrorMarkIcon from "assets/icons/errormark-icon";
import metamaskLogo from "assets/metamask.png";

export default function InvalidAccountWalletModal({ user, wallet, isVisible }) {
  const { asPath } = useRouter();

  async function handleSubmit() {
    await signOut({ redirect: false });

    return signIn("github", {
      callbackUrl: `${window.location.protocol}//${window.location.host}/${asPath}`
    });
  }

  return (
    <Modal
      centerTitle
      size="lg"
      show={isVisible}
      title={"Github Account and Wallet don't match"}
    >
      <div>
        <div className="d-flex justify-content-center mb-2 mx-2 text-center flex-column mb-4">
          <p className="caption-small text-gray">
            Login to the Github account previously associated to this wallet or
            change to the correct wallet for this account.
          </p>
        </div>

        <div className="row gx-3 connect-account">
          <div className="col-6">
            <div
              className={
                "button-connect border bg-dark border-danger d-flex justify-content-between p-3 align-items-center"
              }
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
              className={
                "button-connect border bg-dark border-danger d-flex justify-content-between p-3 align-items-center"
              }
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

        <div className="d-flex justify-content-center mt-3">
          <Button color="primary" onClick={handleSubmit}>
            <span>Connect</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
