import React from 'react';
import { Counter, LogEntry } from '../types';
import { Plus } from 'lucide-react';

interface CounterCardProps {
  counter: Counter;
  totalCount: number;
  onIncrement: (counterId: string) => void;
}

export const CounterCard: React.FC<CounterCardProps> = ({ counter, totalCount, onIncrement }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-lg transition-transform active:scale-95 hover:scale-[1.02] cursor-pointer group bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 h-48 flex flex-col items-center justify-center`}
      onClick={() => onIncrement(counter.id)}
    >
      {/* Background decoration */}
      <div className={`absolute top-0 left-0 w-full h-2 ${counter.color}`} />
      
      <div className="text-6xl mb-2 drop-shadow-md transition-transform group-hover:rotate-12 group-active:scale-125 duration-200">
        {counter.emoji}
      </div>
      
      <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-1">
        {counter.title}
      </h3>
      
      <div className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-700 px-3 py-1 rounded-full">
        <span className="font-mono font-bold text-zinc-600 dark:text-zinc-300">
          {totalCount}
        </span>
        <span className="text-xs text-zinc-500 uppercase tracking-wide">Total</span>
      </div>

      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 dark:bg-white/10 p-2 rounded-full">
        <Plus size={20} className="text-zinc-600 dark:text-white" />
      </div>
    </div>
  );
};
