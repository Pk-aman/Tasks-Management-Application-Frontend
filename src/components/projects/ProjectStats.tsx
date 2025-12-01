import { Card, CardContent, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid'; // Import Grid2
import {
  FolderOutlined,
  CheckCircleOutline,
  BlockOutlined,
  GroupOutlined,
} from '@mui/icons-material';
import type { DashboardStats } from '../../utils';

interface ProjectStatsProps {
  stats: DashboardStats;
}

export const ProjectStats = ({ stats }: ProjectStatsProps) => {
  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: <FolderOutlined sx={{ fontSize: 40 }} />,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: <CheckCircleOutline sx={{ fontSize: 40 }} />,
      color: '#10B981',
      bgColor: '#ECFDF5',
    },
    {
      title: 'Completed',
      value: stats.completedProjects,
      icon: <CheckCircleOutline sx={{ fontSize: 40 }} />,
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
    },
    {
      title: 'Blocked',
      value: stats.blockedProjects,
      icon: <BlockOutlined sx={{ fontSize: 40 }} />,
      color: '#EF4444',
      bgColor: '#FEF2F2',
    },
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: <GroupOutlined sx={{ fontSize: 40 }} />,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
    },
  ];

  return (
    <Grid container spacing={3}>
      {statCards.map((stat, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${stat.bgColor} 0%, #ffffff 100%)`,
              border: `1px solid ${stat.color}20`,
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color={stat.color}>
                    {stat.value}
                  </Typography>
                </Box>
                <Box sx={{ color: stat.color, opacity: 0.6 }}>{stat.icon}</Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
