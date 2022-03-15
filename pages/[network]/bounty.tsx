import {GetServerSideProps} from 'next/types';
import React, { useContext, useEffect, useState } from 'react';
import IssueComments from 'components/issue-comments';
import IssueDescription from 'components/issue-description';
import BountyHero from 'components/bounty-hero';
import PageActions from 'components/page-actions';
import IssueProposals from 'components/issue-proposals';
import { useRouter } from 'next/router';
import { User } from '@interfaces/api-response';
import { ApplicationContext } from '@contexts/application';
import IssueProposalProgressBar from 'components/issue-proposal-progress-bar';
import useMergeData from 'x-hooks/use-merge-data';
import useOctokit from 'x-hooks/use-octokit';
import useApi from 'x-hooks/use-api';
import TabbedNavigation from 'components/tabbed-navigation';
import IssuePullRequests from 'components/issue-pull-requests';
import CustomContainer from 'components/custom-container';
import {getSession} from 'next-auth/react';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import Translation from 'components/translation';
import { useTranslation } from 'next-i18next';
import { useRepos } from '@contexts/repos';
import { useIssue } from '@contexts/issue';

export default function PageIssue() {
  const router = useRouter();
  const { id, repoId } = router.query;

  const [commentsIssue, setCommentsIssue] = useState();
  const [isRepoForked, setIsRepoForked] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [hasOpenPR, setHasOpenPR] = useState(false);
  const [mergedPullRequests, setMergedPullRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState<User>();
  
  const { state: { currentAddress, githubLogin }, } = useContext(ApplicationContext);
  const {activeRepo}= useRepos();
  const {activeIssue: issue, networkIssue, updateIssue, getNetworkIssue} = useIssue()
  const {getUserOf, userHasPR} = useApi();
  const {getMergedDataFromPullRequests} = useMergeData();
  const { getUserRepos} = useOctokit();
  const { t } = useTranslation('bounty')

  const tabs = [
    {
      eventKey: 'proposals',
      title: <Translation ns="proposal" label={'labelWithCount'} params={{count: +networkIssue?.mergeProposalAmount || 0}} />,
      isEmpty: !(networkIssue?.mergeProposalAmount > 0),
      component: <IssueProposals
        key="tab-proposals"
        issue={issue}
        networkIssue={networkIssue}
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


  const getCurrentUserMicroService = () => {
    if (currentAddress == currentUser?.address)
      return;

    getUserOf(currentAddress)
      .then((user: User) => setCurrentUser(user)).catch(console.log)
  };

  function getRepoForked() {
    if (!activeRepo || !githubLogin)
      return;

    getUserRepos(githubLogin, activeRepo.githubPath.split(`/`)[1])
      .then(({data}) => {
        const isFokerd = data?.fork || data.owner.login === githubLogin
        setIsRepoForked(isFokerd)
      }).catch(e => {
        console.log(`Failed to get users repositories: `, e)
      })

    userHasPR(`${repoId}/${id}`, githubLogin)
      .then((result) => {
        setHasOpenPR(!!result)
      })
      .catch(e => {console.log(`Failed to list PRs`, e)});
  }

  function loadIssueData() {
    if (currentAddress && id) {
      getCurrentUserMicroService();
    } 

    if (githubLogin && activeRepo) getRepoForked();
  }

  function addNewComment(comment) {
    setCommentsIssue([...(commentsIssue as any), comment] as any)
  }

  function checkIsWorking() {
    if (issue?.working && githubLogin)
      setIsWorking(issue.working.some(el => el === githubLogin))
  }

  function loadMergedPullRequests() {
    if (issue && currentAddress)
      getMergedDataFromPullRequests(issue.repository?.githubPath, issue.pullRequests).then(setMergedPullRequests)
  }

  function syncLocalyState(){
    if(issue?.comments)
      setCommentsIssue([...issue?.comments] as any)
  }

  function refreshIssue(){
    updateIssue(`${issue.repository_id}`, issue.githubId)
    .catch(()=> router.push('/404'))
  }

  useEffect(syncLocalyState,[issue, activeRepo])
  useEffect(loadIssueData, [githubLogin, currentAddress, id, issue, activeRepo]);
  useEffect(checkIsWorking, [issue, githubLogin])
  useEffect(loadMergedPullRequests, [issue, currentAddress])

  return (
    <>
      <BountyHero/>
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
        githubLogin={currentUser?.githubLogin}
        hasOpenPR={hasOpenPR}
        isRepoForked={isRepoForked}
        isWorking={isWorking}
        issueCreator={networkIssue?.issueGenerator}
        repoPath={issue?.repository?.githubPath}
        githubId={issue?.githubId}
        addNewComment={addNewComment}
        finished={networkIssue?.recognizedAsFinished} />
        {((networkIssue?.mergeProposalAmount > 0 || mergedPullRequests.length > 0) && currentAddress) && <CustomContainer className="mb-4">
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
        <CustomContainer>
          <IssueDescription description={issue?.body || ''} />
        </CustomContainer>
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
      session: await getSession(),
      currentIssue,
      ...(await serverSideTranslations(locale, ['common', 'bounty', 'proposal', 'pull-request'])),
    },
  };
};
