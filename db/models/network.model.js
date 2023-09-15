"use strict";
const {Model, DataTypes, Sequelize} = require("sequelize");
const {getValueToLowerCase} = require("../../helpers/db/getters");

class Network extends Model {
  static init(sequelize) {
    super.init({
        creatorAddress: {
          type: DataTypes.STRING,
          get() {
            return getValueToLowerCase(this, "creatorAddress");
          }
        },
        name: {
          type: DataTypes.STRING,
          unique: "network_chain_unique"
        },
        description: DataTypes.STRING,
        colors: DataTypes.JSON,
        networkAddress: {
          type: DataTypes.STRING,
          get() {
            return getValueToLowerCase(this, "networkAddress");
          }
        },
        logoIcon: DataTypes.STRING,
        fullLogo: DataTypes.STRING,
        isClosed: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
        },
        isRegistered: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
        },
        councilMembers: {
          type: DataTypes.ARRAY(DataTypes.STRING)
        },
        chain_id: {
          type: DataTypes.INTEGER,
          unique: "network_chain_unique"
        },
        network_token_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "tokens",
            key: "id"
          }
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        allowCustomTokens: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
        },
        isDefault: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: false
        },
        councilAmount: {
          type: DataTypes.STRING,
          allowNull: true
        },
        disputableTime: {
          type: DataTypes.BIGINT,
          allowNull: true
        },
        draftTime: {
          type: DataTypes.BIGINT,
          allowNull: true
        },
        oracleExchangeRate: {
          type: DataTypes.FLOAT,
          allowNull: true
        },
        mergeCreatorFeeShare: {
          type: DataTypes.FLOAT,
          allowNull: true
        },
        percentageNeededForDispute: {
          type: DataTypes.FLOAT,
          allowNull: true
        },
        cancelableTime: {
          type: DataTypes.BIGINT,
          allowNull: true
        },
        proposerFeeShare: {
          type: DataTypes.FLOAT,
          allowNull: true
        },
        allowMerge: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        },
        banned_domains: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          defaultValue: []
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
    this.hasMany(models.issue, {
      foreignKey: "network_id",
      sourceKey: "id",
      as: "openIssues"
    });
    this.hasMany(models.repositories, {
      foreignKey: "network_id",
      sourceKey: "id"
    });

    this.hasMany(models.mergeProposal, {
      foreignKey: "network_id",
      sourceKey: "id",
      as: "mergeProposals"
    });

    this.hasMany(models.curator, {
      foreignKey: "networkId",
      sourceKey: "id",
      as: "curators"
    });

    this.belongsTo(models.chain, {
      foreignKey: "chain_id",
      targetKey: "chainId",
      as: "chain"
    });

    this.belongsTo(models.tokens, {
      foreignKey: "network_token_id",
      sourceKey: "id",
      as: "networkToken"
    });

    this.belongsToMany(models.tokens, {through: 'network_tokens'});
  }

  static findAllOfCreatorAddress(creatorAddress) {
    return this.findAll({
      where: {
        creatorAddress: Sequelize.where(Sequelize.fn("lower", Sequelize.col("creatorAddress")), creatorAddress?.toLowerCase())
      }
    });
  }

  static findOneByNetworkAddress(address, chainId = null) {
    return this.findOne({
      where: {
        networkAddress: Sequelize.where(Sequelize.fn("lower", Sequelize.col("networkAddress")), address?.toLowerCase()),
        ... chainId ? { chain_id: chainId } : {}
      }
    });
  }

  static findOneByNetworkAndChainNames(networkName, chainName) {
    return this.findOne({
      where: {
        name: Sequelize.where(Sequelize.fn("lower", Sequelize.col("name")), networkName?.toLowerCase())
      },
      include: [
        {
          association: "chain",
          required: true,
          where: {
            chainShortName: Sequelize.where(Sequelize.fn("lower", Sequelize.col("chainShortName")), chainName?.toLowerCase())
          }
        }
      ]
    });
  }
}

module.exports = Network;
