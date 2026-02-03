export interface User {
  id: string; // Global ID
  name: string;
  avatar: string;
  color: string;
  joinedAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface Counter {
  id: string;
  emoji: string;
  title: string;
  description?: string;
  color: string; 
  createdAt: number;
  createdBy: string;
}

export interface LogEntry {
  id: string;
  counterId: string;
  userId: string;
  timestamp: number;
}

export interface Group {
  id: string;
  code: string;
  name: string;
  users: User[];
  counters: Counter[];
  logs: LogEntry[];
  createdAt: number;
}

// Replaces Session
export interface AppState {
  profile: UserProfile | null;
  myGroupIds: string[]; // List of group IDs the user belongs to
  activeGroupId: string | null;
}
