import HelpIcon from '@assets/icons/help-icon';
import React from 'react';
import ChatIcon from '@assets/icons/chat-icon';
import FeedbackIcon from '@assets/icons/feedback-icon';
import Modal from '@components/modal';
import PageIcon from '@assets/icons/page-icon';

export default function HelpModal({ show = false, onCloseClick = () => { } }) {
  const helpItem = (title = ``, tagline = ``, icon, href = ``) => ({ title, tagline, icon, href });

  const helpItems = [
    helpItem(`help center`, `Know more about Bepro Network and how to use it.`, <HelpIcon />, `http://support.bepro.network`),
    helpItem(`api documentation`, `Develop with bepro-js and create your next web3 app.`, <PageIcon />, `http://docs.bepro.network`),
    helpItem(`live chat`, `Explore tutorials and help articles`, <ChatIcon />, `https://discord.gg/bepronetwork`),
    helpItem(`provide feedback`, `Explore tutorials and help articles`, <FeedbackIcon />, `https://discord.gg/bepronetwork`),
  ];

  function HelpItemRow(item, i) {
    const rowClassName = `row row-button ${i + 1 !== helpItems.length && `mb-2` || ``} d-flex align-items-center cursor-pointer bg-opac-hover mxn-3 px-3 py-2 text-decoration-none`;

    return (
      <a className={rowClassName} key={item.title} href={`${item.href}`} target="_blank" style={{ height: 90 }}>
        <div className="col-2 text-center">
          {item.icon}
        </div>
        <div className="col">
          <strong className="d-block text-uppercase text-white">{item.title}</strong>
          <span className="d-block text-white-50">{item.tagline}</span>
        </div>
      </a>
    )
  }

  return <>
    <Modal show={show} title="Help" titlePosition="center" onCloseClick={onCloseClick} backdrop={true}>
      {helpItems.map(HelpItemRow)}
    </Modal>
  </>
}
