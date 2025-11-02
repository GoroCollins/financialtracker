// export const extractErrorMessage = (error: any): string => {
//   const errorData = error?.response?.data;

//   if (errorData?.non_field_errors?.length) {
//     return errorData.non_field_errors[0];
//   }

//   if (Array.isArray(errorData?.non_field_errors) && errorData.non_field_errors.length > 0) {
//       return errorData.non_field_errors[0];
//     }


//     if (typeof errorData?.detail === 'string') {
//       return errorData.detail;
//     }

//   if (errorData?.message) {
//     return errorData.message;
//   }

//   if (error.request) {
//     return "Network error. Please try again.";
//   }

//   for (const key in errorData) {
//       if (Array.isArray(errorData[key]) && typeof errorData[key][0] === 'string') {
//         return errorData[key][0];
//       }
//     }

//   return "An unexpected error occurred.";
// };

import { AxiosError } from "axios";

export const extractErrorMessage = (error: unknown): string => {
  // Narrow type — only handle Axios errors safely
  if (typeof error === "object" && error !== null && "isAxiosError" in error) {
    const axiosError = error as AxiosError<Record<string, unknown>>;
    const errorData = axiosError.response?.data;

    if (!errorData) {
      if (axiosError.request) return "Network error. Please try again.";
      return "An unexpected error occurred.";
    }

    // Handle non_field_errors (common DRF structure)
    if (
      Array.isArray(errorData.non_field_errors) &&
      errorData.non_field_errors.length > 0
    ) {
      return errorData.non_field_errors[0];
    }

    // Handle DRF `detail` field
    if (typeof errorData.detail === "string") {
      return errorData.detail;
    }

    // Handle common `message` field
    if (typeof errorData.message === "string") {
      return errorData.message;
    }

    // Handle other field-specific errors
    for (const key in errorData) {
      if (
        Array.isArray(errorData[key]) &&
        typeof errorData[key][0] === "string"
      ) {
        return errorData[key][0];
      }
    }

    return "An unexpected error occurred.";
  }

  // Non-Axios errors
  if (error instanceof Error) return error.message;
  return "An unknown error occurred.";
};
