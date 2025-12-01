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
  Alert,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import type { TaskStatus, User, ApiError, Task, CreateTaskData } from '../../utils';
import { ProfileAvatar } from '../common/ProfileAvatar';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  parentTaskId?: string | null;
  editTask?: Task | null;
}

const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'todo', label: 'To Do' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'testing', label: 'Testing' },
  { value: 'done', label: 'Done' },
  { value: 'block', label: 'Block' },
  { value: 'wont-done', label: "Won't Done" },
];

export const CreateTaskModal = ({
  open,
  onClose,
  onSuccess,
  projectId,
  parentTaskId = null,
  editTask = null,
}: CreateTaskModalProps) => {
  const { user: currentUser } = useAuthStore();
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    acceptanceCriteria: '',
    project: projectId,
    parentTask: parentTaskId,
    members: [],
    deadline: '',
    status: 'new',
    assignee: currentUser?._id || '',
  });

  const isEditMode = !!editTask;
  const isSubtask = !!parentTaskId;

  useEffect(() => {
    if (open && projectId) {
      fetchProjectMembers();

      if (editTask) {
        // Extract member IDs
        const memberIds = editTask.members.map((m: any) =>
          typeof m === 'string' ? m : m._id
        );
        
        // Extract assignee ID
        const assigneeId =
          typeof editTask.assignee === 'string'
            ? editTask.assignee
            : editTask.assignee?._id || currentUser?._id || '';

        setFormData({
          title: editTask.title,
          description: editTask.description,
          acceptanceCriteria: editTask.acceptanceCriteria,
          project: projectId,
          parentTask: parentTaskId,
          members: memberIds,
          deadline: editTask.deadline.split('T')[0],
          status: editTask.status,
          assignee: assigneeId,
        });
      } else {
        resetForm();
      }
    }
  }, [open, editTask, currentUser, projectId]);

  const fetchProjectMembers = async () => {
    try {
      const response = await projectService.getProjectById(projectId);
      const project = response.project;

      const members: User[] = [];

      // Add assignee
      if (project.assignee) {
        const assignee =
          typeof project.assignee === 'string'
            ? null
            : {
                _id: project.assignee._id,
                name: project.assignee.name,
                email: project.assignee.email,
                role: project.assignee.role,
              };
        if (assignee) members.push(assignee as User);
      }

      // Add all project members
      if (project.members && project.members.length > 0) {
        project.members.forEach((member: any) => {
          if (typeof member !== 'string') {
            const memberData = {
              _id: member._id,
              name: member.name,
              email: member.email,
              role: member.role,
            };

            // Avoid duplicates
            if (!members.find((m) => m._id === memberData._id)) {
              members.push(memberData as User);
            }
          }
        });
      }

      setProjectMembers(members);
    } catch (err) {
      console.error('Failed to fetch project members:', err);
      setError('Failed to load project members');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      acceptanceCriteria: '',
      project: projectId,
      parentTask: parentTaskId,
      members: [],
      deadline: '',
      status: 'new',
      assignee: currentUser?._id || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditMode && editTask) {
        await taskService.updateTask(editTask._id || '', formData as any);
      } else {
        await taskService.createTask(formData as any);
      }
      onSuccess();
      handleClose();
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.message ||
          `Failed to ${isEditMode ? 'update' : 'create'} ${isSubtask ? 'subtask' : 'task'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    setError('');
    onClose();
  };

  // ✅ Get selected member objects for display
  const selectedMemberObjects = projectMembers.filter((u) =>
    formData.members.includes(u._id)
  );

  // ✅ Get selected assignee object for display
  const selectedAssignee = projectMembers.find((u) => u._id === formData.assignee);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
            {isEditMode
              ? `Edit ${isSubtask ? 'Subtask' : 'Task'}`
              : `Create New ${isSubtask ? 'Subtask' : 'Task'}`}
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseOutlined />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Task Title */}
            <TextField
              label={`${isSubtask ? 'Subtask' : 'Task'} Title`}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              fullWidth
              placeholder={`Enter ${isSubtask ? 'subtask' : 'task'} title`}
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
              placeholder="Describe the task"
            />

            {/* Acceptance Criteria */}
            <TextField
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
              fullWidth
              placeholder="Define acceptance criteria"
            />

            {/* Team Members - FIXED with Autocomplete */}
            <Autocomplete
              multiple
              options={projectMembers}
              value={selectedMemberObjects} // ✅ Display User objects
              onChange={(_, newValue) => {
                setFormData({
                  ...formData,
                  members: newValue.map((user) => user._id), // ✅ Store IDs
                });
              }}
              getOptionLabel={(option) => option.name} // ✅ Show names
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Team Members *"
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
                      <ProfileAvatar sx={{
                        bgcolor: '#10B981',
                        width: 24,
                        height: 24,
                        fontSize: '0.75rem',
                      }}

                      name={option.name} />
                    }
                  />
                ))
              }
            />

            {/* Assignee - FIXED with Autocomplete */}
            <Autocomplete
              options={projectMembers}
              value={selectedAssignee || null}
              onChange={(_, newValue) => {
                setFormData({
                  ...formData,
                  assignee: newValue?._id || '',
                });
              }}
              getOptionLabel={(option) => `${option.name} (${option.role})`}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assignee *"
                  placeholder="Select assignee"
                  required
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option._id}>
                  <ProfileAvatar sx={{
                      bgcolor: '#10B981',
                      width: 32,
                      height: 32,
                      mr: 2,
                      fontSize: '0.875rem',
                    }} name={option.name}/>
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
                  status: e.target.value as TaskStatus,
                })
              }
              required
              fullWidth
            >
              {TASK_STATUSES.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
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
              ? `Update ${isSubtask ? 'Subtask' : 'Task'}`
              : `Create ${isSubtask ? 'Subtask' : 'Task'}`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
