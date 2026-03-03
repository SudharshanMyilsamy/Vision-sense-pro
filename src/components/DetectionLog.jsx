import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { List, Clock } from 'lucide-react';

export function DetectionLog({ history }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [history]);

  return (
    <div className="h-full flex flex-col bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <h3 className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
          <List className="w-4 h-4 text-zinc-500" />
          Recent Detections
        </h3>
        <div className="flex gap-1.5 items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-zinc-500">Live</span>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
        <AnimatePresence initial={false}>
          {history.slice(0, 30).map((entry, idx) => (
            <motion.div
              key={entry.timestamp}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative pl-4 border-l-2 border-zinc-100 pb-2"
            >
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-zinc-300 border-2 border-white" />
              
              <div className="flex items-center gap-1.5 text-zinc-400 mb-2">
                <Clock className="w-3 h-3" />
                <span className="text-xs font-medium">
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              
              <div className="space-y-2">
                {entry.objects.map((obj, i) => (
                  <div key={i} className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-zinc-900 capitalize">
                        {obj.label}
                      </span>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {(obj.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 capitalize-first">
                      {obj.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
          
          {history.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-3">
              <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center">
                <List className="w-5 h-5 text-zinc-300" />
              </div>
              <p className="text-sm font-medium">Waiting for objects...</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
