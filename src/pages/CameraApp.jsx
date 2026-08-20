import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { Camera as CameraIcon, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import CameraPreview from '../components/CameraPreview';

const CameraApp = () => {
  const webcamRef = useRef(null);
  const { guestName, remainingShots, decrementShots, addCapturedPhoto } = useAppContext();
  const navigate = useNavigate();
  
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  // Use facingMode to toggle between front and back camera only
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' = back, 'user' = front

  const isFrontCamera = facingMode === 'user';

  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setPhotoPreview(imageSrc);
    }
  }, [webcamRef]);

  const handleCancel = () => {
    setPhotoPreview(null);
  };

  const handleSave = async () => {
    if (!photoPreview) return;
    setIsUploading(true);

    try {
      // 1. Convert base64 to File object
      const res = await fetch(photoPreview);
      const blob = await res.blob();
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });

      // 2. Compress Image
      const options = {
        maxSizeMB: 3,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);

      // 3. Convert compressed file back to base64 for Google Apps Script
      const getBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
      const base64Compressed = await getBase64(compressedFile);

      // Save in React state for the ephemeral Thank You page recap
      addCapturedPhoto(base64Compressed);

      // 4. Upload to Google Drive via Apps Script
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
          image: base64Compressed,
          filename: finalFileName
        })
      });

      const result = await response.json();
      if (result.status !== "success") {
        throw new Error(result.message || "Failed to upload to Drive");
      }
      
      // 5. Success
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

  const videoConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 2560 },
    aspectRatio: 0.75, // 3:4 Portrait
    facingMode: facingMode
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
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          mirrored={isFrontCamera}
          className="w-full h-full object-cover"
          key={facingMode}
        />
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
