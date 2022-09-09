"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query("UPDATE issues SET state = 'canceled' WHERE state = 'redeemed'");
  },
  down: async () => {

  }
};
