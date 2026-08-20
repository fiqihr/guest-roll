import localforage from 'localforage';

// Configure localforage
localforage.config({
  name: 'SekaliJepretDB',
  storeName: 'guest_photos' // Should be alphanumeric, with underscores
});

const PHOTOS_KEY = 'session_photos';

/**
 * Save a new photo (base64 string) to the local IndexedDB.
 */
export const savePhotoLocal = async (base64String) => {
  try {
    const existingPhotos = await localforage.getItem(PHOTOS_KEY) || [];
    existingPhotos.push(base64String);
    await localforage.setItem(PHOTOS_KEY, existingPhotos);
    return true;
  } catch (error) {
    console.error('Failed to save photo locally:', error);
    return false;
  }
};

/**
 * Retrieve all saved photos for the current session.
 */
export const getLocalPhotos = async () => {
  try {
    return await localforage.getItem(PHOTOS_KEY) || [];
  } catch (error) {
    console.error('Failed to get local photos:', error);
    return [];
  }
};

/**
 * Clear the local photos (used when resetting the session).
 */
export const clearLocalPhotos = async () => {
  try {
    await localforage.removeItem(PHOTOS_KEY);
  } catch (error) {
    console.error('Failed to clear local photos:', error);
  }
};
