import { ReactNode, useEffect, useState } from "react";

import { Defaults } from "@taikai/dappkit";
import getConfig from "next/config";
import { useRouter } from "next/router";

import BeproLogoBlue from "assets/icons/bepro-logo-blue";
import HelpIcon from "assets/icons/help-icon";
import PlusIcon from "assets/icons/plus-icon";

import Button from "components/button";
import ClosedNetworkAlert from "components/closed-network-alert";
import ConnectWalletButton from "components/connect-wallet-button";
import HelpModal from "components/help-modal";
import InternalLink from "components/internal-link";
import NavAvatar from "components/nav-avatar";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import TransactionsStateIndicator from "components/transactions-state-indicator";
import Translation from "components/translation";
import WrongNetworkModal from "components/wrong-network-modal";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";

import useApi from "x-hooks/use-api";
import useNetwork from "x-hooks/use-network";

const { publicRuntimeConfig } = getConfig();

interface MyNetworkLink {
  href: string;
  label: string;
  icon?: ReactNode;
}

export default function MainNav() {
  const { pathname } = useRouter();

  const [showHelp, setShowHelp] = useState(false);
  const [myNetwork, setMyNetwork] = useState<MyNetworkLink>({ 
    label: "New Network", 
    href: "/new-network", 
    icon: <PlusIcon /> 
  });

  const { wallet } = useAuthentication();
  const { service: DAOService } = useDAO();
  const { searchNetworks } = useApi();
  const { network, getURLWithNetwork } = useNetwork();

  const isNetworksPage = ["/networks", "/new-network"].includes(pathname);
  const isBeproNetwork = network?.name === publicRuntimeConfig?.networkConfig?.networkName;

  useEffect(() => {
    if (!DAOService || !wallet?.address) return;

    DAOService.getNetworkAdressByCreator(wallet.address)
      .then(async networkAddress => {
        if (networkAddress === Defaults.nativeZeroAddress) return;

        const network = await searchNetworks({ networkAddress }).then(({ rows }) => rows[0]);

        setMyNetwork({ 
          label: "My Network", 
          href: `/${network?.name?.toLowerCase()}`
        });
      })
      .catch(console.log);
  }, [DAOService, wallet?.address]);

  return (
    <div
      className={`main-nav d-flex flex-column justify-content-center
         bg-${isBeproNetwork || isNetworksPage ? "dark" : "primary"}`}
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
                  nav
                  uppercase
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
              href={myNetwork.href}
              icon={myNetwork.icon}
              label={myNetwork.label}
              iconBefore
              uppercase
              outline
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

          <WrongNetworkModal requiredNetworkId={publicRuntimeConfig?.metaMask?.chainId} />

          <ConnectWalletButton>
            <>
              {/* <Button
                className="opacity-75 opacity-100-hover"
                transparent
                rounded
              >
                <NotificationIcon />
              </Button> */}

              <TransactionsStateIndicator />

              <NavAvatar />
            </>
          </ConnectWalletButton>
        </div>

        <HelpModal show={showHelp} onCloseClick={() => setShowHelp(false)} />
      </div>
    </div>
  );
}
