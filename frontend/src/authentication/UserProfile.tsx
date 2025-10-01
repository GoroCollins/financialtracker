import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useSWR from 'swr';
import { axiosInstance, useAuthService } from './AuthenticationService';
import placeholderProfileImage from '../assets/placeholder.png';
import { toast } from 'react-hot-toast';
import { UserProfileForm, userProfileSchema } from '../utils/zodSchemas';
import { useNavigate } from "react-router-dom";
// import { set } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

const UserProfile: React.FC = () => {
  const { refreshUser } = useAuthService();
  const { data: user, error, mutate } = useSWR('/dj-rest-auth/user/', fetcher);
  const navigate = useNavigate();
  // const { register, handleSubmit, formState: { errors }, setValue, } = useForm<UserProfileForm>({ resolver: zodResolver(userProfileSchema), });
  const form = useForm<UserProfileForm>({
    resolver: zodResolver(userProfileSchema),
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      form.setValue("username", user.username);
      form.setValue("email", user.email);
      form.setValue("first_name", user.first_name);
      form.setValue("middle_name", user.middle_name || ""); 
      form.setValue("last_name", user.last_name);
      form.setValue("phone_number", user.phone_number || "");
      setPreviewImage(user.profile_image || null);
    }
  }, [user, form]);

  const onSubmit = async (data: UserProfileForm) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('first_name', data.first_name);
    formData.append('middle_name', data.middle_name || ''); 
    formData.append('last_name', data.last_name);
    formData.append('phone_number', data.phone_number || '');

    if (data.profile_image?.[0]) {
      formData.append('profile_image', data.profile_image[0]);
    }

    try {
      await axiosInstance.patch('/dj-rest-auth/user/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Profile updated successfully');
      await mutate();
      await refreshUser();
      navigate('/home');
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error('Failed to update profile');
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  if (error) return <p>Error loading user profile</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Manage your profile</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-6">
        {/* Username (read-only) */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
              </FormItem>
            )}
          />
        {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* First Name */}
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Middle Name */}
          <FormField
            control={form.control}
            name="middle_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle Name (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          {/* Last Name */}
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Profile Image Preview */}
          <div>
            <FormLabel>Profile Image</FormLabel>
            {previewImage ? (
              <img
                src={previewImage}
                alt="Profile"
                className="w-[150px] h-[150px] object-cover rounded-md"
              />
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">
                  No profile image available
                </p>
                <img
                  src={placeholderProfileImage}
                  alt="Placeholder"
                  className="w-[150px] h-[150px] object-cover rounded-md"
                />
              </div>
            )}
          </div>
          {/* Upload New Image */}
          <FormField
            control={form.control}
            name="profile_image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Change Profile Image</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      field.onChange(e.target.files);
                      handleImageChange(e);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        <Button type="submit">Update Profile</Button>
        </form>
      </Form>
    </>
  );
};

export default UserProfile;
