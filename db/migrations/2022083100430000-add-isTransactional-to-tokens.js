'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface
      .addColumn("tokens", "isTransactional", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tokens", "isTransactional");
  }
};