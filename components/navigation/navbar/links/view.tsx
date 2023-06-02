import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import InternalLink from "components/internal-link";
import ResponsiveWrapper from "components/responsive-wrapper";

import { useNetwork } from "x-hooks/use-network";

export default function NavBarLinks() {
  const { pathname } = useRouter();
  const { t } = useTranslation("common");

  const { getURLWithNetwork } = useNetwork();

  const isOnNetwork = pathname?.includes("[network]/[chain]");

  const links = [
    {
      href: getURLWithNetwork("/bounties"),
      label: t("main-nav.nav-avatar.bounties"),
      isVisible: isOnNetwork
    },
    {
      href: getURLWithNetwork("/curators"),
      label: t("main-nav.council"),
      isVisible: isOnNetwork
    },
    {
      href: "/explore",
      label: t("main-nav.explore"),
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