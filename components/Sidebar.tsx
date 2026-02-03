import React from 'react';
import { Group, UserProfile } from '../types';
import { Plus } from 'lucide-react';

interface SidebarProps {
  groups: Group[];
  activeGroupId: string | null;
  onSelectGroup: (id: string) => void;
  onAddGroup: () => void;
  onOpenProfile: () => void;
  userProfile: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  groups, 
  activeGroupId, 
  onSelectGroup, 
  onAddGroup, 
  onOpenProfile,
  userProfile
}) => {
  
  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <div className="fixed bottom-0 left-0 w-full sm:w-20 sm:h-screen bg-white dark:bg-zinc-900 border-t sm:border-t-0 sm:border-r border-zinc-200 dark:border-zinc-800 flex sm:flex-col items-center justify-between p-3 z-50">
      
      {/* Groups List */}
      <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible w-full sm:w-auto items-center">
        {groups.map(group => (
          <button
            key={group.id}
            onClick={() => onSelectGroup(group.id)}
            className={`relative group/tooltip flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-sm
              ${activeGroupId === group.id 
                ? 'bg-indigo-600 text-white shadow-indigo-500/30 scale-105' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
          >
            {getInitials(group.name)}
            
            {/* Tooltip for desktop */}
            <div className="absolute left-14 bg-zinc-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap hidden sm:block z-50">
                {group.name}
            </div>
          </button>
        ))}

        {/* Add Group Button (Only if < 5 groups) */}
        {groups.length < 5 && (
            <button
                onClick={onAddGroup}
                className="flex-shrink-0 w-12 h-12 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-indigo-500 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
            >
                <Plus size={20} />
            </button>
        )}
      </div>

      {/* User Profile */}
      <div className="hidden sm:flex flex-col gap-4 items-center">
        <button 
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg hover:ring-2 ring-indigo-500 transition-all"
            title="Profile Settings"
        >
            {userProfile.avatar}
        </button>
      </div>

      {/* Mobile Profile Trigger (Visible only on mobile) */}
      <button 
        onClick={onOpenProfile}
        className="sm:hidden w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg shrink-0"
      >
        {userProfile.avatar}
      </button>

    </div>
  );
};
