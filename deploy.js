const {
  Web3Connection,
  ERC20,
  NetworkFactory,
  toSmartContractDecimals,
  Network,
} = require("@taikai/dappkit");

const keys = require("./ganache/keys.json");
const fs = require("fs");

const cap = toSmartContractDecimals("50000000", 18);

const pathEnvExample = "./.env";
const pathEnv = "./.env-true";

/*  const SETTLER_TOKEN = {
    name: 'BEPRO',
    address: '0x3010BBa1805Df45Ef8dEcc07Cc2d5e0409565c3A'
  }
  
  const NETWORK_TOKEN = {
    name: 'VHC',
    address: '0xefD0748a6016b736D65d4Bd915cDa0E6b716b9D4'
  }

  */

const connection = new Web3Connection({
  web3Host: "http://127.0.0.1:8545",
  privateKey: "0xdf2bd7bf3d120db2e9e209bc4aa1aae57261bb8b65128c864601a4abf8ecbf51" || Object.values(keys.private_keys)[0],
  debug: true,
  skipWindowAssignment: true,
});

const DeployERC20andNetwork = async (tokenName, tokenSymbol, capital) => {
  return new Promise(async (resolve, reject) => {
    await connection.start();

    const deployer = new ERC20(connection);

    await deployer.loadAbi();

    const address = await deployer.connection.getAddress();

    deployer
      .deployJsonAbi(tokenName, tokenSymbol, capital, address)
      .then(async (tx) => {
        console.log(`ERC20 Contract Address: ${tx.contractAddress}`);
        const network = new Network(connection);
        await network.loadAbi();
        await network
          .deployJsonAbi(tx.contractAddress, tx.contractAddress, address)
          .then((txNetwork) => {
            console.log("Network Contract Address", txNetwork.contractAddress);
            resolve({
              ERC20: tx.contractAddress,
              Network: txNetwork.contractAddress,
            });
          });
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

const TokenSummary = async (tokenName, contractAddress) => {
  await connection.start();

  const beproToken = new ERC20(connection, contractAddress);
  await beproToken.start();

  console.table({
    "Token Name": tokenName,
    "Token Address": contractAddress,
    "Total Supply": await beproToken.totalSupply(),
    "Account Balance": await beproToken.getTokenAmount(
      connection.Account.address
    ),
    "Account Address": connection.Account.address,
  });
};

const DeployNetworkFactory = async () => {
  await connection.start();

  const deployer = new NetworkFactory(connection);

  await deployer.loadAbi();

  deployer
    .deployJsonAbi(SETTLER_TOKEN.address)
    .then((tx) => console.log(`Network Factory Address: ${tx.contractAddress}`))
    .catch(console.log);
};

const main = async () => {
  DeployERC20andNetwork("BEPRO", "$BEPRO", cap)
  
  
  /*.then((contract) => {
    fs.copyFile(pathEnvExample, pathEnv, (err) => {
      if (err) {
        console.log("Error Found:", err);
      } else {
        const TextsAddress = `

NEXT_PUBLIC_CONTRACT_ADDRESS=${contract.Network}
NEXT_PUBLIC_SETTLER_ADDRESS=${contract.ERC20}
NEXT_PUBLIC_TRANSACTION_ADDRESS=${contract.ERC20}
        `;

        fs.writeFile(pathEnv, TextsAddress, { flag: "a+" }, (err) => {
          if (err) console.log("err writeFile -> ", err);
        });
      }
    });
  });*/
};

main();
