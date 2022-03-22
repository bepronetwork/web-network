"use strict";
const { Model, DataTypes } = require("sequelize");
class MergeProposal extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static init(sequelize) {
    super.init({
        scMergeId: DataTypes.STRING,
        issueId: DataTypes.INTEGER,
        pullRequestId: DataTypes.INTEGER,
        githubLogin: DataTypes.STRING
    },
               {
        sequelize,
        modelName: "mergeProposal",
        tableName: "merge_proposals"
               });
  }

  static associate(models) {
    // define association here
    this.belongsTo(models.issue, {
      foreignKey: "issueId",
      sourceKey: "id",
      as: "issue"
    });
    this.belongsTo(models.pullRequest, {
      foreignKey: "pullRequestId",
      sourceKey: "id",
      as: "pullRequest"
    });
  }
}

module.exports = MergeProposal;
