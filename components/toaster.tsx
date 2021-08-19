import React, { useContext } from "react";
import { ApplicationContext } from "@contexts/application";
import { Toast } from "react-bootstrap";
import { removeToast } from "@reducers/remove-toast";
import IconSuccess from "@assets/icon-success";
import IconInfo from "@assets/icon-info";
import IconDanger from "@assets/icon-danger";
import IconLink from "@assets/icon-link";

export default function Toaster() {
  const {
    state: { toaster },
    dispatch,
  } = useContext(ApplicationContext);

  function onClose(i: number) {
    dispatch(removeToast(i));
  }

  function handleIconByType(type: string) {
    switch (type.toLowerCase()) {
      case "success": {
        return <IconSuccess className="ms-2 me-4"  />;
      }
      case "danger": {
        return <IconDanger className="ms-2 me-4" />;
      }
      case "warning": {
        return <IconInfo type="warning" className="ms-2 me-4" />;
      }
      case "info": {
        return <IconInfo type="info" className="ms-2 me-4" />;
      }
      case "secondary": {
        return <IconInfo type="secondary" className="ms-2 me-4" />;
      }
      case "primary": {
        return <i className="ico-bepro  ms-2 me-4"></i>;
      }
    }
  }

  return (
    <>
      {toaster.map((toast, i) => (
        <div
          key={`${toast.title}${i}`}
          className="position-absolute w-100 d-flex justify-content-end pt-5"
          style={{ right: "1rem", bottom: "0" }}
        >
          <div className="w-25 pb-3 pr-3 d-flex justify-content-end">
            <Toast
              bsPrefix={`stylingToast ${toast.type}`}
              delay={toast.delay || 3000}
              onClose={() => onClose(i)}
              show={true}
              key={i}
            >
              <Toast.Header bsPrefix="stylingToastHeader" closeVariant="white">
                {handleIconByType(toast.type)}
                <strong className="me-auto">{toast.title}</strong>
              </Toast.Header>
              <Toast.Body className="ps-5 ms-2">
                {toast.content}
                {toast.link && (
                  <a href={toast.link} className="link-toast">
                    <p className="p-0 m-0">
                      <strong>
                        {toast.linkName ? toast.linkName : toast.link}
                      </strong>
                      <IconLink className="position-absolute ms-1 mt-1" />
                    </p>
                  </a>
                )}
              </Toast.Body>
            </Toast>
          </div>
        </div>
      ))}
    </>
  );
}
