

// ============================================
// User Interfaces
// ============================================

import type { UserRole } from "./types";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ============================================
// Authentication Interfaces
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  otp: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

// ============================================
// API Response Interfaces
// ============================================

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface AuthResponse extends ApiResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse extends ApiResponse {
  user: User;
}

export interface OTPResponse extends ApiResponse {
  // OTP is sent via email, not returned in response
}

// ============================================
// Store Interfaces
// ============================================

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  initializeAuth: () => void;
}

// ============================================
// Component Props Interfaces
// ============================================

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

// ============================================
// Form State Interfaces
// ============================================

export interface LoginFormState {
  email: string;
  password: string;
  error: string;
  loading: boolean;
}

export interface SignupFormState {
  step: 1 | 2;
  formData: UserFormData;
  otp: string;
  error: string;
  success: string;
  loading: boolean;
}

export interface ForgotPasswordFormState {
  step: 1 | 2;
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
  error: string;
  success: string;
  loading: boolean;
}

// ============================================
// API Error Interface
// ============================================

export interface ApiError {
  response?: {
    data?: {
      success: boolean;
      message: string;
    };
    status: number;
  };
  message: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}


// Comment interface - updated to match backend
export interface Comment {
  _id?: string;
  text: string;
  sentBy: User; // Changed from 'user' to 'sentBy'
  project?: string;
  task?: string;
  createdAt: string;
  updatedAt: string;
}

// Project interface
export interface Project {
  _id: string;
  title: string;
  description: string;
  acceptanceCriteria: string;
  members: Array< User>;
  deadline: string;
  clientDetails?: string;
  status: ProjectStatus;
  comments?: Comment[];
  commentCount?: number; // Add comment count
  assignee: User;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}


// Update CreateProjectData - remove comments completely
export interface CreateProjectData {
  title: string;
  description: string;
  acceptanceCriteria: string;
  members: string[];
  deadline: string;
  clientDetails?: string;
  status: ProjectStatus;
  assignee: string;
}

// Add AddCommentData interface
export interface AddCommentData {
  text: string;
}


export type ProjectStatus =
  | 'new'
  | 'requirement-gathering'
  | 'planning'
  | 'execution'
  | 'monitoring-and-control'
  | 'close'
  | 'block'
  | 'wont-done';

export interface ProjectFormState {
  title: string;
  description: string;
  acceptanceCriteria: string;
  members: string[];
  deadline: string;
  clientDetails: string;
  status: ProjectStatus;
  comments: string;
  assignee: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  blockedProjects: number;
  totalMembers: number;
  projectsByStatus: {
    status: ProjectStatus;
    count: number;
  }[];
}

// Add Task Status type
export type TaskStatus = 
  | 'new'
  | 'todo'
  | 'inprogress'
  | 'testing'
  | 'done'
  | 'block'
  | 'wont-done';

// Task interface
export interface Task {
  _id: string;
  title: string;
  description: string;
  acceptanceCriteria: string;
  project: Project;
  parentTask?: Task | null;
  members: Array<User>;
  deadline: string;
  status: TaskStatus;
  assignee: User;
  createdBy: User;
  comments?: Comment[];
  subtasks?: Task[];
  subtaskCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Create Task Data
export interface CreateTaskData {
  title: string;
  description: string;
  acceptanceCriteria: string;
  project: string;
  parentTask?: string | null;
  members: string[];
  deadline: string;
  status?: TaskStatus;
  assignee: string;
}

export interface FilterOption {
  _id: string;  // ✅ Changed from 'id' to '_id'
  name: string;
  label?: string;
}

export interface MultiSelectFilterProps {
  label: string;
  options: FilterOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  getOptionAvatar?: (option: FilterOption) => string;
  defaultSelectAll?: boolean;
}


