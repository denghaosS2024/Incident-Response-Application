import React, { useState } from 'react'
import { Box, Badge } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { DateCalendar, PickersDay } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

export default {
  title: 'Components/ExerciseCalendar',
}

export const Default = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const checkInDates = ['2025-04-23', '2025-04-24']

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        value={selectedDate}
        onChange={(newVal) => {
          if (newVal) setSelectedDate(newVal)
        }}
        slots={{
          day: (props) => {
            const dateStr = props.day.format('YYYY-MM-DD')
            const isChecked = checkInDates.includes(dateStr)
            return (
              <Badge
                key={dateStr}
                overlap="circular"
                badgeContent={
                  isChecked ? (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: 'red',
                      }}
                    />
                  ) : null
                }
              >
                <PickersDay {...props} />
              </Badge>
            )
          },
        }}
      />
    </LocalizationProvider>
  )
}
