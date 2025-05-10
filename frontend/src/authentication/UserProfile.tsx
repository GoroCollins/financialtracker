import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { axiosInstance } from './AuthenticationService';
import { Button, Form } from 'react-bootstrap';
import placeholderProfileImage from "../../assets/placeholder.png";

interface UserProfileForm {
  username: string;
  email: string;
  name: string;
  profile_image: FileList; // Handling profile image upload
}

const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

const UserProfile: React.FC = () => {
  const { data: user, error, mutate } = useSWR('/dj-rest-auth/user/', fetcher);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<UserProfileForm>();
  const [previewImage, setPreviewImage] = useState<string | null>(null); // To handle image preview

  React.useEffect(() => {
    if (user) {
      setValue('username', user.username);
      setValue('email', user.email);
      setValue('name', user.name);
      setPreviewImage(user.profile_image || null);  // Set preview image if available
    }
  }, [user, setValue]);

  const onSubmit = async (data: UserProfileForm) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('name', data.name);
    
    if (data.profile_image && data.profile_image[0]) {
      formData.append('profile_image', data.profile_image[0]); // Append the new image if uploaded
    }

    try {
      await axiosInstance.patch('/dj-rest-auth/user/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      mutate();  // Refresh data after updating
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));  // Update preview image
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
        <Form.Control
          type="text"
          readOnly
          {...register('username')}
        />
      </Form.Group>

      <Form.Group controlId="email">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          {...register('email', { required: true })}
        />
        {errors.email && <p>Email is required</p>}
      </Form.Group>

      <Form.Group controlId="name">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          {...register('name', { required: true })}
        />
        {errors.name && <p>Name is required</p>}
      </Form.Group>

      {/* Display current profile image or a placeholder */}
      <div>
        <Form.Label>Profile Image</Form.Label>
        {previewImage ? (
          <div>
            <img src={previewImage} alt="Profile" style={{ width: '150px', height: '150px', objectFit: 'cover' }} />
          </div>
        ) : (
          <div>
            <p>No profile image available</p> {/* Message when there's no image */}
            <img 
              src={placeholderProfileImage} // Use a placeholder image here
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
          onChange={handleImageChange}  // Update the image preview when a new file is selected
        />
      </Form.Group>

      <Button type="submit">Update Profile</Button>
    </Form>
    </>
  );
};

export default UserProfile;
