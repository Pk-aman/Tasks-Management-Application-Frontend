import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Autocomplete,
  Chip,
  Box,
  IconButton,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { projectService } from '../../services/projectService';
import { authService } from '../../services/authService';
import type { Project, User, ProjectStatus, CreateProjectData } from '../../utils';
import { ProfileAvatar } from '../common/ProfileAvatar';

interface ProjectModalProps {
  open: boolean;
  project?: Project | null;
  onClose: () => void;
  onSuccess: () => void;
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

export const ProjectModal = ({
  open,
  project,
  onClose,
  onSuccess,
}: ProjectModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  // ✅ Using CreateProjectData interface
  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    description: '',
    acceptanceCriteria: '',
    members: [],
    deadline: '',
    clientDetails: '',
    status: 'new',
    assignee: '',
  });

  const isEditMode = !!project;

  useEffect(() => {
    if (open) {
      fetchUsers();
      if (isEditMode && project) {
        initializeFormForEdit();
      } else {
        resetForm();
      }
    }
  }, [open, project]);

  const fetchUsers = async () => {
    try {
      const response = await authService.getAllUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const initializeFormForEdit = () => {
    if (!project) return;

    // ✅ Extract member IDs
    const memberIds = project.members.map((m) =>
      typeof m === 'string' ? m : m._id
    );

    // ✅ Extract assignee ID
    const assigneeId =
      typeof project.assignee === 'string'
        ? project.assignee
        : project.assignee?._id || '';

    setFormData({
      title: project.title,
      description: project.description,
      acceptanceCriteria: project.acceptanceCriteria,
      members: memberIds,
      deadline: project.deadline.split('T')[0],
      clientDetails: project.clientDetails || '',
      status: project.status,
      assignee: assigneeId,
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      acceptanceCriteria: '',
      members: [],
      deadline: '',
      clientDetails: '',
      status: 'new',
      assignee: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode && project) {
        await projectService.updateProject(project._id, formData);
      } else {
        await projectService.createProject(formData);
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Failed to save project:', error);
      alert(error.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get selected member objects for display
  const selectedMemberObjects = users.filter((u) =>
    formData.members.includes(u._id)
  );

  // ✅ Get selected assignee object for display
  const selectedAssignee = users.find((u) => u._id === formData.assignee);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 8,
                height: 24,
                bgcolor: '#10B981',
                borderRadius: 1,
              }}
            />
            {isEditMode ? 'Edit Project' : 'Create Project'}
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseOutlined />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Project Title */}
            <TextField
              label="Project Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              fullWidth
            />

            {/* Description */}
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              multiline
              rows={3}
              fullWidth
            />

            {/* Acceptance Criteria */}
            <TextField
              label="Acceptance Criteria"
              value={formData.acceptanceCriteria}
              onChange={(e) =>
                setFormData({ ...formData, acceptanceCriteria: e.target.value })
              }
              required
              multiline
              rows={3}
              fullWidth
            />

            {/* Team Members - FIXED */}
            <Autocomplete
              multiple
              options={users}
              value={selectedMemberObjects} // ✅ Display User objects
              onChange={(_, newValue) => {
                setFormData({
                  ...formData,
                  members: newValue.map((user) => user._id), // ✅ Store IDs as per interface
                });
              }}
              getOptionLabel={(option) => option.name} // ✅ Show names
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Team Members"
                  placeholder="Select members"
                  required={formData.members.length === 0}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option._id} // ✅ Proper key
                    label={option.name} // ✅ Show name
                    avatar={
                      <ProfileAvatar sx={{ bgcolor: '#10B981', width: 36, height: 36 }} name={option.name} />
                    }
                  />
                ))
              }
            />

            {/* Assignee */}
            <Autocomplete
              options={users}
              value={selectedAssignee || null}
              onChange={(_, newValue) => {
                setFormData({
                  ...formData,
                  assignee: newValue?._id || '', // ✅ Store ID as per interface
                });
              }}
              getOptionLabel={(option) => `${option.name} (${option.role})`}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assignee"
                  placeholder="Select assignee"
                  required
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option._id}>
                  <ProfileAvatar name={option.name} />
                  {option.name} ({option.role})
                </Box>
              )}
            />

            {/* Deadline */}
            <TextField
              label="Deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            {/* Status */}
            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as ProjectStatus,
                })
              }
              required
              fullWidth
            >
              {PROJECT_STATUSES.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </TextField>

            {/* Client Details (Optional) */}
            <TextField
              label="Client Details (Optional)"
              value={formData.clientDetails || ''}
              onChange={(e) =>
                setFormData({ ...formData, clientDetails: e.target.value })
              }
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} disabled={loading}>
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
