'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.removeColumn("users", "accessToken");
  },

  async down (queryInterface, Sequelize) {
    queryInterface.addColumn("users", "accessToken", {
      type: Sequelize.STRING
    });
  }
};
