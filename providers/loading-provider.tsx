import { createContext, Dispatch, SetStateAction, useState } from "react";
import LoadingGlobal from "../components/loading-global";

let getLoadingState: () => boolean;

let setLoadingAttributes: (show: boolean, message?: string) => void;

const LoadingContext = createContext(false);

function LoadingContextProvider({ children }) {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>();
  setLoadingAttributes = (show: boolean, message?: string) => {
    setLoading(show);
    setMessage(message);
  };
  getLoadingState = () => isLoading;
  return (
    <LoadingContext.Provider value={isLoading}>
      <LoadingGlobal show={isLoading}>{message}</LoadingGlobal>
      {children}
    </LoadingContext.Provider>
  );
}

export {
  LoadingContextProvider,
  LoadingContext,
  setLoadingAttributes,
  getLoadingState,
};
