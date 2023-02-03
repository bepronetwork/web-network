"use strict";
const { getValueToLowerCase } = require("helpers/db/getters");
const { Model, DataTypes } = require("sequelize");
class Developer extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static init(sequelize) {
    super.init({
        githubHandle: DataTypes.STRING,
        address: {
          type: DataTypes.STRING,
          get() {
            return getValueToLowerCase(this, "address");
          }
        },
        issueId: DataTypes.INTEGER
    },
               {
        sequelize,
        modelName: "developer"
               });
  }

  static associate(models) {
    // define association here
    this.hasOne(models.issue, {
      foreignKey: "issueId",
      sourceKey: "id",
      as: "issue"
    });
  }
}

module.exports = Developer;
