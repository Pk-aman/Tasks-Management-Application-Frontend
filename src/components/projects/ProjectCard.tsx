import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Avatar,
  AvatarGroup,
  Tooltip,
  CardActionArea,
} from '@mui/material';
import {
  CalendarTodayOutlined,
  PersonOutlined,
  CommentOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../utils';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
}

const STATUS_COLORS: Record<
  string,
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

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();

  const getStatusLabel = (status: string) => {
    return status
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getMemberName = (member: any) => {
    if (typeof member === 'string') return member;
    return member?.name || 'Unknown';
  };

  const getMemberInitials = (member: any) => {
    const name = getMemberName(member);
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getAssigneeName = (assignee: any) => {
    if (!assignee) return 'Unassigned';
    if (typeof assignee === 'string') return assignee;
    return assignee?.name || 'Unknown';
  };

  const handleClick = () => {
    navigate(`/projects/${project.id }`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          cursor: 'pointer',
        },
      }}
    >
      <CardActionArea onClick={handleClick} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
            <Typography variant="h6" component="h3" fontWeight="bold">
              {project.title}
            </Typography>
            <Chip
              label={getStatusLabel(project.status)}
              color={STATUS_COLORS[project.status]}
              size="small"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" mb={2}>
            {project.description.length > 100
              ? `${project.description.substring(0, 100)}...`
              : project.description}
          </Typography>

          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <CalendarTodayOutlined fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Deadline: {format(new Date(project.deadline), 'MMM dd, yyyy')}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <PersonOutlined fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Assignee: {getAssigneeName(project.assignee)}
            </Typography>
          </Box>

          {/* Comments count */}
          {/* Comments count */}
          {project.commentCount !== undefined && project.commentCount > 0 && (
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CommentOutlined fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {project.commentCount}{' '}
                {project.commentCount === 1 ? 'comment' : 'comments'}
              </Typography>
            </Box>
          )}

          {project.members && project.members.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mb={1}
              >
                Team Members ({project.members.length}):
              </Typography>
              <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                {project.members.map((member, index) => (
                  <Tooltip key={index} title={getMemberName(member)}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                      {getMemberInitials(member)}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
