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
        issueId: DataTypes.INTEGER,
        pullRequestId: DataTypes.INTEGER,
        githubLogin: DataTypes.STRING,
        contractId: DataTypes.INTEGER,
        creator: DataTypes.STRING,
        network_id: DataTypes.INTEGER,
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
    
    this.belongsTo(models.network, {
      foreignKey: "network_id",
      sourceKey: "id"
    });
  }
}

module.exports = MergeProposal;
