import { GetStaticProps } from 'next/types';
import React from 'react';
import PageActions from '@components/page-actions';
import ProposalAddresses from '@components/proposal-addresses';
import ProposalHero from '@components/proposal-hero';
import ProposalProgress from '@components/proposal-progress';

export default function PageProposal() {
  return (
    <>
      <ProposalHero
        githubId={"7"}
        title={
          "Remove all getContract functions from Application and instead calling the Object directly"
        }
        pullRequestId={"32"}
        authorPullRequest={"@asantos"}
        createdAt={"Created 1 hour ago"}
        beproStaked={"10k"}
      />
      <ProposalProgress
        developers={[
          {
            value: "25",
            user: {
              id: 1,
              login: "DevOne",
              avatar_url: "https://img.pizza/28/28",
            },
          },
          {
            value: "25",
            user: {
              id: 2,
              login: "DevTwo",
              avatar_url: "https://img.pizza/28/28",
            },
          },
          {
            value: "50",
            user: {
              id: 3,
              login: "DevThree",
              avatar_url: "https://img.pizza/28/28",
            },
          },
        ]}
      />
      <PageActions
        state={"pull request"}
        developers={[]}
        finalized={false}
        isIssueinDraft={false}
        userAddress={"0xE1Zr7u"}
        addressNetwork={"0xE1Zr7u"}
        issueId={"10"}
        UrlGithub={"https://github.com/bepronetwork/web-network"}
      />
      <ProposalAddresses
        addresses={[
          {
            address: "0xE1Zr7u",
            oracles: 150,
          },
          {
            address: "0xdsfsdgyu",
            oracles: 250,
          },
          {
            address: "5faeEaoyTYu",
            oracles: 545,
          },
        ]}
      ></ProposalAddresses>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
