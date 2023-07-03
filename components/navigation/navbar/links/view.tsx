import { useRouter } from "next/router";

import InternalLink from "components/internal-link";
import ResponsiveWrapper from "components/responsive-wrapper";

import { NAVIGATION_LINKS } from "helpers/navigation-links";
import { isOnNetworkPath } from "helpers/network";

import { Link } from "types/utils";

import { useNetwork } from "x-hooks/use-network";

export default function NavBarLinks() {
  const { pathname } = useRouter();

  const { getURLWithNetwork } = useNetwork();

  const isOnNetwork = isOnNetworkPath(pathname);

  const { network, global, both } = NAVIGATION_LINKS;

  const links = ((isOnNetwork ? network.map(({ label, href }) => ({
    href: getURLWithNetwork(href),
    label
  })) : global) as Link[]).concat(both as Link[]);

  return(
    <ResponsiveWrapper
      xs={false}
      xl={true}
    >
      <ul className="nav-links">
        {links.map(({ href, label}) => 
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