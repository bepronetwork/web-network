import axios from "axios";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig()

const api = axios.create({
  baseURL: `${publicRuntimeConfig.apiUrl}/api`
});

api.interceptors.response.use((response) => response,
                              (error) => {
                                console.debug("Failed", error);
                                throw error;
                              });

export default api;
