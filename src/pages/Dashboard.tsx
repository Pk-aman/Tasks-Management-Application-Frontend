import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  AddCircleOutline,
  LogoutOutlined,
  RefreshOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { projectService } from '../services/projectService';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectStats } from '../components/projects/ProjectStats';
import type { Project, DashboardStats, ApiError } from '../utils';

export const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    blockedProjects: 0,
    totalMembers: 0,
    projectsByStatus: [],
  });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAllProjects();
      setProjects(response.projects || []);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'Failed to fetch projects');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await projectService.getDashboardStats();
      setStats(response.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setCreateModalOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(projectId);
        fetchProjects();
        fetchStats();
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  const handleModalClose = () => {
    setCreateModalOpen(false);
    setEditingProject(null);
  };

  const handleModalSuccess = () => {
    fetchProjects();
    fetchStats();
  };

  const handleRefresh = () => {
    fetchProjects();
    fetchStats();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          borderBottom: '1px solid #E5E7EB',
          py: 2,
          px: 3,
          bgcolor: 'white',
        }}
      >
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="bold" color="text.primary">
                Project Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Welcome back, {user?.name}! ({user?.role})
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh}>
                  <RefreshOutlined />
                </IconButton>
              </Tooltip>
              {isAdmin && (
                <Button
                  variant="outlined"
                  onClick={() => navigate('/registration')}
                  size="small"
                >
                  Register User
                </Button>
              )}
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
                disabled={loading}
                startIcon={<LogoutOutlined />}
              >
                {loading ? 'Logging out...' : 'Logout'}
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Left Side - Projects List */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                Projects
              </Typography>
              {isAdmin && (
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutline />}
                  onClick={() => {
                    setEditingProject(null);
                    setCreateModalOpen(true);
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    },
                  }}
                >
                  Create Project
                </Button>
              )}
            </Box>

            {error && (
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={2}>
              {projects.length === 0 ? (
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Projects Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isAdmin
                        ? 'Create your first project to get started'
                        : 'No projects available at the moment'}
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                projects.map((project) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={project.id}>
                    <ProjectCard
                      project={project}
                    />
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>

          {/* Right Side - Statistics & Metrics */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              Dashboard Metrics
            </Typography>

            <ProjectStats stats={stats} />

            {/* Project Status Distribution */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Projects by Status
              </Typography>
              <Box>
                {stats.projectsByStatus.length > 0 ? (
                  stats.projectsByStatus.map((item) => (
                    <Box
                      key={item.status}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1}
                      borderBottom="1px solid #E5E7EB"
                    >
                      <Typography variant="body2" textTransform="capitalize">
                        {item.status.replace(/-/g, ' ')}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {item.count}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    No project data available
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Create/Edit Project Modal */}
      <CreateProjectModal
        open={createModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editProject={editingProject}
      />
    </Box>
  );
};
