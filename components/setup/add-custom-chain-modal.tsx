import {useState} from "react";
import {Col, Row} from "react-bootstrap";

import {MiniChainInfo} from "../../interfaces/mini-chain";
import {FormGroup} from "../form-group";
import Modal from "../modal";

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


  function getChainModel(): MiniChainInfo {
    return {
      name,
      shortName,
      chainId: +chainId,
      activeRPC,
      explorer,
      eventsApi,
      nativeCurrency: {
        name: currencyName,
        symbol: currencySymbol,
        decimals: +currencyDecimals
      },
      rpc: [],
      networkId: 0
    }
  }

  const forms: [string, string, any, any][] = [
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
                onOkClick={() => add(getChainModel())}
                onCloseClick={() => add(null)}>

    {forms.map(makeRowColInput)}
  </Modal>
}