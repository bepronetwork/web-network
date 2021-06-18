import { GetStaticProps } from "next";
import React, { useEffect, useState } from "react";
import IssueAvatars from "./issue-avatars";
import Modal from "./Modal";

export default function PageActions() {
  const [open, setOpen] = useState(false);

  function handleOpenClick() {
    setOpen(true);
  }
  function handleCloseClick() {
    setOpen(false);
  }

  return (
    <>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h4 className="h4">Details</h4>
              <div className="d-flex align-items-center">
                <IssueAvatars></IssueAvatars>
                <button className="btn btn-md btn-opac mr-1">
                  View on github
                </button>
                <button
                  className="btn btn-md btn-primary"
                  onClick={handleOpenClick}>
                  Start working
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal title="modal-test" open={open} onClose={handleCloseClick}>
        test
      </Modal>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
