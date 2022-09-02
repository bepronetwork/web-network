const {
    Web3Connection,
    ERC20,
    BountyToken,
    Network_v2,
    NetworkFactoryV2,
    toSmartContractDecimals,
  } = require("@taikai/dappkit");
  
  const cap = toSmartContractDecimals("50000000", 18);
  
  const connection = new Web3Connection({
    web3Host: "http://127.0.0.1:8545",
    privateKey: "0xbb2ad8ec20f1503c4e5092b0360c16544b15ffbe12357ce0577626d3b2c382bf",
    debug: false,
    skipWindowAssignment: true
  });
  
  const DeployERC20 = async (tokenName, tokenSymbol, capital) => {
    const deployer = new ERC20(connection);
  
    await deployer.loadAbi();
  
    const address = await deployer.connection.getAddress();
  
    const tx = await deployer.deployJsonAbi(
      tokenName,
      tokenSymbol,
      capital,
      address
    );
  
    return tx.contractAddress;
  };
  
  const DeployBountyToken = async (tokenName, tokenSymbol) => {
    const deployer = new BountyToken(connection);
  
    await deployer.loadAbi();
  
    const address = await deployer.connection.getAddress();
  
    const tx = await deployer.deployJsonAbi(
      tokenName,
      tokenSymbol
    );
  
    return tx.contractAddress;
  };
  
  const DeployNetwork_v2 = async (settlerAddress, nftAddress, nftUri) => {
    const deployer = new Network_v2(connection);
  
    await deployer.loadAbi();
  
    const tx = await deployer.deployJsonAbi(settlerAddress, nftAddress, nftUri);
  
    return tx.contractAddress;
  };
  
  const DeployNetworkFactoryV2 = async (settlerToken) => {
    const deployer = new NetworkFactoryV2(connection);
  
    await deployer.loadAbi();
  
    const tx = await deployer.deployJsonAbi(settlerToken);
  
    return tx.contractAddress;
  }
  
  const InitialDeploy = async () => {
    await connection.start();
  
    const settlerAddress = await DeployERC20("VHCS Network", "VHCS", cap);
    const transactionalAddress = await DeployERC20("USD Coin", "USDC", cap);
    const rewardAddress = await DeployERC20("Reward Coin", "RWD", cap);
    const bountyTokenAddress = await DeployBountyToken("NFT Token", "NFT");
    const factoryAddress = await DeployNetworkFactoryV2(settlerAddress);
  
    const settler = new ERC20(connection, settlerAddress);
    const bountyToken = new BountyToken(connection, bountyTokenAddress);
    const transactional = new ERC20(connection, transactionalAddress);
    const factory = new NetworkFactoryV2(connection, factoryAddress);
  
    await settler.loadContract();
    await bountyToken.loadContract();
    await transactional.loadContract();
    await factory.loadContract();
  
    // Approve, lock and create a new network using the factory
    await settler.approve(factoryAddress, 1000000);
    await factory.lock(1000000);
    await factory.createNetwork(settlerAddress, bountyTokenAddress, '//');
  
    const networkAddress = await factory.networkOfAddress(await connection.getAddress());
  
    const networkObj = new Network_v2(connection, networkAddress);
  
    await networkObj.loadContract();
  
    await networkObj.claimGovernor();
  
    await bountyToken.setDispatcher(networkAddress);
  
    await networkObj.changeDraftTime(120);
    await networkObj.changeDisputableTime(120);
    await networkObj.changeCouncilAmount(102000);
  
    console.table({
      Settler: settlerAddress,
      Transactional: transactionalAddress,
      Reward: rewardAddress,
      BountyToken: bountyTokenAddress,
      Network_v2: networkAddress
    });
  
  };
  
  InitialDeploy();