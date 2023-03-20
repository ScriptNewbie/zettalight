import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

let liveDataUrl = AsyncStorage.getItem("liveDataUrl");
let influxUrl = AsyncStorage.getItem("influxUrl");
let token = AsyncStorage.getItem("token");
let influxOrg = AsyncStorage.getItem("influxOrg");

export const updateToken = () => {
  token = AsyncStorage.getItem("token");
};

export const updateLiveDataUrl = () => {
  liveDataUrl = AsyncStorage.getItem("liveDataUrl");
};

export const updateInfluxUrl = () => {
  influxUrl = AsyncStorage.getItem("influxUrl");
};

export const updateInfluxOrg = () => {
  influxOrg = AsyncStorage.getItem("influxOrg");
};

const getInfluxUrl = async () => {
  const baseUrl = await influxUrl;
  return baseUrl ? baseUrl : "http://zettalight-database.local:8086";
};

const getLiveDataUrl = async () => {
  const baseUrl = await liveDataUrl;
  return baseUrl ? baseUrl : "http://zettalight-device.local:5000";
};

const getBaseUrl = async (endpoint: String) => {
  if (endpoint === "configApi") return "http://zettalight-device.local";
  if (endpoint === "liveData") return await getLiveDataUrl();
  return await getInfluxUrl();
};

const http = {
  get: async (endpoint: String, resource: String) => {
    const baseUrl = await getBaseUrl(endpoint);
    const resolvedToken = await token;
    const response = await axios.get(baseUrl + resource, {
      headers: {
        Authorization: "Token " + resolvedToken,
        "Content-Type": "application/json",
      },
    });
    return response;
  },
  post: async (endpoint: String, resource: String, data: any) => {
    const baseUrl = await getBaseUrl(endpoint);
    const resolvedToken = await token;
    const resolvedOrg = await influxOrg;
    const response = await axios.post(baseUrl + resource, data, {
      timeout: 3000,
      headers: {
        Authorization: "Token " + resolvedToken,
        "Content-Type": "application/json",
      },
      params: endpoint === "influxDb" ? { org: resolvedOrg } : {},
    });
    return response;
  },
  put: async (endpoint: String, resource: String, data: any) => {
    const baseUrl = await getBaseUrl(endpoint);
    const response = await axios.put(baseUrl + resource, data);
    return response;
  },
  delete: async (endpoint: String, resource: String, data: any) => {
    const baseUrl = await getBaseUrl(endpoint);
    const response = await axios.delete(baseUrl + resource, {
      data,
    });
    return response;
  },
};

export default http;
