import React, { createContext, useState, useContext, useEffect } from 'react'

const AppContext = createContext()

export const useAppContext = () => useContext(AppContext)

import { clearLocalPhotos } from '../utils/storage'

export const AppProvider = ({ children }) => {
  const [guestName, setGuestName] = useState('')
  const [remainingShots, setRemainingShots] = useState(2) // Reset back to 15 shots
  const [capturedPhotos, setCapturedPhotos] = useState([]) // Only in memory!

  // Persist guest info in localStorage so it doesn't reset on refresh
  useEffect(() => {
    const savedName = localStorage.getItem('guestName')
    const savedShots = localStorage.getItem('remainingShots')

    if (savedName) setGuestName(savedName)
    if (savedShots) setRemainingShots(parseInt(savedShots, 10))
  }, [])

  const updateGuestName = (name) => {
    setGuestName(name)
    localStorage.setItem('guestName', name)
  }

  const decrementShots = () => {
    const newShots = Math.max(0, remainingShots - 1)
    setRemainingShots(newShots)
    localStorage.setItem('remainingShots', newShots.toString())
  }

  const addCapturedPhoto = (base64Str) => {
    setCapturedPhotos((prev) => [...prev, base64Str])
  }

  const resetSession = () => {
    setGuestName('')
    setRemainingShots(2)
    setCapturedPhotos([])
    localStorage.removeItem('guestName')
    localStorage.removeItem('remainingShots')
  }

  return (
    <AppContext.Provider
      value={{
        guestName,
        updateGuestName,
        remainingShots,
        decrementShots,
        capturedPhotos,
        addCapturedPhoto,
        resetSession
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
