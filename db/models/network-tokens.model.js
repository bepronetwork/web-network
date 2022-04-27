"use strict";
const { Model, DataTypes } = require("sequelize");

class NetworkTokens extends Model {
  static init(sequelize) {
    super.init({
      id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          unique: true
        },
        networkId: {
          type: DataTypes.STRING,
          allowNull: false,
          references: {
            model: "network",
            key: "id"
          }
        },
        tokenId: {
          type: DataTypes.STRING,
          allowNull: false,
          references: {
            model: "tokens",
            key: "id"
          }
        }
      },
      {
        sequelize,
        modelName: "network_tokens",
        tableName: "network_tokens",
        timestamps: false
      }
    );
  }
}

module.exports = NetworkTokens;
