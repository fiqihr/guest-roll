import React from 'react';
import { X, Check, Loader2 } from 'lucide-react';

const CameraPreview = ({ photoUrl, onCancel, onSave, isUploading }) => {
  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col">
      {/* Preview Image */}
      <div className="flex-1 w-full h-full relative">
        <img 
          src={photoUrl} 
          alt="Preview" 
          className="w-full h-full object-cover"
        />
        
        {/* Top Gradient for visibility */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/60 to-transparent"></div>
        
        {/* Bottom Gradient for buttons */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/80 to-transparent"></div>

        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-cream animate-spin mb-4" />
            <p className="text-cream font-medium">Menyimpan ke album...</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isUploading && (
        <div className="absolute bottom-10 left-0 w-full flex justify-center items-center gap-12 px-6">
          <button 
            onClick={onCancel}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-lg active:scale-95 transition-transform"
          >
            <X className="w-8 h-8" />
          </button>
          
          <button 
            onClick={onSave}
            className="w-20 h-20 rounded-full bg-gold flex items-center justify-center text-dark shadow-[0_0_20px_rgba(224,204,156,0.5)] active:scale-95 transition-transform"
          >
            <Check className="w-10 h-10" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraPreview;
