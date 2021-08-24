import React, { useEffect, useState } from 'react';
import {OverlayTrigger, Popover, } from 'react-bootstrap';
import TransactionIcon from '../assets/icons/transaction';
import DownloadIcon from '../assets/icons/download';
import UploadIcon from '../assets/icons/upload';
import CopyIcon from '../assets/icons/copy';
import ArrowGoTo from '../assets/icons/arrow-goto';
import ArrowRightSmall from '../assets/icons/arrow-ritght-small';

import Modal from './modal'

interface ITransactionModalProps{
    item: any;
    onHide: ()=> void;
}

interface ITransactionProps{
    onClickItem:(item: object)=>void;
}

const TransactionModal: React.FC<ITransactionModalProps> = ({item, onHide}) => {
    return(
        <Modal 
        show={item} 
        key="transaction-modal"
        centered 
        size="sm"
        backdrop={true}
        onHide={onHide}>
            <section className="d-flex flex-column align-items-start w-100">
            <div className="d-flex justify-content-center align-items-center w-100">
                <h1 className="family-bold fs-2 text-white">Details</h1>
            </div>
            <div className="d-flex flex-row justify-content-between w-100">
                <div className="d-flex flex-column transaction-modal status">
                    <span className="family-inter-medium mb-2">Status</span>
                    <div className="bg-transparent rounded p-2 border border-secondary indicator">
                        <p className="family-regular m-0 text-secondary">Pending</p>
                    </div>
                </div>
                <div className="d-flex flex-row align-items-end">
                    <button className="border-0 rounded mx-1 bg-dark">
                        <CopyIcon/>
                    </button>
                    <button className="border-0 rounded mx-1 bg-dark">
                        <ArrowGoTo/>
                    </button>
                </div>
            </div>
            <div className="d-flex flex-row align-items-center justify-content-between w-100 my-4">
                <p className="p-small mb-0">
                From: 0x442d0fc...
                </p>
                <div>
                    <ArrowRightSmall/>
                </div>
                <p className="p-small mb-0">
                To: 0x442d20fc...
                </p>
            </div>
            <div className="d-flex flex-column align-items-start w-100">
                <div className="d-flex flex-row align-items-cenrter justify-content-between w-100 mb-3 p-3 bg transaction-modal box">
                    <span>Amount</span>
                    <span className="text-white">210,000 $BEPRO</span>
                </div>
                <div className="d-flex flex-row align-items-cenrter justify-content-between w-100 mb-3 p-3 transaction-modal box">
                    <span>Confirmations</span>
                    <span className="text-white">0/23 Confirmations</span>
                </div>
                <div className="d-flex flex-row align-items-cenrter justify-content-between w-100 mb-3 p-3 transaction-modal box">
                    <span>Date</span>
                    <span className="text-white">April 8 2021 12:11:03 PM</span>
                </div>
            </div>
        </section>
        </Modal>
    )
}

const Transactions: React.FC<ITransactionProps>= ({onClickItem})=> {
    return (
        <section className="d-flex flex-column align-items-start w-100 transaction">
            <div className="mb-3">
                <h3 className="family-bold m-0 fs-5 text-white">Ongoing transactions</h3>
            </div>
            <div className="d-flex flex-column align-items-start w-100">
                <div className="d-flex flex-row align-items-center justify-content-between px-3 py-2 mb-2 rounded transaction box" onClick={onClickItem}>
                    <div className="d-flex flex-row align-items-center justify-content-center">
                        <div className="d-flex justify-content-center align-item-center mr-2">
                            <DownloadIcon/>
                        </div>
                        <div className="d-flex flex-column align-items-start transaction header">
                            <h3 className="fs-6 mb-1 text-white family-inter-medium">10,000 Oracles</h3>
                            <p className="m-0 family-inter-medium">Lock</p>
                        </div> 
                    </div>
                    <div className="d-flex flex-row align-items-center justify-content-center">
                        <div className="bg-transparent px-3 py-2 rounded border border-info transaction status">
                            <p className="family-regular m-0 text-info">Processing</p>
                        </div>
                    </div>
                </div>
                <div className="d-flex flex-row align-items-center justify-content-between px-3 py-2 mb-2 rounded transaction box" onClick={onClickItem}>
                    <div className="d-flex flex-row align-items-center justify-content-center">
                        <div className="d-flex justify-content-center align-item-center mr-2"><UploadIcon/></div>
                        <div className="d-flex flex-column align-items-start transaction header">
                            <h3 className="fs-6 mb-1 text-white family-inter-medium">210,000 $BEPRO</h3>
                            <p className="m-0 family-inter-medium">Lock</p>
                        </div> 
                    </div>
                    <div className="d-flex flex-row align-items-center justify-content-center">
                        <div className="bg-transparent px-3 py-2 rounded border border-secondary transaction status">
                        <p className="family-regular m-0 text-secondary">Pending</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

const Empty: React.FC = ()=> <h3 className="text-white fs-6 mx-5 text-nowrap empty-title">No ongoing transactions</h3>

const TransactionPopover: React.FC = ({children}) => {
    const [isOpen,setOpen] = useState(false)
    const [transactions, setTransactions] = useState([])
    const [modalItem, setModalItem] = useState<object|null>(null)

    const handlerOpenModal = (item: object) => {
        setOpen(false);
        setModalItem({})
    }

    const overlay = (
    <Popover id={`transaction-popover`}>
        <Popover.Body>
            {transactions? <Transactions onClickItem={handlerOpenModal}/> :<Empty/>}
        </Popover.Body>
    </Popover>
    )
    return (
        <OverlayTrigger
        trigger="click"
        placement={"bottom-end"}
        show={isOpen}
        rootClose
        overlay={overlay}>
            <div>
                <button className="btn btn-md circle-2 btn-opac p-0 mr-1" onClick={()=> setOpen(!isOpen)}>
                    {isOpen
                        ?(<span 
                            className="spinner-border spinner-border-sm" 
                            role="status" 
                            aria-hidden="true">
                            </span>)
                        : <TransactionIcon/>
                    }
                </button>
                <TransactionModal item={modalItem} onHide={()=> setModalItem(null)}/>
            </div>
        </OverlayTrigger>
        )
}

export default TransactionPopover;