
import React from "react";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import Button from "components/button";
import NothingFound from "components/nothing-found";
import ProposalProgressSmall from "components/proposal-progress-small";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import Translation from "components/translation";

import { useAppState } from "contexts/app-state";

import { pullRequest } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

import { useNetwork } from "x-hooks/use-network";

import ItemRow from "./item-row";

interface ItemProps {
  data: Proposal[] | pullRequest[],
  isProposal: boolean,
}

function ItemSections({ data, isProposal }: ItemProps) {
  const { t } = useTranslation(["proposal", "pullrequest"]);
  const {state} = useAppState();
  const router = useRouter();
  const { getURLWithNetwork } = useNetwork();

  return (
    <section className="content-wrapper border-top-0 p-20 d-flex flex-column gap-2 bg-gray-900">
      {
        data.length ?
          React.Children.toArray(data.map((item) => {
            const asProposal = isProposal || (item as Proposal).scMergeId
            const pathRedirect = isProposal ? '/proposal' : '/pull-request';
            const valueRedirect = {
              id: state.currentBounty?.data?.githubId,
              repoId: state.currentBounty?.data?.repository_id,
            } as any
            const status = []

            const networkProposal = state.currentBounty?.chainData?.proposals?.[+item?.scMergeId]
            const isDisputed = !!networkProposal?.isDisputed;
            const isMerged = item?.isMerged;

            if(!asProposal){
              status.push({
                merged: item?.merged,
                isMergeable: item?.isMergeable,
                isDraft: item?.status === "draft"
              })
              valueRedirect.prId = (item as pullRequest)?.githubId
            } else if(networkProposal){
              if(isDisputed || isMerged){
                status.push({
                  label: isDisputed ? 'disputed' : 'accepted'
                })
              }
                
              valueRedirect.proposalId = item?.id
            }

            return (
              <ItemRow 
                id={item?.id} 
                href={getURLWithNetwork(pathRedirect, valueRedirect)} 
                githubLogin={item?.githubLogin} 
                status={status}>
                {(asProposal && networkProposal) ? (
                  <>
                    <div className="d-flex align-items-center text-center col-4">
                      <ProposalProgressSmall
                        color={isDisputed ? 'danger' : isMerged ? 'success' : 'purple'}
                        value={networkProposal?.disputeWeight}
                        total={state.currentUser?.balance?.staked}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="d-flex align-items-center text-center">
                      <span className="label-m text-white">{(item as pullRequest)?.reviewers?.length || 0}</span>

                      <span className="label-m text-uppercase text-gray-500 ml-1">
                        <Translation
                          ns="pull-request"
                          label="review"
                          params={{ count: (item as pullRequest)?.reviewers?.length || 0 }}
                        />
                      </span>
                    </div>
                  </>
                )}

                <ReadOnlyButtonWrapper>
                  <Button
                    className="read-only-button"
                    onClick={(ev) => {
                      ev.preventDefault();
                      router.push?.(getURLWithNetwork(pathRedirect, {
                        ...valueRedirect,
                        review: true
                      }))
                    }}
                  >
                    <span className="label-m text-white">
                      <Translation label={asProposal ? "actions.view-proposal" : "actions.review"} />
                    </span>
                  </Button>
                </ReadOnlyButtonWrapper>
              </ItemRow>
            )
          }))
          : <NothingFound description={t("errors.not-found")} />
      }
    </section>
  )
}
export default ItemSections;