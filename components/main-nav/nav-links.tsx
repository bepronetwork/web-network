import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import InternalLink from "components/internal-link";
import ResponsiveWrapper from "components/responsive-wrapper";

import { useAppState } from "contexts/app-state";

import useChain from "x-hooks/use-chain";
import { useNetwork } from "x-hooks/use-network";

export default function NavLinks() {
  const { t } = useTranslation("common");
  const { pathname } = useRouter();

  const { chain } = useChain();
  const { state } = useAppState();
  const { getURLWithNetwork } = useNetwork();

  const isOnNetwork = pathname?.includes("[network]/[chain]");

  function getChainShortName() {
    const availableChains = state.Service?.network?.availableChains;
    const isOnAvailableChain = availableChains?.find(({ chainId }) => +chainId === +state.connectedChain?.id);

    if (chain) return chain.chainShortName;

    if (isOnAvailableChain) {
      return isOnAvailableChain.chainShortName;
    }

    if (availableChains?.length) return availableChains[0].chainShortName;

    return null;
  }

  const links = [
    {
      href: getURLWithNetwork("/bounties", {
        chain: getChainShortName()
      }),
      label: t("main-nav.nav-avatar.bounties"),
      isVisible: isOnNetwork
    },
    {
      href: getURLWithNetwork("/curators"),
      label: t("main-nav.council"),
      isVisible: isOnNetwork
    },
    {
      href: "/bounty-hall",
      label: t("main-nav.bounty-hall"),
      isVisible: true
    },
    {
      href: "/networks",
      label: t("main-nav.networks"),
      isVisible: true
    },
    {
      href: "/leaderboard",
      label: t("main-nav.leaderboard"),
      isVisible: true
    },
  ];

  const isVisible = ({ isVisible }) => isVisible;

  return(
    <ResponsiveWrapper
      xs={false}
      xl={true}
    >
      <ul className="nav-links">
        {links.filter(isVisible).map(({ href, label}) => 
          <li key={`nav-${label}`}>
            <InternalLink
              href={href}
              label={label}
              nav
              uppercase
            />
          </li>)}
      </ul>
    </ResponsiveWrapper>
  );
}