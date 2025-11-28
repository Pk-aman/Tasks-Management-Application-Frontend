import { useState } from 'react';
import { TextField, Button, Paper, Typography, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { ApiError } from '../../utils';

export const ForgotPassword = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authService.sendPasswordResetOTP(email);
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword(email, otp, newPassword);
      
      if (response.success) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Failed to reset password';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authService.sendPasswordResetOTP(email);
      if (response.success) {
        setSuccess('OTP resent to your email. Please check your inbox.');
      }
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Failed to resend OTP';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Paper elevation={3} className="p-8 max-w-md w-full mx-4">
        <Typography variant="h4" className="text-center mb-2 font-bold text-gray-800">
          Reset Password
        </Typography>
        <Typography variant="body2" className="text-center mb-6 text-gray-600">
          {step === 1 ? 'Enter your email to receive OTP' : 'Enter OTP and new password'}
        </Typography>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              variant="outlined"
              placeholder="user@example.com"
            />
            
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={loading}
              className="py-3 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Typography variant="body2" className="text-center mb-4 text-gray-700">
              Enter the 4-digit OTP sent to <strong>{email}</strong>
            </Typography>
            
            <TextField
              fullWidth
              label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              variant="outlined"
              inputProps={{ maxLength: 4, pattern: '[0-9]{4}' }}
              placeholder="1234"
            />
            
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              variant="outlined"
              helperText="Minimum 6 characters"
            />
            
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              variant="outlined"
            />
            
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={loading}
              className="py-3 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Change Email
              </Button>
              
              <Button 
                variant="text" 
                fullWidth 
                onClick={handleResendOTP}
                disabled={loading}
              >
                Resend OTP
              </Button>
            </div>
          </form>
        )}

        <Typography variant="body2" className="text-center mt-4 text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Back to Sign In
          </Link>
        </Typography>
      </Paper>
    </div>
  );
};
