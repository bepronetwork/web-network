"use strict";
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
          allowNull: false
        },
        isTransactional: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        isAllowed: {
          type: DataTypes.BOOLEAN,
          allowNull: true
        }
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
    this.belongsToMany(models.network, { through: 'network_tokens' });
    this.hasMany(models.issue, {
      foreignKey: "tokenId",
      sourceKey: "id"
    });
  }
}

module.exports = Tokens;
