import HelpIcon from '@assets/icons/help-icon';
import React from 'react';
import ApiIcon from '@assets/icons/api-icon';
import ChatIcon from '@assets/icons/chat-icon';
import FeedbackIcon from '@assets/icons/feedback-icon';
import Modal from '@components/modal';

export default function HelpModal({show = false, onCloseClick = () => {}}) {
  const helpItem = (title = ``, tagline = ``, icon) => ({title, tagline, icon});

  const helpItems = [
    helpItem(`help center`, `Explore tutorials and help articles.`, <HelpIcon />),
    helpItem(`api documentation`, `Some description.`, <ApiIcon />),
    helpItem(`live chat`, `Explore tutorials and help articles`, <ChatIcon />),
    helpItem(`provide feedback`, `Explore tutorials and help articles`, <FeedbackIcon />),
  ];

  function HelpItemRow(item, i) {
    const rowClassName = `row ${i !== helpItems.length && `pb-3` || ``} d-flex align-items-center`;

    return <>
      <div className={rowClassName} key={item.title}>
        <div className="col-2 text-center">
            {item.icon}
        </div>
        <div className="col">
            <strong className="d-block text-uppercase text-white">{item.title}</strong>
            <span className="d-block text-white-50">{item.tagline}</span>
        </div>
      </div>
      </>
  }

  return <>
    <Modal show={show} title="Help" onCloseClick={onCloseClick} backdrop={true}>
      {helpItems.map(HelpItemRow)}
    </Modal>
  </>
}
