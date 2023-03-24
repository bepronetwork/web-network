import clsx from "clsx";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";

import BountiesIcon from "assets/icons/bounties-icon";
import CustomNetworkIcon from "assets/icons/custom-network-icon";
import PaymentsIcon from "assets/icons/payments-icon";
import ProfileIcon from "assets/icons/profile-icon";
import ProposalsIcon from "assets/icons/proposals-icon";
import PullRequestsIcon from "assets/icons/pull-requests-icon";
import VotingPowerIcon from "assets/icons/voting-power-icon";
import WalletIcon from "assets/icons/wallet-icon";

import { useNetwork } from "x-hooks/use-network";

export default function ProfileSide() {
  const { query, asPath } = useRouter();
  const { t } = useTranslation("common");

  const { getURLWithNetwork } = useNetwork();

  const getHref = (href = "") =>
    query?.network ? `/${query?.network}/${query?.chain}/profile/${href}` : `/profile/${href}`;
  const getUrl = () =>
    query?.network ? getURLWithNetwork("/profile/[[...profilePage]]") : "/profile/[[...profilePage]]";
  const getTranslation = page => t(`main-nav.nav-avatar.${page}`);
  const isActive = href => href !== "" ? asPath.endsWith(href) : asPath.endsWith("/profile");

  const ProfileLink = ({ label, href, icon }) => (
    <li className="mb-2" key={label}>
      <Link href={getUrl()} as={getHref(href)} passHref>
        <a
          className={clsx([
            "d-flex flex-row align-items-center gap-2 text-decoration-none",
            "text-gray-150 border-radius-1 p-2 text-white-hover",
            isActive(href) ? "profile-side-link-active" : ""
          ])}
        >
          {icon}
          <span>{getTranslation(label)}</span>
        </a>
      </Link>
    </li>
    );

  const getLink = (label, href, icon) => ({ label, href, icon });

  const links = [
    getLink("profile", "", <ProfileIcon />),
    getLink("wallet", "wallet", <WalletIcon />),
    getLink("voting-power", "voting-power", <VotingPowerIcon />),
    getLink("payments", "payments", <PaymentsIcon />),
    getLink("bounties", "bounties", <BountiesIcon />),
    getLink("pull-requests", "pull-requests", <PullRequestsIcon />),
    getLink("proposals", "proposals", <ProposalsIcon />),
    getLink("my-network", "my-network", <CustomNetworkIcon />),
  ];

  return(
    <aside className="col-2 bg-gray-950">
      <ul className="ml-2 pt-4">
        {links.map(ProfileLink)}
      </ul>
    </aside>
  );
}