import React from 'react';
import { X, Check, Loader2 } from 'lucide-react';

const CameraPreview = ({ photoUrl, onCancel, onSave, isUploading }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center h-[100dvh]">
      
      {/* Viewfinder 3:4 Preview */}
      <div className="relative w-full max-w-md aspect-[3/4] bg-zinc-900 shadow-2xl">
        <img 
          src={photoUrl} 
          alt="Preview" 
          className="w-full h-full object-cover"
        />
        
        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <Loader2 className="w-12 h-12 text-cream animate-spin mb-4" />
            <p className="text-cream font-medium">Menyimpan ke album...</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/90 to-transparent flex justify-center items-center gap-12 pb-8 z-10 pointer-events-none">
        {!isUploading && (
          <>
            <button 
              onClick={onCancel}
              className="pointer-events-auto w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-lg active:scale-95 transition-transform"
            >
              <X className="w-8 h-8" />
            </button>
            
            <button 
              onClick={onSave}
              className="pointer-events-auto w-20 h-20 rounded-full bg-gold flex items-center justify-center text-dark shadow-[0_0_20px_rgba(224,204,156,0.5)] active:scale-95 transition-transform"
            >
              <Check className="w-10 h-10" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraPreview;
