import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { changePassword } from "./ChangePasswordUtility";
import { ChangePasswordSchema, FormInputs } from "../utils/zodSchemas";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from '@/components/ui/progress';
import { estimatePasswordStrength, getPasswordSuggestions } from "./PasswordUtility";


const ChangePassword: React.FC = () => {
  const navigate = useNavigate()
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [strength, setStrength] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [strengthValue, setStrengthValue] = useState(0);

  const form = useForm<FormInputs>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const toggleVisibility = (setter: React.Dispatch<React.SetStateAction<boolean>>) =>
    setter(prev => !prev);

  const onSubmit = async (data: FormInputs) => {
    try {
      await changePassword(data.oldPassword, data.newPassword)
      toast.success("Password changed successfully. Redirecting to logout...")

      form.reset()
      setTimeout(() => navigate("/logout"), 3000)
    } catch (err: any) {
      const serverError = err?.response?.data

      if (serverError?.old_password?.length) {
        toast.error(serverError.old_password[0])
      } else if (serverError?.detail) {
        toast.error(serverError.detail)
      } else if (err?.message === "Network Error") {
        toast.error("Network error: Please check your internet connection.")
      } else {
        toast.error("An unexpected error occurred. Please try again.")
      }
    }
  }

  // 🔍 Recalculate strength and suggestions on password change
  useEffect(() => {
    const password = form.watch('newPassword');
    if (password) {
      const score = estimatePasswordStrength(password);
      const feedback = getPasswordSuggestions(password);
      setStrength(score);

      // map score to 0-100 for progress bar
      const valueMap: Record<string, number> = {
        'Very Weak': 10,
        Weak: 30,
        Reasonable: 55,
        Strong: 80,
        'Very Strong': 100,
      };
      setStrengthValue(valueMap[score] ?? 0);

      setSuggestions(feedback);
    } else {
      setStrength('');
      setStrengthValue(0);
      setSuggestions([]);
    }
  }, [form.watch('newPassword')]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-card border rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-6 text-center">Change Password</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Password */}
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showOld ? 'text' : 'password'}
                      placeholder="Enter current password"
                      {...field}
                    />
                  </FormControl>
                  <span
                    className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                    onClick={() => toggleVisibility(setShowOld)}
                  >
                    {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* New Password with strength indicator */}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showNew ? 'text' : 'password'}
                      placeholder="Enter new password"
                      {...field}
                    />
                  </FormControl>
                  <span
                    className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                    onClick={() => toggleVisibility(setShowNew)}
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>

                {/* Password strength bar */}
                {strength && (
                  <div className="mt-2">
                    <Progress value={strengthValue} />
                    <p
                      className={`text-sm mt-1 ${
                        strength === 'Very Weak'
                          ? 'text-red-500'
                          : strength === 'Weak'
                          ? 'text-orange-500'
                          : strength === 'Reasonable'
                          ? 'text-yellow-500'
                          : strength === 'Strong'
                          ? 'text-green-500'
                          : 'text-emerald-600'
                      }`}
                    >
                      Strength: {strength}
                    </p>
                  </div>
                )}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <FormDescription className="text-gray-400 mt-2 space-y-1">
                    {suggestions.map((s, i) => (
                      <p key={i}>• {s}</p>
                    ))}
                  </FormDescription>
                )}

                <FormMessage />
              </FormItem>
            )}
          />
          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      {...field}
                    />
                  </FormControl>
                  <span
                    className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                    onClick={() => toggleVisibility(setShowConfirm)}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
           {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Changing...' : 'Change Password'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/userprofile')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default ChangePassword;

