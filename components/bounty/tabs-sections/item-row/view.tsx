import React from "react";

import BigNumber from "bignumber.js";
import Link from "next/link";
import { UrlObject } from "url";

import AvatarOrIdenticon from "components/avatar-or-identicon";
import { IPRLabel } from "components/deliverable/labels/controller";
import Identicon from "components/identicon";

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
        item={item}      />
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
            {(item as Deliverable)?.user ? (
              <>
                <AvatarOrIdenticon
                  user={(item as Deliverable)?.user?.githubLogin}
                  address={(item as Deliverable)?.user?.address}
                  size="sm"
                />
                <span
                  className={`text-uppercase text-white caption text-truncate mt-1`}
                >
                  {(item as Deliverable)?.user?.githubLogin
                    ? (item as Deliverable)?.user?.githubLogin
                    : truncateAddress((item as Deliverable)?.user?.address)}
                </span>
              </>
            ) : (
              <>
                <Identicon
                  size="sm"
                  address={(item as Proposal)?.creator}
                  className="mx-1"
                />
                <span className={`text-uppercase text-white caption`}>
                  {truncateAddress((item as Proposal)?.creator)}
                </span>
              </>
            )}
          </div>
          {!isProposal && (
            <ReviewsNumberView
              reviewers={(item as Deliverable)?.comments?.length || 0}
              className="col-xs-12 d-xl-none d-none d-sm-block"
            />
          )}
          <ItemRowLabelsView key='label-normal-screen' status={status} className="d-none d-sm-block" />
        </div>
        <div className="col-1 d-block d-sm-none ms-2">
          <div className="d-flex flex-row justify-content-end">
            <ItemRowIdView id={id} />
          </div>
        </div>

        {!isProposal && (
          <ReviewsNumberView
            reviewers={(item as Deliverable)?.comments?.filter(e => e.type === 'review')?.length || 0}
            className="d-block d-sm-none mb-2 mt-4"
          />
        )}

        {status?.length ? (
          <ItemRowLabelsView
            key='label-tablet-mobile'
            status={status}
            className="d-block d-sm-none mt-2"
            classLabels="p-2"
          />
        ) : (
          <div className="d-block d-sm-none mt-3">
            <RenderProposalOrDeliverable />
          </div>
        )}

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
