import React from "react";

import Link from "next/link";
import { UrlObject } from "url";

import Avatar from "components/avatar";
import Identicon from "components/identicon";
import PullRequestLabels, { IPRLabel } from "components/pull-request-labels";

import { truncateAddress } from "helpers/truncate-address";

interface ItemRowProps {
  id: string | number;
  githubLogin?: string;
  creator?: string;
  status?: IPRLabel[];
  children?: React.ReactNode;
  href?: UrlObject | string;
}

function ItemRow({ id, githubLogin, creator, status, children, href }: ItemRowProps) {
  return (
    <Link passHref key={`${githubLogin}-${id}`} href={href || "#"}>
      <div
        className={`d-flex flex-row p-20 border-radius-8 bg-gray-850 align-items-center ${
          href ? "cursor-pointer" : ""
        }`}
      >
        <div className="col d-flex flex-row align-items-center gap-3">
          <div className="col-1">
            <span className="label-m text-gray-500">#{id}</span>
          </div>
          <div className="col-md-4 col-xl-3 d-flex align-items-center gap-2">
          {githubLogin ? (
              <>
                <Avatar userLogin={githubLogin} />
                <span className={`text-uppercase text-white caption`}>
                  {githubLogin}
                </span>
              </>
            ) : (
              <>
              <Identicon size="sm" address={creator} className="mx-1"/>
              <span className={`text-uppercase text-white caption`}>
                {truncateAddress(creator)}
              </span>
              </>
            )}
          </div>
          <div className="col-4 d-flex gap-2">
            {status?.length
              ? status.map((st) => <PullRequestLabels {...st} />)
              : null}
          </div>
        </div>
        <div className="col d-flex flex-row gap-3 justify-content-end">
          {children}
        </div>
      </div>
    </Link>
  );
}

export default ItemRow;
