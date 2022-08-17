import axios from "axios";
import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();

export const api = axios.create({
  baseURL: `${publicRuntimeConfig?.urls?.api}/api`
});

export const eventsApi = axios.create({
  baseURL: `${publicRuntimeConfig?.urls?.events}/`
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

export default {api, eventsApi};
