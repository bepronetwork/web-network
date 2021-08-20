import React, { useState } from 'react';
import {OverlayTrigger, Popover, Button} from 'react-bootstrap';
import TransactionIcon from '../assets/icons/transaction';
import DownloadIcon from '../assets/icons/download';
import UploadIcon from '../assets/icons/upload';

const Transactions: React.FC = ()=> {
    return (
        <section className="d-flex flex-column align-items-start w-100">
            <div className="transaction__title">
                <h3>Ongoing transactions</h3>
            </div>
            <div className="d-flex flex-column align-items-start w-100">
                <div className="d-flex flex-row align-items-center justify-content-between transaction__box">
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
                <div className="d-flex flex-row align-items-center justify-content-between transaction__box">
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
    return (
        <OverlayTrigger
        trigger="click"
        placement={"bottom-end"}
        show={isOpen}
        rootClose
        overlay={
        <Popover id={`transaction-popover`}>
            <Popover.Body>
                <Transactions/>
            </Popover.Body>
        </Popover>
            }>
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
        </OverlayTrigger>
        )
}

export default TransactionPopover;