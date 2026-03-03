import React, { useRef, useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useCamera } from './hooks/useCamera';
import { detectObjects } from './services/detectionService';
import { speechService } from './services/speechService';
import { CameraView } from './components/CameraView';
import { DetectionOverlay } from './components/DetectionOverlay';
import { ControlPanel } from './components/ControlPanel';
import { DetectionLog } from './components/DetectionLog';
import { LoginPage } from './components/LoginPage';
import { Eye, AlertCircle, Loader2 } from 'lucide-react';

function VisionSenseApp() {
  const videoRef = useRef(null);
  const { isScanning, settings, isAuthenticated, login, currentDeviceId } = useApp();
  const { isReady, error, captureFrame, devices } = useCamera({ 
    videoRef, 
    active: isScanning,
    deviceId: currentDeviceId
  });
  
  const [currentObjects, setCurrentObjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    speechService.setEnabled(settings.voiceEnabled);
  }, [settings.voiceEnabled]);

  useEffect(() => {
    if (!isScanning || !isReady) return;

    const intervalId = setInterval(async () => {
      if (isProcessing) return;

      const frame = captureFrame();
      if (!frame) return;

      setIsProcessing(true);
      try {
        const objects = await detectObjects(frame);
        const validObjects = objects.filter(obj => obj.confidence >= settings.minConfidence);
        
        if (validObjects.length > 0) {
          setCurrentObjects(validObjects);
          setHistory(prev => [{ timestamp: Date.now(), objects: validObjects }, ...prev].slice(0, 50));
          
          const primaryObject = validObjects.sort((a, b) => b.confidence - a.confidence)[0];
          if (primaryObject) {
            speechService.speak(`${primaryObject.label}`);
          }
        } else {
          setCurrentObjects([]);
        }
      } catch (err) {
        console.error("Detection cycle error:", err);
      } finally {
        setIsProcessing(false);
      }
    }, settings.detectionInterval);

    return () => clearInterval(intervalId);
  }, [isScanning, isReady, isProcessing, captureFrame, settings]);

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 p-4 md:p-6 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 bg-white p-4 rounded-3xl shadow-sm border border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 leading-tight">VisionSense</h1>
            <p className="text-xs text-zinc-500 font-medium">Object Detection</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-50 rounded-lg border border-zinc-100">
            {isProcessing ? (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-zinc-300" />
            )}
            <span className="text-xs font-medium text-zinc-600">
              {isProcessing ? 'Analyzing...' : 'Ready'}
            </span>
          </div>
          
          {!process.env.GEMINI_API_KEY && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-semibold">Missing API Key</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
        
        {/* Left Column: Controls & History */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full overflow-hidden order-2 lg:order-1">
          <ControlPanel devices={devices} history={history} />
          <div className="flex-1 min-h-0">
            <DetectionLog history={history} />
          </div>
        </div>

        {/* Center: Camera View */}
        <div className="lg:col-span-9 h-full flex flex-col order-1 lg:order-2">
          <div className="relative flex-1 bg-zinc-900 rounded-3xl overflow-hidden shadow-lg border border-zinc-200/50">
            <CameraView ref={videoRef} isReady={isReady} error={error} />
            {isReady && (
              <DetectionOverlay 
                objects={currentObjects} 
                videoWidth={videoRef.current?.videoWidth || 0} 
                videoHeight={videoRef.current?.videoHeight || 0} 
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <VisionSenseApp />
    </AppProvider>
  );
}
