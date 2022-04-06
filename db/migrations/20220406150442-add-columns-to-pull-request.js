'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface
      .addColumn("pull_requests", "userRepo", {
        type: Sequelize.STRING,
        allowNull: true
      });
    
    await queryInterface
      .addColumn("pull_requests", "userBranch", {
        type: Sequelize.STRING,
        allowNull: true
      });

    await queryInterface
      .addColumn("pull_requests", "ready", {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      });

    await queryInterface
      .addColumn("pull_requests", "canceled", {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      });

    await queryInterface
      .addColumn("pull_requests", "contractId", {
        type: Sequelize.INTEGER,
        allowNull: true
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("pull_requests", "userRepo");
    await queryInterface.removeColumn("pull_requests", "userBranch");
    await queryInterface.removeColumn("pull_requests", "ready");
    await queryInterface.removeColumn("pull_requests", "canceled");
    await queryInterface.removeColumn("pull_requests", "contractId");
  }
};
