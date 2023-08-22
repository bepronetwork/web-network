import React, {useEffect, useState} from "react";

import { SSRConfig } from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";
import {GetServerSideProps} from "next/types";

import BountyBody from "components/bounty/body/controller";
import BountyHero from "components/bounty/bounty-hero/controller";
import Comments from "components/bounty/comments/controller";
import FundingSection from "components/bounty/funding-section/controller";
import PageActions from "components/bounty/page-actions/controller";
import TabSections from "components/bounty/tabs-sections/controller";
import CustomContainer from "components/custom-container";
import If from "components/If";

import {useAppState} from "contexts/app-state";
import { BountyEffectsProvider } from "contexts/bounty-effects";

import { commentsParser, issueParser } from "helpers/issue";

import { CurrentBounty } from "interfaces/application-state";
import { IssueData, IssueDataComment } from "interfaces/issue-data";

import { 
  getBountyData,
  getPullRequestsDetails
} from "x-hooks/api/bounty/get-bounty-data";
import getCommentsData from "x-hooks/api/comments/get-comments-data";
import useOctokit from "x-hooks/use-octokit";

interface PageBountyProps {
  bounty: {
    comments: IssueDataComment[];
    data: IssueData;
  }
  _nextI18Next?: SSRConfig;
}

export default function PageIssue({ bounty }: PageBountyProps) {
  const [currentBounty, setCurrentBounty] = useState<CurrentBounty>({
    data: issueParser(bounty?.data),
    comments: commentsParser(bounty?.comments),
    lastUpdated: 0,
  });
  const [isRepoForked, setIsRepoForked] = useState<boolean>();
  const [isEditIssue, setIsEditIssue] = useState<boolean>(false);

  const {state} = useAppState();
  const { getUserRepository } = useOctokit();
  const router = useRouter();

  const { id } = router.query;

  async function updateBountyData(updatePrData = false) {
    const bountyDatabase = await getBountyData(router.query)
    const commentsDatabase = await getCommentsData({ issueId: bountyDatabase?.id, type: 'issue' })

    if(updatePrData) {
      const pullRequests = await getPullRequestsDetails(bountyDatabase?.repository?.githubPath,
                                                        bountyDatabase?.pullRequests);
      setCurrentBounty({
        data: { ...issueParser(bountyDatabase), pullRequests},
        comments: commentsParser(commentsDatabase),
        lastUpdated: 0
      })
    } else {
      setCurrentBounty({
        data: { ...issueParser(bountyDatabase), pullRequests: currentBounty?.data?.pullRequests },
        comments: commentsParser(commentsDatabase),
        lastUpdated: 0
      })
    }
  }

  async function handleEditIssue() {
    setIsEditIssue(true);
  }

  function handleCancelEditIssue() {
    setIsEditIssue(false)
  }

  function checkForks(){
    if (!state.Service?.network?.repos?.active?.githubPath || isRepoForked !== undefined) return;

    if (bounty?.data?.working?.includes(state.currentUser?.login))
      return setIsRepoForked(true);

    const [, activeName] = state.Service.network.repos.active.githubPath.split("/");
  
    getUserRepository(state.currentUser?.login, activeName)
    .then(repository => {
      const { isFork, nameWithOwner, parent } = repository;

      setIsRepoForked(isFork && parent?.nameWithOwner === state.Service.network.repos.active.githubPath ||
        nameWithOwner.startsWith(`${state.currentUser?.login}/`));
    })
    .catch((e) => {
      setIsRepoForked(false);
      console.log("Failed to get users repositories: ", e);
    });
  }
  
  useEffect(() => {
    if (!state.currentUser?.login ||
        !state.currentUser?.walletAddress ||
        !state.Service?.network?.repos?.active ||
        !currentBounty?.data ||
        isRepoForked !== undefined) 
      return;
    checkForks();
  },[
    state.currentUser?.login, 
    currentBounty?.data?.working, 
    state.Service?.network?.repos?.active,
    !state.currentUser?.walletAddress
  ]);

  return (
    <BountyEffectsProvider currentBounty={bounty}>
      <BountyHero 
        currentBounty={currentBounty?.data}
        updateBountyData={updateBountyData}
        handleEditIssue={handleEditIssue}
        isEditIssue={isEditIssue}
      />
    
      <CustomContainer>
        <If condition={!!currentBounty?.data?.isFundingRequest}>
          <FundingSection 
            currentBounty={currentBounty?.data}
            updateBountyData={updateBountyData}
          /> 
        </If>

        <PageActions
          isRepoForked={!!isRepoForked}
          handleEditIssue={handleEditIssue}
          isEditIssue={isEditIssue}
          currentBounty={currentBounty?.data}
          updateBountyData={updateBountyData}
        />

        <If condition={!!state.currentUser?.walletAddress}>
          <TabSections currentBounty={currentBounty?.data} />
        </If>

        <BountyBody 
          currentBounty={currentBounty?.data}
          updateBountyData={updateBountyData}
          isEditIssue={isEditIssue} 
          cancelEditIssue={handleCancelEditIssue}
        />

        <Comments
          type="issue"
          updateData={updateBountyData}
          ids={{
            issueId: +currentBounty?.data?.id
          }}
          comments={currentBounty?.comments}
          currentUser={state.currentUser}
        />
      </CustomContainer>
    </BountyEffectsProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({query, locale}) => {
  const bountyDatabase = await getBountyData(query)

  const commentsDatabase = await getCommentsData({ issueId: bountyDatabase?.id, type: 'issue' })

  const pullRequestsDetails = await getPullRequestsDetails(bountyDatabase?.repository?.githubPath,
                                                           bountyDatabase?.pullRequests);
  
  const bounty = {
    comments: commentsDatabase,
    data: {...bountyDatabase, pullRequests: pullRequestsDetails}
  }
  
  const seoData: Partial<IssueData> = {
    title: bountyDatabase?.title,
    body: bountyDatabase?.body,
    issueId: bountyDatabase?.issueId
  }

  return {
    props: {
      seoData,
      bounty,
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "proposal",
        "pull-request",
        "connect-wallet-button",
        "funding"
      ]))
    }
  };
};
