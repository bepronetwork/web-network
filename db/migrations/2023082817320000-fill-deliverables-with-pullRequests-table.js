const { Web3Connection, Network_v2 } = require("@taikai/dappkit");
const { Octokit } = require("octokit");
const { getAllFromTable } = require("../../helpers/db/rawQueries");
const { ipfsAdd } = require("../../helpers/db/ipfsAdd");
const { QueryTypes } = require("sequelize");

const { NEXT_GH_TOKEN, NEXT_PUBLIC_HOME_URL } = process.env;

async function up(queryInterface, Sequelize) {
  const pullRequests = await getAllFromTable(queryInterface, "pull_requests");

  const openIssues = await queryInterface.sequelize.query(
    `
    SELECT * FROM issues
    WHERE state <> 'pending'
    `,
    {
      type: QueryTypes.SELECT,
    }
  );

  if (!pullRequests?.length) return;

  const repositories = await getAllFromTable(queryInterface, "repositories");
  const networks = await getAllFromTable(queryInterface, "networks");
  const chains = await getAllFromTable(queryInterface, "chains");
  const users = await getAllFromTable(queryInterface, "users");
  const settings = await getAllFromTable(queryInterface, "settings");
  const ipfsUrl = settings.find(({ key }) => key === "ipfs");

  const octokit = new Octokit({
    auth: NEXT_GH_TOKEN,
  });

  try {
    for (const chain of chains) {
      const web3Connection = new Web3Connection({
        skipWindowAssignment: true,
        web3Host: chain.chainRpc,
      });

      await web3Connection.start();
      for (const network of networks.filter(
        ({ chain_id }) => chain.chainId === chain_id
      )) {
        const networkV2 = new Network_v2(web3Connection, network.networkAddress);

        await networkV2.loadContract();

        for (const issue of openIssues.filter(({ network_id }) => network_id === network.id)) { 
          const bounty = await networkV2.getBounty(issue?.contractId);

          for (const pullRequest of pullRequests.filter(({ issueId }) => issueId === issue.id)) {
            if (!bounty?.pullRequests || !pullRequest?.contractId) continue;

            const currentPrContract = bounty?.pullRequests?.find(({id}) => id === pullRequest.contractId)

            const user = users.find(
              ({ address, githubLogin }) =>
                address?.toLowerCase() === pullRequest?.userAddress?.toLowerCase() ||
                githubLogin?.toLowerCase() === pullRequest?.githubLogin?.toLowerCase()
            );
            const repository = repositories.find(
              ({ id }) => id === issue.repository_id
            );

            const [owner, repo] = repository?.githubPath?.split("/");

            const { data: pullRequestGithub } = await octokit.rest.pulls.get({
              owner,
              repo,
              pull_number: pullRequest.githubId,
            });
      
            const ipfsObject = {
              name: "BEPRO Deliverable",
              description: pullRequestGithub.body,
              properties: {
                title: pullRequestGithub.title,
                deliverableUrl: pullRequestGithub.html_url,
                bountyUrl: `${NEXT_PUBLIC_HOME_URL}/${network.name}/${chain.chainShortName}/bounty/${issue.id}`,
              },
            };
      
            const { hash } = await ipfsAdd(ipfsObject, true);
      
            const ipfsLink = `${ipfsUrl.value}/${hash}`;
      
            if (!hash) throw new TypeError(`error adding deliverable to ipfs`);
      
            await queryInterface.bulkInsert("deliverables", [
              {
                deliverableUrl: pullRequestGithub.html_url,
                ipfsLink,
                title: pullRequestGithub.title,
                description: pullRequestGithub.body,
                canceled: !!currentPrContract?.canceled,
                markedReadyForReview: !!currentPrContract?.ready,
                accepted: pullRequestGithub.merged ? true : false,
                issueId: issue.id,
                bountyId: issue.contractId,
                prContractId: pullRequest.contractId,
                userId: user?.id,
                createdAt: pullRequest.createdAt,
                updatedAt: pullRequest.updatedAt,
              },
            ]);
          }

        }
      }
    }

  } catch (error) {
    console.log(
      "Failed to fill deliverables from pull requests",
      error.toString()
    );
    throw error;
  }
}

module.exports = { up, down: async () => true };
