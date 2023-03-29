'use strict';

const { QueryTypes } = require("sequelize");

const { loadNetworkV2, getDAO } = require("../../helpers/db/dao");
const { getAllFromTable, getTokenByAddressAndChainId } = require("../../helpers/db/rawQueries");

const {
  NEXT_PUBLIC_WEB3_CONNECTION: defaultRpc
} = process.env;

module.exports = {
  async up (queryInterface, Sequelize) {
    const networks = await getAllFromTable(queryInterface, "networks");

    if (!networks.length) return;

    const { web3Connection } = await getDAO({
      web3Host: defaultRpc
    });

    for (const network of networks) {
      const issues = await queryInterface.sequelize.query(`SELECT * FROM issues WHERE "network_id" = $network_id AND "fundingAmount" IS NOT NULL AND "fundingAmount" <> '0'`, {
        bind: {
          network_id: network.id
        },
        type: QueryTypes.SELECT
      });

      if (!issues.length) continue;

      const networkV2 = await loadNetworkV2(web3Connection, network.networkAddress);

      for (const issue of issues) {
        const bounty = await networkV2.getBounty(issue.contractId);

        const [rewardToken] = await getTokenByAddressAndChainId(queryInterface, bounty.rewardToken, network.chain_id);

        await queryInterface.bulkUpdate("issues", {
          rewardTokenId: rewardToken.id,
          rewardAmount: bounty.rewardAmount
        }, {
          id: issue.id
        });
      }
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkUpdate("issues", {
      rewardTokenId: null,
      rewardAmount: null
    });
  }
};
