import React from "react";
import { useEffect, useState } from "react";

import { useAuthentication } from "contexts/authentication";
import { useTranslation } from "next-i18next";

import ProposalItem from "components/proposal-item";

import { IActiveIssue } from "contexts/issue";

import { isProposalDisputable } from "helpers/proposal";

import { INetworkIssue } from "interfaces/issue-data";

import { BeproService } from "services/bepro-service";

import NothingFound from "./nothing-found";

interface IIssueProposalProps {
  issue: IActiveIssue;
  networkIssue: INetworkIssue;
  className: string;
}

export default function IssueProposals({
  issue,
  networkIssue,
  className = ""
}: IIssueProposalProps) {
  const { wallet, beproServiceStarted } = useAuthentication();
  const [disputableTime, setDisputableTime] = useState(0);
  const { t } = useTranslation("proposal");

  useEffect(() => {
    if (beproServiceStarted) {
      BeproService.getDisputableTime().then(setDisputableTime);
    }
  }, [issue, wallet?.address, beproServiceStarted]);

  return (
    <div className={`content-wrapper ${className || ""} pt-0 pb-0`}>
      {(issue?.mergeProposals?.length > 0 &&
        networkIssue?.networkProposals?.length > 0 &&
        React.Children.toArray(
          issue?.mergeProposals?.map((proposal) => (
            <ProposalItem
              key={proposal.id}
              proposal={proposal}
              issue={issue}
              isFinalized={networkIssue?.finalized}
              isDisputable={
                isProposalDisputable(proposal?.createdAt, disputableTime) &&
                !networkIssue?.networkProposals[proposal.id]?.isDisputed
              }
            />
          ))
        )) || <NothingFound description={t("errors.not-found")} />}
      {issue?.mergeProposals?.length === 0 && (
        <div className="content-list-item proposal caption-small text-center text-uppercase p-4 text-ligth-gray">
          {t("messages.no-proposals-created")}
        </div>
      )}
    </div>
  );
}
