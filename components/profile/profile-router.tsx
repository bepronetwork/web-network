import { useEffect } from "react";

import { useRouter } from "next/router";

import MyNetworkPage from "components/pages/profile/my-network/controller";
import PaymentsPage from "components/pages/profile/payments/controller";
import BountiesPage from "components/profile/pages/bounties";
import ProfilePage from "components/profile/pages/profile-page/controller";
import ProposalsPage from "components/profile/pages/proposals";
import PullRequestsPage from "components/profile/pages/pull-requests";
import VotingPowerPage from "components/profile/pages/voting-power/controller";

import { useAppState } from "contexts/app-state";

import { ProfilePageProps } from "types/pages";

import WalletPage from "./pages/wallet/view";

export default function ProfileRouter(props: ProfilePageProps) {
  const { pathname, asPath, query, push } = useRouter();

  const { state: { currentUser } } = useAppState();

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

  const currentRoute = routes.find(({ path }) => asPath.split("?")[0].endsWith(path));

  useEffect(() => {
    if (!currentRoute)
      push("/404");
  }, [currentRoute]);

  useEffect(() => {
    if (!currentUser?.walletAddress || !query) return;

    push({
      pathname,
      query: {
        ...query,
        wallet: currentUser?.walletAddress,
      }
    }, asPath, {
      shallow: false,
      scroll: false,
    });

  }, [currentUser?.walletAddress, asPath]);

  if (currentRoute)
    return <currentRoute.page {...props} />;

  return <></>;
}