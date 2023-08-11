"use strict";
const { getValueToLowerCase } = require("../../helpers/db/getters");
const { Model, DataTypes } = require("sequelize");
class PullRequest extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static init(sequelize) {
    super.init({
        githubId: DataTypes.STRING,
        issueId: DataTypes.INTEGER,
        githubLogin: DataTypes.STRING,
        userRepo: {
          type: DataTypes.STRING,
          allowNull: true
        },
        userBranch: {
          type: DataTypes.STRING,
          allowNull: true
        },
        userAddress: {
          type: DataTypes.STRING,
          allowNull: true,
          get() {
            return getValueToLowerCase(this, "userAddress");
          }
        },
        status: {
          type: DataTypes.STRING,
          allowNull: true
        },
        contractId: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        reviewers: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          defaultValue: []
        },
        network_id: DataTypes.INTEGER,
        isCanceled: {
          type: DataTypes.VIRTUAL,
          get() {
            return this.status === "canceled";
          }
        },
        isReady: {
          type: DataTypes.VIRTUAL,
          get() {
            return this.status === "ready";
          }
        }
    },
    {
      sequelize,
      modelName: "pullRequest",
      tableName: "pull_requests"
    });
  }

  static associate(models) {
    this.belongsTo(models.issue, {
      foreignKey: "issueId",
      sourceKey: "id",
      as: "issue"
    });

    this.hasMany(models.mergeProposal, {
      foreignKey: "pullRequestId",
      sourceKey: "id",
      as: "merges"
    });

    this.belongsTo(models.network, {
      foreignKey: "network_id",
      sourceKey: "id"
    });

    this.hasMany(models.comment, {
      foreignKey: "deliverableId",
      sourceKey: "id",
      as: "comments"
    });
  }
}

module.exports = PullRequest;
