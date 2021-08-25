import { GetStaticProps } from "next/types";
import React, { useContext, useEffect, useState } from "react";
import PageActions from "@components/page-actions";
import ProposalAddresses from "@components/proposal-addresses";
import ProposalHero from "@components/proposal-hero";
import ProposalProgress from "@components/proposal-progress";
import { useRouter } from "next/router";
import { ApplicationContext } from "@contexts/application";
import { BeproService } from "@services/bepro-service";
import GithubMicroService, {
  ProposalMicroService,
  User,
} from "@services/github-microservice";
import { toNumber } from "lodash";
import { formatDate } from "@helpers/formatDate";
import { handlePercentage } from "@helpers/handlePercentage";
import { IssueData } from "@interfaces/issue-data";

interface ProposalBepro {
  disputes: string;
  prAddresses: string[];
  prAmounts: number[];
  proposalAddress: string;
  votes: string;
  _id: string;
  isDisputed?: boolean;
  author?: string;
}

interface usersAddresses {
  address: string;
  githubLogin: string;
  oracles: string;
  percentage: number;
}

export default function PageProposal() {
  const router = useRouter();
  const { id, issueId } = router.query;
  const {
    state: { currentAddress },
  } = useContext(ApplicationContext);

  const [proposalBepro, setProposalBepro] = useState<ProposalBepro>();
  const [proposalMicroService, setProposalMicroService] =
    useState<ProposalMicroService>();
  const [amountIssue, setAmountIssue] = useState<string>();
  const [usersAddresses, setUsersAddresses] = useState<usersAddresses[]>();
  const [issueMicroService, setIssueMicroService] = useState<IssueData>();

  const getsProposalMicroService = () => {
    GithubMicroService.getMergeProposalIssue(
      issueId,
      (toNumber(id) + 1).toString()
    )
      .then((mergeProposal: ProposalMicroService) => {
        setProposalMicroService(mergeProposal);
      })
      .catch((err) => console.log("err microService", err));

    GithubMicroService.getIssueId(issueId).then(
      (issueMicroservice: IssueData) => setIssueMicroService(issueMicroservice)
    );
  };

  const getsProposalBeproService = () => {
    BeproService.network
      .getMergeById({
        issue_id: issueId,
        merge_id: id,
      })
      .then((merge: ProposalBepro) => {
        BeproService.network
          .isMergeDisputed({
            issueId: issueId,
            mergeId: id,
          })
          .then((isMergeDisputed: boolean) => {
            GithubMicroService.getUserOf(merge.proposalAddress).then(
              (handle: User) => {
                setProposalBepro({
                  ...merge,
                  isDisputed: isMergeDisputed,
                  author: handle?.githubLogin,
                });
              }
            );
          });
      })
      .catch((err) => console.log("err is merge disputed", err));
  };

  const getIssueBepro = () => {
    BeproService.network
      .getIssueById({
        issueId: id,
      })
      .then((networkIssue: { tokensStaked: string }) =>
        setAmountIssue(networkIssue.tokensStaked)
      );
  };

  const getUsersAddresses = () => {
    if (proposalBepro?.prAddresses.length === proposalBepro?.prAmounts.length) {
      const userAddress = [];
      proposalBepro?.prAddresses.map((item, index) => {
        GithubMicroService.getUserOf(item).then((handle: User) => {
          userAddress.push({
            githubLogin: handle.githubLogin,
            percentage: handlePercentage(
              toNumber(proposalBepro?.prAmounts[index]),
              toNumber(amountIssue)
            ),
            address: item,
            oracles: proposalBepro?.prAmounts[index],
          });
          if (proposalBepro?.prAddresses.length === userAddress.length)
            setUsersAddresses(userAddress);
        });
      });
    }
  };

  const gets = () => {
    if (currentAddress && id && issueId) {
      getsProposalMicroService();
      getsProposalBeproService();
      getIssueBepro();
    } else if (issueId) {
      router.push({
        pathname: "/issue",
        query: { id: issueId },
      });
    } else {
      router.push({
        pathname: "/",
      });
    }
  };
  useEffect(gets, [currentAddress, id, issueId]);

  useEffect(getUsersAddresses, [proposalBepro]);

  return (
    <>
      <ProposalHero
        githubId={issueMicroService?.githubId}
        title={issueMicroService?.title}
        pullRequestId={proposalMicroService?.pullRequest.githubId}
        authorPullRequest={proposalBepro?.author}
        createdAt={
          proposalMicroService && formatDate(proposalMicroService.createdAt)
        }
        beproStaked={amountIssue}
      />
      <ProposalProgress developers={usersAddresses} />
      {issueId && id && (
        <PageActions
          state={"pull request"}
          developers={[]}
          finalized={false}
          isIssueinDraft={false}
          addressNetwork={"0xE1Zr7u"}
          issueId={issueId.toString()}
          mergeId={id.toString()}
          handleBeproService={getsProposalBeproService}
          isDisputed={proposalBepro?.isDisputed}
          UrlGithub={`https://github.com/bepronetwork/bepro-js-edge/pull/${proposalMicroService?.pullRequest.githubId}`}
        />
      )}

      <ProposalAddresses addresses={usersAddresses}></ProposalAddresses>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
