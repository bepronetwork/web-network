import { useState } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import CloseIcon from "assets/icons/close-icon";
import ExternalLinkIcon from "assets/icons/external-link-icon";

import Avatar from "components/avatar";
import Identicon from "components/identicon";
import InternalLink from "components/internal-link";

import { useAuthentication } from "contexts/authentication";

import { truncateAddress } from "helpers/truncate-address";

import useNetworkTheme from "x-hooks/use-network";

export default function NavAvatar() {
  const { t } = useTranslation("common");

  const [visible, setVisible] = useState(false);

  const { getURLWithNetwork } = useNetworkTheme();
  const { wallet, user, disconnectWallet } = useAuthentication();

  const avatar = () => user?.login && 
    <Avatar userLogin={user.login} className="border-primary" size="md" /> || 
    <Identicon address={wallet?.address} />;
  
  const username = user?.login ? user.login : truncateAddress(wallet?.address);

  const Link = (label, href) => ({ label, href });

  const ProfileInternalLink = ({ label, href }) => 
    <InternalLink 
      href={href} 
      label={label} 
      className="mb-1 p family-Regular" 
      key={label}
      nav 
    />;

  const ProfileExternalLink = ({ label, href, className = "" }) => (
    <div className={`d-flex flex-row align-items-center justify-content-between ${className}`} key={label}>
      <a 
        href={href} 
        className={`text-decoration-none p family-Regular ${ className || "text-gray"}`} 
        target="_blank"
      >
          {label}
        </a>
      <ExternalLinkIcon width={12} height={12} />
    </div>
  );

  const DisconnectWallet = ({ onClick }) => (
    <div 
      className="d-flex flex-row align-items-center justify-content-between pt-3 pb-1 px-0 cursor-pointer text-danger" 
      onClick={onClick}
    >
      <span className="p family-Regular">{t("main-nav.nav-avatar.disconnect-wallet")}</span>
      <CloseIcon width={10} height={10} color="" />
    </div>
  );

  const LinksSession = ({ children }) => (
    <div className="row align-items-center border-bottom border-ligth-gray">
      <div className="d-flex flex-column gap-3 pt-3 pb-3 px-0">
        {children}
      </div>
    </div>
  );

  // TODO: update internal links when the new profile page is ready
  const internalLinks = [
    Link(t("main-nav.nav-avatar.wallet"), getURLWithNetwork("/profile/wallet")),
    Link(t("main-nav.nav-avatar.payments"), getURLWithNetwork("/profile/payments")),
    Link(t("main-nav.nav-avatar.bounties"), getURLWithNetwork("/profile/bounties")),
    Link(t("main-nav.nav-avatar.pull-requests"), getURLWithNetwork("/profile/pull-requests")),
    Link(t("main-nav.nav-avatar.proposals"), getURLWithNetwork("/profile/proposals")),
    Link(t("main-nav.nav-avatar.custom-network"), getURLWithNetwork("/profile/custom-network")),
  ];

  const externalLinks = [
    Link(t("main-nav.nav-avatar.support-center"), "https://support.bepro.network/en/"),
    Link(t("main-nav.nav-avatar.guides"), "https://docs.bepro.network/"),
    Link(t("main-nav.nav-avatar.join-discord"), "https://discord.gg/9aUufhzhfm"),
    Link(t("main-nav.nav-avatar.follow-on-twitter"), "https://twitter.com/bepronet"),
  ];

  const overlay = (
    <Popover id="profile-popover">
      <Popover.Body className="bg-shadow pt-3 px-4">
        <div className="row align-items-center border-bottom border-ligth-gray pb-2">
          <div className="col-3 px-0">
            {avatar()}
          </div>

          <div className="col-9 p-0">
              <div className="d-flex flex-row justify-content-left mb-1">
                <span className="caption-large text-white mb-1 text-capitalize font-weight-normal">{username}</span>
              </div>

              <div className="d-flex flex-row justify-content-left">
                <InternalLink 
                  href={getURLWithNetwork("/profile")} 
                  label={t("main-nav.nav-avatar.view-profile")} 
                  className="text-gray p family-Regular" 
                  nav 
                />
              </div>
          </div>
        </div>

        <LinksSession>
          {internalLinks.map(ProfileInternalLink)}
        </LinksSession>

        <LinksSession>
          {externalLinks.map(ProfileExternalLink)}
        </LinksSession>

        <LinksSession>
          <ProfileExternalLink 
            label={t("main-nav.nav-avatar.web-network-1")}
            href="https://development.bepro.network/" 
            className="text-primary" 
          />
        </LinksSession>

        <div className="row align-items-center">
          <DisconnectWallet onClick={disconnectWallet} />
        </div>
      </Popover.Body>
    </Popover>
  );

  return(
    <div className="cursor-pointer popover-without-arrow profile-menu">
      <OverlayTrigger
        show={visible}
        rootClose={true}
        trigger="click"
        placement={"bottom-end"}
        onToggle={(next) => setVisible(next)}
        overlay={overlay}
      >
        <div>
          {avatar()} 
        </div>
      </OverlayTrigger>
    </div>
  );
}