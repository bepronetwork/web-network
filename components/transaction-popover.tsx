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
            <section className="d-flex flex-column align-items-start w-100 ">
            <div className="d-flex justify-content-center align-items-center w-100 transaction-modal__title">
                <h1>Details</h1>
            </div>
            <div className="d-flex flex-row justify-content-between w-100">
                <div className="d-flex flex-column transaction-modal__status">
                    <span>Status</span>
                    <div className="indicator orange">
                        <p>Pending</p>
                    </div>
                </div>
                <div className="d-flex flex-row align-items-end transaction-modal__btn-links">
                    <button>
                        <CopyIcon/>
                    </button>
                    <button>
                        <ArrowGoTo/>
                    </button>
                </div>
            </div>
            <div className="d-flex flex-row align-items-center justify-content-between w-100 transaction-modal__labels">
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
            <div className="d-flex flex-column align-items-start w-100 transaction-modal__box">
                <div className="d-flex flex-row align-items-cenrter justify-content-between w-100 transaction-modal__box-content">
                    <span>Amount</span>
                    <span className="white">210,000 $BEPRO</span>
                </div>
                <div className="d-flex flex-row align-items-cenrter justify-content-between w-100 transaction-modal__box-content">
                    <span>Confirmations</span>
                    <span className="white">0/23 Confirmations</span>
                </div>
                <div className="d-flex flex-row align-items-cenrter justify-content-between w-100 transaction-modal__box-content">
                    <span>Date</span>
                    <span className="white">April 8 2021 12:11:03 PM</span>
                </div>
            </div>
        </section>
        </Modal>
    )
}

const Transactions: React.FC<ITransactionProps>= ({onClickItem})=> {
    console.log("view")
    return (
        <section className="d-flex flex-column align-items-start w-100">
            <div className="transaction__title">
                <h3>Ongoing transactions</h3>
            </div>
            <div className="d-flex flex-column align-items-start w-100">
                <div className="d-flex flex-row align-items-center justify-content-between transaction__box" onClick={onClickItem}>
                    <div className="d-flex flex-row align-items-center justify-content-center">
                        <div className="d-flex justify-content-center align-item-center transaction__icon">
                            <DownloadIcon/>
                        </div>
                        <div className="d-flex flex-column align-items-start transaction__header">
                            <h3>10,000 Oracles</h3>
                            <p>Lock</p>
                        </div> 
                    </div>
                    <div className="d-flex flex-row align-items-center justify-content-center">
                        <div className="transaction__status">
                            <p>Processing</p>
                        </div>
                    </div>
                </div>
                <div className="d-flex flex-row align-items-center justify-content-between transaction__box" onClick={onClickItem}>
                    <div className="d-flex flex-row align-items-center justify-content-center">
                        <div className="d-flex justify-content-center align-item-center transaction__icon"><UploadIcon/></div>
                        <div className="d-flex flex-column align-items-start transaction__header">
                            <h3>210,000 $BEPRO</h3>
                            <p>Lock</p>
                        </div> 
                    </div>
                    <div className="d-flex flex-row align-items-center justify-content-center">
                        <div className="transaction__status orange">
                            <p>Pending</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

const Empty: React.FC = ()=> <h3 className="empty-title mx-5">No ongoing transactions</h3>

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