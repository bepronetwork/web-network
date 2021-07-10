import BeproService from "../services/bepro";
import useStateAsync from "@restart/hooks/useStateAsync";
import React, {useEffect} from "react";

export default function ConnectWalletButton({children, onSuccess = () => null, onFail = (e) => console.log("error", e)}) {
  const [connected, setConnected] = useStateAsync(null);

  function onMounted() {
    async function updateConnectedBasedOnService() {
      await setConnected(BeproService.isLoggedIn())
        .catch(error => {
          console.log(error);
        });
    }


    updateConnectedBasedOnService();
  }

  async function connectWallet() {
    await setConnected(BeproService.login())
      .then(onSuccess.bind(this))
      .catch(onFail.bind(this));
  }

  useEffect(onMounted, [])

  if (!connected)
    return <button className="btn btn-md btn-white" onClick={connectWallet}>Connect <i className="ico-metamask ml-1"></i></button>

  return children;
}