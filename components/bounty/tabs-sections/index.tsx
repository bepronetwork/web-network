import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import ItemSections from "components/bounty/tabs-sections/item-sections";
import CustomContainer from "components/custom-container";
import TabbedNavigation from "components/tabbed-navigation";

import { useAppState } from "contexts/app-state";

import { TabbedNavigationItem } from "interfaces/tabbed-navigation";

function TabSections(){
  const { t } = useTranslation("bounty");

  const {state} = useAppState();
  
  const [pullRequests, setPullRequests] = useState(state.currentBounty?.data?.pullRequests)
  const [proposals, setProposals] = useState(state.currentBounty?.data?.mergeProposals)

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

  useEffect(()=> setPullRequests(state.currentBounty?.data?.pullRequests),[state.currentBounty?.data?.pullRequests])
  useEffect(()=> setProposals(state.currentBounty?.data?.mergeProposals),[state.currentBounty?.data?.mergeProposals])
  
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