import React, { useContext } from "react";
import { ApplicationContext } from "@contexts/application";
import {Toast, ToastContainer} from 'react-bootstrap';
import { removeToast } from "@reducers/remove-toast";
import Icon from '@components/icon';
import BeproSmallLogo from '@assets/icons/bepro-small-logo';

enum IconMapper {
  info = `info`,
  danger = `cancel`,
  success = `check_circle`,
  warning = `warning`,
  secondary = `info`
}

export default function Toaster() {
  const {
    state: { toaster },
    dispatch,
  } = useContext(ApplicationContext);

  function onClose(i: number) {
    dispatch(removeToast(i));
  }

  return (<>
    <ToastContainer position="bottom-end" className="fs-5">
      {toaster.map((toast, i) => (
        <Toast delay={toast.delay || 3000} autohide={true}
               onClose={() => onClose(toast.id)}
               show={true} key={i} bg={toast.type} className={`border border-2 border-${toast.type}`}>
          <Toast.Header className="border-bottom-0 bg-transparent px-3">
            {toast.type === `primary` && <span className="mr-1"><BeproSmallLogo /></span> || <Icon className={`text-${toast.type} me-3 pe-2`}>{IconMapper[toast.type]}</Icon>}
            <strong className="me-auto">{toast.title}</strong>
          </Toast.Header>
          <Toast.Body className="ps-5 pe-3 ms-2">
            {toast.content}
            {toast.link && (
              <a href={toast.link} className="d-block text-decoration-none text-white" target="_blank">
                  <strong>{toast.linkName ? toast.linkName : toast.link}</strong>
                  <Icon className="text-white ms-1">north_east</Icon>
              </a>
            )}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  </>)
}
