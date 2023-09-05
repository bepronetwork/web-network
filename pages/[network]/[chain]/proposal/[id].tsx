import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";

import ProposalPage from "components/pages/bounty/proposal/controller";

import { Logger } from "services/logging";

import getCommentsData from "x-hooks/api/comments/get-comments-data";
import getProposalData from "x-hooks/api/get-proposal-data";

export default ProposalPage;

export const getServerSideProps: GetServerSideProps = async ({
  query,
  locale,
}) => {
  const proposal = await getProposalData(query)
    .then(({ data }) => data)
    .catch(error => {
      Logger.error(error, "Failed to getProposalData");
      return undefined;
    });

  const proposalComments = await getCommentsData({ proposalId: proposal?.id?.toString() })

  return {
    props: {
      proposal: {
        ...proposal,
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
