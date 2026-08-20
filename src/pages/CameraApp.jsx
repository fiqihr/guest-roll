import React, { useRef, useCallback, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { Camera as CameraIcon, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import CameraPreview from '../components/CameraPreview';

/**
 * Find the camera with the highest resolution from a list of devices.
 * The primary/main camera always supports the highest resolution
 * compared to ultrawide, macro, or depth cameras.
 */
const findHighestResCamera = async (cameras) => {
  let bestCamera = cameras[0];
  let bestResolution = 0;

  for (const camera of cameras) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: camera.deviceId },
          width: { ideal: 9999 },
          height: { ideal: 9999 }
        }
      });
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      const resolution = (settings.width || 0) * (settings.height || 0);

      // Stop the test stream immediately
      stream.getTracks().forEach(t => t.stop());

      console.log(`Camera "${camera.label}": ${settings.width}x${settings.height} (${resolution}px)`);

      if (resolution > bestResolution) {
        bestResolution = resolution;
        bestCamera = camera;
      }
    } catch (e) {
      console.warn(`Could not test camera "${camera.label}":`, e.message);
    }
  }

  return bestCamera;
};

/**
 * Find the main back and front cameras.
 * Groups by facing direction, then picks the highest-resolution back camera
 * (which is always the main/primary sensor on Android devices).
 */
const findMainCameras = async (videoDevices) => {
  const backCameras = videoDevices.filter(d => {
    const label = d.label.toLowerCase();
    return label.includes('back') || label.includes('rear') || label.includes('environment');
  });

  const frontCameras = videoDevices.filter(d => {
    const label = d.label.toLowerCase();
    return label.includes('front') || label.includes('user') || label.includes('face');
  });

  // For back camera: pick the one with highest resolution (= main sensor)
  let mainBack = null;
  if (backCameras.length > 1) {
    mainBack = await findHighestResCamera(backCameras);
  } else {
    mainBack = backCameras[0] || null;
  }

  // For front camera: usually only one, pick the first
  const mainFront = frontCameras[0] || null;

  return { mainBack, mainFront };
};

