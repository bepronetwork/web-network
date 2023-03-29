'use strict';

const { loadNetworkV2, getDAO } = require("../../helpers/db/dao");
const { getTokenByAddressAndChainId, getAllNetworks } = require("../../helpers/db/rawQueries");

const {
  NEXT_PUBLIC_WEB3_CONNECTION: defaultRpc
} = process.env;

module.exports = {
  async up (queryInterface, Sequelize) {
    const networks = await getAllNetworks(queryInterface);

    if (!networks.length) return;

    const { web3Connection } = await getDAO({
      web3Host: defaultRpc
    });

    for (const network of networks) {
      const networkV2 = await loadNetworkV2(web3Connection, network.networkAddress);

      const [networkToken] = await getTokenByAddressAndChainId(queryInterface, networkV2.networkToken.contractAddress, network.chain_id);

      if (!networkToken) continue;

      await queryInterface.bulkUpdate("networks", {
        network_token_id: networkToken.id
      }, {
        id: network.id
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkUpdate("networks", {
      network_token_id: null
    });
  }
};
