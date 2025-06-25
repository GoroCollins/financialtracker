import { axiosInstance } from '../authentication/AuthenticationService'; // adjust if path differs

export const fetcher = (url: string) =>
  axiosInstance.get(url).then(res => res.data);
