'use strict';

const { Op } = require("sequelize");

const TokensModel = require("../models/tokens.model");
const NetworkModel = require("../models/network.model");
const IssueModel = require("../models/issue.model");

const { loadNetworkV2, getDAO } = require("../../helpers/db/dao");

module.exports = {
  async up (queryInterface, Sequelize) {
    NetworkModel.init(queryInterface.sequelize);
    TokensModel.init(queryInterface.sequelize);
    IssueModel.init(queryInterface.sequelize);

    const networks = await NetworkModel.findAll();

    if (!networks.length) return;

    const { web3Connection } = await getDAO({
      web3Host: defaultRpc
    });

    for (const network of networks) {
      const issues = await IssueModel.findAll({
        where: {
          network_id: network.id,
          fundingAmount: {
            [Op.ne]: "0"
          }
        }
      });

      if (!issues.length) continue;

      const networkV2 = await loadNetworkV2(web3Connection, network.networkAddress);

      for (const issue of issues) {
        const bounty = await networkV2.getBounty(issue.contractId);

        const rewardToken = await TokensModel.findOne({
          where: {
            address: bounty.rewardToken,
            chain_id: network.chain_id
          }
        });

        issue.rewardTokenId = rewardToken.id;
        issue.rewardAmount = bounty.rewardAmount;

        await issue.save();
      }
    }
  },

  async down (queryInterface, Sequelize) {
    IssueModel.init(queryInterface.sequelize);

    await IssueModel.update({
      rewardTokenId: null,
      rewardAmount: null
    }, {
      where: {
        fundingAmount: {
          [Op.ne]: "0"
        }
      }
    });
  }
};
