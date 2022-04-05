import { useState } from "react";

import { ERC20 } from "dappkit";
import { useTranslation } from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import Modal from "components/modal";

import { Token } from "interfaces/token";

import { BeproService } from "services/bepro-service";

export default function ChangeTokenModal({
  show,
  setClose,
  setToken = (newToken: Token) => {}
}) {
  const { t } = useTranslation("common");
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [contract, setContract] = useState<ERC20>();
  const [isExecuting, setIsExecuting] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState<boolean>();

  async function loadContract() {
    if (address.trim() === "") {
      setDefaults();

      return;
    }
    
    try {
      setIsExecuting(true);

      if (!BeproService.bepro.utils.isAddress(address)) {
        setIsValidAddress(false);
        return;
      }

      const erc20 = new ERC20(BeproService.bepro, address);

      await erc20.loadContract();

      setName(await erc20.name());
      setSymbol(await erc20.symbol());
      setContract(erc20);
      setIsValidAddress(true);
    } catch (error) {
      setIsValidAddress(false);
    } finally {
      setIsExecuting(false);
    }
  }

  function setDefaults() {
    setAddress("");
    setName("");
    setSymbol("");
    setIsExecuting(false);
    setIsValidAddress(undefined);
  }

  function handleClose() {
    setDefaults();
    setClose();
  }

  function handleConfirm() {
    if (!(isValidAddress === true)) return;

    const token = { address, name, symbol };
    
    setClose();
    setToken(token);
    setDefaults();
  }

  function handleInputchange(value) {
    setAddress(value);
    setIsValidAddress(undefined);
  }

  return (
    <Modal show={show} onCloseClick={handleClose} title="Add Token" titlePosition="center">
      <div className="container">
        <p className="caption-small trans mb-2 text-center">
            Add an ERC20 token to use on this Bounty
        </p>

        <div className="form-group mt-3">
          <label htmlFor="" className="caption-small mb-2 text-gray">Address</label>
          <input 
            type="text" 
            className={`form-control rounded-4 ${isValidAddress === false ? 'is-invalid' : ''}`}
            value={address} 
            onChange={e => handleInputchange(e.target.value)} 
            onBlur={() => loadContract()} 
          />

          {
            isValidAddress === false ? 
            <small className="small-info text-danger">Invalid address provided!</small> : 
            <></>
          }
        </div>

        <div className="row">
          <div className="col-6">
            <div className="form-group">
              <label htmlFor="" className="caption-small mb-2 text-gray">Name</label>
              <input type="text" className="form-control rounded-4" value={name} readOnly />
            </div>
          </div>

          <div className="col-6">
            <div className="form-group">
              <label htmlFor="" className="caption-small mb-2 text-gray">Symbol</label>
              <input type="text" className="form-control rounded-4" value={symbol} readOnly />
            </div>
          </div>
        </div>

        <div className="d-flex pt-2 justify-content-center">
          <Button
            className="mr-2"
            disabled={!(isValidAddress === true) || isExecuting}
            onClick={handleConfirm}
          >
            {!(isValidAddress === true)  && !isExecuting && (
              <LockedIcon className="me-2" />
            )}
            <span>{t("actions.confirm")}</span>
            {isExecuting ? (
              <span className="spinner-border spinner-border-xs ml-1" />
            ) : (
              ""
            )}
          </Button>
          <Button color="dark-gray" onClick={handleClose}>
            {t("actions.cancel")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}