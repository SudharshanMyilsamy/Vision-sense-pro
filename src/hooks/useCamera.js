import React, { useState, useEffect, useCallback } from 'react';

export function useCamera({ videoRef, active, deviceId }) {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [devices, setDevices] = useState([]);

  // Enumerate devices
  useEffect(() => {
    async function getDevices() {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    }
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    getDevices();
    return () => navigator.mediaDevices.removeEventListener('devicechange', getDevices);
  }, []);

  useEffect(() => {
    let currentStream = null;

    async function startCamera() {
      if (!active) {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
          setIsReady(false);
        }
        return;
      }

      try {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
          video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            // If no deviceId is provided, default to environment (rear) camera
            facingMode: deviceId ? undefined : 'environment'
          }
        };
        
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(currentStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsReady(true);
          };
        }
        setError(null);
      } catch (err) {
        console.error("Camera access error:", err);
        setError("SENSOR_INIT_FAILURE");
      }
    }

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [active, videoRef, deviceId]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !isReady) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    return dataUrl.split(',')[1];
  }, [videoRef, isReady]);

  return { stream, error, isReady, captureFrame, devices };
}
