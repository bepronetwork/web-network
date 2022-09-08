import { useCallback, useEffect, useState } from "react";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";

import useBepro from "x-hooks/use-bepro";

export default function useERC20() {
  const [balance, setBalance] = useState(0);
  const [name, setName] = useState<string>();
  const [decimals, setDecimals] = useState(18); 
  const [allowance, setAllowance] = useState(0);
  const [symbol, setSymbol] = useState<string>();
  const [address, setAddress] = useState<string>();

  const { wallet } = useAuthentication();
  const { service: DAOService } = useDAO();
  const { handleApproveToken } = useBepro();

  const logData = { 
    wallet: wallet?.address, 
    token: address, 
    network: DAOService?.network?.contractAddress 
  };

  const updateAllowanceAndBalance = useCallback(() => {
    if (!wallet?.address || !DAOService?.network?.contractAddress || !address) return;

    DAOService.getTokenBalance(address, wallet.address)
      .then(setBalance)
      .catch(error => console.debug("useERC20:getTokenBalance", logData, error));

    DAOService.getAllowance(address, wallet.address, DAOService.network.contractAddress)
      .then(setAllowance)
      .catch(error => console.debug("useERC20:getAllowance", logData, error));
  }, [wallet?.address, DAOService, address]);

  const approve = useCallback((amount: number) => {
    if (!wallet?.address || !DAOService || !address || !amount) return;

    return handleApproveToken(address, amount).then(updateAllowanceAndBalance);
  }, [wallet?.address, DAOService, address]);

  useEffect(() => {
    if (DAOService && address) 
      DAOService.getERC20TokenData(address)
        .then(({ name, symbol, decimals }) => {
          setName(name);
          setSymbol(symbol);
          setDecimals(decimals);
        })
        .catch(error => console.debug("useERC20:getERC20TokenData", logData, error));
        
    updateAllowanceAndBalance();
  }, [wallet?.address, DAOService, address]);

  return {
    name,
    decimals,
    symbol,
    allowance,
    balance,
    address,
    setAddress,
    approve,
    updateAllowanceAndBalance
  };
}