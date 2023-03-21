import ListIssues from "components/list-issues";
import ProfileLayout from "components/profile/profile-layout";

import {useAppState} from "contexts/app-state";

export default function BountiesPage() {
  const {state} = useAppState();

  return(
    <ProfileLayout>
      <ListIssues 
        creatorAddress={state.currentUser?.walletAddress || "not-connected"} 
        variant="profile"
      />
    </ProfileLayout>
  );
}
