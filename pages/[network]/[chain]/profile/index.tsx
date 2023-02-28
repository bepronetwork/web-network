import React, {useState} from "react";

import {GetServerSideProps} from "next";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

import AvatarOrIdenticon from "components/avatar-or-identicon";
import Badge from "components/badge";
import GithubConnectionState from "components/github-connection-state";
import KycSessionModal from "components/modals/kyc-session";
import ProfileLayout from "components/profile/profile-layout";
import {RemoveGithubAccount} from "components/profile/remove-github-modal";

import {useAppState} from "contexts/app-state";

import {truncateAddress} from "helpers/truncate-address";

import {useAuthentication} from "x-hooks/use-authentication";


export default function Profile() {
  const { t } = useTranslation("profile");

  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const {state} = useAppState();

  const { disconnectGithub } = useAuthentication();

  const addressOrUsername = 
    state.currentUser?.login ? state.currentUser.login : truncateAddress(state.currentUser?.walletAddress);

  const handleClickDisconnect = () => setShowRemoveModal(true);
  const hideRemoveModal = () => setShowRemoveModal(false);
  
  return(
    <ProfileLayout>
      <div className="row mb-5">
        <div className="col">
          <AvatarOrIdenticon 
            user={state.currentUser?.login}
            address={state.currentUser?.walletAddress}
            size="lg"
          />
          
          <div className="d-flex flex-row mt-3 align-items-center">
            <h4 className="text-gray text-uppercase mr-2">{addressOrUsername}</h4>
            
            { state.Service?.network?.active?.isCouncil &&
              <Badge 
                label={t("council")} 
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

      <GithubConnectionState handleClickDisconnect={handleClickDisconnect} />

      <div className="mt-4">
        <KycSessionModal/>
      </div>
      <RemoveGithubAccount
        show={showRemoveModal}
        githubLogin={state.currentUser?.login}
        walletAddress={state.currentUser?.walletAddress}
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
