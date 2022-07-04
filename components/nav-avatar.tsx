import { useState } from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";

import CloseIcon from "assets/icons/close-icon";
import ExternalLinkIcon from "assets/icons/external-link-icon";

import Avatar from "components/avatar";
import Identicon from "components/identicon";
import InternalLink from "components/internal-link";

import { useAuthentication } from "contexts/authentication";

import { truncateAddress } from "helpers/truncate-address";

import useNetworkTheme from "x-hooks/use-network";

export default function NavAvatar() {
  const [visible, setVisible] = useState(false);

  const { getURLWithNetwork } = useNetworkTheme();
  const { wallet, user, disconnectWallet } = useAuthentication();

  const avatar = () => user?.login && 
    <Avatar userLogin={user.login} className="border-primary" size="lg" /> || 
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
      <span className="p family-Regular">Disconnect wallet</span>
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
    Link("Wallet", ""),
    Link("Payments", getURLWithNetwork("/account/payments")),
    Link("Bounties", getURLWithNetwork("/account")),
    Link("Pull Requests", getURLWithNetwork("/account/my-pull-requests")),
    Link("Proposals", ""),
    Link("Custom Network", getURLWithNetwork("/account/my-network")),
  ];

  const externalLinks = [
    Link("Support Center", "https://support.bepro.network/en/"),
    Link("Guides", "https://docs.bepro.network/"),
    Link("Join the Discord", "https://discord.gg/9aUufhzhfm"),
    Link("Follow @bepronet on Twitter", "https://twitter.com/bepronet"),
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
                <InternalLink href="" label="View Profile" className="text-gray p family-Regular" nav />
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
            label="Web Network Version 1.0" 
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