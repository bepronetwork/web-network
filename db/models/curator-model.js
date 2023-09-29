"use strict";
const { getValueToLowerCase } = require("../../helpers/db/getters");
const { Model, DataTypes, Sequelize } = require("sequelize");

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
        delegatedToMe: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: "0"
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

    this.hasMany(models.delegation, {
      foreignKey: "curatorId",
      sourceKey: "id",
      as: "delegations"
    });

    this.hasMany(models.dispute, {
      foreignKey: "address",
      targetKey: "address"
    });
  }

  static findByAddress(address) {
    return this.findOne({
      where: {
        address: Sequelize.where(Sequelize.fn("lower", Sequelize.col("address")), address?.toLowerCase())
      }
    });
  }
}

module.exports = Curators;