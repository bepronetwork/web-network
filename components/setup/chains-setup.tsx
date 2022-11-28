import {useAppState} from "../../contexts/app-state";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {Col, FormControl, InputGroup, Row} from "react-bootstrap";
import SearchIcon from "../../assets/icons/search-icon";
import CloseIcon from "../../assets/icons/close-icon";
import {useTranslation} from "next-i18next";
import {ContextualSpan} from "../contextual-span";
import PlusIcon from "../../assets/icons/plus-icon";
import Button from "../button";
import useApi from "../../x-hooks/use-api";
import LoadingDots from "../../assets/icons/loading-dots";
import {changeLoadState} from "../../contexts/reducers/change-load";
import {MiniChainInfo} from "../../interfaces/mini-chain";
import AddChainModal from "./add-chain-modal";
import {toastError, toastSuccess} from "../../contexts/reducers/change-toaster";

export default function ChainsSetup() {
  const {state, dispatch} = useAppState();
  const { t } = useTranslation(["common"]);
  const [chains, setChains] = useState<MiniChainInfo[]>([]);
  const [filteredChains, setFilteredChains] = useState<MiniChainInfo[]>([]);
  const [search, setSearch] = useState('');
  const [timer, setTimer] = useState<any>(null);
  const [existingState, setExistingState] = useState<number[]>([]);
  const [showChainModal, setShowChainModal] = useState<MiniChainInfo|null>(null);

  const api = useApi();

  function updateMiniChainInfo() {
    if (chains.length)
      return;

    dispatch(changeLoadState(true))
    axios.get(`https://chainid.network/chains_mini.json`)
      .then(({data}) => data)
      .then(setChains)
      .catch(e => {
        console.error(`Failed to grep chain_mini`, e);
        return [];
      })
      .finally(() => {
        dispatch(changeLoadState(false))
      })
  }

  function handleSearch() {

    const lookFor = (t) => t.toLowerCase().search(search.toLowerCase()) > -1;

    const filter = chains.filter(chain =>
      lookFor(chain.name) || lookFor(chain.shortName) || lookFor(chain.nativeCurrency?.symbol))

    setFilteredChains(filter);
  }

  function changeExistingState() {
    setExistingState(state?.supportedChains.map(({chainId}) => chainId));
  }

  function addChain(chain: MiniChainInfo) {
    if (!chain) {
      setShowChainModal(null);
      return;
    }

    api.addSupportedChain(chain)
      .then(success => {
        dispatch(success ? toastSuccess(`added chain ${chain.name}`) : toastError(`Failed to add chain ${chain.name}`));
        if (success)
          setShowChainModal(null);
      })
  }

  function makeAddRemoveButton(chain: MiniChainInfo) {
    const exists = existingState.includes(chain.chainId);

    if (chain.loading)
      return <Button outline><LoadingDots /></Button>;

    return <Button outline
                   onClick={() => !exists ? setShowChainModal(chain) : api.deleteSupportedChain(chain)}
                   textClass="text-white">
      {!exists ? <PlusIcon /> : <CloseIcon />}
    </Button>
  }

  function makeChainRow(chain: MiniChainInfo) {
    if (!chain.rpc.length)
      return <></>;

    return <Row>
      <Col>
        <Row>
          <Col>{chain?.name || chain?.shortName}</Col>
        </Row>
        <Row>
          <Col>{chain?.nativeCurrency?.name}</Col>
          <Col>{chain?.nativeCurrency?.symbol}</Col>
          <Col className="col-1">
            {makeAddRemoveButton(chain)}
          </Col>
        </Row>
      </Col>
    </Row>
  }

  useEffect(updateMiniChainInfo, [])
  useEffect(handleSearch, [search])
  useEffect(changeExistingState, [state?.supportedChains]);

  return <>
    <div className="content-wrapper border-top-0 p-3">
      <div className="row">
        <div className="col">
          <InputGroup className="border-radius-8">
            <InputGroup.Text className="cursor-pointer" onKeyDown={(e) => e?.key === "Enter" ? handleSearch() : null}>
              <SearchIcon onClick={handleSearch} />
            </InputGroup.Text>

            <FormControl
              value={search}
              className="p-2"
              placeholder={t("search")}
              onChange={e => setSearch(e?.target?.value)} />

            <button
              className="btn bg-black border-0 py-0 px-3"
              onClick={() => setSearch('')}>
              <CloseIcon width={10} height={10} />
            </button>

          </InputGroup>
        </div>
      </div>
      {!filteredChains.length && search && <ContextualSpan context="info">No chains containing {search} </ContextualSpan>}
      <hr/>
      {((filteredChains.length > 0 ? filteredChains : chains).map(makeChainRow))}
      <AddChainModal chain={showChainModal} show={!!showChainModal} add={addChain} />
    </div>
  </>

}