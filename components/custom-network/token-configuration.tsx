import { useState } from "react";
import { FormCheck, ListGroup } from "react-bootstrap";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import Step from "components/step";
import TokensDropdown from "components/tokens-dropdown";

import { useNetwork } from "contexts/network";

import { BEPRO_TOKEN, Token } from "interfaces/token";



const { publicRuntimeConfig } = getConfig();

export default function TokenConfiguration({
    step,
    handleFinish,
    currentStep,
    handleChangeStep
}) {
  const { t } = useTranslation(["common", "custom-network"]);

  const [customTokens, setCustomTokens] = useState<Token[]>([BEPRO_TOKEN]);
  const [networkToken, setNetworkToken] = useState<Token>(BEPRO_TOKEN);
  const [allowCustomTransactionalTokens, setAllowCustomTransactionalTokens] = useState("false");

  const { activeNetwork } = useNetwork();

  function addToken(newToken: Token) {
    setCustomTokens([
      ...customTokens,
      newToken
    ]);
  }

  function handleCheck(e) {
    setAllowCustomTransactionalTokens(e.target.checked);
  }

  return (
    <Step
      title="Token Configuration"
      index={step}
      activeStep={currentStep}
      validated={true}
      handleClick={handleChangeStep}
      finishLabel={t("custom-network:steps.repositories.submit-label")}
      handleFinish={handleFinish}
    >
      <div className="row">
        <TokensDropdown 
          label="Network Token"
          description="Add an ERC20 token to be used as network token."
          defaultToken={BEPRO_TOKEN} 
          tokens={customTokens} 
          canAddToken={
            activeNetwork?.networkAddress === publicRuntimeConfig.contract.address ? 
            publicRuntimeConfig.networkConfig.allowCustomTokens :
            !!activeNetwork?.allowCustomTokens
          }
          addToken={addToken} 
          setToken={setNetworkToken}
        /> 
      </div>

      <div className="row">
        <div className="form-group col-3">
          <label className="caption-small mb-2">Name</label>
          <input type="text" className="form-control" value={networkToken?.name}  readOnly />
        </div>

        <div className="form-group col-3">
          <label className="caption-small mb-2">Symbol</label>
          <input type="text" className="form-control" value={networkToken?.symbol}  readOnly />
        </div>

        <div className="form-group col-6">
          <label className="caption-small mb-2">Address</label>
          <input type="text" className="form-control" value={networkToken?.address}  readOnly />
        </div>
      </div>

      <div className="row">
        <div className="d-flex align-items-center p-small text-white m-0 p-0">
          <FormCheck
            className="form-control-lg pb-0 pr-0 mr-0"
            type="checkbox"
            value={allowCustomTransactionalTokens}
            onChange={handleCheck}
          />
          <span>
            Allow users to use others tokens as Transactional Tokens
          </span>
        </div>
      </div>

      <div className="row">
        <ListGroup>
          <ListGroup.Item>Cras justo odio</ListGroup.Item>
        </ListGroup>
      </div>
    </Step>
  );
}
