'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("networks", "isRegistered", {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.bulkUpdate("networks", {
      isRegistered: true
    }, {
      name: "bepro"
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("networks", "isRegistered");
  }
};
