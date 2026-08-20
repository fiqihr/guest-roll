import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { Camera } from 'lucide-react'

// Generate static particles once on load so they don't jump when typing in input
const BOKEH_PARTICLES = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  size: Math.random() * 60 + 20,
  left: Math.random() * 100,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 5
}))

const Welcome = () => {
  const [nameInput, setNameInput] = useState('')
  const { updateGuestName, remainingShots, resetSession } = useAppContext()
  const navigate = useNavigate()

  const handleStart = (e) => {
    e.preventDefault()
    if (nameInput.trim()) {
      updateGuestName(nameInput.trim())
      navigate('/camera')
    }
  }

  return (
    <div className='min-h-screen relative flex flex-col items-center justify-center p-6 bg-[url("/cover.jpeg")] bg-cover bg-center overflow-hidden'>
      {/* Dark overlay & blur */}
      <div className='absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0'></div>

      {/* Bokeh Particles */}
      {BOKEH_PARTICLES.map((p) => (
        <div
          key={p.id}
          className='bokeh-particle'
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}

      {/* Main Card (Glassmorphism + Entrance Animation) */}
      <div className='w-full max-w-md p-8 rounded-3xl glass shadow-2xl text-center relative z-10 animate-fade-in-up'>
        <div className='flex justify-center mb-4'>
          <div className='w-24 h-24 rounded-full border-2 border-gold/40 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(224,204,156,0.3)]'>
            <img src='/icon.png' alt='Wedding Icon' className='w-full h-full object-cover' />
          </div>
        </div>

        <h1 className='text-3xl font-bold text-gold mb-1 font-serif tracking-wide'>
          The Wedding Of <br /> <span className='text-5xl'>Yusuf & Intan</span>
        </h1>
        <p className='mt-4 text-cream/80 font-medium mb-8 text-sm'>Bantu kami mengabadikan momen spesial ini!</p>

        <form onSubmit={handleStart}>
          <div className='mb-6'>
            <label
              htmlFor='guestName'
              className='block text-xs font-medium text-cream/60 mb-2 text-left uppercase tracking-wider'
            >
              Nama Lengkap:
            </label>
            <input
              type='text'
              id='guestName'
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder='Masukkan namamu...'
              className='w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-gold/50 text-cream placeholder-cream/30 transition-all shadow-inner'
              required
            />
          </div>

          <button
            type='submit'
            className='w-full py-4 px-6 rounded-xl bg-maroon text-gold font-bold shadow-lg shadow-maroon/20 hover:bg-maroon/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2'
          >
            <Camera className='w-5 h-5' />
            Buka Kamera
          </button>
        </form>

        <p className='text-xs text-cream/40 mt-6'>*Foto akan otomatis tersimpan ke album rahasia pengantin.</p>
      </div>
    </div>
  )
}

export default Welcome
