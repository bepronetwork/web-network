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
      working: {
        type: DataTypes.ARRAY(DataTypes.STRING)
      },
      merged: DataTypes.STRING,
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
      as: 'pullrequests'
    });
    this.hasMany(models.mergeProposal, {
      foreignKey: 'issueId',
      sourceKey: 'id',
      as: 'merges'
    });
    this.hasOne(models.repositories, {
      foreignKey: 'id',
      sourceKey: 'id',
      as: 'repository'
    });
  }
};
  
module.exports = Issue;