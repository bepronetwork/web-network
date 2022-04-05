'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface
      .addColumn("issues", "tokenId", {
        type: Sequelize.INTEGER,
        allowNull: true
      })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("issues", "tokenId");
  }
};
