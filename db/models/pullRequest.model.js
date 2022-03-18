"use strict";
const { Model, DataTypes } = require("sequelize");
class PullRequest extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static init(sequelize) {
    super.init(
      {
        githubId: DataTypes.STRING,
        issueId: DataTypes.INTEGER,
        githubLogin: DataTypes.STRING,
        branch: DataTypes.STRING,
        reviewers: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          defaultValue: []
        }
      },
      {
        sequelize,
        modelName: "pullRequest",
        tableName: "pull_requests"
      }
    );
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
  }
}

module.exports = PullRequest;
