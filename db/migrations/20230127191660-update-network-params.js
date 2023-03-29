'use strict';

const { Op } = require("sequelize");

const NetworkModel = require("../models/network.model");

const {
  NEXT_PUBLIC_WEB3_CONNECTION: defaultRpc
} = process.env;

module.exports = {
  async up (queryInterface, Sequelize) {
    NetworkModel.init(queryInterface.sequelize);

    const networks = await NetworkModel.findAll();

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

      network.councilAmount = councilAmount;
      network.disputableTime = disputableTime;
      network.draftTime = draftTime;
      network.oracleExchangeRate = oracleExchangeRate;
      network.mergeCreatorFeeShare = mergeCreatorFeeShare;
      network.percentageNeededForDispute = percentageNeededForDispute;
      network.cancelableTime = cancelableTime;
      network.proposerFeeShare = proposerFeeShare;

      await network.save();
    }
  },

  async down (queryInterface, Sequelize) {
    NetworkModel.init(queryInterface.sequelize);

    await NetworkModel.update({
      councilAmount: null,
      disputableTime: null,
      draftTime: null,
      oracleExchangeRate: null,
      mergeCreatorFeeShare: null,
      percentageNeededForDispute: null,
      cancelableTime: null,
      proposerFeeShare: null,
    }, {
      where: {
        [Op.or]: [
          { councilAmount: { [Op.not]: null } },
          { disputableTime: { [Op.not]: null } },
          { draftTime: { [Op.not]: null } },
          { oracleExchangeRate: { [Op.not]: null } },
          { mergeCreatorFeeShare: { [Op.not]: null } },
          { percentageNeededForDispute: { [Op.not]: null } },
          { cancelableTime: { [Op.not]: null } },
          { proposerFeeShare: { [Op.not]: null } },
        ]
      }
    });
  }
};
