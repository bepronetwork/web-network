import {useEffect, useState} from 'react';
import {Network, Application, ERC20Contract} from 'bepro-js-v1';

const options = {opt: {web3Connection: process.env.NEXT_PUBLIC_WEB3_CONNECTION},}

const networkOptions = {
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  ...options
}

const bepro = new Application(options);
const network = new Network(networkOptions);
const beproToken = new ERC20Contract({contractAddress: process.env.NEXT_PUBLIC_BEPRO_TOKEN, ...options})
let _started = false;

export default function useBEPRO() {
  const [started, setStarted] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(``);
  const [supply, setSupply] = useState(0);
  const [distributedAmount, setDistributionAmount] = useState(0);
  const [countdownDate, setCountdownDate] = useState(0);
  const [rewardPoolAmount, setRewardPoolAmount] = useState(0);
  const [stakedAmount, setStakedAmount] = useState(0);
  const [walletAmount, setWalletAmount] = useState(0);
  const [claimAmount, setClaimAmount] = useState(0);
  const [balance, setBalance] = useState(``);

  async function login() {
    let success;

     try {
       success = [await bepro.login(), await network.login(), await beproToken.login()].every(b => !!b);
       if (!success)
         throw new Error(`Failed to login`);
     } catch (e) {
       success = false;
       console.debug(`Failed to login`, e);
     }

     if (!success)
       return;

     setCurrentAddress(await bepro.getAddress());
  }

  function start() {
    if (_started) {
      setStarted(true);
      return;
    }

    (async function startOrLogin() {

      if (!started) {
        // await bepro.start()
        network.test = true;
        await network.start();
        await beproToken.start();

        _started = true;
        setStarted(true);
      } else await bepro.getAddress().then(setCurrentAddress);
    }())
  }

  function updateCurrentAddress() {
    (async function update() {
      if (!currentAddress)
        return;

      const {utils: {fromWei}, eth: {getBalance}} = bepro.web3;

      setBalance(fromWei(await getBalance(currentAddress), `ether`));
    }());

  }

  useEffect(start, []);
  useEffect(updateCurrentAddress, [currentAddress]);

  return {
    currentAddress,
    balance,
    supply,
    claimAmount,
    login,
    started,
    network, bepro, beproToken,
    web3: bepro.web3
  }
}
