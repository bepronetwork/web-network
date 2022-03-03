'use strict';
const {Model, DataTypes} = require('sequelize');
class Issue extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static init(sequelize){
    super.init({
      issueId: DataTypes.INTEGER,
      githubId: DataTypes.STRING,
      state: DataTypes.STRING,
      creatorAddress: DataTypes.STRING,
      creatorGithub: DataTypes.STRING,
      amount: DataTypes.INTEGER,
      repository_id: DataTypes.STRING,
      title: DataTypes.TEXT,
      body: DataTypes.TEXT,
      branch: DataTypes.STRING,
      working: {
        type: DataTypes.ARRAY(DataTypes.STRING)
      },
      merged: DataTypes.STRING,
      seoImage: DataTypes.STRING,
      network_id: DataTypes.INTEGER
    }, {
      sequelize,
      modelName: 'issue',
    });
  }

  static associate(models) {
    // define association here
    this.hasMany(models.developer, {
      foreignKey: 'issueId',
      sourceKey: 'id',
      as: 'developers'
    });
    this.hasMany(models.pullRequest, {
      foreignKey: 'issueId',
      sourceKey: 'id',
      as: 'pullRequests'
    });
    this.hasMany(models.mergeProposal, {
      foreignKey: 'issueId',
      sourceKey: 'id',
      as: 'mergeProposals'
    });
    this.belongsTo(models.repositories, {
      foreignKey: 'repository_id',
      sourceKey: 'id',
      as: 'repository'
    });
    this.belongsTo(models.network, {
      foreignKey: 'network_id',
      sourceKey: 'id'
    });
  }
};
  
module.exports = Issue;
