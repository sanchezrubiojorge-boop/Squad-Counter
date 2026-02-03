import { AppState, User, Counter, LogEntry } from '../types';

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Alex', avatar: '😎', color: '#3b82f6', joinedAt: Date.now() },
  { id: 'u2', name: 'Sam', avatar: '🤠', color: '#ef4444', joinedAt: Date.now() },
  { id: 'u3', name: 'Jordan', avatar: '🥳', color: '#10b981', joinedAt: Date.now() },
  { id: 'u4', name: 'Casey', avatar: '👽', color: '#f59e0b', joinedAt: Date.now() },
];

export const INITIAL_COUNTERS: Counter[] = [
  { id: 'c1', emoji: '🍺', title: 'Roadtrip Beers', color: 'bg-amber-400', createdAt: Date.now(), createdBy: 'u1' },
  { id: 'c2', emoji: '🥑', title: 'Healthy Meals', color: 'bg-green-400', createdAt: Date.now(), createdBy: 'u2' },
  { id: 'c3', emoji: '🏃', title: 'Runs (km)', color: 'bg-blue-400', createdAt: Date.now(), createdBy: 'u1' },
];

// Generate some fake history
const generateLogs = (): LogEntry[] => {
  const logs: LogEntry[] = [];
  const now = Date.now();
  const day = 86400000;
  
  // Last 7 days data
  for (let i = 0; i < 50; i++) {
    logs.push({
      id: `l${i}`,
      counterId: INITIAL_COUNTERS[Math.floor(Math.random() * INITIAL_COUNTERS.length)].id,
      userId: INITIAL_USERS[Math.floor(Math.random() * INITIAL_USERS.length)].id,
      timestamp: now - Math.floor(Math.random() * 7 * day),
    });
  }
  return logs.sort((a, b) => a.timestamp - b.timestamp);
};

export const INITIAL_STATE: AppState = {
  profile: {
    id: INITIAL_USERS[0].id,
    name: INITIAL_USERS[0].name,
    avatar: INITIAL_USERS[0].avatar,
    color: INITIAL_USERS[0].color,
  },
  myGroupIds: [],
  activeGroupId: null,
};
