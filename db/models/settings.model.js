"use strict";
const { Model, DataTypes } = require("sequelize");

class Settings extends Model {
  static init(sequelize) {
    super.init({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      key: {
        type: DataTypes.STRING,
        unique: "settingKeyValue"
      },
      value: {
        type: DataTypes.STRING,
        unique: "settingKeyValue"
      },
      type: DataTypes.ENUM("string", "boolean", "number", "json")
    }, {
      sequelize,
      modelName: "settings",
      tableName: "settings"
    });
  }

  static associate(models) {
  }
}

module.exports = Settings;
