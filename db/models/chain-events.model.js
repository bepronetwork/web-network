'use strict';
const {Model, DataTypes} = require('sequelize');
module.exports = (sequelize) => {
  class ChainEventsModel extends Model {
    static associate(models) {}
  }

  ChainEventsModel.init({
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, unique: true},
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    lastBlock: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    modelName: 'chainEvents',
    tableName: 'chainEvents',
    timestamps: false,
  });


  return ChainEventsModel;
};
