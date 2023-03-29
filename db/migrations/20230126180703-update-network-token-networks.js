'use strict';
const { Network_v2, Web3Connection } = require("@taikai/dappkit");
const { Op } = require("sequelize");

const TokensModel = require("../models/tokens.model");
const NetworkModel = require("../models/network.model");

const { loadNetworkV2 } = require("../../helpers/db/dao");

const {
  NEXT_PUBLIC_WEB3_CONNECTION: defaultRpc
} = process.env;

module.exports = {
  async up (queryInterface, Sequelize) {
    NetworkModel.init(queryInterface.sequelize);
    TokensModel.init(queryInterface.sequelize);

    const networks = await NetworkModel.findAll();

    if (!networks.length) return;

    const { web3Connection } = await getDAO({
      web3Host: defaultRpc
    });

    for (const network of networks) {

      const networkV2 = await loadNetworkV2(web3Connection, network.networkAddress);

      const networkToken = await TokensModel.findOne({
        where: {
          address: networkV2.networkToken.contractAddress,
          chain_id: network.chain_id
        }
      });

      if (!networkToken) continue;

      network.network_token_id = networkToken.id;
      await network.save();
    }
  },

  async down (queryInterface, Sequelize) {
    NetworkModel.init(queryInterface.sequelize);

    await NetworkModel.update({
      network_token_id: null
    }, {
      where: {
        network_token_id: {
          [Op.ne]: null
        }
      }
    });
  }
};
