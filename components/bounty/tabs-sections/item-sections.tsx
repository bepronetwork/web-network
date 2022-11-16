
import React from "react";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { UrlObject } from "url";

import Avatar from "components/avatar";
import Button from "components/button";
import NothingFound from "components/nothing-found";
import ProposalProgressSmall from "components/proposal-progress-small";
import PullRequestLabels,{PRLabel} from "components/pull-request-labels";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import Translation from "components/translation";

import { pullRequest } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

import { useNetwork } from "x-hooks/use-network";

interface ItemProps {
  data: Proposal[] | pullRequest[],
  isProposal: boolean,
}

interface ItemRowProps {
  id: string | number,
  githubLogin: string,
  status?: PRLabel[],
  children?: React.ReactNode;
  href?: UrlObject | string;
}

function ItemRow({ id, githubLogin, status, children, href }: ItemRowProps) {
  return (
    <Link
      passHref
      key={`${id}`}
      href={href || '#'}
    >
      <div className={`d-flex flex-row p-20 border-radius-8 bg-gray-850 align-items-center ${href ? "cursor-pointer" : ""}`}>
        <div className="flex-grow-1 d-flex flex-row align-items-center gap-3">
          <div className="col-1">
            <span className="label-m text-gray-500">#{id}</span>
          </div>
          <div className="col-md-4 col-3 d-flex align-items-center gap-2">
            <Avatar userLogin={githubLogin} />
            <span className="text-uppercase text-white caption">{githubLogin}</span>
          </div>
          <div className="col-4 d-flex gap-2">
            {status?.length ? status.map((st) => (
              <PullRequestLabels label={st}
              />
            )) : null}
          </div>
        </div>
        <div className="flex-grow-1 d-flex flex-row gap-3 justify-content-end">
          {children}
        </div>
      </div>
    </Link>

  )
}

function ItemSections({ data, isProposal }: ItemProps) {
  const { t } = useTranslation(["proposal", "pullrequest"]);
  const router = useRouter();
  const { getURLWithNetwork } = useNetwork();

  return (
    <section className="content-wrapper border-top-0 p-20 d-flex flex-column gap-2">
      {
        data.length ?
          React.Children.toArray(data.map((item) => {
            const asProposal = isProposal || (item as Proposal).scMergeId
            const pathRedirect = isProposal ? '/proposal' : '/pull-request';
            const redirect = getURLWithNetwork(pathRedirect, {})
            return (
              <ItemRow id={item?.id} href={redirect} githubLogin={item?.githubLogin} status={['merged']}>
                {asProposal ? (
                  <>
                    <div className="d-flex align-items-center text-center">
                      <ProposalProgressSmall
                        pgClass={`text-success`}
                        value={BigNumber(0)}
                        total={BigNumber(32144)}
                        textClass={`pb-2 text-success`}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="d-flex align-items-center text-center">
                      <span className="label-m text-white">{(item as pullRequest).reviewers.length || 0}</span>

                      <span className="label-m text-uppercase text-gray-500 ml-1">
                        <Translation
                          ns="pull-request"
                          label="review"
                          params={{ count: (item as pullRequest).reviewers.length || 0 }}
                        />
                      </span>
                    </div>
                  </>
                )}

                <ReadOnlyButtonWrapper>
                  <Button
                    className="read-only-button"
                    onClick={(ev) => {
                      ev.preventDefault();
                      router.push?.(pathRedirect, {})
                    }}
                  >
                    <span className="label-m text-white">
                      <Translation label={asProposal ? "actions.view-proposal" : "actions.review"} />
                    </span>
                  </Button>
                </ReadOnlyButtonWrapper>
              </ItemRow>
            )
          }))
          : <NothingFound description={t("errors.not-found")} />
      }
    </section>
  )
}
export default ItemSections;