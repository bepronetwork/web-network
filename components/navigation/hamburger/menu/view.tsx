import {Offcanvas} from "react-bootstrap";

import {useTranslation} from "next-i18next";

import ArrowLeft from "assets/icons/arrow-left";
import ArrowRight from "assets/icons/arrow-right";

import AvatarOrIdenticon from "components/avatar-or-identicon";
import Button from "components/button";
import DisconnectWalletButton from "components/common/buttons/disconnect-wallet/view";
import HelpButton from "components/common/buttons/help/view";
import CreateNetworkBountyButton from "components/create-network-bounty-button/controller";
import If from "components/If";
import InternalLink from "components/internal-link";
import ChainSelector from "components/navigation/chain-selector/controller";
import ProfileLinks from "components/profile/profile-links";

import {truncateAddress} from "helpers/truncate-address";

import {Link} from "types/utils";

interface HamburgerMenuViewProps {
  show: boolean;
  userLogin: string;
  userAddress: string;
  isConnected: boolean;
  isProfileLinksVisible: boolean;
  links: Link[];
  onDisconnect: () => void;
  onShowProfileLinks: () => void;
  onHideProfileLinks: () => void;
  onHideHamburger: () => void;
}

export default function HamburgerMenuView({
  show,
  userLogin,
  userAddress,
  isConnected,
  isProfileLinksVisible,
  links,
  onDisconnect,
  onShowProfileLinks,
  onHideProfileLinks,
  onHideHamburger,
}: HamburgerMenuViewProps) {
  const { t } = useTranslation("common");

  const displayName = userLogin || truncateAddress(userAddress);

  function GlobalLink({ label, href }) {
    return(
      <InternalLink
        label={t(`main-nav.${label}`) as string}
        href={href}
        className="caption-medium font-weight-medium text-white text-capitalize max-width-content m-0 p-0 mt-2"
        transparent
        key={label}
        onClick={onHideHamburger}
      />
    );
  }

  function MyProfileBtn({ onClick, isBack = false }) {
    return(
      <Button
        transparent
        className="font-weight-medium text-capitalize p-0 mt-1 not-svg gap-1"
        textClass="text-gray-500"
        onClick={onClick}
      >
        <If condition={isBack}>
          <div className="mr-1">
            <ArrowLeft height={16} width={16} />
          </div>
        </If>
        <span>
          {t("main-nav.nav-avatar.my-profile")}
        </span>
        <If condition={!isBack}>
          <ArrowRight height={9} />
        </If>
      </Button>
    );
  }

  return(
    <Offcanvas 
      className="bg-gray-950"
      show={show}
      onHide={onHideHamburger}
      placement="end"
    >
        <Offcanvas.Header 
          closeButton  
          closeVariant="white"
        >
          <Offcanvas.Title>
            <If condition={isProfileLinksVisible}>
              <MyProfileBtn
                onClick={onHideProfileLinks}
                isBack
              />
            </If>
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <div className="h-100 px-2 d-flex flex-column">
            <If condition={!isProfileLinksVisible}>
              <If condition={isConnected}>
                <div className="row border-bottom border-gray-800 pb-3 mx-0">
                  <div className="col-auto">
                    <AvatarOrIdenticon
                      user={userLogin}
                      address={userAddress}
                    />
                  </div>

                  <div className="col">
                    <span>{displayName}</span>
                    <MyProfileBtn
                      onClick={onShowProfileLinks}
                    />
                  </div>
                </div>
              </If>

              <div className="d-flex flex-column gap-4 py-3">
                <CreateNetworkBountyButton
                  actionCallBack={onHideHamburger}
                />

                {links.map(GlobalLink)}
              </div>
            </If>

            <If condition={isProfileLinksVisible}>
              <ProfileLinks onClick={onHideHamburger} />
            </If>


            <div className={`col ${ isConnected ? "border-top border-gray-800" : ""}`}>
              <If condition={isConnected}>
                <DisconnectWalletButton onClick={onDisconnect} />
              </If>
            </div>

            <div className="d-flex justify-content-end">
              <div className="flex-grow-1">
                <ChainSelector />
              </div>

              <HelpButton />
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
  );
}