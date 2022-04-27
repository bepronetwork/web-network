import React from "react";
import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import ProposalItem from "components/proposal-item";

import { useAuthentication } from "contexts/authentication";
import { IActiveIssue } from "contexts/issue";

import { BeproService } from "services/bepro-service";

import NothingFound from "./nothing-found";

interface IIssueProposalProps {
  issue: IActiveIssue;
  className: string;
}

export default function IssueProposals({
  issue,
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
      {(issue?.mergeProposals?.length &&
        React.Children.toArray(issue?.mergeProposals?.map((proposal) => (
          <ProposalItem
            key={proposal.id}
            proposal={proposal}
            issue={issue}
            disputableTime={disputableTime}
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
