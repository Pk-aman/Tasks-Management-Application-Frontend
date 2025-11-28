import { useState } from 'react';
import { TextField, Button, Paper, Typography, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { ApiError } from '../../utils';

export const Signup = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.sendSignupOTP(formData.email);
      if (response.success) {
        setSuccess('OTP sent to your email. Please check your inbox.');
        setStep(2);
      }
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Failed to send OTP';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.signup(
        formData.name,
        formData.email,
        formData.password,
        otp
      );
      
      if (response.success) {
        setSuccess('Signup successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Signup failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Paper elevation={3} className="p-8 max-w-md w-full mx-4">
        <Typography variant="h4" className="text-center mb-2 font-bold text-gray-800">
          Create Account
        </Typography>
        <Typography variant="body2" className="text-center mb-6 text-gray-600">
          {step === 1 ? 'Enter your details to get started' : 'Verify your email address'}
        </Typography>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              helperText="Minimum 6 characters"
            />
            
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
            
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            
            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <Typography variant="body2" className="text-center mb-4 text-gray-700">
              Enter the 4-digit OTP sent to <strong>{formData.email}</strong>
            </Typography>
            
            <TextField
              fullWidth
              label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              inputProps={{ maxLength: 4, pattern: '[0-9]{4}' }}
              placeholder="1234"
            />
            
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            
            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Sign Up'}
            </Button>
            
            <Button 
              variant="text" 
              fullWidth 
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Change Email
            </Button>
          </form>
        )}

        <Typography variant="body2" className="text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Sign In
          </Link>
        </Typography>
      </Paper>
    </div>
  );
};
