import React, { useState, useEffect } from 'react';
import { Group, Counter, LogEntry, User, UserProfile } from './types';
import { CounterCard } from './components/CounterCard';
import { LeaderboardChart } from './components/StatsCharts';
import { AIAnalyst } from './components/AIAnalyst';
import { Onboarding } from './components/Onboarding';
import { Sidebar } from './components/Sidebar';
import { ProfileSettings } from './components/ProfileSettings';
import { 
    getUserProfile, 
    getMyGroupIds, 
    getGroupById, 
    addCounter, 
    addLog, 
    leaveGroup 
} from './services/storage';
import { Plus, Users, Copy, Check, LogOut, ArrowLeft, Trash2 } from 'lucide-react';

const App = () => {
  // Global State
  const [profile, setProfile] = useState<UserProfile | null>(getUserProfile());
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  
  // UI State
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [view, setView] = useState<'track' | 'stats'>('track');
  const [showNewCounterModal, setShowNewCounterModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddGroupFlow, setShowAddGroupFlow] = useState(false);
  const [newCounterForm, setNewCounterForm] = useState({ emoji: '🏆', title: '', color: 'bg-indigo-400' });
  const [copied, setCopied] = useState(false);

  // Sync Logic
  useEffect(() => {
    const syncData = () => {
        const currentUserProfile = getUserProfile();
        setProfile(currentUserProfile);

        const groupIds = getMyGroupIds();
        const loadedGroups: Group[] = [];
        let activeGroupStillExists = false;

        groupIds.forEach(id => {
            const g = getGroupById(id);
            if (g) {
                loadedGroups.push(g);
                if (g.id === activeGroupId) activeGroupStillExists = true;
            }
        });

        setMyGroups(loadedGroups);

        // Auto-select group logic
        if (loadedGroups.length > 0) {
            // If we don't have an active group, or the current one was deleted/left
            if (!activeGroupId || !activeGroupStillExists) {
                setActiveGroupId(loadedGroups[0].id);
            }
        } else {
            // No groups left
            setActiveGroupId(null);
        }
    };

    syncData();
    window.addEventListener('storage', syncData);
    const interval = setInterval(syncData, 2000); // Polling for sync
    
    return () => {
        window.removeEventListener('storage', syncData);
        clearInterval(interval);
    };
  }, [refreshTrigger, activeGroupId]);

  const activeGroup = myGroups.find(g => g.id === activeGroupId) || null;
  const currentUserInGroup = activeGroup?.users.find(u => u.id === profile?.id) || null;

  const handleIncrement = (counterId: string) => {
    if (!profile || !activeGroup) return;
    
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      counterId,
      userId: profile.id,
      timestamp: Date.now()
    };

    addLog(activeGroup.code, newLog);
    setRefreshTrigger(p => p + 1);
  };

  const handleCreateCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounterForm.title || !activeGroup || !profile) return;

    if (activeGroup.counters.length >= 10) {
        alert("Maximum 10 counters reached!");
        return;
    }

    const newCounter: Counter = {
      id: crypto.randomUUID(),
      title: newCounterForm.title,
      emoji: newCounterForm.emoji,
      color: newCounterForm.color,
      createdAt: Date.now(),
      createdBy: profile.id
    };

    addCounter(activeGroup.code, newCounter);
    setShowNewCounterModal(false);
    setNewCounterForm({ emoji: '🏆', title: '', color: 'bg-indigo-400' });
    setRefreshTrigger(p => p + 1);
  };

  const handleLeaveGroup = () => {
      if (!activeGroup) return;

      const confirmMessage = `Are you sure you want to remove/leave "${activeGroup.name}"? This will remove it from your list.`;
      
      if (window.confirm(confirmMessage)) {
          const groupIdToRemove = activeGroup.id;
          
          // 1. Perform backend operation
          leaveGroup(groupIdToRemove);

          // 2. Calculate next state immediately to prevent UI lag
          const remainingGroups = myGroups.filter(g => g.id !== groupIdToRemove);
          const nextGroup = remainingGroups.length > 0 ? remainingGroups[0].id : null;

          // 3. Update state manually
          setMyGroups(remainingGroups);
          setActiveGroupId(nextGroup);
          setRefreshTrigger(p => p + 1);
      }
  }

  const copyCode = () => {
      if (activeGroup) {
          navigator.clipboard.writeText(activeGroup.code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  };

  // --- Views ---

  // 1. Onboarding / No Groups
  if (!profile || (myGroups.length === 0 && !showAddGroupFlow)) {
      return (
        <Onboarding 
            existingProfile={profile} 
            onComplete={() => setRefreshTrigger(p => p + 1)} 
        />
      );
  }

  // 2. Add Group Flow (Inside App)
  if (showAddGroupFlow) {
      return (
          <div className="relative">
              <button 
                onClick={() => setShowAddGroupFlow(false)}
                className="absolute top-4 left-4 z-50 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium"
              >
                  <ArrowLeft size={20} /> Back
              </button>
              <Onboarding 
                existingProfile={profile} 
                onComplete={() => {
                    setShowAddGroupFlow(false);
                    setRefreshTrigger(p => p + 1);
                }} 
            />
          </div>
      )
  }

  // 3. Main App View
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-24 sm:pb-0 sm:pl-20">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        groups={myGroups}
        activeGroupId={activeGroupId}
        onSelectGroup={setActiveGroupId}
        onAddGroup={() => setShowAddGroupFlow(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        userProfile={profile}
      />

      {/* Profile Modal */}
      <ProfileSettings 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
      />

      {activeGroup ? (
        <>
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                    <h1 className="font-bold text-xl tracking-tight truncate mr-2">{activeGroup.name}</h1>
                    <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800 shrink-0">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 uppercase hidden sm:inline">Code:</span>
                        <span className="font-mono font-bold text-indigo-700 dark:text-indigo-200">{activeGroup.code}</span>
                        <button onClick={copyCode} className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400">
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleLeaveGroup}
                        className="text-zinc-400 hover:text-red-600 dark:hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete/Leave Group"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
                
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <Users size={16} />
                    <span>{activeGroup.users.length} / 10 Members</span>
                </div>

                {/* AI Analysis Section */}
                {activeGroup.logs.length > 0 && (
                    <AIAnalyst users={activeGroup.users} counters={activeGroup.counters} logs={activeGroup.logs} />
                )}

                {/* View Toggles */}
                <div className="flex p-1 bg-zinc-200 dark:bg-zinc-800 rounded-xl">
                <button 
                    onClick={() => setView('track')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${view === 'track' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                    Track
                </button>
                <button 
                    onClick={() => setView('stats')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${view === 'stats' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                    Leaderboards
                </button>
                </div>

                {/* Track View */}
                {view === 'track' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">Active Counters</h3>
                        <span className="text-xs text-zinc-400">{activeGroup.counters.length}/10 Used</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {activeGroup.counters.map(counter => (
                        <CounterCard 
                        key={counter.id}
                        counter={counter}
                        totalCount={activeGroup.logs.filter(l => l.counterId === counter.id).length}
                        onIncrement={handleIncrement}
                        />
                    ))}
                    
                    {activeGroup.counters.length < 10 && (
                        <button 
                            onClick={() => setShowNewCounterModal(true)}
                            className="rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center h-48 text-zinc-400 hover:text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                            <Plus size={32} />
                            <span className="font-semibold mt-2">Create New</span>
                        </button>
                    )}
                    </div>
                </div>
                )}

                {/* Stats View */}
                {view === 'stats' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {activeGroup.counters.length === 0 && (
                            <div className="text-center text-zinc-500 py-10">
                                No counters yet. Go to Track tab to create one!
                            </div>
                        )}
                        {activeGroup.counters.map(counter => (
                            <div key={counter.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-3xl">{counter.emoji}</span>
                                    <div>
                                        <h3 className="text-lg font-bold">{counter.title}</h3>
                                        <div className="flex gap-2 items-center text-sm text-zinc-500">
                                            <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">Total: {activeGroup.logs.filter(l => l.counterId === counter.id).length}</span>
                                        </div>
                                    </div>
                                </div>
                                <LeaderboardChart 
                                    logs={activeGroup.logs}
                                    users={activeGroup.users}
                                    counters={activeGroup.counters}
                                    activeCounterId={counter.id}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
      ) : (
        <div className="flex h-screen items-center justify-center text-zinc-500">
            Select a group from the sidebar to start.
        </div>
      )}

      {/* New Counter Modal Overlay */}
      {showNewCounterModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">Add Tracker</h2>
            <form onSubmit={handleCreateCounter} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Tacos Eaten"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newCounterForm.title}
                  onChange={e => setNewCounterForm({...newCounterForm, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Emoji</label>
                    <input 
                        type="text" 
                        required
                        className="w-full text-center text-2xl rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newCounterForm.emoji}
                        onChange={e => setNewCounterForm({...newCounterForm, emoji: e.target.value})}
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Color Theme</label>
                    <select
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={newCounterForm.color}
                        onChange={e => setNewCounterForm({...newCounterForm, color: e.target.value})}
                    >
                        <option value="bg-red-400">Red</option>
                        <option value="bg-orange-400">Orange</option>
                        <option value="bg-amber-400">Amber</option>
                        <option value="bg-green-400">Green</option>
                        <option value="bg-blue-400">Blue</option>
                        <option value="bg-indigo-400">Indigo</option>
                        <option value="bg-purple-400">Purple</option>
                        <option value="bg-pink-400">Pink</option>
                    </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowNewCounterModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;