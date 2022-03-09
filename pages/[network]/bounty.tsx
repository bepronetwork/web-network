import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next/types';
import React, { useEffect, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import IssueHero from '@components/issue-hero';
import Translation from '@components/translation';
import PageActions from '@components/page-actions';
import IssueComments from '@components/issue-comments';
import IssueProposals from '@components/issue-proposals';
import CustomContainer from '@components/custom-container';
import TabbedNavigation from '@components/tabbed-navigation';
import IssueDescription from '@components/issue-description';
import IssuePullRequests from '@components/issue-pull-requests';
import IssueProposalProgressBar from '@components/issue-proposal-progress-bar';

import { useRepos } from '@contexts/repos';
import { useIssue } from '@contexts/issue';
import { useAuthentication } from '@contexts/authentication';

import { formatNumberToCurrency } from '@helpers/formatNumber';

import useApi from '@x-hooks/use-api';
import useOctokit from '@x-hooks/use-octokit';
import useMergeData from '@x-hooks/use-merge-data';

export default function PageIssue() {
  const router = useRouter();
  const { t } = useTranslation('bounty')
  
  const [isWorking, setIsWorking] = useState(false);
  const [hasOpenPR, setHasOpenPR] = useState(false);
  const [commentsIssue, setCommentsIssue] = useState();
  const [isRepoForked, setIsRepoForked] = useState(false);
  const [mergedPullRequests, setMergedPullRequests] = useState([]);
  
  const { wallet, user } = useAuthentication()
  
  const { activeRepo }= useRepos();
  const { getUserRepos} = useOctokit();
  const { userHasPR } = useApi();
  const { getMergedDataFromPullRequests } = useMergeData();
  const { activeIssue: issue, networkIssue, updateIssue, getNetworkIssue } = useIssue()

  const { id, repoId } = router.query;

  const tabs = [
    {
      eventKey: 'proposals',
      title: <Translation ns="proposal" label={'labelWithCount'} params={{count: +networkIssue?.mergeProposalAmount || 0}} />,
      isEmpty: !(networkIssue?.mergeProposalAmount > 0),
      component: <IssueProposals
        key="tab-proposals"
        metaProposals={issue?.mergeProposals}
        metaRequests={issue?.pullRequests}
        numberProposals={networkIssue?.mergeProposalAmount}
        issueId={issue?.issueId}
        dbId={issue?.id}
        amount={networkIssue?.tokensStaked}
        isFinalized={networkIssue?.finalized}
        mergedProposal={issue?.merged}
        className="border-top-0"
      />,
      description: t('description_proposal')
    },
    {
      eventKey: 'pull-requests',
      isEmpty: !(mergedPullRequests.length > 0),
      title: <Translation ns="pull-request" label={'labelWithCount'} params={{count: mergedPullRequests.length || 0}} />,
      component: <IssuePullRequests key="tab-pull-requests" repositoryPath={issue?.repository?.githubPath} className="border-top-0" repoId={issue?.repository_id} issueId={issue?.issueId} pullResquests={mergedPullRequests} />,
      description: t('description_pull-request')
    }
  ]

  function getDefaultActiveTab() {
    return  tabs.find(tab => tab.isEmpty === false)?.eventKey
  }

  function getRepoForked() {
    if (!activeRepo || !user?.login)
      return;

    getUserRepos(user?.login, activeRepo.githubPath.split(`/`)[1])
      .then(({data}) => {
        const isFokerd = data?.fork || data.owner.login === user?.login
        setIsRepoForked(isFokerd)
      }).catch(e => {
        console.log(`Failed to get users repositories: `, e)
      })

    userHasPR(`${repoId}/${id}`, user?.login)
      .then((result) => {
        setHasOpenPR(!!result)
      })
      .catch(e => {console.log(`Failed to list PRs`, e)});
  }

  function loadIssueData() {
    if (user?.login && activeRepo) getRepoForked();
  }

  function addNewComment(comment) {
    setCommentsIssue([...(commentsIssue as any), comment] as any)
  }

  function checkIsWorking() {
    if (issue?.working && user?.login)
      setIsWorking(issue.working.some(el => el === user?.login))
  }

  function loadMergedPullRequests() {
    if (issue && wallet?.address)
      getMergedDataFromPullRequests(issue.repository?.githubPath, issue.pullRequests).then(setMergedPullRequests)
  }

  function syncLocalyState(){
    if(issue?.comments)
      setCommentsIssue([...issue?.comments] as any)
  }

  function refreshIssue(){
    updateIssue(`${issue.repository_id}`, issue.githubId)
    .catch((e)=> router.push('/404'))
  }

  useEffect(syncLocalyState,[issue, activeRepo])
  useEffect(checkIsWorking, [issue, user?.login])
  useEffect(loadMergedPullRequests, [issue, wallet?.address])
  useEffect(loadIssueData, [user?.login, wallet?.address, id, issue, activeRepo])

  return (
    <>
      <IssueHero
        amount={formatNumberToCurrency(issue?.amount || networkIssue?.tokensStaked)}
        state={issue?.state}
        issue={issue} />
      <PageActions
        state={issue?.state}
        developers={issue?.developers}
        finalized={networkIssue?.finalized}
        isIssueinDraft={networkIssue?.isDraft}
        networkCID={networkIssue?.cid || issue?.issueId}
        issueId={issue?.issueId}
        title={issue?.title}
        description={issue?.body}
        handleBeproService={getNetworkIssue}
        handleMicroService={refreshIssue}
        pullRequests={issue?.pullRequests || []}
        mergeProposals={issue?.mergeProposals}
        amountIssue={networkIssue?.tokensStaked}
        forks={activeRepo?.forks}
        githubLogin={user?.login}
        hasOpenPR={hasOpenPR}
        isRepoForked={isRepoForked}
        isWorking={isWorking}
        issueCreator={networkIssue?.issueGenerator}
        repoPath={issue?.repository?.githubPath}
        githubId={issue?.githubId}
        addNewComment={addNewComment}
        finished={networkIssue?.recognizedAsFinished} />
        {((networkIssue?.mergeProposalAmount > 0 || mergedPullRequests.length > 0) && wallet?.address) && <CustomContainer className="mb-4">
          <TabbedNavigation defaultActiveKey={getDefaultActiveTab()} className="issue-tabs" tabs={tabs} collapsable />
        </CustomContainer>}
        {networkIssue ? (
        <div className="container mb-1">
          <div className="d-flex bd-highlight justify-content-center mx-2 px-4">
            <div className="ps-3 pe-0 ms-0 me-2 w-65 bd-highlight">
              <div className="container">
                <IssueDescription description={issue?.body || ''} />
              </div>
            </div>
            <div className="p-0 me-3 flex-shrink-0 w-25 bd-highlight">
              <div className="sticky-bounty">
                <IssueProposalProgressBar
                  isFinalized={networkIssue?.finalized}
                  isIssueinDraft={networkIssue.isDraft}
                  mergeProposalAmount={networkIssue?.mergeProposalAmount}
                  isFinished={networkIssue?.recognizedAsFinished}
                  isCanceled={
                    issue?.state === `canceled` || networkIssue?.canceled
                  }
                  creationDate={networkIssue.creationDate}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10">
              <IssueDescription description={issue?.body || ''} />
            </div>
          </div>
        </div>
      )}
      <IssueComments comments={commentsIssue} repo={issue?.repository?.githubPath} issueId={id} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({query, locale}) => {
  const { id, repoId, network } = query;
  const {getIssue} = useApi()
  const currentIssue = await getIssue(repoId as string, id as string, network as string)

  return {
    props: {
      currentIssue,
      ...(await serverSideTranslations(locale, ['common', 'bounty', 'proposal', 'pull-request'])),
    },
  };
};
