import { useTranslation } from "next-i18next";

import CustomContainer from "components/custom-container";
import TabbedNavigation from "components/tabbed-navigation";

import { useAppState } from "contexts/app-state";

import { TabbedNavigationItem } from "interfaces/tabbed-navigation";

import ItemSections from "./item-sections";

function TabSections(){
  const { t } = useTranslation("bounty");
  const {state} = useAppState();
  
  const pullRequests = state.currentBounty?.data?.pullRequests;
  const proposals = state.currentBounty?.data?.mergeProposals;

  const tabs: TabbedNavigationItem[] = [
    {
      isEmpty: !proposals?.length,
      eventKey: "proposals",
      title: t("proposal:labelWithCount", { count: proposals?.length || 0 }),
      description: t("description_proposal"),
      component: <ItemSections isProposal data={proposals}/>
    },
    {
      isEmpty: !pullRequests?.length,
      eventKey: "pull-requests",
      title: t("pull-request:labelWithCount", { count: pullRequests?.length || 0 }),
      description: t("description_pull-request"),
      component: <ItemSections isProposal={false} data={pullRequests}/>

    }
  ];
  
  if(!proposals?.length  && !pullRequests?.length)
    return <></>;

  return (
    <CustomContainer className="mb-4">
      <TabbedNavigation
        className="issue-tabs"
        tabs={tabs}
        collapsable
      />
  </CustomContainer>)
}

export default TabSections;