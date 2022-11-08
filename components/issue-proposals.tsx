import React from "react";

import {useTranslation} from "next-i18next";

import NothingFound from "components/nothing-found";
import ProposalItem from "components/proposal-item";

import {useAppState} from "../contexts/app-state";

export default function IssueProposals() {
  const { t } = useTranslation("proposal");

  const {state} = useAppState();

  const hasProposals = !!state.currentBounty?.data?.mergeProposals?.length && !!state.currentBounty?.chainData?.proposals?.length;

  return (
    <div className={`content-wrapper border-top-0 ${hasProposals && "pt-0 pb-0" || "py-1" }`}>
      {hasProposals &&
        React.Children.toArray(state.currentBounty?.data?.mergeProposals?.map((proposal) => (
            <ProposalItem proposal={proposal} />
          ))) ||
        <>
          <NothingFound description={t("errors.not-found")} />

          <div className="content-list-item proposal caption-small text-center text-uppercase p-4 text-light-gray">
            {t("messages.no-proposals-created")}
          </div>
        </>
      }
    </div>
  );
}