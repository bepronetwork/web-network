import { UrlObject } from "url";

import InternalLink from "components/internal-link";

interface Link {
  href: string | UrlObject;
  label: string;
  isVisible: boolean;
}

interface NavLinksProps {
  links: Link[];
}

export default function NavLinks({ links } : NavLinksProps) {
  const isVisible = ({ isVisible }) => isVisible;

  return(
    <ul className="nav-links">
      {links.filter(isVisible).map(({ href, label }) => 
        <li key={`nav-${label}`}>
          <InternalLink
            href={href}
            label={label}
            nav
            uppercase
          />
        </li>)}
    </ul>
  );
}