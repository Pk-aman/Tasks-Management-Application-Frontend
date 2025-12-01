import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import { SendOutlined, DeleteOutlined } from '@mui/icons-material';
import { format, isValid, parseISO } from 'date-fns';
import type { Comment, User } from '../../utils';
import { useAuthStore } from '../../store/authStore';
import { ProfileAvatar } from '../common/ProfileAvatar';

interface ProjectCommentsProps {
  comments: Comment[];
  onAddComment: (text: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

export const ProjectComments = ({
  comments,
  onAddComment,
  onDeleteComment,
}: ProjectCommentsProps) => {
  
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await onDeleteComment(commentId);
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };

  const getUserName = (user: string | User) => {
    if (typeof user === 'string') return 'Unknown User';
    return user?.name || 'Unknown User';
  };

  const getUserId = (user: string | User) => {
    if (typeof user === 'string') return user;
    return user?._id || '';
  };
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Just now';
      
      // Try parsing the date
      const date = parseISO(dateString);
      
      // Check if the date is valid
      if (!isValid(date)) {
        return 'Just now';
      }
      
      return format(date, 'MMM dd, yyyy - hh:mm a');
    } catch (error) {
      console.error('Date formatting error:', error, dateString);
      return 'Just now';
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Comments ({comments?.length || 0})
      </Typography>

      {/* Comments List */}
      <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 3 }}>
        {!comments || comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {comments.map((comment) => {
  const commentId = comment._id || '';
  return (
    <Paper key={commentId} sx={{ p: 2, bgcolor: '#F9FAFB' }}>
      <Box display="flex" gap={2}>
        <ProfileAvatar sx={{ bgcolor: '#10B981', width: 36, height: 36 }} name={comment.sentBy.name}/>
        <Box flex={1}>
          <Box display="flex" justifyContent="space-between" alignItems="start">
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {getUserName(comment.sentBy)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.createdAt)}
              </Typography>
            </Box>
            {(getUserId(comment.sentBy) === currentUser?._id ||
              currentUser?.role === 'admin') && (
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(commentId)}
              >
                <DeleteOutlined fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Typography variant="body2" mt={1}>
            {comment.text}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
})}
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit}>
        <Box display="flex" gap={1}>
          <ProfileAvatar sx={{ bgcolor: '#10B981', width: 36, height: 36 }} name={currentUser?.name}/>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !newComment.trim()}
            sx={{
              minWidth: 100,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              },
            }}
            endIcon={<SendOutlined />}
          >
            Send
          </Button>
        </Box>
      </form>
    </Box>
  );
};
