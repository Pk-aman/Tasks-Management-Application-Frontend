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
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";
import { ProjectModal } from "../components/projects/ProjectModal";
import { CreateTaskModal } from "../components/tasks/TaskModal";
import { TaskCard } from "../components/tasks/TaskCard";
import { ProjectComments } from "../components/projects/ProjectComments";
import type { Project, Task, ApiError, ProjectStatus } from "../utils";
import { MemberSelect } from "../components/common/MemberSelect";
import { ProfileAvatar } from "../components/common/ProfileAvatar";

const STATUS_COLORS: Record<
  ProjectStatus,
  "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success"
> = {
  new: "info",
  "requirement-gathering": "primary",
  planning: "secondary",
  execution: "warning",
  "monitoring-and-control": "primary",
  close: "success",
  block: "error",
  "wont-done": "default",
};

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchTasks();
    }
  }, [id]);

  useEffect(() => {
    filterTasks();
  }, [selectedMembers]);

  const filterTasks = () => {
    if (selectedMembers.length > 0) {
      const filteredTasks = tasks.filter((task: Task) => {
        const assigneeId = task.assignee?._id;
        return assigneeId && selectedMembers.includes(assigneeId);
      });
      setTasks(filteredTasks);
      return;
    }
    fetchTasks();
  };

  const fetchProject = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await projectService.getProjectById(id);
      setProject(response.project);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || "Failed to fetch project");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    if (!id) return;

    try {
      const response = await taskService.getTasksByProject(id);
      setTasks(response.tasks || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const handleDelete = async () => {
    if (!id || !project) return;

    if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
      try {
        await projectService.deleteProject(id);
        navigate("/dashboard");
      } catch (err) {
        const apiError = err as ApiError;
        setError(
          apiError.response?.data?.message || "Failed to delete project"
        );
      }
    }
  };

  const handleAddComment = async (text: string) => {
    if (!id) return;

    try {
      const response = await projectService.addComment(id, { text });
      setProject(response.project);
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
      const response = await projectService.deleteComment(id, commentId);
      setProject(response.project);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || "Failed to delete comment");
      throw err;
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getUserName = (user: any) => {
    if (typeof user === "string") return user;
    return user?.name || "Unknown";
  };

  const canUserCreateTask = () => {
    if (!project || !user) return false;

    // Admin can create tasks
    if (user.role === "admin") return true;

    // Check if user is project assignee
    const assigneeId =
      typeof project.assignee === "string"
        ? project.assignee
        : project.assignee?._id;

    if (assigneeId === user._id) return true;

    // Check if user is project member
    const isMember = project.members?.some((member: any) => {
      const memberId =
        typeof member === "string" ? member : member.id || member.id;
      return memberId === user._id;
    });

    return isMember;
  };

  const canCreateTask = canUserCreateTask();

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

  if (error && !project) {
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

  if (!project) return null;

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
              <IconButton onClick={() => navigate("/dashboard")}>
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Projects / {project.title}
                </Typography>
              </Box>
            </Box>
            {isAdmin && (
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
            {/* Project Title and Status */}
            <Box mb={3}>
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                mb={2}
                justifyContent="space-between"
              >
                <Typography variant="h4" fontWeight="bold">
                  {project.title}
                </Typography>
                <Chip
                  label={getStatusLabel(project.status)}
                  color={STATUS_COLORS[project.status]}
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
                {project.description}
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
                {project.acceptanceCriteria}
              </Typography>
            </Paper>

            {/* Tasks Section */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Tasks ({tasks.length})
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  {canCreateTask && (
                    <Button
                      size="small"
                      startIcon={<AddCircleOutline />}
                      onClick={() => setCreateTaskModalOpen(true)}
                      sx={{ textTransform: "none" }}
                    ></Button>
                  )}
                  {/* Member Select Filter */}
                  <MemberSelect
                    label="Members"
                    options={project.members.map((u) => {
                      return {
                        _id: u._id,
                        name: u.name,
                        label: u.name,
                      };
                    })}
                    selectedIds={selectedMembers}
                    onChange={setSelectedMembers}
                  />
                </Box>
              </Box>
              {tasks.length > 0 ? (
                <Box>
                  {tasks.map((task) => (
                    <TaskCard key={task._id} task={task} />
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
                    No tasks created yet. Create your first task to get started.
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Comments Section */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                Activity
              </Typography>
              <ProjectComments
                comments={project.comments || []}
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
                    name={project.assignee.name}
                  />
                  <Typography variant="body2" fontWeight="500">
                    {getUserName(project.assignee)}
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
                    name={project.assignee.name}
                  />
                  <Typography variant="body2" fontWeight="500">
                    {getUserName(project.createdBy)}
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
                    {format(new Date(project.deadline), "MMMM dd, yyyy")}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Client Details */}
              {project.clientDetails && (
                <>
                  <Box mb={3}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mb={1}
                    >
                      Client
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {project.clientDetails}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              {/* Team Members */}
              {project.members && project.members.length > 0 && (
                <>
                  <Box mb={3}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mb={1.5}
                    >
                      Team Members ({project.members.length})
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1.5}>
                      {project.members.map((member, index) => (
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
                            name={project.assignee.name}
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
                  Created {format(new Date(project.createdAt), "MMM dd, yyyy")}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Updated {format(new Date(project.updatedAt), "MMM dd, yyyy")}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Edit Project Modal */}
      <ProjectModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => {
          setEditModalOpen(false);
          fetchProject();
        }}
        project={project}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        open={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        onSuccess={() => {
          setCreateTaskModalOpen(false);
          fetchTasks();
        }}
        projectId={id || ""}
      />
    </Box>
  );
};
