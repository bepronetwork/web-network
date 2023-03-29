'use strict';

const { getDAO, loadNetworkV2 } = require("../../helpers/db/dao");
const { getAllFromTable } = require("../../helpers/db/rawQueries");

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
      const networkV2 = await loadNetworkV2(web3Connection, network.networkAddress);

      const [
        councilAmount,
        disputableTime,
        draftTime,
        oracleExchangeRate,
        mergeCreatorFeeShare,
        percentageNeededForDispute,
        cancelableTime,
        proposerFeeShare
      ] = await Promise.all([
        networkV2.councilAmount(),
        networkV2.disputableTime(),
        networkV2.draftTime(),
        networkV2.oracleExchangeRate(),
        networkV2.mergeCreatorFeeShare(),
        networkV2.percentageNeededForDispute(),
        networkV2.cancelableTime(),
        networkV2.proposerFeeShare(),
      ]);

      await queryInterface.bulkUpdate("networks", {
        councilAmount: councilAmount,
        disputableTime: disputableTime,
        draftTime: draftTime,
        oracleExchangeRate: oracleExchangeRate,
        mergeCreatorFeeShare: mergeCreatorFeeShare,
        percentageNeededForDispute: percentageNeededForDispute,
        cancelableTime: cancelableTime,
        proposerFeeShare: proposerFeeShare,
      }, {
        id: network.id
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkUpdate("networks", {
      councilAmount: null,
      disputableTime: null,
      draftTime: null,
      oracleExchangeRate: null,
      mergeCreatorFeeShare: null,
      percentageNeededForDispute: null,
      cancelableTime: null,
      proposerFeeShare: null,
    });
  }
};
