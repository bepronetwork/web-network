'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("networks", "network_token_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "tokens",
        key: "id"
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("networks", "network_token_id");
  }
};
