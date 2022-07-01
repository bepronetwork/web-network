import { useState } from "react";

import getConfig from "next/config";
import { useRouter } from "next/router";

import BeproLogo from "assets/icons/bepro-logo";
import BeproLogoBlue from "assets/icons/bepro-logo-blue";
import BeproSmallLogo from "assets/icons/bepro-small-logo";
import ExternalLinkIcon from "assets/icons/external-link-icon";
import HelpIcon from "assets/icons/help-icon";
import NotificationIcon from "assets/icons/notification-icon";
import PlusIcon from "assets/icons/plus-icon";

import BalanceAddressAvatar from "components/balance-address-avatar";
import Button from "components/button";
import ClosedNetworkAlert from "components/closed-network-alert";
import ConnectWalletButton from "components/connect-wallet-button";
import HelpModal from "components/help-modal";
import InternalLink from "components/internal-link";
import NetworkIdentifier from "components/network-identifier";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import TransactionsStateIndicator from "components/transactions-state-indicator";
import Translation from "components/translation";
import WrongNetworkModal from "components/wrong-network-modal";

import { useAuthentication } from "contexts/authentication";

import { formatNumberToNScale } from "helpers/formatNumber";
import { truncateAddress } from "helpers/truncate-address";

import useNetwork from "x-hooks/use-network";

const { publicRuntimeConfig } = getConfig();

export default function MainNav() {
  const { pathname } = useRouter();

  const [showHelp, setShowHelp] = useState(false);

  const { wallet } = useAuthentication();
  const { network, getURLWithNetwork } = useNetwork();

  const isNetworksPage = ["/networks", "/new-network"].includes(pathname);
  const isBeproNetwork = network?.name === publicRuntimeConfig?.networkConfig?.networkName;

  return (
    <div
      className={`main-nav d-flex flex-column bg-${isBeproNetwork || isNetworksPage ? "dark" : "primary"}`}
    >
      {network?.isClosed && <ClosedNetworkAlert />}

      <div
        className={`d-flex flex-row align-items-center justify-content-between px-3 ${
          wallet?.address ? "py-0" : "py-3"
        }`}
      >
        <div className="d-flex">
          <InternalLink
            href={getURLWithNetwork("/", { network: network?.name })}
            icon={
              !isBeproNetwork ? (
                <img
                  src={`${publicRuntimeConfig?.ipfsUrl}/${network?.fullLogo}`}
                  width={104}
                  height={32}
                />
              ) : (
                <BeproLogoBlue />
              )
            }
            className="brand"
            nav
            active
            brand
          />
          {(!isNetworksPage && (
            <ul className="nav-links">
              <li>
                <InternalLink
                  href={getURLWithNetwork("/developers")}
                  label={<Translation label={"main-nav.developers"} />}
                  nav
                  uppercase
                />
              </li>

              <li>
                <InternalLink
                  href={getURLWithNetwork("/council")}
                  label={<Translation label={"main-nav.council"} />}
                  nav
                  uppercase
                />
              </li>

              <li>
                <InternalLink
                  href={getURLWithNetwork("/oracle")}
                  label={<Translation label={"main-nav.Oracle"} />}
                  nav
                  uppercase
                />
              </li>

              <li>
                <InternalLink
                  href={"/networks"}
                  label={"Networks"}
                  className={`${isBeproNetwork && "nav-link-gradient" || ""}`}
                  nav
                  uppercase
                  active={isBeproNetwork}
                />
              </li>
            </ul>
          )) ||
            ""}
        </div>

        <div className="d-flex flex-row align-items-center gap-20">
          {(!isNetworksPage && (
            <ReadOnlyButtonWrapper>
              <InternalLink
                href={getURLWithNetwork("/create-bounty")}
                icon={<PlusIcon />}
                label={<Translation label={"main-nav.new-bounty"} />}
                className="read-only-button"
                iconBefore
                uppercase
                outline
              />
            </ReadOnlyButtonWrapper>
          )) || (
            <InternalLink
              href="/new-network"
              icon={<PlusIcon />}
              label={"New Network"}
              iconBefore
              nav
              uppercase
            />
          )}

          <Button
            onClick={() => setShowHelp(true)}
            className="opacity-75 opacity-100-hover"
            transparent
            rounded
          >
            <HelpIcon />
          </Button>

          <Button
            className="opacity-75 opacity-100-hover"
            transparent
            rounded
          >
            <NotificationIcon />
          </Button>

          <WrongNetworkModal requiredNetworkId={publicRuntimeConfig?.metaMask?.chainId} />

          <ConnectWalletButton>
            <div className="d-flex account-info align-items-center">
              <TransactionsStateIndicator />

              <NetworkIdentifier />

              <InternalLink
                href={getURLWithNetwork("/account")}
                icon={<BeproSmallLogo />}
                label={formatNumberToNScale(wallet?.balance?.bepro || 0)}
                className="mx-3"
                transparent
                nav
              />

              <InternalLink
                href={getURLWithNetwork("/account")}
                icon={
                  <BalanceAddressAvatar
                    address={truncateAddress(wallet?.address || "", 4)}
                    balance={wallet?.balance?.eth}
                    currency={publicRuntimeConfig?.metaMask?.tokenName}
                  />
                }
                className="meta-info d-flex align-items-center"
              />
            </div>
          </ConnectWalletButton>
        </div>

        <HelpModal show={showHelp} onCloseClick={() => setShowHelp(false)} />
      </div>
    </div>
  );
}
