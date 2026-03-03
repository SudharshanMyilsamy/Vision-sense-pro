import React, { forwardRef } from 'react';

export const CameraView = forwardRef(({ isReady, error }, ref) => {
  return (
    <div className="relative w-full h-full bg-zinc-900 rounded-3xl overflow-hidden shadow-sm">
      <video
        ref={ref}
        className="w-full h-full object-cover"
        playsInline
        muted
      />

      {!isReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm font-medium">Starting camera...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
          <div className="text-center p-6 max-w-md bg-zinc-800 rounded-2xl">
            <p className="text-red-400 font-semibold mb-2">Camera Error</p>
            <p className="text-zinc-400 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
});

CameraView.displayName = 'CameraView';
