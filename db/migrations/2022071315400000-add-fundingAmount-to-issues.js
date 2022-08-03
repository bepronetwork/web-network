'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn("issues", "fundingAmount");
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("issues", "fundingAmount");
  }
};
