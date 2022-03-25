import React from "react";

import { useTranslation } from "next-i18next";


import TransactionIcon from "assets/icons/transaction";

import Modal from "components/modal";


import useNetworkTheme from "x-hooks/use-network";

import InputNumber from "./input-number";
import ReactSelect from "./react-select";

interface IProps{
  show: boolean;
  onClose: ()=> void;
}
export default function PriceConversorModal({
  show,
  onClose
}:IProps) {

  return (
    <Modal
    show={show}
    title={"Converter"}
    titlePosition="center"
    onCloseClick={onClose}
  >
    <div className="d-flex flex-row gap-2">
      <InputNumber symbol="$Bepro"/>
      <div className="d-flex justify-center align-items-center bg-dark-gray circle-2 p-2">
        <TransactionIcon width={14} height={10}/>
      </div>
      <ReactSelect key={`select_currency`} options={[]} onChange={()=>{}} />
    </div>
  </Modal>
  );
}
