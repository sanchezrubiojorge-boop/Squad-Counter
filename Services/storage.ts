import { Group, User, Counter, LogEntry, UserProfile } from '../types';

const DB_KEY = 'squad_db_v2'; // Bump version
const PROFILE_KEY = 'squad_profile_v2';
const MY_GROUPS_KEY = 'squad_my_groups_v2';

// Helpers
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const getColors = () => ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
export const getRandomColor = () => {
  const c = getColors();
  return c[Math.floor(Math.random() * c.length)];
};

// --- Global DB Access (Simulating Backend) ---

export const getGroups = (): Record<string, Group> => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : {};
};

const saveGroups = (groups: Record<string, Group>) => {
  localStorage.setItem(DB_KEY, JSON.stringify(groups));
  window.dispatchEvent(new Event('storage'));
};

// --- Local User Profile & Session ---

export const getUserProfile = (): UserProfile | null => {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  // Propagate changes to existing groups
  const groups = getGroups();
  const myGroupIds = getMyGroupIds();
  let changed = false;

  myGroupIds.forEach(gid => {
    // Find group by searching all values (inefficient but works for mock)
    const groupKey = Object.keys(groups).find(key => groups[key].id === gid);
    if (groupKey && groups[groupKey]) {
      const userIndex = groups[groupKey].users.findIndex(u => u.id === profile.id);
      if (userIndex !== -1) {
        groups[groupKey].users[userIndex].name = profile.name;
        groups[groupKey].users[userIndex].avatar = profile.avatar;
        groups[groupKey].users[userIndex].color = profile.color;
        changed = true;
      }
    }
  });

  if (changed) {
    saveGroups(groups);
  } else {
     window.dispatchEvent(new Event('storage'));
  }
};

export const getMyGroupIds = (): string[] => {
  const data = localStorage.getItem(MY_GROUPS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveMyGroupIds = (ids: string[]) => {
  localStorage.setItem(MY_GROUPS_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event('storage'));
};

// --- Operations ---

export const createProfile = (name: string, avatar: string): UserProfile => {
  const profile: UserProfile = {
    id: crypto.randomUUID(), // Persistent User ID
    name,
    avatar,
    color: getRandomColor(),
  };
  saveUserProfile(profile);
  return profile;
};

export const createGroup = (groupName: string): Group => {
  const profile = getUserProfile();
  if (!profile) throw new Error("No profile found");

  const myGroups = getMyGroupIds();
  if (myGroups.length >= 5) throw new Error("You can only have 5 active groups.");

  const groups = getGroups();
  const groupId = crypto.randomUUID();
  const code = generateCode();

  const userEntry: User = {
    ...profile,
    joinedAt: Date.now(),
  };

  const newGroup: Group = {
    id: groupId,
    code,
    name: groupName,
    users: [userEntry],
    counters: [],
    logs: [],
    createdAt: Date.now(),
  };

  groups[code] = newGroup;
  saveGroups(groups);
  
  saveMyGroupIds([...myGroups, groupId]);
  
  return newGroup;
};

export const joinGroup = (groupCode: string): Group => {
  const profile = getUserProfile();
  if (!profile) throw new Error("No profile found");

  const myGroups = getMyGroupIds();
  if (myGroups.length >= 5) throw new Error("You can only have 5 active groups.");

  const groups = getGroups();
  const codeKey = groupCode.toUpperCase();
  const group = groups[codeKey];

  if (!group) throw new Error("Group not found.");
  
  if (myGroups.includes(group.id)) throw new Error("You are already in this group.");
  
  if (group.users.length >= 10) throw new Error("Group is full (max 10 people).");

  const userEntry: User = {
    ...profile,
    joinedAt: Date.now(),
  };

  group.users.push(userEntry);
  saveGroups(groups);
  saveMyGroupIds([...myGroups, group.id]);

  return group;
};

export const leaveGroup = (groupId: string) => {
    const profile = getUserProfile();
    
    // 1. Try to remove user from the global group object (if it exists)
    if (profile) {
        try {
            const groups = getGroups();
            const groupKey = Object.keys(groups).find(key => groups[key].id === groupId);

            if (groupKey && groups[groupKey]) {
                groups[groupKey].users = groups[groupKey].users.filter(u => u.id !== profile.id);
                // Optional: If 0 users left, delete the group entirely?
                // For now, we leave it in the "cloud" but empty.
                saveGroups(groups);
            }
        } catch (e) {
            console.error("Error updating global group state:", e);
        }
    }

    // 2. ALWAYS remove from local user's group list, regardless of global state
    const myGroups = getMyGroupIds();
    const updatedGroups = myGroups.filter(id => id !== groupId);
    saveMyGroupIds(updatedGroups);
}

export const getGroupById = (groupId: string): Group | null => {
    const groups = getGroups();
    // In a real DB we'd select by ID. Here we iterate.
    const group = Object.values(groups).find(g => g.id === groupId);
    return group || null;
}

export const addCounter = (groupCode: string, counter: Counter) => {
  const groups = getGroups();
  const group = groups[groupCode];
  if (group) {
    if (group.counters.length >= 10) throw new Error("Max 10 counters allowed.");
    group.counters.push(counter);
    saveGroups(groups);
  }
};

export const addLog = (groupCode: string, log: LogEntry) => {
  const groups = getGroups();
  const group = groups[groupCode];
  if (group) {
    group.logs.push(log);
    saveGroups(groups);
  }
};
