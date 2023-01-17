'use strict';

const Settings = require("../models/settings.model");

module.exports = {
  async up (queryInterface, Sequelize) {
    Settings.init(queryInterface.sequelize);

    await Settings.create({
      key: "rssTtl",
      value: "1",
      visibility: "public",
      type: "string"
    });
  },

  async down (queryInterface, Sequelize) {
    Settings.init(queryInterface.sequelize);

    Settings.destroy({
      where: {
        key: "rssTtl",
        value: "1",
        visibility: "public",
        type: "string"
      }
    });
  }
};
