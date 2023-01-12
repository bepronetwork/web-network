'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface
      .addColumn("issues", "isKyc", {
          type: Sequelize.BOOLEAN,
          default: false
      })
    await queryInterface
      .addColumn("issues", "kycTierList", {
          type: Sequelize.ARRAY(Sequelize.INTEGER),
          default: []
      })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("issues", "isKyc");
    await queryInterface.removeColumn("issues", "kycTierList");
  }
};