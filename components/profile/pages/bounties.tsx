import BountiesList from "components/bounty/bounties-list/controller";
import ProfileLayout from "components/profile/profile-layout";

import { SearchBountiesPaginated } from "types/api";

interface BountiesPageProps {
  bounties: SearchBountiesPaginated;
}

export default function BountiesPage({
  bounties
}: BountiesPageProps) {
  return(
    <ProfileLayout>
      <BountiesList 
        bounties={bounties}
        variant="profile"
      />
    </ProfileLayout>
  );
}
