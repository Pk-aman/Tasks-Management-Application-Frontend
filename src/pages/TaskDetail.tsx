import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  ArrowBack,
  EditOutlined,
  DeleteOutlined,
  CalendarTodayOutlined,
  CheckCircleOutline,
  AddCircleOutline,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { useAuthStore } from "../store/authStore";
import { taskService } from "../services/taskService";
import { CreateTaskModal } from "../components/tasks/TaskModal";
import { TaskCard } from "../components/tasks/TaskCard";
import { ProjectComments } from "../components/projects/ProjectComments";
import type { Task, ApiError, TaskStatus } from "../utils";
import { ProfileAvatar } from "../components/common/ProfileAvatar";

const STATUS_COLORS: Record<
  TaskStatus,
  "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success"
> = {
  new: "info",
  todo: "default",
  inprogress: "warning",
  testing: "secondary",
  done: "success",
  block: "error",
  "wont-done": "default",
};

export const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createSubtaskModalOpen, setCreateSubtaskModalOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const isSubtask = task?.parentTask !== null && task?.parentTask !== undefined;

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTask = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await taskService.getTaskById(id);
      setTask(response.task);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || "Failed to fetch task");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !task) return;

    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        await taskService.deleteTask(id);
        const projectId =
          typeof task.project === "string" ? task.project : task.project?._id;
        if (projectId) {
          navigate(`/projects/${projectId}`);
        } else {
          navigate("/dashboard");
        }
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.response?.data?.message || "Failed to delete task");
      }
    }
  };

  const handleAddComment = async (text: string) => {
    if (!id) return;

    try {
      const response = await taskService.addComment(id, { text });
      setTask(response.task);
      setError("");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || "Failed to add comment");
      throw err;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!id) return;

    try {
      const response = await taskService.deleteComment(id, commentId);
      setTask(response.task);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || "Failed to delete comment");
      throw err;
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    const labels: Record<TaskStatus, string> = {
      new: "New",
      todo: "To Do",
      inprogress: "In Progress",
      testing: "Testing",
      done: "Done",
      block: "Block",
      "wont-done": "Won't Done",
    };
    return labels[status];
  };

  const getUserName = (user: any) => {
    if (typeof user === "string") return user;
    return user?.name || "Unknown";
  };

  const getProjectTitle = () => {
    if (!task?.project) return "Unknown Project";
    if (typeof task.project === "string") return "Project";
    return task.project.title || "Unknown Project";
  };

  const getProjectId = () => {
    if (!task?.project) return null;
    if (typeof task.project === "string") return task.project;
    return task.project._id;
  };

  const canUserEditTask = () => {
    if (!task || !user) return false;

    // Admin can edit all tasks
    if (user.role === "admin") return true;

    // Check if user is the assignee
    const assigneeId =
      typeof task.assignee === "string" ? task.assignee : task.assignee?._id;

    if (assigneeId === user._id) return true;

    // Check if user is in task members
    const isMember = task.members?.some((member: any) => {
      const memberId =
        typeof member === "string" ? member : member.id || member.id;
      return memberId === user._id;
    });

    if (isMember) return true;

    // Check if user is project member or assignee
    const project = task.project;
    if (project && typeof project === "object") {
      const projectAssigneeId =
        typeof project.assignee === "string"
          ? project.assignee
          : project.assignee?._id;

      if (projectAssigneeId === user._id) return true;

      const isProjectMember = project.members?.some((member: any) => {
        const memberId =
          typeof member === "string" ? member : member.id || member.id;
        return memberId === user._id;
      });

      if (isProjectMember) return true;
    }

    return false;
  };

  const canEdit = canUserEditTask();

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

  if (error && !task) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#F9FAFB"
      >
        <Paper sx={{ p: 4, maxWidth: 500, textAlign: "center" }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/dashboard")}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!task) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F9FAFB" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #E5E7EB",
          py: 2,
          px: 3,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Container maxWidth="xl">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton
                onClick={() => {
                  const projectId = getProjectId();
                  if (projectId) {
                    navigate(`/projects/${projectId}`);
                  } else {
                    navigate("/dashboard");
                  }
                }}
              >
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {getProjectTitle()} / {task.title}
                </Typography>
              </Box>
            </Box>
            {canEdit && (
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditOutlined />}
                  onClick={() => setEditModalOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<DeleteOutlined />}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" onClose={() => setError("")} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left Column - Main Content */}
          <Grid size={{ xs: 12, lg: 8 }}>
            {/* Task Title and Status */}
            <Box mb={3}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h4" fontWeight="bold">
                  {task.title}
                </Typography>
                <Chip
                  label={getStatusLabel(task.status)}
                  color={STATUS_COLORS[task.status]}
                  size="small"
                />
              </Box>
            </Box>

            {/* Description */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                Description
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                whiteSpace="pre-line"
              >
                {task.description}
              </Typography>
            </Paper>

            {/* Acceptance Criteria */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CheckCircleOutline color="action" fontSize="small" />
                <Typography variant="subtitle2" fontWeight="bold">
                  Acceptance Criteria
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                whiteSpace="pre-line"
              >
                {task.acceptanceCriteria}
              </Typography>
            </Paper>

            {/* Subtasks Section - Only show if this is a task, not a subtask */}
            {!isSubtask && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    Subtasks ({task.subtasks?.length || 0})
                  </Typography>
                  {canEdit && (
                    <Button
                      size="small"
                      startIcon={<AddCircleOutline />}
                      onClick={() => setCreateSubtaskModalOpen(true)}
                      sx={{ textTransform: "none" }}
                    >
                      Create Subtask
                    </Button>
                  )}
                </Box>
                {task.subtasks && task.subtasks.length > 0 ? (
                  <Box>
                    {task.subtasks.map((subtask) => (
                      <TaskCard key={subtask._id} task={subtask} isSubtask />
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 4,
                      color: "text.secondary",
                    }}
                  >
                    <Typography variant="body2">
                      No subtasks created yet. Break down this task into smaller
                      subtasks.
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}

            {/* Comments Section */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                Activity
              </Typography>
              <ProjectComments
                comments={task.comments || []}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
              />
            </Paper>
          </Grid>

          {/* Right Column - Details Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper sx={{ p: 3, position: "sticky", top: 80 }}>
              <Typography variant="subtitle2" fontWeight="bold" mb={3}>
                Details
              </Typography>

              {/* Assignee */}
              <Box mb={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={1}
                >
                  Assignee
                </Typography>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <ProfileAvatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "#10B981",
                    }}
                    name={task.assignee.name}
                  />
                  <Typography variant="body2" fontWeight="500">
                    {getUserName(task.assignee)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Created By */}
              <Box mb={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={1}
                >
                  Reporter
                </Typography>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <ProfileAvatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "#10B981",
                    }}
                    name={task.assignee.name}
                  />
                  <Typography variant="body2" fontWeight="500">
                    {getUserName(task.createdBy)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Deadline */}
              <Box mb={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={1}
                >
                  Deadline
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarTodayOutlined fontSize="small" color="action" />
                  <Typography variant="body2" fontWeight="500">
                    {format(new Date(task.deadline), "MMMM dd, yyyy")}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Team Members */}
              {task.members && task.members.length > 0 && (
                <>
                  <Box mb={3}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mb={1.5}
                    >
                      Team Members ({task.members.length})
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1.5}>
                      {task.members.map((member, index) => (
                        <Box
                          key={index}
                          display="flex"
                          alignItems="center"
                          gap={1.5}
                        >
                          <ProfileAvatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "#10B981",
                            }}
                            name={task.assignee.name}
                          />
                          <Typography variant="body2" fontWeight="500">
                            {getUserName(member)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              {/* Timestamps */}
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Created {format(new Date(task.createdAt), "MMM dd, yyyy")}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Updated {format(new Date(task.updatedAt), "MMM dd, yyyy")}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Edit Task Modal */}
      <CreateTaskModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => {
          setEditModalOpen(false);
          fetchTask();
        }}
        projectId={getProjectId() || ""}
        parentTaskId={task.parentTask?._id}
        editTask={task}
      />

      {/* Create Subtask Modal */}
      <CreateTaskModal
        open={createSubtaskModalOpen}
        onClose={() => setCreateSubtaskModalOpen(false)}
        onSuccess={() => {
          setCreateSubtaskModalOpen(false);
          fetchTask();
        }}
        projectId={getProjectId() || ""}
        parentTaskId={id || ""}
      />
    </Box>
  );
};
