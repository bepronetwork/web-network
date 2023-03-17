import {useCallback, useEffect, useState} from "react";

import {TransactionReceipt} from "@taikai/dappkit/dist/src/interfaces/web3-core";
import BigNumber from "bignumber.js";

import {useAppState} from "contexts/app-state";

import {parseTransaction} from "helpers/transactions";

import {TransactionStatus} from "interfaces/enums/transaction-status";
import {TransactionTypes} from "interfaces/enums/transaction-types";

import useBepro from "x-hooks/use-bepro";

import {addTx, updateTx} from "../contexts/reducers/change-tx-list";
import {MetamaskErrors} from "../interfaces/enums/Errors";

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
    network: state.Service?.active?.network?.contractAddress
  };

  const updateAllowanceAndBalance = useCallback(() => {
    if (!state.currentUser?.walletAddress || !address) return;

    state.Service?.active.getTokenBalance(address, state.currentUser.walletAddress)
      .then(setBalance)
      .catch(error => console.debug("useERC20:getTokenBalance", logData, error));

    const realSpender = spender || state.Service?.active?.network?.contractAddress;

    if (realSpender)
      state.Service?.active.getAllowance(address, state.currentUser.walletAddress, realSpender)
        .then(setAllowance)
        .catch(error => console.debug("useERC20:getAllowance", logData, error));
  }, [state.currentUser?.walletAddress, state.Service?.active, address]);

  function approve(amount: string) {
    if (!state.currentUser?.walletAddress || !state.Service?.active || !address || !amount) return;

    return handleApproveToken(address, amount, undefined, symbol).then(updateAllowanceAndBalance);
  }

  function setDefaults() {
    setName("");
    setSymbol("");
    setDecimals(18);
    setTotalSupply(BigNumber(0));
    setBalance(BigNumber(0));
    setAllowance(BigNumber(0));
  }

  useEffect(() => {
    if (!address) setLoadError(undefined);
    if (!address && name) setDefaults();
    if (state.Service?.active && address)
      state.Service?.active.getERC20TokenData(address)
        .then(({ name, symbol, decimals, totalSupply }) => {
          setName(name);
          setSymbol(symbol);
          setDecimals(decimals);
          setTotalSupply(totalSupply);
          setLoadError(false);
        })
        .catch(error => console.debug("useERC20:getERC20TokenData", logData, error));
        
    updateAllowanceAndBalance();
  }, [state.currentUser?.walletAddress, state.Service?.active, address]);

  async function deploy(name: string,
                        symbol: string,
                        cap: string,
                        ownerAddress: string): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{
        type: TransactionTypes.deployERC20Token,
        network: state.Service?.network?.active
      } as any]);

      dispatch(transaction);

      await state.Service?.active.deployERC20Token(name, symbol, cap, ownerAddress)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx([parseTransaction(txInfo, transaction.payload[0] as any)]));
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
    setAddress,
    setSpender,
    deploy,
    updateAllowanceAndBalance
  };
}
