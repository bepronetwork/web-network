import React, {useState} from "react";
import {Col, FormControl, Row} from "react-bootstrap";

import {MiniChainInfo} from "../../interfaces/mini-chain";
import Modal from "../modal";
import ReactSelect from "../react-select";

export default function AddChainModal({chain, show, add}: {chain: MiniChainInfo, show: boolean, add: (chain: MiniChainInfo) => void}) {
  if (!show)
    return <></>

  const [activeRPC, setActiveRPC] = useState(chain?.rpc?.[0]);

  return <Modal show={show} okLabel={'add chain'}
                title="Configure RPC"
                onOkClick={() => add({...chain, activeRPC})} okDisabled={!activeRPC}
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
  </Modal>
}