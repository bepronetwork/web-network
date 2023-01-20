"use strict";

const Tokens = require("../models/tokens.model");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tokens", "isReward", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });

    Tokens.init(queryInterface.sequelize);
//mesmo address mesmo column?
    const tokens = await Tokens.findAll();
    for (const token of tokens) {
      console.log('token ->', token.isReward, token.isTransactional)
      if (token.isTransactional === true) token.isReward = false;
      else token.isReward = true;

      await token.save();
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tokens", "isReward");
  },
};
