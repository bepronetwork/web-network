import React from "react";

import { useTranslation } from "next-i18next";

import AvatarOrIdenticon from "components/avatar-or-identicon";
import Badge from "components/badge";
import GithubConnectionState from "components/connections/github-connection-state/controller";
import CustomContainer from "components/custom-container";
import ProfileLayout from "components/profile/profile-layout";
import { RemoveGithubAccount } from "components/profile/remove-github-modal";
import ResponsiveWrapper from "components/responsive-wrapper";

import { truncateAddress } from "helpers/truncate-address";

import useBreakPoint from "x-hooks/use-breakpoint";

interface ProfilePageViewProps {
  userLogin: string;
  walletAddress: string;
  isCouncil: boolean;
  handleClickDisconnect: () => void;
  hideRemoveModal: () => void;
  showRemoveModal: boolean;
  disconnectGithub: () => void;
}

export default function ProfilePageView({
  userLogin,
  walletAddress,
  isCouncil,
  handleClickDisconnect,
  hideRemoveModal,
  disconnectGithub,
  showRemoveModal,
}: ProfilePageViewProps) {
  const { t } = useTranslation(["common", " profile"]);

  const { isMobileView, isTabletView } = useBreakPoint();

  const isTabletOrMobile = isMobileView || isTabletView ? true : false;

  return (
    <>
      <div className="border-bottom border-gray-850">
        <CustomContainer>
          <ResponsiveWrapper xl={false} xs={true} className="mb-4">
            <h4>{t(`common:main-nav.nav-avatar.profile`)}</h4>
          </ResponsiveWrapper>
        </CustomContainer>
      </div>

      <ProfileLayout>
        <div className="row mb-5">
          <div className="col">
            <div
              className={`${
                isTabletOrMobile ? "d-flex" : null
              } mt-3 align-items-center`}
            >
              <AvatarOrIdenticon
                user={userLogin}
                address={walletAddress}
                size={isTabletOrMobile ? "md" : "lg"}
              />
              <div className="text-truncate">
                <h4
                  className={`${
                    isTabletOrMobile ? "ms-2" : "mt-2"
                  } text-gray-100 font-weight-medium text-uppercase text-truncate mr-2`}
                >
                  {userLogin ? userLogin : truncateAddress(walletAddress)}
                </h4>
              </div>
            </div>
            {isCouncil && (
              <Badge
                label={t("profile:council")}
                color="purple-30"
                className="caption border border-purple text-purple border-radius-8 mt-3"
              />
            )}
          </div>
        </div>

        <div className="row mb-3">
          <span className="caption text-white text-capitalize font-weight-medium">{t("profile:connections")}</span>
        </div>

        <GithubConnectionState handleClickDisconnect={handleClickDisconnect} />

        <RemoveGithubAccount
          show={showRemoveModal}
          githubLogin={userLogin}
          walletAddress={walletAddress}
          onCloseClick={hideRemoveModal}
          disconnectGithub={disconnectGithub}
        />
      </ProfileLayout>
    </>
  );
}
