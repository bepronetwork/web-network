'use strict';
const {Model, DataTypes} = require('sequelize');
class Repositories extends Model {

  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static init(sequelize){
    super.init({
      id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, unique: true},
      githubPath: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      network_id: DataTypes.INTEGER
    }, {
      sequelize,
      modelName: 'repositories',
      tableName: 'repositories',
      timestamps: false,
    });
  
  }
  static associate(models) {
    // this.belongsTo(models.issue, {
    //   foreignKey: 'issueId',
    //   sourceKey: 'id'
    // });
    //
    this.hasMany(models.issue, {
      foreignKey: 'repository_id',
      sourceKey: 'id'
    });
    this.belongsTo(models.network, {
      foreignKey: 'network_id',
      sourceKey: 'id'
    });
  }
}

module.exports = Repositories;