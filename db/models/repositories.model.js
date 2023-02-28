"use strict";
const { Model, DataTypes } = require("sequelize");
class Repositories extends Model {
  static init(sequelize) {
    super.init({
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          unique: true
        },
        githubPath: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: "repositories_networks_unique"
        },
        network_id: {
          type: DataTypes.INTEGER,
          unique: "repositories_networks_unique"
        }
    },
    {
      sequelize,
      modelName: "repositories",
      tableName: "repositories",
      timestamps: false
    });
  }
  static associate(models) {
    this.hasMany(models.issue, {
      foreignKey: "repository_id",
      sourceKey: "id"
    });
    this.belongsTo(models.network, {
      foreignKey: "network_id",
      sourceKey: "id"
    });
  }
}

module.exports = Repositories;
