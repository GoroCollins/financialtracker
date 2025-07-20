import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useSWR from 'swr';
import { axiosInstance, useAuthService } from './AuthenticationService';
import { Button, Form } from 'react-bootstrap';
import placeholderProfileImage from '../assets/placeholder.png';
import { toast } from 'react-hot-toast';
import { UserProfileForm, userProfileSchema } from '../utils/zodSchemas';
import { useNavigate } from "react-router-dom";
import { set } from 'date-fns';

const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

const UserProfile: React.FC = () => {
  const { refreshUser } = useAuthService();
  const { data: user, error, mutate } = useSWR('/dj-rest-auth/user/', fetcher);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue, } = useForm<UserProfileForm>({ resolver: zodResolver(userProfileSchema), });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setValue('username', user.username);
      setValue('email', user.email);
      setValue('first_name', user.first_name);
      setValue('middle_name', user.middle_name || ''); 
      setValue('last_name', user.last_name);
      setValue('phone_number', user.phone_number || '');
      setPreviewImage(user.profile_image || null);
    }
  }, [user, setValue]);

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
      <h1>Manage your profile</h1>
      <Form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <Form.Group controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control type="text" readOnly {...register('username')} />
        </Form.Group>

        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" {...register('email')} />
          {errors.email && <p className="text-danger">{errors.email.message}</p>}
        </Form.Group>

        <Form.Group controlId="first_name">
          <Form.Label>First Name</Form.Label>
          <Form.Control type="text" {...register('first_name')} />
          {errors.first_name && <p className="text-danger">{errors.first_name.message}</p>}
        </Form.Group>

        <Form.Group controlId="middle_name">
          <Form.Label>Middle Name (Optional)</Form.Label>
          <Form.Control type="text" {...register('middle_name')} />
        </Form.Group>

        <Form.Group controlId="last_name">
          <Form.Label>Last Name</Form.Label>
          <Form.Control type="text" {...register('last_name')} />
          {errors.last_name && <p className="text-danger">{errors.last_name.message}</p>}

        </Form.Group>
                <Form.Group controlId="phone_number">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control type="text" {...register('phone_number')} />
          {errors.phone_number && <p className="text-danger">{errors.phone_number.message}</p>}
        </Form.Group>

        <div>
          <Form.Label>Profile Image</Form.Label>
          {previewImage ? (
            <img
              src={previewImage}
              alt="Profile"
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />
          ) : (
            <div>
              <p>No profile image available</p>
              <img
                src={placeholderProfileImage}
                alt="Placeholder"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>

        <Form.Group controlId="profile_image">
          <Form.Label>Change Profile Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            {...register('profile_image')}
            onChange={handleImageChange}
          />
        </Form.Group>

        <Button type="submit" className="mt-3">
          Update Profile
        </Button>
      </Form>
    </>
  );
};

export default UserProfile;
