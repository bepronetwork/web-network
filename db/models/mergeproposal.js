'use strict';
const {Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class MergeProposal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.mergeProposal.belongsTo(models.issue, {
        foreignKey: 'issueId',
        sourceKey: 'id'
      });
      models.mergeProposal.belongsTo(models.pullRequest, {
        foreignKey: 'pullRequestId',
        sourceKey: 'id'
      });
    }
  };
  MergeProposal.init({
    scMergeId: DataTypes.STRING,
    issueId: DataTypes.INTEGER,
    pullRequestId: DataTypes.INTEGER,
    githubLogin: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'mergeProposal',
    tableName: 'merge_proposals',
  });
  return MergeProposal;
};
