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
  Box,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  LockOutlined,
  PersonOutlined,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { ApiError } from '../../utils';
import { SignupArt } from '../../components/elements/SignupArt';

export const Signup = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6)
      return { strength: 25, label: 'Weak', color: '#EF4444' };
    if (password.length < 10)
      return { strength: 50, label: 'Fair', color: '#F59E0B' };
    if (password.length < 14)
      return { strength: 75, label: 'Good', color: '#3B82F6' };
    return { strength: 100, label: 'Strong', color: '#10B981' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <SignupArt />

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4">
              <PersonOutlined className="text-white text-3xl" />
            </div>
            <Typography variant="h4" className="font-bold text-gray-800 mb-2">
              {step === 1 ? 'Create Account' : 'Verify Email'}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              {step === 1
                ? 'Enter your details to get started'
                : 'Enter the OTP sent to your email'}
            </Typography>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <Chip
                label="1. Details"
                color={step >= 1 ? 'primary' : 'default'}
                size="small"
              />
              <Chip
                label="2. Verify"
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
                <div>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    variant="outlined"
                    placeholder="John Doe"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlined className="text-gray-400" />
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
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
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

                <div>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
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

                  {formData.password && (
                    <Box className="mt-2">
                      <LinearProgress
                        variant="determinate"
                        value={passwordStrength.strength}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#E5E7EB',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: passwordStrength.color,
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: passwordStrength.color, mt: 0.5, display: 'block' }}
                      >
                        Password Strength: {passwordStrength.label}
                      </Typography>
                    </Box>
                  )}
                </div>

                <div>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
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
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    },
                  }}
                >
                  {loading ? 'Sending OTP...' : 'Continue'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-3">
                    <EmailOutlined className="text-emerald-600 text-3xl" />
                  </div>
                  <Typography variant="body2" className="text-gray-600">
                    We've sent a 4-digit code to
                  </Typography>
                  <Typography variant="body1" className="font-semibold text-gray-800">
                    {formData.email}
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
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  startIcon={<ArrowBack />}
                  onClick={() => setStep(1)}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    color: '#6B7280',
                  }}
                >
                  Change Email
                </Button>
              </form>
            )}
          </Paper>

          <Typography variant="body2" className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Sign In
            </Link>
          </Typography>
        </div>
      </div>
    </div>
  );
};
