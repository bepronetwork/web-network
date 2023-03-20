import {useTranslation} from "next-i18next";

import ListIssues from "components/list-issues";
import ProfileLayout from "components/profile/profile-layout";

import {useAppState} from "contexts/app-state";

export default function BountiesPage() {
  const {t} = useTranslation("bounty");

  const {state} = useAppState();

  return(
    <ProfileLayout>
      <span className="family-Regular h4 text-white text-capitalize">{t("label_other")}</span>

      <ListIssues creator={state.currentUser?.login || "not-connected"} />
    </ProfileLayout>
  );
}
