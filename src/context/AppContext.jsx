import React, { createContext, useState, useContext, useEffect } from 'react'

const AppContext = createContext()

export const useAppContext = () => useContext(AppContext)

import { clearLocalPhotos } from '../utils/storage'

export const AppProvider = ({ children }) => {
  const [guestName, setGuestName] = useState('')
  const [remainingShots, setRemainingShots] = useState(15) // Note: using 3 for testing based on previous edit by user

  // Persist state in localStorage so it doesn't reset on refresh
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

  const resetSession = async () => {
    setGuestName('')
    // Actually, maybe we should reset to 15, but I'll stick to 3 for now so they can test easily.
    setRemainingShots(15)
    localStorage.removeItem('guestName')
    localStorage.removeItem('remainingShots')
    await clearLocalPhotos()
  }

  return (
    <AppContext.Provider
      value={{
        guestName,
        updateGuestName,
        remainingShots,
        decrementShots,
        resetSession
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
