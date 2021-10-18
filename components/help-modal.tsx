import HelpIcon from '@assets/icons/help-icon';
import React from 'react';
import ApiIcon from '@assets/icons/api-icon';
import ChatIcon from '@assets/icons/chat-icon';
import FeedbackIcon from '@assets/icons/feedback-icon';
import Modal from '@components/modal';

export default function HelpModal({ show = false, onCloseClick = () => { } }) {
  const helpItem = (title = ``, tagline = ``, icon, href = ``) => ({ title, tagline, icon, href });

  const helpItems = [
    helpItem(`help center`, `Know more about Bepro Network and how to use it`, <HelpIcon />, `http://support.bepro.network`),
    helpItem(`api documentation`, `Develop with bepro-js and create your next web3 app`, <ApiIcon />, `http://docs.bepro.network`),
    helpItem(`live chat`, `Get in contact with our team via Discord`, <ChatIcon />, `https://discord.gg/RQMAu2DZFA`),
    helpItem(`provide feedback`, `Propose ideas and new features`, <FeedbackIcon />, `https://discord.gg/RQMAu2DZFA`),
  ];

  function HelpItemRow(item, i) {
    const rowClassName = `row row-button ${i + 1 !== helpItems.length && `mb-2` || ``} d-flex align-items-center cursor-pointer bg-opac-hover mxn-3 px-3 py-2 text-decoration-none`;

    return (
      <a className={rowClassName} key={item.title} href={`${item.href}`} target="_blank" style={{ height: 90 }}>
        <div className="col-2 text-center">
          {item.icon}
        </div>
        <div className="col">
          <strong className="d-block text-uppercase text-white-50">{item.title}</strong>
          <span className="d-block text-white-50">{item.tagline}</span>
        </div>
      </a>
    )
  }

  return <>
    <Modal show={show} title="Help" onCloseClick={onCloseClick} backdrop={true}>
      {helpItems.map(HelpItemRow)}
    </Modal>
  </>
}
