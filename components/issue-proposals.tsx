import React from "react";

import { useTranslation } from "next-i18next";

import NothingFound from "components/nothing-found";
import ProposalItem from "components/proposal-item";

import { useIssue } from "contexts/issue";

export default function IssueProposals() {
  const { t } = useTranslation("proposal");

  const { activeIssue, networkIssue } = useIssue();

  const hasProposals = !!activeIssue?.mergeProposals?.length && !!networkIssue?.proposals?.length;

  return (
    <div className={`content-wrapper border-top-0 pt-0 pb-0`}>
      {hasProposals &&
        React.Children.toArray(activeIssue?.mergeProposals?.map((proposal) => (
            <ProposalItem proposal={proposal} />
          ))) ||
        <>
          <NothingFound description={t("errors.not-found")} />

          <div className="content-list-item proposal caption-small text-center text-uppercase p-4 text-ligth-gray">
            {t("messages.no-proposals-created")}
          </div>
        </>
      }
    </div>
  );
}
