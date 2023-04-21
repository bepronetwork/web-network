'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface
      .addColumn("issues", "contractCreationDate", {
        type: Sequelize.STRING,
        allowNull: true
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("issues", "contractCreationDate");
  }
};