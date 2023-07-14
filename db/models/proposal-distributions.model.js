"use strict";
const { getValueToLowerCase } = require("../../helpers/db/getters");
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
      recipient: {
        type: DataTypes.STRING(255),
        allowNull: false,
        get() {
          return getValueToLowerCase(this, "recipient");
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

    this.belongsTo(models.user, {
      foreignKey: "recipient",
      sourceKey: "address"
    });
  }
}

module.exports = ProposalDistributions;