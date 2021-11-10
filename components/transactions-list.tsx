import React, {useContext} from 'react';
import {ApplicationContext} from '@contexts/application';
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import UploadIcon from '@assets/icons/upload';
import DownloadIcon from '@assets/icons/download';
import HelpIcon from '@assets/icons/help-icon';
import {Transaction} from '@interfaces/transaction';
import TransactionStats from '@components/transaction-stats';
import TransactionType from '@components/transaction-type';
import InformationChatBubble from '@assets/icons/information-chat-bubble';
import ThumbsUp from '@assets/icons/thumbs-up';
import CenterArrows from '@assets/icons/center-arrows';
import CrossArrow from '@assets/icons/cross-arrow';
import ChatBubbles from '@assets/icons/chat-bubbles';
import ChatBubbleCross from '@assets/icons/chat-bubble-cross';
import ReturnArrow from '@assets/icons/return-arrow';
import {formatNumberToCurrency} from 'helpers/formatNumber'
import CloseIssueIcon from '@assets/icons/close-issue';
export default function TransactionsList({onActiveTransaction = (transaction) => {}}) {
  const {state: {myTransactions}} = useContext(ApplicationContext);

  const IconMaps = {
    [TransactionTypes.openIssue]: <InformationChatBubble />,
    [TransactionTypes.lock]: <UploadIcon/>,
    [TransactionTypes.unlock]: <DownloadIcon/>,
    [TransactionTypes.approveTransactionalERC20Token]: <ThumbsUp />,
    [TransactionTypes.delegateOracles]: <CrossArrow />,
    [TransactionTypes.dispute]: <ChatBubbles />,
    [TransactionTypes.redeemIssue]: <ReturnArrow />,
    [TransactionTypes.closeIssue]: <CloseIssueIcon />,
    [TransactionTypes.proposeMerge]: <CenterArrows />,
    [TransactionTypes.approveSettlerToken]: <ThumbsUp />,
  }

  function renderTransactionRow(item: Transaction) {
    return (
      <div className="h-100 w-100 px-3 py-2 tx-row cursor-pointer mt-2" onClick={() => onActiveTransaction(item)} key={item.id}>
        <div className="d-flex justify-content-start align-items-center">
          {IconMaps[item.type] || <HelpIcon/>}

          <div className="ms-3 me-auto">
            {item.amount && <h6 className="caption text-white text-uppercase">{formatNumberToCurrency(item.amount)} {item.currency}</h6> || ``}
            <TransactionType type={item.type}/>
          </div>

          <div>
            <TransactionStats status={item.status}/>
          </div>

        </div>
      </div>
    )
  }

  function emptyTransaction (){
    return <div className="text-center"><span className="smallCaption text-ligth-gray text-uppercase fs-8 family-Medium">you have no transactions.</span></div>
  }

  return (
    <div className="transaction-list w-100">
      <div className="row">
        <div className="col mb-3">
          <h4 className="h4 m-0 text-white">Transactions</h4>
        </div>
      </div>
      <div className="overflow-auto tx-container">
        {(!myTransactions || !myTransactions.length) && emptyTransaction()}
        {myTransactions.map(renderTransactionRow)}
      </div>
    </div>
  )
}
