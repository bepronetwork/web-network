'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("settings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      key: {
        type: Sequelize.STRING,
        unique: "settingKeyValue"
      },
      value: {
        type: Sequelize.STRING,
        unique: "settingKeyValue"
      },
      type: Sequelize.ENUM("string", "boolean", "number", "json")
  });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("settings");
  }
};
