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
        name: defaultNetworkName,
        colors: `{"primary":"#4250e4","secondary":"#fd8b2a","oracle":"#9669ed","text":"#ffffff","background":"#0d0f19","shadow":"#151720","gray":"#c4c7d3","success":"#35e0ad","danger":"#eb5757","warning":"#ee9240","info":"#87c7ec", "dark": "#0d0f19"}`
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("networks", "isDefault");
  }
};
