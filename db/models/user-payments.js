"use strict";
const { Model, DataTypes } = require("sequelize");

class UserPayments extends Model {
  static init(sequelize) {
    super.init({
        address: DataTypes.STRING,
        ammount: DataTypes.INTEGER,
        issueId:  DataTypes.STRING,
        transactionHash: DataTypes.STRING
      },
      {
        sequelize,
        tableName: "users_payments",
        modelName: "userPayments"
      });
  }
  static associate(models) {
    this.belongsTo(models.issue, {
      foreignKey: "issueId",
      sourceKey: "id"
    });
  }
}

module.exports = UserPayments;
