'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface
      .addColumn("merge_proposals", "contractCreationDate", {
        type: Sequelize.INTEGER,
        allowNull: true
      });
      await queryInterface
      .addColumn("merge_proposals", "oracles", {
        type: Sequelize.STRING,
        allowNull: true
      });
      await queryInterface
      .addColumn("merge_proposals", "disputeWeight", {
        type: Sequelize.STRING,
        allowNull: true
      });
      await queryInterface
      .addColumn("merge_proposals", "refusedByBountyOwner", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("merge_proposals", "contractCreationDate");
    await queryInterface.removeColumn("merge_proposals", "oracles");
    await queryInterface.removeColumn("merge_proposals", "disputeWeight");
    await queryInterface.removeColumn("merge_proposals", "refusedByBountyOwner");
  }
};