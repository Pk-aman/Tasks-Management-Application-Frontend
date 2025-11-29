import { useState } from 'react';
import {
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  LockOutlined,
  LockResetOutlined,
  ArrowBack,
  SendOutlined,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { ApiError } from '../../utils';
import { ForgotPasswordArt } from '../../components/elements/ForgotPasswordArt';

export const ForgotPassword = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      const errorMessage =
        apiError.response?.data?.message || 'Failed to reset password';
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
        setSuccess('OTP resent to your email.');
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-4">
              <LockResetOutlined className="text-white text-3xl" />
            </div>
            <Typography variant="h4" className="font-bold text-gray-800 mb-2">
              {step === 1 ? 'Forgot Password?' : 'Reset Password'}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              {step === 1
                ? "No worries, we'll send you reset instructions"
                : 'Enter the OTP and your new password'}
            </Typography>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <Chip
                label="1. Email"
                color={step >= 1 ? 'primary' : 'default'}
                size="small"
              />
              <Chip
                label="2. Reset"
                color={step >= 2 ? 'primary' : 'default'}
                size="small"
              />
            </div>
            <LinearProgress
              variant="determinate"
              value={step === 1 ? 50 : 100}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </div>

          <Paper elevation={0} className="p-6 rounded-2xl bg-white border border-gray-200">
            {step === 1 ? (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-3">
                    <EmailOutlined className="text-orange-600 text-3xl" />
                  </div>
                </div>

                <div>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    variant="outlined"
                    placeholder="you@example.com"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlined className="text-gray-400" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </div>

                {error && (
                  <Alert severity="error" sx={{ borderRadius: '12px' }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ borderRadius: '12px' }}>
                    {success}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  endIcon={<SendOutlined />}
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                    },
                  }}
                >
                  {loading ? 'Sending OTP...' : 'Send Reset Code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-3">
                    <LockResetOutlined className="text-orange-600 text-3xl" />
                  </div>
                  <Typography variant="body2" className="text-gray-600">
                    Code sent to
                  </Typography>
                  <Typography variant="body1" className="font-semibold text-gray-800">
                    {email}
                  </Typography>
                </div>

                <div>
                  <TextField
                    fullWidth
                    label="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    variant="outlined"
                    inputProps={{
                      maxLength: 4,
                      pattern: '[0-9]{4}',
                      style: {
                        textAlign: 'center',
                        fontSize: '24px',
                        letterSpacing: '8px',
                      },
                    }}
                    placeholder="1234"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </div>

                <div>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    variant="outlined"
                    placeholder="••••••••"
                    helperText="Minimum 6 characters"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined className="text-gray-400" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </div>

                <div>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    variant="outlined"
                    placeholder="••••••••"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined className="text-gray-400" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </div>

                {error && (
                  <Alert severity="error" sx={{ borderRadius: '12px' }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ borderRadius: '12px' }}>
                    {success}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                  }}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ArrowBack />}
                    onClick={() => setStep(1)}
                    disabled={loading}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '12px',
                    }}
                  >
                    Back
                  </Button>

                  <Button
                    variant="text"
                    fullWidth
                    onClick={handleResendOTP}
                    disabled={loading}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '12px',
                    }}
                  >
                    Resend OTP
                  </Button>
                </div>
              </form>
            )}
          </Paper>

          <Typography variant="body2" className="text-center mt-6 text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold">
              Back to Sign In
            </Link>
          </Typography>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <ForgotPasswordArt />
    </div>
  );
};
