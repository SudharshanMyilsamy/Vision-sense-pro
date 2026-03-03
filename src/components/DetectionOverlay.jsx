import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function DetectionOverlay({ objects, videoWidth, videoHeight }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {objects.map((obj, index) => {
          if (!obj.box_2d) return null;
          
          const [ymin, xmin, ymax, xmax] = obj.box_2d;
          
          const top = (ymin / 1000) * 100;
          const left = (xmin / 1000) * 100;
          const height = ((ymax - ymin) / 1000) * 100;
          const width = ((xmax - xmin) / 1000) * 100;

          return (
            <motion.div
              key={`${obj.label}-${index}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute border-2 border-blue-500 rounded-lg shadow-sm bg-blue-500/10"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: `${width}%`,
                height: `${height}%`,
              }}
            >
              <div className="absolute -top-8 left-0 flex flex-col items-start">
                <div className="bg-blue-500 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-md whitespace-nowrap flex items-center gap-1.5">
                  <span className="capitalize">{obj.label}</span>
                  <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px]">{(obj.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
