'use strict';
const {Model, DataTypes} = require('sequelize');
module.exports = (sequelize) => {
  class Issue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.issue.hasMany(models.developer, {
        foreignKey: 'issueId',
        sourceKey: 'id'
      });
      models.issue.hasMany(models.pullRequest, {
        foreignKey: 'issueId',
        sourceKey: 'id'
      });
      models.issue.hasMany(models.mergeProposal, {
        foreignKey: 'issueId',
        sourceKey: 'id'
      });
    }
  };
  Issue.init({
    issueId: DataTypes.INTEGER,
    githubId: DataTypes.STRING,
    title: DataTypes.STRING,
    body: DataTypes.STRING,
    state: DataTypes.STRING,
    creatorAddress: DataTypes.STRING,
    creatorGithub: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    repository_id: DataTypes.STRING,
    working: {
      type: DataTypes.ARRAY(DataTypes.STRING)
    },
    merged: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'issue',
  });
  return Issue;
};
