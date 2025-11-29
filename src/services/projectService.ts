import axiosInstance from '../api/axiosInstance';
import type { Project, CreateProjectData, DashboardStats, ApiResponse, AddCommentData } from '../utils';

interface ProjectsResponse extends ApiResponse {
  projects: Project[];
}

interface ProjectResponse extends ApiResponse {
  project: Project;
}

interface StatsResponse extends ApiResponse {
  stats: DashboardStats;
}

export const projectService = {
  getAllProjects: async (): Promise<ProjectsResponse> => {
    const response = await axiosInstance.get<ProjectsResponse>('/projects');
    return response.data;
  },

  getProjectById: async (projectId: string): Promise<ProjectResponse> => {
    const response = await axiosInstance.get<ProjectResponse>(`/projects/${projectId}`);
    return response.data;
  },

  createProject: async (projectData: CreateProjectData): Promise<ProjectResponse> => {
    const response = await axiosInstance.post<ProjectResponse>('/projects', projectData);
    return response.data;
  },

  updateProject: async (
    projectId: string,
    projectData: Partial<CreateProjectData>
  ): Promise<ProjectResponse> => {
    const response = await axiosInstance.put<ProjectResponse>(
      `/projects/${projectId}`,
      projectData
    );
    return response.data;
  },

  deleteProject: async (projectId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete<ApiResponse>(`/projects/${projectId}`);
    return response.data;
  },

  getDashboardStats: async (): Promise<StatsResponse> => {
    const response = await axiosInstance.get<StatsResponse>('/projects/stats/dashboard');
    return response.data;
  },

  // Add comment to project
  addComment: async (projectId: string, commentData: AddCommentData): Promise<ProjectResponse> => {
    const response = await axiosInstance.post<ProjectResponse>(
      `/projects/${projectId}/comments`,
      commentData
    );
    return response.data;
  },

  // Delete comment
  deleteComment: async (projectId: string, commentId: string): Promise<ProjectResponse> => {
    const response = await axiosInstance.delete<ProjectResponse>(
      `/projects/${projectId}/comments/${commentId}`
    );
    return response.data;
  },
};
