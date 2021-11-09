'use strict';
const {Model, DataTypes} = require('sequelize');
module.exports = (sequelize) => {
  class RepositoriesModel extends Model {

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // models.pullRequest.belongsTo(models.issue, {
      //   foreignKey: 'issueId',
      //   sourceKey: 'id'
      // });
      //
      // models.pullRequest.hasMany(models.mergeProposal, {
      //   foreignKey: 'pullRequestId',
      //   sourceKey: 'id'
      // });
    }
  }

  RepositoriesModel.init({
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, unique: true},
    githubPath: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    }
  }, {
    sequelize,
    modelName: 'repositories',
    tableName: 'repositories',
    timestamps: false,
  });


  return RepositoriesModel;
};
