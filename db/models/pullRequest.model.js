'use strict';
const {Model, DataTypes} = require('sequelize');
module.exports = (sequelize,) => {
  class PullRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.pullRequest.belongsTo(models.issue, {
        foreignKey: 'issueId',
        sourceKey: 'id'
      });

      models.pullRequest.hasMany(models.mergeProposal, {
        foreignKey: 'pullRequestId',
        sourceKey: 'id'
      });
    }
  }
  PullRequest.init({
    githubId: DataTypes.STRING,
    issueId: DataTypes.INTEGER,
    githubLogin: DataTypes.STRING,
    branch: DataTypes.STRING,
    reviewers: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
  }, {
    sequelize,
    modelName: 'pullRequest',
    tableName: 'pull_requests',
  });
  return PullRequest;
};
