"use strict";
const { getValueToLowerCase } = require("../../helpers/db/getters");
const { Model, DataTypes } = require("sequelize");

class Curators extends Model {
  static init(sequelize) {
    super.init({
      id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          unique: true
        },
        address: {
          type: DataTypes.STRING,
          allowNull: false,
          get() {
            return getValueToLowerCase(this, "address");
          }
        },
        acceptedProposals: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        disputedProposals: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        tokensLocked: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        networkId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "network",
            key: "id"
          }
        },
        isCurrentlyCurator: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
        },
      },
      {
        sequelize,
        modelName: "curator",
        tableName: "curators"
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.network, {
      foreignKey: "networkId",
      sourceKey: "id"
    });
  }
}

module.exports = Curators;