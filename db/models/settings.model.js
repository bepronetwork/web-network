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
        allowNull: false
      },
      value: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM("string", "boolean", "number", "json"),
        defaultValue: "string",
        allowNull: false
      },
      group: {
        type: DataTypes.STRING,
        allowNull: true
      },
      visibility: {
        type: DataTypes.ENUM("public", "private"),
        defaultValue: "public",
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
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
