import axios, { AxiosResponse } from "axios";
import { axiosInstance } from "../services/apiClient";
import { extractErrorMessage } from "../utils/errorHandler";

interface PasswordChangeResponse {
  detail: string;
}

export const changePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<PasswordChangeResponse> => {
  try {
    const response: AxiosResponse<PasswordChangeResponse> = await axiosInstance.post(
      "/dj-rest-auth/password/change/",
      {
        old_password: oldPassword,
        new_password1: newPassword,
        new_password2: newPassword, // confirmation
      }
    );

    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error);
    throw {
      message,
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
    };
  }
};
