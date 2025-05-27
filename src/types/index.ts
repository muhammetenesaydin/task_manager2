export interface Task {
  id: string;
  _id?: string;
  title: string;
  description: string;
  status: 'yapiliyor' | 'beklemede' | 'tamamlandi';
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
  assignedTo?: AssignedUser[];
  owner?: string;
  priority?: 'düşük' | 'normal' | 'yüksek';
  tags?: string[];
  project?: string;
  resources?: TaskResource[];
}

export interface AssignedUser {
  user: {
    id: string;
    name?: string;
  };
  assignedAt?: Date;
  completed?: boolean;
  completedAt?: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
  owner?: string;
  shareCode?: string;
  participants?: Participant[];
}

export interface Participant {
  userId: string;
  userName?: string;
  email?: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface User {
  id: string;
  name?: string;
  surname?: string;
  username: string;
  email: string;
  profileImage?: {
    filename?: string;
    path?: string;
    mimetype?: string;
    size?: number;
    url: string;
    updatedAt?: Date;
  };
  title?: string;
  expertise?: string[];
}

export interface TaskResource {
  type: 'link' | 'file';
  url: string;
  description?: string;
  addedBy?: string;
  addedAt: Date;
  _id?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  title?: string;
  expertise?: string[];
  isOwner?: boolean;
  isAdmin?: boolean;
  avatarColor?: string;
  groupId?: string;
}

export interface TeamGroup {
  id: string;
  name: string;
  members: TeamMember[];
}

export interface ProjectTeam {
  owner: TeamMember;
  admins: TeamMember[];
  groups: TeamGroup[];
  members: TeamMember[];
}