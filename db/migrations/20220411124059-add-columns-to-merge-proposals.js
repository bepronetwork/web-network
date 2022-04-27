'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface
      .addColumn("merge_proposals", "contractId", {
        type: Sequelize.INTEGER,
        allowNull: true
      });
      await queryInterface
      .addColumn("merge_proposals", "creator", {
        type: Sequelize.STRING,
        allowNull: true
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("merge_proposals", "contractId");
    await queryInterface.removeColumn("merge_proposals", "creator");
  }
};
