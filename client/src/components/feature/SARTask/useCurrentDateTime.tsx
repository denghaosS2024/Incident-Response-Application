import { useEffect, useState } from 'react'

export function useCurrentDateTime() {
  const [currentDate, setCurrentDate] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [formattedDateTime, setFormattedDateTime] = useState('')
  
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const year = String(now.getFullYear()).slice(-2)
      const formattedDate = `${month}.${day}.${year}`
      
      let hours = now.getHours()
      const ampm = hours >= 12 ? 'pm' : 'am'
      hours = hours % 12
      hours = hours ? hours : 12
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const formattedTime = `${hours}:${minutes}${ampm}`
      
      setCurrentDate(formattedDate)
      setCurrentTime(formattedTime)
      
      setFormattedDateTime(`${formattedDate}\n${formattedTime}`)
    }
    
    updateDateTime()
    
    const intervalId = setInterval(updateDateTime, 30000)
    
    return () => clearInterval(intervalId)
  }, [])
  
  return { currentDate, currentTime, formattedDateTime }
}