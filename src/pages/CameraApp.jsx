import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { Camera as CameraIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import CameraPreview from '../components/CameraPreview';
import { savePhotoLocal } from '../utils/storage';

const CameraApp = () => {
  const webcamRef = useRef(null);
  const { guestName, remainingShots, decrementShots } = useAppContext();
  const navigate = useNavigate();
  
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
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

      // Save locally for the Thank You page recap
      await savePhotoLocal(base64Compressed);

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
    width: { ideal: 1080 },
    height: { ideal: 1920 },
    facingMode: "environment" // Use rear camera by default
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col">
      {/* Viewfinder */}
      <div className="flex-1 w-full h-full relative">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="w-full h-full object-cover"
        />

        {/* Top HUD */}
        <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/70 to-transparent flex justify-between items-start">
          <div>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">Photographer</p>
            <p className="text-white font-medium">{guestName}</p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
              <p className="text-cream font-bold text-sm tracking-widest">
                {remainingShots} <span className="text-cream/70 font-normal text-xs">SHOTS LEFT</span>
              </p>
            </div>
          </div>
        </div>

        {/* Shutter Button Container */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center pb-6">
          <button
            onClick={capture}
            className="w-20 h-20 rounded-full border-4 border-white/80 bg-white/20 backdrop-blur-sm flex items-center justify-center active:scale-95 active:bg-white/40 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <CameraIcon className="w-6 h-6 text-dark" />
            </div>
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
