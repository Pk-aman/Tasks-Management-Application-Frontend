import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAddOutlined,
  ArrowBack,
  AdminPanelSettingsOutlined,
  PersonOutlined,
  EmailOutlined,
  LockOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { ApiError, UserRole } from '../utils';
import { useAuthStore } from '../store/authStore';
import axiosInstance from '../api/axiosInstance';

export const Registration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
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
      // Direct signup API call without OTP
      const response = await axiosInstance.post('/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (response.data.success) {
        const emailSent = response.data.emailSent || false;
        setSuccess(
          `${formData.role === 'admin' ? 'Admin' : 'User'} account created successfully! ${
            emailSent ? `📧 Welcome email sent to ${formData.email}` : ''
          }`
        );
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'user',
          });
          setSuccess('');
        }, 3000);
      }
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage =
        apiError.response?.data?.message || 'Failed to create user account';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => navigate('/dashboard')} sx={{ bgcolor: 'white' }}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                User Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create new user or admin accounts
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1} bgcolor="white" px={2} py={1} borderRadius={2}>
            <AdminPanelSettingsOutlined color="primary" />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Logged in as
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {currentUser?.name} ({currentUser?.role})
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box display="flex" gap={3}>
          {/* Left Side - Form */}
          <Paper sx={{ flex: 1, p: 4, borderRadius: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonAddOutlined sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Create New Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fill in the details below to register a new user
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Account Type Selection */}
                <div>
                  <FormControl fullWidth>
                    <InputLabel>Account Type *</InputLabel>
                    <Select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value as UserRole })
                      }
                      label="Account Type *"
                      sx={{ borderRadius: '12px' }}
                    >
                      <MenuItem value="user">
                        <Box display="flex" alignItems="center" gap={1}>
                          <PersonOutlined fontSize="small" />
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              User Account
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Regular user with limited access
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="admin">
                        <Box display="flex" alignItems="center" gap={1}>
                          <AdminPanelSettingsOutlined fontSize="small" />
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              Admin Account
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Full system access and permissions
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </div>

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
                    placeholder="user@example.com"
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
                    helperText="Minimum 6 characters required"
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

                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontSize: '16px',
                    }}
                  >
                    Cancel
                  </Button>
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
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Box>
              </Box>
            </form>
          </Paper>

          {/* Right Side - Info Cards */}
          <Box sx={{ width: 350 }}>
            <Card sx={{ mb: 2, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Account Types
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <PersonOutlined color="primary" fontSize="small" />
                      <Typography variant="subtitle2" fontWeight="bold">
                        User Account
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      • View and access assigned projects<br />
                      • Collaborate with team members<br />
                      • Update task status
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <AdminPanelSettingsOutlined color="error" fontSize="small" />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Admin Account
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      • Full system access<br />
                      • Create and manage projects<br />
                      • Register new users<br />
                      • Assign team members
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, bgcolor: '#FEF3C7' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                  ⚠️ Important Notes
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  • New users will receive a welcome email<br />
                  • Users should change password on first login<br />
                  • Passwords must be at least 6 characters<br />
                  • Email addresses must be unique<br />
                  • Admin accounts have full permissions
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
