async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("chains", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true
    },
    chainId: {
      type: Sequelize.INTEGER,
      unique: true
    },
    chainRpc: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    chainName: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    chainShortName: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false
    },
    chainCurrencyName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    chainCurrencySymbol: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    chainCurrencyDecimals: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    registryAddress: {
      type: Sequelize.STRING,
      allowNull: true
    },
    isDefault: {
      type: Sequelize.BOOLEAN
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  });

  await queryInterface.addColumn('networks', 'chain_id', {
    type: Sequelize.INTEGER,
    unique: true
  });

}

async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('chains');
  await queryInterface.removeColumn('networks', 'chain_id');
}

module.exports = {up, down}