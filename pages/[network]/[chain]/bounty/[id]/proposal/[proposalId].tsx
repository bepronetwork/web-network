import { dehydrate } from "@tanstack/react-query";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";

import ProposalPage from "components/pages/bounty/proposal/controller";

import { getReactQueryClient } from "services/react-query";

import { getCommentsData } from "x-hooks/api/comments";
import { getProposalData } from "x-hooks/api/proposal";

export default ProposalPage;

export const getServerSideProps: GetServerSideProps = async ({
  query,
  locale,
}) => {
  const queryClient = getReactQueryClient();
  const proposalId = query.proposalId?.toString();

  await queryClient.prefetchQuery(["proposal", proposalId], () => getProposalData(query));
  await queryClient.prefetchQuery(["proposal", "comments", proposalId], () => getCommentsData({ proposalId }));

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "proposal",
        "deliverable",
        "connect-wallet-button",
      ])),
    },
  };
};
