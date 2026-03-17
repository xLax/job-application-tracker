'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { useAuthStore } from '@/lib/authStore';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

export default function RegisterPage() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  const setLoggedIn = useAuthStore((state) => state.setLoggedIn);
  const setEmail = useAuthStore((state) => state.setEmail);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Registration failed');
        return;
      }

      // Auto-login after successful registration
      const loginResponse = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const loginResult = await loginResponse.json();

      if (loginResponse.ok) {
        setToken(loginResult.token);
        setLoggedIn(true);
        setEmail(data.email);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 3,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Create Account
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Email"
            type="email"
            fullWidth
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email',
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={loading}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
              pattern: {
                value: passwordPattern,
                message:
                  'Password must contain uppercase, lowercase, and numbers',
              },
            })}
            error={!!errors.password}
            helperText={
              errors.password?.message ||
              'Min 8 chars: uppercase, lowercase, numbers'
            }
            disabled={loading}
          />

          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === password || 'Passwords do not match',
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
        </Box>

        <Typography variant="body2">
          Already have an account?{' '}
          <MuiLink
            component={NextLink}
            href="/login"
            sx={{ fontWeight: 'bold', textDecoration: 'none' }}
          >
            Login here
          </MuiLink>
        </Typography>
      </Box>
    </Container>
  );
}
