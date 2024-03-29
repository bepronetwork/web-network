"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('merge_proposals', { id: Sequelize.INTEGER });
     */

    await queryInterface.addColumn("merge_proposals", "githubLogin", {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('merge_proposals');
     */
    await queryInterface.removeColumn("merge_proposals", "githubLogin");
  }
};
