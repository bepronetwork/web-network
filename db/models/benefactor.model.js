"use strict";
const { Model, DataTypes } = require("sequelize");

class Benefactors extends Model {
  static init(sequelize) {
    super.init({
      id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          unique: true
        },
        amount: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        address: {
          type: DataTypes.STRING,
          allowNull: false,
          get() {
            const rawValue = this.getDataValue("address");
            return rawValue ? rawValue.toLowerCase() : null;
          }
        },
        contractId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        issueId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "issue",
            key: "id"
          }
        }
      },
      {
        sequelize,
        modelName: "benefactor",
        tableName: "benefactors"
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.issue, {
      foreignKey: "issueId",
      sourceKey: "id",
      as: "issue"
    });
  }
}

module.exports = Benefactors;