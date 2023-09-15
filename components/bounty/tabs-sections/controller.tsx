import { useTranslation } from "next-i18next";

import ItemSections from "components/bounty/tabs-sections/item-sections/controller";
import TabbedNavigation from "components/tabbed-navigation";

import { IssueBigNumberData } from "interfaces/issue-data";
import { TabbedNavigationItem } from "interfaces/tabbed-navigation";

function TabSections({
  currentBounty
}: { currentBounty: IssueBigNumberData }){
  const { t } = useTranslation("bounty");
  
  const deliverables = currentBounty?.deliverables
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
      isEmpty: !deliverables?.length,
      eventKey: "deliverables",
      title: t("deliverable:labelWithCount", { count: deliverables?.length || 0 }),
      description: t("description_deliverable"),
      component: <ItemSections isProposal={false} data={deliverables} currentBounty={currentBounty}/>

    }
  ];
  
  if(!proposals?.length  && !deliverables?.length)
    return <></>;

  return (
    <div className="mb-4">
      <TabbedNavigation
        className="issue-tabs"
        tabs={tabs}
        collapsable
      />
  </div>
  )
}

export default TabSections;