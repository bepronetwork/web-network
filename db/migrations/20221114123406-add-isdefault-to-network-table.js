'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("networks", "isDefault", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false
    });

    const defaultNetworkName = process.env.NEXT_PUBLIC_DEFAULT_NETWORK_NAME;

    if (defaultNetworkName)
      await queryInterface.bulkUpdate("networks", {
        isDefault: true
      }, {
        name: defaultNetworkName
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("networks", "isDefault");
  }
};
