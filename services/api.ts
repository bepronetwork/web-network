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

export default { api, eventsApi };
