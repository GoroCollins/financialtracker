import { axiosInstance } from '../authentication/AuthenticationService';

export const fetcher = (url: string) =>
  axiosInstance.get(url).then(res => res.data);
