'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface
    .addColumn("networks", "councilMembers", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      default: []
    })
  },

  async down (queryInterface) {
    queryInterface.removeColumn("networks", "councilMembers");
  }
};
