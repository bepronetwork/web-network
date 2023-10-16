import clsx from "clsx";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";

import { getProfileLinks } from "helpers/navigation-links";

import { LinkProps } from "types/components";

import { useNetwork } from "x-hooks/use-network";

interface ProfileLinksProps {
  onClick?: () => void;
}

export default function ProfileLinks({
  onClick
}: ProfileLinksProps) {
  const { query, asPath } = useRouter();
  const { t } = useTranslation("common");

  const { getURLWithNetwork } = useNetwork();

  const getHref = (href = "") =>
    query?.network ? `/${query?.network}/${query?.chain}/profile/${href}` : `/profile/${href}`;
  const getUrl = () => query?.network ?
    getURLWithNetwork("/profile/[[...profilePage]]") :
    { pathname: "/profile/[[...profilePage]]", query };
  const isActive = href => asPath.endsWith(`/profile${href ? `/${href}` : ""}`);

  const ProfileLink = ({ label, href, icon }: LinkProps) => (
    <li className="mb-2" key={label}>
      <Link href={getUrl()} as={getHref(href)} passHref>
        <a
          className={clsx([
            "d-flex flex-row align-items-center gap-2 text-decoration-none",
            "text-gray-150 border-radius-1 p-2 text-white-hover",
            isActive(href) ? "profile-side-link-active" : ""
          ])}
          onClick={onClick}
        >
          {icon()}
          <span>{label}</span>
        </a>
      </Link>
    </li>
    );

  return(
    <ul>
      {getProfileLinks(t, !!query?.network).map(ProfileLink)}
    </ul>
  );
}