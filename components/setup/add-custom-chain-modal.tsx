import {Dispatch, SetStateAction, useState} from "react";
import {Col, Row} from "react-bootstrap";

import ColorInput from "components/color-input";
import {FormGroup} from "components/form-group";
import ImageUploader from "components/image-uploader";
import Modal from "components/modal";

import {MiniChainInfo} from "interfaces/mini-chain";

import useApi from "x-hooks/use-api";

interface AddCustomChainModalProps {
  show: boolean;
  add: (chain?: MiniChainInfo) => void;
}

export default function AddCustomChainModal({show, add}: AddCustomChainModalProps) {

  const [chainId, setChainId] = useState('');
  const [activeRPC, setActiveRPC] = useState('');
  const [explorer, setExplorer] = useState('');
  const [name, setName] = useState('')
  const [shortName, setShortName] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('');
  const [currencyName, setCurrencyName] = useState('');
  const [currencyDecimals, setCurrencyDecimals] = useState('');
  const [eventsApi, setEventsApi] = useState('');
  const [color, setColor] = useState('#4250e4');
  const [logo, setLogo] = useState({
    preview: "",
    raw: undefined as File
  });

  const { uploadFiles } = useApi();

  function getChainModel(): MiniChainInfo {
    return {
      name,
      shortName,
      chainId: +chainId,
      activeRPC,
      explorer,
      eventsApi,
      color,
      nativeCurrency: {
        name: currencyName,
        symbol: currencySymbol,
        decimals: +currencyDecimals
      },
      rpc: [],
      networkId: 0
    }
  }

  async function handleAddChain() {
    const result = logo?.raw ? await uploadFiles(logo?.raw).catch(() => null) : null;
    const ipfsHash = result?.at(0)?.hash;
    add({...getChainModel(), icon: ipfsHash });
  }

  const forms: [string, string, string,  Dispatch<SetStateAction<string>>][] = [
    ['chain id', '1', chainId, setChainId],
    ['chain name', 'Ethereum Mainnet', name, setName],
    ['chain short name', 'Ethereum', shortName, setShortName],
    ['chain currency name', 'Ether', currencyName, setCurrencyName],
    ['chain currency symbol', 'ETH', currencySymbol, setCurrencySymbol],
    ['chain currency decimals', '18', currencyDecimals, setCurrencyDecimals],
    ['chain rpc', 'https://', activeRPC, setActiveRPC],
    ['chain explorer', 'https://', explorer, setExplorer],
    ['chain events api', 'https://', eventsApi, setEventsApi],
  ]

  function makeRowColInput([label, placeholder, value, onChange]) {
    return <div key={label}>
      <Row>
        <Col className="mb-2">
          <FormGroup label={label} placeholder={placeholder} value={value} onChange={(nv) => onChange(nv)} />
        </Col>
      </Row>
    </div>
  }

  return <Modal show={show}
                title="Add custom chain"
                okLabel="add chain"
                okDisabled={forms.some(([,,v]) => !v)}
                onOkClick={handleAddChain}
                onCloseClick={() => add(null)}>

    <>
      {forms.map(makeRowColInput)}

      <ColorInput
        label="Chain Color"
        code={color}
        onChange={setColor}
        onlyColorCode
      />

    <Row className="mt-3 mb-2">
      <Col>Chain logo</Col>
    </Row>
    <Row>
      <Col xs="auto">
        <ImageUploader
          name="logoIcon"
          value={logo}
          onChange={setLogo}
          accept="image/*"
        />
      </Col>
    </Row>
    </>
  </Modal>
}