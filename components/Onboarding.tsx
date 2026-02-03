import React, { useState } from 'react';
import { Users, ArrowRight, Check } from 'lucide-react';
import { createGroup, joinGroup, createProfile, getUserProfile } from '../services/storage';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: () => void;
  existingProfile: UserProfile | null;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, existingProfile }) => {
  const [step, setStep] = useState<'profile' | 'group'>(existingProfile ? 'group' : 'profile');
  
  // Profile State
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('😎');

  // Group State
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [groupName, setGroupName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const avatars = ['😎', '🤠', '🥳', '👽', '👻', '🤖', '🐱', '🐶', '🦊', '🦁'];

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName) return;
    createProfile(userName, userAvatar);
    setStep('group');
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await new Promise(r => setTimeout(r, 500)); // Fake loading
      if (mode === 'create') {
        if (!groupName) throw new Error("Please enter a group name");
        createGroup(groupName);
      } else {
        if (!code) throw new Error("Please enter a group code");
        joinGroup(code);
      }
      onComplete();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (step === 'profile') {
      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800">
                <h1 className="text-2xl font-bold text-center mb-6">Create Your Profile</h1>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="flex justify-center gap-2 flex-wrap mb-4">
                        {avatars.map(a => (
                            <button
                                key={a}
                                type="button"
                                onClick={() => setUserAvatar(a)}
                                className={`w-12 h-12 text-2xl rounded-full transition-transform hover:scale-110 ${userAvatar === a ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-110' : 'bg-zinc-50 dark:bg-zinc-800'}`}
                            >
                                {a}
                            </button>
                        ))}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Your Name</label>
                        <input 
                            type="text" 
                            required
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. Alex"
                        />
                        <p className="text-xs text-zinc-500 mt-2 text-center">You can update this later in settings.</p>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-500/20">
                        Next
                    </button>
                </form>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-right-4">
        <div className="p-8 pb-6 text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                <Users size={32} />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Setup SquadStats</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Create or join a group to start tracking.</p>
        </div>

        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
            <button 
                onClick={() => { setMode('create'); setError(''); }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${mode === 'create' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
            >
                Create Group
            </button>
            <button 
                 onClick={() => { setMode('join'); setError(''); }}
                 className={`flex-1 py-4 text-sm font-semibold transition-colors ${mode === 'join' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
            >
                Join Group
            </button>
        </div>

        <div className="p-8">
            <form onSubmit={handleGroupSubmit} className="space-y-4">
                {mode === 'create' ? (
                     <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Group Name</label>
                        <input 
                            type="text" 
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="e.g. Ibiza 2024"
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Group Code</label>
                        <input 
                            type="text" 
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono uppercase tracking-widest"
                            placeholder="e.g. X9Y2Z1"
                        />
                    </div>
                )}

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : (mode === 'create' ? 'Create & Start' : 'Join Group')}
                    {!loading && <ArrowRight size={18} />}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};
