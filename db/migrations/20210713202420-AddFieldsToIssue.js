"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    queryInterface.addColumn("issues", "creatorAddress", {
      type: Sequelize.STRING,
      allowNull: true
    });
    queryInterface.addColumn("issues", "creatorGithub", {
      type: Sequelize.STRING,
      allowNull: true
    });
    queryInterface.addColumn("issues", "amount", {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    queryInterface.removeColumn("issues", "creatorAddress");
    queryInterface.removeColumn("issues", "creatorGithub");
    queryInterface.removeColumn("issues", "amount");
  }
};
