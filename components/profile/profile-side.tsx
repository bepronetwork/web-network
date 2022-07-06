import { useTranslation } from "next-i18next";

import InternalLink from "components/internal-link";

import useNetworkTheme from "x-hooks/use-network";

export default function ProfileSide() {
  const { t } = useTranslation("common");

  const { getURLWithNetwork } = useNetworkTheme();

  const Link = (label, href) => ({ label, href });
  const ProfileLink = ({ label, href }) => (
    <li className="mb-4" key={label}>
      <InternalLink
      href={href}
      label={label}
      className="p-0 caption-large"
      activeClass="account-link-active"
      nav
    />
    </li>
  );

  const links = [
    Link(t("main-nav.nav-avatar.profile"), getURLWithNetwork("/profile")),
    Link(t("main-nav.nav-avatar.wallet"), getURLWithNetwork("/profile/wallet")),
    Link(t("main-nav.nav-avatar.payments"), getURLWithNetwork("/profile/payments")),
    Link(t("main-nav.nav-avatar.bounties"), getURLWithNetwork("/profile/bounties")),
    Link(t("main-nav.nav-avatar.pull-requests"), getURLWithNetwork("/profile/pull-requests")),
    Link(t("main-nav.nav-avatar.proposals"), getURLWithNetwork("/profile/proposals")),
    Link(t("main-nav.nav-avatar.custom-network"), getURLWithNetwork("/profile/custom-network"))
  ];

  return(
    <aside className="profile-side col-2">
      <ul className="ml-2 pt-4">
        {links.map(ProfileLink)}  
      </ul>
    </aside>
  );
}