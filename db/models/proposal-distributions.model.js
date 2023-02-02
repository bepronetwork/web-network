"use strict";
const { Model, DataTypes } = require("sequelize");

class ProposalDistributions extends Model {
  static init(sequelize) {
    super.init({
      id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          unique: true
        },
      address: {
        type: DataTypes.STRING(255),
        allowNull: false,
        get() {
          const rawValue = this.getDataValue("address");
          return rawValue ? rawValue.toLowerCase() : null;
        }
      },
      percentage: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
      proposalId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'merge_proposals',
            key: 'id'
          }
        }
      },
      {
        sequelize,
        tableName: "proposal_distributions"
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.mergeProposal, {
      foreignKey: "proposalId",
      sourceKey: "id",
      as: "mergeProposal"
    });
  }
}

module.exports = ProposalDistributions;