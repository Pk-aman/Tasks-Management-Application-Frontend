import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Divider,
  Avatar,
  AvatarGroup,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  EditOutlined,
  DeleteOutlined,
  CalendarTodayOutlined,
  PersonOutlined,
  GroupOutlined,
  AssignmentOutlined,
  BusinessOutlined,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { projectService } from '../services/projectService';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { ProjectComments } from '../components/projects/ProjectComments';
import type { Project, ApiError, ProjectStatus } from '../utils';

const STATUS_COLORS: Record<
  ProjectStatus,
  'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
> = {
  'new': 'info',
  'requirement-gathering': 'primary',
  'planning': 'secondary',
  'execution': 'warning',
  'monitoring-and-control': 'primary',
  'close': 'success',
  'block': 'error',
  'wont-done': 'default',
};

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await projectService.getProjectById(id);
      setProject(response.project);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !project) return;
    
    if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
      try {
        await projectService.deleteProject(id);
        navigate('/dashboard');
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  const handleAddComment = async (text: string) => {
    if (!id) {
      setError('Project ID is missing');
      return;
    }
    
    try {
      console.log('Adding comment to project:', id); // Debug log
      const response = await projectService.addComment(id, { text });
      console.log('Comment added successfully:', response); // Debug log
      setProject(response.project);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Add comment error:', err); // Debug log
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Failed to add comment';
      setError(errorMessage);
      throw err;
    }
  };
  

  const handleDeleteComment = async (commentId: string) => {
    if (!id) return;
    
    try {
      const response = await projectService.deleteComment(id, commentId);
      setProject(response.project);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'Failed to delete comment');
      throw err;
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    return status
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getUserName = (user: any) => {
    if (typeof user === 'string') return user;
    return user?.name || 'Unknown';
  };

  const getUserInitials = (user: any) => {
    const name = getUserName(user);
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#F9FAFB"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#F9FAFB"
      >
        <Paper sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error || 'Project not found'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => navigate('/dashboard')} sx={{ bgcolor: 'white' }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" fontWeight="bold">
              Project Details
            </Typography>
          </Box>
          {isAdmin && (
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<EditOutlined />}
                onClick={() => setEditModalOpen(true)}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlined />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Project Info */}
        <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
            <Typography variant="h5" fontWeight="bold">
              {project.title}
            </Typography>
            <Chip
              label={getStatusLabel(project.status)}
              color={STATUS_COLORS[project.status]}
            />
          </Box>

          <Typography variant="body1" color="text.secondary" paragraph>
            {project.description}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Project Metadata */}
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <CalendarTodayOutlined color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Deadline
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {format(new Date(project.deadline), 'MMMM dd, yyyy')}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <PersonOutlined color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Assignee
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {getUserName(project.assignee)}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <PersonOutlined color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Created By
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {getUserName(project.createdBy)}
                </Typography>
              </Box>
            </Box>

            {project.clientDetails && (
              <Box display="flex" alignItems="center" gap={2}>
                <BusinessOutlined color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Client Details
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {project.clientDetails}
                  </Typography>
                </Box>
              </Box>
            )}

            {project.members && project.members.length > 0 && (
              <Box display="flex" alignItems="center" gap={2}>
                <GroupOutlined color="action" />
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    Team Members ({project.members.length})
                  </Typography>
                  <AvatarGroup max={10}>
                    {project.members.map((member, index) => (
                      <Tooltip key={index} title={getUserName(member)}>
                        <Avatar sx={{ bgcolor: '#10B981' }}>
                          {getUserInitials(member)}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                </Box>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Acceptance Criteria */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <AssignmentOutlined color="action" />
              <Typography variant="h6" fontWeight="bold">
                Acceptance Criteria
              </Typography>
            </Box>
            <Paper sx={{ p: 2, bgcolor: '#F9FAFB' }}>
              <Typography variant="body2" whiteSpace="pre-line">
                {project.acceptanceCriteria}
              </Typography>
            </Paper>
          </Box>
        </Paper>

        {/* Comments Section */}
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <ProjectComments
            comments={project.comments || []}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        </Paper>
      </Container>

      {/* Edit Modal */}
      <CreateProjectModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => {
          setEditModalOpen(false);
          fetchProject();
        }}
        editProject={project}
      />
    </Box>
  );
};
