import React from "react";

import BigNumber from "bignumber.js";
import Link from "next/link";
import { UrlObject } from "url";

import AvatarOrIdenticon from "components/avatar-or-identicon";
import { IPRLabel } from "components/deliverable/labels/controller";
import If from "components/If";

import { truncateAddress } from "helpers/truncate-address";

import { Deliverable } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

import ReviewsNumberView from "../reviews-number.view";
import ItemRowIdView from "./id.view";
import ItemRowLabelsView from "./labels.view";
import ProposalOrDeliverableView from "./proposal-or-deliverable.view";

interface ItemRowProps {
  id: string | number;
  status?: IPRLabel[];
  href?: UrlObject | string;
  isProposal?: boolean;
  item: Proposal | Deliverable;
  handleBtn: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  btnLabel: string;
  proposal: Proposal;
  isDisputed: boolean;
  isMerged: boolean;
  totalToBeDisputed: BigNumber;
}

export default function ItemRowView({
  id,
  status,
  href,
  isProposal,
  item,
  handleBtn,
  btnLabel,
  proposal,
  isDisputed,
  isMerged,
  totalToBeDisputed,
}: ItemRowProps) {
  const userGithubLogin = (item as Deliverable)?.user?.githubLogin; 
  const userAddress = (item as Deliverable)?.user?.address || (item as Proposal)?.creator;

  function RenderProposalOrDeliverable() {
    return (
      <ProposalOrDeliverableView
        handleBtn={handleBtn}
        btnLabel={btnLabel}
        proposal={proposal}
        isDisputed={isDisputed}
        isMerged={isMerged}
        totalToBeDisputed={totalToBeDisputed} 
        isProposal={isProposal} 
        item={item}
      />
    );
  }

  return (
    <Link passHref key={`${id}`} href={href || "#"}>
      <div
        className={`row d-flex flex-row py-3 px-2 border-radius-8 bg-gray-900 align-items-center ${
          href ? "cursor-pointer" : ""
        }`}
      >
        <div className="col-10 col-md-8 d-flex flex-row align-items-center gap-3">
          <ItemRowIdView id={id} className="col-1 d-none d-xl-block" />

          <div className="text-truncate col-md-5 col-xl-4 d-flex align-items-center gap-2">
            <AvatarOrIdenticon
              user={userGithubLogin}
              address={userAddress}
              size="sm"
            />

            <span
              className={`text-uppercase text-white caption text-truncate mt-1`}
            >
              {userGithubLogin ? userGithubLogin : truncateAddress(userAddress)}
            </span>
          </div>

          <If condition={!isProposal}>
            <ReviewsNumberView
              reviewers={(item as Deliverable)?.comments?.length || 0}
              className="col-xs-12 d-xl-none d-none d-sm-block"
            />
          </If>

          <ItemRowLabelsView key='label-normal-screen' status={status} className="d-none d-sm-block" />
        </div>

        <div className="col-1 d-block d-sm-none ms-2">
          <div className="d-flex flex-row justify-content-end">
            <ItemRowIdView id={id} />
          </div>
        </div>

        <If condition={!isProposal}>
          <ReviewsNumberView
            reviewers={(item as Deliverable)?.comments?.filter(e => e.type === 'review')?.length || 0}
            className="d-block d-sm-none mb-2 mt-4"
          />
        </If>

        <If 
          condition={!!status?.length}
          otherwise={
            <div className="d-block d-sm-none mt-3">
              <RenderProposalOrDeliverable />
            </div>
          }
        >
          <ItemRowLabelsView
            key='label-tablet-mobile'
            status={status}
            className="d-block d-sm-none mt-2"
            classLabels="p-2"
          />
        </If>

        <div className="col-lg-4 col-md d-none d-sm-block">
          <div className="d-flex flex-row gap-3 justify-content-end align-items-center">
            <RenderProposalOrDeliverable />

            <ItemRowIdView
              id={id}
              className="d-none d-xl-none d-sm-none d-md-block"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
