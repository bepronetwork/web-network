'use strict';

const { Web3Connection, NetworkRegistry } = require("@taikai/dappkit");

const Settings = require("../models/settings.model");
const Tokens = require("../models/tokens.model");
const { getAllFromTable } = require("../../helpers/db/rawQueries");

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

    if (!registrySetting) return;

    const web3Connection = new Web3Connection({
      skipWindowAssignment: true,
      web3Host: process.env.NEXT_PUBLIC_WEB3_CONNECTION,
    });

    await web3Connection.start();

    const registry = new NetworkRegistry(web3Connection, registrySetting.value);
    await registry.loadContract();

    const allowedTokens = await registry.getAllowedTokens();

    const tokens = await getAllFromTable(queryInterface, "tokens");

    for (const token of tokens) {
      const isAllowed = allowedTokens.transactional.includes(token.address) || allowedTokens.reward.includes(token.address);

      await queryInterface.bulkUpdate("tokens", {
        isAllowed: isAllowed
      }, {
        id: token.id
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("tokens", "isAllowed");
  }
};
