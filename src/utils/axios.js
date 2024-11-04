import axios from "axios";
import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();
let baseURL = publicRuntimeConfig.REACT_APP_API_URL || "http://localhost:8000";

const instance = axios.create({
  baseURL,
});

// Add a request interceptor
instance.interceptors.request.use((config) => {
  const email = localStorage.getItem('userEmail');
  if (email) {
    config.params = { ...config.params, email };
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default instance;
