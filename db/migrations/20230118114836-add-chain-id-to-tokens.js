'use strict';

const TokensModel = require("../models/tokens.model");

const {
  NEXT_PUBLIC_NEEDS_CHAIN_ID: defaultChainId
} = process.env;

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("tokens", "chain_id", {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    TokensModel.init(queryInterface.sequelize);

    await TokensModel.update({
      chain_id: defaultChainId
    }, {
      where: {
        chain_id: null
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("tokens", "chain_id");
  }
};
