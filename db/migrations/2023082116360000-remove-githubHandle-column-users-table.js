"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "githubHandle");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "githubHandle", {
      type: Sequelize.STRING,
    });
  },
};
