import {useState} from "react";

import {useTranslation} from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import Modal from "components/modal";

import {Token} from "interfaces/token";

import {useAppState} from "../contexts/app-state";
import { FormGroup } from "./form-group";

export default function ChangeTokenModal({
  show,
  setClose,
  description,
  setToken,
}:{
  show: boolean,
  setClose: () => void,
  description: string,
  setToken: (token: Token) => void
}) {
  const { t } = useTranslation(["common", "change-token-modal"]);

  const [address, setAddress] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState<boolean>();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [minAmount, setMinAmount] = useState('');

  const {state} = useAppState();

  async function loadContract() {
    if (address.trim() === "") {
      setDefaults();

      return;
    }
    
    try {
      setIsExecuting(true);

      if (!state.Service?.active.isAddress(address)) {
        setIsValidAddress(false);
        return;
      } 
      
      const token = await state.Service?.active.getERC20TokenData(address)
      setName(token.name);
      setSymbol(token.symbol);
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
    if (isValidAddress !== true) return;

    const token = { address, name, symbol, minimum: minAmount };
    
    setClose();
    setToken(token);
    setDefaults();
  }

  function handleInputchange(value) {
    setAddress(value);
    setIsValidAddress(undefined);
  }

  return (
    <Modal show={show} onCloseClick={handleClose} title={t("change-token-modal:title")} titlePosition="center" >
      <div className="container">
        <p className="caption-small trans mb-2 text-center">
            {description || t("change-token-modal:description")}
        </p>

        <div className="form-group mt-3">
          <label 
            htmlFor="" 
            className="caption-small mb-2 text-gray"
          >
            {t("change-token-modal:fields.address.label")}
          </label>
          <input 
            type="text" 
            className={`form-control rounded-4 ${isValidAddress === false ? 'is-invalid' : ''}`}
            value={address} 
            onChange={e => handleInputchange(e.target.value)} 
            onBlur={() => loadContract()} 
          />

          {
            isValidAddress === false ? 
            <small className="small-info text-danger">{t("change-token-modal:fields.address.error")}</small> : 
            <></>
          }
        </div>

        <div className="row">
          <div className="col-6">
            <div className="form-group">
              <label 
                htmlFor="" 
                className="caption-small mb-2 text-gray"
              >
                {t("change-token-modal:fields.name.label")}
              </label>
              
              <input type="text" className="form-control rounded-4" value={name} readOnly />
            </div>
          </div>

          <div className="col-6">
            <div className="form-group">
              <label 
                htmlFor="" 
                className="caption-small mb-2 text-gray"
              >
                {t("change-token-modal:fields.symbol.label")}
              </label>

              <input type="text" className="form-control rounded-4" value={symbol} readOnly />
            </div>
          </div>
          <div className="col-12"> 
          <FormGroup
            label={t("change-token-modal:fields.min-amount.label")}
            value={minAmount}
            variant="numberFormat"
            onChange={setMinAmount}
          />
          </div>
        </div>

        <div className="d-flex pt-2 justify-content-center">
          <Button
            className="mr-2"
            disabled={!(isValidAddress === true) || isExecuting}
            onClick={handleConfirm}
          >
            {!(isValidAddress === true)  && !isExecuting && (
              <LockedIcon />
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