import {GetServerSideProps, GetStaticProps} from 'next/types';
import React, {useContext, useEffect, useState} from 'react';
import IssueListItem from '@components/issue-list-item';
import Account from '@components/account';
import {ApplicationContext} from '@contexts/application';
import {IssueData} from '@interfaces/issue-data';
import NothingFound from '@components/nothing-found';
import Paginate from '@components/paginate';
import usePage from '@x-hooks/use-page';
import useCount from '@x-hooks/use-count';
import {useRouter} from 'next/router';
import Modal from '@components/modal';
import usePendingIssue from '@x-hooks/use-pending-issue';
import MarkedRender from '@components/MarkedRender';
import {formatNumberToCurrency,} from '@helpers/formatNumber';
import {toastError} from '@reducers/add-toast';
import useApi from '@x-hooks/use-api';
import useMergeData from '@x-hooks/use-merge-data';
import InternalLink from '@components/internal-link';
import { changeLoadState } from '@contexts/reducers/change-load-state';
import {getSession} from 'next-auth/react';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

export default function MyIssues() {

  const {dispatch, state: {beproInit, metaMaskWallet, currentAddress}} = useContext(ApplicationContext)
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [pendingIssues, setPendingIssues] = useState<IssueData[]>([]);
  const [pendingIssue, {updatePendingIssue, treatPendingIssue}] = usePendingIssue();
  const { t } = useTranslation(['common', 'bounty'])

  const page = usePage();
  const results = useCount();
  const router = useRouter();

  const {getUserOf} = useApi();
  const {getPendingFor, getIssues} = useMergeData();

  let issueChild;

  function getIssueList() {
    if (!currentAddress)
      return;

    dispatch(changeLoadState(true))

    getUserOf(currentAddress)
                      .then((user) => {
                        if (user)
                          return getIssues({creator: user?.githubLogin, page})
                                                   .then(({rows, count}) => {
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
                      .finally(() => {
                        dispatch(changeLoadState(false))
                      })
  }

  function getPendingIssues() {
    if (!currentAddress)
      return;

    getPendingFor(currentAddress).then(pending => setPendingIssues(pending.rows));
  }

  function createPendingIssue() {
    treatPendingIssue()
      .then(result => {
        if (!result)
          return dispatch(toastError(t('errors.failed-update-bounty')));

        updatePendingIssue(null);
        getIssueList();
        getPendingIssues();
      })
  }

  useEffect(getIssueList, [currentAddress, page])
  useEffect(getPendingIssues, [currentAddress])

  if (!beproInit || !metaMaskWallet)
    issueChild = (<div className="col-md-10">{!metaMaskWallet ? t('actions.connect-your-wallet') : t('misc.loading')}...</div>)
  else if (!issues.length)
    issueChild = (
      <div className="col-md-10">
        <div className="mt-4">
          <NothingFound
            description={t('bounty:errors.no-bounties')}>
            <InternalLink href="/create-bounty" label={String(t('actions.create-one'))} uppercase />
          </NothingFound>
        </div>
      </div>)
  else issueChild = <>
      {issues.map(issue => <div className="col-md-10" key={issue.issueId}><IssueListItem issue={issue}/></div>)}
      {issues?.length !== 0 && <Paginate count={results.count} onChange={(page) => router.push({pathname: `/account`, query: {page}})}/>}
    </>

  return (
    <Account>
      <div className="container p-footer">
        <div className="row justify-content-center">
          {pendingIssues?.length &&
          <div className="col-md-10">
            <h4 className="mb-4 text-capitalize">{`${t('bounty:status.pending')} ${t('bounty:label_other')}`}</h4>
            {pendingIssues.map(issue => <IssueListItem issue={issue} xClick={() => updatePendingIssue(issue)}/>)}
            <hr/>
            <Modal title={t('modals.set-bounty-draft.title')} show={!!pendingIssue}
                   centerTitle={true}
                   okLabel={t('actions.update')}
                   cancelLabel={t('actions.cancel')}
                   titlePosition="center"
                   className="max-height-body modal-md"
                   onOkClick={() => createPendingIssue()}
                   onCloseClick={() => updatePendingIssue(null)}>
              <h4 className="text-white mb-4">{pendingIssue?.title}</h4>
              <div className="bg-dark-gray p-3 rounded-4 height-body">
                <MarkedRender source={pendingIssue?.body} />
              </div>
              <div className="bg-dark-gray w-100 text-center mt-4 rounded-4 py-3">
                <div className="caption-small fs-smallest text-uppercase text-white">{t('misc.reward')}</div>
                <h4 className="mb-0 text-uppercase"><span className="text-white">{formatNumberToCurrency(pendingIssue?.amount)}</span> <span className="text-blue">{t('$bepro')}</span></h4>
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

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, ['common', 'bounty', 'pull-request'])),
    },
  };
};
