import {useTranslation} from "next-i18next";

import ListIssues from "components/list-issues";
import ProfileLayout from "components/profile/profile-layout";

import {useAppState} from "contexts/app-state";

import {useNetwork} from "x-hooks/use-network";

export default function PullRequestsPage() {
  const {t} = useTranslation(["pull-request", "bounty"]);

  const {state} = useAppState();
  const { getURLWithNetwork } = useNetwork();

  return(
    <ProfileLayout>
      <ListIssues
        redirect={getURLWithNetwork("/bounties")}
        buttonMessage={t('bounty:label_other')}
        pullRequesterAddress={state.currentUser?.walletAddress || null}
        pullRequesterLogin={state.currentUser?.login || null}
        emptyMessage={String(t('errors.you-dont-have-pull-requests'))}
        variant="profile"
      />
    </ProfileLayout>
  );
}