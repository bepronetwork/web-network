"use strict";
const { Model, DataTypes } = require("sequelize");

class Delegation extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      from: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "0"
      },
      to: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "0"
      },
      amount: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "0"
      },
      contractId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      networkId: {
        type: DataTypes.INTEGER,
        references: {
          model: "network",
          key: "id"
        }
      },
      chainId: {
        type: DataTypes.INTEGER,
        references: {
          model: "chain",
          key: "chainId"
        }
      },
    }, {
      sequelize,
      modelName: "delegation",
      tableName: "delegations"
    });
  }

  static associate(models) {
    this.belongsTo(models.network, {
      foreignKey: "networkId",
      sourceKey: "id"
    });

    this.belongsTo(models.chain, {
      foreignKey: "chainId",
      targetKey: "chainId",
      as: "chain"
    });
  }
}

module.exports = Delegation;