"use strict";
const { Model, DataTypes } = require("sequelize");

class ChainEvents extends Model {
  static init(sequelize) {
    super.init({
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
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    },
      {
        sequelize,
        modelName: "chainEvents",
        tableName: "chain_events",
        timestamps: false
      });
  }
}

module.exports = ChainEvents;
