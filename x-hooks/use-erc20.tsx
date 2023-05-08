import {useEffect, useState} from "react";

import {TransactionReceipt} from "@taikai/dappkit/dist/src/interfaces/web3-core";
import BigNumber from "bignumber.js";

import {useAppState} from "contexts/app-state";
import {addTx, updateTx} from "contexts/reducers/change-tx-list";

import { UNSUPPORTED_CHAIN } from "helpers/constants";
import {parseTransaction} from "helpers/transactions";

import {MetamaskErrors} from "interfaces/enums/Errors";
import {TransactionStatus} from "interfaces/enums/transaction-status";
import {TransactionTypes} from "interfaces/enums/transaction-types";
import { SimpleBlockTransactionPayload } from "interfaces/transaction";

import useBepro from "x-hooks/use-bepro";

export default function useERC20() {
  const [name, setName] = useState<string>();
  const [decimals, setDecimals] = useState(18);
  const [symbol, setSymbol] = useState<string>();
  const [spender, setSpender] = useState<string>();
  const [address, setAddress] = useState<string>();
  const [balance, setBalance] = useState(BigNumber(0));
  const [loadError, setLoadError] = useState<boolean>();
  const [allowance, setAllowance] = useState(BigNumber(0));
  const [totalSupply, setTotalSupply] = useState(BigNumber(0));

  const { state, dispatch } = useAppState();
  const { handleApproveToken } = useBepro();

  const logData = { 
    wallet: state.currentUser?.walletAddress,
    token: address, 
    network: state.Service?.active?.network?.contractAddress,
    service: state.Service?.active
  };

  const isServiceReady = 
    !state.Service?.starting && !state.spinners?.switchingChain && state.Service?.active?.web3Connection?.started;

  function updateAllowanceAndBalance() {
    if (!state.currentUser?.walletAddress ||
        !address ||
        !name ||
        !isServiceReady ||
        state.connectedChain?.name === UNSUPPORTED_CHAIN) return;

    state.Service?.active.getTokenBalance(address, state.currentUser.walletAddress)
      .then(setBalance)
      .catch(error => console.debug("useERC20:getTokenBalance", logData, error));

    const realSpender = spender || state.Service?.active?.network?.contractAddress;

    if (realSpender)
      state.Service?.active.getAllowance(address, state.currentUser.walletAddress, realSpender)
        .then(setAllowance)
        .catch(error => console.debug("useERC20:getAllowance", logData, error));
  }

  function approve(amount: string) {
    if (!state.currentUser?.walletAddress || !state.Service?.active || !address || !amount) return;

    return handleApproveToken(address, amount, undefined, symbol).then(updateAllowanceAndBalance);
  }

  function setDefaults(newAddress?: string) {
    if (newAddress)
      setAddress(newAddress);
    setName("");
    setSymbol("");
    setDecimals(18);
    setTotalSupply(BigNumber(0));
    setBalance(BigNumber(0));
    setAllowance(BigNumber(0));
  }

  useEffect(() => {
    if (!address) {
      setLoadError(undefined);
      
      if (name)
        setDefaults();
    } else if (address && !name && isServiceReady)
      state.Service?.active.getERC20TokenData(address)
        .then(async ({ name, symbol, decimals, totalSupply }) => {
          setName(name);
          setSymbol(symbol);
          setDecimals(decimals);
          setTotalSupply(totalSupply);
          setLoadError(false);
        })
        .catch(error => console.debug("useERC20:getERC20TokenData", logData, error));
  }, [state.currentUser?.walletAddress, address, name, isServiceReady]);

  useEffect(() => {
    updateAllowanceAndBalance();
  }, [state.currentUser?.walletAddress, isServiceReady, state.connectedChain, name]);

  async function deploy(name: string,
                        symbol: string,
                        cap: string,
                        ownerAddress: string): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{
        type: TransactionTypes.deployERC20Token,
        network: state.Service?.network?.active
      }]);

      dispatch(transaction);

      await state.Service?.active.deployERC20Token(name, symbol, cap, ownerAddress)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx([parseTransaction(txInfo, transaction.payload[0] as SimpleBlockTransactionPayload)]));
          resolve(txInfo);
        })
        .catch((err) => {
          dispatch(updateTx([{
            ...transaction.payload[0],
            status: err?.code === MetamaskErrors.UserRejected ? TransactionStatus.rejected : TransactionStatus.failed,
          }]));
          reject(err);
        });
    });
  }

  function _setAddress(_address: string) {
    if (_address?.toLowerCase() !== address?.toLowerCase())
      setDefaults(_address);
  }

  function _setSpender(_address: string) {
    if (_address?.toLowerCase() !== address?.toLowerCase())
      setSpender(_address);
  }

  return {
    name,
    symbol,
    balance,
    address,
    decimals,
    loadError,
    allowance,
    totalSupply,
    approve,
    setAddress: _setAddress,
    setSpender: _setSpender,
    deploy,
    updateAllowanceAndBalance
  };
}
