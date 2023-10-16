import { GetServerSideProps } from "next/types";

import { getBountyData } from "x-hooks/api/bounty";

export default () => null;

export const getServerSideProps: GetServerSideProps = async ({
  query
}) => {
  const bountyDatabase = await getBountyData(query);

  if (bountyDatabase) {
    const { network, id} = bountyDatabase;

    return {
      redirect: {
        destination: `${network?.chain?.chainShortName}/bounty/${id}`,
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