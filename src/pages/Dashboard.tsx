import { Button, Container, Typography, Paper, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Paper elevation={3} className="p-6">
        <Box className="flex justify-between items-center mb-6">
          <div>
            <Typography variant="h4" className="font-bold mb-2">
              Welcome, {user?.name}!
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Role: <span className="font-semibold capitalize">{user?.role}</span>
            </Typography>
          </div>
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
        
        <Typography variant="body1" className="mt-4">
          This is a protected dashboard page. Only authenticated users can see this.
        </Typography>
      </Paper>
    </Container>
  );
};
