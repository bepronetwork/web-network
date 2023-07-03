import {useTranslation} from "next-i18next";

import BountiesList from "components/bounty/bounties-list/controller";
import ProfileLayout from "components/profile/profile-layout";

import { SearchBountiesPaginated } from "types/api";

import {useNetwork} from "x-hooks/use-network";

interface PullRequestsPageProps {
  bounties: SearchBountiesPaginated;
}

export default function PullRequestsPage({
  bounties
}: PullRequestsPageProps) {
  const {t} = useTranslation(["pull-request", "bounty"]);

  const { getURLWithNetwork } = useNetwork();

  return(
    <ProfileLayout>
      <BountiesList
        bounties={bounties}
        redirect={getURLWithNetwork("/bounties")}
        buttonMessage={t('bounty:label_other')}
        emptyMessage={String(t('errors.you-dont-have-pull-requests'))}
        variant="profile"
        type="pull-requests"
      />
    </ProfileLayout>
  );
}