"use strict";
const { Model, DataTypes } = require("sequelize");

class Disputes extends Model {
  static init(sequelize) {
    super.init({
      id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          unique: true
        },
        issueId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
             model: "issue",
             key: "id"
          }
        },
        curatorId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
             model: "curator",
             key: "id"
         }
        },
        proposalId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
             model: "mergeProposal",
             key: "id"
         }
        },
        weight: {
          type: DataTypes.STRING,
          allowNull: true,
        }
      },
      {
        sequelize,
        modelName: "dispute",
        tableName: "disputes"
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.mergeProposal, {
      foreignKey: "proposalId",
      sourceKey: "id"
    });
    this.belongsTo(models.curator, {
        foreignKey: "curatorId",
        sourceKey: "id"
    });
    this.belongsTo(models.issue, {
        foreignKey: "issueId",
        sourceKey: "id",
        as: "issue"
    });
  }
}

module.exports = Disputes;