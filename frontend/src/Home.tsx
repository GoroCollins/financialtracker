import React, { useState } from 'react';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  age: z.coerce.number().int().positive({ message: 'Age must be a positive number' }),
});

type FormData = z.infer<typeof formSchema>;

const Home: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ name: '', age: 0 });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);

    const parsed = formSchema.safeParse(formData);

    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof FormData] = err.message;
        }
      });
      setErrors(fieldErrors);
    } else {
      setErrors({});
      setSubmitted(true);
      console.log('Validated data:', parsed.data);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Welcome to the Home Page</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name:</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
          />
          {errors.name && <div className="text-danger">{errors.name}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="age" className="form-label">Age:</label>
          <input
            id="age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            className="form-control"
          />
          {errors.age && <div className="text-danger">{errors.age}</div>}
        </div>

        <button type="submit" className="btn btn-primary">Submit</button>
      </form>

      {submitted && (
        <div className="alert alert-success mt-3">
          Form submitted successfully!
        </div>
      )}
    </div>
  );
};

export default Home;
