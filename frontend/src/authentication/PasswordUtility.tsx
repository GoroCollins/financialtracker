import zxcvbn, { ZXCVBNResult } from 'zxcvbn';

/**
 * Estimates the strength of the password based on zxcvbn score
 * @param password - The password to estimate strength for
 * @returns A string representing the password strength
 */
export const estimatePasswordStrength = (password: string): string => {
  const result: ZXCVBNResult = zxcvbn(password);
  const score: number = result.score;
  
  switch (score) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Reasonable';
    case 3:
      return 'Strong';
    case 4:
      return 'Very Strong';
    default:
      return 'Unknown';
  }
};

/**
 * Gets password improvement suggestions based on zxcvbn feedback
 * @param password - The password to analyze for suggestions
 * @returns An array of suggestion strings for improving password strength
 */
export const getPasswordSuggestions = (password: string): string[] => {
  const result: ZXCVBNResult = zxcvbn(password);
  return result.feedback.suggestions;
};
