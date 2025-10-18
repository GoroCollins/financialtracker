import zxcvbn, { ZXCVBNResult } from 'zxcvbn';

export interface PasswordStrength {
  score: number;
  label: string;
}

/**
 * Estimates the strength of the password based on zxcvbn score
 * @param password - The password to estimate strength for
 * @returns A string representing the password strength
 */
export const estimatePasswordStrength = (password: string): PasswordStrength => {
  const result: ZXCVBNResult = zxcvbn(password);
  const score = result.score * 25; // zxcvbn score (0–4) → percentage (0–100)
  let label = "";

  switch (result.score) {
    case 0:
      label = "Very Weak";
      break;
    case 1:
      label = "Weak";
      break;
    case 2:
      label = "Reasonable";
      break;
    case 3:
      label = "Strong";
      break;
    case 4:
      label = "Very Strong";
      break;
    default:
      label = "Unknown";
  }

  return { score, label };
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
