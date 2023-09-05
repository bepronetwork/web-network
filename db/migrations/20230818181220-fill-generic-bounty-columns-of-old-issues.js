'use strict';

const { default: BigNumber } = require("bignumber.js");
const { getAllFromTable } = require("../../helpers/db/rawQueries");
const { sendToIpfs } = require("../../helpers/db/ipfs");

module.exports = {
  async up (queryInterface, Sequelize) {
    const issues = await getAllFromTable(queryInterface, "issues");
    const users = await getAllFromTable(queryInterface, "users");
    const repositories = await getAllFromTable(queryInterface, "repositories");
    const networks = await getAllFromTable(queryInterface, "networks");

    let repository = null;
    let network = null;
    let user = null;

    const isSameAddress = (address, addressToCompare) => address?.toLowerCase() === addressToCompare?.toLowerCase();
    const findRepository = id => id !== repository?.id ? repositories.find(repo => repo.id === id) : repository;
    const findNetwork = id => id !== network?.id ? networks.find(repo => repo.id === id) : network;
    const findUser = address => !isSameAddress(address, user?.address) ? users.find(user => isSameAddress(user.address, address)) : user;

    const issuesWithGithubInfo = issues?.filter(issue => !!issue.issueId && issue.state !== "pending");
    for (const issue of issuesWithGithubInfo) {
      repository = findRepository(issue.repository_id);
      network = findNetwork(issue.network_id);
      user = findUser(issue.creatorAddress);

      const [owner, repo] = repository?.githubPath?.split("/");

      const originLink = `https://github.com/${owner}/${repo}/issues/${issue.githubId}`;

      const bountyJson = {
        name: issue.title,
        properties: {
          type: "github",
          origin: originLink,
          chainId: issue.chain_id,
          network: {
            name: network.name,
            address: network.networkAddress,
          },
          price: BigNumber.max(issue.amount, issue.fundingAmount).toString(),
          tags: issue.tags,
          kycNeeded: issue.isKyc
        }
      };

      const ipfsHash = await sendToIpfs(bountyJson, true);

      await queryInterface.bulkUpdate("issues", {
        type: "code",
        ipfsUrl: ipfsHash,
        origin: originLink,
        userId: user.id
      }, {
        id: issue.id
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkUpdate("issues", {
      type: null,
      ipfsUrl: null,
      origin: null,
      userId: null
    });
  }
};
