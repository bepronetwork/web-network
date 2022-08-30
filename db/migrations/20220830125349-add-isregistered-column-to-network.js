'use strict';

const { Network } = require("../models/network.model");

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("networks", "isRegistered", {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.update("networks", {
      isRegistered: true
    }, {
      name: "bepro"
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("networks", "isRegistered");
  }
};
