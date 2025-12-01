import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  AddCircleOutline,
  SearchOutlined,
  CloseOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { projectService } from '../services/projectService';
import { authService } from '../services/authService';
import { ProjectModal } from '../components/projects/ProjectModal';
import { ProjectStats } from '../components/projects/ProjectStats';
import { MemberSelect } from '../components/common/MemberSelect';
import type { Project, User, ProjectStatus, DashboardStats } from '../utils';
import { ProfileAvatar } from '../components/common/ProfileAvatar';

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

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    blockedProjects: 0,
    totalMembers: 0,
    projectsByStatus: [],
  });
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]); 

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchProjects();
    fetchStats();
    fetchUsers();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchQuery, selectedAssignees, projects]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await projectService.getAllProjects();
      const sortedProjects = (response.projects || []).sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setProjects(sortedProjects);
      setFilteredProjects(sortedProjects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await projectService.getDashboardStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await authService.getAllUsers();// ✅ Check if _id exists
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };
  

  const filterProjects = () => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query)
      );
    }

    // Assignee filter - Apply ONLY when members are selected
    if (selectedAssignees.length > 0) {
      filtered = filtered.filter((project) => {
        const assigneeId = project.assignee?._id;
        return assigneeId && selectedAssignees.includes(assigneeId);
      });
    }

    setFilteredProjects(filtered);
  };

  const getStatusLabel = (status: ProjectStatus) => {
    return status
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getAssigneeName = (assignee: any) => {
    if (!assignee) return 'Unassigned';
    if (typeof assignee === 'string') return assignee;
    return assignee?.name || 'Unknown';
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const isFilterActive = searchQuery.trim() !== '' || selectedAssignees.length > 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Typography variant="h4" fontWeight="bold">
            Dashboard
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddCircleOutline />}
              onClick={() => setCreateModalOpen(true)}
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

        <Grid container spacing={3}>
          {/* Left Section - Projects List */}
          <Grid size={{ xs: 12, lg: 7 }}>
            {/* Search Box with X icon */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                        edge="end"
                      >
                        <CloseOutlined />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Paper>

            {/* Projects Header with Filter */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Projects ({filteredProjects.length})
              </Typography>

              {/* Member Select Filter */}
              <MemberSelect
                label="Filter by Assignee"
                options={users.map((u) => {
                  return {
                    _id: u._id,
                    name: u.name,
                    label: u.name,
                  };
                })}
                selectedIds={selectedAssignees}
                onChange={setSelectedAssignees}
              />
            </Box>

            {/* Projects List */}
            {loading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
              </Box>
            ) : filteredProjects.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredProjects.map((project) => (
                  <Paper
                    key={project._id}
                    sx={{
                      p: 2.5,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-2px)',
                      },
                    }}
                    onClick={() => handleProjectClick(project._id || '')}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box flex={1} pr={2}>
                        <Typography variant="h6" fontWeight="600">
                          {project.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {project.description}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={3}>
                        <Chip
                          label={getStatusLabel(project.status)}
                          color={STATUS_COLORS[project.status]}
                          size="medium"
                          sx={{ minWidth: 140, fontWeight: 500 }}
                        />

                        <Box display="flex" alignItems="center" gap={1.5} minWidth={150}>
                          <ProfileAvatar sx={{
                              width: 32,
                              height: 32,
                              bgcolor: '#10B981',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                            }}
                            name={project.assignee.name} />
                          <Typography variant="body2" fontWeight="500" noWrap>
                            {getAssigneeName(project.assignee)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Paper sx={{ p: 8, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  {isFilterActive
                    ? 'No projects found matching your filters'
                    : 'No projects yet'}
                </Typography>
                {isAdmin && !isFilterActive && (
                  <Button
                    variant="contained"
                    startIcon={<AddCircleOutline />}
                    onClick={() => setCreateModalOpen(true)}
                    sx={{ mt: 2 }}
                  >
                    Create Your First Project
                  </Button>
                )}
              </Paper>
            )}
          </Grid>

          {/* Right Section - Statistics */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Dashboard Metrics
              </Typography>

              <ProjectStats stats={stats} />

              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Projects by Status
                </Typography>
                <Box>
                  {stats.projectsByStatus && stats.projectsByStatus.length > 0 ? (
                    stats.projectsByStatus.map((item) => (
                      <Box
                        key={item.status}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        py={1.5}
                        borderBottom="1px solid #E5E7EB"
                      >
                        <Typography variant="body2" textTransform="capitalize">
                          {item.status.replace(/-/g, ' ')}
                        </Typography>
                        <Chip
                          label={item.count}
                          size="small"
                          sx={{
                            bgcolor: '#10B981',
                            color: 'white',
                            fontWeight: 600,
                            minWidth: 40,
                          }}
                        />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                      No project data available
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <ProjectModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          fetchProjects();
          fetchStats();
        }}
      />
    </Box>
  );
};
