"use strict";
const { Model, DataTypes } = require("sequelize");

class HeaderInformation extends Model {
  static init(sequelize) {
    super.init({
      id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          unique: true
        },
        bounties: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        TVL: {
          type: DataTypes.STRING
        },
        number_of_network: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        last_price_used: {
          type: DataTypes.JSON
        }
      },
      {
        sequelize,
        modelName: "headerInformation",
        tableName: "header_information"
      }
    );
  }

  static associate(models) {}
}

module.exports = HeaderInformation;