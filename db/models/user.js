"use strict";
const { getValueToLowerCase } = require("../../helpers/db/getters");
const { Model, DataTypes, Sequelize } = require("sequelize");

class User extends Model {
  static init(sequelize) {
    super.init({
        githubHandle: DataTypes.STRING,
        githubLogin: DataTypes.STRING,
        address: { 
          type: DataTypes.STRING, 
          unique: true,
          get() {
            return getValueToLowerCase(this, "address");
          }
        },
        resetedAt: {
          type: DataTypes.DATE,
          allowNull: true
        }
    },
               {
        sequelize,
        modelName: "user"
               });
  }

  static associate(models) {
    this.belongsTo(models.kycSession, {
      foreignKey: "id",
      sourceKey: "id"
    });
  }

  static findByAddress(address) {
    return this.findOne({
      where: {
        address: Sequelize.where(Sequelize.fn("lower", Sequelize.col("address")), address?.toLowerCase())
      }
    });
  }

  static findByGithubLogin(githubLogin) {
    return this.findOne({
      where: {
        address: Sequelize.where(Sequelize.fn("lower", Sequelize.col("githubLogin")), githubLogin?.toLowerCase())
      }
    });
  }
}

module.exports = User;
