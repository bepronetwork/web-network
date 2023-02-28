import { ReactNode } from "react";

import { UrlObject } from "url";

import InternalLink from "components/internal-link";

interface Link {
  href: string | UrlObject;
  label: string;
  isVisible: boolean;
  icon?: ReactNode;
  blank?: boolean;
}

interface NavLinksProps {
  links: Link[];
}

export default function NavLinks({ links } : NavLinksProps) {
  const isVisible = ({ isVisible }) => isVisible;

  return(
    <ul className="nav-links">
      {links.filter(isVisible).map(({ href, label, icon, blank }) => 
        <li key={`nav-${label}`}>
          <InternalLink
            href={href}
            label={label}
            icon={icon}
            blank={blank}
            nav
            uppercase
          />
        </li>)}
    </ul>
  );
}