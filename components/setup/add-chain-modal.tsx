import React, {useState} from "react";
import {Col, FormControl, Row} from "react-bootstrap";

import ColorInput from "components/color-input";
import Modal from "components/modal";
import ReactSelect from "components/react-select";

import {MiniChainInfo} from "interfaces/mini-chain";

interface AddChainModalProps {
  chain: MiniChainInfo;
  show: boolean;
  add: (chain: MiniChainInfo) => void;
}

export default function AddChainModal({
  chain, 
  show, 
  add
}: AddChainModalProps) {
  if (!show)
    return <></>

  const [activeRPC, setActiveRPC] = useState(chain?.rpc?.[0]);
  const [eventsApi, setEventsApi] = useState('');
  const [explorer, setExplorer] = useState('');
  const [color, setColor] = useState('');

  function validUrl(url: string) {
    try { return new URL(url)?.protocol?.search(/https?:/) > -1}
    catch { return false; }
  }

  return <Modal show={show} okLabel={'add chain'}
                title="Configure RPC"
                onOkClick={() => add({...chain, activeRPC, eventsApi, explorer, color})}
                okDisabled={!validUrl(activeRPC) || !validUrl(eventsApi) || !validUrl(explorer)}
                onCloseClick={() => add(null)}>
    <Row>
      <Col>{chain?.name || chain?.shortName}</Col>
    </Row>
    <Row className="mt-3 mb-2"><Col>Currency</Col></Row>
    <Row>
      <Col>{chain?.nativeCurrency?.name}</Col>
      <Col>{chain?.nativeCurrency?.symbol}</Col>
    </Row>
    <Row className="mt-3 mb-2">
      <Col>Select RPC</Col>
    </Row>
    <Row>
      <ReactSelect defaultValue={{value: chain.rpc[0], label: chain.rpc[0]}}
                   options={chain.rpc.map(s => ({value: s, label: s}))}
                   onChange={e => {setActiveRPC(e.value)}}></ReactSelect>
    </Row>
    <Row className="mt-3 mb-2">
      <Col>Configure RPC</Col>
    </Row>
    <Row>
      <Col>
        <FormControl
          value={activeRPC}
          className="p-2"
          onChange={e => setActiveRPC(e?.target?.value)} />
      </Col>
    </Row>
    <Row className="mt-3 mb-2">
      <Col>Configure Events Api</Col>
    </Row>
    <Row>
      <Col>
        <FormControl
          value={eventsApi}
          className="p-2"
          onChange={e => setEventsApi(e?.target?.value)} />
      </Col>
    </Row>
    <Row className="mt-3 mb-2">
      <Col>Configure Explorer</Col>
    </Row>
    <Row>
      <Col>
        <FormControl
          value={explorer}
          className="p-2"
          onChange={e => setExplorer(e?.target?.value)} />
      </Col>
    </Row>
    <Row>
      <Col>
        <ColorInput
          label="Chain Color"
          code={color}
          onChange={setColor}
          onlyColorCode
        />
      </Col>
    </Row>
  </Modal>
}