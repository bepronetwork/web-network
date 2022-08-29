'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface
    .addColumn("networks", "councilMembers", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      default: []
    })
  },

  async down (queryInterface) {
    await queryInterface.removeColumn("networks", "councilMembers");
  }
};
