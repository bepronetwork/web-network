import { useTranslation } from "next-i18next";

import ItemSections from "components/bounty/tabs-sections/item-sections/controller";
import CustomContainer from "components/custom-container";
import TabbedNavigation from "components/tabbed-navigation";

import { IssueBigNumberData } from "interfaces/issue-data";
import { TabbedNavigationItem } from "interfaces/tabbed-navigation";

function TabSections({
  currentBounty
}: { currentBounty: IssueBigNumberData }){
  const { t } = useTranslation("bounty");
  
  const pullRequests = currentBounty?.pullRequests
  const proposals = currentBounty?.mergeProposals

  const tabs: TabbedNavigationItem[] = [
    {
      isEmpty: !proposals?.length,
      eventKey: "proposals",
      title: t("proposal:labelWithCount", { count: proposals?.length || 0 }),
      description: t("description_proposal"),
      component: <ItemSections isProposal data={proposals} currentBounty={currentBounty}/>
    },
    {
      isEmpty: !pullRequests?.length,
      eventKey: "pull-requests",
      title: t("pull-request:labelWithCount", { count: pullRequests?.length || 0 }),
      description: t("description_pull-request"),
      component: <ItemSections isProposal={false} data={pullRequests} currentBounty={currentBounty}/>

    }
  ];
  
  if(!proposals?.length  && !pullRequests?.length)
    return <></>;

  return (
    <CustomContainer className="mb-4" col='col-12'>
      <TabbedNavigation
        className="issue-tabs"
        tabs={tabs}
        collapsable
      />
  </CustomContainer>
  )
}

export default TabSections;