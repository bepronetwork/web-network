"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.sequelize.query("UPDATE issues SET state = 'canceled' WHERE state = 'redeemed'");
  }
};
