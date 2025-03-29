import { useEffect, useState } from 'react'
import { getItem, setItem } from '../utils/localStorage'

// This is a custom hook derived from this video on how best to persist a state using local storage
// link: https://www.youtube.com/watch?v=RDAFJ5ToMmQ
// Having this hook makes perstiant functionality more extensible and easy to use in the future going forward
// All you need to do is have a key that you want to store as well as the initial value your state starts as
export function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState(() => {
    const item = getItem(key)
    return (item as T) || initialValue
  })

  useEffect(() => {
    setItem(key, value)
  }, [value])

  return [value, setValue] as const
}
