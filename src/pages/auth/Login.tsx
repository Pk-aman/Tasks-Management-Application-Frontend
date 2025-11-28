import { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, Alert } from '@mui/material';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import type { ApiError } from '../../utils';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      
      if (response.success) {
        login(response.user, response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        navigate(from, { replace: true });
      }
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Paper elevation={3} className="p-8 max-w-md w-full mx-4">
        <Typography variant="h4" className="text-center mb-2 font-bold text-gray-800">
          Welcome Back
        </Typography>
        <Typography variant="body2" className="text-center mb-6 text-gray-600">
          Sign in to continue to your dashboard
        </Typography>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant="outlined"
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            variant="outlined"
          />
          
          {error && <Alert severity="error">{error}</Alert>}
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            className="py-3 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <Box className="mt-4 text-center space-y-2">
          <Link to="/forgot-password" className="text-blue-600 hover:underline block text-sm">
            Forgot Password?
          </Link>
          <Typography variant="body2" className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline font-semibold">
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </div>
  );
};
