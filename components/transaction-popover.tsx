import React, { useContext, useEffect, useState } from 'react';
import {OverlayTrigger, Popover, } from 'react-bootstrap';
import {ApplicationContext} from 'contexts/application';
import TransactionIcon from '../assets/icons/transaction';
import DownloadIcon from '../assets/icons/download';
import UploadIcon from '../assets/icons/upload';
import CopyIcon from '../assets/icons/copy';
import ArrowGoTo from '../assets/icons/arrow-goto';
import ArrowRightSmall from '../assets/icons/arrow-ritght-small';
import { format } from 'date-fns';
import Modal from './modal'
import { Transactions, TransactionsStatus } from 'interfaces/transactions';

interface ITransactionModalProps{
    item: Transactions;
    onHide: ()=> void;
}

interface ITransactionProps{
    transactions: Transactions[];
    onClickItem:(item: object)=>void;
}
const handleColorState = (state: TransactionsStatus) => {
    switch(state.toLowerCase()) {
     case "pending": {
        return "secondary"
     }
     case "processing": {
        return "info"
     }
     case "approved": {
        return "info"
     }
     default: {
        return "info"
     }
    }
   }
const TransactionModal: React.FC<ITransactionModalProps> = ({item, onHide}) => {
    if(!item) return;
    return(
        <Modal 
        show={!!item} 
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
                    <div className={`bg-transparent rounded p-2 border border-${handleColorState(item?.status)} indicator`}>
                        <p className={`family-regular m-0 text-${handleColorState(item?.status)} text-capitalize`}>{item?.status}</p>
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
                From:  {`${item?.addressFrom.substr(0,6)}...${item?.addressFrom.substr(-4)}`}
                </p>
                <div className="mx-1">
                    <ArrowRightSmall/>
                </div>
                <p className="p-small mb-0">
                To:  {`${item?.addressTo.substr(0,6)}...${item?.addressTo.substr(-4)}`}
                </p>
            </div>
            <div className="d-flex flex-column align-items-start w-100">
                <div className="d-flex flex-row align-items-cenrter justify-content-between w-100 mb-3 p-3 bg transaction-modal box">
                    <span>Amount</span>
                    <span className="text-white">{item?.amount} {item?.amountType}</span>
                </div>
                <div className="d-flex flex-row align-items-cenrter justify-content-between w-100 mb-3 p-3 transaction-modal box">
                    <span>Confirmations</span>
                    <span className="text-white">{item?.confirmations > 23 ? 23 : item.confirmations}/23 Confirmations</span>
                </div>
                <div className="d-flex flex-row align-items-cenrter justify-content-between w-100 mb-3 p-3 transaction-modal box">
                    <span>Date</span>
                    <span className="text-white">{format(new Date(`${item?.date}`),"MMM d yyyy hh:mm:ss")}</span>
                </div>
            </div>
        </section>
        </Modal>
    )
}

const TransactionsBody: React.FC<ITransactionProps>= ({transactions, onClickItem})=> {
    
    if(!transactions || transactions.length < 1){
        return <h3 className="text-white fs-6 mx-5 text-nowrap family-medium">No ongoing transactions</h3>
    }

    return (
        <section className="d-flex flex-column align-items-start w-100 transaction">
            <div className="mb-3">
                <h3 className="family-bold m-0 fs-5 text-white">Ongoing transactions</h3>
            </div>
            <div className="d-flex flex-column align-items-start w-100">
                {transactions?.map((item)=>(
                    <div 
                    className="d-flex flex-row align-items-center justify-content-between px-3 py-2 mb-2 rounded transaction box" 
                    onClick={()=> onClickItem(item)}>
                    <div className="d-flex flex-row align-items-center justify-content-center">
                        <div className="d-flex justify-content-center align-item-center mr-2">
                            {item.type === 'lock'? <UploadIcon/> : <DownloadIcon/>}
                        </div>
                        <div className="d-flex flex-column align-items-start transaction header">
                            <h3 className="fs-6 mb-1 text-white family-inter-medium">{item?.amount} {item?.amountType}</h3>
                            <p className="m-0 family-inter-medium">{item?.type}</p>
                        </div> 
                    </div>
                    
                    <div className="d-flex flex-row align-items-center justify-content-center">
                        <div className={`bg-transparent px-3 py-2 rounded border border-${handleColorState(item?.status)} transaction status`}>
                            <p className={`family-regular m-0 text-${handleColorState(item?.status)} text-capitalize`}>{item?.status}</p>
                        </div>
                    </div>
                </div>
                ))}
            </div>
        </section>
    )
}

const TransactionPopover: React.FC = ({children}) => {
    const [isOpen,setOpen] = useState(false)
    const [modalItem, setModalItem] = useState<Transactions|null>(null)
    const {dispatch, state: {myTransactions}} = useContext(ApplicationContext);
    const handlerOpenModal = (item: Transactions) => {
        setOpen(false);
        setModalItem(item)
    }

    const overlay = (
    <Popover id={`transaction-popover`}>
        <Popover.Body>
            <TransactionsBody transactions={myTransactions} onClickItem={handlerOpenModal}/>
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
                {modalItem && <TransactionModal item={modalItem} onHide={()=> setModalItem(null)}/>}
            </div>
        </OverlayTrigger>
        )
}

export default TransactionPopover;