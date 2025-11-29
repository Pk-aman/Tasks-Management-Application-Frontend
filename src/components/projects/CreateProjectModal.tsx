import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Typography,
  IconButton,
  Alert,
  OutlinedInput,
} from '@mui/material';
import { Close, AddCircleOutline, EditOutlined } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { projectService } from '../../services/projectService';
import { authService } from '../../services/authService';
import type { ProjectStatus, User, ApiError, Project, CreateProjectData } from '../../utils';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editProject?: Project | null;
}

const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'requirement-gathering', label: 'Requirement Gathering' },
  { value: 'planning', label: 'Planning' },
  { value: 'execution', label: 'Execution' },
  { value: 'monitoring-and-control', label: 'Monitoring & Control' },
  { value: 'close', label: 'Close' },
  { value: 'block', label: 'Block' },
  { value: 'wont-done', label: "Won't Done" },
];

export const CreateProjectModal = ({
  open,
  onClose,
  onSuccess,
  editProject = null,
}: CreateProjectModalProps) => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    acceptanceCriteria: '',
    members: [] as string[],
    deadline: '',
    clientDetails: '',
    status: 'new' as ProjectStatus,
    assignee: currentUser?.id || '',
  });

  const isEditMode = !!editProject;

  useEffect(() => {
    if (open) {
      fetchUsers();

      // If editing, populate form with project data
      if (editProject) {
        const memberIds = editProject.members.map((m: any) =>
          typeof m === 'string' ? m : m._id || m.id
        );
        const assigneeId =
          typeof editProject.assignee === 'string'
            ? editProject.assignee
            : editProject.assignee?.id ||
              currentUser?.id ||
              '';

        setFormData({
          title: editProject.title,
          description: editProject.description,
          acceptanceCriteria: editProject.acceptanceCriteria,
          members: memberIds,
          deadline: editProject.deadline.split('T')[0], // Format for date input
          clientDetails: editProject.clientDetails || '',
          status: editProject.status,
          assignee: assigneeId,
        });
      } else {
        // Reset form for create mode
        setFormData({
          title: '',
          description: '',
          acceptanceCriteria: '',
          members: [],
          deadline: '',
          clientDetails: '',
          status: 'new',
          assignee: currentUser?.id || '',
        });
      }
    }
  }, [open, editProject, currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await authService.getAllUsers();
      setUsers(response.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      if (isEditMode && editProject) {
        // Update existing project
        await projectService.updateProject(editProject.id, formData as CreateProjectData);
      } else {
        // Create new project
        await projectService.createProject(formData as CreateProjectData);
      }
      onSuccess();
      handleClose();
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.message ||
          `Failed to ${isEditMode ? 'update' : 'create'} project`
      );
    } finally {
      setLoading(false);
    }
  };
  

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      acceptanceCriteria: '',
      members: [],
      deadline: '',
      clientDetails: '',
      status: 'new',
      assignee: currentUser?.id || '',
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            {isEditMode ? (
              <EditOutlined color="primary" />
            ) : (
              <AddCircleOutline color="primary" />
            )}
            <Typography variant="h6">
              {isEditMode ? 'Edit Project' : 'Create New Project'}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Project Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              placeholder="Enter project title"
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              multiline
              rows={3}
              placeholder="Describe the project"
            />

            <TextField
              fullWidth
              label="Acceptance Criteria"
              value={formData.acceptanceCriteria}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  acceptanceCriteria: e.target.value,
                })
              }
              required
              multiline
              rows={3}
              placeholder="Define acceptance criteria"
            />

            <FormControl fullWidth required>
              <InputLabel>Team Members</InputLabel>
              <Select
                multiple
                value={formData.members}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    members: e.target.value as string[],
                  })
                }
                input={<OutlinedInput label="Team Members" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const user = users.find((u) => u.id === value);
                      return (
                        <Chip
                          key={value}
                          label={user?.name || value}
                          size="small"
                          color="primary"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.email}) - {user.role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Assignee</InputLabel>
              <Select
                value={formData.assignee}
                onChange={(e) =>
                  setFormData({ ...formData, assignee: e.target.value })
                }
                label="Assignee"
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </MenuItem>
                ))}
              </Select>
              {!isEditMode && (
                <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>
                  Default: {currentUser?.name}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              required
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as ProjectStatus,
                  })
                }
                label="Status"
              >
                {PROJECT_STATUSES.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Client Details (Optional)"
              value={formData.clientDetails}
              onChange={(e) =>
                setFormData({ ...formData, clientDetails: e.target.value })
              }
              multiline
              rows={2}
              placeholder="Client name, contact info, etc."
            />

            {isEditMode && (
              <Alert severity="info" sx={{ borderRadius: '12px' }}>
                💬 Use the comments section on the project card to add conversation-style comments
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              },
            }}
          >
            {loading
              ? isEditMode
                ? 'Updating...'
                : 'Creating...'
              : isEditMode
              ? 'Update Project'
              : 'Create Project'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
