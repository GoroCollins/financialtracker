import useSWR from 'swr';
import { axiosInstance } from "../services/apiClient";

interface UserProfileData {
  username: string;
  email: string;
  profile_image: string | null;
}

const fetchUserProfile = async (): Promise<UserProfileData> => {
  const response = await axiosInstance.get('/dj-rest-auth/user/');
  return response.data;
};

export const useUserProfile = () => {
  const { data, error, isLoading } = useSWR<UserProfileData>('/dj-rest-auth/user/', fetchUserProfile);
  return {
    profile: data,
    isLoading,
    isError: error,
  };
};
