import React, { ReactElement } from 'react'
import {
  Call as DispatcherIcon,
  LocalFireDepartment as FirefighterIcon,
  LocalPolice as PoliceIcon,
  LocalHospital as NurseIcon,
} from '@mui/icons-material'

export type RoleType =
  | 'dispatcher'
  | 'firefighter'
  | 'police'
  | 'nurse'
  | 'citizen'
  | 'administrator'

export interface UserBadgeProps {
  role: RoleType
}

// Only roles with badges return an icon; 'citizen' and 'administrator' return undefined
const roleToIconMap: Record<RoleType, ReactElement | undefined> = {
  dispatcher: <DispatcherIcon fontSize="small" />,
  firefighter: <FirefighterIcon fontSize="small" />,
  police: <PoliceIcon fontSize="small" />,
  nurse: <NurseIcon fontSize="small" />,
  citizen: undefined,
  administrator: undefined,
}

export const UserBadge: React.FC<UserBadgeProps> = ({ role }) => {
  const icon = roleToIconMap[role]
  return icon ? <>{icon}</> : null
}
