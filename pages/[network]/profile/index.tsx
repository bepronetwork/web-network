import { useState } from "react";

import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import AvatarOrIdenticon from "components/avatar-or-identicon";
import Badge from "components/badge";
import Button from "components/button";
import { ConnectionButton } from "components/profile/connect-button";
import ProfileLayout from "components/profile/profile-layout";
import { RemoveGithubAccount } from "components/profile/remove-github-modal";

import { useAuthentication } from "contexts/authentication";

import { truncateAddress } from "helpers/truncate-address";

export default function Profile() {
  const { t } = useTranslation("profile");

  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const { wallet, user, connectWallet, connectGithub, disconnectGithub } = useAuthentication();

  const isConnected = !!user?.login && !!wallet?.address;
  const addressOrUsername = user?.login ? user.login : truncateAddress(wallet?.address);

  const handleClickDisconnect = () => setShowRemoveModal(true);
  const hideRemoveModal = () => setShowRemoveModal(false);
  
  return(
    <ProfileLayout>
      <div className="row mb-5">
        <div className="col">
          <AvatarOrIdenticon user={user?.login} address={wallet?.address} size="lg" withBorder />
          
          <div className="d-flex flex-row mt-3 align-items-center">
            <h4 className="text-gray text-uppercase mr-2">{addressOrUsername}</h4>
            
            { wallet?.isCouncil && 
              <Badge 
                label="Council" 
                color="purple-30" 
                className="caption border border-purple text-purple border-radius-8"
              /> 
            }
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <span className="caption text-gray">{t("connections")}</span>
      </div>

      <div className="row">
        <div className="col-4">
          <ConnectionButton
            type="github" 
            credential={user?.login} 
            connect={connectGithub}
          />

          { isConnected &&
            <Button outline color="danger" className="mt-3" onClick={handleClickDisconnect}>
              {t("actions.remove-github-account")}
            </Button>
          }
        </div>

        <div className="col-4">
          <ConnectionButton 
            type="wallet" 
            credential={wallet?.address} 
            connect={connectWallet} 
          />
        </div>
      </div>

      <RemoveGithubAccount
        show={showRemoveModal}
        githubLogin={user?.login}
        walletAddress={wallet?.address}
        onCloseClick={hideRemoveModal}
        disconnectGithub={disconnectGithub}
      />
    </ProfileLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {

  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "connect-wallet-button",
        "bounty",
        "profile"
      ]))
    }
  };
};
