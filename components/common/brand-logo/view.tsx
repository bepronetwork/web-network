import { UrlObject } from "url";

import LogoPlaceholder from "assets/icons/logo-placeholder";

import InternalLink from "components/internal-link";

interface BrandLogoProps {
  href: string | UrlObject;
  logoUrl: string;
  showDefaultBepro?: boolean;
}

export default function BrandLogo({
  href,
  logoUrl,
  showDefaultBepro
} : BrandLogoProps) {
  const defaultLogo = `/images/Bepro_Logo_Light.svg`;

  const icon = showDefaultBepro || logoUrl ? 
    <img
      src={showDefaultBepro ? defaultLogo : logoUrl}
      height={32}
    /> : 
    <LogoPlaceholder />; 

  return(
    <InternalLink
      href={href}
      icon={icon}
      className="brand"
      nav
      active
      brand
    />
  );
}