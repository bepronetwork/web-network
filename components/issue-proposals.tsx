import React from "react";

import { useTranslation } from "next-i18next";

import ProposalItem from "components/proposal-item";

import { IActiveIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";

import { isProposalDisputable } from "helpers/proposal";

import { BountyExtended } from "interfaces/bounty";

import NothingFound from "./nothing-found";

interface IIssueProposalProps {
  issue: IActiveIssue;
  networkIssue: BountyExtended;
  className: string;
}

export default function IssueProposals({
  issue,
  className = "",
  networkIssue
}: IIssueProposalProps) {
  const { activeNetwork } = useNetwork();
  const { t } = useTranslation("proposal");

  return (
    <div className={`content-wrapper ${className || ""} pt-0 pb-0`}>
      {(issue?.mergeProposals?.length > 0 &&
        networkIssue?.proposals?.length > 0 &&
        React.Children.toArray(issue?.mergeProposals?.map((proposal) => (
            <ProposalItem
              key={proposal.id}
              proposal={proposal}
              issue={issue}
              disputableTime={activeNetwork?.disputableTime}
              isDisputable={
                isProposalDisputable(proposal?.createdAt, activeNetwork?.disputableTime) &&
                !networkIssue?.proposals[proposal.id]?.isDisputed
              }
            />
          )))) || <NothingFound description={t("errors.not-found")} />}
      {issue?.mergeProposals?.length === 0 && (
        <div className="content-list-item proposal caption-small text-center text-uppercase p-4 text-ligth-gray">
          {t("messages.no-proposals-created")}
        </div>
      )}
    </div>
  );
}
