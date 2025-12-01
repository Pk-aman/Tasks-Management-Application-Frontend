import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  CardActionArea,
} from '@mui/material';
import { SubdirectoryArrowRightOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Task, TaskStatus } from '../../utils';
import { ProfileAvatar } from '../common/ProfileAvatar';

interface TaskCardProps {
  task: Task;
  isSubtask?: boolean;
}

const STATUS_COLORS: Record<
  TaskStatus,
  'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
> = {
  'new': 'info',
  'todo': 'default',
  'inprogress': 'warning',
  'testing': 'secondary',
  'done': 'success',
  'block': 'error',
  'wont-done': 'default',
};

export const TaskCard = ({ task, isSubtask = false }: TaskCardProps) => {
  const navigate = useNavigate();

  const getStatusLabel = (status: TaskStatus) => {
    const labels: Record<TaskStatus, string> = {
      'new': 'New',
      'todo': 'To Do',
      'inprogress': 'In Progress',
      'testing': 'Testing',
      'done': 'Done',
      'block': 'Block',
      'wont-done': "Won't Done",
    };
    return labels[status];
  };

  const handleClick = () => {
    navigate(`/tasks/${task._id}`);
  };

  return (
    <Card
      sx={{
        mb: 2,
        transition: 'all 0.2s',
        borderLeft: isSubtask ? '3px solid #10B981' : 'none',
        ml: isSubtask ? 3 : 0,
        '&:hover': {
          boxShadow: 3,
          cursor: 'pointer',
        },
      }}
    >
      <CardActionArea onClick={handleClick}>
        <CardContent sx={{ py: 2, px: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {/* Left side - Title */}
            <Box display="flex" alignItems="center" gap={1.5} flex={1}>
              {isSubtask && (
                <SubdirectoryArrowRightOutlined 
                  fontSize="small" 
                  sx={{ color: '#10B981' }} 
                />
              )}
              <Typography variant="body1" fontWeight="500">
                {task.title}
              </Typography>
            </Box>

            {/* Right side - Assignee and Status */}
            <Box display="flex" alignItems="center" gap={2}>
              {/* Assignee */}
                <ProfileAvatar sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: '#10B981',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }} name={task.assignee.name} />

              {/* Status */}
              <Chip
                label={getStatusLabel(task.status)}
                color={STATUS_COLORS[task.status]}
                size="small"
                sx={{ 
                  fontWeight: 500,
                  minWidth: 100,
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
