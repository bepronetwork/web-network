import {GetServerSideProps, GetStaticProps} from 'next/types';
import React, { useContext, useEffect, useState } from 'react';
import IssueComments from '@components/issue-comments';
import IssueDescription from '@components/issue-description';
import IssueHero from '@components/issue-hero';
import PageActions from '@components/page-actions';
import IssueProposals from '@components/issue-proposals';
import { useRouter } from 'next/router';
import { BeproService } from '@services/bepro-service';
import { User } from '@interfaces/api-response';
import { ApplicationContext } from '@contexts/application';
import { IssueData } from '@interfaces/issue-data';
import { formatNumberToCurrency } from '@helpers/formatNumber';
import IssueProposalProgressBar from '@components/issue-proposal-progress-bar';
import useMergeData from '@x-hooks/use-merge-data';
import useRepos from '@x-hooks/use-repos';
import useOctokit from '@x-hooks/use-octokit';
import useApi from '@x-hooks/use-api';
import TabbedNavigation from '@components/tabbed-navigation';
import IssuePullRequests from '@components/issue-pull-requests';
import CustomContainer from '@components/custom-container';
import {getSession} from 'next-auth/react';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import Translation from '@components/translation';
import { useTranslation } from 'next-i18next';
import { IssueProvider, useIssue } from '@contexts/issue';

function PageIssue() {
  const router = useRouter();
  const { id, repoId } = router.query;
  const { state: { currentAddress, githubLogin }} = useContext(ApplicationContext);
  const {updateIssue, currentIssue: issue, networkIssue} = useIssue()
  
  const [isIssueinDraft, setIsIssueinDraft] = useState(false);
  const [commentsIssue, setCommentsIssue] = useState();
  const [forks, setForks] = useState();
  const [isRepoForked, setIsRepoForked] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [hasOpenPR, setHasOpenPR] = useState(false);
  const [mergedPullRequests, setMergedPullRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState<User>();
  const {getMergedDataFromPullRequests} = useMergeData();
  const { getForksOf, getUserRepos} = useOctokit();
  const [[activeRepo]] = useRepos();
  const {getUserOf, userHasPR} = useApi();
  const { t } = useTranslation('bounty')
  
  
  const tabs = [
    {
      eventKey: 'proposals',
      title: <Translation ns="proposal" label={'labelWithCount'} params={{count: networkIssue?.mergeProposalsAmount || 0}} />,
      isEmpty: !(networkIssue?.mergeProposalsAmount > 0),
      component: <IssueProposals
        key="tab-proposals"
        metaProposals={issue?.mergeProposals}
        metaRequests={issue?.pullRequests}
        numberProposals={networkIssue?.mergeProposalsAmount}
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


  const getCurrentUserMicroService = () => {
    if (currentAddress == currentUser?.address)
      return;

    getUserOf(currentAddress)
      .then((user: User) => setCurrentUser(user));
  };

  function getRepoForked() {
    if (!activeRepo || !githubLogin)
      return;

    if (!forks)
      getForksOf(activeRepo.githubPath).then((frk) =>{
          setForks(frk.data as any)
      });
      
    getUserRepos(githubLogin, activeRepo.githubPath.split(`/`)[1])
      .then((repo) => {
        setIsRepoForked(repo.data?.fork)
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

  useEffect(()=>{
    if(issue?.id !== id){
      updateIssue(`${repoId}`, `${id}`).then(issue=>{
        if (!issue)
            return router.push('/404')
      })
    }
  },[])
  useEffect(loadIssueData, [githubLogin, currentAddress, id, activeRepo]);
  useEffect(checkIsWorking, [issue, githubLogin])
  useEffect(loadMergedPullRequests, [issue, currentAddress])
  // useEffect(getsIssueMicroService, [activeRepo, reposList])
  // useEffect(getRepoForked, [issue, githubLogin])
  
  
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
        isIssueinDraft={isIssueinDraft}
        networkCID={networkIssue?.cid}
        issueId={issue?.issueId}
        title={issue?.title}
        description={issue?.body}
        handleBeproService={()=>{
          // getsIssueBeproService
        }}
        handleMicroService={()=>{
          // getsIssueMicroService
        }}
        pullRequests={issue?.pullRequests || []}
        mergeProposals={issue?.mergeProposals}
        amountIssue={networkIssue?.tokensStaked}
        forks={forks}
        githubLogin={currentUser?.githubLogin}
        hasOpenPR={hasOpenPR}
        isRepoForked={isRepoForked}
        isWorking={isWorking}
        issueCreator={networkIssue?.issueGenerator}
        repoPath={issue?.repository?.githubPath}
        githubId={issue?.githubId}
        addNewComment={addNewComment}
        finished={networkIssue?.recognizedAsFinished} />
        {((networkIssue?.mergeProposalsAmount > 0 || mergedPullRequests.length > 0) && currentAddress) && <CustomContainer className="mb-4">
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
                  isIssueinDraft={isIssueinDraft}
                  mergeProposalsAmount={networkIssue?.mergeProposalsAmount}
                  isFinished={networkIssue?.recognizedAsFinished}
                  isCanceled={
                    issue?.state === `canceled` || networkIssue?.canceled
                  }
                  creationDate={networkIssue?.creationDate}
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

export default () => (
  <IssueProvider>
    <PageIssue/>
  </IssueProvider>
)

export const getServerSideProps: GetServerSideProps = async ({query, locale}) => {
  const { id, repoId } = query;
  const {getIssue} = useApi()
  const currentIssue = await getIssue(repoId as string, id as string)

  return {
    props: {
      session: await getSession(),
      currentIssue,
      ...(await serverSideTranslations(locale, ['common', 'bounty', 'proposal', 'pull-request'])),
    },
  };
};
