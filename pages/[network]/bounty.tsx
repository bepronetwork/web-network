import { GetServerSideProps } from "next/types";

import { getBountyData } from "x-hooks/api/bounty/get-bounty-data";

export default () => null;

export const getServerSideProps: GetServerSideProps = async ({
  query
}) => {
  const bountyDatabase = await getBountyData(query);

  if (bountyDatabase) {
    const { network, repository_id, githubId } = bountyDatabase;

    return {
      redirect: {
        destination: `${network?.chain?.chainShortName}/bounty?id=${githubId}&repoId=${repository_id}`,
        permanent: false,
      },
    };
  }

  return {
    redirect: {
        destination: '/'
    },
    props: {}
  };
};