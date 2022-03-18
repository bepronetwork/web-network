"use strict";
const { Model, DataTypes } = require("sequelize");

class ChainEvents extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          unique: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
        lastBlock: {
          type: DataTypes.INTEGER
        }
      },
      {
        sequelize,
        modelName: "chainEvents",
        tableName: "chainEvents",
        timestamps: false
      }
    );
  }
}

module.exports = ChainEvents;
