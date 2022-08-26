"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("issues", "creatorAddress", {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("issues", "creatorGithub", {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("issues", "amount", {
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
    await queryInterface.removeColumn("issues", "creatorAddress");
    await queryInterface.removeColumn("issues", "creatorGithub");
    await queryInterface.removeColumn("issues", "amount");
  }
};
