import React, { useState } from 'react';
import { User, Counter, LogEntry } from '../types';
import { analyzeStats } from '../services/geminiService';
import { Sparkles, Bot } from 'lucide-react';

interface AIAnalystProps {
  users: User[];
  counters: Counter[];
  logs: LogEntry[];
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ users, counters, logs }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeStats(users, counters, logs);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          <h2 className="text-lg font-bold">Squad Analyst AI</h2>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 transition-colors px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm"
        >
          {loading ? (
            <span className="animate-pulse">Thinking...</span>
          ) : (
            <>
              <Sparkles size={16} />
              Analyze Stats
            </>
          )}
        </button>
      </div>

      {analysis ? (
        <div className="bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-white/90 leading-relaxed font-medium">
            "{analysis}"
          </p>
        </div>
      ) : (
        <p className="text-white/70 text-sm italic">
          Tap the button to get a ruthless AI commentary on who is winning the race.
        </p>
      )}
    </div>
  );
};
