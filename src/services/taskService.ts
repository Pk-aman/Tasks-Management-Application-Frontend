import axiosInstance from '../api/axiosInstance';
import type { Task, CreateTaskData, ApiResponse, AddCommentData } from '../utils';

interface TasksResponse extends ApiResponse {
  tasks: Task[];
}

interface TaskResponse extends ApiResponse {
  task: Task;
}

export const taskService = {
  getTasksByProject: async (projectId: string): Promise<TasksResponse> => {
    const response = await axiosInstance.get<TasksResponse>(`/tasks/project/${projectId}`);
    return response.data;
  },

  getTaskById: async (taskId: string): Promise<TaskResponse> => {
    const response = await axiosInstance.get<TaskResponse>(`/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (taskData: CreateTaskData): Promise<TaskResponse> => {
    const response = await axiosInstance.post<TaskResponse>('/tasks', taskData);
    return response.data;
  },

  updateTask: async (
    taskId: string,
    taskData: Partial<CreateTaskData>
  ): Promise<TaskResponse> => {
    const response = await axiosInstance.put<TaskResponse>(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete<ApiResponse>(`/tasks/${taskId}`);
    return response.data;
  },

  addComment: async (taskId: string, commentData: AddCommentData): Promise<TaskResponse> => {
    const response = await axiosInstance.post<TaskResponse>(
      `/tasks/${taskId}/comments`,
      commentData
    );
    return response.data;
  },

  deleteComment: async (taskId: string, commentId: string): Promise<TaskResponse> => {
    const response = await axiosInstance.delete<TaskResponse>(
      `/tasks/${taskId}/comments/${commentId}`
    );
    return response.data;
  },
};
