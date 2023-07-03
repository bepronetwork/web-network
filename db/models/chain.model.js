const { getValueToLowerCase } = require("../../helpers/db/getters");
const {Model, DataTypes} = require("sequelize");

class Chain extends Model {

  static init(sqlz) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true
      },
      chainId: {
        type: DataTypes.INTEGER,
        unique: true
      },
      chainRpc: {
        type: DataTypes.STRING,
      },
      chainName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      chainShortName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      chainCurrencyName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      chainCurrencySymbol: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      chainCurrencyDecimals: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      registryAddress: {
        type: DataTypes.STRING,
        get() {
          return getValueToLowerCase(this, "registryAddress");
        }
      },
      eventsApi: {
        type: DataTypes.STRING,
      },
      blockScanner: {
        type: DataTypes.STRING,
      },
      isDefault: {
        type: DataTypes.BOOLEAN
      },
      color: {
        type: DataTypes.STRING,
        allowNull: true
      },
      icon: {
        type: DataTypes.STRING,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }, {sequelize: sqlz, modelName: 'chain', tableName: 'chains'})
  };

  static associate(models) {
    this.hasMany(models.network, {
      foreignKey: 'chain_id',
      sourceKey: 'chainId',
      as: "networks"
    });
    this.hasMany(models.issue, {
      foreignKey: 'chain_id',
      sourceKey: 'chainId',
      as: "issues"
    });
    this.hasMany(models.tokens, {
      foreignKey: 'chain_id',
      sourceKey: 'chainId',
      as: "tokens"
    });
  }
}

module.exports = Chain;