'use strict';

const { Web3Connection, BountyToken, NetworkRegistry } = require("@taikai/dappkit");

const Settings = require("../models/settings.model");
const Tokens = require("../models/tokens.model");

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("tokens", "isAllowed", {
      type: Sequelize.BOOLEAN,
      allowNull: true
    });

    Settings.init(queryInterface.sequelize);
    Tokens.init(queryInterface.sequelize);

    const registrySetting = await Settings.findOne({
      where: {
        group: "contracts",
        key: "networkRegistry"
      }
    });

    const web3Connection = new Web3Connection({
      skipWindowAssignment: true,
      web3Host: process.env.NEXT_PUBLIC_WEB3_CONNECTION,
    });
    
    await web3Connection.start();

    const registry = new NetworkRegistry(web3Connection, registrySetting.value);
    await registry.loadContract();

    const allowedTokens = await registry.getAllowedTokens();

    const tokens = await Tokens.findAll();

    for (const token of tokens) {
      if (token.isTransactional && allowedTokens.transactional.includes(token.address) ||
          !token.isTransactional && allowedTokens.reward.includes(token.address))
        token.isAllowed = true;
      else
        token.isAllowed = false;

      await token.save();
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("tokens", "isAllowed");
  }
};
