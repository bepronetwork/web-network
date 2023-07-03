import {useTranslation} from "next-i18next";

import BountiesList from "components/bounty/bounties-list/controller";
import ProfileLayout from "components/profile/profile-layout";

import { SearchBountiesPaginated } from "types/api";

import {useNetwork} from "x-hooks/use-network";

interface ProposalsPageProps {
  bounties: SearchBountiesPaginated;
}

export default function ProposalsPage({
  bounties
}: ProposalsPageProps) {
  const { t } = useTranslation(["proposal", "bounty"]);

  const { getURLWithNetwork } = useNetwork();

  return(
    <ProfileLayout>
      <BountiesList
        bounties={bounties}
        redirect={getURLWithNetwork("/curators")}
        buttonMessage={t('bounty:label_other')}
        emptyMessage={t('errors.you-dont-have-proposals')}
        variant="profile"
        type="proposals"
      />
    </ProfileLayout>
  );
}
