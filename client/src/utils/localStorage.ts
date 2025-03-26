/**
 * This file was created to facilitate the persisting of a state on the frontend using local storage.
 * Exporting these functions within this separate file ensures code cleanliness since error handling is conducted here
 * and repeated function calls to window.localStroage are minimized
 * The idea for this was derived from this video:
 * https://www.youtube.com/watch?v=RDAFJ5ToMmQ
 */

export function setItem(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.log(error)
  }
}

export function getItem(key: string) {
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : undefined
  } catch (error) {
    console.log(error)
  }
}
