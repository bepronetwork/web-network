'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface
      .addColumn("issues", "kycTierList", {
          type: Sequelize.ARRAY(Sequelize.INTEGER),
          default: []
      })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("issues", "kycTierList");
  }
};