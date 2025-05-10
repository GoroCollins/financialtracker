import { axiosInstance}  from "./AuthenticationService";  // Use the existing axios instance

export const changePassword = async (oldPassword: string, newPassword: string) => {
  try {
    const response = await axiosInstance.post(`/dj-rest-auth/password/change/`, {
      old_password: oldPassword,
      new_password1: newPassword,
      new_password2: newPassword,  // Assuming both new_password1 and new_password2 for confirmation
    });
    
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Password change failed.");
    }
  } catch (error: any) {
    throw error.response?.data?.detail || error.message;
  }
};