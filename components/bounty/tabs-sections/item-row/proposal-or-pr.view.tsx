import React from "react";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import Button from "components/button";
import GithubLink from "components/github-link";
import ProposalProgressSmall from "components/proposal-progress-small";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import Translation from "components/translation";

import { pullRequest } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

import ReviewsNumberView from "../reviews-number.view";

interface ItemRowProps {
  isProposal: boolean;
  item: Proposal | pullRequest;
  handleBtn: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  btnLabel: string;
  shouldRenderApproveButton: boolean;
  githubPath: string;
  proposal: Proposal;
  isDisputed: boolean;
  isMerged: boolean;
  totalToBeDisputed: BigNumber;
}

export default function ProposalOrPullRequestView({
  isProposal,
  item,
  handleBtn,
  btnLabel,
  shouldRenderApproveButton,
  githubPath,
  proposal,
  isDisputed,
  isMerged,
  totalToBeDisputed,
}: ItemRowProps) {
  const { t } = useTranslation(["proposal", "pullrequest", "common"]);

  return (
    <>
      {isProposal && proposal ? (
        <>
          <div className="d-flex align-items-center text-center col-md-8">
            <ProposalProgressSmall
              color={isDisputed ? "danger" : isMerged ? "success" : "purple"}
              value={proposal?.disputeWeight}
              total={totalToBeDisputed}
            />
          </div>
        </>
      ) : (
        <ReviewsNumberView
          className="d-none d-xl-block"
          reviewers={(item as pullRequest)?.reviewers?.length || 0}
        />
      )}

      <ReadOnlyButtonWrapper>
        <div className="row align-items-center d-none d-xl-block">
          <div className="col">
            <Button
              className="read-only-button text-truncate"
              onClick={handleBtn}
            >
              <span className="label-m text-white">
                <Translation label={btnLabel} />
              </span>
            </Button>
          </div>

          {shouldRenderApproveButton && (
            <div className="col">
              <GithubLink
                forcePath={githubPath}
                hrefPath={`pull/${(item as pullRequest)?.githubId || ""}/files`}
                color="primary"
                onClick={(e) => e.stopPropagation()}
              >
                {t("common:actions.approve")}
              </GithubLink>
            </div>
          )}
        </div>
      </ReadOnlyButtonWrapper>
    </>
  );
}
