import axios from "axios";
import getConfig from "next/config";

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

export const api = axios.create({
  baseURL: `${publicRuntimeConfig?.urls?.api}/api`
});

export const eventsApi = axios.create({
  baseURL: `${publicRuntimeConfig?.urls?.events}`
});

export const kycApi = axios.create({
  baseURL: `${publicRuntimeConfig?.urls?.kyc}`
});

api.interceptors.request.use(config => {

  if (typeof window === 'undefined')
    return config;

  const currentWallet = sessionStorage.getItem("currentWallet") || ''
  const currentSignature = sessionStorage.getItem("currentSignature") || undefined;
  const currentChainId = sessionStorage.getItem("currentChainId") || 0;
  const currentNetwork = sessionStorage.getItem(`lastNetworkId`) || null;

  if (currentWallet)
    config.headers["wallet"] = currentWallet;

  if (currentSignature)
    config.headers["signature"] = currentSignature;

  if (+currentChainId)
    config.headers["chain"] = +currentChainId;

  if (currentNetwork !== null)
    config.headers["networkId"] = +currentNetwork;

  return config;
});

api.interceptors.response.use((response) => response,
                              (error) => {
                                console.debug("Failed", error);
                                throw error;
                              });

eventsApi.interceptors.response.use((response) => response,
                                    (error) => {
                                      console.debug("[EventsApi] Failed", error);
                                      throw error;
                                    });

kycApi.interceptors.request.use(function (config) {
  if (serverRuntimeConfig.kyc.key && serverRuntimeConfig.kyc.clientId) {
    config.headers["Api-Key"] = serverRuntimeConfig.kyc.key;
    config.headers["Client-Id"] = serverRuntimeConfig.kyc.clientId;
  }
                                    
  return config;
});
                                    
kycApi.interceptors.response.use((response) => response,
                                 (error) => {
                                   console.debug("[KycApi] Failed", error);
                                   throw error;
                                 });
                                    
export default { api, eventsApi, kycApi };

