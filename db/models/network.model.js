"use strict";
const { Model, DataTypes } = require("sequelize");

class Network extends Model {
  static init(sequelize) {
    super.init({
        creatorAddress: DataTypes.STRING,
        name: {
          type: DataTypes.STRING,
          unique: true
        },
        description: DataTypes.STRING,
        colors: DataTypes.JSON,
        networkAddress: DataTypes.STRING,
        logoIcon: DataTypes.STRING,
        fullLogo: DataTypes.STRING,
        isClosed: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
        },
        councilMembers: {
          type: DataTypes.ARRAY(DataTypes.STRING)
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        allowCustomTokens: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
        }
    },
               {
        sequelize,
        modelName: "network"
               });
  }

  static associate(models) {
    this.hasMany(models.issue, {
      foreignKey: "network_id",
      sourceKey: "id"
    });
    this.hasMany(models.repositories, {
      foreignKey: "network_id",
      sourceKey: "id"
    });
    this.belongsToMany(models.tokens, { through: 'network_tokens' });
  }
}

module.exports = Network;
