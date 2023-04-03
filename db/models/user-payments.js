"use strict";
const { getValueToLowerCase } = require("../../helpers/db/getters");
const { Model, DataTypes } = require("sequelize");

class UserPayments extends Model {
  static init(sequelize) {
    super.init({
        address: {
          type: DataTypes.STRING,
          get() {
            return getValueToLowerCase(this, "address");
          }
        },
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
