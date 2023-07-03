'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface
      .addColumn("tokens", "minimum", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "0"
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("tokens", "minimum");
  }
};