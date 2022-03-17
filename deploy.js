const {
  Web3Connection,
  ERC20,
  NetworkFactory,
  toSmartContractDecimals
} = require('bepro-js')

const cap = toSmartContractDecimals('50000000', 18)

const SETTLER_TOKEN = {
  name: 'BEPRO',
  address: '0x3010BBa1805Df45Ef8dEcc07Cc2d5e0409565c3A'
}

const NETWORK_TOKEN = {
  name: 'VHC',
  address: '0xefD0748a6016b736D65d4Bd915cDa0E6b716b9D4'
}

const connection = new Web3Connection({
  web3Host: 'http://127.0.0.1:7545',
  privateKey:
    'b1bfe68577f6fd3b0dab8cd484b5731f6b9979c18f1eb932d44853bff0f66990',
  debug: true,
  skipWindowAssignment: true
})

const DeployERC20 = async (tokenName, tokenSymbol, capital) => {
  await connection.start()

  const deployer = new ERC20(connection)

  await deployer.loadAbi()

  const address = await deployer.connection.getAddress()

  deployer
    .deployJsonAbi(tokenName, tokenSymbol, capital, address)
    .then((tx) => console.log(`Contract Address: ${tx.contractAddress}`))
    .catch(console.log)
}

const TokenSummary = async (tokenName, contractAddress) => {
  await connection.start()

  const beproToken = new ERC20(connection, contractAddress)
  await beproToken.start()

  console.table({
    'Token Name': tokenName,
    'Token Address': contractAddress,
    'Total Supply': await beproToken.totalSupply(),
    'Account Balance': await beproToken.getTokenAmount(
      connection.Account.address
    ),
    'Account Address': connection.Account.address
  })
}

const DeployNetworkFactory = async () => {
  await connection.start()

  const deployer = new NetworkFactory(connection)

  await deployer.loadAbi()

  deployer
    .deployJsonAbi(SETTLER_TOKEN.address)
    .then((tx) => console.log(`Network Factory Address: ${tx.contractAddress}`))
    .catch(console.log)
}


const main = async () => {
  //await DeployERC20('BEPRO', '$BEPRO', cap)
  //await DeployERC20('VHC', '$VHC', cap)
  await TokenSummary(SETTLER_TOKEN.name, SETTLER_TOKEN.address)
  await TokenSummary(NETWORK_TOKEN.name, NETWORK_TOKEN.address)
  await DeployNetworkFactory()
}

main()
