// import { Flag } from '@mui/icons-material'

// const Step5ResponseTimeline = () => {
//   const items = [
//     {
//       icon: <Flag className="text-gray-500" />,
//       label: 'Open Waiting',
//       time: '07.02.03-03:25',
//     },
//     {
//       icon: <Flag className="text-gray-500" />,
//       label: 'Open Triage',
//       commander: '911 Ana',
//       commanderColor: 'text-red-500',
//       time: '07.02.03-03:25',
//     },
//     {
//       icon: <img src="/911-icon.png" alt="fire" className="w-5 h-5 mt-1" />,
//       label: 'Open Assigned',
//       commander: '🔥 Lili',
//       commanderColor: 'text-red-500',
//       time: '07.02.03-03:25',
//     },
//     // {
//     //   icon: <Flag className="text-gray-500" />,
//     //   label: 'Close',
//     //   time: '07.02.03-05:00',
//     // },
//   ]

//   const closeTime = '07.02.03-05:00'

//   return (
//     <div className="w-full px-8 py-6 bg-white min-h-[80vh] relative">
//       <div className="relative w-full flex items-center pl-4 pr-10 mb-4">
//         <div className="flex-grow h-0.5 bg-gray-400" />
//         <div className="absolute right-0 w-6 h-6 rounded-full bg-gray-300 border border-gray-500 flex items-center justify-center text-sm font-semibold">
//           5
//         </div>
//       </div>

//       <h3 className="text-2xl font-bold mb-6">Response Timeline</h3>

//       <div className="relative flex">
//         <div className="flex flex-col items-center mr-4 relative">
//           <div className="absolute top-0 bottom-0 w-0.5 bg-gray-300 left-1/2 transform -translate-x-1/2" />
//           {items.map((item, idx) => (
//             <div key={idx} className="my-4 z-10">
//               {item.icon}
//             </div>
//           ))}
//           <div className="mt-6 z-10">
//             <Flag className="text-gray-500" />
//           </div>
//         </div>

//         <div className="flex flex-col gap-6">
//           {items.map((item, idx) => (
//             <div key={idx}>
//               <p className="text-sm text-gray-800 font-semibold">
//                 {item.label}
//                 {item.commander && (
//                   <span className={`ml-2 font-bold ${item.commanderColor}`}>
//                     Commander: {item.commander}
//                   </span>
//                 )}
//               </p>
//               <p className="text-xs text-gray-500">{item.time}</p>
//             </div>
//           ))}

//           <div className="mt-8">
//             <p className="text-sm font-semibold text-gray-800">Close</p>
//             <p className="text-xs text-gray-500">{closeTime}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Step5ResponseTimeline
import { Flag } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateIncident } from '../../redux/incidentSlice'
import request from '../../utils/request'

const Step5ResponseTimeline = () => {
  const dispatch = useDispatch()
  const incident = useSelector((state) => state.incidents.incident)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTimelineData() {
      try {
        const data = await request(
          `/api/incidents/${incident.incidentId}/timeline`,
        )
        setItems(data)
        dispatch(updateIncident(data))
      } catch (err) {
        setError('Failed to load timeline data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (incident.incidentId) {
      fetchTimelineData()
    }
  }, [incident.incidentId, dispatch])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Box sx={{ padding: 2, backgroundColor: '#fff', minHeight: '80vh' }}>
      <Typography variant="h4" gutterBottom>
        Response Timeline
      </Typography>
      {items.map((item, idx) => (
        <Box
          key={idx}
          sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}
        >
          {item.icon === 'flag' ? (
            <Flag className="text-gray-500" />
          ) : (
            <img src="/911-icon.png" alt="fire" className="w-5 h-5 mt-1" />
          )}
          <Typography sx={{ marginLeft: 2, fontWeight: 'bold' }}>
            {item.label}
          </Typography>
          {item.commander && (
            <Typography sx={{ marginLeft: 1, color: item.commanderColor }}>
              {item.commander}
            </Typography>
          )}
          <Typography sx={{ marginLeft: 'auto', color: 'gray' }}>
            {item.time}
          </Typography>
        </Box>
      ))}
      <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
        <Flag className="text-gray-500" />
        <Typography sx={{ marginLeft: 2, fontWeight: 'bold' }}>
          Close
        </Typography>
        <Typography sx={{ marginLeft: 'auto', color: 'gray' }}>
          {items[items.length - 1]?.time || 'N/A'}
        </Typography>
      </Box>
    </Box>
  )
}

export default Step5ResponseTimeline
