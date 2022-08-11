"use strict";
const { Model, DataTypes } = require("sequelize");

class User extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static init(sequelize) {
    super.init({
        githubHandle: DataTypes.STRING,
        githubLogin: DataTypes.STRING,
        address: { 
          type: DataTypes.STRING, 
          unique: true 
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
    // define association here
  }
}

module.exports = User;
