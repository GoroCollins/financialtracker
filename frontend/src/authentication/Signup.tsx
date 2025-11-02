import { useState, useMemo } from "react";
import { useForm, useWatch, Control } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import { axiosInstance } from "../services/apiClient";
import { useNavigate } from "react-router-dom";
import { estimatePasswordStrength, getPasswordSuggestions } from "./PasswordUtility";
import { Eye, EyeOff, Clipboard } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { extractErrorMessage } from "../utils/errorHandler";

interface SignupFormData {
  email: string;
  username: string;
  password1: string;
  password2: string;
}

const generatePassword = (length: number = 16): string => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((byte) => charset[byte % charset.length])
    .join("");
};

const signupRequest = async (url: string, { arg }: { arg: SignupFormData }) => {
  try {
    const response = await axiosInstance.post(url, arg);
    return response.data;
  } catch (error) {
    const message = extractErrorMessage(error as AxiosError);
    throw new Error(message);
  }
};

// ✅ A small hook wrapper to safely "watch" a single field
const usePasswordWatch = (control: Control<SignupFormData>) => {
  const password1 = useWatch({ control, name: "password1" });
  const password2 = useWatch({ control, name: "password2" });
  return { password1, password2 };
};


const Signup = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, control, setValue } = useForm<SignupFormData>();
  const { password1, password2 } = usePasswordWatch(control);
  const [suggestedPassword, setSuggestedPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  // const [passwordStrength, setPasswordStrength] = useState<{ score: number; label: string }>({
  //     score: 0,
  //     label: "Weak",
  // });
  // const [passwordSuggestions, setPasswordSuggestions] = useState<string[]>([]);


  const { trigger, isMutating } = useSWRMutation("/dj-rest-auth/registration/", signupRequest);

const { score, label } = useMemo(
  () => estimatePasswordStrength(password1 || ""),
  [password1]
);

const passwordSuggestions = useMemo(
  () => getPasswordSuggestions(password1 || ""),
  [password1]
);
const passwordStrength = { score, label };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setSuggestedPassword(newPassword);
    setValue("password1", newPassword);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(suggestedPassword);
    setCopied(true);
    toast.success("Password copied to clipboard"); // ✅ feedback on copy
    setTimeout(() => setCopied(false), 2000);
  };

  // const handlePasswordChange = (value: string) => {
  //     const strength = estimatePasswordStrength(value);
  //     const suggestions = getPasswordSuggestions(value);
  //     setPasswordStrength(strength);
  //     setPasswordSuggestions(suggestions);
  // };

  const onSubmit = async (formData: SignupFormData) => {
    if (formData.password1 !== formData.password2) {
      toast.error("Passwords do not match."); // ✅ validation error toast
      return;
    }

    try {
      await trigger(formData);
      toast.success('Account created successfully!', {
        description: 'You can now log in with your credentials.',
        duration: 4000,
      });
      navigate("/verify-email");
    } catch (error) {
      const message = extractErrorMessage(error as AxiosError);
      toast.error(message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4">Sign Up</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <input
            type="text"
            placeholder="Username"
            {...register("username", { required: "Username is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.username && <p className="text-red-500">{errors.username.message}</p>}
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            {...register("password1", {
              required: "Password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters" }
            })}
            onChange={(e) => {
              setValue("password1", e.target.value);
              // handlePasswordChange(e.target.value);
            }}
            className="w-full p-2 border rounded"
          />
          {errors.password1 && <p className="text-red-500">{errors.password1.message}</p>}

          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 text-gray-600">
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>

          <button type="button" onClick={handleGeneratePassword} className="absolute right-10 top-2 text-blue-500 text-sm hover:underline">
            Suggest Password
          </button>
        </div>

        {suggestedPassword && (
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-700">Suggested: <span className="font-mono">{suggestedPassword}</span></p>
            <button onClick={handleCopyPassword} type="button" className="text-blue-500 flex items-center">
              <Clipboard size={16} className="mr-1" /> {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
        {/* 🔹 Password Strength Bar */}
        <div className="mt-2">
          <p className="text-sm text-muted-foreground mt-1">
              Strength: {passwordStrength.label}
          </p>
        </div>
        {/* 🔹 Suggestions */}
        {passwordSuggestions.length > 0 && (
            <ul className="mt-2 text-xs text-muted-foreground list-disc pl-5">
              {passwordSuggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
        )}

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            {...register("password2", { required: "Confirm your password" })}
            className="w-full p-2 border rounded"
          />
          {errors.password2 && <p className="text-red-500">{errors.password2.message}</p>}

          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-2 text-gray-600">
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>

          {password2 && password1 !== password2 && (
            <p className="text-red-500 text-sm mt-1">Passwords do not match.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isMutating}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isMutating ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default Signup;
