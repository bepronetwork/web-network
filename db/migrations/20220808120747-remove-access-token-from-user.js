'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "accessToken");
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "accessToken", {
      type: Sequelize.STRING
    });
  }
};
