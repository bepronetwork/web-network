import React, { useState } from 'react';
import {OverlayTrigger, Popover, Button} from 'react-bootstrap';
import TransactionIcon from '../assets/icons/transaction';

const Transactions: React.FC = ()=> {
    return (
        <div className="container transaction">
            <h3 className="title white">Ongoing transactions</h3>
            <div className="d-flex flex-row mb-3 transaction-card">
                <div className="p-2 bd-highlight">
                <i className="material-icons-outlined"></i>
                <span className="material-icons-outlined">
                    file_download
                    </span>
                </div>
                <div className="p-2 bd-highlight">Flex item 2</div>
            </div>
        </div>
    )
}

const Empty: React.FC = ()=> <h3 className="title mx-5">No ongoing transactions</h3>

const TransactionPopover: React.FC = ({children}) => {
    const [isOpen,setOpen] = useState(false)
    return (
        <OverlayTrigger
        trigger="click"
        key={"bottom"}
        placement={"bottom-end"}
        show={isOpen}
        rootClose
        overlay={
        <Popover id={`transaction-popover`}>
            <Popover.Body>
                <Empty/>
                {/* <Transactions/> */}
            </Popover.Body>
        </Popover>
            }>
            <button className="btn btn-md circle-2 btn-opac p-0 mr-1" onClick={()=> setOpen(!isOpen)}>
                {isOpen
                ?(
                <span 
                className="spinner-border spinner-border-sm" 
                role="status" 
                aria-hidden="true">
                </span>)
                :<TransactionIcon/>}
            </button>
        </OverlayTrigger>
        )
}

export default TransactionPopover;