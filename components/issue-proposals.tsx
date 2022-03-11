import { useContext } from "react";
import { useEffect, useState } from "react";
import { BeproService } from "services/bepro-service";
import { ApplicationContext } from "contexts/application";
import ProposalItem from "components/proposal-item";
import NothingFound from "./nothing-found";
import { useTranslation } from "next-i18next";
import { isProposalDisputable } from "helpers/proposal";
import { INetworkIssue, IssueData } from "interfaces/issue-data";
import React from "react";

interface IIssueProposalProps {
  issue: IssueData;
  networkIssue: INetworkIssue;
  className: string;
}
export default function IssueProposals({
  issue,
  networkIssue,
  className = "",
}: IIssueProposalProps) {
  const {
    state: { currentAddress },
  } = useContext(ApplicationContext);
  const [disputableTime, setDisputableTime] = useState(0);
  const { t } = useTranslation("proposal");

  useEffect(() => {
    BeproService.getDisputableTime().then(setDisputableTime);
  }, [issue, currentAddress]);

  return (
    <div className={`content-wrapper ${className || ""} pt-0 pb-0`}>
      {React.Children.toArray(
        issue?.mergeProposals?.map((proposal) => (
          <ProposalItem
            key={proposal.id}
            proposal={proposal}
            issue={issue}
            onDispute={()=>{}}
            isFinalized={networkIssue?.finalized}
            isDisputable={
              isProposalDisputable(proposal.createdAt, disputableTime) &&
              !networkIssue.networkProposals[proposal.id].isDisputed
            }
          />
        ))
      ) || <NothingFound description={t("errors.not-found")} />}
      {issue?.mergeProposals?.length === 0 && (
        <div className="content-list-item proposal caption-small text-center text-uppercase p-4 text-ligth-gray">
          {t("messages.no-proposals-created")}
        </div>
      )}
    </div>
  );
}
