import { useState } from "react";

import { dehydrate } from "@tanstack/react-query";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next/types";

import BountyBody from "components/bounty/body/controller";
import BountyHero from "components/bounty/bounty-hero/controller";
import Comments from "components/bounty/comments/controller";
import FundingSection from "components/bounty/funding-section/controller";
import PageActions from "components/bounty/page-actions/controller";
import TabSections from "components/bounty/tabs-sections/controller";
import CustomContainer from "components/custom-container";
import If from "components/If";

import { useAppState } from "contexts/app-state";
import { BountyEffectsProvider } from "contexts/bounty-effects";

import { commentsParser, issueParser } from "helpers/issue";

import { IssueData } from "interfaces/issue-data";

import { getReactQueryClient } from "services/react-query";

import { getBountyData } from "x-hooks/api/bounty";
import { getCommentsData } from "x-hooks/api/comments";
import useReactQuery from "x-hooks/use-react-query";

export default function PageIssue() {
  const { query } = useRouter();

  const bountyId = query?.id;
  const bountyQueryKey = ["bounty", bountyId.toString()];
  const commentsQueryKey = ["bounty", "comments", bountyId.toString()];

  const { data: bounty, invalidate: invalidateBounty } = useReactQuery(bountyQueryKey, () => getBountyData(query));
  const { data: comments, invalidate: invalidateComments } = 
    useReactQuery(commentsQueryKey, () => getCommentsData({ issueId: bountyId, type: "issue" }));

  const parsedBounty = issueParser(bounty);
  const parsedComments = commentsParser(comments);

  const [isEditIssue, setIsEditIssue] = useState<boolean>(false);

  const { state } = useAppState();

  async function updateBountyData() {
    invalidateBounty();
    invalidateComments();
  }

  async function handleEditIssue() {
    setIsEditIssue(true);
  }

  function handleCancelEditIssue() {
    setIsEditIssue(false)
  }

  return (
    <BountyEffectsProvider currentBounty={bounty}>
      <BountyHero 
        currentBounty={parsedBounty}
        updateBountyData={updateBountyData}
        handleEditIssue={handleEditIssue}
        isEditIssue={isEditIssue}
      />
    
      <CustomContainer>
        <If condition={!!parsedBounty?.isFundingRequest}>
          <FundingSection 
            currentBounty={parsedBounty}
            updateBountyData={updateBountyData}
          /> 
        </If>

        <PageActions
          handleEditIssue={handleEditIssue}
          isEditIssue={isEditIssue}
          currentBounty={parsedBounty}
          updateBountyData={updateBountyData}
        />

        <If condition={!!state.currentUser?.walletAddress}>
          <TabSections currentBounty={parsedBounty} />
        </If>

        <BountyBody 
          currentBounty={parsedBounty}
          updateBountyData={updateBountyData}
          isEditIssue={isEditIssue} 
          cancelEditIssue={handleCancelEditIssue}
        />

        <Comments
          type="issue"
          updateData={updateBountyData}
          ids={{
            issueId: +parsedBounty?.id
          }}
          comments={parsedComments}
          currentUser={state.currentUser}
        />
      </CustomContainer>
    </BountyEffectsProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({query, locale}) => {
  const queryClient = getReactQueryClient();
  const bountyId = query.id;

  const bountyData = await getBountyData(query);

  await queryClient.setQueryData(["bounty", bountyId], bountyData);
  await queryClient.prefetchQuery(["bounty", "comments", bountyId], () => 
    getCommentsData({ issueId: bountyId, type: "issue" }));

  const seoData: Partial<IssueData> = {
    title: bountyData?.title,
    body: bountyData?.body,
    id: bountyData?.id
  };

  return {
    props: {
      seoData,
      dehydratedState: dehydrate(queryClient),
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "proposal",
        "deliverable",
        "connect-wallet-button",
        "funding"
      ]))
    }
  };
};
