
import React from "react";

import { useTranslation } from "next-i18next";

import NothingFound from "components/nothing-found";

import { IssueBigNumberData, PullRequest } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

import ItemRow from "../item-row/controller";

interface ItemViewProps {
  data: Proposal[] | PullRequest[],
  isProposal: boolean,
  currentBounty: IssueBigNumberData;
}

function ItemSectionsView({ data, isProposal, currentBounty }: ItemViewProps) {
  const { t } = useTranslation(["proposal", "pullrequest", "common"]);

  return (
    <section className="content-wrapper border-top-0 p-20 d-flex flex-column gap-2 bg-gray-850">
      {
        data?.length ?
          React.Children.toArray(data?.map((item: Proposal | PullRequest) => {
            return (
              <ItemRow 
                item={item} 
                isProposal={isProposal} 
                currentBounty={currentBounty}           
              />
            )
          }))
          : <NothingFound description={t("errors.not-found")} />
      }
    </section>
  )
}
export default ItemSectionsView;