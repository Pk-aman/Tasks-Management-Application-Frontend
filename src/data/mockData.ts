// Mock users database
export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    otp?: string;
    otpExpiry?: number;
  }
  
  export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'completed';
    createdDate: string;
    userId: string;
  }
  
  // Initial mock users
  export const mockUsers: User[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    },
    {
      id: '2',
      name: 'Normal User',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
    },
  ];
  
  // Initial mock tasks
  export const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Complete Project Documentation',
      description: 'Write comprehensive documentation for the task management system',
      status: 'pending',
      createdDate: '2025-11-25',
      userId: '1',
    },
    {
      id: '2',
      title: 'Review Code',
      description: 'Review pull requests from team members',
      status: 'completed',
      createdDate: '2025-11-26',
      userId: '2',
    },
  ];
  
  // Helper functions for localStorage
  export const getUsersFromStorage = (): User[] => {
    const users = localStorage.getItem('mockUsers');
    return users ? JSON.parse(users) : mockUsers;
  };
  
  export const saveUsersToStorage = (users: User[]) => {
    localStorage.setItem('mockUsers', JSON.stringify(users));
  };
  
  export const getTasksFromStorage = (): Task[] => {
    const tasks = localStorage.getItem('mockTasks');
    return tasks ? JSON.parse(tasks) : mockTasks;
  };
  
  export const saveTasksToStorage = (tasks: Task[]) => {
    localStorage.setItem('mockTasks', JSON.stringify(tasks));
  };
  
  // Initialize storage on first load
  if (!localStorage.getItem('mockUsers')) {
    saveUsersToStorage(mockUsers);
  }
  
  if (!localStorage.getItem('mockTasks')) {
    saveTasksToStorage(mockTasks);
  }
  