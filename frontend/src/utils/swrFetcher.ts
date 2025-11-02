import { axiosInstance } from "../services/apiClient";

export const fetcher = (url: string) =>
  axiosInstance.get(url).then(res => res.data);
