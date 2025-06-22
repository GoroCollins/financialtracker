export const extractErrorMessage = (error: any): string => {
  const errorData = error?.response?.data;

  if (errorData?.non_field_errors?.length) {
    return errorData.non_field_errors[0];
  }

  if (Array.isArray(errorData?.non_field_errors) && errorData.non_field_errors.length > 0) {
      return errorData.non_field_errors[0];
    }


    if (typeof errorData?.detail === 'string') {
      return errorData.detail;
    }

  if (errorData?.message) {
    return errorData.message;
  }

  if (error.request) {
    return "Network error. Please try again.";
  }

  for (const key in errorData) {
      if (Array.isArray(errorData[key]) && typeof errorData[key][0] === 'string') {
        return errorData[key][0];
      }
    }

  return "An unexpected error occurred.";
};

