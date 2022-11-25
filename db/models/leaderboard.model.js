"use strict";
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
          unique: true
        },
        numberNfts: {
          type: Sequelize.INTEGER,
          allowNull: true
        }
      },
      {
        sequelize,
        modelName: "leaderboard",
        tableName: "leaderboard"
      }
    );
  }

  static associate(models) {

  }
}

module.exports = LeaderBoard;