'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface
      .addColumn("issues", "isKyc", {
        type: Sequelize.BOOLEAN,
        default: false,
      })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("issues", "isKyc");
  }
};