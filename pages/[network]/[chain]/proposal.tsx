import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";

import ProposalPage from "components/pages/bounty/proposal/controller";

import { Logger } from "services/logging";

import { getPullRequestsDetails } from "x-hooks/api/bounty/get-bounty-data";
import getCommentsData from "x-hooks/api/comments/get-comments-data";
import getProposalData from "x-hooks/api/get-proposal-data";
import useOctokit from "x-hooks/use-octokit";

export default ProposalPage;

export const getServerSideProps: GetServerSideProps = async ({
  query,
  locale,
}) => {
  const proposal = await getProposalData({
    ...query,
    issueId: `${query?.repoId}/${query?.id}`,
  })
    .then(({ data }) => data)
    .catch(error => {
      Logger.error(error, "Failed to getProposalData");
      return undefined;
    });

  const proposalComments = await getCommentsData({ proposalId: proposal?.id?.toString() })

  const [pullRequestDetails, repositoryDetails] = await Promise.all([
    getPullRequestsDetails( proposal?.issue?.repository?.githubPath,
                            [proposal?.pullRequest])
    .then((data) => [...data].shift())
    .catch(error => {
      Logger.error(error, "Failed to getPullRequestsDetails from github");
      return undefined;
    }),
    useOctokit().getRepository(proposal?.issue?.repository?.githubPath)
      .then(data => data)
      .catch(error => {
        Logger.error(error, "Failed to getRepository details from github");
        return undefined;
      })
  ]);

  return {
    props: {
      proposal: {
        ...proposal,
        issue: {
          ...proposal?.issue,
          repository: {
            ...proposal?.issue?.repository,
            ...repositoryDetails
          }
        },
        pullRequest: {
          ...proposal?.pullRequest,
          ...pullRequestDetails,
        },
        comments: proposalComments
      },
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "proposal",
        "pull-request",
        "connect-wallet-button",
      ])),
    },
  };
};
