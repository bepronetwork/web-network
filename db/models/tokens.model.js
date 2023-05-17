"use strict";
const { getValueToLowerCase } = require("../../helpers/db/getters");
const { Model, DataTypes } = require("sequelize");

class Tokens extends Model {
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
          allowNull: false
        },
        symbol: {
          type: DataTypes.STRING,
          allowNull: false
        },
        address: {
          type: DataTypes.STRING,
          allowNull: false,
          get() {
            return getValueToLowerCase(this, "address");
          }
        },
        isTransactional: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        isReward: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        isAllowed: {
          type: DataTypes.BOOLEAN,
          allowNull: true
        },
        chain_id: {
          type: DataTypes.INTEGER,
          unique: "network_chain_unique"
        },
        minimum: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: "0"
        },
      },
      {
        sequelize,
        modelName: "tokens",
        tableName: "tokens",
        timestamps: false
      }
    );
  }
  static associate(models) {
    this.hasMany(models.issue, {
      foreignKey: "transactionalTokenId",
      sourceKey: "id"
    });
    this.belongsToMany(models.network, { through: 'network_tokens' });
    this.belongsTo(models.chain, {
      foreignKey: "chain_id",
      targetKey: "chainId",
      as: "chain"
    });
  }
}

module.exports = Tokens;
