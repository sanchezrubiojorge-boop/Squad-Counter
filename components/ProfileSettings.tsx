import React, { useState } from 'react';
import { UserProfile } from '../types';
import { saveUserProfile } from '../services/storage';
import { X, Check } from 'lucide-react';

interface ProfileSettingsProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

const EMOJIS = ['😎', '🤠', '🥳', '👽', '👻', '🤖', '🐱', '🐶', '🦊', '🦁', '🦄', '🐲', '🥑', '🍺', '🔥', '💎'];

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, isOpen, onClose }) => {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    saveUserProfile({
        ...profile,
        name,
        avatar
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
            <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
        
        <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar Selection */}
            <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Avatar</label>
                <div className="flex flex-wrap gap-2 justify-center bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                    {EMOJIS.map(e => (
                        <button
                            key={e}
                            type="button"
                            onClick={() => setAvatar(e)}
                            className={`w-10 h-10 text-xl rounded-full transition-transform hover:scale-110 ${avatar === e ? 'bg-white dark:bg-zinc-700 shadow-md ring-2 ring-indigo-500 scale-110' : 'opacity-70 hover:opacity-100'}`}
                        >
                            {e}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Display Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <p className="text-xs text-zinc-500 mt-1">This will be updated in all your groups.</p>
            </div>

            <button 
                type="submit"
                className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
            >
                <Check size={18} /> Save Changes
            </button>
        </form>
      </div>
    </div>
  );
};
