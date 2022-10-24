import { useState, useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";

import { formatStringToCurrency } from "helpers/formatNumber";

import useERC20 from "x-hooks/use-erc20";

interface ERC20DetailsProps {
  address?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export function ERC20Details({
  address,
  readOnly,
  onChange
} : ERC20DetailsProps) {
  const [tokenAddress, setTokenAddress] = useState<string>("");
  
  const erc20 = useERC20();

  function handleInputChange(e) {
    setTokenAddress(e.target.value);
  }

  function handleBlur() {
    erc20.setAddress(tokenAddress);
  }

  const FormGroup = ({ label, value, readOnly = false, onChange = undefined, onBlur = undefined }) => 
    <Col>
      <Form.Group>
        <Form.Label className="caption-small">{label}</Form.Label>
        <Form.Control 
          type="text"
          {... {value, readOnly, onChange, onBlur}}
        />
      </Form.Group>
    </Col>;

  useEffect(() => {
    setTokenAddress(address);
    erc20.setAddress(address);
  }, [address]);

  useEffect(() => {
    if (erc20?.address && !erc20?.loadError && erc20?.address !== address)
      onChange(erc20.address);
  }, [erc20?.address, erc20?.loadError]);

  return(
    <>
      <Row className="mt-2">
        <FormGroup 
          label="Address"
          value={tokenAddress}
          readOnly={readOnly}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
      </Row>

      <Row className="mt-2">
        <FormGroup 
          label="Name"
          value={erc20?.name}
          readOnly
        />

        <FormGroup 
          label="Symbol"
          value={erc20?.symbol}
          readOnly
        />

        <FormGroup 
          label="Decimals"
          value={erc20?.decimals}
          readOnly
        />
      </Row>

      <Row className="mt-2">
        <FormGroup 
          label="Total Supply"
          value={formatStringToCurrency(erc20?.totalSupply?.toFixed())}
          readOnly
        />

        <FormGroup 
          label="Your Balance"
          value={formatStringToCurrency(erc20?.balance?.toFixed())}
          readOnly
        />
      </Row>
    </>
  );
}