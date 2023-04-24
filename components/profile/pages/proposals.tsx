import {useTranslation} from "next-i18next";

import ListIssues from "components/list-issues";
import ProfileLayout from "components/profile/profile-layout";

import {useAppState} from"contexts/app-state";

import {useNetwork} from "x-hooks/use-network";

export default function ProposalsPage() {
  const {t} = useTranslation(["proposal", "bounty"]);

  const {state} = useAppState();
  const { getURLWithNetwork } = useNetwork();

  return(
    <ProfileLayout>
      <ListIssues
        redirect={getURLWithNetwork("/curators")}
        buttonMessage={t('bounty:label_other')}
        proposer={state.currentUser?.walletAddress || "not-connected"}
        emptyMessage={t('errors.you-dont-have-proposals')}
        variant="profile"
      />
    </ProfileLayout>
  );
}
