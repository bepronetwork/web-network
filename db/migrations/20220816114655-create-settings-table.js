'use strict';

const { saveSettingsFromEnv } = require("../../scripts/settings/save-from-env");

module.exports = {
  async up (queryInterface, Sequelize) {
    // await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_settings_visibility");

    // await queryInterface.sequelize.query("CREATE TYPE enum_settings_visibility AS ENUM('public', 'private')");

    await queryInterface.createTable("settings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false
      },
      value: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM("string", "boolean", "number", "json"),
        defaultValue: "string",
        allowNull: false
      },
      visibility: {
        type: Sequelize.ENUM("public", "private"),
        defaultValue: "public",
        allowNull: false
      },
      group: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addConstraint("settings", {
      fields: ["key", "value"],
      type: "unique",
      name: "unique_settings_key_value"
    });

    await saveSettingsFromEnv();
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("settings");
    // await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_settings_visibility");
  }
};
