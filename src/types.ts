export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  name?: string;
  surname?: string;
  profileImage?: {
    url: string;
    filename?: string;
    path?: string;
    updatedAt?: string;
  };
}

export interface Participant {
  userId: string;
  userName?: string;
  email?: string;
  role: 'admin' | 'member';
  joinedAt: string | Date;
}

export interface Project {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
  createdAt?: string | Date;
  updatedAt?: string | Date;
  dueDate?: string | Date;
  owner: string;
  participants?: Participant[];
  tasks?: Task[];
  shareCode?: string;
  isCompleted?: boolean;
}

export interface Task {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  status: 'beklemede' | 'yapiliyor' | 'tamamlandi';
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'düşük' | 'normal' | 'yüksek';
  dueDate?: string | Date;
  deadline?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  projectId: string;
  project?: string;
  assignedTo?: Array<{
    user: any;
    completed?: boolean;
    completedAt?: Date | string;
    assignedAt?: Date | string;
  }>;
  owner?: string;
  tags?: string[];
  resources?: Array<{
    type: 'link' | 'file';
    url: string;
    description?: string;
    _id?: string;
  }>;
} 