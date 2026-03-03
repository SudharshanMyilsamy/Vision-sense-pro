import React from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Volume2, VolumeX, Activity, Play, Square, Camera, LogOut, FileDown } from 'lucide-react';
import { generateReport } from '../services/reportService';

export function ControlPanel({ devices, history }) {
  const { settings, updateSettings, isScanning, setIsScanning, currentDeviceId, setCurrentDeviceId, logout } = useApp();

  const toggleCamera = () => {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex(d => d.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    setCurrentDeviceId(devices[nextIndex].deviceId);
  };

  const handleDownloadReport = () => {
    if (history && history.length > 0) {
      generateReport(history);
    } else {
      alert("No detection history to generate report.");
    }
  };

  return (
    <div className="bg-white border border-zinc-100 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
          <Settings className="w-4 h-4 text-zinc-500" />
          Settings
        </h3>
        <button onClick={logout} className="text-zinc-400 hover:text-zinc-700 transition-colors" title="Sign Out">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Main Toggle */}
        <button
          onClick={() => setIsScanning(!isScanning)}
          className={`w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            isScanning 
              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'
          }`}
        >
          {isScanning ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          {isScanning ? 'Stop Scanning' : 'Start Scanning'}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={toggleCamera}
          disabled={devices.length < 2}
          className="w-full py-2.5 bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-100 transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-4 h-4 text-zinc-500" />
          <span>Switch Camera</span>
        </button>

        {/* Report Download */}
        <button
          onClick={handleDownloadReport}
          disabled={!history || history.length === 0}
          className="w-full py-2.5 bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-100 transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileDown className="w-4 h-4 text-zinc-500" />
          <span>Download Report</span>
        </button>

        {/* Grid Controls */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => updateSettings({ voiceEnabled: !settings.voiceEnabled })}
            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
              settings.voiceEnabled 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            {settings.voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="text-xs font-medium">Voice Output</span>
          </button>

          <button
            onClick={() => updateSettings({ showDebug: !settings.showDebug })}
            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
              settings.showDebug 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="text-xs font-medium">Debug Info</span>
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-5 pt-4 border-t border-zinc-100">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-zinc-500">
              <span>Confidence Threshold</span>
              <span className="text-zinc-900">{(settings.minConfidence * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.1"
              value={settings.minConfidence}
              onChange={(e) => updateSettings({ minConfidence: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-zinc-500">
              <span>Scan Interval</span>
              <span className="text-zinc-900">{settings.detectionInterval / 1000}s</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="500"
              value={settings.detectionInterval}
              onChange={(e) => updateSettings({ detectionInterval: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
