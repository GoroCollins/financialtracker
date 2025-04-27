import { useState } from "react";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import {axiosInstance} from "./Auth.Service";
import axios from "axios"; 
import { useNavigate } from "react-router-dom";
import { estimatePasswordStrength, getPasswordSuggestions } from "./PasswordUtility";
import { Eye, EyeOff, Clipboard } from "lucide-react";

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
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.non_field_errors?.[0] || "Signup failed.");
        }
        throw new Error("An unknown error occurred.");
    }
};

const Signup = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<SignupFormData>();
    const [apiError, setApiError] = useState<string | null>(null);
    const [suggestedPassword, setSuggestedPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    const password = watch("password1");
    const confirmPassword = watch("password2");

    const { trigger, isMutating } = useSWRMutation("/dj-rest-auth/registration/", signupRequest);

    const handleGeneratePassword = () => {
        const newPassword = generatePassword();
        setSuggestedPassword(newPassword);
        setValue("password1", newPassword);
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(suggestedPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const onSubmit = async (formData: SignupFormData) => {
        if (formData.password1 !== formData.password2) {
            setApiError("Passwords do not match.");
            return;
        }

        setApiError(null);
        try {
            await trigger(formData);
            navigate("/verify-email");
        } catch (err) {
            setApiError(err instanceof Error ? err.message : "An unknown error occurred.");
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 border rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Sign Up</h2>
            {apiError && <p className="text-red-500">{apiError}</p>}
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

                {/* Password Input */}
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        {...register("password1", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
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

                {/* Suggested Password & Copy to Clipboard */}
                {suggestedPassword && (
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-700">Suggested: <span className="font-mono">{suggestedPassword}</span></p>
                        <button onClick={handleCopyPassword} type="button" className="text-blue-500 flex items-center">
                            <Clipboard size={16} className="mr-1" /> {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                )}

                {/* Password Strength Meter */}
                {password && (
                    <div className="text-sm mt-1">
                        <p className="font-medium">Strength: {estimatePasswordStrength(password)}</p>
                        {getPasswordSuggestions(password).length > 0 && (
                            <ul className="text-xs text-gray-600 list-disc pl-4">
                                {getPasswordSuggestions(password).map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* Confirm Password Field */}
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

                    {/* Confirm Password Match Check */}
                    {confirmPassword && password !== confirmPassword && (
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
