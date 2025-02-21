import React, { ReactElement } from 'react'
import {
  Call as DispatcherIcon,
  LocalFireDepartment as FirefighterIcon,
  LocalPolice as PoliceIcon,
  LocalHospital as NurseIcon,
} from '@mui/icons-material'

export type RoleType =
  | 'Dispatcher'
  | 'Firefighter'
  | 'Police'
  | 'Nurse'
  | 'Citizen'
  | 'Administrator'

export interface UserBadgeProps {
  role: RoleType
}

// Only roles with badges return an icon; 'Citizen' and 'Administrator' return undefined
const roleToIconMap: Record<RoleType, ReactElement | undefined> = {
  Dispatcher: <DispatcherIcon fontSize="small" />,
  Firefighter: <FirefighterIcon fontSize="small" />,
  Police: <PoliceIcon fontSize="small" />,
  Nurse: <NurseIcon fontSize="small" />,
  Citizen: undefined,
  Administrator: undefined,
}

export const UserBadge: React.FC<UserBadgeProps> = ({ role }) => {
  const icon = roleToIconMap[role]
  return icon ? <>{icon}</> : null
}
