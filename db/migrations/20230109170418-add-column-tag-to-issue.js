'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("issues", "tags", {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("issues", "tags");
  }
};
