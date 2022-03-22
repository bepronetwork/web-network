import axios from "axios";

import { API } from "../env";

const api = axios.create({
  baseURL: `${API}/api`
});

api.interceptors.response.use((response) => response,
                              (error) => {
                                console.debug("Failed", error);
                                throw error;
                              });

export default api;
