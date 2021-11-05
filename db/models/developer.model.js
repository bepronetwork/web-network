'use strict';
const {Model, DataTypes} = require('sequelize');
module.exports = (sequelize) => {
  class Developer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.developer.belongsTo(models.issue, {
        foreignKey: 'issueId',
        sourceKey: 'id'
      });
    }
  };
  Developer.init({
    githubHandle: DataTypes.STRING,
    address: DataTypes.STRING,
    issueId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'developer',
  });
  return Developer;
};
