import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, RefreshCw, Image as ImageIcon } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const ThankYou = () => {
  const { guestName, resetSession, capturedPhotos } = useAppContext()
  const navigate = useNavigate()

  useEffect(() => {
    // Jika tamu meresfresh halaman ini (atau state foto hilang),
    // langsung reset sesi dan tendang ke halaman awal
    if (capturedPhotos.length === 0) {
      resetSession()
      navigate('/')
    }
  }, [capturedPhotos, resetSession, navigate])

  const handleReset = () => {
    resetSession()
    navigate('/')
  }

  // Jika sedang memproses redirect, cegah kedip UI
  if (capturedPhotos.length === 0) return null;

  return (
    <div className='min-h-screen flex flex-col items-center p-6 bg-[url("/cover.jpeg")] bg-cover bg-center bg-fixed'>
      <div className='fixed inset-0 bg-black/80 backdrop-blur-sm z-0'></div>

      <div className='w-full max-w-2xl text-center relative z-10 pt-12 pb-24'>
        <div className='flex justify-center mb-6 animate-bounce'>
          <Heart className='w-12 h-12 text-gold fill-gold' />
        </div>

        <h1 className='text-4xl font-serif text-gold mb-2'>Terima Kasih!</h1>
        <p className='text-cream/80 text-lg mb-8'>
          Roll film kamu sudah habis, <span className='font-bold text-cream'>{guestName}</span>.
        </p>

        {capturedPhotos.length > 0 && (
          <div className='mb-12'>
            <div className='flex items-center justify-center gap-2 mb-6'>
              <ImageIcon className='w-5 h-5 text-gold/70' />
              <p className='text-sm text-gold/70 uppercase tracking-widest'>Hasil Jepretanmu</p>
            </div>

            <div className='flex flex-wrap justify-center gap-4'>
              {capturedPhotos.map((src, idx) => {
                // Generate a slight random rotation for polaroid effect
                // using index to keep it consistent on re-renders
                const rotation = (idx % 2 === 0 ? 1 : -1) * ((idx % 3) * 2 + 1)

                return (
                  <div
                    key={idx}
                    className='bg-white p-2 pb-8 rounded shadow-xl'
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    <img
                      src={src}
                      alt={`Foto ${idx + 1}`}
                      className='w-32 h-40 md:w-40 md:h-52 object-cover rounded-sm border border-gray-200'
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <p className='text-sm text-gold/60 italic mb-10'>
          "Setiap jepretanmu adalah kenangan yang tak ternilai bagi kami."
        </p>

        {/* <button
          onClick={handleReset}
          className='flex items-center justify-center gap-2 w-full max-w-[200px] mx-auto py-4 rounded-xl bg-gold text-dark font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(224,204,156,0.3)]'
        >
          <RefreshCw className='w-5 h-5' />
          <span>Ganti Pengguna</span>
        </button> */}
      </div>
    </div>
  )
}

export default ThankYou