const CameraApp = () => {
  const webcamRef = useRef(null);
  const { guestName, remainingShots, decrementShots, addCapturedPhoto } = useAppContext();
  const navigate = useNavigate();
  
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [mainBackId, setMainBackId] = useState(null);
  const [mainFrontId, setMainFrontId] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  // Enumerate devices and find the correct main cameras
  useEffect(() => {
    const initCameras = async () => {
      try {
        // Request permission first so labels are available
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(d => d.kind === 'videoinput');

        // Stop the temporary stream so it doesn't block subsequent camera access
        tempStream.getTracks().forEach(track => track.stop());

        console.log('All cameras found:', videoDevices.map(d => `${d.label} (${d.deviceId.slice(0,8)})`));

        const { mainBack, mainFront } = await findMainCameras(videoDevices);

        if (mainBack) {
          setMainBackId(mainBack.deviceId);
          console.log('✅ Selected main BACK camera:', mainBack.label);
        }
        if (mainFront) {
          setMainFrontId(mainFront.deviceId);
          console.log('✅ Selected main FRONT camera:', mainFront.label);
        }

        setCameraReady(true);
      } catch (error) {
        console.error('Error initializing cameras:', error);
        // Fallback: just use facingMode without specific deviceId
        setCameraReady(true);
      }
    };
    initCameras();
  }, []);

  const handleSwitchCamera = () => {
    setIsFrontCamera(prev => !prev);
  };

  // Capture screenshot and crop to exact 3:4 portrait at full resolution
  const capture = useCallback(() => {
    const video = webcamRef.current?.video;
    if (!video) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    console.log(`Video stream resolution: ${vw}x${vh}`);

    // Calculate crop region for 3:4 portrait (width:height = 3:4)
    const targetRatio = 3 / 4;
    let cropW, cropH, offsetX, offsetY;

    if (vw / vh > targetRatio) {
      // Video is wider than 3:4 — crop sides
      cropH = vh;
      cropW = Math.round(vh * targetRatio);
      offsetX = Math.round((vw - cropW) / 2);
      offsetY = 0;
    } else {
      // Video is taller than 3:4 — crop top/bottom
      cropW = vw;
      cropH = Math.round(vw / targetRatio);
      offsetX = 0;
      offsetY = Math.round((vh - cropH) / 2);
    }

    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d');

    // If front camera and mirrored, flip horizontally
    if (isFrontCamera) {
      ctx.translate(cropW, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, offsetX, offsetY, cropW, cropH, 0, 0, cropW, cropH);

    // Export as high-quality JPEG (no additional compression)
    const imageSrc = canvas.toDataURL('image/jpeg', 0.92);
    console.log(`Captured image: ${cropW}x${cropH}, size ~${Math.round(imageSrc.length * 0.75 / 1024)}KB`);
    setPhotoPreview(imageSrc);
  }, [isFrontCamera]);

  const handleCancel = () => {
    setPhotoPreview(null);
  };

  const handleSave = async () => {
    if (!photoPreview) return;
    setIsUploading(true);

    try {
      // Use the photo directly — no additional compression to preserve quality
      addCapturedPhoto(photoPreview);

      // Upload to Google Drive via Apps Script
      const scriptUrl = "https://script.google.com/macros/s/AKfycbwUHx6OaF-JIwYtDf82DZif8Ic9YtwPpEnM1FtcWQFtPGYhDSatKqTlXFoyIRIWfJdp/exec";
      
      // Format filename nicely (e.g. Yusuf_103045.jpg)
      const safeName = guestName.replace(/[^a-zA-Z0-9]/g, '_');
      const timeString = new Date().toLocaleTimeString('id-ID', { hour12: false }).replace(/:/g, '');
      const finalFileName = `${safeName}_${timeString}.jpg`;

      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          image: photoPreview,
          filename: finalFileName
        })
      });

      const result = await response.json();
      if (result.status !== "success") {
        throw new Error(result.message || "Failed to upload to Drive");
      }
      
      // Success
      decrementShots();
      setPhotoPreview(null);
      
      if (remainingShots - 1 <= 0) {
        navigate('/thank-you');
      }

    } catch (error) {
      console.error('Error saving photo:', error);
      alert('Gagal menyimpan foto. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  // Build video constraints: use specific deviceId if available, fallback to facingMode
  const activeDeviceId = isFrontCamera ? mainFrontId : mainBackId;
  
  const videoConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 2560 },
    ...(activeDeviceId 
      ? { deviceId: { exact: activeDeviceId } } 
      : { facingMode: isFrontCamera ? 'user' : 'environment' }
    )
  };

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden flex flex-col items-center justify-center">
      
      {/* Top HUD */}
      <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start z-10">
        <div>
          <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">Photographer</p>
          <p className="text-white font-medium drop-shadow-md">{guestName}</p>
        </div>
        <div className="text-right">
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 shadow-lg">
            <p className="text-cream font-bold text-sm tracking-widest">
              {remainingShots} <span className="text-cream/70 font-normal text-xs">SHOTS LEFT</span>
            </p>
          </div>
        </div>
      </div>

      {/* Viewfinder 3:4 */}
      <div className="relative w-full max-w-md aspect-[3/4] bg-zinc-900 shadow-2xl">
        {cameraReady && (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.95}
            videoConstraints={videoConstraints}
            mirrored={isFrontCamera}
            className="w-full h-full object-cover"
            key={isFrontCamera ? 'front' : 'back'}
          />
        )}
      </div>

      {/* Shutter Button Container */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center pb-8 z-10">
        
        <div className="relative w-full max-w-md flex justify-center items-center">
          <button
            onClick={capture}
            className="w-20 h-20 rounded-full border-4 border-white/80 bg-white/20 backdrop-blur-sm flex items-center justify-center active:scale-95 active:bg-white/40 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)] z-20"
          >
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <CameraIcon className="w-6 h-6 text-dark" />
            </div>
          </button>

          {/* Switch Camera Button */}
          <button 
            onClick={handleSwitchCamera}
            className="absolute right-8 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 active:scale-95 transition-transform"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview Overlay */}
      {photoPreview && (
        <CameraPreview 
          photoUrl={photoPreview} 
          onCancel={handleCancel} 
          onSave={handleSave} 
          isUploading={isUploading}
        />
      )}
    </div>
  );
};

export default CameraApp;
