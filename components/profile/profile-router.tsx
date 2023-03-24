import { useEffect } from "react";

import { useRouter } from "next/router";

import BountiesPage from "components/profile/pages/bounties";
import MyNetworkPage from "components/profile/pages/my-network";
import PaymentsPage from "components/profile/pages/payments";
import ProfilePage from "components/profile/pages/profile";
import ProposalsPage from "components/profile/pages/proposals";
import PullRequestsPage from "components/profile/pages/pull-requests";
import VotingPowerPage from "components/profile/pages/voting-power";
import WalletPage from "components/profile/pages/wallet";

export default function ProfileRouter() {
  const { asPath, push } = useRouter();

  const Route = (path, page) => ({ path, page });

  const routes = [
    Route("/profile", ProfilePage),
    Route("/profile/wallet", WalletPage),
    Route("/profile/voting-power", VotingPowerPage),
    Route("/profile/payments", PaymentsPage),
    Route("/profile/bounties", BountiesPage),
    Route("/profile/pull-requests", PullRequestsPage),
    Route("/profile/proposals", ProposalsPage),
    Route("/profile/my-network", MyNetworkPage),
  ];

  const currentRoute = routes.find(({ path }) => asPath.endsWith(path));

  useEffect(() => {
    if (!currentRoute)
      push("/404");
  }, [currentRoute]);

  if (currentRoute)
    return <currentRoute.page />;

  return <></>;
}