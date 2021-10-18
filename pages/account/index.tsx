import { GetStaticProps } from 'next/types';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import IssueListItem from '@components/issue-list-item';
import GithubMicroService from '@services/github-microservice';
import Account from '@components/account';
import { ApplicationContext } from '@contexts/application';
import { IssueData } from '@interfaces/issue-data';
import NothingFound from '@components/nothing-found';
import Button from '@components/button';
import Paginate from '@components/paginate';
import usePage from '@x-hooks/use-page';
import useCount from '@x-hooks/use-count';
import { useRouter } from 'next/router';

import Modal from '@components/modal';
import usePendingIssue from '@x-hooks/use-pending-issue';
import MarkedRender from '@components/MarkedRender';
import { formatNumberToCurrency, formatNumberToNScale, formatNumberToString } from '@helpers/formatNumber';
import { toastError } from '@reducers/add-toast';

export default function MyIssues() {

  const { dispatch, state: { beproInit, metaMaskWallet, currentAddress } } = useContext(ApplicationContext)
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [pendingIssues, setPendingIssues] = useState<IssueData[]>([]);
  const [pendingIssue, { updatePendingIssue, treatPendingIssue }] = usePendingIssue();

  const page = usePage();
  const results = useCount();
  const router = useRouter();

  let issueChild;

  function getIssueList() {
    if (!currentAddress)
      return;

    GithubMicroService.getUserOf(currentAddress)
      .then((user) => {
        if (user)
          return GithubMicroService.getIssuesByGhLogin(user?.githubLogin, page)
            .then(({ rows, count }) => {
              results.setCount(count);
              return rows
            })
            .catch(e => {
              if (e.status === 404)
                return [];
              console.error(`Failed fetching issues`, e);
              return [];
            });
        else return [];
      })
      .then(setIssues)
  }

  function getPendingIssues() {
    if (!currentAddress)
      return;

    GithubMicroService.getPendingIssuesOf(currentAddress).then(setPendingIssues);
  }

  function createPendingIssue() {
    treatPendingIssue()
      .then(result => {
        if (!result)
          return dispatch(toastError(`Failed to update issue`));

        updatePendingIssue(null);
        getIssueList();
        getPendingIssues();
      })
  }

  useEffect(getIssueList, [currentAddress, page])
  useEffect(getPendingIssues, [currentAddress])

  if (!beproInit || !metaMaskWallet)
    issueChild = (<div className="col-md-10">{!metaMaskWallet ? `Connect your wallet` : `Loading`}...</div>)
  else if (!issues.length)
    issueChild = (
      <div className="col-md-10">
        <div className="mt-4">
          <NothingFound
            description="No issues">
            <Link href="/create-issue" passHref>
              <Button>
                create one
              </Button>
            </Link>
          </NothingFound>
        </div>
      </div>)
  else issueChild = <>
    {issues.map(issue => <div className="col-md-10" key={issue.issueId}><IssueListItem issue={issue} /></div>)}
    {issues.length !== 0 && <Paginate count={results.count} onChange={(page) => router.push({ pathname: `/account`, query: { page } })} />}
  </>

  return (
    <Account buttonPrimaryActive={true}>
      <div className="container p-footer">
        <div className="row justify-content-center">
          {pendingIssues.length &&
            <div className="col-md-10">
              <div className="h4 mb-4">Pending issues</div>
              {pendingIssues.map(issue => <IssueListItem issue={issue} xClick={() => updatePendingIssue(issue)} />)}
              <hr />
              <Modal title="Set issue as draft" show={!!pendingIssue}
                centerTitle={true}
                okLabel="update"
                cancelLabel="cancel"
                className="max-height-body modal-md"
                onOkClick={() => createPendingIssue()}
                onCloseClick={() => updatePendingIssue(null)}>
                <div className="h4 text-white mb-4">{pendingIssue?.title}</div>
                <div className="bg-dark-gray p-3 rounded-4 height-body">
                  <MarkedRender source={pendingIssue?.body} />
                </div>
                <div className="bg-dark-gray w-100 text-center mt-4 rounded-4 py-3">
                  <div className="smallCaption fs-smallest text-uppercase text-white">reward</div>
                  <div className="h4 mb-0 text-uppercase"><span className="text-white">{formatNumberToCurrency(pendingIssue?.amount)}</span> <span className="text-blue">$BEPRO</span></div>
                </div>
              </Modal>
            </div> || ``
          }
          {issueChild}
        </div>
      </div>
    </Account>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
