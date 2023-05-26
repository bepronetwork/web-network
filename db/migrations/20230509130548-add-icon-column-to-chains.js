'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("chains", "icon", {
      type: Sequelize.STRING
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("chains", "icon");
  }
};
