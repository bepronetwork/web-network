"use strict";
const { getValueToLowerCase } = require("../../helpers/db/getters");
const { Model, DataTypes } = require("sequelize");

class LeaderBoard extends Model {
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
          unique: true,
          get() {
            return getValueToLowerCase(this, "address");
          }
        },
        numberNfts: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        ownedBountiesOpened: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        ownedBountiesClosed: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        ownedBountiesCanceled: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        ownedProposalCreated: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        ownedProposalAccepted: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        ownedProposalRejected: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
      },
      {
        sequelize,
        modelName: "leaderboard",
        tableName: "leaderboard"
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.user, {
      foreignKey: "address",
      targetKey: "address"
    });
  }
}

module.exports = LeaderBoard;