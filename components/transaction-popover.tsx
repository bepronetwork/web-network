import React, { useState } from 'react';
import {OverlayTrigger, Popover, Button} from 'react-bootstrap';
import TransactionIcon from '../assets/icons/transaction';

const Transactions: React.FC = ()=> {
    return (
        <div className="container">
        </div>
    )
}

const Empty: React.FC = ()=> <span className="title mx-5">No ongoing transactions</span>

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