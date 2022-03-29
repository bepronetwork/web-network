'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface
      .addColumn("networks", "allowCustomTokens", {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("networks", "allowCustomTokens");
  }
};
