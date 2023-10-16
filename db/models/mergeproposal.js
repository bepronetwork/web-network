"use strict";
const { getValueToLowerCase } = require("../../helpers/db/getters");
const { Model, DataTypes } = require("sequelize");
class MergeProposal extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static init(sequelize) {
    super.init({
        issueId: DataTypes.INTEGER,
        deliverableId: DataTypes.INTEGER,
        githubLogin: DataTypes.STRING,
        contractId: DataTypes.INTEGER,
        creator: {
          type: DataTypes.STRING,
          get() {
            return getValueToLowerCase(this, "creator");
          }
        },
        network_id: DataTypes.INTEGER,
        contractCreationDate: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        disputeWeight: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        refusedByBountyOwner: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        isDisputed: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }
    },
    {
      sequelize,
      modelName: "mergeProposal",
      tableName: "merge_proposals"
    });
  }

  static associate(models) {
    // define association here
    this.hasMany(models.ProposalDistributions, {
      foreignKey: "proposalId",
      sourceKey: "id",
      as: "distributions"
    });

    this.hasMany(models.dispute, {
      foreignKey: "proposalId",
      sourceKey: "id",
      as: "disputes"
    });

    this.belongsTo(models.issue, {
      foreignKey: "issueId",
      sourceKey: "id",
      as: "issue"
    });

    this.belongsTo(models.deliverable, {
      foreignKey: "deliverableId",
      sourceKey: "id",
      as: "deliverable"
    });
    
    this.belongsTo(models.network, {
      foreignKey: "network_id",
      sourceKey: "id"
    });

    this.hasMany(models.comment, {
      foreignKey: "proposalId",
      sourceKey: "id",
      as: "comments"
    });
  }
}

module.exports = MergeProposal;
